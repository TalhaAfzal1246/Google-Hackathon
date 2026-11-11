async function testVoiceCommands() {
  console.log("=== Testing Farm-to-Future Voice Command Engine ===");

  const testCases = [
    { name: "All Features Overview", query: "تمام فیچرز کا تعارف بتائیں" },
    { name: "Next-Quarter Planner", query: "اگلی فصل کون سی لگانا بہتر ہے؟" },
    { name: "Harvest Timing Advisory", query: "کیا میں ٹماٹر ابھی بیچ دوں یا کچھ دن روکوں؟" },
    { name: "Live Mandi Rates", query: "ٹماٹر اور پیاز کا آج کا ریٹ کیا ہے؟" },
    { name: "Wholesale Verified Buyers", query: "بغیر آڑھتی کے خریدار کیسے ملیں گے؟" },
    { name: "Spread Watchdog", query: "آڑھتی کٹوتی اور منافع خوری واچ ڈاگ کیا ہے؟" },
    { name: "Deal Room Bargaining", query: "خریدار کے ساتھ سودا روم میں بولی کیسے لگے گی؟" },
    { name: "Market Intelligence", query: "منڈی میں مال کی آمد اور طلب کا کیا اثر ہوتا ہے؟" },
  ];

  let passed = 0;

  for (const tc of testCases) {
    try {
      const res = await fetch("http://localhost:3000/api/voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: tc.query,
          lang: "ur",
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      if (!data.title || !data.spokenText || !data.bullets || data.bullets.length === 0) {
        throw new Error("Invalid response format: missing title, spokenText or bullets");
      }

      console.log(`✓ [${tc.name}] Passed:`);
      console.log(`  Title: ${data.title}`);
      console.log(`  Spoken Length: ${data.spokenText.length} chars`);
      console.log(`  Topic: ${data.topic}`);
      console.log(`  Route: ${data.actionRoute || "None"}\n`);
      passed++;
    } catch (err: any) {
      console.error(`✗ [${tc.name}] Failed:`, err.message);
    }
  }

  console.log(`=== Result: ${passed}/${testCases.length} Voice Command Tests Passed ===`);
  if (passed !== testCases.length) {
    process.exit(1);
  }
}

testVoiceCommands();
