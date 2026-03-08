import { useEffect, useRef, useState } from "react";
import secretArtImage from "../secret-art-of-sunglasses-7.webp";

type CityTile = {
  name: string;
  image: string;
};

const CITIES: CityTile[] = [
  { name: "London", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=80" },
  { name: "Tokyo", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1400&q=80" },
  { name: "Hamburg", image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1400&q=80" },
  { name: "New York", image: "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1400&q=80" },
  { name: "Shanghai", image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1400&q=80" },
  { name: "Paris", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80" },
  { name: "Milan", image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1400&q=80" },
  { name: "Berlin", image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1400&q=80" },
  { name: "Seoul", image: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60b?auto=format&fit=crop&w=1400&q=80" },
  { name: "Dubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80" },
  { name: "Singapore", image: "https://images.unsplash.com/photo-1473959383414-a1e0f111602e?auto=format&fit=crop&w=1400&q=80" },
  { name: "Los Angeles", image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1400&q=80" },
  { name: "Madrid", image: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1400&q=80" },
  { name: "Vienna", image: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1400&q=80" },
  { name: "Rome", image: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=1400&q=80" },
  { name: "Barcelona", image: "https://images.unsplash.com/photo-1526481280695-3c4695d689f9?auto=format&fit=crop&w=1400&q=80" }
];

const clamp = (value: number, min = 0, max = 1): number => Math.max(min, Math.min(max, value));
const map = (value: number, start: number, end: number): number => clamp((value - start) / (end - start));

const getSectionProgress = (section: HTMLElement | null): number => {
  if (!section) return 0;
  const rect = section.getBoundingClientRect();
  const maxScroll = Math.max(section.offsetHeight - window.innerHeight, 1);
  return clamp(-rect.top / maxScroll);
};

export default function App() {
  const heroRef = useRef<HTMLElement | null>(null);
  const storyRef = useRef<HTMLElement | null>(null);

  const [heroProgress, setHeroProgress] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      setHeroProgress(getSectionProgress(heroRef.current));
      setStoryProgress(getSectionProgress(storyRef.current));
    };

    const onScroll = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // HERO PHASES
  const heroPhaseA = map(heroProgress, 0.0, 0.24);
  const heroPhaseB = map(heroProgress, 0.24, 0.52);
  const heroPhaseC = map(heroProgress, 0.52, 0.7);
  const heroPhaseD = map(heroProgress, 0.7, 0.9);

  const titleY = heroPhaseA * 56;
  const titleOpacity = 1 - heroPhaseA * 1.2;

  const gridScale = 0.84 + heroPhaseB * 0.16;
  const gridY = heroPhaseD * -170;

  const imageBlur = 7 - heroPhaseB * 7;
  const imageScale = 0.9 + heroPhaseB * 0.1;

  const hintOpacity = 1 - map(heroProgress, 0.68, 0.9);
  const gridInteractive = heroPhaseB >= 0.995 && heroPhaseC > 0 && heroPhaseD === 0;

  // STORY PHASES
  const imageEnter = map(storyProgress, 0.5, 0.72);
  const imagePlainScroll = map(storyProgress, 0.72, 0.94);
  const parallaxMove = map(storyProgress, 0.76, 0.99);
  const imageExit = map(storyProgress, 0.94, 1.0);
  const line1In = map(storyProgress, 0.14, 0.38);
  const line2In = map(storyProgress, 0.3, 0.56);
  const linesOut = map(storyProgress, 0.66, 0.9);

  const line1Opacity = line1In;
  const line2Opacity = line2In;
  const line1X = (1 - line1In) * 88;
  const line2X = (1 - line2In) * 118;
  const linesOutY = linesOut * -125;

  const parallaxStageY = (1 - imageEnter) * 105 - imagePlainScroll * 26 - imageExit * 8;
  const parallaxImageY = -parallaxMove * 20 - imageExit * 7;
  const parallaxWhiteY = 112 - parallaxMove * 112;
  const ctaY = parallaxWhiteY;

  return (
    <>
      <section className="hero-scroll" ref={heroRef}>
        <div className={`hero-stage ${gridInteractive ? "is-interactive" : ""}`}>
          <div className="hero-bg-layer" />

          <div className="hero-grid-layer">
            <div
              className="city-grid"
              style={{
                transform: `translate(-50%, calc(-50% + ${gridY}px)) scale(${gridScale})`
              }}
            >
              {CITIES.map((city) => (
                <figure className="tile" key={city.name}>
                  <img
                    src={city.image}
                    alt={city.name}
                    style={{
                      filter: `grayscale(100%) blur(${Math.max(imageBlur, 0).toFixed(2)}px)`,
                      transform: `scale(${imageScale.toFixed(3)})`
                    }}
                  />
                  <figcaption className="city">{city.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className="hero-title-layer">
            <h1
              className="hero-title"
              style={{
                transform: `translate(-50%, calc(-50% - ${titleY}vh))`,
                opacity: titleOpacity
              }}
            >
              JARO
            </h1>
          </div>

          <div className="hero-hint-layer">
            <p className="scroll-hint" style={{ opacity: hintOpacity }}>
              Scroll down to proceed
            </p>
          </div>
        </div>
      </section>

      <section className="story-scroll" ref={storyRef}>
        <div className="story-stage">
          <div
            className="story-lines"
          >
            <h2
              className="story-line"
              style={{
                opacity: line1Opacity,
                transform: `translate(${line1X}vw, ${linesOutY}vh)`
              }}
            >
              WE HAVE A STORY IN EVERY CITY.
            </h2>

            <h2
              className="story-line"
              style={{
                opacity: line2Opacity,
                transform: `translate(${line2X}vw, ${linesOutY}vh)`
              }}
            >
              WE PUT THESE STORIES IN OUR SUNGLASSES.
            </h2>
          </div>

          <div
            className="story-parallax"
            style={{
              transform: `translateY(${parallaxStageY}%)`
            }}
          >
            <img
              className="story-parallax-image"
              src={secretArtImage}
              alt="The secret art of sunglasses"
              style={{ transform: `translateY(${parallaxImageY}px)` }}
            />
            <div className="story-parallax-white" style={{ transform: `translateY(${parallaxWhiteY}%)` }} />
          </div>

          <div
            className="story-cta"
            style={{
              transform: `translateY(${ctaY}vh)`,
              pointerEvents: ctaY <= 4 ? "auto" : "none"
            }}
          >
            <h3>Do you want to be one of the first 1000 owners?</h3>
            <form className="cta-form" onSubmit={(event) => event.preventDefault()}>
              <input type="email" placeholder="Register here with your email" required />
              <button type="submit">Register</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
