import { codeToHtml } from 'shiki';
import { Paste } from '@snappaste/types';
import HighlightedPasteViewer from './HighlightedPasteViewer';

interface Props {
  paste: Paste;
}

export default async function PasteViewer({ paste }: Props) {
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

  return <HighlightedPasteViewer paste={paste} highlightedHtml={highlightedHtml} />;
}