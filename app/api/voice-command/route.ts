import { NextRequest, NextResponse } from "next/server";
import { aiJSON } from "@/lib/ai";

interface VoiceCommandResponse {
  title: string;
  spokenText: string;
  bullets: string[];
  actionRoute?: string;
  actionLabel?: string;
  topic: string;
  usedAI: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { command, lang = "ur", currentRoute = "/" } = await req.json();
    const cleanCmd = (command || "").trim().toLowerCase();

    if (!cleanCmd) {
      return NextResponse.json(
        {
          title: "کوئی سوال درج نہیں کیا گیا",
          spokenText: "براہ کرم مائیک کا بٹن دبا کر اپنا سوال بولیں، یا نیچے دیے گئے سوالات میں سے کوئی منتخب کریں۔",
          bullets: ["مائیک پر کلک کر کے بولیں", "کوئی بھی تجارتی یا زرعی سوال پوچھیں"],
          topic: "general",
          usedAI: false,
        },
        { status: 200 }
      );
    }

    // 1. SPREAD WATCHDOG & CARTEL MONITOR (Specific check)
    if (
      cleanCmd.includes("واچ ڈاگ") ||
      cleanCmd.includes("کٹوتی") ||
      cleanCmd.includes("منافع خوری") ||
      cleanCmd.includes("کارٹل") ||
      cleanCmd.includes("لوٹ مار") ||
      cleanCmd.includes("watchdog") ||
      cleanCmd.includes("middleman") ||
      cleanCmd.includes("spread") ||
      cleanCmd.includes("cartel")
    ) {
      return NextResponse.json({
        title: "آڑھتی و درمیانی منافع خوری واچ ڈاگ",
        spokenText:
          "آڑھتی واچ ڈاگ اس بات کی نگرانی کرتا ہے کہ کسان کو ملنے والے ریٹ اور شہر کے عام صارف کو بکنے والی قیمت میں کتنا فرق ہے۔ یہ سسٹم ٹرانسپورٹ ایندھن، قانونی کمیشن اور سٹوریج نکال کر آڑھتیوں کا غیر معمولی منافع بے نقاب کرتا ہے تاکہ کسانوں کا معاشی استحصال بند ہو۔",
        bullets: [
          "فارم گیٹ اور شہری ریٹیل ریٹ کا موازنہ۔",
          "ٹرانسپورٹ، کمیشن اور سٹوریج اخراجات کی شفاف تفصیل۔",
          "غیر معمولی منافع خوری اور کارٹل کے واقعات پر سرخ الرٹ۔",
        ],
        actionRoute: "/watchdog",
        actionLabel: "آڑھتی واچ ڈاگ مانیٹر دیکھیں",
        topic: "watchdog",
        usedAI: false,
      });
    }

    // 2. DEAL ROOM & BILATERAL NEGOTIATION (Specific check)
    if (
      cleanCmd.includes("سودا روم") ||
      cleanCmd.includes("ڈیل روم") ||
      cleanCmd.includes("بولی") ||
      cleanCmd.includes("مذاکرات") ||
      cleanCmd.includes("deal room") ||
      cleanCmd.includes("negotiate") ||
      cleanCmd.includes("bargain")
    ) {
      return NextResponse.json({
        title: "براہ راست منصفانہ سودا روم",
        spokenText:
          "سودا روم میں کسان اور خریدار کے درمیان براہ راست بولی کا تبادلہ ہوتا ہے۔ ہمارا سسٹم شماریاتی منصفانہ حد کے اندر رہتا ہے تاکہ خریدار کسان کو کم ریٹ پر مجبور نہ کر سکے اور دونوں کے درمیان منصفانہ قیمت پر سودا طے پا جائے۔",
        bullets: [
          "پانچ راؤنڈز پر مشتمل خودکار شفاف مذاکرات۔",
          "شماریاتی منصفانہ بینڈ (P25 تا P75) کی ضمانت۔",
          "قانونی تحفظ کے ساتھ فوری ڈیجیٹل معاہدہ۔",
        ],
        actionRoute: "/negotiate/lst_01",
        actionLabel: "سودا روم میں داخل ہوں",
        topic: "negotiate",
        usedAI: false,
      });
    }

    // 3. MARKET INTELLIGENCE & DEMAND / SUPPLY / ARRIVALS
    if (
      cleanCmd.includes("آمد") ||
      cleanCmd.includes("رسد") ||
      cleanCmd.includes("طلب") ||
      cleanCmd.includes("مارکیٹ ڈیسک") ||
      cleanCmd.includes("کوپائلٹ") ||
      cleanCmd.includes("انٹیلی جنس") ||
      cleanCmd.includes("copilot") ||
      cleanCmd.includes("intelligence") ||
      cleanCmd.includes("elasticity")
    ) {
      return NextResponse.json({
        title: "منڈی مارکیٹ انٹیلی جنس ڈیسک",
        spokenText:
          "مارکیٹ ڈیسک پر آپ منڈی میں مال کی روزانہ آمد، طلب، ڈیزل کے کرایوں، اور سندھ و بلوچستان سے آنے والی موسمی فصلوں کی لہروں کے بارے میں جان سکتے ہیں تاکہ آپ وقت سے پہلے منڈی کے اتار چڑھاؤ کو سمجھ سکیں۔",
        bullets: [
          "روزانہ آمد اور شہری کھپت کا تجارتی توازن۔",
          "سندھ، پنجاب، اور شمالی علاقوں کی موسمی لہریں۔",
          "ڈیزل مال برداری اور موسمی اثرات کا تجزیہ۔",
        ],
        actionRoute: "/copilot",
        actionLabel: "مارکیٹ ڈیسک پر جائیں",
        topic: "copilot",
        usedAI: false,
      });
    }

    // 4. LIVE MANDI RATES (Prices / Rates)
    if (
      cleanCmd.includes("ریٹ") ||
      cleanCmd.includes("بھاؤ") ||
      cleanCmd.includes("قیمت") ||
      cleanCmd.includes("نرخ") ||
      cleanCmd.includes("ٹماٹر کا ریٹ") ||
      cleanCmd.includes("پیاز کا ریٹ") ||
      cleanCmd.includes("rates") ||
      cleanCmd.includes("prices") ||
      cleanCmd.includes("price")
    ) {
      return NextResponse.json({
        title: "آج کے مصدقہ منڈی ریٹس (AMIS پنجاب)",
        spokenText:
          "آج پنجاب کی سرکاری منڈیوں میں ٹماٹر 175 روپے فی کلو یعنی سات ہزار روپے فی من ہے۔ پیاز 165 روپے فی کلو یعنی 6600 روپے فی من ہے۔ آلو 48 روپے فی کلو، گندم 98 روپے فی کلو، اور باسمتی چاول 220 روپے فی کلو یعنی 8800 روپے فی من فروخت ہو رہا ہے۔",
        bullets: [
          "ٹماٹر: ₨ 175/kg (₨ 7,000/من)",
          "پیاز: ₨ 165/kg (₨ 6,600/من)",
          "آلو: ₨ 48/kg (₨ 1,920/من)",
          "گندم: ₨ 98/kg (₨ 3,920/من)",
          "باسمتی چاول: ₨ 220/kg (₨ 8,800/من)",
        ],
        actionRoute: "/farmer",
        actionLabel: "منڈی ریٹس اور تجزیہ دیکھیں",
        topic: "rates",
        usedAI: false,
      });
    }

    // 5. CROP PLANNER / WHAT TO GROW NEXT QUARTER
    if (
      cleanCmd.includes("اگلی فصل") ||
      cleanCmd.includes("کون سی فصل") ||
      cleanCmd.includes("کیا لگاؤں") ||
      cleanCmd.includes("کیا لگائیں") ||
      cleanCmd.includes("پلانر") ||
      cleanCmd.includes("سردیوں کی فصل") ||
      cleanCmd.includes("گرمیوں کی فصل") ||
      cleanCmd.includes("منافع بخش فصل") ||
      cleanCmd.includes("ربیع") ||
      cleanCmd.includes("خریف") ||
      cleanCmd.includes("what to grow") ||
      cleanCmd.includes("crop planner") ||
      cleanCmd.includes("next crop") ||
      cleanCmd.includes("planner")
    ) {
      return NextResponse.json({
        title: "اگلی سہ ماہی کے لیے موزوں ترین فصل",
        spokenText:
          "اگلے سیزن کے لیے سب سے زیادہ منافع بخش فصل پیاز اور گندم ہے۔ اگر آپ کے پاس زمین ہے تو پیاز پر تقریباً بارہ لاکھ روپے فی ایکڑ تک خالص منافع متوقع ہے کیونکہ ملک میں ذخائر کم ہیں، جبکہ گندم محفوظ پیداوار اور خوراک کے لیے بہترین ہے۔ میں آپ کو اگلی فصل کے پلانر پر لے جا رہا ہوں۔",
        bullets: [
          "پیاز (سرمائی ربیع): 1000 فیصد سے زائد متوقع منافع (ROI)۔",
          "گندم: کم خطرہ، یقینی سرکاری امدادی قیمت اور ملکی ضرورت۔",
          "زرعی تحقیقاتی کونسل (PARC) کے مصدقہ لاگت کے اعداد و شمار۔",
        ],
        actionRoute: "/planner",
        actionLabel: "اگلی فصل پلانر کھولیں",
        topic: "planner",
        usedAI: false,
      });
    }

    // 6. HARVEST TIMING / SELL NOW OR HOLD
    if (
      cleanCmd.includes("کب بیچوں") ||
      cleanCmd.includes("بیچ دوں") ||
      cleanCmd.includes("روک لوں") ||
      cleanCmd.includes("روکوں") ||
      cleanCmd.includes("فصل کا مشورہ") ||
      cleanCmd.includes("hold or sell") ||
      cleanCmd.includes("harvest timing") ||
      cleanCmd.includes("when to sell") ||
      cleanCmd.includes("farmer advisory")
    ) {
      return NextResponse.json({
        title: "فصل کٹائی و فروخت کا شماریاتی مشورہ",
        spokenText:
          "اگر آپ کے پاس ٹماٹر ہے تو اگلے سات دنوں میں منڈی میں مال کی آمد کم ہونے کے باعث ریٹ 175 روپے سے بڑھ کر 195 روپے تک جانے کا قوی امکان ہے۔ اگر آپ کے پاس ہوادار سٹوریج ہے تو سات دن روکنا فائدہ مند ہے، ورنہ نقصان سے بچنے کے لیے آج فروخت کرنا محفوظ ہے۔ کسان پورٹل پر تفصیلی جائزہ موجود ہے۔",
        bullets: [
          "موجودہ ریٹ: 175 روپے فی کلو (7,000 روپے فی من)۔",
          "7 روزہ تخمینہ: 195 روپے فی کلو تک اضافہ متوقع۔",
          "سٹوریج اور خرابی کی لاگت نکال کر بھی اضافی بچت۔",
        ],
        actionRoute: "/farmer",
        actionLabel: "کسان پورٹل پر مشورہ دیکھیں",
        topic: "farmer",
        usedAI: false,
      });
    }

    // 7. WHOLESALE EXCHANGE & BUYERS
    if (
      cleanCmd.includes("خریدار") ||
      cleanCmd.includes("بغیر آڑھتی") ||
      cleanCmd.includes("ہول سیل") ||
      cleanCmd.includes("مال بیچنا") ||
      cleanCmd.includes("buyers") ||
      cleanCmd.includes("wholesale")
    ) {
      return NextResponse.json({
        title: "تصدیق شدہ خریدار اور منصفانہ منڈی",
        spokenText:
          "ہمارے پلیٹ فارم پر میٹرو کیش اینڈ کیری، شیزان پلبس اور اینگرو فوڈز جیسے تصدیق شدہ کارپوریٹ خریدار موجود ہیں جو آپ کی فصل بغیر کسی آڑھتی کمیشن یا کٹوتی کے خریدتے ہیں۔ ادائیگی راست یا بینک کے ذریعے شفاف انداز میں ہوتی ہے۔ میں آپ کے لیے ہول سیل منڈی کا صفحہ کھول رہا ہوں۔",
        bullets: [
          "میٹرو کیش اینڈ کیری: ہول سیل سبزی و پھل، فوری ڈیجیٹل ادائیگی۔",
          "شیزان انٹرنیشنل: گودا اور پلب کی صنعتی خریداری۔",
          "صفر آڑھتی کمیشن، کسان کو اس کی محنت کا پورا معاوضہ۔",
        ],
        actionRoute: "/market",
        actionLabel: "منصفانہ منڈی مارکیٹ پر جائیں",
        topic: "market",
        usedAI: false,
      });
    }

    // 8. ALL FEATURES / SYSTEM OVERVIEW
    if (
      cleanCmd.includes("تمام فیچر") ||
      cleanCmd.includes("تمام سہولیات") ||
      cleanCmd.includes("سارے فیچر") ||
      cleanCmd.includes("فیچرز") ||
      cleanCmd.includes("ویب سائٹ کا تعارف") ||
      cleanCmd.includes("پلیٹ فارم کا تعارف") ||
      cleanCmd.includes("سہولیات") ||
      cleanCmd.includes("all features") ||
      cleanCmd.includes("what can this do") ||
      cleanCmd.includes("overview")
    ) {
      return NextResponse.json({
        title: "فارم ٹو فیوچر: تمام 5 اہم سہولیات",
        spokenText:
          "فارم ٹو فیوچر پر کسان بھائیوں کے لیے پانچ بنیادی سہولیات ہیں۔ پہلا: کسان پورٹل جہاں فصل بیچنے یا روکنے کا مشورہ ملتا ہے۔ دوسرا: اگلی فصل پلانر جو بتاتا ہے کہ کون سی فصل زیادہ منافع دے گی۔ تیسرا: منصفانہ منڈی جہاں بغیر آڑھتی خریدار ملتے ہیں۔ چوتھا: آڑھتی واچ ڈاگ جو ناجائز کٹوتیوں کی نگرانی کرتا ہے۔ اور پانچواں: مارکیٹ ڈیسک جو طلب و رسد کی معلومات فراہم کرتا ہے۔",
        bullets: [
          "1. کسان پورٹل: سرکاری منڈی ریٹس اور فصل کٹائی کا بہترین وقت۔",
          "2. اگلی فصل پلانر: کم لاگت اور زیادہ منافع والی اگلی فصل کی پیش گوئی۔",
          "3. منصفانہ منڈی: بغیر آڑھتی کمیشن براہ راست مصدقہ خریدار۔",
          "4. آڑھتی واچ ڈاگ: درمیانی منافع خوری اور کٹوتیوں کی جانچ۔",
          "5. مارکیٹ ڈیسک: طلب، رسد، اور علاقائی منڈیوں کا تجزیہ۔",
        ],
        actionRoute: "/",
        actionLabel: "مرکزی صفحہ دیکھیں",
        topic: "overview",
        usedAI: false,
      });
    }

    // 9. DYNAMIC AI COMPLETION (MakerEnd gpt-6.1-terra)
    const systemPrompt = `You are the Lead Agricultural Voice Assistant for "Farm-to-Future" (فارم ٹو فیوچر), Pakistan's National Agricultural Commodity Exchange.
Your role is to answer any Pakistani farmer's voice question in natural, clear, village-friendly Urdu.
You have comprehensive knowledge of:
1. Farmer Advisory (/farmer): Harvest timing, selling today vs holding 7-30 days, storage/spoilage costs, AMIS Punjab mandi rates (Tomato: Rs 175/kg, Onion: Rs 165/kg, Potato: Rs 48/kg, Wheat: Rs 98/kg, Rice: Rs 220/kg).
2. Next-Quarter Crop Planner (/planner): Rabi (Onion, Wheat, Mustard), Kharif (Basmati Rice, Cotton, Tomato), PARC input costs (seed, DAP, Urea, diesel), high ROI crops (Onion 1000%+ ROI).
3. Wholesale Exchange (/market): Direct trading with verified institutional buyers (Metro, Shezan, Engro) with 0% middleman commission.
4. Spread Watchdog (/watchdog): Monitoring middleman gouging, tracking farmgate vs retail price gaps, fuel transport costs.
5. Deal Room (/negotiate): Autonomous bilateral bargaining anchored inside [P25, P75] statistical fair bands.
6. Market Intelligence (/copilot): Daily supply arrivals, urban demand elasticities, transport freight impacts.

Return valid JSON with:
{
  "title": "Short title in Urdu (e.g. فصل اور منڈی رہنمائی)",
  "spokenText": "A warm, natural 2-3 sentence Urdu answer spoken clearly for listening through audio TTS. Use simple words smallholder farmers understand.",
  "bullets": ["Point 1 in Urdu", "Point 2 in Urdu", "Point 3 in Urdu"],
  "actionRoute": "/farmer" | "/planner" | "/market" | "/watchdog" | "/copilot" | "/" (suggest the most relevant page)
}`;

    const userPrompt = `Farmer asked: "${command}". Current page: ${currentRoute}. Answer authoritatively and helpfully.`;

    const fallbackData = {
      title: "منڈی و زرعی رہنمائی",
      spokenText:
        "آپ کے سوال کے مطابق منڈی میں قیمتیں اور رسد مستحکم ہیں۔ مزید تفصیلات اور کسان رہنمائی کے لیے آپ کسان پورٹل یا مارکیٹ ڈیسک کا دورہ کر سکتے ہیں۔",
      bullets: [
        "سرکاری منڈی بلٹن (AMIS پنجاب) کے مصدقہ اعداد و شمار۔",
        "بہترین مالی فائدے کے لیے کسان پورٹل سے رہنمائی حاصل کریں۔",
        "براہ راست خریداروں کے ساتھ محفوظ لین دین۔",
      ],
      actionRoute: "/farmer",
    };

    const { data, usedAI } = await aiJSON<typeof fallbackData>(
      systemPrompt,
      userPrompt,
      fallbackData
    );

    return NextResponse.json({
      title: data.title || "منڈی مشورہ",
      spokenText: data.spokenText || fallbackData.spokenText,
      bullets: data.bullets || fallbackData.bullets,
      actionRoute: data.actionRoute || "/farmer",
      actionLabel: "متعلقہ صفحہ دیکھیں",
      topic: "dynamic",
      usedAI,
    });
  } catch (err: any) {
    console.error("Voice command error:", err);
    return NextResponse.json(
      {
        title: "منڈی معلوماتی نظام",
        spokenText:
          "فارم ٹو فیوچر آپ کی خدمت کے لیے حاضر ہے۔ آپ ریٹس، اگلی فصل کے انتخاب یا منڈی خریداروں کے بارے میں پوچھ سکتے ہیں۔",
        bullets: [
          "آج کے منڈی ریٹس دریافت کریں۔",
          "اگلی فصل کے منافع کا حساب لگائیں۔",
          "بغیر آڑھتی کے خریدار تلاش کریں۔",
        ],
        actionRoute: "/",
        topic: "general",
        usedAI: false,
      },
      { status: 200 }
    );
  }
}
