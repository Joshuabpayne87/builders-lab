import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ExitIntentModal } from "./components/ExitIntentModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Builder's Lab - AI Toolkit",
  description: "Your unified AI productivity suite",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="bottom-right" richColors theme="dark" />
        <ExitIntentModal />
      </body>
    </html>
  );
}
