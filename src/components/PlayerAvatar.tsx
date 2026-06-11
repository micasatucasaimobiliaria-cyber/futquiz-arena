type Props = { initials: string; gradient?: string; size?: "sm" | "md" | "lg" | "xl"; emoji?: string };

const sizes = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

export function PlayerAvatar({ initials, gradient = "from-emerald-500 to-teal-700", size = "md", emoji }: Props) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} ${sizes[size]} font-bold text-white shadow-card ring-1 ring-white/10`}
    >
      <span className="drop-shadow">{emoji ?? initials}</span>
    </div>
  );
}
