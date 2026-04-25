// CRUD routes for Connections (Person ↔ Skill with proficiency).
const express = require('express');
const { body, validationResult } = require('express-validator');
const Connection = require('../models/Connection');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET all connections (populated with person and skill data)
router.get('/', async (req, res) => {
  const connections = await Connection.find()
    .populate('personId', 'name role')
    .populate('skillId', 'name category');
  res.json(connections);
});

// POST create a new connection. Prevents duplicates via unique index.
router.post(
  '/',
  [
    body('personId').notEmpty().withMessage('personId is required'),
    body('skillId').notEmpty().withMessage('skillId is required'),
    body('proficiency')
      .isIn(['learning', 'familiar', 'expert'])
      .withMessage('Proficiency must be learning, familiar, or expert'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const connection = await Connection.create(req.body);
      const populated = await connection.populate([
        { path: 'personId', select: 'name role' },
        { path: 'skillId', select: 'name category' },
      ]);
      res.status(201).json(populated);
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: 'Connection already exists' });
      }
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// DELETE a connection by id
router.delete('/:id', async (req, res) => {
  const conn = await Connection.findByIdAndDelete(req.params.id);
  if (!conn) return res.status(404).json({ message: 'Connection not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
