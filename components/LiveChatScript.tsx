"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const LIVE_CHAT_HOSTNAMES = new Set(["thebuilderslab.pro", "www.thebuilderslab.pro"]);
const LIVE_CHAT_ID = "697998d7ef829849f40574a1";

export default function LiveChatScript() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isAllowedHost = LIVE_CHAT_HOSTNAMES.has(window.location.hostname);
    const isHomePage = window.location.pathname === "/" || window.location.pathname === "";
    setEnabled(isAllowedHost && isHomePage);
  }, []);

  if (!enabled) return null;

  return (
    <Script
      src="https://cdn.pulse.is/livechat/loader.js"
      data-live-chat-id={LIVE_CHAT_ID}
      strategy="afterInteractive"
    />
  );
}
