// // index.js
const express = require('express');
// const cassandra = require('cassandra-driver');
const { v4: uuidv4 } = require('uuid');


const app = express();
app.use(express.json());

// // ตั้งค่าการเชื่อมต่อกับ Cassandra
// const client = new cassandra.Client({
//   contactPoints: ['127.0.0.1:9042'],
//   localDataCenter: 'datacenter1',
//   keyspace: 'my_keyspace'
// });
const cassandra = require('cassandra-driver');

// Create a client instance
const client = new cassandra.Client({
    contactPoints: ['127.0.0.1:9042'], // Use Docker host IP or localhost
    localDataCenter: 'datacenter1' ,     // Change if needed
    keyspace: 'my_keyspace'
});
// ตรวจสอบการเชื่อมต่อกับ Cassandra
client.connect()
  .then(() => console.log('Connected to Cassandra'))
  .catch(err => console.error('Failed to connect to Cassandra', err));


// CREATE - เพิ่มข้อมูลผู้ใช้ใหม่
app.post('/users', async (req, res) => {
  const { name, email, age } = req.body;
  const id =uuidv4();

  if (!name || !email || !age) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO users (id, name, email, age) VALUES (?, ?, ?, ?)';
  const params = [id, name, email, age];

  try {
      await client.execute(query, params);
      res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
      console.error('Error inserting data:', err);
      res.status(500).json({ error: 'Failed to create user' });
  }
});
// READ - ดึงข้อมูลผู้ใช้ทั้งหมด
app.get('/users', async (req, res) => {
  const query = 'SELECT * FROM users';

  try {
      const results = await client.execute(query);
      res.json(results.rows);
  } catch (err) {
      console.error('Error retrieving users:', err);
      res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// READ - ดึงข้อมูลผู้ใช้ตาม ID
app.get('/users/:id', async (req, res) => {
  const userId = req.params.id;

  const query = 'SELECT * FROM users WHERE id = ?';
  const params = [userId];
  //res.json(req.params);
  try {
      const results = await client.execute(query, params);
      if (results.rows.length > 0) {
          res.json(results.rows[0]);
      } else {
          res.status(404).json({ error: 'User not found' });
      }
  } catch (err) {
      console.error('Error retrieving user:', err);
      res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

// UPDATE - อัปเดตข้อมูลผู้ใช้
app.patch('/users/:id', async (req, res) => {
  const id = req.params.id;
  const { name, email, age } = req.body;
  const params=[];

  const updateStatements = [];
  if (name) {
      updateStatements.push('name = ?');
      params.push(name);
  }
  if (email) {
      updateStatements.push('email = ?');
      params.push(email);
  }
  if (age) {
      updateStatements.push('age = ?');
      params.push(age);
  }

  if (updateStatements.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
  }
  
  const query = `UPDATE users SET ${updateStatements.join(', ')} WHERE id = ?`;
  params.push(id);


// console.log(params);

  try {
      await client.execute(query, params);
      res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ error:   
'Failed to update user' });
  }
});

// DELETE - ลบผู้ใช้ตาม ID
app.delete('/users/:id', async (req, res) => {
  const id =req.params.id
  const params=[id];
  
  const query = 'DELETE FROM users WHERE id = ?';

  try {
    await client.execute(query, params);
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user',error });
  }
});

// เริ่มต้นเซิร์ฟเวอร์
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
