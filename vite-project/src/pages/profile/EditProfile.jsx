import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../../services/profile";
import { reviewProfile } from "../../services/ai";
import { useAuth } from "../../hooks/useAuth";
import {
  FiUser, FiMail, FiGithub, FiLinkedin, FiBook, FiBriefcase,
  FiTag, FiSave, FiArrowLeft, FiAlertCircle, FiCheckCircle, FiImage
} from "react-icons/fi";
import { HiSparkles as FiSparkles } from "react-icons/hi";

const EditProfile = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [aiBioLoading, setAiBioLoading] = useState(false);
  const [aiBioMessage, setAiBioMessage] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    avatar: "",
    college: "",
    designation: "",
    github: "",
    linkedin: "",
    skills: "",
  });

  const handleGenerateBio = async () => {
    setAiBioLoading(true);
    setError("");
    setAiBioMessage("");
    try {
      const data = await reviewProfile(formData.designation || "Software Developer");
      if (data?.review?.improvedBio) {
        setFormData((prev) => ({ ...prev, bio: data.review.improvedBio }));
        setAiBioMessage("✨ Bio generated with AI! Review and click Save Changes.");
        setTimeout(() => setAiBioMessage(""), 5000);
      }
    } catch (err) {
      setError(err.message || "Failed to generate bio with AI");
    } finally {
      setAiBioLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      const u = data?.user;
      if (!u) return;
      setFormData({
        username: u.username || "",
        email: u.email || "",
        bio: u.bio || "",
        avatar: u.avatar || "",
        college: u.college || "",
        designation: u.designation || "",
        github: u.github || "",
        linkedin: u.linkedin || "",
        skills: u.skills?.join(", ") || "",
      });
    } catch (error) {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateProfile({
        ...formData,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      await checkAuth();
      setSuccess(true);
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  const Field = ({ icon: Icon, label, name, type = "text", placeholder, as }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={16} />
        </div>
        {as === "textarea" ? (
          <textarea
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            rows={3}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl outline-none transition resize-none"
          />
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl outline-none transition"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-violet-600 transition mb-6"
        >
          <FiArrowLeft size={16} />
          Back to Profile
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5">
            <h1 className="text-xl font-bold text-white">Edit Profile</h1>
            <p className="text-violet-200 text-sm mt-0.5">Keep your developer profile up to date</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Status messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <FiAlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                <FiCheckCircle size={16} className="flex-shrink-0" />
                Profile updated! Redirecting...
              </div>
            )}

            {/* Avatar preview */}
            {formData.avatar && (
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={formData.avatar}
                  alt="Avatar preview"
                  className="w-14 h-14 rounded-full object-cover border-2 border-violet-200"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div>
                  <p className="text-xs font-medium text-slate-700">Avatar Preview</p>
                  <p className="text-xs text-slate-400">Make sure the URL is publicly accessible</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field icon={FiUser} label="Username" name="username" placeholder="your_username" />
              <Field icon={FiMail} label="Email" name="email" type="email" placeholder="dev@example.com" />
            </div>

            <Field icon={FiImage} label="Avatar URL" name="avatar" placeholder="https://example.com/avatar.jpg" />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Bio
                </span>
                <button
                  type="button"
                  disabled={aiBioLoading}
                  onClick={handleGenerateBio}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100/80 border border-violet-200 rounded-lg transition disabled:opacity-50"
                >
                  <FiSparkles size={13} />
                  {aiBioLoading ? "Crafting Bio..." : "Enhance with AI"}
                </button>
              </div>
              {aiBioMessage && (
                <div className="mb-2 p-2.5 bg-violet-50/80 border border-violet-200 rounded-xl text-xs text-violet-800 flex items-center gap-2">
                  <FiSparkles size={14} className="flex-shrink-0 text-violet-600" />
                  <span>{aiBioMessage}</span>
                </div>
              )}
              <div className="relative">
                <div className="absolute left-3 top-3 text-slate-400">
                  <FiUser size={16} />
                </div>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell the community about yourself, your stack, and what you build..."
                  rows={3}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl outline-none transition resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field icon={FiBriefcase} label="Designation" name="designation" placeholder="Full Stack Developer" />
              <Field icon={FiBook} label="College / University" name="college" placeholder="IIT Bombay" />
            </div>

            <Field
              icon={FiTag}
              label="Skills (comma separated)"
              name="skills"
              placeholder="React, Node.js, PostgreSQL, Docker"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field icon={FiGithub} label="GitHub URL" name="github" placeholder="https://github.com/username" />
              <Field icon={FiLinkedin} label="LinkedIn URL" name="linkedin" placeholder="https://linkedin.com/in/username" />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-sm transition disabled:opacity-60"
            >
              <FiSave size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;