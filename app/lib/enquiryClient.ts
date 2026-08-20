export type EnquirySource = "homepage" | "detailed";

export type EnquirySubmission = {
  source: EnquirySource;
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

export type EnquiryResult = {
  ok: boolean;
  code?: string;
  message: string;
};

const endpoint = process.env.NEXT_PUBLIC_ENQUIRY_API_URL?.trim();

function getEndpoint() {
  if (!endpoint) return null;

  try {
    const url = new URL(endpoint);
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && !(isLocal && url.protocol === "http:")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function submitEnquiry(submission: EnquirySubmission): Promise<EnquiryResult> {
  const url = getEndpoint();
  if (!url) {
    return {
      ok: false,
      code: "SERVICE_NOT_CONFIGURED",
      message: "Our online enquiry service isn’t configured yet. Please try again later.",
    };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });
    const result = await response.json().catch(() => null) as EnquiryResult | null;

    if (!response.ok || !result?.ok) {
      return {
        ok: false,
        code: result?.code || "REQUEST_FAILED",
        message: result?.message || "We couldn’t send your enquiry just now. Please try again shortly.",
      };
    }

    return result;
  } catch {
    return {
      ok: false,
      code: "SERVICE_UNAVAILABLE",
      message: "The server can’t connect to our email service right now. Please try again shortly.",
    };
  }
}
