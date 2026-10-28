import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Avatar from "./common/Avatar";
import {
  FiHome,
  FiFolder,
  FiMessageSquare,
  FiUser,
  FiEdit,
  FiExternalLink,
  FiCpu,
  FiUsers,
  FiBookmark,
  FiSettings,
} from "react-icons/fi";

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* User Mini Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Cover banner */}
        <div className="h-20 bg-gradient-to-r from-violet-600 to-indigo-600 relative" />

        <div className="p-4 pt-0 text-center relative">
          {/* Avatar */}
          <div className="-mt-10 mb-3 flex justify-center">
            <Link to="/profile">
              <Avatar
                src={user.avatar}
                name={user.username || "Dev"}
                size="2xl"
                className="border-4 border-white shadow-sm rounded-full"
              />
            </Link>
          </div>

          <Link
            to="/profile"
            className="font-bold text-slate-900 text-lg hover:text-violet-600 transition block truncate"
          >
            {user.username}
          </Link>

          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            {user.designation || "Software Developer"}
          </p>

          {user.bio && (
            <p className="text-xs text-slate-600 mt-2 line-clamp-2 italic">
              {user.bio}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
            <Link
              to="/profile"
              className="p-1 rounded-lg hover:bg-slate-50 transition"
            >
              <span className="font-bold text-slate-900 block text-sm">
                {user._count?.followers || user.followers?.length || 0}
              </span>
              <span className="text-slate-500">Followers</span>
            </Link>
            <Link
              to="/profile"
              className="p-1 rounded-lg hover:bg-slate-50 transition"
            >
              <span className="font-bold text-slate-900 block text-sm">
                {user._count?.following || user.following?.length || 0}
              </span>
              <span className="text-slate-500">Following</span>
            </Link>
          </div>

          <Link
            to="/profile"
            className="mt-4 w-full py-2 px-3 rounded-xl border border-violet-200 text-violet-700 hover:bg-violet-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <FiUser size={14} /> View Full Profile
          </Link>
        </div>
      </div>

      {/* Quick Navigation Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
        <h3 className="px-3 pt-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </h3>
        <nav className="space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-violet-50 text-violet-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <FiHome size={17} />
            <span>Developer Feed</span>
          </NavLink>

          <NavLink
            to="/discover"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-violet-50 text-violet-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <FiUsers size={17} />
            <span>Discover</span>
          </NavLink>

          <NavLink
            to="/ai"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-violet-50 text-violet-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <FiCpu size={17} />
            <span>AI Tools</span>
          </NavLink>

          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-violet-50 text-violet-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <FiBookmark size={17} />
            <span>Saved Posts</span>
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-violet-50 text-violet-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <FiFolder size={17} />
            <span>Projects & Demos</span>
          </NavLink>

          <NavLink
            to="/message"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-violet-50 text-violet-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <FiMessageSquare size={17} />
            <span>Direct Messages</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-violet-50 text-violet-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <FiSettings size={17} />
            <span>Settings</span>
          </NavLink>

          <NavLink
            to="/profile/edit"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-violet-50 text-violet-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <FiEdit size={17} />
            <span>Edit Profile</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;