'use server';

import { codeToHtml } from 'shiki';
import { getPaste } from '@/lib/api';
import { Paste } from '@snappaste/types';

export async function unlockPaste(code: string, password: string) {
  try {
    const paste = await getPaste(code, password);

    let highlightedHtml = '';
    try {
      highlightedHtml = await codeToHtml(paste.content, {
        lang: paste.language || 'plaintext',
        theme: 'vitesse-dark',
      });
    } catch {
      highlightedHtml = await codeToHtml(paste.content, {
        lang: 'plaintext',
        theme: 'vitesse-dark',
      });
    }

    return { paste, highlightedHtml };
  } catch (err: any) {
    const status = err?.response?.status || err?.status;
    if (status === 403) throw new Error('Invalid password');
    if (status === 429) throw new Error('Too many failed attempts');
    throw new Error('Something went wrong');
  }
}