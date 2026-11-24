import type { FC } from 'react';

interface DocSection {
  id: string;
  title: string;
  content: string;
  path?: string;
}

interface DocumentationViewProps {
  sections: DocSection[];
  title?: string;
}

export const DocumentationView: FC<DocumentationViewProps> = ({
  sections,
  title = 'Documentation',
}) => (
  <div className="grid gap-6 md:grid-cols-4">
    <nav aria-label="Documentation sections" className="md:col-span-1">
      <div className="bg-base-200 border-base-content/10 rounded-xl border p-3">
        <h2 className="mb-2 text-sm font-medium">{title}</h2>
        <ul className="flex flex-col gap-1">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-base-content/70 hover:text-primary block text-sm">
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
    <div className="flex flex-col gap-4 md:col-span-3">
      {sections.length === 0 && (
        <p className="text-base-content/50">No documentation.</p>
      )}
      {sections.map((section) => (
        <article
          key={section.id}
          id={section.id}
          className="card bg-base-200 border-base-content/10 rounded-xl border">
          <div className="card-body">
            <h3 className="card-title text-base">{section.title}</h3>
            {section.path && (
              <p className="font-mono text-xs">{section.path}</p>
            )}
            <p className="text-base-content/70 text-sm">{section.content}</p>
          </div>
        </article>
      ))}
    </div>
  </div>
);
