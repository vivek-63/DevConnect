import React, { useState, useEffect } from "react";
import { getAvatarGradient, getInitials } from "../../utils/avatar";

const SIZES = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-14 h-14 text-lg",
  "2xl": "w-16 h-16 text-xl",
  "3xl": "w-24 h-24 text-2xl",
  "4xl": "w-32 h-32 text-3xl sm:w-36 sm:h-36",
};

const DOT_SIZES = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-3.5 h-3.5",
  "2xl": "w-4 h-4",
  "3xl": "w-5 h-5",
  "4xl": "w-6 h-6",
};

const Avatar = ({
  src,
  name = "Dev",
  alt,
  size = "md",
  className = "",
  isOnline = false,
  showStatus = false,
  statusPosition = "bottom-right",
}) => {
  const [hasError, setHasError] = useState(false);

  // Clean raw src
  const rawSrc = src && typeof src === "string" ? src.trim() : "";
  const isSuspicious =
    !rawSrc ||
    rawSrc.includes("pravatar.cc") ||
    rawSrc.includes("photo-1768970338809");

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const sizeClass = SIZES[size] || size || SIZES.md;
  const dotSize = DOT_SIZES[size] || "w-3 h-3";
  const initials = getInitials(name);
  const gradient = getAvatarGradient(name);

  const shouldRenderInitials = isSuspicious || hasError;

  return (
    <div className={`relative inline-block flex-shrink-0 select-none ${className}`}>
      {shouldRenderInitials ? (
        <div
          className={`${sizeClass} rounded-full bg-gradient-to-tr ${gradient} text-white font-bold flex items-center justify-center shadow-inner tracking-tight border border-white/20`}
          title={name}
        >
          {initials}
        </div>
      ) : (
        <img
          src={rawSrc}
          alt={alt || name}
          onError={() => setHasError(true)}
          className={`${sizeClass} rounded-full object-cover border border-slate-200/60 shadow-sm`}
        />
      )}

      {showStatus && (
        <span
          className={`absolute ${dotSize} rounded-full border-2 border-white ${
            isOnline ? "bg-emerald-500 ring-1 ring-emerald-200" : "bg-slate-300"
          } ${
            statusPosition === "bottom-right"
              ? "bottom-0 right-0"
              : "top-0 right-0"
          }`}
          title={isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
};

export default Avatar;
