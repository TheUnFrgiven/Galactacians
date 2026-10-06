/**
 * The question view: a big problem, a number pad, a hint after the first mistake
 * and the worked answer after the second. Resolves with how it went.
 */
import { isCorrect } from "../core/questions.js";
import { mathPicture, icon, towerArt } from "./art.js";
import { TOWERS } from "../core/content.js";
import { sfx, speak } from "./audio.js";

const box = (value, blank, typed) =>
  blank ? `<span class="eq-blank">${typed || "?"}</span>` : `<span class="eq-num">${value}</span>`;

function equation(q, typed) {
  return `${box(q.left, q.blank === "left", typed)}<span class="eq-op">${q.op}</span>${box(q.right, q.blank === "right", typed)}<span class="eq-op">=</span>${box(q.result, q.blank === "result", typed)}`;
}

export function askQuestion(container, card) {
  const q = card.question;
  const tower = TOWERS[card.tower.type];
  const started = performance.now();
  let typed = "";
  let attempts = 0;
  let hinted = false;
  let showing = false; // the answer has been shown; the child copies it
  let done = false;

  container.innerHTML = `
    <div class="question tier-${card.tier}">
      <div class="q-top">
        <span class="tier-tag">${{ bronze: "Easy", silver: "Medium", gold: "Hard" }[card.tier]}</span>
        <span class="q-prize">${towerArt(card.tower.type, card.tower.level)}<b>${tower.name}</b></span>
        <button class="q-speak round-btn" type="button" aria-label="Hear it again">${icon("speak")}</button>
      </div>
      <div class="q-eq" aria-live="polite">${equation(q, "")}</div>
      <div class="q-picture">${q.showPicture ? mathPicture(q.visual) : ""}</div>
      <div class="q-hint" hidden></div>
      <div class="numpad">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" data-key="${n}">${n}</button>`).join("")}
        <button type="button" data-key="back" aria-label="Delete">${icon("erase")}</button>
        <button type="button" data-key="0">0</button>
        <button type="button" data-key="ok" class="ok" aria-label="Check">${icon("check")}</button>
      </div>
      <button class="q-hint-btn" type="button">${icon("bulb")} Help me</button>
    </div>`;
  const $ = (s) => container.querySelector(s);
  const render = () => {
    $(".q-eq").innerHTML = equation(q, typed);
  };
  const showHint = (withAnswer = false) => {
    const el = $(".q-hint");
    el.hidden = false;
    el.innerHTML = `<p>${withAnswer ? `The answer is <b>${q.answer}</b>. ${q.explanation}. Type <b>${q.answer}</b> to finish.` : q.hint}</p>${mathPicture({ ...q.visual, answer: withAnswer })}`;
    $(".q-picture").innerHTML = "";
    $(".q-hint-btn").hidden = true;
    speak(withAnswer ? `The answer is ${q.answer}. Type ${q.answer}.` : q.hint);
  };

  return new Promise((resolve) => {
    const finish = (outcome) => {
      done = true;
      cleanup();
      container.querySelector(".question").classList.add("solved");
      sfx.correct();
      speak(outcome === "first" ? "Yes! Great job!" : "That's it!");
      setTimeout(() => resolve({ outcome, attempts, ms: performance.now() - started, hinted }), 750);
    };
    const check = () => {
      if (done || typed === "") return;
      const right = isCorrect(q, typed);
      if (showing) {
        if (right) finish("shown");
        else {
          typed = "";
          render();
          sfx.wrong();
        }
        return;
      }
      attempts += 1;
      if (right) {
        render();
        finish(attempts === 1 ? "first" : "retry");
        return;
      }
      sfx.wrong();
      const wobble = $(".q-eq");
      wobble.classList.remove("wobble");
      void wobble.offsetWidth;
      wobble.classList.add("wobble");
      typed = "";
      render();
      if (attempts === 1) showHint(false);
      else {
        showing = true;
        showHint(true);
      }
    };
    const press = (key) => {
      if (done) return;
      sfx.tap();
      if (key === "ok") return check();
      if (key === "back") typed = typed.slice(0, -1);
      else if (typed.length < 3) typed += key;
      render();
    };
    const onClick = (e) => {
      const btn = e.target.closest("[data-key]");
      if (btn) press(btn.dataset.key);
      if (e.target.closest(".q-speak")) speak(q.say);
      if (e.target.closest(".q-hint-btn")) {
        hinted = true;
        showHint(false);
      }
    };
    const onKey = (e) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("back");
      else if (e.key === "Enter") press("ok");
    };
    const cleanup = () => {
      container.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
    container.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    speak(q.say);
  });
}
