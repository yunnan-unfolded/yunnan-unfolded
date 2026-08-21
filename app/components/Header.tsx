"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { assetPath } from "../lib/sitePaths";

const nav = [
  ["Journeys", "/journeys"],
  ["Walk Yunnan", "/walk-yunnan"],
  ["Travel Guides", "/travel-guides"],
  ["About", "/about"],
];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    if (open) document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("menu-open");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <header className="header shell">
      <Link className="brand" href="/" aria-label="Yunnan Unfolded home">
        <Image className="brand__logo" src={assetPath("/brand/logo-horizontal-light.svg")} alt="" width={700} height={190} priority />
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {nav.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
      </nav>
      <Link className="header__cta" href="/plan-my-trip">Plan my trip <span>↗</span></Link>
      <button
        type="button"
        className="menu-button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span />
        <span />
      </button>
      <div
        className={`mobile-menu${open ? " mobile-menu--open" : ""}`}
        id="mobile-navigation"
        aria-hidden={!open}
      >
        <nav aria-label="Mobile navigation">
          {nav.map(([label, href], index) => (
            <Link href={href} key={href} onClick={() => setOpen(false)}>
              <span>0{index + 1}</span>{label}
            </Link>
          ))}
        </nav>
        <Link className="button button--gold" href="/plan-my-trip" onClick={() => setOpen(false)}>Plan my trip</Link>
        <p>hello@yunnanunfolded.com</p>
      </div>
    </header>
  );
}
