import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Export from "./pages/Export";
import Subscription from "./pages/Subscription";
import ImportPDF from "./pages/ImportPDF";
import PaymentSuccess from "./pages/PaymentSuccess";
import About from "./pages/About";
import AuthCallback from "./components/AuthCallback";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";

function AppRouter() {
  const location = useLocation();
  
  // CRITICAL: Check for session_id synchronously during render to prevent race conditions
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/export" element={<Export />} />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/import" element={<ImportPDF />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
