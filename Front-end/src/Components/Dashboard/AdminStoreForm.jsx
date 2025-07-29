import { useState, useEffect } from 'react';

export default function AdminStoreForm({ initial, onSave, onCancel, owners }) {
  const [formData, setFormData] = useState(initial || { name: '', email: '', address: '', ownerId: '' });
  const [error, setError] = useState('');

  useEffect(() => { if (initial) setFormData(initial); }, [initial]);

  const validate = () => {
    if (!formData.name) return 'Name required.';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return 'Invalid email.';
    if (!formData.address) return 'Address required.';
    if (!formData.ownerId) return 'Owner required.';
    return null;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    setError('');
  };

  const handleSubmit = e => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="border px-2 py-1 rounded w-full" required />
      <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="border px-2 py-1 rounded w-full" required />
      <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="border px-2 py-1 rounded w-full" required />
      <select name="ownerId" value={formData.ownerId} onChange={handleChange} className="border px-2 py-1 rounded w-full" required>
        <option value="">Select Owner</option>
        {owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
      </select>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
        <button type="button" onClick={onCancel} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
      </div>
    </form>
  );
} 