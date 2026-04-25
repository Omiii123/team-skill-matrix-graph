// Dashboard with stats, most common skills, and skill gaps.
import React, { useEffect, useState } from 'react';
import api from '../api/api';

const Dashboard = () => {
  const [people, setPeople] = useState([]);
  const [skills, setSkills] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/people'),
      api.get('/skills'),
      api.get('/connections'),
    ])
      .then(([p, s, c]) => {
        setPeople(p.data);
        setSkills(s.data);
        setConnections(c.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Count people per skill.
  const counts = {};
  connections.forEach((c) => {
    const id = c.skillId?._id || c.skillId;
    counts[id] = (counts[id] || 0) + 1;
  });

  const skillStats = skills
    .map((s) => ({ ...s, count: counts[s._id] || 0 }))
    .sort((a, b) => b.count - a.count);

  const mostCommon = skillStats.slice(0, 5).filter((s) => s.count > 0);
  const skillGaps = skillStats.filter((s) => s.count <= 1).slice(0, 5);

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>
      {loading ? (
        <div className="text-center py-5">Loading...</div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card stat-card p-3">
                <div className="text-muted small">Total People</div>
                <div className="stat-value">{people.length}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card stat-card p-3">
                <div className="text-muted small">Total Skills</div>
                <div className="stat-value">{skills.length}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card stat-card p-3">
                <div className="text-muted small">Total Connections</div>
                <div className="stat-value">{connections.length}</div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <div className="card stat-card p-3">
                <h5>Most Common Skills</h5>
                {mostCommon.length === 0 ? (
                  <p className="text-muted small mb-0">No skill connections yet.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {mostCommon.map((s) => (
                      <li
                        key={s._id}
                        className="list-group-item d-flex justify-content-between"
                      >
                        <span>
                          <strong>{s.name}</strong>{' '}
                          <small className="text-muted">({s.category})</small>
                        </span>
                        <span className="badge bg-primary rounded-pill">
                          {s.count} {s.count === 1 ? 'person' : 'people'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="card stat-card p-3">
                <h5>Skill Gaps (≤1 person)</h5>
                {skillGaps.length === 0 ? (
                  <p className="text-muted small mb-0">No gaps detected.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {skillGaps.map((s) => (
                      <li
                        key={s._id}
                        className="list-group-item d-flex justify-content-between"
                      >
                        <span>
                          <strong>{s.name}</strong>{' '}
                          <small className="text-muted">({s.category})</small>
                        </span>
                        <span className="badge bg-warning text-dark rounded-pill">
                          {s.count} {s.count === 1 ? 'person' : 'people'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
