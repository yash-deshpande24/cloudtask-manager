const { pool } = require('../config/database');

const getTasks = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const createTask = async (req, res) => {
  const { title, description, priority } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (title,description,priority,user_id) VALUES ($1,$2,$3,$4) RETURNING *',
      [title, description || '', priority || 'medium', req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE tasks SET
        title=COALESCE($1,title), description=COALESCE($2,description),
        status=COALESCE($3,status), priority=COALESCE($4,priority),
        updated_at=NOW()
       WHERE id=$5 AND user_id=$6 RETURNING *`,
      [title, description, status, priority, id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteTask = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM tasks WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted', id: rows[0].id });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
