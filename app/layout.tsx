import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import GlobalNotifications from "@/components/GlobalNotifications";
import LiveChatScript from "@/components/LiveChatScript";

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
        <LiveChatScript />
        <GlobalNotifications />
        <Toaster position="bottom-right" richColors theme="dark" />
      </body>
    </html>
  );
}
