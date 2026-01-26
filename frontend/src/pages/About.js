import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-background">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link to="/dashboard">
            <h1 className="text-xl font-playfair font-semibold tracking-tight text-foreground">
              MITTEIE
            </h1>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-playfair font-semibold text-foreground tracking-tight mb-12">
              Om MITTEIE
            </h2>
            
            <div className="space-y-6 text-base md:text-lg text-foreground font-inter leading-relaxed">
              <p>
                MITTEIE ble ikke laget for å selge noe.
              </p>
              
              <p>
                Behovet oppsto da vi selv forsøkte å få oversikt over eiendeler – små og store – og oppdaget at det ikke fantes et verktøy som gjorde dette på en rolig og nøytral måte.
              </p>
              
              <p>
                Det fantes løsninger for forsikring, økonomi og inventar.<br />
                Men ingen som tok utgangspunkt i det enkle behovet:<br />
                å vite hva man har, over tid.
              </p>
              
              <p>
                Når ting samler seg gjennom år, flytting og livsendringer, blir oversikten vanskelig å holde.<br />
                Ikke fordi noe mangler.<br />
                Men fordi det er spredt.
              </p>
              
              <p>
                MITTEIE er laget for å samle det som allerede finnes.<br />
                Uten å presse.<br />
                Uten å love noe mer enn oversikt.
              </p>
              
              <p>
                Derfor er språket rolig.<br />
                Derfor kommer konto først når noe skal lagres.<br />
                Derfor anbefales det å ta med seg oversikten når man avslutter.
              </p>
              
              <p>
                MITTEIE er ment å brukes når det trengs.<br />
                Og ligge stille når det ikke gjør det.
              </p>
            </div>
          </div>

          {/* Fremtid seksjon */}
          <div className="pt-16 mt-16 border-t border-border/30">
            <p className="text-base text-muted-foreground font-inter leading-relaxed">
              MITTEIE kan over tid støtte flere måter å samle oversikt på.<br />
              Dette kan inkludere deling med nær familie, utvidet dokumentasjon og bedre støtte ved livsendringer.<br />
              Dette vurderes først når behovet oppstår. Ikke før.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
