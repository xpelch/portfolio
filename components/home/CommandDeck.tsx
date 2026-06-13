import { useEffect, useRef } from 'react';

export type CommandDeckItem = {
  key: string;
  label: string;
  meta: string;
  action: () => void;
};

export function CommandDeck({
  open,
  onClose,
  title,
  status,
  closeLabel,
  commands,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  status: string;
  closeLabel: string;
  commands: CommandDeckItem[];
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const commandRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => commandRefs.current[0]?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => !element.hasAttribute('disabled'));

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-surface-100/82 px-4 py-8"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-deck-title"
        aria-describedby="command-deck-status"
        data-proof="command-deck"
        className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-hidden border border-border bg-surface-200 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div>
            <p id="command-deck-title" className="mono-copy text-xs tracking-[0.16em] text-secondary-300">
              {title}
            </p>
            <p id="command-deck-status" className="mt-2 text-sm text-text-secondary">
              {status}
            </p>
          </div>
          <button
            type="button"
            aria-label={closeLabel}
            data-proof="command-deck-close"
            onClick={onClose}
            className={[
              'mono-copy inline-flex min-h-10 min-w-10 items-center justify-center',
              'border border-border text-xs text-text-secondary transition',
              'hover:border-secondary-300 hover:text-secondary-300',
              'focus-visible:border-secondary-300 focus-visible:text-secondary-300',
            ].join(' ')}
          >
            ESC
          </button>
        </div>
        <div className="max-h-[min(30rem,calc(100dvh-10rem))] divide-y divide-border overflow-y-auto">
          {commands.map((command, index) => (
            <button
              key={command.key}
              ref={(node) => {
                commandRefs.current[index] = node;
              }}
              type="button"
              onClick={() => {
                command.action();
                onClose();
              }}
              className={[
                'group grid w-full gap-2 px-4 py-4 text-left transition',
                'hover:bg-surface-300 focus-visible:bg-surface-300',
                'sm:grid-cols-[1fr_auto] sm:px-5',
              ].join(' ')}
            >
              <span className="font-semibold text-on-surface group-hover:text-secondary-300">{command.label}</span>
              <span className="mono-copy text-xs text-text-muted">{command.meta}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
