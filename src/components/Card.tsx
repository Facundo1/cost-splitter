import { useId, type ReactNode } from 'react';

interface Props {
  title: ReactNode;
  /** Optional control shown on the right of the title (e.g. a share button). */
  action?: ReactNode;
  highlight?: boolean;
  children: ReactNode;
}

/** The heading labels the section for screen readers (aria-labelledby). */
export function Card({ title, action, highlight = false, children }: Props) {
  const headingId = useId();
  return (
    <section className={highlight ? 'card highlight' : 'card'} aria-labelledby={headingId}>
      <div className="card-header">
        <h2 id={headingId}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
