import {
  CAMPAIGN_LESSON_COUNT,
  PROVIDERS,
  clearSession,
  connectProvider,
  disconnectProvider,
  getActiveAccount,
  getInitials,
  getProfileStats,
  getThemeName,
  loadProgress
} from "./account-store.js";

const PATH_TEMPLATE = [
  { id: "number-start", title: "Number Sense Start", weight: 0.1, reward: "First Mission" },
  { id: "number", title: "Number Sense", weight: 0.18, reward: "Accuracy" },
  { id: "operations", title: "Operations Core", weight: 0.24, reward: "Power" },
  { id: "fractions", title: "Fractions and Ratios", weight: 0.2, reward: "Strategy" },
  { id: "geometry", title: "Geometry and Data", weight: 0.14, reward: "Navigation" },
  { id: "review", title: "Algebra and Review", weight: 0.14, reward: "Mastery" }
];

const MASTERY_BUCKETS = [
  { id: "addition", title: "Secured Missions", states: ["secure", "mastered", "review_due"], emptyLabel: "Campaign progress", label: "Ready" },
  { id: "subtraction", title: "In Practice", states: ["introduced", "guided", "practicing"], emptyLabel: "Training progress", label: "Active" },
  { id: "multiplication", title: "Review Due", states: ["review_due"], emptyLabel: "Spaced review", label: "Review" },
  { id: "division", title: "Needs Support", states: ["needs_support"], emptyLabel: "Repair focus", label: "Support" }
];

const ACTIVITY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ui = {
  authLink: document.getElementById("auth-link"),
  avatar: document.getElementById("profile-avatar"),
  name: document.getElementById("profile-name"),
  level: document.getElementById("profile-level"),
  emailStatus: document.getElementById("email-status"),
  profileCopy: document.getElementById("profile-copy"),
  xpFill: document.getElementById("xp-fill"),
  xpLabel: document.getElementById("xp-label"),
  statStreak: document.getElementById("stat-streak"),
  statCampaign: document.getElementById("stat-campaign"),
  statThemes: document.getElementById("stat-themes"),
  statTheme: document.getElementById("stat-theme"),
  pathMap: document.getElementById("path-map"),
  skillGrid: document.getElementById("skill-grid"),
  accountUsername: document.getElementById("account-username"),
  accountEmail: document.getElementById("account-email"),
  accountPrimaryAction: document.getElementById("account-primary-action"),
  signOutButton: document.getElementById("sign-out-button"),
  connectionList: document.getElementById("connection-list"),
  linkProviderPanel: document.getElementById("link-provider-panel"),
  linkProviderLabel: document.getElementById("link-provider-label"),
  linkProviderEmail: document.getElementById("link-provider-email"),
  linkProviderHint: document.getElementById("link-provider-hint"),
  linkProviderCancel: document.getElementById("link-provider-cancel"),
  questList: document.getElementById("quest-list"),
  activityGrid: document.getElementById("activity-grid"),
  message: document.getElementById("profile-message")
};

let activeLinkProvider = "";

function renderProfile() {
  const account = getActiveAccount();
  const progress = loadProgress();
  const stats = getProfileStats(progress);
  const displayName = account?.displayName || "Guest Pilot";
  const emailStatus = account?.emailVerified ? "Verified" : account ? "Pending" : "Guest";

  ui.avatar.textContent = getInitials(account?.displayName || account?.email || "Pilot");
  ui.name.textContent = displayName;
  ui.level.textContent = `Level ${stats.level}`;
  ui.emailStatus.textContent = emailStatus;
  ui.emailStatus.classList.toggle("verified", account?.emailVerified === true);
  ui.emailStatus.classList.toggle("pending", account?.emailVerified !== true);
  ui.profileCopy.textContent = account
    ? `${account.username} is defending planets through the structured math campaign.`
    : "Create an account to attach this browser progress to a verified pilot profile.";
  ui.xpFill.style.width = `${Math.round(stats.levelProgress * 100)}%`;
  ui.xpLabel.textContent = `${stats.xp} XP - ${Math.max(0, stats.nextLevelXp - stats.xp)} XP to next level`;

  ui.statStreak.textContent = String(progress.bestStreak);
  ui.statCampaign.textContent = `${stats.campaignPercent}%`;
  ui.statThemes.textContent = `${stats.unlockedThemes.length} / 10`;
  ui.statTheme.textContent = getThemeName(progress.theme);

  ui.accountUsername.textContent = account ? `@${account.username}` : "@guest";
  ui.accountEmail.textContent = account?.email || "No verified email connected";
  ui.accountPrimaryAction.textContent = account ? "Account Access" : "Create Account";
  ui.accountPrimaryAction.href = "auth.html";
  ui.signOutButton.classList.toggle("hidden", !account);
  ui.authLink.textContent = account ? "Account" : "Sign Up";

  renderPath(progress, stats.completedLessons);
  renderSkills(progress, stats.completedLessons);
  renderConnections(account);
  renderQuests(progress, stats);
  renderActivity(progress, stats);
}

function renderPath(progress, completedLessons) {
  ui.pathMap.innerHTML = "";
  const lessonCount = progress.campaignLessonCount || CAMPAIGN_LESSON_COUNT;
  getPathGroups(lessonCount).forEach((group, index) => {
    const completeCount = getGroupCompletedCount(group, completedLessons);
    const isDone = completeCount >= group.lessons;
    const isCurrent = !progress.campaignComplete && completeCount > 0 && completeCount < group.lessons;
    const isNext = !progress.campaignComplete && completedLessons === group.start;
    const item = document.createElement("article");
    item.className = "milestone";
    item.classList.toggle("done", isDone);
    item.classList.toggle("current", isCurrent || isNext);
    item.innerHTML = `
      <div class="milestone-index">${isDone ? "OK" : index + 1}</div>
      <div>
        <h3>${group.title}</h3>
        <span>${group.reward} training</span>
      </div>
      <strong>${completeCount} / ${group.lessons}</strong>
    `;
    ui.pathMap.appendChild(item);
  });
}

function renderSkills(progress, completedLessons) {
  const lessonCount = progress.campaignLessonCount || CAMPAIGN_LESSON_COUNT;
  const records = Object.values(progress.skillMastery || {});
  ui.skillGrid.innerHTML = "";
  MASTERY_BUCKETS.forEach((bucket) => {
    const count = records.length
      ? records.filter((record) => record && bucket.states.includes(record.state)).length
      : bucket.states.includes("secure")
        ? completedLessons
        : 0;
    const percent = Math.round((count / lessonCount) * 100);
    const card = document.createElement("article");
    card.className = `skill-card ${bucket.id}`;
    card.innerHTML = `
      <span>${bucket.label}</span>
      <strong>${bucket.title}</strong>
      <div class="meter-track" aria-label="${bucket.title}">
        <div class="meter-fill" style="width: ${percent}%"></div>
      </div>
      <p class="field-hint">${records.length ? count : completedLessons} of ${lessonCount} ${bucket.emptyLabel.toLowerCase()}</p>
    `;
    ui.skillGrid.appendChild(card);
  });
}

function renderConnections(account) {
  ui.connectionList.innerHTML = "";
  Object.values(PROVIDERS).forEach((provider) => {
    const link = account?.linkedProviders?.find((providerLink) => providerLink.provider === provider.id);
    const row = document.createElement("div");
    row.className = "connection-row";
    row.innerHTML = `
      <div>
        <span>${provider.name}</span>
        <strong>${link ? escapeHtml(link.email) : "Not connected"}</strong>
      </div>
      <button class="${link ? "ghost-button" : "secondary-button"}" type="button" data-provider-action="${link ? "disconnect" : "connect"}" data-provider="${provider.id}">
        ${link ? "Remove" : "Connect"}
      </button>
    `;
    ui.connectionList.appendChild(row);
  });
}

function renderQuests(progress, stats) {
  const lessonCount = progress.campaignLessonCount || CAMPAIGN_LESSON_COUNT;
  const nextThemeAt = getNextThemeStreak(progress.bestStreak);
  const quests = [
    ["Finish one lesson", progress.campaignComplete ? "Complete" : `${Math.min(stats.completedLessons + 1, lessonCount)} / ${lessonCount}`],
    ["Keep the streak alive", `${progress.bestStreak} best`],
    ["Unlock next theme", nextThemeAt ? `Streak ${nextThemeAt}` : "All unlocked"]
  ];

  ui.questList.innerHTML = "";
  quests.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "quest-row";
    row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    ui.questList.appendChild(row);
  });
}

function renderActivity(progress, stats) {
  const seed = progress.bestStreak + stats.completedLessons * 3 + stats.unlockedThemes.length;
  ui.activityGrid.innerHTML = "";
  ACTIVITY_DAYS.forEach((day, index) => {
    const height = seed === 0 ? 12 : 22 + ((seed + index * 17) % 72);
    const column = document.createElement("div");
    column.className = "activity-column";
    column.innerHTML = `
      <div class="activity-bar" style="height: ${height}%"></div>
      <span>${day}</span>
    `;
    ui.activityGrid.appendChild(column);
  });
}

function getGroupCompletedCount(group, completedLessons) {
  return Math.max(0, Math.min(group.lessons, completedLessons - group.start));
}

function getPathGroups(totalLessons) {
  let start = 0;
  let assigned = 0;
  return PATH_TEMPLATE.map((group, index) => {
    const isLast = index === PATH_TEMPLATE.length - 1;
    const lessons = isLast
      ? Math.max(1, totalLessons - assigned)
      : Math.max(1, Math.round(totalLessons * group.weight));
    const nextGroup = { ...group, lessons, start };
    start += lessons;
    assigned += lessons;
    return nextGroup;
  });
}

function getNextThemeStreak(bestStreak) {
  const theme = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45].find((streak) => streak > bestStreak);
  return theme || null;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);
}

function setMessage(text, type = "") {
  ui.message.textContent = text;
  ui.message.classList.toggle("error", type === "error");
  ui.message.classList.toggle("success", type === "success");
}

function openLinkProvider(providerId) {
  const provider = PROVIDERS[providerId];
  activeLinkProvider = providerId;
  ui.linkProviderPanel.classList.remove("hidden");
  ui.linkProviderLabel.textContent = `${provider.name} email address`;
  ui.linkProviderHint.textContent = `Accepted domains: ${provider.domains.map((domain) => `@${domain}`).join(", ")}.`;
  ui.linkProviderEmail.value = "";
  setMessage("");
  window.setTimeout(() => ui.linkProviderEmail.focus({ preventScroll: true }), 0);
}

function closeLinkProvider() {
  activeLinkProvider = "";
  ui.linkProviderPanel.classList.add("hidden");
  ui.linkProviderEmail.value = "";
}

function handleConnectionClick(event) {
  const button = event.target.closest("[data-provider-action]");
  if (!button) {
    return;
  }

  const providerId = button.dataset.provider;
  if (button.dataset.providerAction === "disconnect") {
    disconnectProvider(providerId);
    setMessage(`${PROVIDERS[providerId].name} removed.`, "success");
    renderProfile();
    return;
  }

  openLinkProvider(providerId);
}

function handleLinkProvider(event) {
  event.preventDefault();
  try {
    const provider = PROVIDERS[activeLinkProvider];
    connectProvider(activeLinkProvider, ui.linkProviderEmail.value);
    closeLinkProvider();
    setMessage(`${provider?.name || "Provider"} connected.`, "success");
    renderProfile();
  } catch (error) {
    setMessage(error.message, "error");
  }
}

function handleSignOut() {
  clearSession();
  setMessage("Signed out.", "success");
  renderProfile();
}

ui.connectionList.addEventListener("click", handleConnectionClick);
ui.linkProviderPanel.addEventListener("submit", handleLinkProvider);
ui.linkProviderCancel.addEventListener("click", closeLinkProvider);
ui.signOutButton.addEventListener("click", handleSignOut);

renderProfile();
