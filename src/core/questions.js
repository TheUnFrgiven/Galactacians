/**
 * Facts and questions for the four basic skills. No DOM, no randomness of its own:
 * callers pass a seeded random generator so tests are repeatable.
 */

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

/** Every fact in a skill, with an intrinsic difficulty from 0 (easy) to 1 (hard). */
export function factsFor(skill) {
  if (skill === "add10") {
    return range(1, 9).flatMap((a) =>
      range(1, 10 - a).map((b) => ({
        id: `add:${a}+${b}`,
        skill,
        a,
        b,
        d: ((a + b - 2) / 8) * 0.8 + (Math.min(a, b) >= 3 ? 0.2 : 0),
      })),
    );
  }
  if (skill === "sub10") {
    return range(2, 10).flatMap((a) =>
      range(1, a - 1).map((b) => ({
        id: `sub:${a}-${b}`,
        skill,
        a,
        b,
        d: ((a - 2) / 8) * 0.7 + (b >= 3 ? 0.3 : 0),
      })),
    );
  }
  if (skill === "bond10") {
    return range(1, 9).map((a) => ({
      id: `bond:${a}`,
      skill,
      a,
      b: 10 - a,
      d: 1 - Math.abs(a - 5) / 5,
    }));
  }
  if (skill === "mul2510") {
    const base = { 10: 0.05, 2: 0.25, 5: 0.45 };
    return [2, 5, 10].flatMap((t) =>
      range(1, 10).map((n) => ({
        id: `mul:${n}x${t}`,
        skill,
        a: n,
        b: t,
        d: Math.min(1, base[t] + (n / 10) * 0.55),
      })),
    );
  }
  throw new Error(`Unknown skill: ${skill}`);
}

export const FORMATS = ["picture", "number", "missing"];

let serial = 0;

/**
 * Build a question for a fact. `blank` says which box the child fills.
 * Returns plain data the UI can draw and speak.
 */
export function makeQuestion(fact, format = "number") {
  const { skill, a, b } = fact;
  let left, op, right, result, blank, answer, say, hint, visual;
  if (skill === "add10") {
    op = "+";
    if (format === "missing") {
      [left, right, result, blank, answer] = [a, "?", a + b, "right", b];
      say = `${a} plus what makes ${a + b}?`;
      hint = `Start at ${a}. Count up to ${a + b}. How many steps did you count?`;
    } else {
      [left, right, result, blank, answer] = [a, b, "?", "result", a + b];
      say = `${a} plus ${b}. How many?`;
      const [big, small] = a >= b ? [a, b] : [b, a];
      hint = `Start at ${big}. Count on ${small} more.`;
      visual = { kind: "add", a: big, b: small };
    }
    visual ||= { kind: "add", a, b };
  } else if (skill === "sub10") {
    op = "−";
    if (format === "missing") {
      [left, right, result, blank, answer] = [a, "?", a - b, "right", b];
      say = `${a} take away what leaves ${a - b}?`;
      hint = `Start with ${a}. Cross some out until ${a - b} are left. How many did you cross out?`;
    } else {
      [left, right, result, blank, answer] = [a, b, "?", "result", a - b];
      say = `${a} take away ${b}. How many are left?`;
      hint = `Start with ${a}. Take away ${b}. Count what is left.`;
    }
    visual = { kind: "sub", a, b };
  } else if (skill === "bond10") {
    if (format === "missing") {
      // The related fact: 10 - a.
      op = "−";
      [left, right, result, blank, answer] = [10, a, "?", "result", b];
      say = `10 take away ${a}. How many are left?`;
      hint = `${a} spaces are full. Count the empty spaces.`;
    } else {
      op = "+";
      [left, right, result, blank, answer] = [a, "?", 10, "right", b];
      say = `${a} plus what makes 10?`;
      hint = `${a} spaces are full. How many empty spaces make 10?`;
    }
    visual = { kind: "bond", a };
  } else if (skill === "mul2510") {
    op = "×";
    const product = a * b;
    if (format === "missing") {
      [left, right, result, blank, answer] = ["?", b, product, "left", a];
      say = `What times ${b} makes ${product}?`;
      hint = `Count by ${b}s until you reach ${product}. How many groups?`;
    } else {
      [left, right, result, blank, answer] = [a, b, "?", "result", product];
      say = `${a} times ${b}. How many?`;
      hint = `${a} groups of ${b}. Count by ${b}s.`;
    }
    visual = { kind: "mul", a, b };
  } else {
    throw new Error(`Unknown skill: ${skill}`);
  }
  serial += 1;
  return {
    id: `q${serial}`,
    factId: fact.id,
    skill,
    format,
    left,
    op,
    right,
    result,
    blank,
    answer,
    say,
    hint,
    visual,
    showPicture: format === "picture",
    explanation: `${blank === "left" ? answer : left} ${op} ${blank === "right" ? answer : right} = ${blank === "result" ? answer : result}`,
  };
}

export const isCorrect = (question, value) =>
  String(value).trim() !== "" && Number(value) === question.answer;
