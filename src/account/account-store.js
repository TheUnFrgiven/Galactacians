export const PROGRESS_SAVE_KEY = "planet-math-defense-save";
export const ACCOUNT_KEY = "galactacians-account";
export const SESSION_KEY = "galactacians-session";

export const PROVIDERS = {
  gmail: {
    id: "gmail",
    name: "Gmail",
    domains: ["gmail.com", "googlemail.com"]
  },
  icloud: {
    id: "icloud",
    name: "iCloud",
    domains: ["icloud.com", "me.com", "mac.com"]
  }
};

export const CAMPAIGN_LESSON_COUNT = 55;
export const THEME_UNLOCKS = [
  { theme: "cold-scifi", name: "Cold Sci-Fi", streak: 0 },
  { theme: "solar-gold", name: "Solar Gold", streak: 5 },
  { theme: "matrix-grid", name: "Matrix Grid", streak: 10 },
  { theme: "code-editor", name: "Code Editor", streak: 15 },
  { theme: "cartoon-candy", name: "Cartoon Candy", streak: 20 },
  { theme: "storybook-horror", name: "Storybook Horror", streak: 25 },
  { theme: "funky-neon", name: "Funky Neon", streak: 30 },
  { theme: "metal-forge", name: "Metal Forge", streak: 35 },
  { theme: "paper-craft", name: "Paper Craft", streak: 40 },
  { theme: "ocean-pop", name: "Ocean Pop", streak: 45 }
];

const DEFAULT_PROGRESS = {
  bestStreak: 0,
  unlockedThemes: ["cold-scifi"],
  theme: "cold-scifi",
  campaignLessonIndex: 0,
  campaignComplete: false
};

export function loadProgress() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(PROGRESS_SAVE_KEY) || "{}");
    const campaignLessonCount = Number.isFinite(saved.campaignLessonCount)
      ? Math.max(1, Math.floor(saved.campaignLessonCount))
      : CAMPAIGN_LESSON_COUNT;
    return {
      ...saved,
      bestStreak: Number.isFinite(saved.bestStreak) ? saved.bestStreak : DEFAULT_PROGRESS.bestStreak,
      unlockedThemes: Array.isArray(saved.unlockedThemes) ? saved.unlockedThemes : DEFAULT_PROGRESS.unlockedThemes,
      theme: saved.theme || DEFAULT_PROGRESS.theme,
      campaignLessonIndex: Number.isFinite(saved.campaignLessonIndex)
        ? Math.max(0, Math.min(campaignLessonCount - 1, Math.floor(saved.campaignLessonIndex)))
        : DEFAULT_PROGRESS.campaignLessonIndex,
      campaignComplete: saved.campaignComplete === true,
      campaignLessonCount,
      skillMastery: saved.skillMastery && typeof saved.skillMastery === "object" ? saved.skillMastery : {},
      placement: saved.placement && typeof saved.placement === "object" ? saved.placement : { completed: false, score: 0 }
    };
  } catch {
    return { ...DEFAULT_PROGRESS, campaignLessonCount: CAMPAIGN_LESSON_COUNT, skillMastery: {}, placement: { completed: false, score: 0 } };
  }
}

export function loadAccount() {
  try {
    const account = JSON.parse(window.localStorage.getItem(ACCOUNT_KEY) || "null");
    return account && typeof account === "object" ? account : null;
  } catch {
    return null;
  }
}

export function saveAccount(account) {
  window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  return account;
}

export function getSession() {
  try {
    const session = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null");
    return session && typeof session === "object" ? session : null;
  } catch {
    return null;
  }
}

export function getActiveAccount() {
  const account = loadAccount();
  const session = getSession();
  if (!account || !session || session.accountId !== account.id) {
    return null;
  }
  return account;
}

export function setSession(account) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({
    accountId: account.id,
    signedInAt: new Date().toISOString()
  }));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(email));
}

export function getEmailDomain(email) {
  return normalizeEmail(email).split("@").pop() || "";
}

export function isAllowedProviderEmail(providerId, email) {
  const provider = PROVIDERS[providerId];
  return Boolean(provider && provider.domains.includes(getEmailDomain(email)));
}

export function getPasswordIssues(password) {
  const issues = [];
  if (String(password).length < 8) {
    issues.push("at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    issues.push("one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    issues.push("one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    issues.push("one number");
  }
  return issues;
}

export function getAgeFromBirthDate(value) {
  const birthDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

export async function createEmailAccount(form) {
  const displayName = String(form.displayName || "").trim();
  const username = String(form.username || "").trim();
  const email = normalizeEmail(form.email);
  const birthDate = String(form.birthDate || "").trim();
  const guardianEmail = normalizeEmail(form.guardianEmail);
  const password = String(form.password || "");
  const existing = loadAccount();
  const age = getAgeFromBirthDate(birthDate);

  if (displayName.length < 2) {
    throw new Error("Enter the player's full display name.");
  }
  if (!/^[a-zA-Z0-9_]{3,18}$/.test(username)) {
    throw new Error("Username must be 3-18 characters and use only letters, numbers, or underscores.");
  }
  if (!isValidEmail(email)) {
    throw new Error("Enter a valid email address.");
  }
  if (existing && normalizeEmail(existing.email) !== email) {
    throw new Error("This browser already has an account. Sign out from the profile page before creating another one.");
  }
  if (age === null || age < 4 || age > 120) {
    throw new Error("Enter a valid date of birth.");
  }
  if (age < 13 && !isValidEmail(guardianEmail)) {
    throw new Error("A parent or guardian email is required for players under 13.");
  }
  const passwordIssues = getPasswordIssues(password);
  if (passwordIssues.length) {
    throw new Error(`Password needs ${passwordIssues.join(", ")}.`);
  }

  const salt = createSalt();
  const passwordHash = await hashPassword(password, salt);
  const verificationCode = generateVerificationCode();
  const now = new Date().toISOString();
  const account = {
    id: existing?.id || createAccountId(),
    displayName,
    username,
    email,
    birthDate,
    guardianEmail: age < 13 ? guardianEmail : "",
    emailVerified: false,
    verificationCode,
    verificationCreatedAt: now,
    passwordSalt: salt,
    passwordHash,
    linkedProviders: existing?.linkedProviders || [],
    createdAt: existing?.createdAt || now,
    lastLoginAt: null
  };

  return saveAccount(account);
}

export async function authenticateEmail(email, password) {
  const account = loadAccount();
  if (!account || normalizeEmail(account.email) !== normalizeEmail(email)) {
    throw new Error("No account exists for that email on this browser.");
  }

  const passwordHash = await hashPassword(String(password || ""), account.passwordSalt || "");
  if (passwordHash !== account.passwordHash) {
    throw new Error("Email or password is incorrect.");
  }

  if (!account.emailVerified) {
    throw new Error("Email verification is still required.");
  }

  account.lastLoginAt = new Date().toISOString();
  saveAccount(account);
  setSession(account);
  return account;
}

export function verifyEmail(code) {
  const account = loadAccount();
  const normalizedCode = String(code || "").replace(/\D/g, "");
  if (!account) {
    throw new Error("Create an account before verifying email.");
  }
  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new Error("Enter the 6-digit verification code.");
  }
  if (normalizedCode !== account.verificationCode) {
    throw new Error("Verification code does not match.");
  }

  account.emailVerified = true;
  account.verificationCode = "";
  account.verificationCreatedAt = "";
  account.lastLoginAt = new Date().toISOString();
  saveAccount(account);
  setSession(account);
  return account;
}

export function resendVerificationCode() {
  const account = loadAccount();
  if (!account) {
    throw new Error("Create an account before requesting a new code.");
  }
  if (account.emailVerified) {
    throw new Error("This email is already verified.");
  }
  account.verificationCode = generateVerificationCode();
  account.verificationCreatedAt = new Date().toISOString();
  saveAccount(account);
  return account;
}

export function connectProvider(providerId, email, displayName = "") {
  const provider = PROVIDERS[providerId];
  const normalizedEmail = normalizeEmail(email);
  if (!provider) {
    throw new Error("Choose Gmail or iCloud.");
  }
  if (!isValidEmail(normalizedEmail) || !isAllowedProviderEmail(providerId, normalizedEmail)) {
    throw new Error(`${provider.name} connections must use ${provider.domains.map((domain) => `@${domain}`).join(", ")}.`);
  }

  const now = new Date().toISOString();
  const existing = loadAccount();
  const providerLink = {
    provider: providerId,
    email: normalizedEmail,
    connectedAt: now
  };
  const account = existing || {
    id: createAccountId(),
    displayName: String(displayName || normalizedEmail.split("@")[0]).trim(),
    username: normalizedEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 18) || "pilot",
    email: normalizedEmail,
    birthDate: "",
    guardianEmail: "",
    emailVerified: true,
    verificationCode: "",
    verificationCreatedAt: "",
    passwordSalt: "",
    passwordHash: "",
    linkedProviders: [],
    createdAt: now,
    lastLoginAt: now
  };

  if (!account.linkedProviders.some((link) => link.provider === providerId)) {
    account.linkedProviders.push(providerLink);
  } else {
    account.linkedProviders = account.linkedProviders.map((link) => (
      link.provider === providerId ? providerLink : link
    ));
  }

  if (!account.emailVerified && normalizeEmail(account.email) === normalizedEmail) {
    account.emailVerified = true;
    account.verificationCode = "";
    account.verificationCreatedAt = "";
  }

  account.lastLoginAt = now;
  saveAccount(account);
  setSession(account);
  return account;
}

export function disconnectProvider(providerId) {
  const account = loadAccount();
  if (!account) {
    return null;
  }
  account.linkedProviders = (account.linkedProviders || []).filter((link) => link.provider !== providerId);
  saveAccount(account);
  return account;
}

export function getInitials(nameOrEmail) {
  const source = String(nameOrEmail || "Pilot").trim();
  const parts = source.includes("@") ? [source.charAt(0)] : source.split(/\s+/);
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "P";
}

export function getUnlockedThemes(progress = loadProgress()) {
  const unlocked = new Set(["cold-scifi", ...(progress.unlockedThemes || [])]);
  THEME_UNLOCKS.forEach((theme) => {
    if (progress.bestStreak >= theme.streak) {
      unlocked.add(theme.theme);
    }
  });
  return Array.from(unlocked);
}

export function getThemeName(themeId) {
  return THEME_UNLOCKS.find((theme) => theme.theme === themeId)?.name || "Cold Sci-Fi";
}

export function getCompletedLessons(progress = loadProgress()) {
  const lessonCount = progress.campaignLessonCount || CAMPAIGN_LESSON_COUNT;
  if (progress.campaignComplete) {
    return lessonCount;
  }
  const securedCount = getSecureSkillCount(progress);
  return Math.max(securedCount, progress.campaignLessonIndex || 0);
}

export function getProfileStats(progress = loadProgress()) {
  const lessonCount = progress.campaignLessonCount || CAMPAIGN_LESSON_COUNT;
  const completedLessons = getCompletedLessons(progress);
  const unlockedThemes = getUnlockedThemes(progress);
  const xp = completedLessons * 150 + progress.bestStreak * 45 + unlockedThemes.length * 60;
  const level = Math.max(1, Math.floor(xp / 300) + 1);
  const nextLevelXp = level * 300;
  const previousLevelXp = (level - 1) * 300;
  const levelProgress = Math.max(0, Math.min(1, (xp - previousLevelXp) / (nextLevelXp - previousLevelXp)));

  return {
    completedLessons,
    campaignPercent: Math.round((completedLessons / lessonCount) * 100),
    unlockedThemes,
    xp,
    level,
    nextLevelXp,
    levelProgress
  };
}

export function getSecureSkillCount(progress = loadProgress()) {
  return Object.values(progress.skillMastery || {}).filter((record) => (
    record && ["secure", "mastered", "review_due"].includes(record.state)
  )).length;
}

function createAccountId() {
  return `acct-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createSalt() {
  const bytes = new Uint8Array(12);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(36).slice(2);
}

function generateVerificationCode() {
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return String(100000 + (values[0] % 900000));
  }
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function hashPassword(password, salt) {
  const value = `${salt}:${password}`;
  if (window.crypto?.subtle && window.TextEncoder) {
    const encoded = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return String(hash);
}
