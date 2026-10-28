import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FiLock, FiUser, FiMail, FiArrowRight, FiAlertCircle } from "react-icons/fi";

const SignUp = () => {
  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    const result = await handleRegister({
      username: username.trim(),
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Registration failed. Try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 items-center justify-center text-white mb-4 shadow-lg shadow-violet-200">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Developer Account
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Join DevConnect and showcase your projects & skills
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl animate-in fade-in duration-200">
            <FiAlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiUser size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition"
                placeholder="johndoe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiMail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition"
                placeholder="dev@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Password (min. 8 characters)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiLock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-white text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 active:scale-[0.99] transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span>Creating account...</span>
            ) : (
              <>
                <span>Sign Up</span>
                <FiArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-700 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;