import type { Metadata } from "next";
import { Nunito, DM_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { AppProvider } from "@/store/AppStore";
import { Sidebar } from "@/components/nav/Sidebar";

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
      <body className="min-h-full font-body bg-canvas text-ink antialiased">
        <SessionProvider>
          <AppProvider>
            <div className="flex min-h-screen lg:flex-row flex-col">
              <Sidebar />
              <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 sm:py-10">
                <div className="max-w-4xl mx-auto">{children}</div>
              </main>
            </div>
          </AppProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
