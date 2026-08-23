"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type EnquirySuccessProps = {
  className?: string;
  resetLabel: string;
  onReset: () => void;
};

export function EnquirySuccess({ className = "", resetLabel, onReset }: EnquirySuccessProps) {
  const confirmationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const confirmation = confirmationRef.current;
    if (!confirmation) return;

    confirmation.focus({ preventScroll: true });

    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    const bounds = confirmation.getBoundingClientRect();
    const isOutsideViewport = bounds.top < 0 || bounds.bottom > window.innerHeight;

    if (isMobile && isOutsideViewport) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      confirmation.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
    }
  }, []);

  return (
    <div
      className={`enquiry-success ${className}`.trim()}
      ref={confirmationRef}
      role="status"
      aria-live="polite"
      tabIndex={-1}
    >
      <span className="enquiry-success__mark" aria-hidden="true" />
      <p className="enquiry-success__eyebrow">Enquiry received</p>
      <h2 className="enquiry-success__title">Thank you — we’ve received your trip idea.</h2>
      <p className="enquiry-success__message">A member of our Yunnan-based team will reply personally within 24&nbsp;hours.</p>
      <div className="enquiry-success__actions">
        <button className="enquiry-success__reset" type="button" onClick={onReset}>{resetLabel}</button>
        <Link className="enquiry-success__home" href="/">Return to the homepage</Link>
      </div>
    </div>
  );
}
