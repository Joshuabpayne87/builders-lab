"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const LIVE_CHAT_HOSTNAMES = new Set(["thebuilderslab.pro", "www.thebuilderslab.pro"]);
const LIVE_CHAT_ID = "697998d7ef829849f40574a1";
const LIVE_CHAT_SCRIPT_URL = "https://cdn.pulse.is/livechat/loader.js";

function removeLiveChatWidget() {
  if (typeof document === "undefined") return;
  document
    .querySelectorAll(`script[src*="pulse.is/livechat/loader.js"]`)
    .forEach((node) => node.remove());
  document
    .querySelectorAll(`iframe[src*="pulse.is"]`)
    .forEach((node) => node.remove());
  document
    .querySelectorAll(`[data-live-chat-id="${LIVE_CHAT_ID}"]`)
    .forEach((node) => node.remove());
}

export default function LiveChatScript() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isAllowedHost = LIVE_CHAT_HOSTNAMES.has(window.location.hostname);
    const isHomePage = pathname === "/" || pathname === "";
    const shouldEnable = isAllowedHost && isHomePage;
    setEnabled(shouldEnable);

    if (!shouldEnable) {
      removeLiveChatWidget();
    }
  }, [pathname]);

  if (!enabled) return null;

  return (
    <Script
      src={LIVE_CHAT_SCRIPT_URL}
      data-live-chat-id={LIVE_CHAT_ID}
      strategy="afterInteractive"
    />
  );
}
