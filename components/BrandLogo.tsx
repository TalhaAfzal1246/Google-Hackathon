"use client";

interface BrandLogoProps {
  lang?: "en" | "ur";
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
}

export default function BrandLogo({
  lang = "en",
  size = "md",
  showSubtitle = true,
}: BrandLogoProps) {
  const isUrdu = lang === "ur";

  const sizeMap = {
    sm: { icon: "w-8 h-8", title: "text-base", sub: "text-[10px]" },
    md: { icon: "w-9 h-9 sm:w-10 sm:h-10", title: "text-base sm:text-lg", sub: "text-[10px] sm:text-[11px]" },
    lg: { icon: "w-11 h-11 sm:w-12 sm:h-12", title: "text-lg sm:text-xl", sub: "text-xs" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 select-none">
      {/* Official Agro-Exchange Emblem SVG */}
      <div
        className={`${currentSize.icon} rounded-xl bg-gradient-to-br from-[#0E3E28] via-[#134E35] to-[#1E6B47] flex items-center justify-center p-1.5 shadow-sm shadow-emerald-950/20 border border-emerald-600/30 group-hover:scale-105 transition-transform shrink-0`}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Subtle Outer Protective Ring */}
          <circle
            cx="18"
            cy="18"
            r="16"
            stroke="#D97706"
            strokeWidth="1.2"
            strokeDasharray="2 3"
            strokeOpacity="0.7"
          />

          {/* Golden Sun / Horizon Arch */}
          <path
            d="M9 22C11.5 15.5 24.5 15.5 27 22"
            stroke="#F59E0B"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Central Golden Wheat Head */}
          <path
            d="M18 7V28"
            stroke="#FDE68A"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Left Grain Grains */}
          <path
            d="M18 10C15.8 11.2 14.5 13.8 14.8 15.8C16.8 15.5 18 14 18 14"
            fill="#FBBF24"
          />
          <path
            d="M18 15C15.5 16.5 14.2 19 14.6 21C16.8 20.6 18 19 18 19"
            fill="#F59E0B"
          />

          {/* Right Sprouting Leaf */}
          <path
            d="M18 12C20.5 13 22.5 15 22.2 17.5C20 17.5 18 16 18 16"
            fill="#34D399"
          />
          <path
            d="M18 17C21 18.2 22.8 20.8 22.2 23C20 22.8 18 21 18 21"
            fill="#10B981"
          />

          {/* Foundation Furrows / Soil Base */}
          <path
            d="M11 27C13.5 28.5 22.5 28.5 25 27"
            stroke="#A7F3D0"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Typographic Identity */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span
            className={`font-black tracking-tight text-[#14231B] leading-none whitespace-nowrap ${currentSize.title} ${
              isUrdu ? "font-urdu text-base sm:text-lg" : ""
            }`}
          >
            {isUrdu ? "فارم ٹو فیوچر" : "Farm-to-Future"}
          </span>
          <span className="text-[9px] uppercase tracking-wider font-extrabold bg-[#F5EFEB] text-[#853E06] px-1.5 sm:px-2 py-0.5 rounded-md border border-[#E2D8C7] hidden md:inline-block whitespace-nowrap">
            {isUrdu ? "قومی منڈی" : "National Exchange"}
          </span>
        </div>

        {showSubtitle && (
          <p
            className={`text-[#2F5233] font-semibold leading-tight mt-0.5 hidden sm:block whitespace-nowrap ${currentSize.sub} ${
              isUrdu ? "font-urdu text-[11px]" : ""
            }`}
          >
            {isUrdu
              ? "پاکستان کا قومی زرعی و اجناس پلیٹ فارم"
              : "Pakistan Mandi Commodity Exchange"}
          </p>
        )}
      </div>
    </div>
  );
}
