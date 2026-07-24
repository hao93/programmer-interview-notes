// encrypt-site.mjs — 把单文件构建产物 dist/index.html 整站加密为密文外壳
//
// 原理：
//   1. 读取 dist/index.html（已由 vite-plugin-singlefile 内联为单一 HTML）。
//   2. 用环境变量 SITE_PASSWORD，经 PBKDF2(SHA-256, 150000 次) 派生 AES-256-GCM 密钥。
//   3. AES-256-GCM 加密整份 HTML，输出密文(含 authTag) + 随机 salt + 随机 iv，均 base64 内嵌。
//   4. 生成「访问外壳」index.html 覆盖原文件：仅一个密码框，输入密码后于浏览器端
//      (Web Crypto) 解密，解密成功(认证通过)才用 Blob 注入 iframe 渲染；密码错则解密抛异常。
//   5. 密码本身不落库、不出现在任何可比对位置——安全性完全依赖「能否解密」这一事实。
//
// 注意：密钥派生慢哈希(150k 次)显著提高离线暴力破解成本。但请使用足够强度的口令。
import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const PW = process.env.SITE_PASSWORD;
if (!PW) {
  console.error("❌ 未设置 SITE_PASSWORD 环境变量，无法加密。");
  process.exit(1);
}

const SRC = "dist/index.html";
let html;
try {
  html = readFileSync(SRC, "utf8");
} catch (e) {
  console.error(`❌ 找不到 ${SRC}，请先运行 npm run build。`);
  process.exit(1);
}

const ITER = 150000;
const enc = new TextEncoder();
const dec = new TextDecoder();
const subtle = globalThis.crypto.subtle;

const b64 = (u8) => Buffer.from(u8).toString("base64");
const u8fromB64 = (s) => new Uint8Array(Buffer.from(s, "base64"));

async function main() {
  const salt = randomBytes(16);
  const iv = randomBytes(12);

  const km = await subtle.importKey("raw", enc.encode(PW), "PBKDF2", false, ["deriveKey"]);
  const key = await subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" },
    km,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  const ctBuf = await subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(html));
  const dataB64 = b64(new Uint8Array(ctBuf));
  const saltB64 = b64(salt);
  const ivB64 = b64(iv);

  // 自校验：用同一密钥解密，必须能还原原文（含末尾 authTag 一起解密）
  const back = await subtle.decrypt({ name: "AES-GCM", iv }, key, new Uint8Array(ctBuf));
  if (dec.decode(back) !== html) {
    throw new Error("self-check 失败：解密结果与原文不一致");
  }

  const shell = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>程序员面试手记 · 访问受限</title>
<style>
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; background: #0f1115; color: #e6e6e6;
    font-family: system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; }
  #gate { position: fixed; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 18px; z-index: 10; background: #0f1115; }
  #gate h1 { font-size: 18px; font-weight: 600; margin: 0; letter-spacing: 1px; }
  #gate p { font-size: 13px; color: #9aa0a6; margin: 0; }
  #pw { width: 300px; max-width: 80vw; padding: 12px 14px; font-size: 15px; border-radius: 10px;
    border: 1px solid #2a2f37; background: #161a21; color: #e6e6e6; outline: none; }
  #pw:focus { border-color: #3b82f6; }
  #go { margin-top: 4px; padding: 10px 26px; font-size: 14px; border: none; border-radius: 10px;
    background: #3b82f6; color: #fff; cursor: pointer; letter-spacing: 2px; }
  #go:disabled { opacity: .5; cursor: default; }
  #err { font-size: 13px; color: #f87171; min-height: 18px; }
  #frame { display: none; position: fixed; inset: 0; width: 100%; height: 100%; border: 0; }
</style>
</head>
<body>
<div id="gate">
  <h1>程序员面试手记</h1>
  <p>本站内容已加密，请输入访问密码</p>
  <input id="pw" type="password" autocomplete="off" placeholder="访问密码" />
  <button id="go">解 锁</button>
  <div id="err"></div>
</div>
<iframe id="frame" sandbox="allow-scripts allow-same-origin allow-popups allow-modals"></iframe>
<script>
const SALT = "${saltB64}";
const IV = "${ivB64}";
const DATA = "${dataB64}";
const ITER = ${ITER};
const enc = new TextEncoder(), dec = new TextDecoder();
const b64ToU8 = (b) => Uint8Array.from(atob(b), c => c.charCodeAt(0));
async function deriveKey(password, salt) {
  const km = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" },
    km, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
  );
}
async function unlock() {
  const pw = document.getElementById("pw").value;
  const err = document.getElementById("err");
  const go = document.getElementById("go");
  if (!pw) { err.textContent = "请输入密码"; return; }
  err.textContent = ""; go.disabled = true;
  try {
    const key = await deriveKey(pw, b64ToU8(SALT));
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToU8(IV) }, key, b64ToU8(DATA));
    const html = dec.decode(plain);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const f = document.getElementById("frame");
    f.src = url;
    f.style.display = "block";
    document.getElementById("gate").style.display = "none";
  } catch (e) {
    err.textContent = "密码错误，或解密失败。";
    go.disabled = false;
  }
}
document.getElementById("go").addEventListener("click", unlock);
document.getElementById("pw").addEventListener("keydown", (e) => { if (e.key === "Enter") unlock(); });
document.getElementById("pw").focus();
</script>
</body>
</html>
`;

  writeFileSync(SRC, shell, "utf8");
  console.log(`✅ 已整站加密并生成访问外壳 (self-check 通过，密文 ${Math.round(dataB64.length / 1024)} KB base64)`);
}

main().catch((e) => {
  console.error("❌ 加密失败:", e.message);
  process.exit(1);
});
