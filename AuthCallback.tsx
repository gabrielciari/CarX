import { useAuth } from "@getmocha/users-service/react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function AuthCallbackPage() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    exchangeCodeForSessionToken()
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.error("Failed to exchange code:", error);
        navigate("/login");
      });
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p>Autenticando...</p>
      </div>
    </div>
  );
}
