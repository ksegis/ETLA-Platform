// Route Segment Config — make the whole app dynamic at build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Minimal template component
export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
