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
  { name: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80" },
  { name: "Milan", image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1400&q=80" },
  { name: "Berlin", image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1400&q=80" },
  { name: "Seoul", image: "https://source.unsplash.com/1600x1600/?seoul,city,night&sig=101" },
  { name: "Dubai", image: "https://source.unsplash.com/1600x1600/?dubai,city,skyline&sig=102" },
  { name: "Singapore", image: "https://source.unsplash.com/1600x1600/?singapore,city,skyline&sig=103" },
  { name: "Los Angeles", image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1400&q=80" },
  { name: "Madrid", image: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1400&q=80" },
  { name: "Vienna", image: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1400&q=80" },
  { name: "Rome", image: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=1400&q=80" },
  { name: "Barcelona", image: "https://source.unsplash.com/1600x1600/?barcelona,city,architecture&sig=104" }
];

const CITY_BORDER_TEXT = CITIES.map((city) => city.name).join("   ");
const CITY_BORDER_LOOP = Array.from({ length: 16 }, () => CITY_BORDER_TEXT).join("   ");

const clamp = (value: number, min = 0, max = 1): number => Math.max(min, Math.min(max, value));
const map = (value: number, start: number, end: number): number => clamp((value - start) / (end - start));
const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const getNextMayFirstMs = (nowMs: number): number => {
  const now = new Date(nowMs);
  let target = new Date(now.getFullYear(), 4, 1, 0, 0, 0, 0);
  if (nowMs >= target.getTime()) {
    target = new Date(now.getFullYear() + 1, 4, 1, 0, 0, 0, 0);
  }
  return target.getTime();
};

const getCountdownParts = (
  targetMs: number,
  nowMs: number
): { days: number; hours: number; minutes: number; seconds: number } => {
  const remaining = Math.max(targetMs - nowMs, 0);
  const days = Math.floor(remaining / DAY_MS);
  const hours = Math.floor((remaining % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((remaining % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((remaining % MINUTE_MS) / SECOND_MS);
  return { days, hours, minutes, seconds };
};

const getSectionProgress = (section: HTMLElement | null): number => {
  if (!section) return 0;
  const rect = section.getBoundingClientRect();
  const maxScroll = Math.max(section.offsetHeight - window.innerHeight, 1);
  return clamp(-rect.top / maxScroll);
};

export default function App() {
  const heroRef = useRef<HTMLElement | null>(null);
  const storyRef = useRef<HTMLElement | null>(null);
  const storyImageRef = useRef<HTMLImageElement | null>(null);
  const ownersCounterRafRef = useRef(0);
  const ownersCounterStartedRef = useRef(false);

  const [heroProgress, setHeroProgress] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [storyImageOverflow, setStoryImageOverflow] = useState(0);
  const [ownersCount, setOwnersCount] = useState(0);

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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const updateStoryImageOverflow = () => {
      const imageHeight = storyImageRef.current?.offsetHeight ?? 0;
      const viewportHeight = window.innerHeight;
      setStoryImageOverflow(Math.max(imageHeight - viewportHeight, 0));
    };

    updateStoryImageOverflow();
    window.addEventListener("resize", updateStoryImageOverflow);

    const imageEl = storyImageRef.current;
    const needsLoadListener = Boolean(imageEl && !imageEl.complete);
    if (needsLoadListener && imageEl) {
      imageEl.addEventListener("load", updateStoryImageOverflow);
    }

    return () => {
      window.removeEventListener("resize", updateStoryImageOverflow);
      if (needsLoadListener && imageEl) {
        imageEl.removeEventListener("load", updateStoryImageOverflow);
      }
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

  const hintOpacity = 1 - heroPhaseB;
  const gridInteractive = heroPhaseB >= 0.995 && heroPhaseC > 0 && heroPhaseD === 0;

  // STORY PHASES
  const imageEnter = map(storyProgress, 0.6, 0.7);
  const imagePlainScroll = map(storyProgress, 0.7, 0.8);
  const whitePanelIn = map(storyProgress, 0.8, 0.88);
  const line1In = map(storyProgress, 0.14, 0.38);
  const line2In = map(storyProgress, 0.3, 0.56);
  const linesOut = map(storyProgress, 0.66, 0.9);

  const line1Opacity = line1In;
  const line2Opacity = line2In;
  const line1X = (1 - line1In) * 88;
  const line2X = (1 - line2In) * 118;
  const linesOutY = linesOut * -125;

  const parallaxStageY = (1 - imageEnter) * 105;
  const imageScrollY = storyImageOverflow * imagePlainScroll;
  const parallaxImageY = -imageScrollY;
  const parallaxWhiteY = 112 - whitePanelIn * 112;
  const blackCoverIn = map(storyProgress, 0.93, 1.0);
  const storyBlackCoverY = 100 - blackCoverIn * 100;
  const blackFormInteractive = blackCoverIn >= 0.94;
  const formFullyInView = blackCoverIn >= 0.995;
  const borderFill = map(storyProgress, 0.02, 0.5);
  const borderPerimeterFill = borderFill * 4;
  const borderTopFill = clamp(borderPerimeterFill);
  const borderRightFill = clamp(borderPerimeterFill - 1);
  const borderBottomFill = clamp(borderPerimeterFill - 2);
  const borderLeftFill = clamp(borderPerimeterFill - 3);

  const countdownTargetMs = getNextMayFirstMs(nowMs);
  const countdownTargetYear = new Date(countdownTargetMs).getFullYear();
  const countdown = getCountdownParts(countdownTargetMs, nowMs);
  const countdownValue = `${countdown.days.toString().padStart(2, "0")}:${countdown.hours
    .toString()
    .padStart(2, "0")}:${countdown.minutes.toString().padStart(2, "0")}:${countdown.seconds
    .toString()
    .padStart(2, "0")}`;

  useEffect(() => {
    if (!formFullyInView) {
      if (ownersCounterRafRef.current !== 0) {
        window.cancelAnimationFrame(ownersCounterRafRef.current);
        ownersCounterRafRef.current = 0;
      }
      ownersCounterStartedRef.current = false;
      setOwnersCount(0);
      return;
    }

    if (ownersCounterStartedRef.current) return;
    ownersCounterStartedRef.current = true;

    const durationMs = 4000;
    const targetCount = 32;
    const startMs = performance.now();

    const tick = (now: number) => {
      const progress = clamp((now - startMs) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setOwnersCount(Math.round(targetCount * eased));

      if (progress < 1) {
        ownersCounterRafRef.current = window.requestAnimationFrame(tick);
      } else {
        ownersCounterRafRef.current = 0;
      }
    };

    ownersCounterRafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (ownersCounterRafRef.current !== 0) {
        window.cancelAnimationFrame(ownersCounterRafRef.current);
        ownersCounterRafRef.current = 0;
      }
    };
  }, [formFullyInView]);

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
          <div className="story-border-marquee" aria-hidden="true" style={{ transform: `translateY(${linesOutY}vh)` }}>
            <div className="story-border-segment story-border-top" style={{ width: `${borderTopFill * 100}%` }}>
              <span>{CITY_BORDER_LOOP}</span>
            </div>
            <div className="story-border-segment story-border-right" style={{ height: `${borderRightFill * 100}%` }}>
              <span>{CITY_BORDER_LOOP}</span>
            </div>
            <div className="story-border-segment story-border-bottom" style={{ width: `${borderBottomFill * 100}%` }}>
              <span>{CITY_BORDER_LOOP}</span>
            </div>
            <div className="story-border-segment story-border-left" style={{ height: `${borderLeftFill * 100}%` }}>
              <span>{CITY_BORDER_LOOP}</span>
            </div>
          </div>

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
              transform: `translateY(${parallaxStageY}vh)`
            }}
          >
            <img
              ref={storyImageRef}
              className="story-parallax-image"
              src={secretArtImage}
              alt="The secret art of sunglasses"
              style={{ transform: `translateY(${parallaxImageY}px)` }}
            />
            <div className="story-parallax-white" style={{ transform: `translateY(${parallaxWhiteY}%)` }} />
          </div>

          <div className="story-countdown" style={{ transform: `translateY(${parallaxWhiteY}%)` }}>
            <p className="countdown-kicker">Countdown to May 1, {countdownTargetYear}</p>
            <p className="countdown-value">{countdownValue}</p>
            <p className="countdown-units">DAY : HOUR : MINUTE : SECOND</p>
          </div>

          <div
            className="story-black-cover"
            style={{
              transform: `translateY(${storyBlackCoverY}%)`,
              pointerEvents: blackFormInteractive ? "auto" : "none"
            }}
          >
            <div className="join-cta">
              <h3>Do you want to be one of the first 1000 owners?</h3>
              <form className="cta-form cta-form-inverse" onSubmit={(event) => event.preventDefault()}>
                <input type="email" placeholder="Register here with your email" required />
                <button type="submit">Register</button>
              </form>
              <p className="owners-counter">
                {ownersCount}/1000
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
