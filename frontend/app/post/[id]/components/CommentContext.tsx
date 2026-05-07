'use client';

import { createContext, useContext } from 'react';

export type CommentActions = {
  replyingTo:      string | null;
  currentUserId:   string | null;
  onReply:         (id: string | null) => void;
  onSubmitReply:   (parentId: string, content: string) => void;
  onDelete:        (id: string) => void;
};

const CommentContext = createContext<CommentActions | null>(null);

export function useCommentContext() {
  const ctx = useContext(CommentContext);
  if (!ctx) throw new Error('useCommentContext must be used inside CommentSection');
  return ctx;
}

export default CommentContext;
