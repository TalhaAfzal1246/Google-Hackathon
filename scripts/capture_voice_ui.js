const puppeteer = require("puppeteer-core");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = "C:\\Users\\Talha\\.gemini\\antigravity\\brain\\e440c5a6-730a-470e-9be8-fcc8d7baf156\\screenshots";

async function captureVoiceUI() {
  console.log("Launching headless Chrome for Voice UI...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,1000"],
    defaultViewport: { width: 1280, height: 1000 },
  });

  const page = await browser.newPage();

  // 1. Capture Homepage with the Voice Hero Banner & Floating Voice Button
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0", timeout: 30000 });
  await page.evaluate(() => {
    localStorage.setItem("preferred_lang", "ur");
    window.dispatchEvent(new Event("languageChange"));
  });
  await new Promise((r) => setTimeout(r, 1000));
  const homeWithVoice = path.join(OUTPUT_DIR, "voice_home_cta.png");
  await page.screenshot({ path: homeWithVoice, fullPage: false });
  console.log(`Saved: ${homeWithVoice}`);

  // 2. Open the Voice Assistant Modal
  await page.evaluate(() => {
    const btn = document.getElementById("floating-voice-assistant-btn");
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 800));
  const modalOpen = path.join(OUTPUT_DIR, "voice_modal_open.png");
  await page.screenshot({ path: modalOpen, fullPage: false });
  console.log(`Saved: ${modalOpen}`);

  // 3. Click one of the quick voice queries to simulate asking an inquiry
  await page.waitForSelector(".quick-voice-btn", { timeout: 10000 });
  const btns = await page.$$(".quick-voice-btn");
  if (btns.length > 1) {
    await btns[1].click();
  }

  // Wait for the answer card to render
  await new Promise((r) => setTimeout(r, 3000));
  const answeredModal = path.join(OUTPUT_DIR, "voice_modal_answered.png");
  await page.screenshot({ path: answeredModal, fullPage: false });
  console.log(`Saved: ${answeredModal}`);

  await browser.close();
  console.log("All Voice UI screenshots successfully captured!");
}

captureVoiceUI().catch((err) => {
  console.error("Capture error:", err);
  process.exit(1);
});
