"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return (
    <header className="header shell">
      <Link className="brand" href="/" aria-label="Yunnan Unfolded home">
        <span className="brand__mark" aria-hidden="true"><i /><b /><em /></span>
        <span className="brand__name">Yunnan <small>Unfolded</small></span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {nav.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
      </nav>
      <Link className="header__cta" href="/plan-my-trip">Plan my trip <span>↗</span></Link>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close menu" : "Open menu"}><span /><span /></button>
      <div className={`mobile-menu${open ? " mobile-menu--open" : ""}`} id="mobile-navigation">
        <nav aria-label="Mobile navigation">{nav.map(([label, href], index) => <Link href={href} key={href} onClick={() => setOpen(false)}><span>0{index + 1}</span>{label}</Link>)}</nav>
        <Link className="button button--gold" href="/plan-my-trip">Plan my trip</Link>
        <p>hello@yunnanunfolded.com</p>
      </div>
    </header>
  );
}
