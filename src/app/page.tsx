import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-4xl font-bold text-[var(--color-primary-500)]">Math Dash</h1>
      <div className="flex gap-4">
        <Link 
          href="/play" 
          className="px-8 py-4 bg-[var(--color-primary-500)] text-white rounded-full text-xl font-bold hover:bg-[var(--color-primary-600)] transition-colors"
        >
          Play Now
        </Link>
        <Link 
          href="/grown-ups" 
          className="px-8 py-4 bg-[var(--color-neutral-200)] text-[var(--color-neutral-900)] rounded-full text-xl font-bold hover:bg-[var(--color-neutral-300)] transition-colors"
        >
          Grown-Ups
        </Link>
      </div>
    </div>
  );
}
