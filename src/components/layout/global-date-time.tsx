"use client";

import { useEffect, useState } from "react";

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  hour: "2-digit",
  minute: "2-digit",
});

function getNow() {
  const now = new Date();

  return {
    date: DATE_FORMATTER.format(now),
    time: TIME_FORMATTER.format(now),
  };
}

export function GlobalDateTime() {
  const [current, setCurrent] = useState(getNow);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent(getNow());
    }, 1000 * 30);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="fixed left-3 top-3 z-[60] sm:left-5 sm:top-5">
      <div className="rounded-[18px] border border-white/45 bg-white/78 px-3 py-2 shadow-[0_14px_34px_rgba(35,21,15,0.12)] backdrop-blur md:px-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-strong)] sm:text-[11px]">
          {current.date}
        </p>
        <p className="mt-1 text-sm font-black tracking-[0.08em] text-[var(--foreground)] sm:text-base">
          {current.time}
        </p>
      </div>
    </div>
  );
}
