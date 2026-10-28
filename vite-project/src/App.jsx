import "./App.css";
import Navbar from "./components/navbar";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Protected from "./components/protected";
import Profile from "./pages/profile/Profile";
import EditProfile from "./pages/profile/EditProfile";
import Projects from "./pages/projects/Projects";
import NewProject from "./pages/projects/NewProject";
import ProjectDetails from "./pages/projects/ProjectDetails";
import EditProject from "./pages/projects/EditProject";
import PublicProfile from "./pages/profile/PublicProfile";
import NewPost from "./pages/posts/NewPost";
import EditPost from "./pages/posts/EditPost";
import PostDetails from "./pages/posts/PostDetails";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { socket } from "./socket/socket";
import Chat from "./pages/chats/chat";
import SearchResults from "./components/SearchResult";
import AITools from "./pages/ai/AITools";
import Discover from "./pages/discover/Discover";
import SavedPosts from "./pages/posts/SavedPosts";
import Settings from "./pages/settings/Settings";

function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }
    if (user) {
      console.log("registering socket for user", user.id);
      socket.emit("register", user.id);
    }
  }, [user]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/register" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Protected>
              <Home />
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <Protected>
              <EditProfile />
            </Protected>
          }
        />
        <Route path="/profile/:username" element={<PublicProfile />} />
        <Route path="/projects" element={<Projects />} />
        <Route
          path="/projects/new"
          element={
            <Protected>
              <NewProject />
            </Protected>
          }
        />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/projects/edit/:id" element={<EditProject />} />
        <Route
          path="/posts/new"
          element={
            <Protected>
              <NewPost />
            </Protected>
          }
        />
        <Route
          path="/posts/edit/:id"
          element={
            <Protected>
              <EditPost />
            </Protected>
          }
        />
        <Route path="/posts/:id" element={<PostDetails />} />
        <Route path="/post/:id" element={<PostDetails />} />
        <Route
          path="/message"
          element={
            <Protected>
              <Chat />
            </Protected>
          }
        />
        <Route path="/search" element={<SearchResults />} />
        <Route
          path="/discover"
          element={
            <Protected>
              <Discover />
            </Protected>
          }
        />
        <Route
          path="/saved"
          element={
            <Protected>
              <SavedPosts />
            </Protected>
          }
        />
        <Route
          path="/settings"
          element={
            <Protected>
              <Settings />
            </Protected>
          }
        />
        <Route
          path="/ai"
          element={
            <Protected>
              <AITools />
            </Protected>
          }
        />
        <Route
          path="/ai-tools"
          element={
            <Protected>
              <AITools />
            </Protected>
          }
        />
      </Routes>
    </>
  );
}

export default App;
