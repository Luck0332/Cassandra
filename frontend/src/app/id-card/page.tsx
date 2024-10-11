// pages/id-card.tsx
'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

interface IdCard {
  name: string;
  idNumber: string;
}

const IdCardPage = () => {
  const [idCards, setIdCards] = useState<IdCard[]>([]);
  const [formData, setFormData] = useState<IdCard>({ name: '', idNumber: '' });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await axios.post('/api/id-cards', formData);
    setIdCards([...idCards, response.data]);
    setFormData({ name: '', idNumber: '' });
  };

  const handleDelete = async (index: number) => {
    await axios.delete('/api/id-cards', { data: { index } });
    const updatedCards = idCards.filter((_, i) => i !== index);
    setIdCards(updatedCards);
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
          name="idNumber"
          value={formData.idNumber}
          onChange={handleChange}
          placeholder="เลขบัตรประชาชน"
          required
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">เพิ่มบัตรประชาชน</button>
      </form>

      <h2 className="text-xl font-semibold mb-2">รายการบัตรประชาชน</h2>
      <div className="grid grid-cols-1 gap-4">
        {idCards.map((card, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg p-4 w-64">
            <div className="text-center">
              <h3 className="text-lg font-bold">{card.name}</h3>
              <p className="text-sm text-gray-500">{card.idNumber}</p>
            </div>
            <button
              onClick={() => handleDelete(index)}
              className="mt-4 w-full bg-red-500 text-white p-2 rounded"
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
