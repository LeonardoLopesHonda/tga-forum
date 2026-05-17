import { req } from './http';

export type Category = {
  category_id: number;
  slug:        string;
  name:        string;
  color_from:  string;
  color_to:    string;
};

let cached: Category[] | null = null;

export async function list(): Promise<Category[]> {
  if (cached) return cached;
  cached = await req<Category[]>('GET', '/categories');
  return cached;
}

export function gradient(c: Pick<Category, 'color_from' | 'color_to'>): string {
  return `linear-gradient(135deg, ${c.color_from}, ${c.color_to})`;
}
