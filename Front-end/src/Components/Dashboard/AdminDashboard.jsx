import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import AdminUserForm from './AdminUserForm';
import AdminStoreForm from './AdminStoreForm';

function StatCard({ label, value }) {
  return (
    <div className="bg-blue-100 rounded p-4 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [userFilter, setUserFilter] = useState({ name: '', email: '', address: '', role: '' });
  const [storeFilter, setStoreFilter] = useState({ name: '', email: '', address: '' });
  const [userSort, setUserSort] = useState({ sortBy: 'createdAt', order: 'DESC' });
  const [storeSort, setStoreSort] = useState({ sortBy: 'createdAt', order: 'DESC' });
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [editStore, setEditStore] = useState(null);
  const [owners, setOwners] = useState([]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [userRes, storeRes] = await Promise.all([
        axios.get('http://localhost:5000/api/user/all', { headers: { Authorization: `Bearer ${getToken()}` } }),
        axios.get('http://localhost:5000/api/store/all'),
      ]);
      setUsers(userRes.data.users);
      setStores(storeRes.data.stores);
      const ownerUsers = userRes.data.users.filter(u => u.role === 'owner');
      console.log('Available owners:', ownerUsers);
      setOwners(ownerUsers);
      setStats({
        users: userRes.data.users.length,
        stores: storeRes.data.stores.length,
        ratings: storeRes.data.stores.reduce((sum, s) => sum + (s.averageRating > 0 ? 1 : 0), 0),
      });
    } catch (err) {
      console.error('Fetch stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  // Filtering and sorting
  const filteredUsers = users.filter(u =>
    (!userFilter.name || u.name.toLowerCase().includes(userFilter.name.toLowerCase())) &&
    (!userFilter.email || u.email.toLowerCase().includes(userFilter.email.toLowerCase())) &&
    (!userFilter.address || u.address.toLowerCase().includes(userFilter.address.toLowerCase())) &&
    (!userFilter.role || u.role === userFilter.role)
  ).sort((a, b) => {
    if (userSort.order === 'ASC') return a[userSort.sortBy].localeCompare(b[userSort.sortBy]);
    return b[userSort.sortBy].localeCompare(a[userSort.sortBy]);
  });

  const filteredStores = stores.filter(s =>
    (!storeFilter.name || s.name.toLowerCase().includes(storeFilter.name.toLowerCase())) &&
    (!storeFilter.email || s.email.toLowerCase().includes(storeFilter.email.toLowerCase())) &&
    (!storeFilter.address || s.address.toLowerCase().includes(storeFilter.address.toLowerCase()))
  ).sort((a, b) => {
    if (storeSort.order === 'ASC') return a[storeSort.sortBy].localeCompare(b[storeSort.sortBy]);
    return b[storeSort.sortBy].localeCompare(a[storeSort.sortBy]);
  });

  // User CRUD
  const handleAddUser = () => { setEditUser(null); setShowUserForm(true); };
  const handleEditUser = (user) => { setEditUser(user); setShowUserForm(true); };
  const handleDeleteUser = async (id) => {
    await axios.delete(`http://localhost:5000/api/user/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
    fetchStats();
  };
  const handleSaveUser = async (user) => {
    if (user.id) {
      await axios.patch(`http://localhost:5000/api/user/updateUser/${user.id}`, user, { headers: { Authorization: `Bearer ${getToken()}` } });
    } else {
      await axios.post('http://localhost:5000/api/user/register', user, { headers: { Authorization: `Bearer ${getToken()}` } });
    }
    setShowUserForm(false); setEditUser(null); fetchStats();
  };

  // Store CRUD
  const handleAddStore = () => { 
    // Refresh owners list before showing form
    fetchStats();
    setEditStore(null); 
    setShowStoreForm(true); 
  };
  const handleEditStore = (store) => { setEditStore(store); setShowStoreForm(true); };
  const handleDeleteStore = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/store/delete/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      fetchStats();
    } catch (err) {
      console.error('Delete store error:', err.response?.data || err.message);
      alert('Failed to delete store: ' + (err.response?.data?.message || err.message));
    }
  };
  const handleSaveStore = async (store) => {
    try {
      // Ensure ownerId is an integer
      const storeData = {
        ...store,
        ownerId: parseInt(store.ownerId, 10)
      };
      
      if (store.id) {
        await axios.patch(`http://localhost:5000/api/store/update/${store.id}`, storeData, { headers: { Authorization: `Bearer ${getToken()}` } });
      } else {
        console.log('Creating store with data:', storeData);
        await axios.post('http://localhost:5000/api/store/create', storeData, { headers: { Authorization: `Bearer ${getToken()}` } });
      }
      setShowStoreForm(false); setEditStore(null); fetchStats();
    } catch (err) {
      console.error('Save store error:', err.response?.data || err.message);
      alert('Failed to save store: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Users" value={stats.users} />
        <StatCard label="Total Stores" value={stats.stores} />
        <StatCard label="Total Ratings" value={stats.ratings} />
      </div>
      <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-indigo-600">All Users</h2>
          <button onClick={handleAddUser} className="bg-blue-600 text-white px-3 py-1 rounded">Add User</button>
        </div>
        {showUserForm && <AdminUserForm initial={editUser} onSave={handleSaveUser} onCancel={() => { setShowUserForm(false); setEditUser(null); }} />}
        <div className="flex gap-2 mb-2">
          <input placeholder="Name" className="border px-2 py-1 rounded" value={userFilter.name} onChange={e => setUserFilter(f => ({ ...f, name: e.target.value }))} />
          <input placeholder="Email" className="border px-2 py-1 rounded" value={userFilter.email} onChange={e => setUserFilter(f => ({ ...f, email: e.target.value }))} />
          <input placeholder="Address" className="border px-2 py-1 rounded" value={userFilter.address} onChange={e => setUserFilter(f => ({ ...f, address: e.target.value }))} />
          <select className="border px-2 py-1 rounded" value={userFilter.role} onChange={e => setUserFilter(f => ({ ...f, role: e.target.value }))}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-indigo-100 text-left text-gray-700">
              <th className="py-2 px-4 cursor-pointer" onClick={() => setUserSort(s => ({ sortBy: 'name', order: s.order === 'ASC' ? 'DESC' : 'ASC' }))}>Name</th>
              <th className="py-2 px-4 cursor-pointer" onClick={() => setUserSort(s => ({ sortBy: 'email', order: s.order === 'ASC' ? 'DESC' : 'ASC' }))}>Email</th>
              <th className="py-2 px-4">Address</th>
              <th className="py-2 px-4">Role</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{user.name}</td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4">{user.address}</td>
                <td className="py-2 px-4">{user.role}</td>
                <td className="py-2 px-4 space-x-2">
                  {user.role !== 'admin' && <>
                    <button onClick={() => handleEditUser(user)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                    <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                  </>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-teal-600">All Stores</h2>
          <button onClick={handleAddStore} className="bg-blue-600 text-white px-3 py-1 rounded">Add Store</button>
        </div>
        {showStoreForm && <AdminStoreForm initial={editStore} onSave={handleSaveStore} onCancel={() => { setShowStoreForm(false); setEditStore(null); }} owners={owners} />}
        <div className="flex gap-2 mb-2">
          <input placeholder="Name" className="border px-2 py-1 rounded" value={storeFilter.name} onChange={e => setStoreFilter(f => ({ ...f, name: e.target.value }))} />
          <input placeholder="Email" className="border px-2 py-1 rounded" value={storeFilter.email} onChange={e => setStoreFilter(f => ({ ...f, email: e.target.value }))} />
          <input placeholder="Address" className="border px-2 py-1 rounded" value={storeFilter.address} onChange={e => setStoreFilter(f => ({ ...f, address: e.target.value }))} />
        </div>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-teal-100 text-left text-gray-700">
              <th className="py-2 px-4 cursor-pointer" onClick={() => setStoreSort(s => ({ sortBy: 'name', order: s.order === 'ASC' ? 'DESC' : 'ASC' }))}>Name</th>
              <th className="py-2 px-4 cursor-pointer" onClick={() => setStoreSort(s => ({ sortBy: 'email', order: s.order === 'ASC' ? 'DESC' : 'ASC' }))}>Email</th>
              <th className="py-2 px-4">Address</th>
              <th className="py-2 px-4">Rating</th>
              <th className="py-2 px-4">Owner</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.map(store => (
              <tr key={store.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{store.name}</td>
                <td className="py-2 px-4">{store.email}</td>
                <td className="py-2 px-4">{store.address}</td>
                <td className="py-2 px-4">{store.averageRating?.toFixed(2) ?? 0}</td>
                <td className="py-2 px-4">{owners.find(o => o.id === store.ownerId)?.name || 'N/A'}</td>
                <td className="py-2 px-4 space-x-2">
                  <button onClick={() => handleEditStore(store)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                  <button onClick={() => handleDeleteStore(store.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
} 