// Custom React Flow node for a Skill (square badge style).
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const SkillNode = ({ data }) => (
  <div className={`skill-node ${data.dimmed ? 'dimmed' : ''}`}>
    <Handle type="target" position={Position.Left} style={{ background: '#0d6efd' }} />
    <Handle type="source" position={Position.Right} style={{ background: '#0d6efd' }} />
    <div>{data.label}</div>
    <div className="skill-category">{data.category}</div>
  </div>
);

export default memo(SkillNode);
