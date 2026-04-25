// Modal for creating a new Person ↔ Skill connection with proficiency.
import React, { useState, useEffect } from 'react';

const ConnectionModal = ({ show, onClose, onSave, people, skills }) => {
  const [form, setForm] = useState({
    personId: '',
    skillId: '',
    proficiency: 'familiar',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setForm({ personId: '', skillId: '', proficiency: 'familiar' });
      setError('');
    }
  }, [show]);

  if (!show) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.personId || !form.skillId) {
      setError('Please select a person and a skill');
      return;
    }
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <form className="modal-content" onSubmit={submit}>
            <div className="modal-header">
              <h5 className="modal-title">Connect Person to Skill</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <div className="mb-3">
                <label className="form-label">Person</label>
                <select
                  className="form-select"
                  value={form.personId}
                  onChange={(e) => setForm({ ...form, personId: e.target.value })}
                >
                  <option value="">Select person...</option>
                  {people.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — {p.role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Skill</label>
                <select
                  className="form-select"
                  value={form.skillId}
                  onChange={(e) => setForm({ ...form, skillId: e.target.value })}
                >
                  <option value="">Select skill...</option>
                  {skills.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Proficiency</label>
                <select
                  className="form-select"
                  value={form.proficiency}
                  onChange={(e) => setForm({ ...form, proficiency: e.target.value })}
                >
                  <option value="learning">Learning</option>
                  <option value="familiar">Familiar</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Connect
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ConnectionModal;
