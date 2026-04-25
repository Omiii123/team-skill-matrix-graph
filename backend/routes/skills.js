// CRUD routes for Skill. All routes are protected by JWT auth.
const express = require('express');
const { body, validationResult } = require('express-validator');
const Skill = require('../models/Skill');
const Connection = require('../models/Connection');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  const skills = await Skill.find().sort({ createdAt: -1 });
  res.json(skills);
});

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const skill = await Skill.create(req.body);
    res.status(201).json(skill);
  }
);

router.put(
  '/:id',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json(skill);
  }
);

router.delete('/:id', async (req, res) => {
  const skill = await Skill.findByIdAndDelete(req.params.id);
  if (!skill) return res.status(404).json({ message: 'Skill not found' });
  await Connection.deleteMany({ skillId: req.params.id });
  res.json({ message: 'Deleted' });
});

module.exports = router;
