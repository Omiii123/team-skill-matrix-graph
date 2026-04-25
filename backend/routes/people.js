// CRUD routes for Person. All routes are protected by JWT auth.
const express = require('express');
const { body, validationResult } = require('express-validator');
const Person = require('../models/Person');
const Connection = require('../models/Connection');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET all people
router.get('/', async (req, res) => {
  const people = await Person.find().sort({ createdAt: -1 });
  res.json(people);
});

// POST create person
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').trim().notEmpty().withMessage('Role is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const person = await Person.create(req.body);
    res.status(201).json(person);
  }
);

// PUT update person
router.put(
  '/:id',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').trim().notEmpty().withMessage('Role is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const person = await Person.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!person) return res.status(404).json({ message: 'Person not found' });
    res.json(person);
  }
);

// DELETE person and any related connections
router.delete('/:id', async (req, res) => {
  const person = await Person.findByIdAndDelete(req.params.id);
  if (!person) return res.status(404).json({ message: 'Person not found' });
  await Connection.deleteMany({ personId: req.params.id });
  res.json({ message: 'Deleted' });
});

module.exports = router;
