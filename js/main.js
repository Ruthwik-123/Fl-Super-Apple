import { Experience } from "./experience.js";

const canvas = document.getElementById("stage");
const loader = document.getElementById("loader");
const chapters = document.getElementById("chapters");
const sections = Array.from(document.querySelectorAll(".chapter"));
const chapterNames = ["Face", "Titanium", "Display", "Controls", "Optics", "Armor", "Cell", "Core", "Link", "Close"];

chapterNames.forEach((name, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.title = name;
  button.setAttribute("aria-label", `Go to ${name} chapter`);
  button.addEventListener("click", () => sections[index]?.scrollIntoView({ behavior: "smooth", block: "center" }));
  chapters.appendChild(button);
});

try {
  const experience = new Experience(canvas);
  window.__ispy = experience;
  requestAnimationFrame(() => requestAnimationFrame(() => loader.classList.add("is-gone")));

  document.querySelectorAll("a[href^='#']").forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
} catch (error) {
  console.error("Unable to start the 3D product story", error);
  document.documentElement.classList.add("no-webgl");
  loader.classList.add("is-gone");
}
