function ProfileSkills({ skills }) {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">
        Skills
      </h2>

      <div className="flex flex-wrap gap-3">

        {skills?.length === 0 && (
          <p>No skills added.</p>
        )}

        {skills?.map((skill) => (
          <span
            key={skill}
            className="
              px-4 py-2
              rounded-full
              bg-purple-100
              text-purple-700
            "
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ProfileSkills;