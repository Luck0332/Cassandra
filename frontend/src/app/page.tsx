// pages/id-card.tsx
'use client';
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  idennumm: string;
}

const IdCardPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<Omit<User, 'id'>>({ name: '', email: '', age: 0, idennumm: '' });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    const response = await axios.get('/users');
    setUsers(response.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (editingUserId) {
      // Update existing user
      await axios.patch(`/users/${editingUserId}`, formData);
      setUsers(users.map(user => (user.id === editingUserId ? { ...user, ...formData } : user)));
      setEditingUserId(null);
    } else {
      // Create new user
      const response = await axios.post('/users', formData);
      setUsers([...users, response.data]);
    }

    setFormData({ name: '', email: '', age: 0, idennumm: '' });
  };

  const handleEdit = (user: User) => {
    setFormData({ name: user.name, email: user.email, age: user.age, idennumm: user.idennumm });
    setEditingUserId(user.id);
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`/users/${id}`);
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">CRUD บัตรประชาชน</h1>
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="ชื่อ"
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="อีเมล"
          required
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          placeholder="อายุ"
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="idennumm"
          value={formData.idennumm}
          onChange={handleChange}
          placeholder="เลขบัตรประชาชน"
          required
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {editingUserId ? 'อัปเดตบัตรประชาชน' : 'เพิ่มบัตรประชาชน'}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">รายการบัตรประชาชน</h2>
      <div className="grid grid-cols-1 gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-white shadow-lg rounded-lg p-4 w-64">
            <div className="text-center">
              <h3 className="text-lg font-bold">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.idennumm}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500">{user.age} ปี</p>
            </div>
            <button
              onClick={() => handleEdit(user)}
              className="mt-2 w-full bg-yellow-500 text-white p-2 rounded"
            >
              แก้ไข
            </button>
            <button
              onClick={() => handleDelete(user.id)}
              className="mt-2 w-full bg-red-500 text-white p-2 rounded"
            >
              ลบ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IdCardPage;
