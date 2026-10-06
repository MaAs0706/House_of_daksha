const petalField = document.querySelector(".petal-field");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

if (petalField && !motionPreference.matches) {
  const petalCount = window.matchMedia("(max-width: 650px)").matches ? 6 : 10;
  for (let index = 0; index < petalCount; index += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${4 + Math.random() * 92}%`;
    petal.style.top = `${-10 + Math.random() * 20}%`;
    petal.style.setProperty("--duration", `${18 + Math.random() * 18}s`);
    petal.style.setProperty("--delay", `${-Math.random() * 35}s`);
    petal.style.setProperty("--alpha", `${0.16 + Math.random() * 0.1}`);
    petal.style.setProperty("--sway", `${-35 + Math.random() * 70}px`);
    petal.style.setProperty("--petal-width", `${5 + Math.random() * 6}px`);
    petal.style.setProperty("--petal-height", `${8 + Math.random() * 8}px`);
    petalField.append(petal);
  }
}

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

const collectionCopy = {
  cotton: {
    number: "COLLECTION 01",
    label: "THE EVERYDAY EDIT",
    title: "Make the ordinary<br /><em>feel like yours.</em>",
    description: "Breathable cotton dresses for the long list of things you do—and the small moments you keep for yourself.",
    signoff: "Soft on skin. Easy on the day.",
    link: "Why cotton, chosen well",
    destination: "#our-thought",
  },
  coords: {
    number: "COLLECTION 02",
    label: "THE OUT-THE-DOOR EDIT",
    title: "A little match.<br /><em>A lot less fuss.</em>",
    description: "Easy co-ords that feel put-together without asking you to plan the whole morning around getting dressed.",
    signoff: "One thought. Two pieces. Out the door.",
    link: "Why ease belongs in the wardrobe",
    destination: "#our-thought",
  },
  maternity: {
    number: "COLLECTION 03",
    label: "THE MOTHERHOOD EDIT",
    title: "Room to grow.<br /><em>Still room to be you.</em>",
    description: "Comfortable, flattering maternity wear to help you feel like yourself as your body and your days change.",
    signoff: "Made for the chapter you’re in.",
    link: "A note for this new chapter",
    destination: "#motherhood",
  },
};

const collectionButtons = document.querySelectorAll(".bloom-petal");
const collectionNote = document.querySelector(".collection-note");

collectionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const content = collectionCopy[button.dataset.collection];
    if (!content) return;

    collectionButtons.forEach((petal) => {
      const selected = petal === button;
      petal.classList.toggle("is-selected", selected);
      petal.setAttribute("aria-pressed", String(selected));
    });

    if (collectionNote) collectionNote.classList.add("is-changing");
    window.setTimeout(() => {
      document.querySelector("#collection-number").innerHTML = `${content.number} <span>✳</span> ${content.label}`;
      document.querySelector("#collection-title").innerHTML = content.title;
      document.querySelector("#collection-description").textContent = content.description;
      document.querySelector("#collection-signoff").textContent = content.signoff;
      const link = document.querySelector("#collection-link");
      link.innerHTML = `${content.link} <span aria-hidden="true">↗</span>`;
      link.href = content.destination;
      if (collectionNote) collectionNote.classList.remove("is-changing");
    }, 150);
  });
});
