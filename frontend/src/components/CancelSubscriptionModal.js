import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function CancelSubscriptionModal({ onClose, onConfirm }) {
  const navigate = useNavigate();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-background rounded-3xl max-w-xl border-border/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair font-semibold text-foreground mb-4">
            Før du avslutter
          </DialogTitle>
          <DialogDescription className="font-inter text-base leading-relaxed text-foreground space-y-6">
            <p>
              Før abonnementet avsluttes, anbefaler vi at du tar med deg oversikten.
            </p>
            
            <p>
              Du kan laste ned en utskriftsvennlig PDF med alle eiendelene dine.<br />
              Da har du oversikten tilgjengelig også senere.
            </p>
            
            <p className="text-muted-foreground">
              MITTEIE er laget for trygghet over tid.<br />
              Ikke for å holde på deg.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-3 mt-6">
          <Button
            onClick={() => navigate("/export")}
            className="bg-muted/50 hover:bg-muted/70 text-foreground/70 rounded-full font-inter py-6"
            data-testid="export-before-cancel-btn"
          >
            Last ned oversikten først
          </Button>
          
          <Button
            onClick={onConfirm}
            variant="ghost"
            className="text-muted-foreground/70 hover:text-foreground/60 rounded-full font-inter py-6"
            data-testid="confirm-cancel-btn"
          >
            Avslutt abonnement
          </Button>
          
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-muted-foreground/50 hover:text-foreground/40 rounded-full font-inter text-sm pt-4"
            data-testid="keep-subscription-btn"
          >
            Behold abonnement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
