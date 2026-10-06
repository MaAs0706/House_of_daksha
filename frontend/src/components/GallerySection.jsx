import { useEffect, useState } from "react";
import CircularCarousel from "./CircularCarousel.jsx";
import DepthCarousel from "./DepthCarousel.jsx";

const asset = (filename) => `${import.meta.env.BASE_URL}images/${filename}`;

const galleryItems = [
  {
    src: asset("gallery/look-01.jpg"),
    alt: "Model wearing a deep green button-front dress indoors",
    title: "Green, in her element",
    subtitle: "THE EVERYDAY EDIT",
    note: "A familiar favourite, worn her own way.",
  },
  {
    src: asset("gallery/look-02.jpg"),
    alt: "Model in a deep green dress, captured mid-step",
    title: "A day in motion",
    subtitle: "EASY DOES IT",
    note: "A little movement makes the moment.",
  },
  {
    src: asset("gallery/look-03.jpg"),
    alt: "Model wearing a pale blue dress among garden greenery",
    title: "A little blue sky",
    subtitle: "OUT IN THE GREEN",
    note: "A fresh colour for a day spent outside.",
  },
  {
    src: asset("gallery/look-04.jpg"),
    alt: "Model in a pale blue printed dress on a garden path",
    title: "Blue, with room to wander",
    subtitle: "A LITTLE OUTDOORS",
    note: "An easy look for taking the long way round.",
  },
  {
    src: asset("gallery/look-05.jpg"),
    alt: "Model wearing a colourful geometric print dress",
    title: "A print with a point of view",
    subtitle: "PATTERN PLAY",
    note: "Colour, pattern, and a look that feels like her.",
  },
  {
    src: asset("gallery/look-06.jpg"),
    alt: "Model in a plum printed dress in a leafy setting",
    title: "Plum in the garden",
    subtitle: "THE PRINT EDIT",
    note: "A rich shade among soft greens and open air.",
  },
  {
    src: asset("gallery/look-07.jpg"),
    alt: "Model wearing a red printed dress on a veranda",
    title: "A brighter kind of day",
    subtitle: "COLOUR NOTES",
    note: "A warm, confident colour that makes its own moment.",
  },
  {
    src: asset("gallery/look-08.jpg"),
    alt: "Model in a dark button-front dress by a veranda railing",
    title: "A softer shade of dark",
    subtitle: "THE EVERYDAY EDIT",
    note: "Simple, relaxed, and ready for wherever the day leads.",
  },
  {
    src: asset("gallery/look-09.jpg"),
    alt: "Model wearing a geometric print dress in a garden",
    title: "A pattern to remember",
    subtitle: "PATTERN PLAY",
    note: "A favourite print, seen in the middle of a real day.",
  },
  {
    src: asset("gallery/look-10.jpg"),
    alt: "Model wearing a black dress with light floral details outdoors",
    title: "A little detail goes a long way",
    subtitle: "DETAILS IN THE DAYLIGHT",
    note: "Small embroidered touches bring this look to life.",
  },
  {
    src: asset("gallery/look-11.jpg"),
    alt: "Model in a bright yellow printed dress in a garden",
    title: "Sunshine, in dress form",
    subtitle: "COLOUR NOTES",
    note: "A joyful yellow look made for bright afternoons.",
  },
  {
    src: asset("gallery/look-12.jpg"),
    alt: "Model in a black dress with gold-toned motifs by the water",
    title: "A quiet kind of statement",
    subtitle: "THE PRINT EDIT",
    note: "Dark cotton and delicate motifs find their own balance.",
  },
];

const depthCarouselItems = galleryItems.map(({ src, alt }) => ({ image: src, alt }));

function GalleryMark() {
  return (
    <svg className="gallery-mark" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 80C45 59 28 55 28 39c0-12 13-17 22-2 9-15 22-10 22 2 0 16-17 20-22 41Z" />
      <path d="M50 79V38m0 41c-8-15-19-23-34-23 9 8 14 18 17 28m17-5c8-15 19-23 34-23-9 8-14 18-17 28" />
    </svg>
  );
}

export default function GallerySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 650px)").matches,
  );
  const activeItem = galleryItems[activeIndex] ?? galleryItems[0];

  useEffect(() => {
    const viewport = window.matchMedia("(max-width: 650px)");
    const updateLayout = (event) => setIsMobile(event.matches);
    setIsMobile(viewport.matches);
    viewport.addEventListener("change", updateLayout);
    return () => viewport.removeEventListener("change", updateLayout);
  }, []);

  return (
    <section className="gallery-section" id="gallery">
      <div className="gallery-heading">
        <p className="section-kicker">A LITTLE LOOK AROUND THE DAKSHA WORLD</p>
        <h2>
          Worn in real life.
          <br />
          <em>Remembered for how it feels.</em>
        </h2>
        <p className="gallery-intro">
          A few favourite textures, moods and moments. Take a slow look around.
        </p>
      </div>

      <div className="gallery-carousel-wrap">
        <div className="gallery-thread gallery-thread-left" aria-hidden="true" />
        <div className="gallery-carousel-frame">
          {isMobile ? (
            <DepthCarousel
              items={depthCarouselItems}
              cardWidth={280}
              cardHeight={344}
              radius={5}
              tint="#46513f"
              depth={190}
              spread={78}
              tilt={16}
              tiltDirection="right"
              perspective={1300}
              visibleCards={3}
              falloff={0.16}
              blur={1.5}
              autoplay={false}
              loop
              onChange={setActiveIndex}
              className="daksha-depth-carousel"
            />
          ) : (
            <CircularCarousel
              items={galleryItems}
              preset="cylinder"
              intro="rise"
              cardWidth={440}
              aspectRatio={0.92}
              gap={22}
              autoplay="drift"
              speed={6}
              direction="right"
              draggable
              momentum={0.48}
              snap
              pauseOnHover
              focusOnClick
              parallax={0.16}
              stretch={0.2}
              depthFade={0.24}
              fadeColor="#e8e8de"
              innerShade={0.28}
              cornerRadius={4}
              captions={false}
              onChange={setActiveIndex}
              onItemClick={(_, index) => setActiveIndex(index)}
              className="daksha-carousel"
            />
          )}
        </div>
        <div className="gallery-thread gallery-thread-right" aria-hidden="true" />
        <GalleryMark />
      </div>

      <div className="gallery-feature" aria-live="polite" aria-atomic="true">
        <div className="gallery-feature-index">
          <span>LOOK</span>
          <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
          <i />
          <span>{String(galleryItems.length).padStart(2, "0")}</span>
        </div>
        <div className="gallery-feature-title">
          <p>{activeItem.subtitle}</p>
          <h3>{activeItem.title}</h3>
        </div>
        <p className="gallery-feature-note">{activeItem.note}</p>
        <p className="gallery-instruction">
          {isMobile ? "SWIPE TO WANDER" : "DRAG TO WANDER"} <span aria-hidden="true">✳</span> {isMobile ? "TAP A LOOK TO BRING IT FORWARD" : "CLICK A LOOK TO BRING IT FORWARD"}
        </p>
      </div>
    </section>
  );
}
