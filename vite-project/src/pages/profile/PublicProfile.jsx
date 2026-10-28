import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getPublicProfile } from "../../services/profile";
import ProfileBanner from "../../components/Profile/ProfileBanner";
import ProfileHeader from "../../components/Profile/ProfileHeader";
import ProfileAbout from "../../components/Profile/ProfileAbout";
import ProfileSkills from "../../components/Profile/ProfileSkills";
import ProfileSocials from "../../components/Profile/ProfileSocials";
import ProjectCard from "../../components/projects/ProjectCard";
import PostCard from "../../components/posts/PostCard";
import { useAuth } from "../../hooks/useAuth";
import { followUser, unfollowUser } from "../../services/follow";
import { createConversation } from "../../services/conversation";
import { likePost, unlikePost } from "../../services/post";
import { FiAlertCircle, FiArrowLeft } from "react-icons/fi";

const PublicProfile = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (profile && user) {
      const exist = profile.followers?.some((f) => f.followerId === user.id);
      setIsFollowing(!!exist);
    }
  }, [profile, user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getPublicProfile(username);
      // Handles both { user: ... } and direct user object returns
      setProfile(data?.user || data);
    } catch (err) {
      console.error("Error fetching public profile:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!profile) return;
    try {
      await createConversation(profile.id);
      navigate("/message");
    } catch (err) {
      console.error("Error opening chat:", err);
      navigate("/message");
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    try {
      await followUser(profile.id);
      setIsFollowing(true);
      setProfile((prev) => ({
        ...prev,
        followers: [...(prev.followers || []), { followerId: user?.id }],
        _count: {
          ...prev._count,
          followers: (prev._count?.followers || 0) + 1,
        },
      }));
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const handleUnfollow = async () => {
    if (!profile) return;
    try {
      await unfollowUser(profile.id);
      setIsFollowing(false);
      setProfile((prev) => ({
        ...prev,
        followers: (prev.followers || []).filter((f) => f.followerId !== user?.id),
        _count: {
          ...prev._count,
          followers: Math.max(0, (prev._count?.followers || 0) - 1),
        },
      }));
    } catch (err) {
      console.error("Unfollow error:", err);
    }
  };

  const handleLike = async (postId) => {
    try {
      await likePost(postId);
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: (prev.posts || []).map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              likes: [...(p.likes || []), { userId: user?.id }],
              _count: { ...p._count, likes: (p._count?.likes || 0) + 1 },
            };
          }),
        };
      });
    } catch (err) {
      console.error("Post like error:", err);
    }
  };

  const handleUnlike = async (postId) => {
    try {
      await unlikePost(postId);
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: (prev.posts || []).map((p) => {
            if (p.id !== postId) return p;
            return {
              ...p,
              likes: [],
              _count: {
                ...p._count,
                likes: Math.max(0, (p._count?.likes || 0) - 1),
              },
            };
          }),
        };
      });
    } catch (err) {
      console.error("Post unlike error:", err);
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
        <div className="bg-white rounded-3xl p-10 max-w-md text-center shadow-sm border border-slate-200">
          <FiAlertCircle size={40} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800 mb-1">Developer Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            We couldn't find a developer with username "@{username}".
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition"
          >
            <FiArrowLeft size={16} /> Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
        <ProfileBanner user={profile} />

        <div className="p-6 sm:p-8 pt-16 sm:pt-20">
          <ProfileHeader
            user={profile}
            isPublic={true}
            isFollowing={isFollowing}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            handleMessage={handleMessage}
          />

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
              <div>
                {(!profile.projects || profile.projects.length === 0) ? (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                    This developer has not added any projects yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.projects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        isPublic={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "posts" && (
              <div>
                {(!profile.posts || profile.posts.length === 0) ? (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                    No posts shared yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        isPublic={true}
                        onLike={handleLike}
                        onUnlike={handleUnlike}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
