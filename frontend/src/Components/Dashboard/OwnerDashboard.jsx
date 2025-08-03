import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../../utils/auth';

export default function OwnerDashboard() {
  const [stores, setStores] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/store/all', { headers: { Authorization: `Bearer ${getToken()}` } });
      const ownerId = JSON.parse(atob(getToken().split('.')[1])).id;
      const myStores = res.data.stores.filter(s => s.ownerId === ownerId);
      setStores(myStores);
      for (const store of myStores) {
        const r = await axios.get(`http://localhost:5000/api/store/${store.id}/ratings`, { headers: { Authorization: `Bearer ${getToken()}` } });
        setRatings(prev => ({ ...prev, [store.id]: r.data }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStores(); }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">My Store Ratings</h1>
      {stores.map(store => (
        <div key={store.id} className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{store.name}</h2>
          <div>Average Rating: {ratings[store.id]?.average?.toFixed(2) ?? 0}</div>
          <table className="min-w-full bg-white border border-gray-200 rounded-lg mt-2">
            <thead>
              <tr className="bg-indigo-100 text-left text-gray-700">
                <th className="py-2 px-4">User Name</th>
                <th className="py-2 px-4">User Email</th>
                <th className="py-2 px-4">Rating</th>
              </tr>
            </thead>
            <tbody>
              {ratings[store.id]?.ratings?.map(r => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{r.User?.name}</td>
                  <td className="py-2 px-4">{r.User?.email}</td>
                  <td className="py-2 px-4">{r.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
} 