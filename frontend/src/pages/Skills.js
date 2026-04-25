// Manage Skills: list, add, edit, delete.
import React, { useEffect, useState } from 'react';
import api from '../api/api';
import SkillModal from '../components/SkillModal';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/skills').then((r) => {
      setSkills(r.data);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const save = async (form) => {
    if (editing) await api.put(`/skills/${editing._id}`, form);
    else await api.post('/skills', form);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this skill and all related connections?')) return;
    await api.delete(`/skills/${id}`);
    load();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Skills</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShow(true);
          }}
        >
          + Add Skill
        </button>
      </div>
      {loading ? (
        <div className="text-center py-5">Loading...</div>
      ) : skills.length === 0 ? (
        <div className="card stat-card p-4 text-center text-muted">
          No skills yet. Add the first one!
        </div>
      ) : (
        <div className="card stat-card">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Category</th>
                <th style={{ width: 180 }}></th>
              </tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.category}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => {
                        setEditing(s);
                        setShow(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => remove(s._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <SkillModal
        show={show}
        onClose={() => setShow(false)}
        onSave={save}
        initial={editing}
      />
    </div>
  );
};

export default Skills;
