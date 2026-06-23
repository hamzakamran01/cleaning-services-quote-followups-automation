export const DEFAULT_SEQUENCES = [
  {
    id: "seq-a",
    name: "SEQ-A: Gentle Nudge",
    triggerEvent: "not_opened_48h",
    delayHours: 48,
    sequenceOrder: 1,
    subjectPrompt: "Quick check-in about the proposal for {companyName}",
    bodyPrompt:
      "Write a short 3-sentence email confirming they received the proposal for {companyName}. Offer to answer questions or schedule a call. Reference the {monthlyPrice} monthly proposal.",
    isActive: true,
  },
  {
    id: "seq-b",
    name: "SEQ-B: Value Follow-up",
    triggerEvent: "opened_no_reply_24h",
    delayHours: 24,
    sequenceOrder: 2,
    subjectPrompt: "One thing {companyName}'s cleaning company should know",
    bodyPrompt:
      "Write a value-add follow-up for a {facilityType} facility. Include one industry-specific insight and a soft CTA to schedule a walkthrough. Reference their proposal.",
    isActive: true,
  },
  {
    id: "seq-c",
    name: "SEQ-C: Hot Alert",
    triggerEvent: "viewed_3x",
    delayHours: 1,
    sequenceOrder: 3,
    subjectPrompt: "Are you ready to move forward, {contactName}?",
    bodyPrompt:
      "The prospect viewed the proposal 3+ times. Write an urgent but professional email offering a 10-minute call this week to answer remaining questions about the {monthlyPrice}/mo proposal.",
    isActive: true,
  },
  {
    id: "seq-d",
    name: "SEQ-D: Final Attempt",
    triggerEvent: "no_response_7d",
    delayHours: 168,
    sequenceOrder: 4,
    subjectPrompt: "Should I close your file, {contactName}?",
    bodyPrompt:
      "Write a breakup email. Mention you've reached out a few times about the cleaning proposal for {companyName}. Give them an easy out but invite them to reply if timing changes.",
    isActive: true,
  },
] as const;

export type SequenceTrigger = (typeof DEFAULT_SEQUENCES)[number]["triggerEvent"];
