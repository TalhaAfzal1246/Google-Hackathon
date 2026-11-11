import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farm-to-Future | National Mandi Exchange & Harvest Advisory",
  description:
    "Pakistan's Premier Agricultural Commodity Platform. Real-time AMIS & PBS Mandi prices, optimal harvest timing, next-quarter crop planning, and direct grower-to-buyer transparent trading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF7F2] text-[#1E2621] antialiased selection:bg-emerald-700 selection:text-white">
        {children}
      </body>
    </html>
  );
}
