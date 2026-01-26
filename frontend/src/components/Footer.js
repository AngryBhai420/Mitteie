import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border/30 bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground/70 font-inter">
          <Link
            to="/about"
            className="hover:text-muted-foreground/90 transition-colors"
          >
            Om MITTEIE
          </Link>
          <Link
            to="/privacy"
            className="hover:text-muted-foreground/90 transition-colors"
          >
            Personvern
          </Link>
          <Link
            to="/contact"
            className="hover:text-muted-foreground/90 transition-colors"
          >
            Kontakt
          </Link>
        </div>
      </div>
    </footer>
  );
}
