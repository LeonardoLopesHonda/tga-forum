'use client';

import Header from './Header';
import AuthModal from './AuthModal';
import Footer from './Footer';
import Toaster from './Toaster';
import { useAuth } from '@/lib/auth-store';
import authStore from '@/lib/auth-store';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { modalOpen } = useAuth();

  return (
    <>
      <Header />
      <AuthModal open={modalOpen} onClose={() => authStore.closeModal()} />
      <main>{children}</main>
      <Footer />
      <Toaster />
    </>
  );
}
