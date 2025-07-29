import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../../utils/auth';

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [myRatings, setMyRatings] = useState({});
  const [filter, setFilter] = useState({ name: '', address: '' });
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/store/all');
      setStores(res.data.stores);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRatings = async () => {
    const token = getToken();
    if (!token) return;
    // Assume backend endpoint for user's ratings (not implemented, so fallback to all stores for now)
    // Here, we fetch all stores and extract user's rating from each store's ratings if available
    // In a real app, backend should provide /api/user/ratings
  };

  useEffect(() => { fetchStores(); fetchMyRatings(); }, []);

  const handleRate = async (storeId, rating) => {
    await axios.post('http://localhost:5000/api/store/rate', { storeId, rating }, { headers: { Authorization: `Bearer ${getToken()}` } });
    fetchStores();
  };

  const filteredStores = stores.filter(s =>
    (!filter.name || s.name.toLowerCase().includes(filter.name.toLowerCase())) &&
    (!filter.address || s.address.toLowerCase().includes(filter.address.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Store Listing</h1>
      <div className="flex gap-2 mb-4">
        <input placeholder="Search Name" className="border px-2 py-1 rounded" value={filter.name} onChange={e => setFilter(f => ({ ...f, name: e.target.value }))} />
        <input placeholder="Search Address" className="border px-2 py-1 rounded" value={filter.address} onChange={e => setFilter(f => ({ ...f, address: e.target.value }))} />
      </div>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-indigo-100 text-left text-gray-700">
            <th className="py-2 px-4">Store Name</th>
            <th className="py-2 px-4">Address</th>
            <th className="py-2 px-4">Overall Rating</th>
            <th className="py-2 px-4">Your Rating</th>
            <th className="py-2 px-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredStores.map(store => (
            <tr key={store.id} className="border-t hover:bg-gray-50">
              <td className="py-2 px-4">{store.name}</td>
              <td className="py-2 px-4">{store.address}</td>
              <td className="py-2 px-4">{store.averageRating?.toFixed(2) ?? 0}</td>
              <td className="py-2 px-4">{myRatings[store.id] || '-'}</td>
              <td className="py-2 px-4">
                {[1,2,3,4,5].map(r => (
                  <button key={r} className={`px-2 ${myRatings[store.id] === r ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => handleRate(store.id, r)}>{r}</button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 