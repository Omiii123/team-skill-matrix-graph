// Custom React Flow node for a Person (circular avatar style).
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const PersonNode = ({ data }) => {
  const initials = data.label
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`person-node ${data.dimmed ? 'dimmed' : ''}`}>
      <Handle type="source" position={Position.Right} style={{ background: '#fff' }} />
      <Handle type="target" position={Position.Left} style={{ background: '#fff' }} />
      <div className="avatar-circle">{initials}</div>
      <div>{data.label}</div>
      <div style={{ fontSize: '0.6rem', opacity: 0.85 }}>{data.role}</div>
    </div>
  );
};

export default memo(PersonNode);
