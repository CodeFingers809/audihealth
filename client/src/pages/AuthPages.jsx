import React, { useState, useContext } from "react";
import axios from "axios";
import { Mail, User, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const AuthPages = () => {
  const { login } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // ✅ Sign in
        await login(formData);
      } else {
        // ✅ Sign up
        const { data } = await axios.post("http://localhost:8000/api/users/register", formData, { withCredentials: true });

        if (data.success) {
          // ✅ Automatically login after signup
          await login({ email: formData.email, password: formData.password });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">{isLogin ? "Sign In" : "Create Account"}</h2>
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <InputField name="fullName" label="Full Name" icon={<User />} value={formData.fullName} onChange={handleChange} />
          )}
          <InputField name="email" label="Email" type="email" icon={<Mail />} value={formData.email} onChange={handleChange} />
          <InputField name="username" label="Username" icon={<User />} value={formData.username} onChange={handleChange} />
          <InputField
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            icon={<Lock />}
            value={formData.password}
            onChange={handleChange}
            togglePassword={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
          />

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button className="text-blue-600 underline" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

// Reusable Input Field Component
const InputField = ({ name, label, type = "text", icon, value, onChange, togglePassword, showPassword }) => (
  <div>
    <label className="block text-sm font-medium">{label}</label>
    <div className="relative">
      <span className="absolute inset-y-0 left-2 flex items-center">{icon}</span>
      <input type={type} name={name} value={value} onChange={onChange} className="w-full pl-10 p-2 border rounded-lg" />
      {togglePassword && (
        <button type="button" className="absolute inset-y-0 right-2" onClick={togglePassword}>
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
      )}
    </div>
  </div>
);

export default AuthPages;