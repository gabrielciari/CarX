import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { Plus, Pencil, Trash2, Users, ArrowLeft, Package } from 'lucide-react';
import { OrdersTab } from '@/react-app/components/OrdersTab';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  variation: string;
  is_active: number;
}

interface Admin {
  id: number;
  email: string;
  created_at: string;
}

export default function AdminPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'admins' | 'orders'>('products');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    category: 'roupas',
    variation: 'none',
    is_active: true
  });

  const [newAdminEmail, setNewAdminEmail] = useState('');

  useEffect(() => {
    // Check for admin session token first
    const adminSession = sessionStorage.getItem('admin_session');
    if (adminSession) {
      setIsAdmin(true);
      setLoading(false);
      loadProducts();
      loadAdmins();
      return;
    }

    if (!isPending && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      checkAdminStatus();
    }
  }, [user, isPending, navigate]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/check');
      const data = await response.json();
      setIsAdmin(data.isAdmin);
      
      if (data.isAdmin) {
        loadProducts();
        loadAdmins();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    const adminSession = sessionStorage.getItem('admin_session');
    if (adminSession) {
      headers['X-Admin-Session'] = adminSession;
    }
    
    return headers;
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products', {
        headers: getHeaders()
      });
      
      if (!response.ok) {
        console.error('Failed to load products:', response.status);
        setProducts([]);
        return;
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Invalid products data:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await fetch('/api/admin/admins', {
        headers: getHeaders()
      });
      
      if (!response.ok) {
        console.error('Failed to load admins:', response.status);
        setAdmins([]);
        return;
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAdmins(data);
      } else {
        console.error('Invalid admins data:', data);
        setAdmins([]);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
      setAdmins([]);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      loadProducts();
      setShowProductForm(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        image: '',
        category: 'roupas',
        variation: 'none',
        is_active: true
      });
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      variation: product.variation,
      is_active: product.is_active === 1
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await fetch(`/api/admin/products/${id}`, { 
        method: 'DELETE',
        headers: getHeaders()
      });
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await fetch('/api/admin/admins', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email: newAdminEmail }),
      });

      loadAdmins();
      setShowAdminForm(false);
      setNewAdminEmail('');
    } catch (error) {
      console.error('Error adding admin:', error);
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este administrador?')) return;

    try {
      await fetch(`/api/admin/admins/${id}`, { 
        method: 'DELETE',
        headers: getHeaders()
      });
      loadAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  if (loading || isPending) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="bg-[#1a1a1a] p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="mb-6">Você não tem permissão para acessar o painel administrativo.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded transition-colors"
          >
            Voltar para a Loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <header className="bg-[#111] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">
            Painel <span className="bg-red-600 px-2 py-1 rounded">ADMIN</span>
          </h1>
        </div>
      </header>

      <div className="p-5">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded font-bold transition-colors ${
              activeTab === 'products'
                ? 'bg-red-600 text-white'
                : 'bg-[#222] text-gray-400 hover:bg-[#333]'
            }`}
          >
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-red-600 text-white'
                : 'bg-[#222] text-gray-400 hover:bg-[#333]'
            }`}
          >
            <Package className="w-5 h-5" />
            Pedidos
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-6 py-2 rounded font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'admins'
                ? 'bg-red-600 text-white'
                : 'bg-[#222] text-gray-400 hover:bg-[#333]'
            }`}
          >
            <Users className="w-5 h-5" />
            Administradores
          </button>
        </div>

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Gerenciar Produtos</h2>
              <button
                onClick={() => {
                  setShowProductForm(true);
                  setEditingProduct(null);
                  setFormData({
                    name: '',
                    price: '',
                    image: '',
                    category: 'roupas',
                    variation: 'none',
                    is_active: true
                  });
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Novo Produto
              </button>
            </div>

            {showProductForm && (
              <div className="bg-[#1a1a1a] p-6 rounded-lg mb-6">
                <h3 className="text-lg font-bold mb-4">
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <form onSubmit={handleSubmitProduct} className="space-y-4">
                  <div>
                    <label className="block mb-2">Nome:</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 rounded bg-[#222] border border-[#333] text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Preço (R$):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full p-2 rounded bg-[#222] border border-[#333] text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2">URL da Imagem:</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full p-2 rounded bg-[#222] border border-[#333] text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Categoria:</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2 rounded bg-[#222] border border-[#333] text-white"
                    >
                      <option value="roupas">Roupas</option>
                      <option value="acessorios">Acessórios</option>
                      <option value="cozinha">Cozinha</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2">Variação:</label>
                    <select
                      value={formData.variation}
                      onChange={(e) => setFormData({ ...formData, variation: e.target.value })}
                      className="w-full p-2 rounded bg-[#222] border border-[#333] text-white"
                    >
                      <option value="none">Nenhuma</option>
                      <option value="cor">Cor</option>
                      <option value="tamanho">Tamanho</option>
                      <option value="completo">Cor e Tamanho</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="is_active">Produto ativo</label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      {editingProduct ? 'Atualizar' : 'Criar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                      }}
                      className="bg-[#444] hover:bg-[#555] text-white px-4 py-2 rounded transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#1a1a1a] p-4 rounded-lg flex items-center gap-4"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-green-400">R$ {product.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">
                      {product.category} • {product.variation} • 
                      {product.is_active ? ' Ativo' : ' Inativo'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && <OrdersTab />}

        {activeTab === 'admins' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Gerenciar Administradores</h2>
              <button
                onClick={() => setShowAdminForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Adicionar Admin
              </button>
            </div>

            {showAdminForm && (
              <div className="bg-[#1a1a1a] p-6 rounded-lg mb-6">
                <h3 className="text-lg font-bold mb-4">Adicionar Administrador</h3>
                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div>
                    <label className="block mb-2">Email:</label>
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full p-2 rounded bg-[#222] border border-[#333] text-white"
                      placeholder="admin@exemplo.com"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      Adicionar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdminForm(false);
                        setNewAdminEmail('');
                      }}
                      className="bg-[#444] hover:bg-[#555] text-white px-4 py-2 rounded transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid gap-4">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="bg-[#1a1a1a] p-4 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold">{admin.email}</p>
                    <p className="text-sm text-gray-400">
                      Adicionado em: {new Date(admin.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
