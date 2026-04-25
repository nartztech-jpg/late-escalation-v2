import { invokeLLM } from "./_core/llm";
import { Invoice } from "../drizzle/schema";

export interface GeneratedEmail {
  stage: number;
  subject: string;
  body: string;
}

const STAGE_INSTRUCTIONS = {
  1: "Stage 1 (day 3): Warm and friendly. Assume the client simply forgot or the invoice got buried. Make it easy to respond. No pressure.",
  2: "Stage 2 (day 7): Noticeably firmer. State clearly the invoice is now overdue. Still professional, no threats.",
  3: "Stage 3 (day 14): Formal and serious. Reference that continued non-payment may require next steps. Mention late fees if applicable.",
  4: "Stage 4 (day 30): Final written notice before legal action. Mention small claims court specifically. Give a clear 7-day deadline to pay or respond before legal proceedings begin.",
};

const TONE_DESCRIPTIONS = {
  "warm-professional": "warm, professional, and understanding",
  "strictly-professional": "strictly professional and formal",
  "direct": "direct, assertive, and no-nonsense",
};

export async function generateEmailSequence(invoice: Invoice): Promise<GeneratedEmail[]> {
  const emails: GeneratedEmail[] = [];
  const dueDateFormatted = new Date(invoice.dueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  for (let stage = 1; stage <= 4; stage++) {
    const systemPrompt = `You write late payment follow-up emails on behalf of freelancers.
You write in a human, direct voice — not corporate, not template-sounding.
Each email must feel like the natural next step in a professional relationship.
Return only the email content: subject line first (prefix with "Subject: "), 
then a blank line, then the body. No preamble, no commentary.
Keep emails under 200 words.`;

    const userPrompt = `Write stage ${stage} of a 4-stage late payment escalation email.

Freelancer: ${invoice.clientName}
Client company: ${invoice.clientName}
Client first name: ${invoice.clientFirstName}
Invoice number: ${invoice.invoiceNumber}
Amount owed: $${parseFloat(invoice.amount as any).toFixed(2)}
Original due date: ${dueDateFormatted}
Services provided: ${invoice.services}
Tone preference: ${TONE_DESCRIPTIONS[invoice.tone as keyof typeof TONE_DESCRIPTIONS]}

${STAGE_INSTRUCTIONS[stage as keyof typeof STAGE_INSTRUCTIONS]}

Sign off with the freelancer's name. Do not use placeholder brackets.`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const content = response.choices[0]?.message?.content;
      const contentStr = typeof content === "string" ? content : "";
      const [subjectLine, ...bodyLines] = contentStr.split("\n");
      
      const subject = subjectLine.replace(/^Subject:\s*/i, "").trim();
      const body = bodyLines.join("\n").trim();

      emails.push({
        stage,
        subject,
        body,
      });
    } catch (error) {
      console.error(`Failed to generate email for stage ${stage}:`, error);
      throw new Error(`Failed to generate email for stage ${stage}`);
    }
  }

  return emails;
}

export async function generateSingleEmail(
  invoice: Invoice,
  stage: number
): Promise<GeneratedEmail> {
  const dueDateFormatted = new Date(invoice.dueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const systemPrompt = `You write late payment follow-up emails on behalf of freelancers.
You write in a human, direct voice — not corporate, not template-sounding.
Each email must feel like the natural next step in a professional relationship.
Return only the email content: subject line first (prefix with "Subject: "), 
then a blank line, then the body. No preamble, no commentary.
Keep emails under 200 words.`;

  const userPrompt = `Write stage ${stage} of a 4-stage late payment escalation email.

Freelancer: ${invoice.clientName}
Client company: ${invoice.clientName}
Client first name: ${invoice.clientFirstName}
Invoice number: ${invoice.invoiceNumber}
Amount owed: $${parseFloat(invoice.amount as any).toFixed(2)}
Original due date: ${dueDateFormatted}
Services provided: ${invoice.services}
Tone preference: ${TONE_DESCRIPTIONS[invoice.tone as keyof typeof TONE_DESCRIPTIONS]}

${STAGE_INSTRUCTIONS[stage as keyof typeof STAGE_INSTRUCTIONS]}

Sign off with the freelancer's name. Do not use placeholder brackets.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content;
  const contentStr = typeof content === "string" ? content : "";
  const [subjectLine, ...bodyLines] = contentStr.split("\n");
  
  const subject = subjectLine.replace(/^Subject:\s*/i, "").trim();
  const body = bodyLines.join("\n").trim();

  return {
    stage,
    subject,
    body,
  };
}
