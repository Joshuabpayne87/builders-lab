"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const LIVE_CHAT_HOSTNAMES = new Set(["thebuilderslab.pro", "www.thebuilderslab.pro"]);
const LIVE_CHAT_ID = "697998d7ef829849f40574a1";
const LIVE_CHAT_SCRIPT_URL = "https://cdn.pulse.is/livechat/loader.js";
const LIVE_CHAT_SELECTORS = [
  `script[src*="pulse.is/livechat/loader.js"]`,
  `iframe[src*="pulse.is"]`,
  `iframe[src*="sendpulse"]`,
  `[data-live-chat-id="${LIVE_CHAT_ID}"]`,
  "#sp-live-chat",
  "#sp-chat-widget",
  ".sp-live-chat",
  ".sp-live-chat-widget",
  "[class*=\"sendpulse\"]",
  "[id*=\"sendpulse\"]",
];

function removeLiveChatWidget() {
  if (typeof document === "undefined") return;
  LIVE_CHAT_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => node.remove());
  });
}

export default function LiveChatScript() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isAllowedHost = LIVE_CHAT_HOSTNAMES.has(window.location.hostname);
    const isAllowedRoute = pathname === "/" || pathname === "/join" || pathname === "";
    const shouldEnable = isAllowedHost && isAllowedRoute;
    setEnabled(shouldEnable);
    document.body.classList.toggle("chat-disabled", !shouldEnable);

    if (!shouldEnable) {
      removeLiveChatWidget();
      const observer = new MutationObserver(() => removeLiveChatWidget());
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
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
