import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    { type: "image-text", slide: 1 },
    { type: "reflection", slide: 2 },
    { type: "consequence", slide: 3 },
    { type: "closing", slide: 4 },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-8 py-8 md:px-16 md:py-10 flex items-center justify-between">
        <h1 className="text-xl font-playfair font-semibold tracking-tight text-foreground">
          MITTEIE
        </h1>
        <Link
          to="/login"
          className="text-sm text-muted-foreground/70 hover:text-foreground/60 font-inter transition-colors"
          data-testid="landing-login-link"
        >
          Logg inn
        </Link>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-16">
        {/* Slide 1 - Stue image */}
        {slide.type === "image-text" && slide.slide === 1 && (
          <div className="w-full max-w-2xl space-y-12 animate-fade-in">
            <div className="rounded-3xl overflow-hidden shadow-sm">
              <img
                src="https://customer-assets.emergentagent.com/job_502a92c9-65ed-4535-905f-55676ff68ba7/artifacts/h1pxsi3t_Stue.png"
                alt=""
                className="w-full h-auto"
                style={{ maxHeight: "65vh", objectFit: "cover" }}
              />
            </div>
            <div className="max-w-md mx-auto">
              <p className="text-2xl md:text-3xl font-playfair text-foreground leading-relaxed text-center">
                Verdier finnes i både smått og stort.
              </p>
            </div>
          </div>
        )}

        {/* Slide 2 - Reflection (text only) */}
        {slide.type === "reflection" && (
          <div className="w-full max-w-lg space-y-16 animate-fade-in px-4">
            <div className="space-y-3">
              <p className="text-xl md:text-2xl font-playfair text-foreground leading-relaxed text-center">
                Noen ting har verdi fordi de kostet noe.
              </p>
              <p className="text-xl md:text-2xl font-playfair text-foreground leading-relaxed text-center">
                Andre fordi de betyr noe.
              </p>
            </div>
            
            <div className="pt-8">
              <p className="text-lg md:text-xl font-playfair text-muted-foreground leading-relaxed text-center">
                Over tid blir det vanskelig å holde oversikten.
              </p>
            </div>
          </div>
        )}

        {/* Slide 3 - Consequence (text only) */}
        {slide.type === "consequence" && (
          <div className="w-full max-w-lg space-y-16 animate-fade-in px-4">
            <p className="text-xl md:text-2xl font-playfair text-foreground leading-relaxed text-center">
              Oversikt blir viktig når noe endrer seg.
            </p>
            
            <div className="space-y-4 text-center">
              <p className="text-lg md:text-xl font-playfair text-foreground leading-relaxed">
                Flytting.
              </p>
              <p className="text-lg md:text-xl font-playfair text-foreground leading-relaxed">
                Arv.
              </p>
              <p className="text-lg md:text-xl font-playfair text-foreground leading-relaxed">
                Skilsmisse.
              </p>
              <p className="text-lg md:text-xl font-playfair text-foreground leading-relaxed">
                Forsikring.
              </p>
            </div>
            
            <p className="text-lg md:text-xl font-playfair text-muted-foreground leading-relaxed text-center pt-8">
              Eller bare fordi tid går.
            </p>
          </div>
        )}

        {/* Slide 4 - Oversikt image + closing */}
        {slide.type === "closing" && (
          <div className="w-full max-w-2xl space-y-12 animate-fade-in">
            <div className="rounded-3xl overflow-hidden shadow-sm">
              <img
                src="https://customer-assets.emergentagent.com/job_502a92c9-65ed-4535-905f-55676ff68ba7/artifacts/aksku1t0_Oversikt.png"
                alt=""
                className="w-full h-auto"
                style={{ maxHeight: "60vh", objectFit: "cover" }}
              />
            </div>
            <div className="max-w-md mx-auto">
              <p className="text-2xl md:text-3xl font-playfair text-foreground leading-relaxed text-center">
                Når ting samles, blir de synlige.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="px-8 py-10 md:py-12 flex flex-col items-center space-y-8">
        {/* Progress Dots */}
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentSlide
                  ? "bg-accent/60 w-8"
                  : "bg-border/50 w-1.5 hover:bg-muted-foreground/30"
              }`}
              data-testid={`slide-dot-${index}`}
              aria-label={`Gå til slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Single Action */}
        <div className="flex flex-col items-center gap-6">
          {!isLastSlide ? (
            <button
              onClick={handleNext}
              className="px-10 py-3 rounded-full bg-muted/50 hover:bg-muted/70 text-foreground/70 font-inter text-sm transition-all duration-500"
              data-testid="next-slide-btn"
            >
              Neste
            </button>
          ) : (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-10 py-3 rounded-full bg-muted/50 hover:bg-muted/70 text-foreground/70 font-inter text-sm transition-all duration-500"
              data-testid="open-overview-btn"
            >
              Gå til oversikten
            </button>
          )}

          {currentSlide > 0 && (
            <button
              onClick={handlePrevious}
              className="text-xs text-muted-foreground/60 hover:text-foreground/50 font-inter transition-colors duration-300"
              data-testid="previous-slide-btn"
            >
              Tilbake
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
