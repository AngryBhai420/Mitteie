import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use useRef to prevent double processing under StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const sessionId = params.get("session_id");

        if (!sessionId) {
          toast.error("Ingen session_id funnet");
          navigate("/login");
          return;
        }

        // Exchange session_id for user data
        const response = await fetch(`${BACKEND_URL}/api/auth/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (!response.ok) {
          throw new Error("Autentisering mislyktes");
        }

        const user = await response.json();
        
        // Redirect to dashboard with user data
        navigate("/dashboard", { state: { user }, replace: true });
      } catch (error) {
        toast.error(error.message);
        navigate("/login");
      }
    };

    processSession();
  }, [navigate, location.hash]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground font-inter">
          Behandler innlogging...
        </p>
      </div>
    </div>
  );
}
