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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-foreground tracking-tight">
              Oversikt
            </h2>
            {isAuthenticated && user && (
              <p className="text-muted-foreground mt-2 font-inter">
                {user.name}
              </p>
            )}
          </div>

          <Button
            onClick={handleAddClick}
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-inter shadow-md"
            data-testid="add-item-btn"
          >
            <Plus className="mr-2 h-5 w-5" />
            Legg til
          </Button>
        </div>

        {totalValue > 0 && (
          <div className="mb-8 p-6 bg-white border border-border rounded-xl shadow-sm">
            <p className="text-sm text-muted-foreground font-inter mb-1">
              Samlet verdi
            </p>
            <p className="text-3xl font-playfair font-semibold text-foreground">
              {totalValue.toLocaleString("nb-NO")} kr
            </p>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="max-w-md mx-auto">
              <div
                className="aspect-[4/3] mb-8 rounded-xl overflow-hidden bg-muted"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1722080668634-6b8198f68887?crop=entropy&cs=srgb&fm=jpg&q=85&w=800')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
              <p className="text-lg text-muted-foreground font-inter mb-6">
                Ingen eiendeler ennå. Legg til noe for å samle oversikten.
              </p>
              <Button
                onClick={handleAddClick}
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-inter px-8 py-6"
                data-testid="empty-add-item-btn"
              >
                Legg til første eiendel
              </Button>
            </div>
          </div>
        ) : (
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
