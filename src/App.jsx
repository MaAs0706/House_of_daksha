import { useEffect, useState } from "react";
import GallerySection from "./components/GallerySection.jsx";

const asset = (filename) => `${import.meta.env.BASE_URL}images/${filename}`;

const collections = {
  cotton: {
    number: "COLLECTION 01",
    label: "THE EVERYDAY EDIT",
    firstLine: "Make the ordinary",
    secondLine: "feel like yours.",
    description:
      "Breathable cotton dresses for the long list of things you do—and the small moments you keep for yourself.",
    signoff: "Soft on skin. Easy on the day.",
    link: "Why cotton, chosen well",
    destination: "#our-thought",
  },
  coords: {
    number: "COLLECTION 02",
    label: "THE OUT-THE-DOOR EDIT",
    firstLine: "A little match.",
    secondLine: "A lot less fuss.",
    description:
      "Easy co-ords that feel put-together without asking you to plan the whole morning around getting dressed.",
    signoff: "One thought. Two pieces. Out the door.",
    link: "Why ease belongs in the wardrobe",
    destination: "#our-thought",
  },
  maternity: {
    number: "COLLECTION 03",
    label: "THE MOTHERHOOD EDIT",
    firstLine: "Room to grow.",
    secondLine: "Still room to be you.",
    description:
      "Comfortable, flattering maternity wear to help you feel like yourself as your body and your days change.",
    signoff: "Made for the chapter you’re in.",
    link: "A note for this new chapter",
    destination: "#motherhood",
  },
};

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 100 100" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M50 78C46 59 27 56 27 39c0-13 14-17 23-1 9-16 23-12 23 1 0 17-19 20-23 39Z" />
        <path d="M50 78C43 59 31 53 17 55c9 9 13 18 16 28m17-5c7-19 19-25 33-23-9 9-13 18-16 28M50 78c-6 8-14 12-25 12m25-12c6 8 14 12 25 12M50 78V38m0 0c-5-8-12-12-21-13m21 13c5-8 12-12 21-13" />
        <path d="M28 25c-2-7 1-12 8-15m28 0c7 3 10 8 8 15" />
      </g>
      <circle cx="50" cy="49" r="2" fill="currentColor" />
    </svg>
  );
}

function PetalField() {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const mobileViewport = window.matchMedia("(max-width: 650px)");

    const makePetals = () => {
      if (motionPreference.matches) {
        setPetals([]);
        return;
      }

      const count = mobileViewport.matches ? 9 : 16;
      setPetals(
        Array.from({ length: count }, (_, index) => ({
          id: `${index}-${Math.random()}`,
          variant: index % 3,
          left: `${4 + Math.random() * 92}%`,
          top: `${-10 + Math.random() * 20}%`,
          duration: `${16 + Math.random() * 17}s`,
          delay: `${-Math.random() * 32}s`,
          alpha: 0.2 + Math.random() * 0.12,
          swayA: `${-70 + Math.random() * 140}px`,
          swayB: `${-65 + Math.random() * 130}px`,
          sway: `${-80 + Math.random() * 160}px`,
          width: `${8 + Math.random() * 7}px`,
          height: `${12 + Math.random() * 10}px`,
        })),
      );
    };

    makePetals();
    motionPreference.addEventListener("change", makePetals);
    mobileViewport.addEventListener("change", makePetals);

    return () => {
      motionPreference.removeEventListener("change", makePetals);
      mobileViewport.removeEventListener("change", makePetals);
    };
  }, []);

  return (
    <div className="petal-field" aria-hidden="true">
      {petals.map((petal) => (
        <span
          className={`petal petal-${petal.variant}`}
          key={petal.id}
          style={{
            left: petal.left,
            top: petal.top,
            "--duration": petal.duration,
            "--delay": petal.delay,
            "--alpha": petal.alpha,
            "--sway-a": petal.swayA,
            "--sway-b": petal.swayB,
            "--sway": petal.sway,
            "--petal-width": petal.width,
            "--petal-height": petal.height,
          }}
        />
      ))}
    </div>
  );
}

function SiteHeader() {
  return (
    <>
      <div className="top-note">
        <span>HOUSE OF DAKSHA</span>
        <i aria-hidden="true">✳</i>
        <span>GOOD COTTON. GOOD DAYS.</span>
      </div>
      <header className="masthead">
        <a className="brand-lockup" href="#top" aria-label="House of Daksha home">
          <BrandMark />
          <span className="brand-caption">A HOUSE FOR EVERY CHAPTER</span>
        </a>
        <nav className="top-nav" aria-label="Main navigation">
          <a href="#gallery">Gallery</a>
          <a href="#bloom">Find your feeling</a>
          <a href="#our-thought">Our thought</a>
          <a href="#motherhood">Motherhood</a>
        </nav>
        <a className="nav-note" href="#bloom">
          THE DAKSHA EDIT <span aria-hidden="true">↘</span>
        </a>
      </header>
    </>
  );
}

function Hero() {
  return (
    <section className="hero-v2" id="top">
      <div className="hero-words">
        <p className="hero-overline">
          <span /> CLOTHES FOR A LIFE IN MOTION
        </p>
        <h1>
          <span className="hero-hushed">A little room</span>
          <br />
          <small>to</small> <em>bloom.</em>
        </h1>
        <p className="hero-deck">
          Cotton that breathes. Shapes that move with you. Thoughtfully
          handpicked for all the little and life-changing things in a day.
        </p>
        <a className="hero-link" href="#bloom">
          <span>Step into our world</span>
          <b aria-hidden="true">↓</b>
        </a>
        <div className="hero-aside">
          <span>01</span>
          <i />
          <span>SOFTNESS IN EVERY DIRECTION</span>
        </div>
      </div>
      <div className="hero-image-wrap">
        <div className="photo-frame">
          <img
            src={asset("hero-cotton-fashion.jpg")}
            alt="Woman in a sage cotton dress enjoying a quiet, sunlit moment"
            fetchPriority="high"
          />
          <span className="photo-caption">THE ART OF EVERYDAY</span>
        </div>
        <div className="image-annotation annotation-top">
          <span className="annotation-star">✳</span>
          <span>
            Picked with care
            <br />
            worn with ease
          </span>
        </div>
        <div className="image-annotation annotation-bottom">
          <span>SOFT</span>
          <small>
            FEEL-GOOD
            <br />
            INTENTION
          </small>
        </div>
      </div>
      <div className="hero-side-label" aria-hidden="true">
        THE EVERYDAY IS WORTH DRESSING FOR
      </div>
    </section>
  );
}

function BloomSection() {
  const [activeCollection, setActiveCollection] = useState("cotton");
  const collection = collections[activeCollection];

  return (
    <section className="bloom-section" id="bloom">
      <div className="bloom-heading">
        <p className="section-kicker">THREE PETALS. A THOUSAND KINDS OF DAY.</p>
        <h2>
          <span>Where are you</span>
          <br />
          <em>in your day?</em>
        </h2>
        <p>Choose a petal. We’ll meet you there.</p>
      </div>
      <div className="bloom-experience">
        <div className="bloom-wheel" role="group" aria-label="Choose a collection">
          <svg className="bloom-stem" viewBox="0 0 480 440" aria-hidden="true">
            <path d="M240 232C238 286 244 336 266 408" />
            <path d="M250 342c-48-38-82-32-98-15 35 1 64 14 98 31" />
            <path d="M258 373c38-40 72-42 93-29-32 7-59 23-88 46" />
          </svg>
          <button
            className={`bloom-petal bloom-cotton ${activeCollection === "cotton" ? "is-selected" : ""}`}
            type="button"
            aria-pressed={activeCollection === "cotton"}
            onClick={() => setActiveCollection("cotton")}
          >
            <span>
              <small>01</small>
              Everyday
              <br />
              cottons
            </span>
          </button>
          <button
            className={`bloom-petal bloom-coords ${activeCollection === "coords" ? "is-selected" : ""}`}
            type="button"
            aria-pressed={activeCollection === "coords"}
            onClick={() => setActiveCollection("coords")}
          >
            <span>
              <small>02</small>
              Co-ords
              <br />
              to go
            </span>
          </button>
          <button
            className={`bloom-petal bloom-maternity ${activeCollection === "maternity" ? "is-selected" : ""}`}
            type="button"
            aria-pressed={activeCollection === "maternity"}
            onClick={() => setActiveCollection("maternity")}
          >
            <span>
              <small>03</small>
              Motherhood
              <br />
              in bloom
            </span>
          </button>
          <div className="bloom-heart">
            <svg viewBox="0 0 60 60" aria-hidden="true">
              <path d="M30 51C27 39 13 37 13 26c0-8 9-11 17-1 8-10 17-7 17 1 0 11-14 13-17 25Z" />
              <path d="M30 51c-3-12-10-16-20-15 6 6 9 11 11 17m9-2c3-12 10-16 20-15-6 6-9 11-11 17M30 50V25" />
            </svg>
            <span>DAKSHA</span>
          </div>
          <span className="bloom-orbit orbit-one" aria-hidden="true">✳</span>
          <span className="bloom-orbit orbit-two" aria-hidden="true">·</span>
        </div>
        <div className="collection-note" aria-live="polite" aria-atomic="true">
          <p className="collection-number">
            {collection.number} <span>✳</span> {collection.label}
          </p>
          <h3>
            {collection.firstLine}
            <br />
            <em>{collection.secondLine}</em>
          </h3>
          <p className="collection-description">{collection.description}</p>
          <p className="collection-signoff">{collection.signoff}</p>
          <a className="collection-link" href={collection.destination}>
            {collection.link} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className="bloom-instruction">
        <span className="instruction-dot" /> TAP A PETAL TO TURN THE PAGE
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section className="daybook" id="our-thought">
      <div className="daybook-art">
        <div className="daybook-photo">
          <img
            src={asset("cotton-still-life.jpg")}
            alt="Sage cotton fabric with delicate gold embroidery beside a blush flower"
            loading="lazy"
          />
          <span className="daybook-stamp">
            WORN
            <br />
            IN REAL
            <br />
            LIFE
          </span>
        </div>
        <div className="daybook-margin-note">
          A NOTE FROM DAKSHA <span>✳</span>
        </div>
      </div>
      <div className="daybook-copy">
        <p className="section-kicker">A THOUGHT WE KEPT COMING BACK TO</p>
        <h2>
          <span>Why should comfort</span>
          <br />
          <small>ask you to</small> <em>choose?</em>
        </h2>
        <p>
          Everyday clothes were making us pick: quality or affordability.
          Comfort or feeling put-together. We thought you deserved all of it.
        </p>
        <p>
          So we began handpicking soft cottons and easy silhouettes for work,
          errands, slow mornings and the chapters that change everything. No
          fuss. No special occasion needed. Just clothes that feel good to live
          in.
        </p>
        <div className="handwritten-note">
          Here’s to feeling like yourself.
          <br />
          <span>— House of Daksha</span>
        </div>
      </div>
    </section>
  );
}

function MotherhoodSection() {
  return (
    <section className="motherhood-section" id="motherhood">
      <div className="motherhood-backdrop" aria-hidden="true">
        <span className="motherhood-petal petal-a" />
        <span className="motherhood-petal petal-b" />
        <span className="motherhood-petal petal-c" />
        <span className="motherhood-stem" />
      </div>
      <div className="motherhood-copy">
        <p className="section-kicker">FOR THE CHAPTER THAT CHANGES EVERYTHING</p>
        <h2>
          <span>Your body changes.</span>
          <br />
          <em>Your sense of you stays.</em>
        </h2>
        <p>
          Motherhood is its own kind of becoming. We’re here with comfortable,
          flattering pieces that let you step out feeling like yourself—through
          every new beginning.
        </p>
        <a href="#bloom" className="motherhood-link">
          Find your petal <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="motherhood-quote">
        <span className="quote-mark">“</span>
        <p>
          Space to grow.
          <br />
          Room to be you.
        </p>
        <span className="quote-flower">✿</span>
      </div>
      <span className="motherhood-index">
        A NOTE FOR MUMS-TO-BE &amp; NEW MUMS <i>—</i> WITH LOVE
      </span>
    </section>
  );
}

function ClosingSection() {
  return (
    <section className="closing-v2">
      <p className="section-kicker">THE THREAD THAT HOLDS IT ALL TOGETHER</p>
      <h2>
        <small>Comfort looks</small>
        <br />
        <em>good on you.</em>
      </h2>
      <a href="#bloom" className="closing-link">
        Find your kind of day <span aria-hidden="true">↗</span>
      </a>
      <svg viewBox="0 0 200 150" className="closing-flower" aria-hidden="true">
        <path d="M99 127C84 90 46 90 46 61c0-22 28-31 53-4 25-27 53-18 53 4 0 29-38 29-53 66Z" />
        <path d="M99 127c-10-39-30-50-59-47 19 18 26 35 34 56m25-9c10-39 30-50 59-47-19 18-26 35-34 56M99 126V57" />
      </svg>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="footer-v2">
      <a className="footer-wordmark" href="#top">
        HOUSE <i>OF</i> DAKSHA <span>✳</span>
      </a>
      <p>Handpicked for the life you live.</p>
      <nav aria-label="Footer navigation">
        <a href="#bloom">The collections</a>
        <a href="#our-thought">Our thought</a>
        <a href="#motherhood">Motherhood</a>
      </nav>
      <small>© {new Date().getFullYear()} HOUSE OF DAKSHA</small>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <PetalField />
      <SiteHeader />
      <main id="main">
        <Hero />
        <section className="breath-line" aria-label="Our approach">
          <span>Not dressed up.</span>
          <em>Just dressed like yourself.</em>
          <span className="breath-flower" aria-hidden="true">✿</span>
        </section>
        <GallerySection />
        <BloomSection />
        <StorySection />
        <MotherhoodSection />
        <ClosingSection />
      </main>
      <SiteFooter />
    </>
  );
}
