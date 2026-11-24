import type { FC, ReactNode } from 'react';

interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

interface SettingsPanelProps {
  sections: SettingsSection[];
}

export const SettingsPanel: FC<SettingsPanelProps> = ({ sections }) => (
  <div data-testid="settings-panel" className="flex flex-col gap-4">
    {sections.map((section) => (
      <section
        key={section.id}
        className="card bg-base-100 border-base-200 border shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-base">{section.title}</h3>
          {section.description && (
            <p className="text-base-content/50 text-sm">
              {section.description}
            </p>
          )}
          <div className="mt-2">{section.children}</div>
        </div>
      </section>
    ))}
  </div>
);
