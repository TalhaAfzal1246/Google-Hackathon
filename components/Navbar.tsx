"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Language, DICTIONARY } from "@/lib/i18n";
import { Sparkles, Sprout, Store, ShieldAlert, HelpCircle, Info } from "lucide-react";

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
}

export default function Navbar({ lang, onToggleLang }: NavbarProps) {
  const pathname = usePathname();
  const t = DICTIONARY[lang];
  const isUrdu = lang === "ur";

  const navLinks = [
    { href: "/farmer", label: isUrdu ? "کسان ڈیش بورڈ" : "Farmer Advisory", icon: Sprout },
    { href: "/market", label: isUrdu ? "منصفانہ منڈی" : "Live Marketplace", icon: Store },
    { href: "/watchdog", label: isUrdu ? "آڑھتی واچ ڈاگ" : "Spread Watchdog", icon: ShieldAlert },
    { href: "/copilot", label: isUrdu ? "رسد و طلب AI" : "Supply & Demand AI", icon: HelpCircle },
    { href: "/about", label: isUrdu ? "شفافیت و ماڈل" : "Responsible AI & Tech", icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                {t.appTitle}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                GDGoC Hackathon
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {isUrdu ? "پاکستان کی زرعی منڈی کا سمارٹ نظام" : "Pakistan Agri Intelligence"}
            </p>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                } ${isUrdu ? "font-urdu text-base" : ""}`}
              >
                <Icon className="w-4 h-4 text-emerald-600" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions: Language toggle + Google badge */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Gemini 3.8 Flash</span>
          </div>

          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
            title="Toggle Language"
          >
            <span>{lang === "en" ? "اردو (Urdu)" : "English"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
