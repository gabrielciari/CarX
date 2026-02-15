import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { useCart } from '@/react-app/hooks/useCart';
import { VariationModal } from '@/react-app/components/VariationModal';
import { CheckoutModal } from '@/react-app/components/CheckoutModal';
import { Toast } from '@/react-app/components/Toast';
import { ShoppingCart, LogOut } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: 'roupas' | 'acessorios' | 'cozinha';
  variation: 'cor' | 'tamanho' | 'completo' | 'none';
  is_active: number;
}

type Category = 'todos' | 'roupas' | 'acessorios' | 'cozinha';

export default function HomePage() {
  const { user, isPending, logout } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [logoClickTimer, setLogoClickTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/login');
    } else if (user) {
      loadProducts();
      checkAdminStatus();
    }
  }, [user, isPending, navigate]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/check');
      const data = await response.json();
      setIsAdmin(data.isAdmin);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    if (!isAdmin) return;

    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);

    if (logoClickTimer) {
      clearTimeout(logoClickTimer);
    }

    if (newCount === 5) {
      navigate('/admin');
      setLogoClickCount(0);
      setLogoClickTimer(null);
    } else {
      const timer = setTimeout(() => {
        setLogoClickCount(0);
      }, 2000);
      setLogoClickTimer(timer);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'todos' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    if (product.variation === 'none') {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        variations: 'Padrão'
      });
      showToastMessage('Produto adicionado ao carrinho!');
    } else {
      setSelectedProduct(product);
      setIsVariationModalOpen(true);
    }
  };

  const handleConfirmVariation = (variations: string) => {
    if (selectedProduct) {
      addToCart({
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        variations
      });
      setIsVariationModalOpen(false);
      setSelectedProduct(null);
      showToastMessage('Produto adicionado ao carrinho!');
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <header className="bg-[#111] px-5 py-2.5 flex items-center justify-between gap-5">
        <div 
          className="text-2xl font-bold cursor-pointer select-none"
          onClick={handleLogoClick}
        >
          TG <span className="bg-red-600 px-1.5 py-0.5 rounded">SHOP</span> LONDRINA
        </div>
        
        <div className="flex-1 max-w-2xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar produtos..."
            className="w-full p-2 rounded border-none bg-white text-black"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCartModalOpen(true)}
            className="bg-transparent border-none cursor-pointer text-white hover:text-red-600 transition-colors"
            title="Abrir carrinho"
          >
            <ShoppingCart className="w-6 h-6" />
          </button>
          <button
            onClick={handleLogout}
            className="bg-transparent border-none cursor-pointer text-white hover:text-red-600 transition-colors"
            title="Sair"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[#222] p-2.5 text-center">
        {(['todos', 'roupas', 'acessorios', 'cozinha'] as Category[]).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`bg-transparent border-none mx-2.5 font-bold text-base cursor-pointer transition-colors ${
              selectedCategory === category
                ? 'text-red-600 underline'
                : 'text-white hover:text-red-600 hover:underline'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </nav>

      {/* Banner */}
      <div className="bg-red-600 text-white p-6 text-center text-xl font-bold">
        🔥 PROMOÇÃO RELÂMPAGO ATÉ ÀS 23:59 🔥
      </div>

      {/* Products Grid */}
      <section className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 p-5">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-[#1e1e1e] p-4 rounded-lg text-center shadow-lg"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[150px] object-contain rounded mb-2"
            />
            <h3 className="font-bold mb-1">{product.name}</h3>
            <p className="text-green-400 font-semibold mb-3">R$ {product.price.toFixed(2)}</p>
            <button
              onClick={() => handleAddToCart(product)}
              className="mt-2.5 p-2 w-full rounded font-bold bg-red-600 hover:bg-red-700 text-white border-none cursor-pointer transition-colors"
            >
              Adicionar ao Carrinho
            </button>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="bg-[#111] text-white text-center p-5 mt-8">
        <p>© 2025 TG SHOP LONDRINA - Todos os direitos reservados</p>
      </footer>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/554399632114"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 bg-[#25D366] text-white p-4 rounded-full text-2xl shadow-lg z-[1000] flex items-center justify-center hover:bg-[#20bd5a] transition-colors"
        title="Fale conosco no WhatsApp"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

      {/* Modals */}
      <VariationModal
        product={selectedProduct}
        isOpen={isVariationModalOpen}
        onClose={() => {
          setIsVariationModalOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleConfirmVariation}
      />

      <CheckoutModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        onShowToast={showToastMessage}
      />

      {/* Toast */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
      />
    </div>
  );
}
