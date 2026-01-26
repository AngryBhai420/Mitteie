import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

export default function Privacy() {
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
              Personvern
            </h2>
            
            <div className="space-y-6 text-base md:text-lg text-foreground font-inter leading-relaxed">
              <p>
                MITTEIE lagrer kun det du selv legger til.
              </p>
              
              <p>
                Data eies av deg.<br />
                Ingen andre har tilgang til din oversikt.
              </p>
              
              <p>
                Vi selger ikke data.<br />
                Vi deler ikke data med tredjepart.<br />
                Vi bruker ikke data til markedsføring eller analyse.
              </p>
              
              <p>
                Når du avslutter abonnementet, anbefales det å ta med seg oversikten som PDF.<br />
                Etter avslutning slettes lagrede data innen 30 dager.
              </p>
              
              <p>
                Betaling håndteres av Stripe.<br />
                Vi lagrer ikke betalingsinformasjon.
              </p>
              
              <p>
                For spørsmål om personvern, se kontaktinformasjon.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
