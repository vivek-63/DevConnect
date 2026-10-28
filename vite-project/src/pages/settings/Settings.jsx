import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FiLogOut, FiUser, FiShield } from "react-icons/fi";

const Settings = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await handleLogout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FiUser /> Account
          </div>
          <p className="text-sm text-slate-600">Signed in as <strong>{user?.username}</strong></p>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FiShield /> Privacy
          </div>
          <p className="text-sm text-slate-500">
            Authentication uses an HTTP-only cookie. Your password is hashed with bcrypt and never sent to the AI tools.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="w-full inline-flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-semibold hover:bg-red-100"
        >
          <FiLogOut /> Log out
        </button>
      </div>
    </div>
  );
};

export default Settings;
