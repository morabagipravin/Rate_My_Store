import { useState, useEffect } from 'react';

export default function AdminUserForm({ initial, onSave, onCancel }) {
  const [formData, setFormData] = useState(initial || { name: '', email: '', address: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      {!formData.id && (
        <div className="relative">
          <input 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            placeholder="Password" 
            type={showPassword ? "text" : "password"} 
            className="border px-2 py-1 rounded w-full pr-10" 
            required 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      )}
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