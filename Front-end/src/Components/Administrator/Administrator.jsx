import { useState } from "react";
import axios from "axios";

const Administrator = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "admin"
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
        setSuccess("");
    };

    const validate = () => {
        if (formData.name.length < 20 || formData.name.length > 60) return 'Name must be 20-60 characters.';
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) return 'Invalid email.';
        if (!formData.address || formData.address.length > 400) return 'Address is required and must be max 400 characters.';
        if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(formData.password)) return 'Password must be 8-16 chars, include uppercase and special character.';
        return null;
    };

    // show and hide password 
    const [showPassword , setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            await axios.post("http://localhost:5000/api/user/register", formData);
            setSuccess("Administrator created successfully!");
            setFormData({ name: "", email: "", password: "", address: "", role: "admin" });
        } catch (err) {
            setError("Failed to create administrator.");
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-blue-100">
                <h2 className="text-3xl font-semibold text-blue-600 mb-6 text-center">Create Administrator</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="text"
                        name="name"
                        placeholder="Name (20-60 characters)"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                    <textarea
                        name="address"
                        placeholder="Address (max 400 characters)"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        rows="3"
                        required
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password (8-16 chars, uppercase + special)"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    {success && <p className="text-green-600 text-sm">{success}</p>}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                        Create Administrator
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Administrator;
