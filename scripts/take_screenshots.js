const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = "C:\\Users\\Talha\\.gemini\\antigravity\\brain\\e440c5a6-730a-470e-9be8-fcc8d7baf156\\screenshots";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const PAGES = [
  { name: "home", path: "/" },
  { name: "farmer", path: "/farmer" },
  { name: "planner", path: "/planner" },
  { name: "market", path: "/market" },
  { name: "watchdog", path: "/watchdog" },
  { name: "copilot", path: "/copilot" },
  { name: "negotiate", path: "/negotiate/lst_01" },
];

async function capture() {
  console.log("Launching headless Chrome...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,1000"],
    defaultViewport: { width: 1280, height: 1000 },
  });

  const page = await browser.newPage();

  for (const p of PAGES) {
    // 1. Capture English
    await page.goto(`http://localhost:3000${p.path}`, { waitUntil: "networkidle0", timeout: 30000 });
    await page.evaluate(() => {
      localStorage.setItem("preferred_lang", "en");
      window.dispatchEvent(new Event("languageChange"));
    });
    await new Promise((r) => setTimeout(r, 800));
    const enFile = path.join(OUTPUT_DIR, `${p.name}_en.png`);
    await page.screenshot({ path: enFile, fullPage: false });
    console.log(`Saved: ${enFile}`);

    // 2. Capture Urdu
    await page.evaluate(() => {
      localStorage.setItem("preferred_lang", "ur");
      window.dispatchEvent(new Event("languageChange"));
    });
    await new Promise((r) => setTimeout(r, 800));
    const urFile = path.join(OUTPUT_DIR, `${p.name}_ur.png`);
    await page.screenshot({ path: urFile, fullPage: false });
    console.log(`Saved: ${urFile}`);
  }

  await browser.close();
  console.log("All screenshots captured successfully!");
}

capture().catch((err) => {
  console.error("Capture error:", err);
  process.exit(1);
});
