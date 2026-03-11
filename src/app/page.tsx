export default function Home() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-300 flex items-center justify-center p-6">
      <div className="max-w-xl text-center space-y-8">
        <div className="text-4xl font-light text-accent-400">◆</div>
        <h1 className="text-3xl font-serif font-semibold text-surface-100 tracking-tight">
          Practical Reasoning
        </h1>
        <p className="text-surface-400 leading-relaxed text-lg font-serif">
          Learn to spot bad arguments, think under pressure, and see through
          the tricks that bypass your careful thinking — from salespeople,
          politicians, headlines, and your own brain.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <a
            href="/login"
            className="px-6 py-2.5 bg-accent-600 hover:bg-accent-500 text-surface-950 font-medium rounded transition-colors"
          >
            Get Started
          </a>
          <a
            href="/courses"
            className="px-6 py-2.5 border border-surface-700 hover:border-surface-500 text-surface-300 font-medium rounded transition-colors"
          >
            Browse Courses
          </a>
        </div>
      </div>
    </div>
  );
}
