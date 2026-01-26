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
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-24">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="inline-block mb-16">
            <h1 className="text-xl font-playfair font-semibold tracking-tight text-foreground">
              MITTEIE
            </h1>
          </Link>

          <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-foreground mb-3 tracking-tight">
            Logg inn
          </h2>
          <p className="text-base text-muted-foreground mb-12 font-inter leading-relaxed">
            Gå tilbake til oversikten
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-inter text-sm text-foreground">
                E-post
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted/30 border-border/50 focus:border-accent focus:ring-0 rounded-lg font-inter"
                data-testid="login-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-inter text-sm text-foreground">
                Passord
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-muted/30 border-border/50 focus:border-accent focus:ring-0 rounded-lg font-inter"
                data-testid="login-password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-muted/50 hover:bg-muted/70 text-foreground/70 rounded-full py-6 font-inter transition-all duration-500"
              data-testid="login-submit-btn"
            >
              {loading ? "Logger inn..." : "Logg inn"}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30"></div>
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
              className="w-full mt-8 rounded-full py-6 font-inter border-border/50 hover:bg-muted/30 text-foreground/70"
              data-testid="google-login-btn"
            >
              <Mail className="mr-2 h-4 w-4" />
              Fortsett med Google
            </Button>
          </div>

          <p className="mt-12 text-center text-sm text-muted-foreground font-inter">
            Ingen konto ennå?{" "}
            <Link
              to="/signup"
              className="text-foreground/70 hover:text-foreground/90 transition-colors"
              data-testid="signup-link"
            >
              Opprett konto
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:flex-1 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://customer-assets.emergentagent.com/job_502a92c9-65ed-4535-905f-55676ff68ba7/artifacts/9l4s546a_8558a30044f746ae707528c1fcb7e25de8ef4247d52582811f1e1838c73ed636.png')",
          }}
        ></div>
      </div>
    </div>
  );
}
