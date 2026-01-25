import { useState } from "react";
import { ChevronRight, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Easy to swap images - just update URLs here
  const slides = [
    {
      type: "image-text",
      image: "https://images.unsplash.com/photo-1632251657417-585ab7d16043?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
      text: "Verdier finnes i både smått og stort.",
    },
    {
      type: "image-text",
      image: "https://images.unsplash.com/photo-1648210463968-d3f55ae58d3f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
      text: "Når de samles, blir de synlige.",
    },
    {
      type: "image-text",
      image: "https://images.unsplash.com/photo-1680576555782-2010a9c394ae?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
      text: "Derfor samles eiendeler, dokumentasjon og verdi på ett sted.",
    },
    {
      type: "image-text",
      image: "https://images.unsplash.com/photo-1631706812749-7e0d3836983f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
      text: "Det meste finnes allerede – bare spredt.",
    },
    {
      type: "image-text",
      image: "https://images.pexels.com/photos/1416865/pexels-photo-1416865.jpeg?auto=compress&cs=tinysrgb&w=1200",
      text: "Når ting samles underveis, er oversikten allerede der.",
    },
    {
      type: "cta",
      image: "https://images.pexels.com/photos/7680683/pexels-photo-7680683.jpeg?auto=compress&cs=tinysrgb&w=1200",
      heading: "Samle oversikten",
      text: "Ta vare på det som betyr noe.",
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

  const handleSkip = () => {
    navigate("/dashboard");
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

      {/* Content - Card Layout */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-12 pb-8">
        <div className="w-full max-w-2xl">
          {/* Image Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 animate-fade-in">
            <div className="aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
              <img
                src={slide.image}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center px-4 mb-8 animate-fade-in">
            {slide.type === "cta" ? (
              <>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-semibold text-foreground mb-3 tracking-tight">
                  {slide.heading}
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground font-inter">
                  {slide.text}
                </p>
              </>
            ) : (
              <p className="text-lg sm:text-xl md:text-2xl text-foreground font-inter leading-relaxed">
                {slide.text}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="px-6 py-8 md:px-12 flex flex-col items-center space-y-6 border-t border-border/50 bg-white/50">
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          {!isLastSlide ? (
            <>
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="w-full sm:w-auto rounded-full font-inter text-muted-foreground hover:text-foreground order-2 sm:order-1"
                data-testid="skip-btn"
              >
                Hopp over
              </Button>
              
              <Button
                onClick={handleNext}
                className="w-full sm:flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-inter shadow-sm order-1 sm:order-2"
                data-testid="next-slide-btn"
              >
                <span>Neste</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="w-full sm:flex-1 rounded-full font-inter border-border hover:bg-muted/50"
                data-testid="login-from-landing-btn"
              >
                Logg inn
              </Button>
              
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full sm:flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-inter shadow-md"
                data-testid="open-overview-btn"
              >
                <span>Kom i gang</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Back button (subtle, only when not on first slide) */}
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
  );
}
