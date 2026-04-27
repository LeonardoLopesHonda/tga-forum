'use client';

import { useState } from 'react';
import Header from './Header';
import AuthModal from './AuthModal';
import Footer from './Footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <Header onAuthOpen={() => setAuthOpen(true)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
