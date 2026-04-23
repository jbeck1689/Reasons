import Link from "next/link";

export default function BuddhistStudiesPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-4">
        <Link
          href="/home"
          className="text-xs text-surface-600 hover:text-accent-400 transition-colors"
        >
          ← Courses
        </Link>
      </div>

      <div className="mb-10">
        <h1 className="text-2xl font-serif font-semibold text-surface-100 mb-2">
          Buddhism
        </h1>
        <p className="text-surface-500 text-sm leading-relaxed">
          The mind&apos;s patterns examined through the lens of early Buddhist
          teaching, cognitive neuroscience, and practical philosophy.
          Nothing here asks for belief. Everything here asks for attention.
        </p>
      </div>

      <div className="space-y-4">
        <Link
          href="/courses?topic=four-noble-truths"
          className="block p-6 rounded-xl border border-surface-700/30 bg-surface-900/50 hover:border-accent-700/30 transition-all group card-hover"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-serif font-medium text-surface-100 mb-2 group-hover:text-accent-300 transition-colors">
                The Four Noble Truths
              </h2>
              <p className="text-sm text-surface-400 leading-relaxed mb-2">
                A diagnostic framework for suffering — what it is, what drives
                it, that it can stop, and how to live when it does. Four courses
                mapping the territory from dukkha through the eightfold path.
              </p>
              <span className="text-xs text-surface-600">4 courses</span>
            </div>
            <span className="text-surface-700 group-hover:text-accent-500 transition-colors text-lg mt-1 group-hover:translate-x-0.5 transform transition-transform">
              →
            </span>
          </div>
        </Link>

        <Link
          href="/courses?topic=dependent-origination"
          className="block p-6 rounded-xl border border-surface-700/30 bg-surface-900/50 hover:border-accent-700/30 transition-all group card-hover"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-serif font-medium text-surface-100 mb-2 group-hover:text-accent-300 transition-colors">
                Dependent Origination — Paṭiccasamuppāda
              </h2>
              <p className="text-sm text-surface-400 leading-relaxed mb-2">
                Nothing arises independently. The twelve-link chain that
                describes how experience, identity, and suffering are
                constructed from conditions — and how seeing the conditions
                changes everything.
              </p>
              <span className="text-xs text-surface-600">13 courses</span>
            </div>
            <span className="text-surface-700 group-hover:text-accent-500 transition-colors text-lg mt-1 group-hover:translate-x-0.5 transform transition-transform">
              →
            </span>
          </div>
        </Link>

        <Link
          href="/courses?topic=paccaya"
          className="block p-6 rounded-xl border border-surface-700/30 bg-surface-900/50 hover:border-accent-700/30 transition-all group card-hover"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-serif font-medium text-surface-100 mb-2 group-hover:text-accent-300 transition-colors">
                Modes of Conditionality — Paccaya
              </h2>
              <p className="text-sm text-surface-400 leading-relaxed mb-2">
                If Dependent Origination answered &ldquo;what conditions
                what,&rdquo; this series answers &ldquo;how.&rdquo; The
                twenty-four modes through which conditions actually operate
                &mdash; root, object, proximity, co-arising, and beyond.
              </p>
              <span className="text-xs text-surface-600">9 courses</span>
            </div>
            <span className="text-surface-700 group-hover:text-accent-500 transition-colors text-lg mt-1 group-hover:translate-x-0.5 transform transition-transform">
              →
            </span>
          </div>
        </Link>

        <Link
          href="/courses?topic=gradual-training"
          className="block p-6 rounded-xl border border-surface-700/30 bg-surface-900/50 hover:border-accent-700/30 transition-all group card-hover"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-serif font-medium text-surface-100 mb-2 group-hover:text-accent-300 transition-colors">
                The Gradual Training — Anupubbasikkhā
              </h2>
              <p className="text-sm text-surface-400 leading-relaxed mb-2">
                The Buddha&apos;s step-by-step practice path, read through the
                early suttas without commentary or mystification. Drawing on
                Ñāṇamoli&apos;s translations and Ñāṇavīra&apos;s radical
                present-moment interpretation &mdash; philosophy as practice
                manual.
              </p>
              <span className="text-xs text-surface-600">6 courses</span>
            </div>
            <span className="text-surface-700 group-hover:text-accent-500 transition-colors text-lg mt-1 group-hover:translate-x-0.5 transform transition-transform">
              →
            </span>
          </div>
        </Link>

        <Link
          href="/courses?topic=slow-reading"
          className="block p-6 rounded-xl border border-surface-700/30 bg-surface-900/50 hover:border-accent-700/30 transition-all group card-hover"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-serif font-medium text-surface-100 mb-2 group-hover:text-accent-300 transition-colors">
                Slow Reading
              </h2>
              <p className="text-sm text-surface-400 leading-relaxed mb-2">
                Sustained contemplative prose on the same subjects as the
                other series, in a different register. Extended readings
                rather than stage-by-stage courses &mdash; written to be sat
                with, returned to, and read slowly.
              </p>
              <span className="text-xs text-surface-600">6 courses</span>
            </div>
            <span className="text-surface-700 group-hover:text-accent-500 transition-colors text-lg mt-1 group-hover:translate-x-0.5 transform transition-transform">
              →
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
