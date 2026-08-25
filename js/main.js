import { Experience } from "./experience.js";

const canvas = document.getElementById("stage");
const loader = document.getElementById("loader");
const chaptersEl = document.getElementById("chapters");

const names = [
  "Hero",
  "Titanium",
  "Display",
  "Action",
  "Dive",
  "Satellite",
  "Inside",
  "Bands",
  "Finishes",
  "Close",
];

names.forEach((name, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.title = name;
  b.addEventListener("click", () => {
    const sections = document.querySelectorAll(".chapter");
    sections[i]?.scrollIntoView({ behavior: "auto" });
  });
  chaptersEl.appendChild(b);
});

const exp = new Experience(canvas);
window.__ultra = exp;
loader.classList.add("is-gone");

document.querySelectorAll(".nav a[href^='#']").forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "auto" });
  });
});
