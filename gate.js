// 簡易パスワードゲート。閲覧者を絞るための簡易的な目隠しであり、強固なセキュリティ対策ではない
// (このリポジトリ自体は公開されているため、data.js に直接アクセスすれば内容は見られる)
const GATE_PASSWORD_HASH =
  "128847236b06a4d1246b021f594bc55b8e2c30e9abe660629778005ffda93847";
const GATE_STORAGE_KEY = "yaizu-festival-gate-unlocked";

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hashBuffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function unlockSite() {
  document.getElementById("gate-overlay").remove();
  const content = document.getElementById("site-content");
  content.hidden = false;

  const dataScript = document.createElement("script");
  dataScript.src = "data.js";
  dataScript.onload = () => {
    const appScript = document.createElement("script");
    appScript.src = "app.js";
    document.body.appendChild(appScript);
  };
  document.body.appendChild(dataScript);
}

if (localStorage.getItem(GATE_STORAGE_KEY) === GATE_PASSWORD_HASH) {
  unlockSite();
} else {
  document.getElementById("gate-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("gate-password");
    const hash = await sha256Hex(input.value);

    if (hash === GATE_PASSWORD_HASH) {
      localStorage.setItem(GATE_STORAGE_KEY, hash);
      unlockSite();
    } else {
      document.getElementById("gate-error").hidden = false;
      input.value = "";
      input.focus();
    }
  });
}
