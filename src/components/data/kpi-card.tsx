import * as React from "react";
import { ArrowUpRight, ArrowDownRight, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatMetric, formatDelta, type MetricUnit } from "@/lib/format";
import { Icon } from "@/components/ui/icon";

export interface KpiDelta {
  value: number;
  direction: "up" | "down" | "flat";
  goodWhen: "up" | "down";
}

export interface KpiCardProps {
  label: string;
  value: number | null;
  unit?: MetricUnit;
  delta?: KpiDelta;
  icon?: LucideIcon;
  /** "How is this calculated?" formula, shown as a title tooltip. */
  hint?: string;
  className?: string;
}

/** Premium KPI card — value, trend chip, optional icon and formula hint. */
export function KpiCard({ label, value, unit, delta, icon, hint, className }: KpiCardProps) {
  const good = delta ? delta.direction === delta.goodWhen : false;
  const deltaIcon =
    delta?.direction === "up" ? ArrowUpRight : delta?.direction === "down" ? ArrowDownRight : Minus;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border border-border bg-surface p-5 shadow-e1",
        "transition-shadow duration-200 hover:shadow-e2",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted" title={hint}>
          {label}
        </span>
        {icon ? <Icon icon={icon} size={20} className="text-muted" /> : null}
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="text-[32px] font-semibold leading-none tracking-[-0.01em] text-ink tabular-nums">
          {formatMetric(value, unit)}
        </span>
        {delta && delta.direction !== "flat" ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-sm font-medium tabular-nums",
              good ? "text-success" : "text-danger",
            )}
          >
            <Icon icon={deltaIcon} size={16} />
            {formatDelta(delta.value, unit)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
