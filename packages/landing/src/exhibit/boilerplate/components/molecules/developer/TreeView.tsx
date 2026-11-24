'use client';

import { FiChevronRight } from 'react-icons/fi';
import type { FC, ReactElement } from 'react';
import { useState } from 'react';

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

interface TreeViewProps {
  nodes: TreeNode[];
}

const renderNode = (
  node: TreeNode,
  level: number,
  openIds: string[],
  toggle: (id: string) => void
): ReactElement => {
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const open = openIds.includes(node.id);

  return (
    <li key={node.id}>
      <div
        className="hover:bg-base-200 flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-sm"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        role="button"
        aria-expanded={hasChildren ? open : undefined}
        onClick={() => (hasChildren ? toggle(node.id) : undefined)}>
        {hasChildren ? (
          <FiChevronRight
            className={`text-base-content/50 shrink-0 transition-transform ${
              open ? 'rotate-90' : ''
            }`}
          />
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span>{node.label}</span>
      </div>
      {hasChildren && open && (
        <ul>
          {node.children?.map((child) =>
            renderNode(child, level + 1, openIds, toggle)
          )}
        </ul>
      )}
    </li>
  );
};

export const TreeView: FC<TreeViewProps> = ({ nodes }) => {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const toggle = (id: string) => {
    setOpenIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  return (
    <div className="w-full">
      <ul>{nodes.map((node) => renderNode(node, 0, openIds, toggle))}</ul>
    </div>
  );
};
