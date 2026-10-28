import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useNotification } from "../context/notificationContext";
import Avatar from "./common/Avatar";
import {
  FiBell,
  FiSearch,
  FiHome,
  FiFolder,
  FiMessageSquare,
  FiUser,
  FiLogOut,
  FiPlus,
  FiCheck,
  FiTrash2,
  FiMenu,
  FiX,
  FiEdit3,
  FiCpu,
  FiUsers,
  FiSettings,
  FiBookmark,
} from "react-icons/fi";

const Navbar = () => {
  const { user, handleLogout } = useAuth();
  const { notifications, unreadCount, markAllRead, markRead, deleteNotification } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setShowNotifications(false);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const onLogoutClick = async () => {
    await handleLogout();
    navigate("/login");
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-violet-200 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-violet-950 to-violet-800 bg-clip-text text-transparent">
                Dev<span className="text-violet-600">Connect</span>
              </span>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiSearch size={17} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search developers, posts, or tech tags..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-sm rounded-full border border-transparent focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
              />
            </div>
          </form>

          {/* Nav links & Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "text-violet-700 bg-violet-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  <FiHome size={18} />
                  <span className="hidden lg:inline">Feed</span>
                </NavLink>

                <NavLink
                  to="/discover"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "text-violet-700 bg-violet-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  <FiUsers size={18} />
                  <span className="hidden lg:inline">Discover</span>
                </NavLink>

                <NavLink
                  to="/ai"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "text-violet-700 bg-violet-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  <FiCpu size={18} />
                  <span className="hidden lg:inline">AI Tools</span>
                </NavLink>

                <NavLink
                  to="/projects"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "text-violet-700 bg-violet-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  <FiFolder size={18} />
                  <span className="hidden lg:inline">Projects</span>
                </NavLink>

                <NavLink
                  to="/message"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "text-violet-700 bg-violet-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`
                  }
                >
                  <FiMessageSquare size={18} />
                  <span className="hidden lg:inline">Messages</span>
                </NavLink>

                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 rounded-full text-slate-600 hover:text-violet-700 hover:bg-slate-100 transition focus:outline-none"
                    aria-label="Notifications"
                  >
                    <FiBell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-violet-100 text-violet-700">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1"
                          >
                            <FiCheck size={14} /> Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="py-12 text-center text-slate-400">
                            <FiBell className="mx-auto mb-2 opacity-40" size={28} />
                            <p className="text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (!n.isRead) markRead(n.id);
                                if (n.sender?.username) {
                                  navigate(`/profile/${n.sender.username}`);
                                }
                              }}
                              className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition ${
                                !n.isRead ? "bg-violet-50/60" : ""
                              }`}
                            >
                              <img
                                src={n.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(n.sender?.username || "Dev")}&background=7c3aed&color=fff`}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-slate-200"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-800 leading-snug">
                                  <strong className="font-semibold text-slate-900">
                                    {n.sender?.username || "Someone"}
                                  </strong>{" "}
                                  {n.message}
                                </p>
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                  {formatTime(n.createdAt)}
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(n.id);
                                }}
                                className="text-slate-300 hover:text-red-500 p-1 rounded transition"
                                title="Delete"
                              >
                                <FiTrash2 size={13} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Create Quick Action */}
                <Link
                  to="/posts/new"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-sm shadow-violet-200 transition"
                >
                  <FiPlus size={16} />
                  <span>Post</span>
                </Link>

                {/* User Avatar Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-violet-400 transition focus:outline-none"
                  >
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || "Dev")}&background=7c3aed&color=fff`}
                      alt={user.username}
                      className="w-9 h-9 rounded-full object-cover border border-violet-200"
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.username}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-violet-700 transition"
                        >
                          <FiUser size={16} /> My Profile
                        </Link>
                        <Link
                          to="/profile/edit"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-violet-700 transition"
                        >
                          <FiEdit3 size={16} /> Edit Profile
                        </Link>
                        <Link
                          to="/saved"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-violet-700 transition"
                        >
                          <FiBookmark size={16} /> Saved Posts
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-violet-700 transition"
                        >
                          <FiSettings size={16} /> Settings
                        </Link>
                        <Link
                          to="/projects/new"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-violet-700 transition"
                        >
                          <FiPlus size={16} /> New Project
                        </Link>
                        <Link
                          to="/posts/new"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-violet-700 transition"
                        >
                          <FiPlus size={16} /> Create Post
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={onLogoutClick}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          <FiLogOut size={16} /> Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-violet-700 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-sm shadow-violet-200 transition"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-3">
            <form onSubmit={handleSearchSubmit} className="px-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search developers, posts..."
                className="w-full px-4 py-2 bg-slate-100 text-sm rounded-lg outline-none"
              />
            </form>
            <div className="grid grid-cols-2 gap-2 px-2 text-sm font-medium">
              <Link to="/" className="p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2">
                <FiHome /> Feed
              </Link>
              <Link to="/projects" className="p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2">
                <FiFolder /> Projects
              </Link>
              <Link to="/message" className="p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2">
                <FiMessageSquare /> Messages
              </Link>
              <Link to="/profile" className="p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2">
                <FiUser /> Profile
              </Link>
              <Link to="/discover" className="p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2">
                <FiUsers /> Discover
              </Link>
              <Link to="/ai" className="p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2">
                <FiCpu /> AI Tools
              </Link>
              <Link to="/settings" className="p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2">
                <FiSettings /> Settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
