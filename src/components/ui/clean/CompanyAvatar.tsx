"use client";

import { AVATAR_COLORS, getAvatarColorIndex, getCompanyInitials } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export interface CompanyAvatarProps {
  companyName: string;
  size?: number;
  className?: string;
}

export default function CompanyAvatar({ companyName, size = 32, className }: CompanyAvatarProps) {
  const color = AVATAR_COLORS[getAvatarColorIndex(companyName)];
  const initials = getCompanyInitials(companyName);
  const fontSize = size <= 24 ? 10 : size <= 32 ? 12 : 14;

  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full text-white", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: color.bg,
        fontSize,
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
