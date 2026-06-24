/**
 * CleanProposal AI — Design Token System
 * Source of truth for colors, typography, spacing, and status styling.
 */

export const colors = {
  background: {
    primary: "#F8F7F4",
    surface: "#FFFFFF",
    elevated: "#FFFFFF",
  },
  brand: {
    teal: "#00C5A1",
    tealLight: "#E6FAF6",
    tealDark: "#009980",
  },
  slate: {
    900: "#1A1D23",
    700: "#334155",
    500: "#64748B",
    300: "#CBD5E1",
    100: "#F1F5F9",
  },
  amber: {
    DEFAULT: "#F59E0B",
    light: "#FFFBEB",
    dark: "#D97706",
  },
  emerald: {
    DEFAULT: "#10B981",
    light: "#F0FDF4",
    dark: "#059669",
  },
  rose: {
    DEFAULT: "#F43F5E",
    light: "#FFF1F2",
  },
  blue: {
    DEFAULT: "#3B82F6",
    light: "#EFF6FF",
  },
  purple: {
    DEFAULT: "#7C3AED",
    light: "#F5F3FF",
  },
} as const;

export type StatusKey = "Draft" | "Sent" | "Opened" | "Hot Lead" | "Won" | "Lost";

export interface StatusStyle {
  bg: string;
  text: string;
  dot: string;
}

export const STATUS_CONFIG: Record<StatusKey, StatusStyle> = {
  Draft: { bg: "#F1F1F0", text: "#64748B", dot: "#94A3B8" },
  Sent: { bg: "#EFF6FF", text: "#3B82F6", dot: "#3B82F6" },
  Opened: { bg: "#F5F3FF", text: "#7C3AED", dot: "#7C3AED" },
  "Hot Lead": { bg: "#FFFBEB", text: "#D97706", dot: "#F59E0B" },
  Won: { bg: "#F0FDF4", text: "#059669", dot: "#10B981" },
  Lost: { bg: "#FFF1F2", text: "#F43F5E", dot: "#F43F5E" },
};

/** Map internal proposal status values to STATUS_CONFIG keys */
export function resolveStatusKey(status: string): StatusKey {
  const map: Record<string, StatusKey> = {
    draft: "Draft",
    sent: "Sent",
    not_opened: "Sent",
    opened: "Opened",
    viewed_pricing: "Opened",
    hot_lead: "Hot Lead",
    won: "Won",
    lost: "Lost",
    expired: "Lost",
  };
  return map[status] ?? "Draft";
}

export const typography = {
  display: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    weights: [700, 800] as const,
    letterSpacing: "-0.03em",
  },
  body: {
    fontFamily: "'Inter', sans-serif",
    weights: [400, 500, 600] as const,
  },
  mono: {
    fontFamily: "'JetBrains Mono', monospace",
  },
} as const;

export const spacing = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const;

export const radius = {
  card: "8px",
  input: "6px",
  badge: "999px",
  button: "6px",
} as const;

export const shadow = {
  sm: "0 1px 3px rgba(0,0,0,0.06)",
  md: "0 4px 16px rgba(0,0,0,0.08)",
  lg: "0 8px 32px rgba(0,0,0,0.10)",
} as const;

/** Kanban column left-border accent colors */
export const PIPELINE_COLUMN_COLORS: Record<string, string> = {
  draft: "#94A3B8",
  sent: "#3B82F6",
  opened: "#7C3AED",
  hot_lead: "#F59E0B",
  won: "#10B981",
  lost: "#F43F5E",
};

/** Deterministic avatar color pool (8 colors) */
export const AVATAR_COLORS = [
  { bg: colors.brand.teal, label: "teal" },
  { bg: colors.blue.DEFAULT, label: "blue" },
  { bg: colors.purple.DEFAULT, label: "purple" },
  { bg: colors.amber.DEFAULT, label: "amber" },
  { bg: colors.emerald.DEFAULT, label: "emerald" },
  { bg: colors.rose.DEFAULT, label: "rose" },
  { bg: colors.slate[500], label: "slate" },
  { bg: "#F97316", label: "orange" },
] as const;

export function getAvatarColorIndex(name: string): number {
  const char = name.trim().charAt(0).toUpperCase();
  return char.charCodeAt(0) % AVATAR_COLORS.length;
}

export function getCompanyInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
