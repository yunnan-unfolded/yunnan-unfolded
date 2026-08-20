"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const interests = [
  "Mountains & scenery",
  "Hiking & trekking",
  "Ancient towns & villages",
  "Local food & markets",
  "Tea & coffee culture",
  "Local cultures & festivals",
  "Photography",
  "Wildlife & nature",
  "Slow travel & wellness",
  "Family adventures",
  "Hidden routes",
  "Not sure yet",
];

export function QuickInquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const timing = String(data.get("timing") ?? "Not sure yet");
    const selectedInterests = data.getAll("interests").map(String);

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitError("Please complete your name and a valid email address.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          contact: "",
          origin: "",
          timing,
          exactStart: "",
          exactEnd: "",
          length: "",
          party: "",
          travellerCount: "",
          interests: selectedInterests,
          pace: "",
          walking: "",
          accommodation: "",
          places: "",
          budget: "",
          notes: "",
          company: "",
          startedAt,
        }),
      });
      const result = await response.json().catch(() => ({})) as { code?: string; message?: string };
      if (!response.ok) {
        const fallbackErrors: Record<string, string> = {
          INVALID_FORM: "Please review the form and complete the required details.",
          SERVICE_NOT_CONFIGURED: "Our online enquiry service isn’t configured yet. Please try again later.",
          RESEND_REJECTED: "Our email service declined this request. Please review your details or try again shortly.",
          RESEND_UNAVAILABLE: "The server can’t connect to our email service right now. Please try again shortly.",
        };
        throw new Error(result.message || fallbackErrors[result.code ?? ""] || "We couldn’t send your trip idea just now. Please try again.");
      }
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We couldn’t send your trip idea just now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="quick-form" onSubmit={handleSubmit}>
      <div className="quick-form__heading">
        <p className="eyebrow">A 30-second start</p>
        <h2 id="quick-inquiry-title">Start with a few details</h2>
        <p>Tell us when you’d like to travel and what interests you—we’ll take it from there.</p>
      </div>

      <div className="quick-form__row">
        <label><span>Your name</span><input name="name" type="text" autoComplete="name" required /></label>
        <label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
      </div>

      <label className="quick-form__field">
        <span>When are you thinking of travelling?</span>
        <select name="timing" defaultValue="Not sure yet">
          <option>Not sure yet</option><option>January–March</option><option>April–June</option><option>July–September</option><option>October–December</option>
        </select>
      </label>

      <fieldset className="quick-form__interests">
        <legend>What would you love to experience?</legend>
        <div>{interests.map((interest) => <label key={interest}><input type="checkbox" name="interests" value={interest} /><span>{interest}</span></label>)}</div>
      </fieldset>

      <button className="button button--gold quick-form__submit" type="submit" disabled={submitting || submitted} aria-busy={submitting}>
        {submitting ? "Sending your trip idea…" : submitted ? "Trip idea sent" : "Send my trip idea"} <span>↗</span>
      </button>
      {submitted && <p className="quick-form__status" role="status">Thank you. We’ve received your trip idea and will be in touch within 24 hours.</p>}
      {submitError && <p className="quick-form__status" role="alert">{submitError} Your details are still here, so you can try again.</p>}
      <p className="quick-form__detail">Already have a detailed plan? <Link href="/plan-my-trip">Complete our full trip planner →</Link></p>
    </form>
  );
}
