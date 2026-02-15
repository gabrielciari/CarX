import { useNavigate } from 'react-router';
import { Clock } from 'lucide-react';

export default function PaymentPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1a1a1a] rounded-lg p-8 text-center">
        <Clock className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-yellow-500 mb-4">
          Pagamento Pendente
        </h1>
        <p className="text-gray-300 mb-6">
          Seu pagamento está sendo processado. Você receberá uma confirmação assim que for aprovado.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold transition-colors"
        >
          Voltar para a loja
        </button>
      </div>
    </div>
  );
}
