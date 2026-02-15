import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1a1a1a] rounded-lg p-8 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-500 mb-4">
          Pagamento Aprovado!
        </h1>
        <p className="text-gray-300 mb-6">
          Seu pedido foi confirmado com sucesso. Você receberá uma confirmação por e-mail em breve.
        </p>
        <p className="text-sm text-gray-400">
          Redirecionando em 5 segundos...
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold transition-colors"
        >
          Voltar para a loja
        </button>
      </div>
    </div>
  );
}
