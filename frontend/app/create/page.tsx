import { Suspense } from 'react';
import CreatePostClient from './CreatePostClient';

export default function CreatePage() {
  return (
    <Suspense fallback={null}>
      <CreatePostClient />
    </Suspense>
  );
}
