"use client";

import { useEffect, useRef } from "react";

export default function VisitorPing() {
  const hasSentRef = useRef(false);

  useEffect(() => {
    if (hasSentRef.current) return;
    hasSentRef.current = true;

    const payload = {
      screenWidth: window.screen?.width ?? null,
      screenHeight: window.screen?.height ?? null,
      viewportWidth: window.innerWidth ?? null,
      viewportHeight: window.innerHeight ?? null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
      language: navigator.language ?? null,
      languages: navigator.languages ?? [],
      userAgent: navigator.userAgent ?? null,
      hardwareConcurrency: navigator.hardwareConcurrency ?? null,
      referrer: document.referrer ?? null,
      href: window.location.href ?? null,
    };

    void fetch("/api/metrics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  return null;
}
