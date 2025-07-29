import { useState, useEffect } from 'react';

export default function AdminUserForm({ initial, onSave, onCancel }) {
  const [formData, setFormData] = useState(initial || { name: '', email: '', address: '', password: '', role: 'user' });
  const [error, setError] = useState('');

  useEffect(() => { if (initial) setFormData(initial); }, [initial]);

  const validate = () => {
    if (formData.name.length < 20 || formData.name.length > 60) return 'Name must be 20-60 characters.';
    if (formData.address.length > 400) return 'Address max 400 characters.';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return 'Invalid email.';
    if (!formData.id && !/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(formData.password)) return 'Password must be 8-16 chars, include uppercase and special character.';
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
      {!formData.id && <input name="password" value={formData.password} onChange={handleChange} placeholder="Password" type="password" className="border px-2 py-1 rounded w-full" required />}
      <select name="role" value={formData.role} onChange={handleChange} className="border px-2 py-1 rounded w-full">
        <option value="admin">Admin</option>
        <option value="user">User</option>
        <option value="owner">Owner</option>
      </select>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
        <button type="button" onClick={onCancel} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
      </div>
    </form>
  );
} 