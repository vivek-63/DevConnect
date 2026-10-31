import React from "react";
import Avatar from "../common/Avatar";

function ProfileBanner({ user }) {
    if (!user) return null;

  console.log('ProfileBanner avatar URL:', user.avatar);


  return (
    <div className="relative">
      {/* Cover gradient banner */}
      <div className="h-44 sm:h-52 bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800" />

      {/* Avatar */}
      <div className="absolute left-6 sm:left-10 -bottom-16">
        <Avatar
          src={user.avatar}
          name={user.username || "Dev"}
          size="4xl"
          className="border-4 border-white shadow-md rounded-full bg-white"
        />
      </div>
    </div>
  );
}

export default ProfileBanner;