import type { FC } from 'react';

interface EditorTagProps {
  name?: string;
  label?: string;
}

export const EditorTag: FC<EditorTagProps> = ({
  name,
  label = "Editor's Pick",
}) => (
  <span className="badge badge-info badge-sm gap-1" data-testid="editor-tag">
    <span aria-hidden>✎</span>
    {label}
    {name && <span className="text-base-content/60">by {name}</span>}
  </span>
);
