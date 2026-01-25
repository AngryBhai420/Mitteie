import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Image configuration - easy to swap
  // BILDETYPE 1: Oversiktsark med liste (flat lay) - brukes slide 1
  // BILDETYPE 2: Naturlig skandinavisk hjem med eiendeler - brukes slide 4
  const slides = [
    {
      type: "image-text",
      image: "https://images.pexels.com/photos/19905186/pexels-photo-19905186.jpeg?auto=compress&cs=tinysrgb&w=1200",
      text: "Verdier finnes i både smått og stort.",
    },
    {
      type: "pause",
    },
    {
      type: "text-only",
      text: "Når de samles, blir de synlige.",
    },
    {
      type: "image-text",
      image: "https://images.unsplash.com/photo-1630706236319-87e9caec5b3a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
      text: "Derfor samles eiendeler, dokumentasjon og verdi på ett sted.",
    },
    {
      type: "text-only",
      text: "Det meste finnes allerede – bare spredt.",
    },
    {
      type: "text-only",
      text: "Når ting samles underveis, er oversikten allerede der.",
    },
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
      <header className="px-6 py-6 md:px-12">
        <h1 className="text-2xl font-playfair font-semibold tracking-tight text-foreground">
          MITTEIE
        </h1>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-12 py-8">
        <div className="w-full max-w-3xl">
          {slide.type === "image-text" && (
            <div className="space-y-8 animate-fade-in">
              {/* Image - contained, not hero */}
              <div className="rounded-2xl overflow-hidden mx-auto max-w-2xl shadow-md">
                <div className="aspect-[4/3] overflow-hidden bg-white">
                  <img
                    src={slide.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Text below image */}
              <p className="text-center text-lg sm:text-xl md:text-2xl text-foreground font-inter leading-relaxed px-4">
                {slide.text}
              </p>
            </div>
          )}

          {slide.type === "pause" && (
            <div className="h-64 md:h-96 animate-fade-in" />
          )}

          {slide.type === "text-only" && (
            <div className="text-center px-4 animate-fade-in">
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-playfair font-semibold text-foreground leading-tight tracking-tight">
                {slide.text}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="px-6 py-8 md:px-12 flex flex-col items-center space-y-6 border-t border-border/30">
        {/* Progress Dots */}
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-500 ${
                index === currentSlide
                  ? "bg-accent w-8"
                  : "bg-border w-2 hover:bg-muted-foreground/50"
              }`}
              data-testid={`slide-dot-${index}`}
              aria-label={`Gå til slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="flex flex-col items-center gap-4">
          {!isLastSlide ? (
            <button
              onClick={handleNext}
              className="px-8 py-3 rounded-full bg-muted hover:bg-muted-foreground/10 text-foreground font-inter text-sm transition-colors duration-300"
              data-testid="next-slide-btn"
            >
              Neste
            </button>
          ) : (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-3 rounded-full bg-muted hover:bg-muted-foreground/10 text-foreground font-inter text-sm transition-colors duration-300"
              data-testid="open-overview-btn"
            >
              Åpne oversikten
            </button>
          )}

          {/* Subtle back link */}
          {currentSlide > 0 && (
            <button
              onClick={handlePrevious}
              className="text-sm text-muted-foreground hover:text-foreground font-inter transition-colors"
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
