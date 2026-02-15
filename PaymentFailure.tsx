import { useNavigate } from 'react-router';
import { XCircle } from 'lucide-react';

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1a1a1a] rounded-lg p-8 text-center">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-red-500 mb-4">
          Pagamento Recusado
        </h1>
        <p className="text-gray-300 mb-6">
          Houve um problema ao processar seu pagamento. Por favor, tente novamente ou use outro método de pagamento.
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
