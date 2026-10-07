import { useEffect, useRef, useState } from "react";
import GallerySection from "./components/GallerySection.jsx";
import FlowingMenu from "./components/FlowingMenu.jsx";
import { ShopCatalogPage, CollectionDirectory, CollectionDetailPage, ProductDetailPage } from "./components/CatalogPages.jsx";
import { AdminLoginPage, AdminDashboardPage } from "./components/AdminPages.jsx";

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

function DakshaIntro({ onEnter }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const closeTimer = window.setTimeout(() => setIsClosing(true), 3100);
    return () => window.clearTimeout(closeTimer);
  }, []);

  useEffect(() => {
    if (!isClosing) return undefined;
    const enterTimer = window.setTimeout(onEnter, 680);
    return () => window.clearTimeout(enterTimer);
  }, [isClosing, onEnter]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsClosing(true);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <section className={`daksha-intro ${isClosing ? "is-closing" : ""}`} role="dialog" aria-modal="true" aria-label="House of Daksha opening">
      <button className="intro-skip" type="button" onClick={() => setIsClosing(true)}>
        ENTER THE HOUSE <span aria-hidden="true">↗</span>
      </button>
      <div className="intro-composition">
        <p className="intro-kicker"><span /> A HOUSE FOR EVERY CHAPTER <span /></p>
        <div className="intro-nameplate">
          <span>THOUGHTFULLY HANDPICKED</span>
          <h1>HOUSE <i>OF</i> DAKSHA</h1>
        </div>
        <div className="intro-swatch">
          <img src={asset("cotton-still-life.jpg")} alt="" />
          <svg className="intro-stitch" viewBox="0 0 900 360" preserveAspectRatio="none" aria-hidden="true">
            <path className="intro-thread-path" d="M-20 290C108 290 89 76 219 111s112 150 202 88 100-108 177-75 89 118 173 66 95-114 151-142" />
            <path className="intro-thread-flower" d="M420 175c-35-29-15-66 14-58 5-36 52-32 53 4 33-12 57 27 27 52 12 34-27 57-52 30-33 14-59-11-42-28Z" />
            <circle className="intro-thread-center" cx="468" cy="175" r="9" />
          </svg>
          <span className="intro-swatch-edge" aria-hidden="true" />
          <div className="intro-mark"><BrandMark /></div>
        </div>
        <div className="intro-signoff">
          <p>GOOD COTTON. GOOD DAYS.</p>
          <span>A little room to bloom.</span>
        </div>
      </div>
      <div className="intro-corner-note" aria-hidden="true">MADE TO FEEL LIKE YOU <i>✳</i></div>
    </section>
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

function SiteHeader({ page }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggleRef = useRef(null);
  const menuCloseRef = useRef(null);
  const shopLinks = [
    ["Daily wear Kurti / Dresses", "shop/daily-wear"],
    ["Co-Ord Sets", "shop/co-ord-sets"],
    ["Maternity Wear", "shop/maternity-wear"],
    ["All collections", "collections"],
  ];
  const links = [
    ["Home", "home"],
    ["Shop", "shop"],
    ["On Sale!", "sale"],
    ["About Us", "about"],
    ["Contact Us", "contact"],
    ["Product Care", "care"],
    ["Gallery", "gallery"],
  ];
  const flowingItems = [...links.slice(0, 2), ...shopLinks, ...links.slice(2), ["Admin login", "admin/login"]].map(([text, route], index) => ({
    text,
    link: `#/${route}`,
    image: asset(`gallery/look-${String(index === 10 ? 12 : (index % 12) + 1).padStart(2, "0")}.jpg`),
  }));

  useEffect(() => {
    if (!menuOpen) return undefined;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuCloseRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        window.requestAnimationFrame(() => menuToggleRef.current?.focus());
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    window.requestAnimationFrame(() => menuToggleRef.current?.focus());
  };

  return (
    <>
      <div className="top-note">
        <span>HOUSE OF DAKSHA</span>
        <i aria-hidden="true">✳</i>
        <span>GOOD COTTON. GOOD DAYS.</span>
      </div>
      <header className="masthead">
        <a className="brand-lockup" href="#/home" aria-label="House of Daksha home">
          <BrandMark />
          <span className="brand-caption">A HOUSE FOR EVERY CHAPTER</span>
        </a>
        <nav className="top-nav" aria-label="Main navigation">
          {links.map(([label, route]) => route === "shop" ? (
            <div className="nav-shop-item" key={route}>
              <a href="#/shop" aria-current={page === "shop" ? "page" : undefined}>Shop <span className="nav-shop-chevron" aria-hidden="true" /></a>
              <div className="nav-shop-submenu">
                {shopLinks.map(([subLabel, subRoute]) => <a href={`#/${subRoute}`} key={subRoute}>{subLabel}</a>)}
              </div>
            </div>
          ) : (
            <a href={`#/${route}`} key={route} aria-current={route === page ? "page" : undefined}>{label}</a>
          ))}
        </nav>
        <a className="nav-note admin-login-link" href="#/admin/login">
          ADMIN LOGIN <span aria-hidden="true">↗</span>
        </a>
        <button
          ref={menuToggleRef}
          className="mobile-menu-toggle"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen(true)}
        >
          <span>MENU</span><i aria-hidden="true"><b /><b /></i>
        </button>
      </header>
      {menuOpen && (
        <div className="mobile-flow-overlay" role="dialog" aria-modal="true" aria-label="Site navigation">
          <div className="mobile-flow-head">
            <a className="mobile-flow-brand" href="#/home" onClick={closeMenu}>
              HOUSE <span>OF</span> DAKSHA
            </a>
            <button ref={menuCloseRef} className="mobile-flow-close" type="button" aria-label="Close navigation menu" onClick={closeMenu}>×</button>
          </div>
          <FlowingMenu items={flowingItems} onSelect={closeMenu} />
        </div>
      )}
    </>
  );
}

function Hero({ introActive = false }) {
  const [animateEntrance] = useState(() => {
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    if (new URLSearchParams(window.location.search).get("intro") === "1") return true;
    try { return !window.sessionStorage.getItem("daksha-hero-intro-seen"); }
    catch { return true; }
  });

  useEffect(() => {
    if (!animateEntrance) return;
    if (new URLSearchParams(window.location.search).get("intro") === "1") return;
    try { window.sessionStorage.setItem("daksha-hero-intro-seen", "true"); } catch {}
  }, [animateEntrance]);

  return (
    <section className={`hero-v2 ${animateEntrance && !introActive ? "is-entering" : ""}`} id="top">
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
        <svg className="hero-entry-vine" viewBox="0 0 380 620" aria-hidden="true">
          <path className="entry-vine-stem" d="M15 605C82 533 33 469 96 398S143 268 84 211 136 93 319 18" />
          <path className="entry-vine-leaves" d="M91 402c-42-4-60-29-57-56 31 3 51 23 57 56Zm5-5c8-34 31-49 56-43-7 27-27 43-56 43ZM91 245c-38-7-51-33-44-58 29 5 46 25 44 58Zm2-5c10-31 34-42 57-32-10 24-30 36-57 32Zm60-103c-29-14-35-39-21-60 23 11 33 34 21 60Zm1-4c18-24 43-28 62-12-15 19-37 24-62 12Z" />
          <path className="entry-vine-blossom" d="M49 520c-19-15-8-35 7-31 3-19 27-18 28 2 18-7 31 14 15 28 7 17-14 30-28 16-17 7-31-6-22-15Z" />
          <circle className="entry-vine-heart" cx="75" cy="520" r="5" />
        </svg>
        <div className="hero-unfurl-stamp" aria-hidden="true"><BrandMark /></div>
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
          <a className="collection-link" href="#/about">
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
        <p>House of Daksha was founded on a simple realization: everyday wardrobe staples often sacrifice either quality, comfort, or affordability. We set out to create a brand that bridges that gap.</p>
        <p>By sourcing premium, handpicked cotton fabrics and focusing on timeless, versatile silhouettes, we deliver soft, skin-friendly outfits that handle the demands of daily wear—without the high price markups.</p>
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
        <a href="#/collections" className="motherhood-link">
          Explore the collections <span aria-hidden="true">↗</span>
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
      <a href="#/collections" className="closing-link">
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
      <a className="footer-wordmark" href="#/home">
        HOUSE <i>OF</i> DAKSHA <span>✳</span>
      </a>
      <p>Handpicked for the life you live.</p>
      <nav aria-label="Footer navigation">
        <a href="#/shop">Shop</a>
        <a href="#/sale">On Sale!</a>
        <a href="#/collections">Collections</a>
        <a href="#/gallery">Gallery</a>
        <a href="#/about">About Us</a>
        <a href="#/contact">Contact Us</a>
        <a href="#/care">Product care</a>
        <a href="#/admin/login">Admin</a>
      </nav>
      <small>© {new Date().getFullYear()} HOUSE OF DAKSHA</small>
    </footer>
  );
}

function PageIntro({ kicker, title, accent, description }) {
  return (
    <header className="inner-page-intro">
      <p className="section-kicker">{kicker}</p>
      <h1>{title}<br /><em>{accent}</em></h1>
      <p>{description}</p>
    </header>
  );
}

function HomePage({ introActive = false }) {
  return (
    <>
      <Hero introActive={introActive} />
      <section className="breath-line" aria-label="Our approach">
        <span>Not dressed up.</span>
        <em>Just dressed like yourself.</em>
        <span className="breath-flower" aria-hidden="true">✿</span>
      </section>
      <section className="home-brand-intro">
        <div className="home-brand-heading">
          <p className="section-kicker">HOUSE OF DAKSHA</p>
          <h2>Thoughtfully handpicked cottons.<br /><em>Confident maternity wear.</em></h2>
        </div>
        <div className="home-brand-copy">
          <p>We were founded on a simple realization: everyday wardrobe staples often sacrifice either quality, comfort, or affordability. We curate breathable, everyday cotton clothing designed to move with you through every chapter of your day—from bustling work routines and daily errands to the life-changing journey of new motherhood.</p>
          <p>Every piece in our store is chosen with real life in mind: practical maintenance, skin-friendly feel, flattering fits, and price tags that keep effortless style accessible to everyone.</p>
        </div>
      </section>
      <HomeShopCategories />
      <section className="home-discover">
        <div>
          <p className="section-kicker">A LITTLE LOOK AROUND</p>
          <h2>Real days.<br /><em>Real House of Daksha.</em></h2>
        </div>
        <p>See the colours, prints and people who bring our everyday cottons to life.</p>
        <a className="collection-link" href="#/gallery">Step into the gallery <span aria-hidden="true">↗</span></a>
      </section>
      <MotherhoodSection />
      <ClosingSection />
    </>
  );
}

function HomeShopCategories() {
  const categories = [
    ["01", "Daily wear Kurti / Dresses", "Effortless Everyday Cottons", "Breathable, handpicked cotton dresses designed for all-day comfort. From morning meetings to evening errands, stay light, comfortable, and polished without breaking your budget.", "daily-wear"],
    ["02", "Co-Ord Sets", "Matching Style, Zero Hassle", "Perfectly paired cotton co-ords for work, travel, and casual outings. Easy to style, soft on the skin, and tailored for effortless daily elegance.", "co-ord-sets"],
    ["03", "Maternity Wear", "Comfort & Confidence for New Moms", "Soft, budget-friendly outerwear crafted for expectant and new mothers. Thoughtfully designed to give you flattering fits, easy movement, and total confidence whenever you step out.", "maternity-wear"],
  ];
  return (
    <section className="home-shop-section">
      <header className="home-shop-heading">
        <div><p className="section-kicker">MADE FOR YOUR EVERYDAY</p><h2>Find your kind<br /><em>of comfort.</em></h2></div>
        <a className="sale-note" href="#/sale"><span>THE DAKSHA SALE</span><strong>A little more lovely<br />for a little less. ↗</strong></a>
      </header>
      <div className="home-category-grid">
        {categories.map(([number, label, title, description, slug]) => (
          <a className="home-category-card" href={`#/shop/${slug}`} key={slug}>
            <span className="home-category-number">{number} <i>✳</i></span>
            <span className="home-category-label">{label}</span>
            <h3>{title}</h3>
            <p>{description}</p>
            <b>EXPLORE THIS EDIT <span aria-hidden="true">↗</span></b>
          </a>
        ))}
      </div>
    </section>
  );
}

function CollectionsPage() {
  return (
    <div className="inner-page collections-page">
      <PageIntro
        kicker="THREE PETALS. A THOUSAND KINDS OF DAY."
        title="Find your kind"
        accent="of everyday."
        description="Choose a collection to find the kind of comfort that feels right for you."
      />
      <BloomSection />
      <CollectionDirectory />
      <div className="collection-page-note">
        <p className="section-kicker">A NOTE FROM DAKSHA</p>
        <p>Every collection begins with the same thought: you deserve to feel comfortable, look like yourself, and stay within budget.</p>
        <a className="collection-link" href="#/about">Read our story <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  );
}

function GalleryPage() {
  return (
    <div className="inner-page gallery-page">
      <GallerySection />
    </div>
  );
}

function AboutPage() {
  return (
    <div className="inner-page about-page">
      <PageIntro
        kicker="THE THOUGHT BEHIND THE CLOTHES"
        title="Comfort, confidence"
        accent="and everyday value."
        description="We set out to bridge the gap between quality, comfort, and affordability. By sourcing premium, handpicked cotton fabrics and choosing timeless, versatile silhouettes, we make soft, skin-friendly outfits for daily life—without high price markups."
      />
      <StorySection />
      <section className="about-offers">
        <p className="section-kicker">WHAT WE OFFER</p>
        <div className="about-offer-grid">
          <article><span aria-hidden="true">🌿</span><p className="section-kicker">HANDPICKED DAILY COTTONS &amp; CO-ORD SETS</p><h2>Easy mornings.<br /><em>Put-together days.</em></h2><p>Whether you need an easy workday look, a polished co-ord set for meetings, or a relaxed dress for casual outings, our daily wear collection focuses on lightweight breathability, clean tailoring, and all-day comfort.</p><a href="#/shop">Explore daily wear ↗</a></article>
          <article><span aria-hidden="true">🤱</span><p className="section-kicker">CONFIDENT, BUDGET-FRIENDLY MATERNITY WEAR</p><h2>Room to grow.<br /><em>Room to be you.</em></h2><p>Motherhood brings incredible change, but your sense of style shouldn't have to take a back seat. Our maternity collection is thoughtfully crafted for flattering, comfortable, easy-to-wear outfits that boost confidence at prices that make sense for a growing family.</p><a href="#/shop/maternity-wear">Explore maternity wear ↗</a></article>
        </div>
      </section>
      <div className="about-values">
        <p><span>01</span><strong>Comfort first.</strong> Breathable fabrics and shapes made for moving through your day.</p>
        <p><span>02</span><strong>Thoughtfully chosen.</strong> Versatile pieces you can make your own, again and again.</p>
        <p><span>03</span><strong>Within reach.</strong> Everyday style at prices that make sense for real life.</p>
      </div>
    </div>
  );
}

function ContactPage() {
  return (
    <div className="inner-page contact-page">
      <PageIntro
        kicker="WE’RE HERE TO HELP"
        title="Let’s have"
        accent="a conversation."
        description="Questions about a collection, sizing or finding the right piece? We’d love to hear what you’re looking for."
      />
      <div className="contact-card">
        <BrandMark />
        <h2>A note to Daksha</h2>
        <p>For product questions, orders or just to say hello, reach out through the contact details below.</p>
        <div className="contact-details">
          <span>EMAIL</span><strong>Contact details coming soon</strong>
          <span>SOCIAL</span><strong>Follow along for new arrivals and updates</strong>
        </div>
      </div>
    </div>
  );
}

function CarePage() {
  return (
    <div className="inner-page care-page">
      <PageIntro
        kicker="PRODUCT CARE"
        title="How to care for"
        accent="your House of Daksha cottons."
        description="Our handpicked cottons are chosen for pure comfort and daily durability. A few gentle habits keep them soft, vibrant, and fitting beautifully wash after wash."
      />
      <div className="care-list">
        {[
          ["01", "Keep it cool", "Wash in cold water using a gentle, mild detergent."],
          ["02", "Shade is your friend", "Dry in the shade to protect the rich color pigments."],
          ["03", "Gentle care", "Avoid tumble drying on high heat to help prevent fabric shrinkage."],
          ["04", "Iron inside out", "A quick warm iron on the reverse side brings back the crisp, fresh look effortlessly."],
        ].map(([number, title, copy]) => (
          <article className="care-step" key={number}>
            <span>{number}</span><div><h2>{title}</h2><p>{copy}</p></div>
          </article>
        ))}
      </div>
      <p className="care-footnote">When in doubt, follow the care label attached to your garment.</p>
    </div>
  );
}

export default function App() {
  const getRoute = () => window.location.hash.replace(/^#\/?/, "").split("?")[0].split("/");
  const [route, setRoute] = useState(getRoute);
  const page = route[0] || "home";
  const [showIntro, setShowIntro] = useState(() => (
    page === "home" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ));

  useEffect(() => {
    const syncPage = () => {
      setRoute(getRoute());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("hashchange", syncPage);
    return () => window.removeEventListener("hashchange", syncPage);
  }, []);

  const pages = {
    home: <HomePage introActive={showIntro} />,
    shop: <ShopCatalogPage category={route[1] || ""} />,
    sale: <ShopCatalogPage onSale />,
    collections: <CollectionsPage />,
    gallery: <GalleryPage />,
    about: <AboutPage />,
    contact: <ContactPage />,
    care: <CarePage />,
  };

  if (page === "admin") {
    return route[1] === "login" ? <AdminLoginPage /> : <AdminDashboardPage />;
  }
  if (page === "collection" && route[1]) return <><PetalField /><SiteHeader page="collections" /><main id="main"><CollectionDetailPage slug={route[1]} /></main><SiteFooter /></>;
  if (page === "product" && route[1]) return <><PetalField /><SiteHeader page="shop" /><main id="main"><ProductDetailPage slug={route[1]} /></main><SiteFooter /></>;

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <PetalField />
      <SiteHeader page={page} />
      <main id="main">{pages[page] ?? <HomePage />}</main>
      <SiteFooter />
      {showIntro && page === "home" && <DakshaIntro onEnter={() => setShowIntro(false)} />}
    </>
  );
}
