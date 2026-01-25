import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      type: "image-text",
      image: "https://images.unsplash.com/photo-1563443395-34633f828d0f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
      text: "Verdier finnes i både smått og stort.",
    },
    {
      type: "pause",
      text: null,
    },
    {
      type: "text-only",
      text: "Når de samles, blir de synlige.",
    },
    {
      type: "image-text",
      image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 md:px-12">
        <h1 className="text-2xl font-playfair font-semibold tracking-tight text-foreground">
          MITTEIE
        </h1>
      </header>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12">
        <div className="max-w-4xl w-full">
          {slide.type === "image-text" && (
            <div className="space-y-12 animate-fade-in">
              <div className="aspect-[16/9] overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={slide.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              {slide.text && (
                <p className="text-center text-lg md:text-xl text-foreground font-inter leading-relaxed">
                  {slide.text}
                </p>
              )}
            </div>
          )}

          {slide.type === "text-only" && (
            <div className="text-center animate-fade-in">
              <p className="text-3xl md:text-4xl lg:text-5xl font-playfair font-semibold text-foreground leading-tight tracking-tight">
                {slide.text}
              </p>
            </div>
          )}

          {slide.type === "pause" && (
            <div className="text-center animate-fade-in">
              <div className="h-32"></div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-12 md:px-12 flex flex-col items-center space-y-6">
        {/* Dots */}
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-accent w-8"
                  : "bg-border hover:bg-muted-foreground"
              }`}
              data-testid={`slide-dot-${index}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex space-x-4">
          {currentSlide > 0 && (
            <button
              onClick={handlePrevious}
              className="px-6 py-3 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300 font-inter text-sm"
              data-testid="previous-slide-btn"
            >
              Forrige
            </button>
          )}

          {currentSlide < slides.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 font-inter text-sm flex items-center space-x-2 shadow-sm"
              data-testid="next-slide-btn"
            >
              <span>Neste</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 font-inter text-base shadow-md"
              data-testid="open-overview-btn"
            >
              Åpne oversikten
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
