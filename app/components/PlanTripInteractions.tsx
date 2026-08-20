"use client";

import { ReactNode, useState } from "react";
import styles from "../plan-my-trip/plan-my-trip.module.css";

const faqs = [
  {
    question: "Do I need to know exactly where I want to go?",
    answer: "Not at all. Many travellers come to us with only a season, a few interests or a place they have seen in a photograph. Helping you understand what fits together is part of the planning process.",
  },
  {
    question: "How quickly will you reply?",
    answer: "We reply personally within 24 hours. If your enquiry arrives during a public holiday or while our team is travelling in a remote part of Yunnan, we’ll still let you know when to expect a fuller response.",
  },
  {
    question: "Can you provide an English-speaking guide?",
    answer: "Yes. We can arrange English-speaking local guides according to the route and style of your journey.",
  },
  {
    question: "Will there be shopping stops?",
    answer: "There are no compulsory shopping stops. If you are genuinely interested in local markets, tea, crafts or regional products, we can include these experiences at your request.",
  },
  {
    question: "How does payment work?",
    answer: "Once you are happy with the itinerary, a 50% deposit confirms the journey. The remaining balance is due before the journey begins. The full schedule and terms will be clearly provided before you confirm.",
  },
  {
    question: "What happens if my plans change?",
    answer: "You may cancel 30 days or more before departure for a full refund, in accordance with the terms of your travel contract. If your plans change closer to departure, we’ll explain any costs already committed and help find the fairest possible solution.",
  },
  {
    question: "Can you help with dietary needs, children or mobility considerations?",
    answer: "Yes. Tell us as much as you feel comfortable sharing in the enquiry form. We’ll take these needs into account when considering routes, accommodation, meals, altitude and daily pacing.",
  },
];

export function PlannerJumpLink({ className, children }: { className: string; children: ReactNode }) {
  function jumpToPlanner() {
    const planner = document.getElementById("travel-brief");
    if (!planner) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    planner.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => window.dispatchEvent(new Event("trip-planner:focus")), reducedMotion ? 0 : 450);
  }

  return <button className={className} type="button" onClick={jumpToPlanner}>{children}</button>;
}

export function PlanTripFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className={styles.faqList}>
      {faqs.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <article className={styles.faqItem} key={item.question}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{item.question}</span>
                <i aria-hidden="true" />
              </button>
            </h3>
            <div
              className={`${styles.faqAnswer}${isOpen ? ` ${styles.faqAnswerOpen}` : ""}`}
              id={`faq-answer-${index}`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
              hidden={!isOpen}
            >
              <p>{item.answer}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
