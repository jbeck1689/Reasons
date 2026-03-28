export default function PrivatePage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-300 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6 animate-fade-in">
        <div className="text-3xl font-light text-accent-400 heading-glow">◆</div>
        <h1 className="text-2xl font-serif font-semibold text-surface-100 heading-glow">
          Private
        </h1>
        <p className="text-surface-400 leading-relaxed font-serif">
          This app is currently in private development and not open to the public.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-2.5 border border-surface-700/50 hover:border-surface-600 text-surface-300 font-medium rounded-lg transition-all"
        >
          Back
        </a>
      </div>
    </div>
  );
}
