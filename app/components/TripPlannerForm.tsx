"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import styles from "../plan-my-trip/plan-my-trip.module.css";
import { submitEnquiry } from "../lib/enquiryClient";
import { EnquirySuccess } from "./EnquirySuccess";

const timingOptions = [
  "I have exact dates",
  "I know the approximate month",
  "My dates are flexible",
  "I’m not sure yet",
];

const lengthOptions = ["4–6 days", "7–9 days", "10–14 days", "15 days or more", "I’m not sure yet"];
const partyOptions = ["Travelling on my own", "A couple", "Family with children", "Friends", "A private group"];

const interestOptions = [
  "Mountains and dramatic landscapes",
  "Hiking and trekking",
  "Ancient towns and old villages",
  "Local cultures and traditions",
  "Food, markets and family kitchens",
  "Tea and coffee",
  "Photography",
  "Wildlife and nature",
  "Rice terraces and rural life",
  "Festivals and seasonal experiences",
  "Slow travel and quiet places",
  "Family-friendly experiences",
  "Wellness and time to recharge",
  "Hidden places away from the usual routes",
  "I’m not sure yet—I’d love your advice",
];

const preferenceGroups = [
  {
    key: "pace" as const,
    label: "Preferred pace",
    options: ["Slow and spacious", "A balanced rhythm", "I like to see as much as possible", "I’m not sure yet"],
  },
  {
    key: "walking" as const,
    label: "Walking and hiking",
    options: ["Gentle walks", "Occasional half-day hikes", "Full-day hikes", "Multi-day trekking", "I’d prefer very little walking", "I’m not sure yet"],
  },
  {
    key: "accommodation" as const,
    label: "Accommodation style",
    options: ["Simple places with local character", "Comfortable boutique hotels", "High-end stays", "A thoughtful mix", "I’m open to your suggestions"],
  },
];

const budgetOptions = [
  "I’d like some guidance",
  "Under US$1,500 per person",
  "US$1,500–2,500 per person",
  "US$2,500–4,000 per person",
  "US$4,000+ per person",
];

type FormState = {
  name: string;
  email: string;
  contact: string;
  origin: string;
  timing: string;
  exactStart: string;
  exactEnd: string;
  length: string;
  party: string;
  travellerCount: string;
  interests: string[];
  pace: string;
  walking: string;
  accommodation: string;
  places: string;
  budget: string;
  notes: string;
  company: string;
  startedAt: number;
};

const initialState: FormState = {
  name: "",
  email: "",
  contact: "",
  origin: "",
  timing: "",
  exactStart: "",
  exactEnd: "",
  length: "",
  party: "",
  travellerCount: "",
  interests: [],
  pace: "",
  walking: "",
  accommodation: "",
  places: "",
  budget: "",
  notes: "",
  company: "",
  startedAt: 0,
};

function ChoiceGroup({ name, label, options, value, onChange, className = "" }: {
  name: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <fieldset className={`${styles.choiceGroup} ${className}`}>
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <label key={option}>
            <input type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function StepFrame({ title, titleRef, children }: { title: string; titleRef: React.RefObject<HTMLLegendElement | null>; children: ReactNode }) {
  return (
    <fieldset className={styles.step}>
      <legend ref={titleRef} tabIndex={-1}>{title}</legend>
      {children}
    </fieldset>
  );
}

export function TripPlannerForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormState>(() => ({ ...initialState, startedAt: Date.now() }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const stepTitleRef = useRef<HTMLLegendElement>(null);
  const previousStep = useRef(1);
  const submittingRef = useRef(false);
  const focusAfterResetRef = useRef(false);

  useEffect(() => {
    if (previousStep.current !== step) {
      stepTitleRef.current?.focus({ preventScroll: true });
      previousStep.current = step;
    }
  }, [step]);

  useEffect(() => {
    function focusPlanner() {
      const firstIncomplete = !formData.name.trim()
        ? formRef.current?.querySelector<HTMLInputElement>('[name="name"]')
        : !formData.email.trim()
          ? formRef.current?.querySelector<HTMLInputElement>('[name="email"]')
          : formRef.current?.querySelector<HTMLElement>("input:not([tabindex='-1']), textarea, button");
      firstIncomplete?.focus({ preventScroll: true });
    }
    window.addEventListener("trip-planner:focus", focusPlanner);
    return () => window.removeEventListener("trip-planner:focus", focusPlanner);
  }, [formData.email, formData.name]);

  useEffect(() => {
    if (!submitted && step === 1 && focusAfterResetRef.current) {
      focusAfterResetRef.current = false;
      formRef.current?.querySelector<HTMLInputElement>('[name="name"]')?.focus({ preventScroll: true });
    }
  }, [step, submitted]);

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: "" }));
  }

  function setChoice(field: keyof FormState, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function toggleInterest(interest: string) {
    setFormData((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest],
    }));
  }

  function validateCurrentStep() {
    const nextErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name.trim()) nextErrors.name = "Please tell us your name.";
      if (!formData.email.trim()) nextErrors.email = "Please enter your email address.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = "Please enter a valid email address.";
    }
    if (step === 2 && formData.timing === "I have exact dates") {
      if (!formData.exactStart) nextErrors.exactStart = "Please choose your arrival date.";
      if (!formData.exactEnd) nextErrors.exactEnd = "Please choose your departure date.";
      if (formData.exactStart && formData.exactEnd && formData.exactEnd < formData.exactStart) nextErrors.exactEnd = "The departure date needs to be after the arrival date.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function continueForm() {
    if (!validateCurrentStep()) {
      window.setTimeout(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
      return;
    }
    setStep((current) => Math.min(5, current + 1));
  }

  function goBack() {
    setErrors({});
    setSubmitError(null);
    setStep((current) => Math.max(1, current - 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 5) {
      continueForm();
      return;
    }
    if (submittingRef.current || submitted) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitEnquiry({ source: "detailed", ...formData });
      if (!result.ok) throw new Error(result.message);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We couldn’t send your enquiry just now. Please try again.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  function resetForm() {
    submittingRef.current = false;
    focusAfterResetRef.current = true;
    previousStep.current = 1;
    setFormData({ ...initialState, startedAt: Date.now() });
    setErrors({});
    setSubmitError(null);
    setSubmitting(false);
    setStep(1);
    setSubmitted(false);
  }

  if (submitted) {
    return <EnquirySuccess className={styles.success} resetLabel="Plan another journey" onReset={resetForm} />;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate ref={formRef}>
      <div className={styles.formHeading}>
        <p className={styles.formEyebrow}>Your travel brief</p>
        <h2>Let’s begin with what you know.</h2>
        <p>A few thoughtful details are all we need to start. Nothing has to be final, and it’s perfectly fine if you’re not yet sure where in Yunnan you’d like to go.</p>
      </div>

      <div className={styles.progressRow} aria-live="polite">
        <span>Step {String(step).padStart(2, "0")} of 05</span>
        <div className={styles.progressTrack} aria-hidden="true"><span style={{ width: `${step * 20}%` }} /></div>
      </div>

      <div className={styles.stepViewport} key={step}>
        {step === 1 ? (
          <StepFrame title="First, a little about you" titleRef={stepTitleRef}>
            <label className={styles.field}>
              <span>Your name *</span>
              <input name="name" type="text" autoComplete="name" value={formData.name} onChange={updateField} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />
              {errors.name ? <small className={styles.error} id="name-error">{errors.name}</small> : null}
            </label>
            <label className={styles.field}>
              <span>Email address *</span>
              <input name="email" type="email" autoComplete="email" inputMode="email" value={formData.email} onChange={updateField} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />
              {errors.email ? <small className={styles.error} id="email-error">{errors.email}</small> : null}
            </label>
            <label className={styles.field}>
              <span>WhatsApp / WeChat</span>
              <input name="contact" type="text" autoComplete="tel" value={formData.contact} onChange={updateField} aria-describedby="contact-help" />
              <small id="contact-help">Optional, but helpful if you prefer to talk there.</small>
            </label>
            <label className={styles.field}>
              <span>Where are you travelling from?</span>
              <input name="origin" type="text" autoComplete="country-name" value={formData.origin} onChange={updateField} aria-describedby="origin-help" />
              <small id="origin-help">This helps us understand your arrival route and any practical considerations.</small>
            </label>
          </StepFrame>
        ) : null}

        {step === 2 ? (
          <StepFrame title="When are you thinking of travelling?" titleRef={stepTitleRef}>
            <ChoiceGroup name="timing" label="When would you like to visit Yunnan?" options={timingOptions} value={formData.timing} onChange={(value) => setChoice("timing", value)} />
            {formData.timing === "I have exact dates" ? (
              <div className={styles.twoColumns}>
                <label className={styles.field}>
                  <span>Arrival date *</span>
                  <input name="exactStart" type="date" value={formData.exactStart} onChange={updateField} aria-invalid={Boolean(errors.exactStart)} aria-describedby={errors.exactStart ? "arrival-error" : undefined} />
                  {errors.exactStart ? <small className={styles.error} id="arrival-error">{errors.exactStart}</small> : null}
                </label>
                <label className={styles.field}>
                  <span>Departure date *</span>
                  <input name="exactEnd" type="date" min={formData.exactStart || undefined} value={formData.exactEnd} onChange={updateField} aria-invalid={Boolean(errors.exactEnd)} aria-describedby={errors.exactEnd ? "departure-error" : undefined} />
                  {errors.exactEnd ? <small className={styles.error} id="departure-error">{errors.exactEnd}</small> : null}
                </label>
              </div>
            ) : null}
            <ChoiceGroup name="length" label="How many days would you like to spend in Yunnan?" options={lengthOptions} value={formData.length} onChange={(value) => setChoice("length", value)} />
            <ChoiceGroup name="party" label="Who will be travelling?" options={partyOptions} value={formData.party} onChange={(value) => setChoice("party", value)} />
            <label className={styles.field}>
              <span>How many travellers will there be?</span>
              <input name="travellerCount" type="number" min="1" max="50" inputMode="numeric" value={formData.travellerCount} onChange={updateField} />
            </label>
          </StepFrame>
        ) : null}

        {step === 3 ? (
          <StepFrame title="What draws you to Yunnan?" titleRef={stepTitleRef}>
            <p className={styles.stepIntro}>Choose as many as you like. These simply help us understand what you would enjoy most.</p>
            <div className={styles.chips} role="group" aria-label="Travel interests">
              {interestOptions.map((interest) => (
                <label key={interest}>
                  <input type="checkbox" name="interests" value={interest} checked={formData.interests.includes(interest)} onChange={() => toggleInterest(interest)} />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
          </StepFrame>
        ) : null}

        {step === 4 ? (
          <StepFrame title="How do you like to travel?" titleRef={stepTitleRef}>
            <div className={styles.preferenceGrid}>
              {preferenceGroups.map((group) => (
                <ChoiceGroup key={group.key} name={group.key} label={group.label} options={group.options} value={formData[group.key]} onChange={(value) => setChoice(group.key, value)} className={styles.preferenceGroup} />
              ))}
            </div>
          </StepFrame>
        ) : null}

        {step === 5 ? (
          <StepFrame title="A few final details" titleRef={stepTitleRef}>
            <label className={styles.field}>
              <span>Are there any places already on your mind?</span>
              <input name="places" type="text" value={formData.places} onChange={updateField} placeholder="For example: Dali, Lijiang, Shangri-La, Meili Snow Mountain or Yuanyang" />
            </label>
            <ChoiceGroup name="budget" label="What budget would feel comfortable for this journey?" options={budgetOptions} value={formData.budget} onChange={(value) => setChoice("budget", value)} />
            <p className={styles.choiceHelp}>An approximate range is enough. This helps us recommend the right balance of accommodation, transport and experiences.</p>
            <label className={styles.field}>
              <span>Is there anything else you’d like us to know?</span>
              <textarea name="notes" rows={5} value={formData.notes} onChange={updateField} placeholder="Tell us about a special occasion, dietary needs, mobility considerations, altitude concerns, children travelling with you, or simply the kind of moments you hope to remember." />
            </label>
            <div className={styles.personalNote}>
              <p>We read every enquiry personally. You’ll hear from our Kunming-based team within 24 hours, with no pressure to book.</p>
            </div>
          </StepFrame>
        ) : null}
      </div>

      <label className={styles.honeypot} aria-hidden="true">
        Company
        <input name="company" type="text" value={formData.company} onChange={updateField} tabIndex={-1} autoComplete="off" />
      </label>

      {submitError ? <p className={styles.submitError} role="alert">{submitError} Your details are still here, so you can try again.</p> : null}

      <div className={styles.formActions}>
        {step > 1 ? <button className={styles.backButton} type="button" onClick={goBack} disabled={submitting}>Back</button> : <span />}
        {step < 5 ? (
          <button key="continue" className={styles.continueButton} type="button" onClick={continueForm}>Continue</button>
        ) : (
          <button key="submit" className={styles.continueButton} type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? "Sending your ideas…" : "Send my travel ideas"}
          </button>
        )}
      </div>
      {step === 5 ? <p className={styles.privacy}>Your details will only be used to help plan your journey. We won’t add you to a mailing list or share your information for marketing.</p> : null}
    </form>
  );
}
