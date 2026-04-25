// Modal for creating/editing a Person.
import React, { useState, useEffect } from 'react';

const PersonModal = ({ show, onClose, onSave, initial }) => {
  const [form, setForm] = useState({ name: '', role: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) setForm({ name: initial.name || '', role: initial.role || '' });
    else setForm({ name: '', role: '' });
    setError('');
  }, [initial, show]);

  if (!show) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
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
              <h5 className="modal-title">{initial ? 'Edit Person' : 'Add Person'}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Role</label>
                <input
                  className="form-control"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="Frontend Engineer"
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

export default PersonModal;
