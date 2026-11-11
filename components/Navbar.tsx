"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Language, DICTIONARY } from "@/lib/i18n";
import { Sparkles, Sprout, Store, ShieldAlert, HelpCircle, Info } from "lucide-react";
import MarketTicker from "@/components/MarketTicker";

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
}

export default function Navbar({ lang, onToggleLang }: NavbarProps) {
  const pathname = usePathname();
  const t = DICTIONARY[lang];
  const isUrdu = lang === "ur";

  const navLinks = [
    { href: "/farmer", label: isUrdu ? "کسان پورٹل" : "Farmer Portal", icon: Sprout },
    { href: "/market", label: isUrdu ? "منصفانہ منڈی" : "Live Exchange", icon: Store },
    { href: "/watchdog", label: isUrdu ? "آڑھتی واچ ڈاگ" : "Spread Watchdog", icon: ShieldAlert },
    { href: "/copilot", label: isUrdu ? "رسد و طلب AI" : "Supply & Demand AI", icon: HelpCircle },
    { href: "/about", label: isUrdu ? "ماڈل شفافیت" : "Responsible AI", icon: Info },
  ];

  return (
    <div className="w-full">
      {/* Live Official Mandi Price Ticker (AMIS Punjab & PBS) */}
      <MarketTicker lang={lang} />

      <header className="sticky top-0 z-50 bg-[#fbfbfa]/95 backdrop-blur-md border-b border-emerald-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-all">
              <Sprout className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  {t.appTitle}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300/60 hidden sm:inline-block">
                  AgriTech AI
                </span>
              </div>
              <p className="text-[11px] text-emerald-800/80 font-medium hidden sm:block">
                {isUrdu ? "پاکستان کی زرعی منڈی کا سمارٹ نظام" : "Pakistan Mandi Price Intelligence"}
              </p>
            </div>
          </Link>

          {/* Navigation items */}
          <nav className="hidden md:flex items-center gap-1 bg-white/70 p-1 rounded-xl border border-emerald-900/10 shadow-xs">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "text-slate-700 hover:text-emerald-900 hover:bg-emerald-50/80"
                  } ${isUrdu ? "font-urdu text-sm" : ""}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-300" : "text-emerald-700"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900 bg-emerald-50/90 px-3 py-1 rounded-full border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>GPT-6.1 Terra</span>
            </div>

            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95"
              title="Toggle Language"
            >
              <span>{lang === "en" ? "اردو (Urdu)" : "English"}</span>
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
