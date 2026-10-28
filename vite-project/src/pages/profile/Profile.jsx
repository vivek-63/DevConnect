import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../../services/profile";
import ProfileBanner from "../../components/Profile/ProfileBanner";
import ProfileHeader from "../../components/Profile/ProfileHeader";
import ProfileAbout from "../../components/Profile/ProfileAbout";
import ProfileSkills from "../../components/Profile/ProfileSkills";
import ProfileSocials from "../../components/Profile/ProfileSocials";
import Projects from "../projects/Projects";
import UserPost from "../posts/UserPost";
import { FiPlus } from "react-icons/fi";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data.user);
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 animate-pulse">
          <div className="h-52 bg-slate-200" />
          <div className="p-8 pt-16 space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Profile not found</h2>
          <p className="text-sm text-slate-500 mb-4">Please log in to view your profile.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
        <ProfileBanner user={profile} />

        <div className="p-6 sm:p-8 pt-16 sm:pt-20">
          <ProfileHeader user={profile} isPublic={false} />

          {/* Navigation Tabs */}
          <div className="flex gap-8 border-b border-slate-200 mt-8 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("about")}
              className={`pb-3 text-sm font-semibold transition border-b-2 whitespace-nowrap ${
                activeTab === "about"
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              About & Skills
            </button>

            <button
              onClick={() => setActiveTab("projects")}
              className={`pb-3 text-sm font-semibold transition border-b-2 whitespace-nowrap ${
                activeTab === "projects"
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Projects ({profile.projects?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab("posts")}
              className={`pb-3 text-sm font-semibold transition border-b-2 whitespace-nowrap ${
                activeTab === "posts"
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Posts ({profile.posts?.length || 0})
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            {activeTab === "about" && (
              <div className="space-y-6">
                <ProfileAbout bio={profile.bio} />
                <ProfileSkills skills={profile.skills} />
                <ProfileSocials user={profile} />
              </div>
            )}

            {activeTab === "projects" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Showcased Projects</h3>
                  <button
                    onClick={() => navigate("/projects/new")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:from-violet-700 hover:to-indigo-700 transition"
                  >
                    <FiPlus size={15} /> New Project
                  </button>
                </div>
                <Projects />
              </div>
            )}

            {activeTab === "posts" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Developer Posts</h3>
                </div>
                <UserPost />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;