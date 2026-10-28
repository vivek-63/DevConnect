// vite-project/src/utils/avatar.js

const GRADIENTS = [
  "from-violet-600 to-indigo-600",
  "from-blue-600 to-cyan-600",
  "from-emerald-600 to-teal-600",
  "from-rose-600 to-pink-600",
  "from-amber-600 to-orange-600",
  "from-purple-600 to-fuchsia-600",
];

export function getAvatarGradient(name = "") {
  if (!name) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

export function getInitials(name = "") {
  if (!name || !name.trim()) return "D";
  const clean = name.trim();
  const parts = clean.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function getAvatarUrl(userOrAvatar, username = "Dev") {
  const avatar = typeof userOrAvatar === "string" ? userOrAvatar : userOrAvatar?.avatar;
  const name = (typeof userOrAvatar === "object" ? userOrAvatar?.username : username) || "Dev";

  if (
    avatar &&
    avatar.trim() &&
    !avatar.includes("pravatar.cc") &&
    !avatar.includes("unsplash.com/photo-1768970338809")
  ) {
    return avatar.trim();
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=200&bold=true`;
}
