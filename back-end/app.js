// index.js
const express = require('express');
const cassandra = require('cassandra-driver');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// ตั้งค่าการเชื่อมต่อกับ Cassandra
const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'my_keyspace'
});

// ตรวจสอบการเชื่อมต่อกับ Cassandra
client.connect()
  .then(() => console.log('Connected to Cassandra'))
  .catch(err => console.error('Failed to connect to Cassandra', err));

// CREATE - เพิ่มข้อมูลผู้ใช้ใหม่
app.post('/users', async (req, res) => {
  const { name, email, age } = req.body;
  const user_id = uuidv4();

  const query = 'INSERT INTO users (user_id, name, email, age) VALUES (?, ?, ?, ?)';
  const params = [user_id, name, email, age];

  try {
    await client.execute(query, params, { prepare: true });
    res.status(201).json({ message: 'User created', user_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// READ - ดึงข้อมูลผู้ใช้ทั้งหมด
app.get('/users', async (req, res) => {
  const query = 'SELECT * FROM users';

  try {
    const result = await client.execute(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// READ - ดึงข้อมูลผู้ใช้ตาม ID
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM users WHERE user_id = ?';

  try {
    const result = await client.execute(query, [id], { prepare: true });
    if (result.rowLength === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

// UPDATE - อัปเดตข้อมูลผู้ใช้
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, age } = req.body;

  const query = 'UPDATE users SET name = ?, email = ?, age = ? WHERE user_id = ?';
  const params = [name, email, age, id];

  try {
    await client.execute(query, params, { prepare: true });
    res.json({ message: 'User updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE - ลบผู้ใช้ตาม ID
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM users WHERE user_id = ?';

  try {
    await client.execute(query, [id], { prepare: true });
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// เริ่มต้นเซิร์ฟเวอร์
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
