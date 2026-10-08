import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./FlowingMenu.css";

export default function FlowingMenu({
  items = [],
  speed = 18,
  textColor = "#302f2c",
  bgColor = "#f5f0e7",
  marqueeBgColor = "#68745a",
  marqueeTextColor = "#fbf8f1",
  borderColor = "#dcd4c5",
  onSelect,
}) {
  return (
    <div className="menu-wrap" style={{ backgroundColor: bgColor }}>
      <nav className="menu" aria-label="Site pages">
        {items.map((item) => (
          <MenuItem
            key={item.link}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            onSelect={onSelect}
          />
        ))}
      </nav>
    </div>
  );
}

function MenuItem({
  link,
  text,
  image,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
  onSelect,
}) {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const animationRef = useRef(null);
  const [repetitions, setRepetitions] = useState(4);

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;
      const touchFirst = window.matchMedia?.("(hover: none), (pointer: coarse)").matches;
      if (touchFirst) {
        setRepetitions(1);
        return;
      }
      const part = marqueeInnerRef.current.querySelector(".marquee__part");
      const partWidth = part?.getBoundingClientRect().width;
      if (!Number.isFinite(partWidth) || partWidth <= 0) {
        setRepetitions(1);
        return;
      }
      const count = Math.ceil(window.innerWidth / partWidth) + 2;
      setRepetitions(Math.max(4, Math.min(32, Number.isFinite(count) ? count : 4)));
    };
    calculateRepetitions();
    window.addEventListener("resize", calculateRepetitions);
    return () => window.removeEventListener("resize", calculateRepetitions);
  }, [text, image]);

  useEffect(() => {
    // Touch menus do not need an idle marquee loop. Keeping every row animating
    // in the background can overwhelm mobile browsers before the menu is usable.
    if (window.matchMedia?.("(hover: none), (pointer: coarse)").matches) return undefined;
    const timer = window.setTimeout(() => {
      const part = marqueeInnerRef.current?.querySelector(".marquee__part");
      if (!part || !part.offsetWidth || !marqueeInnerRef.current) return;
      animationRef.current?.kill();
      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -part.offsetWidth,
        duration: speed,
        ease: "none",
        repeat: -1,
      });
    }, 50);
    return () => {
      window.clearTimeout(timer);
      animationRef.current?.kill();
    };
  }, [text, image, repetitions, speed]);

  const findClosestEdge = (x, y, width, height) => {
    const topDistance = (x - width / 2) ** 2 + y ** 2;
    const bottomDistance = (x - width / 2) ** 2 + (y - height) ** 2;
    return topDistance < bottomDistance ? "top" : "bottom";
  };

  const showMarquee = (event) => {
    if (window.matchMedia?.("(hover: none), (pointer: coarse)").matches) return;
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = Number.isFinite(event.clientX) ? event.clientX - rect.left : rect.width / 2;
    const y = Number.isFinite(event.clientY) ? event.clientY - rect.top : rect.height / 2;
    const edge = findClosestEdge(x, y, rect.width, rect.height);
    gsap.timeline({ defaults: { duration: 0.6, ease: "expo.out" } })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
  };

  const hideMarquee = (event) => {
    if (window.matchMedia?.("(hover: none), (pointer: coarse)").matches) return;
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = Number.isFinite(event.clientX) ? event.clientX - rect.left : rect.width / 2;
    const y = Number.isFinite(event.clientY) ? event.clientY - rect.top : rect.height / 2;
    const edge = findClosestEdge(x, y, rect.width, rect.height);
    gsap.timeline({ defaults: { duration: 0.6, ease: "expo.out" } })
      .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .to(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
  };

  return (
    <div className="menu__item" ref={itemRef} style={{ borderColor }}>
      <a
        className="menu__item-link"
        href={link}
        style={{ color: textColor }}
        onMouseEnter={showMarquee}
        onMouseLeave={hideMarquee}
        onFocus={showMarquee}
        onBlur={hideMarquee}
        onClick={onSelect}
      >
        {text}
      </a>
      <div className="marquee" ref={marqueeRef} style={{ backgroundColor: marqueeBgColor }} aria-hidden="true">
        <div className="marquee__inner-wrap">
          <div className="marquee__inner" ref={marqueeInnerRef}>
            {Array.from({ length: repetitions }, (_, index) => (
              <div className="marquee__part" key={index} style={{ color: marqueeTextColor }}>
                <span>{text}</span>
                <div className="marquee__img" style={{ backgroundImage: `url(${image})` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
