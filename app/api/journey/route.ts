import { NextResponse } from 'next/server';
import type { JourneyEventName } from '@/lib/journey-events';

const allowedEvents = new Set<JourneyEventName>([
  'contact_click',
  'project_open',
  'external_profile_click',
  'language_switch',
]);

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  if (!isJourneyEvent(body)) {
    return NextResponse.json({ ok: false, error: 'invalid_event' }, { status: 400 });
  }

  return NextResponse.json(
    {
      ok: true,
      name: body.name,
      target: body.target,
      receivedAt: new Date().toISOString(),
    },
    {
      headers: {
        'cache-control': 'no-store',
      },
    },
  );
}

function isJourneyEvent(value: unknown): value is { name: JourneyEventName; target: string; at: string } {
  if (!value || typeof value !== 'object') return false;
  const event = value as { name?: unknown; target?: unknown; at?: unknown };

  return (
    typeof event.name === 'string' &&
    allowedEvents.has(event.name as JourneyEventName) &&
    typeof event.target === 'string' &&
    event.target.length > 0 &&
    event.target.length <= 120 &&
    typeof event.at === 'string' &&
    event.at.length <= 40
  );
}
