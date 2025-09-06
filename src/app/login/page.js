// src/app/login/page.js
export const dynamic = 'force-dynamic';

import LoginClient from './LoginClient';

export default function Page({ searchParams }) {
  const redirect = (searchParams && searchParams.redirect) || '/dashboard';
  const reason = (searchParams && searchParams.reason) || ''; // 'unauthorized' ถ้ามาจาก middleware

  return <LoginClient redirect={redirect} reason={reason} />;
}
