function ProfileAbout({ bio }) {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">
        About
      </h2>

      <p className="text-gray-600">
        {bio || "No bio added."}
      </p>
    </div>
  );
}

export default ProfileAbout;