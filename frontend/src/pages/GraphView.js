// Interactive React Flow graph: People ↔ Skills with proficiency-coded edges.
// - Click a Person → side panel with their details + skills
// - Click a Skill → side panel with people who have that skill
// - Drag to connect a Person to a Skill (creates a connection at "familiar" by default)
// - Layout positions are persisted in localStorage
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import api from '../api/api';
import PersonNode from '../components/PersonNode';
import SkillNode from '../components/SkillNode';
import ConnectionModal from '../components/ConnectionModal';

const PROFICIENCY_COLORS = {
  learning: '#f0b400',
  familiar: '#0d6efd',
  expert: '#16a34a',
};

const LAYOUT_KEY = 'skillMatrix_layout_v1';

const GraphView = () => {
  const [people, setPeople] = useState([]);
  const [skills, setSkills] = useState([]);
  const [connections, setConnections] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selected, setSelected] = useState(null); // { type, data }
  const [showConn, setShowConn] = useState(false);
  const [loading, setLoading] = useState(true);

  const nodeTypes = useMemo(() => ({ person: PersonNode, skill: SkillNode }), []);

  // Load all data from the backend.
  const loadAll = useCallback(async () => {
    setLoading(true);
    const [p, s, c] = await Promise.all([
      api.get('/people'),
      api.get('/skills'),
      api.get('/connections'),
    ]);
    setPeople(p.data);
    setSkills(s.data);
    setConnections(c.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Build nodes/edges whenever the underlying data changes.
  useEffect(() => {
    const savedLayout = JSON.parse(localStorage.getItem(LAYOUT_KEY) || '{}');

    const personNodes = people.map((p, i) => ({
      id: `person-${p._id}`,
      type: 'person',
      position:
        savedLayout[`person-${p._id}`] || { x: 80, y: 80 + i * 130 },
      data: { label: p.name, role: p.role, raw: p, dimmed: false },
    }));

    const skillNodes = skills.map((s, i) => ({
      id: `skill-${s._id}`,
      type: 'skill',
      position:
        savedLayout[`skill-${s._id}`] || { x: 500, y: 80 + i * 100 },
      data: { label: s.name, category: s.category, raw: s, dimmed: false },
    }));

    const flowEdges = connections.map((c) => {
      const personId = c.personId?._id || c.personId;
      const skillId = c.skillId?._id || c.skillId;
      return {
        id: `edge-${c._id}`,
        source: `person-${personId}`,
        target: `skill-${skillId}`,
        animated: c.proficiency === 'expert',
        label: c.proficiency,
        style: { stroke: PROFICIENCY_COLORS[c.proficiency], strokeWidth: 2.5 },
        labelStyle: { fontWeight: 600, fontSize: 11 },
        labelBgStyle: { fill: '#fff' },
        data: { connectionId: c._id },
      };
    });

    setNodes([...personNodes, ...skillNodes]);
    setEdges(flowEdges);
  }, [people, skills, connections, setNodes, setEdges]);

  // Persist layout in localStorage on every node move.
  const handleNodesChange = (changes) => {
    onNodesChange(changes);
    setNodes((current) => {
      const layout = {};
      current.forEach((n) => (layout[n.id] = n.position));
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
      return current;
    });
  };

  // Highlight: dim everything except the clicked node and its neighbors.
  const highlight = (nodeId) => {
    const connectedEdgeIds = new Set();
    const connectedNodeIds = new Set([nodeId]);
    edges.forEach((e) => {
      if (e.source === nodeId || e.target === nodeId) {
        connectedEdgeIds.add(e.id);
        connectedNodeIds.add(e.source);
        connectedNodeIds.add(e.target);
      }
    });
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, dimmed: !connectedNodeIds.has(n.id) },
      }))
    );
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        style: {
          ...e.style,
          opacity: connectedEdgeIds.has(e.id) ? 1 : 0.15,
        },
      }))
    );
  };

  const clearHighlight = () => {
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, dimmed: false } })));
    setEdges((eds) =>
      eds.map((e) => ({ ...e, style: { ...e.style, opacity: 1 } }))
    );
  };

  // Click a node → show side panel.
  const onNodeClick = (_, node) => {
    highlight(node.id);
    if (node.type === 'person') {
      setSelected({ type: 'person', data: node.data.raw });
    } else {
      setSelected({ type: 'skill', data: node.data.raw });
    }
  };

  // Drag-to-connect: open the modal with the selected pair pre-filled.
  const onConnect = useCallback(
    async (params) => {
      const sourceIsPerson = params.source.startsWith('person-');
      const targetIsSkill = params.target.startsWith('skill-');
      if (!sourceIsPerson || !targetIsSkill) {
        alert('Connections must go from a Person to a Skill.');
        return;
      }
      const personId = params.source.replace('person-', '');
      const skillId = params.target.replace('skill-', '');
      try {
        await api.post('/connections', {
          personId,
          skillId,
          proficiency: 'familiar',
        });
        loadAll();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to create connection');
      }
    },
    [loadAll]
  );

  const closePanel = () => {
    setSelected(null);
    clearHighlight();
  };

  // Compute side-panel content based on selection.
  const personSkills = (personId) =>
    connections
      .filter((c) => (c.personId?._id || c.personId) === personId)
      .map((c) => ({
        ...c,
        skill: c.skillId,
      }));

  const peopleWithSkill = (skillId) =>
    connections
      .filter((c) => (c.skillId?._id || c.skillId) === skillId)
      .map((c) => ({
        ...c,
        person: c.personId,
      }));

  const removeConnection = async (id) => {
    if (!window.confirm('Remove this connection?')) return;
    await api.delete(`/connections/${id}`);
    loadAll();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="mb-0">Skill Matrix Graph</h2>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <span className="d-flex align-items-center gap-1 small">
            <span style={{ width: 14, height: 4, background: PROFICIENCY_COLORS.learning, display: 'inline-block' }} />
            Learning
          </span>
          <span className="d-flex align-items-center gap-1 small">
            <span style={{ width: 14, height: 4, background: PROFICIENCY_COLORS.familiar, display: 'inline-block' }} />
            Familiar
          </span>
          <span className="d-flex align-items-center gap-1 small">
            <span style={{ width: 14, height: 4, background: PROFICIENCY_COLORS.expert, display: 'inline-block' }} />
            Expert
          </span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowConn(true)}>
            + Connect Person ↔ Skill
          </button>
        </div>
      </div>

      <div className="graph-canvas">
        {loading ? (
          <div className="text-center py-5 text-muted">Loading graph...</div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={closePanel}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background gap={20} color="#e5e7eb" />
            <Controls />
            <MiniMap
              nodeColor={(n) => (n.type === 'person' ? '#0d6efd' : '#16a34a')}
              maskColor="rgba(0,0,0,0.05)"
            />
          </ReactFlow>
        )}
      </div>

      {selected && (
        <div className="detail-panel">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">
              {selected.type === 'person' ? 'Person Details' : 'Skill Details'}
            </h4>
            <button className="btn-close" onClick={closePanel}></button>
          </div>

          {selected.type === 'person' ? (
            <>
              <h5 className="mb-1">{selected.data.name}</h5>
              <p className="text-muted">{selected.data.role}</p>
              <hr />
              <h6>Skills ({personSkills(selected.data._id).length})</h6>
              {personSkills(selected.data._id).length === 0 ? (
                <p className="text-muted small">No skills assigned yet.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {personSkills(selected.data._id).map((c) => (
                    <li
                      key={c._id}
                      className="list-group-item d-flex justify-content-between align-items-center px-0"
                    >
                      <div>
                        <strong>{c.skill?.name}</strong>{' '}
                        <small className="text-muted">({c.skill?.category})</small>
                        <br />
                        <span className={`proficiency-pill ${c.proficiency}`}>
                          {c.proficiency}
                        </span>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeConnection(c._id)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <h5 className="mb-1">{selected.data.name}</h5>
              <p className="text-muted">{selected.data.category}</p>
              <hr />
              <h6>People with this skill ({peopleWithSkill(selected.data._id).length})</h6>
              {peopleWithSkill(selected.data._id).length === 0 ? (
                <p className="text-muted small">No one has this skill yet.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {peopleWithSkill(selected.data._id).map((c) => (
                    <li
                      key={c._id}
                      className="list-group-item d-flex justify-content-between align-items-center px-0"
                    >
                      <div>
                        <strong>{c.person?.name}</strong>{' '}
                        <small className="text-muted">({c.person?.role})</small>
                        <br />
                        <span className={`proficiency-pill ${c.proficiency}`}>
                          {c.proficiency}
                        </span>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeConnection(c._id)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      <ConnectionModal
        show={showConn}
        onClose={() => setShowConn(false)}
        people={people}
        skills={skills}
        onSave={async (form) => {
          await api.post('/connections', form);
          loadAll();
        }}
      />
    </div>
  );
};

export default GraphView;
