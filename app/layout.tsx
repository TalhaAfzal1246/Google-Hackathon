import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farm-to-Future | AI Mandi Forecaster & Fair-Trade Exchange",
  description:
    "AI-powered predictive harvest advisory, bilateral fair-trade negotiation room, and middleman spread watchdog for Pakistani agriculture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
