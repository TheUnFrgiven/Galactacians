import {
  PROVIDERS,
  authenticateEmail,
  connectProvider,
  createEmailAccount,
  getActiveAccount,
  getAgeFromBirthDate,
  loadAccount,
  resendVerificationCode,
  verifyEmail
} from "./account-store.js";

const ui = {
  providerButtons: Array.from(document.querySelectorAll(".provider-button[data-provider]")),
  providerPanel: document.getElementById("provider-panel"),
  providerEmailLabel: document.getElementById("provider-email-label"),
  providerEmail: document.getElementById("provider-email"),
  providerHint: document.getElementById("provider-hint"),
  providerCancel: document.getElementById("provider-cancel"),
  signupTab: document.getElementById("signup-tab"),
  signinTab: document.getElementById("signin-tab"),
  signupForm: document.getElementById("signup-form"),
  signinForm: document.getElementById("signin-form"),
  birthDate: document.getElementById("signup-birth-date"),
  guardianRow: document.getElementById("guardian-row"),
  guardianEmail: document.getElementById("guardian-email"),
  signupPassword: document.getElementById("signup-password"),
  signupConfirmPassword: document.getElementById("signup-confirm-password"),
  termsCheck: document.getElementById("terms-check"),
  verificationPanel: document.getElementById("verification-panel"),
  verificationDemoCode: document.getElementById("verification-demo-code"),
  verificationCode: document.getElementById("verification-code"),
  resendCode: document.getElementById("resend-code"),
  message: document.getElementById("auth-message")
};

let activeProvider = "";

function setMessage(text, type = "") {
  ui.message.textContent = text;
  ui.message.classList.toggle("error", type === "error");
  ui.message.classList.toggle("success", type === "success");
}

function setAuthMode(mode) {
  const signup = mode === "signup";
  ui.signupTab.classList.toggle("active", signup);
  ui.signinTab.classList.toggle("active", !signup);
  ui.signupTab.setAttribute("aria-selected", String(signup));
  ui.signinTab.setAttribute("aria-selected", String(!signup));
  ui.signupForm.classList.toggle("hidden", !signup);
  ui.signinForm.classList.toggle("hidden", signup);
  ui.verificationPanel.classList.add("hidden");
  setMessage("");
}

function updateGuardianRow() {
  const age = getAgeFromBirthDate(ui.birthDate.value);
  const needsGuardian = age !== null && age < 13;
  ui.guardianRow.classList.toggle("hidden", !needsGuardian);
  ui.guardianEmail.required = needsGuardian;
}

function showVerification(account) {
  ui.verificationPanel.classList.remove("hidden");
  ui.verificationDemoCode.textContent = account.verificationCode || "";
  ui.verificationCode.value = "";
  window.setTimeout(() => ui.verificationCode.focus({ preventScroll: true }), 0);
}

function openProviderPanel(providerId) {
  const provider = PROVIDERS[providerId];
  activeProvider = providerId;
  ui.providerPanel.classList.remove("hidden");
  ui.providerEmailLabel.textContent = `${provider.name} email address`;
  ui.providerHint.textContent = `Accepted domains: ${provider.domains.map((domain) => `@${domain}`).join(", ")}.`;
  ui.providerEmail.value = "";
  setMessage("");
  window.setTimeout(() => ui.providerEmail.focus({ preventScroll: true }), 0);
}

function closeProviderPanel() {
  activeProvider = "";
  ui.providerPanel.classList.add("hidden");
  ui.providerEmail.value = "";
}

async function handleSignup(event) {
  event.preventDefault();
  try {
    const form = new FormData(ui.signupForm);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    if (password !== confirmPassword) {
      throw new Error("Password and confirmation must match.");
    }
    if (!ui.termsCheck.checked) {
      throw new Error("Accept the Terms and Privacy Notice before creating an account.");
    }

    const account = await createEmailAccount({
      displayName: form.get("displayName"),
      username: form.get("username"),
      email: form.get("email"),
      birthDate: form.get("birthDate"),
      guardianEmail: form.get("guardianEmail"),
      password
    });

    showVerification(account);
    setMessage(`Verification is ready for ${account.email}.`, "success");
  } catch (error) {
    setMessage(error.message, "error");
  }
}

async function handleSignin(event) {
  event.preventDefault();
  try {
    const form = new FormData(ui.signinForm);
    await authenticateEmail(form.get("email"), form.get("password"));
    setMessage("Signed in. Opening profile...", "success");
    window.setTimeout(() => {
      window.location.href = "profile.html";
    }, 350);
  } catch (error) {
    const account = loadAccount();
    if (account && !account.emailVerified && error.message.includes("verification")) {
      showVerification(account);
    }
    setMessage(error.message, "error");
  }
}

function handleProviderConnect(event) {
  event.preventDefault();
  try {
    const account = connectProvider(activeProvider, ui.providerEmail.value);
    setMessage(`${PROVIDERS[activeProvider].name} connected. Opening profile...`, "success");
    window.setTimeout(() => {
      window.location.href = "profile.html";
    }, account ? 350 : 0);
  } catch (error) {
    setMessage(error.message, "error");
  }
}

function handleVerification(event) {
  event.preventDefault();
  try {
    verifyEmail(ui.verificationCode.value);
    setMessage("Email verified. Opening profile...", "success");
    window.setTimeout(() => {
      window.location.href = "profile.html";
    }, 350);
  } catch (error) {
    setMessage(error.message, "error");
  }
}

function handleResendCode() {
  try {
    const account = resendVerificationCode();
    showVerification(account);
    setMessage("A new verification code is ready.", "success");
  } catch (error) {
    setMessage(error.message, "error");
  }
}

function hydrateSignedInState() {
  const account = getActiveAccount();
  if (!account) {
    return;
  }
  setMessage(`Signed in as ${account.displayName}. Open Profile to continue.`, "success");
}

ui.signupTab.addEventListener("click", () => setAuthMode("signup"));
ui.signinTab.addEventListener("click", () => setAuthMode("signin"));
ui.birthDate.addEventListener("change", updateGuardianRow);
ui.signupForm.addEventListener("submit", handleSignup);
ui.signinForm.addEventListener("submit", handleSignin);
ui.verificationPanel.addEventListener("submit", handleVerification);
ui.resendCode.addEventListener("click", handleResendCode);
ui.providerPanel.addEventListener("submit", handleProviderConnect);
ui.providerCancel.addEventListener("click", closeProviderPanel);
ui.providerButtons.forEach((button) => {
  button.addEventListener("click", () => openProviderPanel(button.dataset.provider));
});

updateGuardianRow();
hydrateSignedInState();
