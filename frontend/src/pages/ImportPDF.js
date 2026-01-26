import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function ImportPDF() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingSession, setCreatingSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Not authenticated");

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleImportPayment = async () => {
    setCreatingSession(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/payments/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          package_id: "import",
          origin_url: window.location.origin,
        }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      toast.error("Kunne ikke starte betaling");
      setCreatingSession(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-inter">Laster...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-background">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link to="/dashboard">
            <h1 className="text-xl font-playfair font-semibold tracking-tight text-foreground">
              MITTEIE
            </h1>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-foreground tracking-tight mb-6">
              Har du en oversikt fra før?
            </h2>
            
            <div className="space-y-6 text-base md:text-lg text-foreground font-inter leading-relaxed">
              <p>
                Hvis du tidligere har brukt MITTEIE og tok vare på PDF-oversikten,<br />
                kan den leses inn igjen her.
              </p>
              
              <p>
                Import fungerer kun med oversikter som er generert i MITTEIE.
              </p>
              
              <p>
                Dette er et engangstillegg på 29 kr.
              </p>
            </div>
          </div>

          <div className="pt-8">
            <Button
              onClick={handleImportPayment}
              disabled={creatingSession}
              className="px-10 py-3 rounded-full bg-muted/50 hover:bg-muted/70 text-foreground/70 font-inter text-sm transition-all duration-500"
              data-testid="import-payment-btn"
            >
              {creatingSession ? "Åpner betaling..." : "Betal for import"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
