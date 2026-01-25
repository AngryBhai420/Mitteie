import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function RequireAuthModal({ onClose }) {
  const navigate = useNavigate();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair font-semibold">
            Konto trengs
          </DialogTitle>
          <DialogDescription className="font-inter text-base leading-relaxed pt-2">
            Konto trengs først når noe skal lagres.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-3 mt-4">
          <Button
            onClick={() => navigate("/signup")}
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-inter py-6"
            data-testid="require-auth-signup-btn"
          >
            Opprett konto
          </Button>
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="rounded-full font-inter py-6"
            data-testid="require-auth-login-btn"
          >
            Logg inn
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="rounded-full font-inter"
            data-testid="require-auth-cancel-btn"
          >
            Ikke nå
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
