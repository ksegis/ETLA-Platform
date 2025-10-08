// DO NOT add 'use client' here
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import AccessControlClient from './AccessControlClient';

export default function Page() {
  return <AccessControlClient />;
}
