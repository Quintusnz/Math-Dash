import AdultGate from '@/components/features/auth/AdultGate';

export default function GrownUpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdultGate>
      {children}
    </AdultGate>
  );
}
