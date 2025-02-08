import React, { useState, useContext } from "react";
import { Mail, User, Lock, Eye, EyeOff } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const AuthPages = () => {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: ""
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = isLogin
        ? await login(formData)
        : await register(formData);

      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <InputField
              name="fullName"
              label="Full Name"
              icon={<User className="w-5 h-5 text-gray-400" />}
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          )}
          
          <InputField
            name="email"
            type="email"
            label="Email"
            icon={<Mail className="w-5 h-5 text-gray-400" />}
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <InputField
            name="username"
            label="Username"
            icon={<User className="w-5 h-5 text-gray-400" />}
            value={formData.username}
            onChange={handleChange}
            required
          />
          
          <InputField
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            icon={<Lock className="w-5 h-5 text-gray-400" />}
            value={formData.password}
            onChange={handleChange}
            required
            togglePassword={() => setShowPassword(!showPassword)}
            showPassword={showPassword}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setFormData({
                fullName: "",
                email: "",
                username: "",
                password: ""
              });
            }}
            className="text-pink-500 hover:text-pink-600"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

const InputField = ({
  name,
  label,
  type = "text",
  icon,
  value,
  onChange,
  required,
  togglePassword,
  showPassword
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2">
        {icon}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
      />
      {togglePassword && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5 text-gray-400" />
          ) : (
            <Eye className="w-5 h-5 text-gray-400" />
          )}
        </button>
      )}
    </div>
  </div>
);

export default AuthPages;