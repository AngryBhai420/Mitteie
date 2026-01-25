import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, FileText } from "lucide-react";
import { toast } from "sonner";
import ItemCard from "@/components/ItemCard";
import ItemModal from "@/components/ItemModal";
import RequireAuthModal from "@/components/RequireAuthModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showRequireAuth, setShowRequireAuth] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user data passed from auth flow, skip auth check
    if (location.state?.user) {
      setUser(location.state.user);
      setIsAuthenticated(true);
      loadItems();
      return;
    }

    // Check auth via /auth/me
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

  const handleAddClick = () => {
    if (!isAuthenticated) {
      setShowRequireAuth(true);
      return;
    }
    setEditingItem(null);
    setShowItemModal(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setShowItemModal(true);
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

  const handleSaveItem = async (itemData) => {
    try {
      let response;

      if (editingItem) {
        // Update
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
        // Create
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

      setShowItemModal(false);
      setEditingItem(null);
    } catch (error) {
      toast.error("Kunne ikke lagre eiendel");
    }
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
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <h1 className="text-2xl font-playfair font-semibold tracking-tight text-foreground">
              MITTEIE
            </h1>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <Link to="/export">
                  <Button
                    variant="outline"
                    className="rounded-full font-inter"
                    data-testid="export-btn"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Ta med oversikten
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="rounded-full font-inter"
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
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Intro Section */}
        <div className="mb-16 max-w-lg">
          <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-foreground tracking-tight mb-6">
            Oversikt
          </h2>
          {!isAuthenticated && (
            <p className="text-base md:text-lg text-muted-foreground font-inter leading-relaxed">
              Samle det viktigste underveis.<br />
              Resten kan vente.
            </p>
          )}
        </div>

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

        {items.length === 0 ? (
          <div className="text-center py-32">
            <div className="max-w-lg mx-auto space-y-12">
              <div
                className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm"
                style={{
                  backgroundImage:
                    "url('https://customer-assets.emergentagent.com/job_502a92c9-65ed-4535-905f-55676ff68ba7/artifacts/aksku1t0_Oversikt.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
              
              {isAuthenticated && (
                <div className="pt-8">
                  <button
                    onClick={handleAddClick}
                    className="px-10 py-3 rounded-full bg-muted/50 hover:bg-muted/70 text-foreground/70 font-inter text-sm transition-all duration-500"
                    data-testid="empty-add-item-btn"
                  >
                    Legg til første eiendel
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {isAuthenticated && (
              <div className="mb-8 flex justify-end">
                <button
                  onClick={handleAddClick}
                  className="px-8 py-3 rounded-full bg-muted/50 hover:bg-muted/70 text-foreground/70 font-inter text-sm transition-all duration-500"
                  data-testid="add-item-btn"
                >
                  Legg til
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Modals */}
      {showItemModal && (
        <ItemModal
          item={editingItem}
          onSave={handleSaveItem}
          onClose={() => {
            setShowItemModal(false);
            setEditingItem(null);
          }}
        />
      )}

      {showRequireAuth && (
        <RequireAuthModal onClose={() => setShowRequireAuth(false)} />
      )}
    </div>
  );
}
