// ---------- Character sets ----------
const CHARS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/~"
};

// ---------- DOM elements ----------
const passwordEl = document.getElementById("password");
const lengthEl = document.getElementById("length");
const lengthValueEl = document.getElementById("lengthValue");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const messageEl = document.getElementById("message");
const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");
const toastEl = document.getElementById("toast");
const optionEls = {
  uppercase: document.getElementById("uppercase"),
  lowercase: document.getElementById("lowercase"),
  numbers: document.getElementById("numbers"),
  symbols: document.getElementById("symbols")
};

let currentPassword = "";

// ---------- Secure random helper ----------
// Uses the browser's cryptographic generator instead of Math.random().
function randomInt(max) {
  const limit = Math.floor(0x100000000 / max) * max; // avoids modulo bias
  const buffer = new Uint32Array(1);
  do { crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
  return buffer[0] % max;
}

// ---------- Password generation ----------
function generatePassword() {
  const selected = Object.keys(optionEls).filter(key => optionEls[key].checked);

  if (selected.length === 0) {
    messageEl.textContent = "Select at least one character type.";
    return;
  }
  messageEl.textContent = "";

  const length = Number(lengthEl.value);
  const pool = selected.map(key => CHARS[key]).join("");
  const result = [];

  // Guarantee at least one character from each selected type
  selected.forEach(key => result.push(CHARS[key][randomInt(CHARS[key].length)]));

  // Fill the remaining length from the combined pool
  while (result.length < length) result.push(pool[randomInt(pool.length)]);

  // Fisher–Yates shuffle so the guaranteed characters aren't always first
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  currentPassword = result.join("");
  passwordEl.textContent = currentPassword;
  passwordEl.classList.remove("placeholder");
  updateStrength(length, pool.length);
}

// ---------- Strength indicator (entropy based) ----------
function updateStrength(length, poolSize) {
  const entropy = length * Math.log2(poolSize);
  let level;

  if (entropy < 45)      level = { label: "Weak",        color: "var(--weak)",   width: 25 };
  else if (entropy < 70) level = { label: "Fair",        color: "var(--fair)",   width: 50 };
  else if (entropy < 100) level = { label: "Good",       color: "var(--good)",   width: 75 };
  else                   level = { label: "Very strong", color: "var(--strong)", width: 100 };

  strengthFill.style.width = level.width + "%";
  strengthFill.style.background = level.color;
  strengthText.textContent = level.label;
}

// ---------- Copy to clipboard ----------
async function copyPassword() {
  if (!currentPassword) {
    messageEl.textContent = "Generate a password first.";
    return;
  }
  try {
    await navigator.clipboard.writeText(currentPassword);
  } catch {
    // Fallback for older browsers
    const temp = document.createElement("textarea");
    temp.value = currentPassword;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
  }
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 1800);
}

// ---------- Events ----------
lengthEl.addEventListener("input", () => {
  lengthValueEl.textContent = lengthEl.value;
  if (currentPassword) generatePassword(); // live update while sliding
});
Object.values(optionEls).forEach(el => el.addEventListener("change", () => {
  if (currentPassword) generatePassword();
}));
generateBtn.addEventListener("click", generatePassword);
copyBtn.addEventListener("click", copyPassword);

// ---------- Initial state ----------
passwordEl.classList.add("placeholder");
generatePassword();
