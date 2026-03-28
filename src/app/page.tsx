export default function Home() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-300 flex items-center justify-center p-6">
      <div className="max-w-xl text-center space-y-8 animate-fade-in">
        <div className="text-4xl font-light text-accent-400 heading-glow">◆</div>
        <h1 className="text-4xl font-serif font-semibold text-surface-100 tracking-tight heading-glow">
          Reasons
        </h1>
        <p className="text-surface-400 leading-relaxed text-lg font-serif max-w-md mx-auto">
          Train your mind to see clearly — through practical reasoning,
          critical thinking, and the ancient diagnostic framework of the
          four noble truths.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <a
            href="/login"
            className="px-7 py-2.5 bg-accent-600 hover:bg-accent-500 text-surface-950 font-medium hover:shadow-lg hover:shadow-accent-600/20 rounded-lg transition-all"
          >
            Get Started
          </a>
          <a
            href="/home"
            className="px-7 py-2.5 border border-surface-700/50 hover:border-surface-600 text-surface-300 font-medium rounded-lg transition-all"
          >
            Browse
          </a>
        </div>
      </div>
    </div>
  );
}
