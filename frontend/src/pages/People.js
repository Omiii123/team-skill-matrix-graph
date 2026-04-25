// Manage People: list, add, edit, delete.
import React, { useEffect, useState } from 'react';
import api from '../api/api';
import PersonModal from '../components/PersonModal';

const People = () => {
  const [people, setPeople] = useState([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/people').then((r) => {
      setPeople(r.data);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const save = async (form) => {
    if (editing) await api.put(`/people/${editing._id}`, form);
    else await api.post('/people', form);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this person and all their skill connections?')) return;
    await api.delete(`/people/${id}`);
    load();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">People</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShow(true);
          }}
        >
          + Add Person
        </button>
      </div>
      {loading ? (
        <div className="text-center py-5">Loading...</div>
      ) : people.length === 0 ? (
        <div className="card stat-card p-4 text-center text-muted">
          No people yet. Add your first team member!
        </div>
      ) : (
        <div className="card stat-card">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th style={{ width: 180 }}></th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.role}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => {
                        setEditing(p);
                        setShow(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => remove(p._id)}
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
      <PersonModal
        show={show}
        onClose={() => setShow(false)}
        onSave={save}
        initial={editing}
      />
    </div>
  );
};

export default People;
