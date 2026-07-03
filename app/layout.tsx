import type { Metadata } from "next";
import { Nunito, DM_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/store/AppStore";
import { TopNav } from "@/components/nav/TopNav";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Al Rehman Flour Mills",
  description: "Flour Mill Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full flex flex-col font-body bg-canvas text-ink antialiased">
        <AppProvider>
          <TopNav />
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
