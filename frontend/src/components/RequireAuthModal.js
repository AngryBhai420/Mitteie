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
      <DialogContent className="bg-background rounded-3xl max-w-md border-border/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair font-semibold text-foreground">
            Konto trengs
          </DialogTitle>
          <DialogDescription className="font-inter text-base leading-relaxed pt-3 text-muted-foreground">
            Konto trengs først når noe skal lagres.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-3 mt-6">
          <Button
            onClick={() => navigate("/signup")}
            className="bg-muted/50 hover:bg-muted/70 text-foreground/70 rounded-full font-inter py-6"
            data-testid="require-auth-signup-btn"
          >
            Opprett konto
          </Button>
          <Button
            onClick={() => navigate("/login")}
            variant="ghost"
            className="text-muted-foreground/70 hover:text-foreground/60 rounded-full font-inter py-6"
            data-testid="require-auth-login-btn"
          >
            Logg inn
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-muted-foreground/50 hover:text-foreground/40 rounded-full font-inter text-sm pt-4"
            data-testid="require-auth-cancel-btn"
          >
            Ikke nå
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
