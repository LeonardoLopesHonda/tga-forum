import { req } from './http';

export type AiAssistResponse = { title: string | null; content: string | null };

export async function assistPost(title?: string, content?: string): Promise<AiAssistResponse> {
  const body: Record<string, string> = {};
  if (title)   body.title   = title;
  if (content) body.content = content;
  return req<AiAssistResponse>('POST', '/ai/post-assist', body);
}
