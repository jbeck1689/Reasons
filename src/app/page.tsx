export default function Home() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-300 flex items-center justify-center p-6">
      <div className="max-w-xl text-center space-y-8">
        <div className="text-4xl font-light text-accent-400">◆</div>
        <h1 className="text-3xl font-serif font-semibold text-surface-100 tracking-tight">
          Public Reasons
        </h1>
        <p className="text-surface-400 leading-relaxed text-lg font-serif">
          Train your mind to see clearly — through practical reasoning,
          critical thinking, and the ancient diagnostic framework of the
          four noble truths. The adversary is everywhere: in bad arguments,
          in manipulation, and in the patterns your own mind runs without
          your permission.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <a
            href="/login"
            className="px-6 py-2.5 bg-accent-600 hover:bg-accent-500 text-surface-950 font-medium rounded transition-colors"
          >
            Get Started
          </a>
          <a
            href="/home"
            className="px-6 py-2.5 border border-surface-700 hover:border-surface-500 text-surface-300 font-medium rounded transition-colors"
          >
            Browse
          </a>
        </div>
      </div>
    </div>
  );
}
