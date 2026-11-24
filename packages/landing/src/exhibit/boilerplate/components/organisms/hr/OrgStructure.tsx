import type { FC, ReactElement } from 'react';

interface OrgNode {
  id: string;
  name: string;
  title: string;
  children?: OrgNode[];
}

interface OrgStructureProps {
  nodes: OrgNode[];
}

const renderNode = (node: OrgNode): ReactElement => (
  <li key={node.id}>
    <div className="border-base-content/10 bg-base-200 rounded-xl border px-4 py-2">
      <p className="text-sm font-medium">{node.name}</p>
      <p className="text-base-content/50 text-xs">{node.title}</p>
    </div>
    {node.children && node.children.length > 0 && (
      <ul className="border-base-content/20 ml-4 flex flex-col gap-2 border-l-2 pt-2 pl-4">
        {node.children.map(renderNode)}
      </ul>
    )}
  </li>
);

export const OrgStructure: FC<OrgStructureProps> = ({ nodes }) => (
  <div className="w-full overflow-x-auto" data-testid="org-structure">
    <ul className="flex w-fit flex-col gap-2">{nodes.map(renderNode)}</ul>
  </div>
);

OrgStructure.displayName = 'OrgStructure';
