import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/providers/ToastProvider";
import SessionWrapper from "@/components/providers/SessionWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MystiPixel - Minecraft Configuration Repository",
  description: "Discover, share, and monetize Minecraft configurations. From performance tweaks to complete modpack setups.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionWrapper>
          <ToastProvider>
            <Navbar />
            {children}
        <footer className="bg-[var(--surface)] border-t border-[var(--border)] mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold text-[var(--text-primary)] mb-4">MystiPixel</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  The ultimate Minecraft configuration repository and marketplace.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--text-primary)] mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <li><a href="/browse" className="hover:text-[var(--primary)]">Browse Configs</a></li>
                  <li><a href="/marketplace" className="hover:text-[var(--primary)]">Marketplace</a></li>
                  <li><a href="/premium" className="hover:text-[var(--primary)]">Go Premium</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--text-primary)] mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <li><a href="/docs" className="hover:text-[var(--primary)]">Documentation</a></li>
                  <li><a href="/api" className="hover:text-[var(--primary)]">API</a></li>
                  <li><a href="/guides" className="hover:text-[var(--primary)]">Guides</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--text-primary)] mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <li><a href="/about" className="hover:text-[var(--primary)]">About</a></li>
                  <li><a href="/contact" className="hover:text-[var(--primary)]">Contact</a></li>
                  <li><a href="/terms" className="hover:text-[var(--primary)]">Terms</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-[var(--border)] mt-8 pt-8 text-center text-sm text-[var(--text-secondary)]">
              <p>&copy; 2025 MystiPixel. All rights reserved.</p>
            </div>
          </div>
        </footer>
          </ToastProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
