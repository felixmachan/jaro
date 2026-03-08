const heroSection = document.getElementById("heroSection");
const heroStage = document.getElementById("heroStage");
const storySection = document.getElementById("storySection");

const grid = document.getElementById("grid");
const title = document.getElementById("title");
const hint = document.getElementById("heroHint");
const line1 = document.getElementById("line1");
const line2 = document.getElementById("line2");
const cta = document.getElementById("cta");
const tileImages = document.querySelectorAll(".tile img");

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const map = (value, inMin, inMax) => clamp((value - inMin) / (inMax - inMin));

function animateHero() {
  const rect = heroSection.getBoundingClientRect();
  const maxScroll = Math.max(heroSection.offsetHeight - window.innerHeight, 1);
  const progress = clamp(-rect.top / maxScroll);

  // Phase A: title rises and fades
  const phaseA = map(progress, 0.0, 0.26);
  // Phase B: grid scales up + blur disappears
  const phaseB = map(progress, 0.12, 0.50);
  // Phase C: hover hold while grid is fully revealed
  const phaseC = map(progress, 0.50, 0.72);
  // Phase D: only grid exits upward
  const phaseD = map(progress, 0.72, 0.92);
  // Phase E: final fade
  const phaseE = map(progress, 0.92, 1.0);

  title.style.transform = `translate(-50%, calc(-50% - ${phaseA * 55}vh))`;
  title.style.opacity = `${1 - phaseA * 1.2}`;

  const gridScale = 0.84 + phaseB * 0.16;
  const gridY = phaseD * -160;
  const gridOpacity = 1 - phaseE;
  grid.style.transform = `translate(-50%, calc(-50% + ${gridY}px)) scale(${gridScale})`;
  grid.style.opacity = `${gridOpacity}`;

  const blur = 7 - phaseB * 7;
  const imgScale = 0.9 + phaseB * 0.1;
  tileImages.forEach((img) => {
    img.style.filter = `grayscale(100%) blur(${Math.max(blur, 0).toFixed(2)}px)`;
    img.style.transform = `scale(${imgScale.toFixed(3)})`;
  });

  const hintFade = map(progress, 0.68, 0.9);
  hint.style.opacity = `${1 - hintFade}`;

  const interactive = phaseB >= 0.995 && phaseC > 0 && phaseD === 0;
  heroStage.classList.toggle("is-interactive", interactive);
}

function animateStory() {
  const rect = storySection.getBoundingClientRect();
  const maxScroll = Math.max(storySection.offsetHeight - window.innerHeight, 1);
  const progress = clamp(-rect.top / maxScroll);

  const line1In = map(progress, 0.30, 0.47);
  const line2In = map(progress, 0.47, 0.64);
  const linesOut = map(progress, 0.64, 0.77);
  const ctaIn = map(progress, 0.80, 0.95);

  line1.style.opacity = `${line1In * (1 - linesOut)}`;
  line1.style.transform = `translateX(${(1 - line1In) * 90 - linesOut * 70}vw)`;

  line2.style.opacity = `${line2In * (1 - linesOut)}`;
  line2.style.transform = `translateX(${-(1 - line2In) * 90 - linesOut * 70}vw)`;

  cta.style.opacity = `${ctaIn}`;
  cta.style.transform = `translate(-50%, ${90 - ctaIn * 90}%)`;
  cta.style.pointerEvents = ctaIn > 0.6 ? "auto" : "none";
}

function animate() {
  animateHero();
  animateStory();
}

animate();
window.addEventListener("scroll", animate, { passive: true });
window.addEventListener("resize", animate);
