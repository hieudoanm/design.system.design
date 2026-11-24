import type { FC } from 'react';

interface OrgNode {
  name: string;
  role: string;
  children?: OrgNode[];
}

interface OrgChartProps {
  nodes: OrgNode[];
  title?: string;
  className?: string;
}

const NodeCard: FC<{ node: OrgNode }> = ({ node }) => {
  const children = node.children ?? [];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-base-200 border-base-content/10 rounded-lg border px-4 py-2 text-center">
        <div className="text-sm font-medium">{node.name}</div>
        <div className="text-base-content/50 text-xs">{node.role}</div>
      </div>
      {children.length > 0 && (
        <div className="border-base-content/10 flex flex-wrap items-start justify-center gap-3 border-t pt-2">
          {children.map((child) => (
            <NodeCard key={child.name} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export const OrgChart: FC<OrgChartProps> = ({
  nodes = [],
  title,
  className = '',
}) => {
  return (
    <div
      data-testid="org-chart"
      className={`flex flex-col items-center gap-3 ${className}`}>
      {title && <h3 className="text-base font-medium">{title}</h3>}
      <div className="flex flex-wrap items-start justify-center gap-3">
        {nodes.length === 0 ? (
          <p className="text-base-content/50 text-sm">No team to display</p>
        ) : (
          nodes.map((node) => <NodeCard key={node.name} node={node} />)
        )}
      </div>
    </div>
  );
};
