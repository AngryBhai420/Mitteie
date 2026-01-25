import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Export() {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userResponse, itemsResponse] = await Promise.all([
        fetch(`${BACKEND_URL}/api/auth/me`, { credentials: "include" }),
        fetch(`${BACKEND_URL}/api/items`, { credentials: "include" }),
      ]);

      if (!userResponse.ok || !itemsResponse.ok) {
        navigate("/login");
        return;
      }

      const userData = await userResponse.json();
      const itemsData = await itemsResponse.json();

      setUser(userData);
      setItems(itemsData);
    } catch (error) {
      toast.error("Kunne ikke laste data");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalValue = items
    .filter((item) => item.verdi)
    .reduce((sum, item) => sum + item.verdi, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-foreground font-inter">Laster...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Non-print controls */}
      <div className="print:hidden border-b border-border px-6 py-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="rounded-full font-inter"
          data-testid="back-to-dashboard-btn"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbake
        </Button>
        <Button
          onClick={handlePrint}
          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-inter"
          data-testid="print-btn"
        >
          <Printer className="mr-2 h-4 w-4" />
          Skriv ut
        </Button>
      </div>

      {/* Print content */}
      <div className="max-w-3xl mx-auto px-12 py-16">
        {/* Intro text */}
        <div className="mb-16 max-w-lg space-y-4">
          <p className="text-base text-foreground font-inter leading-relaxed">
            Når ting endrer seg, er det greit å ha oversikten samlet.
          </p>
          <p className="text-base text-muted-foreground font-inter leading-relaxed">
            Du kan ta den med deg, og komme tilbake senere.
          </p>
        </div>

        {/* Header */}
        <div className="mb-12 pb-8 border-b border-border/30">
          <h1 className="text-3xl font-playfair font-semibold text-foreground mb-3">
            MITTEIE
          </h1>
          <p className="text-base text-muted-foreground font-inter mb-2">
            Oversikt over eiendeler
          </p>
          {user && (
            <p className="text-sm text-muted-foreground font-inter">
              {user.name} · {user.email}
            </p>
          )}
          <p className="text-sm text-muted-foreground font-inter mt-2">
            {new Date().toLocaleDateString("nb-NO")}
          </p>
        </div>

        {totalValue > 0 && (
          <div className="mb-12 p-6 border border-border/30 rounded-lg">
            <p className="text-sm text-muted-foreground font-inter mb-1">
              Samlet verdi
            </p>
            <p className="text-2xl font-playfair font-semibold text-foreground">
              {totalValue.toLocaleString("nb-NO")} kr
            </p>
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-center text-muted-foreground font-inter py-12">
            Ingen eiendeler å eksportere
          </p>
        ) : (
          <div className="space-y-6">
            {items.map((item, index) => (
              <div
                key={item.item_id}
                className="border-b border-border pb-6 last:border-b-0"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-playfair font-semibold text-foreground">
                    {index + 1}. {item.navn}
                  </h3>
                  {item.verdi && (
                    <p className="text-lg font-playfair font-semibold text-foreground">
                      {item.verdi.toLocaleString("nb-NO")} {item.valuta}
                    </p>
                  )}
                </div>

                {item.kategori && (
                  <p className="text-sm text-muted-foreground font-inter mb-2">
                    <span className="font-medium">Kategori:</span> {item.kategori}
                  </p>
                )}

                {item.serienummer && (
                  <p className="text-sm text-foreground font-inter mb-2 font-mono">
                    <span className="font-medium">Serienummer:</span>{" "}
                    {item.serienummer}
                  </p>
                )}

                {item.notat && (
                  <p className="text-sm text-foreground font-inter mb-2">
                    <span className="font-medium">Notat:</span> {item.notat}
                  </p>
                )}

                {item.vedlegg_urls && item.vedlegg_urls.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-foreground font-inter mb-2">
                      Vedlegg:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {item.vedlegg_urls.map((url, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground font-inter break-all">
                          {url}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground font-inter">
            Dette dokumentet er generert fra MITTEIE per {new Date().toLocaleDateString("nb-NO")}.
          </p>
        </div>
      </div>
    </div>
  );
}
