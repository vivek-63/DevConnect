import { FaGithub, FaLinkedin } from "react-icons/fa";

function ProfileSocials({ user }) {
  return (
    <div className="space-y-3">
      {user.github && (
        <a
          href={user.github}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2"
        >
          <FaGithub size={20} />
          GitHub
        </a>
      )}

      {user.linkedin && (
        <a
          href={user.linkedin}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2"
        >
          <FaLinkedin size={20} />
          LinkedIn
        </a>
      )}
    </div>
  );
}

export default ProfileSocials;