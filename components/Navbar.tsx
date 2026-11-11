"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Language, DICTIONARY } from "@/lib/i18n";
import {
  Sprout,
  Store,
  ShieldAlert,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Languages,
} from "lucide-react";
import MarketTicker from "@/components/MarketTicker";
import BrandLogo from "@/components/BrandLogo";

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
}

export default function Navbar({ lang, onToggleLang }: NavbarProps) {
  const pathname = usePathname();
  const t = DICTIONARY[lang];
  const isUrdu = lang === "ur";

  const handleToggle = () => {
    const next = lang === "en" ? "ur" : "en";
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_lang", next);
      window.dispatchEvent(new Event("languageChange"));
    }
    onToggleLang();
  };

  const navLinks = [
    { href: "/farmer", label: isUrdu ? "کسان پورٹل" : "Farmer Advisory", icon: Sprout },
    { href: "/planner", label: isUrdu ? "اگلی فصل پلانر" : "Crop Planner", icon: Calendar },
    { href: "/market", label: isUrdu ? "منصفانہ منڈی" : "Wholesale Exchange", icon: Store },
    { href: "/watchdog", label: isUrdu ? "آڑھتی واچ ڈاگ" : "Spread Watchdog", icon: ShieldAlert },
    { href: "/copilot", label: isUrdu ? "مارکیٹ ڈیسک" : "Market Intelligence", icon: TrendingUp },
  ];

  return (
    <div className="w-full">
      {/* Live Official Mandi Price Ticker (AMIS Punjab & PBS) */}
      <MarketTicker lang={lang} />

      <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE4D8] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo & Authority Seal */}
          <Link href="/" className="flex items-center gap-3 group">
            <BrandLogo lang={lang} size="md" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F5EFEB] p-1.5 rounded-2xl border border-[#E2D8C7] shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    isActive
                      ? "bg-[#0F3E2E] text-white shadow-xs"
                      : "text-[#2A3B30] hover:text-[#0F3E2E] hover:bg-[#EBE2D3]"
                  } ${isUrdu ? "font-urdu text-sm" : ""}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#FBBF24]" : "text-[#134E35]"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Status & Language Toggle */}
          <div className="flex items-center gap-2.5">
            {/* Established Institutional Verification Badge */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold text-[#0F3E2E] bg-[#E8F3EC] px-3 py-1.5 rounded-full border border-[#BDE0CB]">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isUrdu ? "حکومتی منڈی ڈیٹا منسلک" : "AMIS Punjab Verified Feeds"}</span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={handleToggle}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#0F3E2E] hover:bg-[#144E3A] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 border border-[#0A2D21]"
              title="Toggle Language / زبان تبدیل کریں"
            >
              <Languages className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>{lang === "en" ? "اردو (Urdu)" : "English"}</span>
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
