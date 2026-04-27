'use client';

import { useState } from 'react';
import Hero from './Hero';
import PostFeed from './PostFeed';
import SoftCTA from './SoftCTA';
import AuthModal from './AuthModal';

export default function HomeClient() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <Hero onAuthOpen={() => setAuthOpen(true)} />
      <PostFeed />
      <SoftCTA onAuthOpen={() => setAuthOpen(true)} />
    </>
  );
}
