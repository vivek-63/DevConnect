import React, { useState } from "react";
import { Calendar, GraduationCap, Briefcase, Share2, Check, MessageSquare, Edit3 } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function ProfileHeader({
  user,
  isPublic = false,
  isFollowing,
  onFollow,
  onUnfollow,
  handleMessage,
}) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const isSelf = !isPublic || currentUser?.id === user?.id || currentUser?.username === user?.username;

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${user.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        {/* Main Details */}
        <div className="space-y-3 flex-1 min-w-0">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {user.username}
            </h1>
            <p className="text-base text-violet-600 font-medium mt-0.5">
              {user.designation || "Software Developer"}
            </p>
          </div>

          {user.bio && (
            <p className="text-slate-700 text-sm leading-relaxed max-w-2xl whitespace-pre-wrap">
              {user.bio}
            </p>
          )}

          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 pt-1">
            {user.college && (
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <GraduationCap size={16} className="text-violet-500" />
                <span>{user.college}</span>
              </div>
            )}

            {user.createdAt && (
              <div className="flex items-center gap-1.5">
                <Calendar size={15} className="text-slate-400" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              </div>
            )}

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {user.github && (
                <a
                  href={user.github.startsWith("http") ? user.github : `https://${user.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-slate-700 hover:text-black transition"
                  title="GitHub Profile"
                >
                  <FaGithub size={15} />
                  <span className="font-medium">GitHub</span>
                </a>
              )}
              {user.linkedin && (
                <a
                  href={user.linkedin.startsWith("http") ? user.linkedin : `https://${user.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition"
                  title="LinkedIn Profile"
                >
                  <FaLinkedin size={15} />
                  <span className="font-medium">LinkedIn</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 self-start">
          <div className="text-center px-2">
            <span className="block text-2xl font-black text-slate-900">
              {user._count?.followers || user.followers?.length || 0}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Followers
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center px-2">
            <span className="block text-2xl font-black text-slate-900">
              {user._count?.following || user.following?.length || 0}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Following
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center flex-wrap gap-3 pt-2">
        {isSelf ? (
          <button
            onClick={() => navigate("/profile/edit")}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 transition"
          >
            <Edit3 size={15} /> Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={() => (isFollowing ? onUnfollow?.() : onFollow?.())}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${
                isFollowing
                  ? "bg-slate-200 hover:bg-slate-300 text-slate-800"
                  : "bg-violet-600 hover:bg-violet-700 text-white"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
            {handleMessage && (
              <button
                onClick={handleMessage}
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-sm font-semibold flex items-center gap-2 transition"
              >
                <MessageSquare size={16} /> Message
              </button>
            )}
          </>
        )}

        <button
          onClick={handleShare}
          className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium flex items-center gap-2 transition"
        >
          {copied ? (
            <>
              <Check size={16} className="text-green-600" />
              <span className="text-green-700">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 size={16} /> Share Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ProfileHeader;
