import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AdminLoginModal } from "@/react-app/components/AdminLoginModal";
import { Crown } from "lucide-react";

export default function LoginPage() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    if (user && !isPending) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

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

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
      <button
        onClick={() => setShowAdminModal(true)}
        className="fixed top-4 right-4 p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full hover:from-yellow-500 hover:to-yellow-700 transition-all shadow-lg group"
        title="Acesso Administrativo"
      >
        <Crown className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      <AdminLoginModal 
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />

      <div className="bg-[#1a1a1a] p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            TG <span className="bg-red-600 px-2 py-1 rounded">SHOP</span> LONDRINA
          </h1>
          <p className="text-gray-400">Faça login para acessar a loja</p>
        </div>

        <button
          onClick={redirectToLogin}
          className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3 px-4 rounded flex items-center justify-center gap-3 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Entrar com Google
        </button>

        <p className="text-xs text-gray-500 text-center mt-6">
          Ao fazer login, você concorda com nossos termos de serviço
        </p>
      </div>
    </div>
  );
}
