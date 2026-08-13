'use client';

export type JourneyEventName = 'contact_click' | 'project_open' | 'external_profile_click' | 'language_switch';

export type JourneyEvent = {
  name: JourneyEventName;
  target: string;
  at: string;
};

type JourneyAck = {
  ok: boolean;
  name: JourneyEventName;
  target: string;
  receivedAt: string;
};

declare global {
  interface Window {
    __portfolioJourneyEvents?: JourneyEvent[];
    __portfolioJourneyAcks?: JourneyAck[];
  }
}

export function recordJourneyEvent(name: JourneyEventName, target: string) {
  if (typeof window === 'undefined') return;

  const event: JourneyEvent = { name, target, at: new Date().toISOString() };
  window.__portfolioJourneyEvents = [...(window.__portfolioJourneyEvents ?? []), event];
  window.dispatchEvent(new CustomEvent('portfolio:journey', { detail: event }));

  void fetch('/api/journey', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(event),
    keepalive: true,
  })
    .then((response) => (response.ok ? response.json() as Promise<JourneyAck> : null))
    .then((ack) => {
      if (!ack) return;
      window.__portfolioJourneyAcks = [...(window.__portfolioJourneyAcks ?? []), ack];
      window.dispatchEvent(new CustomEvent('portfolio:journey-ack', { detail: ack }));
    })
    .catch(() => {
      // The UI must never block navigation or language switching on telemetry.
    });
}
