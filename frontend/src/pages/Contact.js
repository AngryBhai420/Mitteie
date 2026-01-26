import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/30 bg-background">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link to="/">
            <h1 className="text-xl font-playfair font-semibold tracking-tight text-foreground">
              MITTEIE
            </h1>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto px-6 py-16">
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-foreground tracking-tight mb-12">
              Kontakt
            </h2>
            
            <div className="space-y-6 text-base md:text-lg text-foreground font-inter leading-relaxed">
              <p>
                For spørsmål om MITTEIE, send e-post til:
              </p>
              
              <p className="text-xl">
                kontakt@mitteie.no
              </p>
              
              <p className="text-muted-foreground pt-8">
                Vi svarer så raskt vi kan.<br />
                Vanligvis innen 1–2 virkedager.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
