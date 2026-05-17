'use client';

import Hero from './Hero';
import CategoryPills from './CategoryPills';
import PostFeed from './PostFeed';
import SoftCTA from './SoftCTA';

export default function HomeClient() {
  return (
    <>
      <Hero />
      <CategoryPills />
      <PostFeed />
      <SoftCTA />
    </>
  );
}
