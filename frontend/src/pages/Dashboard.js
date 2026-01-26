import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";
import ItemCard from "@/components/ItemCard";
import Footer from "@/components/Footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form state
  const [navn, setNavn] = useState("");
  const [kategori, setKategori] = useState("");
  const [serienummer, setSerienummer] = useState("");
  const [notat, setNotat] = useState("");
  const [verdi, setVerdi] = useState("");
  const [vedlegg, setVedlegg] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.user) {
      setUser(location.state.user);
      setIsAuthenticated(true);
      loadItems();
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) throw new Error("Not authenticated");

        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
        loadItems();
      } catch (error) {
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.state]);

  const loadItems = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/items`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to load items");

      const data = await response.json();
      setItems(data);
    } catch (error) {
      toast.error("Kunne ikke laste eiendeler");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      navigate("/");
    } catch (error) {
      toast.error("Utlogging mislyktes");
    }
  };

  const resetForm = () => {
    setNavn("");
    setKategori("");
    setSerienummer("");
    setNotat("");
    setVerdi("");
    setVedlegg([]);
    setEditingItem(null);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setNavn(item.navn || "");
    setKategori(item.kategori || "");
    setSerienummer(item.serienummer || "");
    setNotat(item.notat || "");
    setVerdi(item.verdi ? String(item.verdi) : "");
    setVedlegg(item.vedlegg_urls || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/items/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setItems(items.filter((item) => item.item_id !== itemId));
      toast.success("Eiendel fjernet");
    } catch (error) {
      toast.error("Kunne ikke fjerne eiendel");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/signup");
      return;
    }

    setSaving(true);

    const itemData = {
      navn,
      kategori: kategori || null,
      serienummer: serienummer || null,
      notat: notat || null,
      verdi: verdi ? parseFloat(verdi) : null,
      valuta: "NOK",
      vedlegg_urls: vedlegg,
    };

    try {
      let response;

      if (editingItem) {
        response = await fetch(
          `${BACKEND_URL}/api/items/${editingItem.item_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(itemData),
          }
        );
      } else {
        response = await fetch(`${BACKEND_URL}/api/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(itemData),
        });
      }

      if (!response.ok) throw new Error("Failed to save");

      const savedItem = await response.json();

      if (editingItem) {
        setItems(
          items.map((item) =>
            item.item_id === savedItem.item_id ? savedItem : item
          )
        );
        toast.success("Eiendel oppdatert");
      } else {
        setItems([...items, savedItem]);
        toast.success("Eiendel lagt til");
      }

      resetForm();
    } catch (error) {
      toast.error("Kunne ikke lagre eiendel");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    toast.info("Filopplasting kommer i neste versjon");
    e.target.value = null;
  };

  const handleRemoveAttachment = (index) => {
    setVedlegg(vedlegg.filter((_, i) => i !== index));
  };

  const totalValue = items
    .filter((item) => item.verdi)
    .reduce((sum, item) => sum + item.verdi, 0);

  if (loading && isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground font-inter">Laster...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-background sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <h1 className="text-xl font-playfair font-semibold tracking-tight text-foreground">
              MITTEIE
            </h1>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <Link to="/export">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground/70 hover:text-foreground/60 font-inter text-sm"
                    data-testid="export-btn"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Ta med oversikten
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-muted-foreground/70 hover:text-foreground/60 font-inter text-sm"
                  data-testid="logout-btn"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logg ut
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Intro Section */}
        <div className="mb-16 max-w-lg">
          <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-foreground tracking-tight mb-6">
            Oversikt
          </h2>
          {!isAuthenticated ? (
            <p className="text-base md:text-lg text-muted-foreground font-inter leading-relaxed">
              Konto trengs først når noe skal lagres.
            </p>
          ) : (
            <div className="space-y-3">
              {!user?.subscription_status && (
                <p className="text-sm text-muted-foreground font-inter">
                  <Link to="/subscription" className="text-foreground/70 hover:text-foreground/90 transition-colors">
                    Lagring over tid
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Add Item Form - Always Visible */}
        <div className="mb-16 p-8 bg-white/50 border border-border/30 rounded-2xl">
          <h3 className="text-xl font-playfair font-semibold text-foreground mb-6">
            {editingItem ? "Endre eiendel" : "Legg til eiendel"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="navn" className="font-inter text-sm text-foreground">
                Navn
              </Label>
              <Input
                id="navn"
                value={navn}
                onChange={(e) => setNavn(e.target.value)}
                required
                className="bg-background/50 border-border/50 focus:border-accent focus:ring-0 rounded-lg font-inter"
                data-testid="item-navn-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="kategori" className="font-inter text-sm text-foreground">
                  Kategori
                </Label>
                <Input
                  id="kategori"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  placeholder="F.eks. Elektronikk"
                  className="bg-background/50 border-border/50 focus:border-accent focus:ring-0 rounded-lg font-inter"
                  data-testid="item-kategori-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serienummer" className="font-inter text-sm text-foreground">
                  Serienummer
                </Label>
                <Input
                  id="serienummer"
                  value={serienummer}
                  onChange={(e) => setSerienummer(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-accent focus:ring-0 rounded-lg font-inter font-mono text-sm"
                  data-testid="item-serienummer-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verdi" className="font-inter text-sm text-foreground">
                Verdi (kr)
              </Label>
              <Input
                id="verdi"
                type="number"
                step="0.01"
                value={verdi}
                onChange={(e) => setVerdi(e.target.value)}
                className="bg-background/50 border-border/50 focus:border-accent focus:ring-0 rounded-lg font-inter"
                data-testid="item-verdi-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notat" className="font-inter text-sm text-foreground">
                Notat
              </Label>
              <Textarea
                id="notat"
                value={notat}
                onChange={(e) => setNotat(e.target.value)}
                rows={3}
                className="bg-background/50 border-border/50 focus:border-accent focus:ring-0 rounded-lg font-inter resize-none"
                data-testid="item-notat-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-inter text-sm text-foreground">Vedlegg (bilde eller PDF)</Label>
              <div className="space-y-3">
                <div>
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      className="w-full rounded-lg font-inter border-dashed border-border/50 hover:bg-muted/30"
                      onClick={() => document.getElementById("file-upload").click()}
                      data-testid="upload-attachment-btn"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? "Laster opp..." : "Last opp fil"}
                    </Button>
                  </label>
                </div>

                {vedlegg.length > 0 && (
                  <div className="space-y-2">
                    {vedlegg.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <span className="text-sm font-inter truncate flex-1 mr-3">
                          Vedlegg {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAttachment(index)}
                          className="rounded-full hover:bg-destructive/10"
                          data-testid={`remove-attachment-${index}`}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {editingItem && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetForm}
                  className="text-muted-foreground/70 hover:text-foreground/60 font-inter"
                  data-testid="cancel-item-btn"
                >
                  Avbryt
                </Button>
              )}
              <Button
                type="submit"
                disabled={saving || !navn}
                className="bg-muted/50 hover:bg-muted/70 text-foreground/70 rounded-full font-inter px-8"
                data-testid="save-item-btn"
              >
                {saving ? "Lagrer..." : "Legg til i oversikten"}
              </Button>
            </div>

            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground font-inter pt-2">
                For å lagre trenger du en konto.
              </p>
            )}
          </form>
        </div>

        {/* Total Value */}
        {totalValue > 0 && (
          <div className="mb-12 p-8 bg-white/50 border border-border/30 rounded-2xl">
            <p className="text-sm text-muted-foreground font-inter mb-2">
              Samlet verdi
            </p>
            <p className="text-3xl font-playfair font-semibold text-foreground">
              {totalValue.toLocaleString("nb-NO")} kr
            </p>
          </div>
        )}

        {/* Items List */}
        {items.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-playfair font-semibold text-foreground">
              Lagrede eiendeler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item) => (
                <ItemCard
                  key={item.item_id}
                  item={item}
                  onEdit={() => handleEditClick(item)}
                  onDelete={() => handleDeleteItem(item.item_id)}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
