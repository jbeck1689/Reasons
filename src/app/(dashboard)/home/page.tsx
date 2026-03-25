import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <div className="text-accent-400 text-2xl mb-4">◆</div>
        <h1 className="text-3xl font-serif font-semibold text-surface-100 mb-3">
          What are you working on?
        </h1>
        <p className="text-surface-500 text-sm max-w-md mx-auto leading-relaxed">
          Two paths, one principle: see clearly what&apos;s actually happening.
        </p>
      </div>

      <div className="space-y-4">
        {/* Practical Reasoning */}
        <Link
          href="/courses?branch=reasoning"
          className="block p-6 rounded-lg border border-surface-700/50 bg-surface-850 hover:border-accent-700/40 hover:bg-surface-800 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-serif font-medium text-surface-100 mb-2 group-hover:text-accent-300 transition-colors">
                Practical Reasoning
              </h2>
              <p className="text-sm text-surface-400 leading-relaxed mb-3">
                Spot bad arguments, think under pressure, build sound cases.
                The adversary is out there — salespeople, politicians, headlines,
                your own cognitive shortcuts.
              </p>
              <span className="text-xs text-surface-600">
                Courses on fallacies, biases, rhetoric, and decision-making
              </span>
            </div>
            <span className="text-surface-600 group-hover:text-accent-500 transition-colors text-lg mt-1">
              →
            </span>
          </div>
        </Link>

        {/* Buddhist Studies */}
        <Link
          href="/courses?branch=buddhist-studies"
          className="block p-6 rounded-lg border border-surface-700/50 bg-surface-850 hover:border-accent-700/40 hover:bg-surface-800 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-serif font-medium text-surface-100 mb-2 group-hover:text-accent-300 transition-colors">
                Buddhist Studies &amp; Critical Thinking
              </h2>
              <p className="text-sm text-surface-400 leading-relaxed mb-3">
                The four noble truths as a diagnostic framework for suffering.
                The adversary is in here — craving, aversion, and delusion
                operating below your awareness.
              </p>
              <span className="text-xs text-surface-600">
                Courses on dukkha, the mechanics of craving, cessation, and the path
              </span>
            </div>
            <span className="text-surface-600 group-hover:text-accent-500 transition-colors text-lg mt-1">
              →
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
