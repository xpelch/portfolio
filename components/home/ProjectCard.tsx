import { recordJourneyEvent } from '@/lib/journey-events';
import type { Project } from '@/types';
import { ExternalIcon } from './HomePrimitives';

type ProjectCardLabels = {
  role: string;
  constraint: string;
  outcome: string;
  proof: string;
  private: string;
  open: string;
};

function ProjectVisual({ project, index }: { project: Project; index: number }) {
  const lanes = project.stack?.slice(0, 4) ?? [project.framework];

  return (
    <div className="relative h-44 overflow-hidden border-b border-border bg-surface-100 p-4">
      <div className="absolute inset-0 opacity-70">
        <div className="project-visual-grid h-full w-full" />
      </div>
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="mono-copy text-[0.68rem] text-text-muted">case.0{index + 1}</div>
            <div className="max-w-48 text-xl font-semibold leading-tight text-on-surface">
              {project.name}
            </div>
          </div>
          <div className="h-8 w-8 border border-secondary-300/70 text-secondary-300">
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M16 4v24M4 16h24M8 8l16 16M24 8 8 24" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {lanes.map((lane) => (
            <div
              key={lane}
              className="mono-copy border border-border bg-surface-200/80 px-2 py-1 text-[0.66rem] text-text-secondary"
            >
              {lane}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectCard({
  project,
  index,
  labels,
}: {
  project: Project;
  index: number;
  labels: ProjectCardLabels;
}) {
  const isPrivate = project.href === '#';
  const cardClassName = `scrap-card group block overflow-hidden transition duration-300 ${
    isPrivate ? 'cursor-default' : 'hover:-translate-y-1 hover:border-secondary-300/70'
  }`;
  const cardBody = (
    <>
      <ProjectVisual project={project} index={index} />
      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mono-copy text-xs text-secondary-300">{project.framework}</p>
            <h3 className="mt-2 text-2xl font-semibold leading-tight text-on-surface">{project.name}</h3>
          </div>
          <span className="mono-copy whitespace-nowrap border border-border px-2 py-1 text-[0.68rem] text-text-secondary">
            {project.stars}
          </span>
        </div>
        <p className="text-sm leading-6 text-text-secondary">{project.description}</p>
        <dl className="space-y-3 border-t border-border pt-4 text-sm">
          {project.role && (
            <div data-proof="project-role">
              <dt className="mono-copy text-[0.68rem] tracking-[0.12em] text-text-muted">{labels.role}</dt>
              <dd className="mt-1 text-on-background">{project.role}</dd>
            </div>
          )}
          {project.constraint && (
            <div data-proof="project-constraint">
              <dt className="mono-copy text-[0.68rem] tracking-[0.12em] text-text-muted">{labels.constraint}</dt>
              <dd className="mt-1 text-text-secondary">{project.constraint}</dd>
            </div>
          )}
          {project.outcome && (
            <div>
              <dt className="mono-copy text-[0.68rem] tracking-[0.12em] text-text-muted">{labels.outcome}</dt>
              <dd className="mt-1 text-on-background">{project.outcome}</dd>
            </div>
          )}
          {project.proof && (
            <div>
              <dt className="mono-copy text-[0.68rem] tracking-[0.12em] text-text-muted">{labels.proof}</dt>
              <dd className="mt-1 text-text-secondary">{project.proof}</dd>
            </div>
          )}
        </dl>
        <div className="flex items-center gap-2 text-sm font-medium text-secondary-300">
          <span>{project.href === '#' ? labels.private : labels.open}</span>
          {project.href !== '#' && <ExternalIcon />}
        </div>
      </div>
    </>
  );

  if (isPrivate) {
    return (
      <article
        className={cardClassName}
        aria-label={`${project.name}: ${project.description}`}
        data-proof="project-card"
        data-project-state="private"
      >
        {cardBody}
      </article>
    );
  }

  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClassName}
      aria-label={`${project.name}: ${project.description}`}
      data-proof="project-card"
      data-project-state="public"
      onClick={() => recordJourneyEvent('project_open', project.name)}
    >
      {cardBody}
    </a>
  );
}
