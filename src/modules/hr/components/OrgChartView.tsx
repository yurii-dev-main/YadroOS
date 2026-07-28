import { FC } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { OrgChartNode } from '../types/hr.types';

interface OrgChartViewProps {
  data: OrgChartNode;
}

const NodeCard: FC<{ node: OrgChartNode }> = ({ node }) => (
  <div className="min-w-[180px] rounded-lg border border-primary/40 bg-slate-900/80 p-3 text-center text-xs text-slate-100 shadow-lg">
    <p className="text-sm font-semibold text-primary">{node.name}</p>
    <p className="text-slate-400">{node.title}</p>
  </div>
);

const renderNode = (node: OrgChartNode): JSX.Element => (
  <TreeNode label={<NodeCard node={node} />} key={node.id}>
    {node.children?.map((child) => renderNode(child))}
  </TreeNode>
);

export const OrgChartView: FC<OrgChartViewProps> = ({ data }) => (
  <div className="overflow-auto rounded-lg border border-slate-800 bg-slate-900/70 p-6">
    <Tree
      label={<NodeCard node={data} />}
      lineWidth={'2px'}
      lineColor={'#6366f1'}
      lineBorderRadius={'10px'}
    >
      {data.children?.map((child) => renderNode(child))}
    </Tree>
  </div>
);
