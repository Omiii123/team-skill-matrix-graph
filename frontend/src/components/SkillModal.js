// Modal for creating/editing a Skill.
import React, { useState, useEffect } from 'react';

const SkillModal = ({ show, onClose, onSave, initial }) => {
  const [form, setForm] = useState({ name: '', category: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) setForm({ name: initial.name || '', category: initial.category || '' });
    else setForm({ name: '', category: '' });
    setError('');
  }, [initial, show]);

  if (!show) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category.trim()) {
      setError('All fields are required');
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
              <h5 className="modal-title">{initial ? 'Edit Skill' : 'Add Skill'}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <div className="mb-3">
                <label className="form-label">Skill Name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="React"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Category</label>
                <input
                  className="form-control"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Frontend"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SkillModal;
