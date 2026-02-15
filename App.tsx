import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import { CartProvider } from "@/react-app/hooks/useCart";
import HomePage from "@/react-app/pages/Home";
import LoginPage from "@/react-app/pages/Login";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import AdminPage from "@/react-app/pages/Admin";
import PaymentSuccess from "@/react-app/pages/PaymentSuccess";
import PaymentFailure from "@/react-app/pages/PaymentFailure";
import PaymentPending from "@/react-app/pages/PaymentPending";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failure" element={<PaymentFailure />} />
            <Route path="/payment-pending" element={<PaymentPending />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
