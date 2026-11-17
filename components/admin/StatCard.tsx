import type { LucideIcon } from "lucide-react";

export type StatCardTone = "burgundy" | "success" | "danger" | "plum" | "rose";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  caption?: string;
  tone: StatCardTone;
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  caption,
  tone,
}: StatCardProps) {
  return (
    <article className={`ad-stat ad-stat--${tone}`}>
      <div className="ad-stat-head">
        <span className="ad-stat-icon">
          <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
        </span>
      </div>
      <strong className="ad-stat-value">{value}</strong>
      <span className="ad-stat-label">{label}</span>
      {caption && <small className="ad-stat-caption">{caption}</small>}
    </article>
  );
}
