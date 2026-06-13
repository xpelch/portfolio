import { useEffect, useState } from 'react';

export function useTypingLoop(messages: string[]) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visibleLength, setVisibleLength] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setReducedMotion(media.matches);
    syncPreference();
    media.addEventListener('change', syncPreference);
    return () => media.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion || messages.length === 0) return;

    const current = messages[messageIndex] ?? '';
    const isComplete = visibleLength === current.length;
    const isEmpty = visibleLength === 0;
    const delay = isComplete && !deleting ? 1050 : deleting ? 34 : 58;

    const timeout = window.setTimeout(() => {
      if (!deleting && isComplete) {
        setDeleting(true);
        return;
      }

      if (deleting && isEmpty) {
        setDeleting(false);
        setMessageIndex((index) => (index + 1) % messages.length);
        return;
      }

      setVisibleLength((length) => length + (deleting ? -1 : 1));
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [deleting, messageIndex, messages, reducedMotion, visibleLength]);

  if (messages.length === 0) return '';
  if (reducedMotion) return messages[0];

  return (messages[messageIndex] ?? '').slice(0, visibleLength);
}
