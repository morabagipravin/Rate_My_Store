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
    
    try {
      // Fetch user's ratings for all stores
      const userRatings = {};
      for (const store of stores) {
        try {
          const res = await axios.get(`http://localhost:5000/api/store/${store.id}/ratings`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Find the current user's rating in the ratings array
          const currentUserRating = res.data.ratings.find(r => r.userId === getUserIdFromToken());
          if (currentUserRating) {
            userRatings[store.id] = currentUserRating.rating;
          }
        } catch (err) {
          // If user doesn't have permission or no ratings, continue
          console.log(`No ratings found for store ${store.id}`);
        }
      }
      setMyRatings(userRatings);
    } catch (err) {
      console.error('Error fetching user ratings:', err);
    }
  };

  // Helper function to get user ID from token
  const getUserIdFromToken = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => { 
    fetchStores(); 
  }, []);

  useEffect(() => {
    if (stores.length > 0) {
      fetchMyRatings();
    }
  }, [stores]);

  const handleRate = async (storeId, rating) => {
    try {
      console.log('Submitting rating:', { storeId, rating });
      await axios.post('http://localhost:5000/api/store/rate', { storeId, rating }, { headers: { Authorization: `Bearer ${getToken()}` } });
      console.log('Rating submitted successfully');
      
      // Update local state immediately for better UX
      setMyRatings(prev => ({ ...prev, [storeId]: rating }));
      
      // Refresh stores to get updated average ratings
      fetchStores();
    } catch (err) {
      console.error('Rating submission error:', err.response?.data || err.message);
      alert('Failed to submit rating: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredStores = stores.filter(s =>
    (!filter.name || s.name.toLowerCase().includes(filter.name.toLowerCase())) &&
    (!filter.address || s.address.toLowerCase().includes(filter.address.toLowerCase()))
  );

  const getRatingButtonClass = (storeId, ratingValue) => {
    const userRating = myRatings[storeId];
    if (userRating && ratingValue <= userRating) {
      return 'bg-blue-600 text-white hover:bg-blue-700';
    }
    return 'bg-gray-200 hover:bg-gray-300';
  };

  if (loading) return <div className="p-8">Loading...</div>;

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
              <td className="py-2 px-4">
                {myRatings[store.id] ? (
                  <span className="text-blue-600 font-semibold">{myRatings[store.id]}/5</span>
                ) : (
                  <span className="text-gray-500">Not rated</span>
                )}
              </td>
              <td className="py-2 px-4">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(r => (
                    <button 
                      key={r} 
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${getRatingButtonClass(store.id, r)}`} 
                      onClick={() => handleRate(store.id, r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 