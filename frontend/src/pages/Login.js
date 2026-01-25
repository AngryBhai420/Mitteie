import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Innlogging mislyktes");
      }

      const user = await response.json();
      navigate("/dashboard", { state: { user } });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="inline-block mb-12">
            <h1 className="text-2xl font-playfair font-semibold tracking-tight text-foreground">
              MITTEIE
            </h1>
          </Link>

          <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-foreground mb-3 tracking-tight">
            Logg inn
          </h2>
          <p className="text-muted-foreground mb-8 font-inter">
            Fortsett til oversikten
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-inter text-sm">
                E-post
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted/50 border-transparent focus:border-accent focus:ring-0 rounded-lg font-inter"
                data-testid="login-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-inter text-sm">
                Passord
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-muted/50 border-transparent focus:border-accent focus:ring-0 rounded-lg font-inter"
                data-testid="login-password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6 font-inter shadow-sm"
              data-testid="login-submit-btn"
            >
              {loading ? "Logger inn..." : "Logg inn"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground font-inter">
                  eller
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full mt-6 rounded-full py-6 font-inter border-border hover:bg-muted/50"
              data-testid="google-login-btn"
            >
              <Mail className="mr-2 h-4 w-4" />
              Fortsett med Google
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground font-inter">
            Har ikke konto?{" "}
            <Link
              to="/signup"
              className="text-accent hover:underline"
              data-testid="signup-link"
            >
              Opprett konto
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:flex-1">
        <div
          className="h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1685545517667-b7f8e77c5f5d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200')",
          }}
        ></div>
      </div>
    </div>
  );
}
