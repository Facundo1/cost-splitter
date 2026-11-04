import { useId, type ReactNode } from 'react';

interface Props {
  title: ReactNode;
  action?: ReactNode;
  highlight?: boolean;
  children: ReactNode;
}

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
