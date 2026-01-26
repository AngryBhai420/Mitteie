import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking");
  const [packageId, setPackageId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      navigate("/dashboard");
      return;
    }

    pollPaymentStatus(sessionId);
  }, [searchParams]);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    
    if (attempts >= maxAttempts) {
      setStatus("timeout");
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/payments/status/${sessionId}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to check status");

      const data = await response.json();

      if (data.payment_status === "paid") {
        setStatus("success");
        setPackageId(data.package_id);
        return;
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 bg-background">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link to="/dashboard">
            <h1 className="text-xl font-playfair font-semibold tracking-tight text-foreground">
              MITTEIE
            </h1>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        {status === "checking" && (
          <div className="text-center space-y-6">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
            <p className="text-lg text-foreground font-inter">
              Behandler betaling...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-foreground tracking-tight">
              Betaling fullført
            </h2>
            
            <p className="text-base md:text-lg text-foreground font-inter leading-relaxed">
              {packageId === "subscription"
                ? "Abonnementet er aktivert. Oversikten lagres nå over tid."
                : "Import er tilgjengelig. Du kan nå laste inn tidligere oversikt."}
            </p>

            <div className="pt-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-10 py-3 rounded-full bg-muted/50 hover:bg-muted/70 text-foreground/70 font-inter text-sm transition-all duration-500"
              >
                Gå til oversikten
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-foreground tracking-tight">
              Noe gikk galt
            </h2>
            
            <p className="text-base md:text-lg text-muted-foreground font-inter leading-relaxed">
              Kunne ikke bekrefte betalingen. Vennligst prøv igjen.
            </p>

            <div className="pt-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-10 py-3 rounded-full bg-muted/50 hover:bg-muted/70 text-foreground/70 font-inter text-sm transition-all duration-500"
              >
                Tilbake
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
