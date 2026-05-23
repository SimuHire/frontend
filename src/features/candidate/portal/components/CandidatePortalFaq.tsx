'use client';

const faqItems: { id: string; question: string; answer: string }[] = [
  {
    id: 'what-is-trial',
    question: 'What is a Trial?',
    answer:
      'A Winoe Trial is five focused days where you show how you plan, build, hand off, and reflect — on realistic work, not trivia.',
  },
  {
    id: 'how-long',
    question: 'How long does each day take?',
    answer:
      'Most candidates spend a full working day on Days 1–4, and a bit longer on Day 5 for reflection. Pace yourself; the calendar windows are there so you have clear guardrails.',
  },
  {
    id: 'ai-tools',
    question: 'Can I use AI tools?',
    answer:
      'Yes. Winoe evaluates the quality of your decisions and outcomes, not whether code was hand-typed. Use the tools you’d actually use on the job.',
  },
  {
    id: 'miss-deadline',
    question: 'What if I miss a deadline?',
    answer:
      'Reach out early — we’ll help you find a path forward. The Trial runs on a schedule so everyone’s time is respected, but life happens.',
  },
];

export function CandidatePortalFaq() {
  return (
    <section
      className="mx-auto max-w-3xl space-y-3 px-6 pb-10"
      aria-label="FAQ"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Questions
      </h2>
      <div className="space-y-2">
        {faqItems.map((item) => (
          <details
            key={item.id}
            className="group rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <summary className="cursor-pointer list-none text-sm font-medium text-gray-900 outline-none marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                {item.question}
                <span
                  className="text-wheat-600 transition group-open:rotate-180"
                  aria-hidden
                >
                  ↓
                </span>
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
