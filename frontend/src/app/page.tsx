'use client';
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  age: string;
  idennumm: string;
}

const IdCardPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<Omit<User, 'id'>>({ name: '', email: '', age: "", idennumm: '' });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // ดึงข้อมูลผู้ใช้จาก API เมื่อโหลดหน้า
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // ฟังก์ชัน handleChange สำหรับอัปเดตค่าใน formData
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ฟังก์ชัน handleSubmit สำหรับจัดการเมื่อผู้ใช้ส่งฟอร์ม
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (editingUserId) {
        // Update user
        const response = await axios.patch(`http://localhost:3001/users/${editingUserId}`, formData);

        // อัปเดต users state ด้วยข้อมูลที่แก้ไขแล้ว
        setUsers(users.map(user => (user.id === editingUserId ? { ...user, ...formData } : user)));
        setEditingUserId(null);
      } else {
        // Create new user
        const response = await axios.post('http://localhost:3001/users', formData);

        // ตรวจสอบว่า API ส่งข้อมูลผู้ใช้ใหม่กลับมาพร้อม ID หรือไม่
        const newUser: User = {
          id: response.data.id || 'generated-id', // ใช้ ID ที่ตอบกลับจาก API หรือสร้างขึ้นเองในกรณีที่ไม่มี
          ...formData
        };

        setUsers([...users, newUser]); // เพิ่มผู้ใช้ใหม่ในรายการ users
      }

      // Reset form data หลังจาก submit
      setFormData({ name: '', email: '', age: "", idennumm: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // ฟังก์ชัน handleEdit สำหรับแก้ไขผู้ใช้
  const handleEdit = (user: User) => {
    setFormData({ name: user.name, email: user.email, age: user.age, idennumm: user.idennumm });
    setEditingUserId(user.id);
  };

  // ฟังก์ชัน handleDelete สำหรับลบผู้ใช้
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3001/users/${id}`);
      setUsers(users.filter(user => user.id !== id)); // ลบผู้ใช้ที่ถูกลบออกจากรายการ
    } catch (error) {
      console.error('Error deleting user:', error);
    }
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
