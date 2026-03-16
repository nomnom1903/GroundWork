import { useState } from "react";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Separator } from "./components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";

// ─────────────────────────────────────────────
// DESIGN SYSTEM COMPONENTS
// (Reused from component library — kept inline for Figma Make)
// ─────────────────────────────────────────────

type Severity = "p1" | "p2" | "p3" | "p4";
type Tier = 1 | 2 | 3;
type FreshnessState =
  | "fresh"
  | "approaching"
  | "stale"
  | "expired";
type KnowledgeType =
  | "topological"
  | "historical"
  | "operational"
  | "tacit";
type CaptureType = "mcp" | "cli" | "config";
type ProvenanceSource = "cli" | "sprint" | "correction" | "servicenow" | "auto" | "peer" | "slack" | "runbook" | "ticket";

const sourceIcons: Record<ProvenanceSource, { icon: React.ReactNode; label: string }> = {
  cli: { label: "CLI Capture", icon: <span className="text-xs">⌘</span> },
  sprint: { label: "Knowledge Sprint", icon: <span className="text-xs">◆</span> },
  correction: { label: "Correction Signal", icon: <span className="text-xs">✎</span> },
  servicenow: { label: "ServiceNow", icon: <span className="text-xs">🎫</span> },
  auto: { label: "Auto-discovered", icon: <span className="text-xs">⚡</span> },
  peer: { label: "Peer Validation", icon: <span className="text-xs">👥</span> },
  slack: { label: "Slack", icon: <span className="text-xs">💬</span> },
  runbook: { label: "Runbook", icon: <span className="text-xs">📖</span> },
  ticket: { label: "Ticket", icon: <span className="text-xs">🎫</span> },
};

const severityConfig: Record<
  Severity,
  { color: string; label: string; pulse: boolean }
> = {
  p1: {
    color: "bg-severity-p1",
    label: "P1 Critical",
    pulse: true,
  },
  p2: {
    color: "bg-severity-p2",
    label: "P2 High",
    pulse: false,
  },
  p3: {
    color: "bg-severity-p3",
    label: "P3 Medium",
    pulse: false,
  },
  p4: {
    color: "bg-severity-p4",
    label: "P4 Low",
    pulse: false,
  },
};

function SeverityDot({
  level,
  size = "sm",
}: {
  level: Severity;
  size?: "sm" | "md";
}) {
  const config = severityConfig[level];
  const sizeClass = size === "md" ? "w-3 h-3" : "w-2 h-2";
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="relative inline-flex">
            {config.pulse && (
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${config.color} opacity-40 animate-ping`}
              />
            )}
            <span
              className={`relative rounded-full ${sizeClass} ${config.color}`}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="text-xs">{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const tierConfig: Record<
  Tier,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ReactNode;
  }
> = {
  1: {
    label: "Autonomous",
    bg: "bg-tier-1",
    text: "text-tier-1-foreground",
    border: "",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  2: {
    label: "Supervised",
    bg: "bg-transparent",
    text: "text-tier-2",
    border: "border border-tier-2",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  3: {
    label: "Approval Required",
    bg: "bg-transparent",
    text: "text-tier-3",
    border: "border border-tier-3",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="3"
          y="11"
          width="18"
          height="11"
          rx="2"
          ry="2"
        />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
};

function TierBadge({
  tier,
  size = "sm",
}: {
  tier: Tier;
  size?: "sm" | "md" | "lg";
}) {
  const config = tierConfig[tier];
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    md: "text-xs px-2 py-0.5 gap-1.5",
    lg: "text-sm px-3 py-1 gap-2",
  };
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md whitespace-nowrap ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      {config.icon}
      TIER {tier}
      {size !== "sm" && (
        <span className="font-medium opacity-80">
          · {config.label}
        </span>
      )}
    </span>
  );
}

function ConfidenceMeter({
  value,
  showLabel = true,
  size = "md",
}: {
  value: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}) {
  const zone =
    value >= 85 ? "high" : value >= 70 ? "moderate" : "low";
  const colorClass = {
    high: "bg-confidence-high",
    moderate: "bg-confidence-moderate",
    low: "bg-confidence-low",
  }[zone];
  const textClass = {
    high: "text-confidence-high",
    moderate: "text-confidence-moderate",
    low: "text-confidence-low",
  }[zone];
  const barHeight = size === "sm" ? "h-1.5" : "h-2";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className={`flex-1 ${barHeight} bg-muted rounded-full overflow-hidden min-w-12`}
      >
        <div
          className={`${barHeight} ${colorClass} rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <span
          className={`text-xs font-semibold tabular-nums ${textClass} shrink-0`}
        >
          {value}%
        </span>
      )}
    </div>
  );
}

const knowledgeTypeLabels: Record<
  KnowledgeType,
  { short: string; full: string }
> = {
  topological: { short: "T", full: "Topological" },
  historical: { short: "H", full: "Historical" },
  operational: { short: "O", full: "Operational" },
  tacit: { short: "K", full: "Tacit" },
};

function KnowledgeReadinessScore({
  scores,
  size = "md",
}: {
  scores: Record<KnowledgeType, number>;
  size?: "sm" | "md";
}) {
  const types: KnowledgeType[] = [
    "topological",
    "historical",
    "operational",
    "tacit",
  ];
  const barHeight = size === "sm" ? "h-1.5" : "h-2.5";
  const gap = size === "sm" ? "gap-0.5" : "gap-1";
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex ${gap} min-w-16`}>
            {types.map((type) => {
              const val = scores[type];
              const color =
                val >= 80
                  ? "bg-confidence-high"
                  : val >= 50
                    ? "bg-confidence-moderate"
                    : val > 0
                      ? "bg-confidence-low"
                      : "bg-transparent";
              return (
                <div
                  key={type}
                  className={`flex-1 ${barHeight} bg-muted rounded-sm overflow-hidden`}
                >
                  <div
                    className={`h-full ${color} rounded-sm transition-all`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              );
            })}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {types.map((type) => (
              <div
                key={type}
                className="flex justify-between gap-2"
              >
                <span className="text-muted-foreground">
                  {knowledgeTypeLabels[type].full}:
                </span>
                <span className="font-semibold tabular-nums">
                  {scores[type]}%
                </span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// § Provenance Badge — shows source, validations, freshness for knowledge items
function ProvenanceBadge({
  source,
  description,
  validations,
  confidence,
  freshnessState,
  freshnessPercent,
}: {
  source: ProvenanceSource;
  description: string;
  validations: number;
  confidence: number;
  freshnessState: FreshnessState;
  freshnessPercent: number;
}) {
  const sourceConfig: Record<ProvenanceSource, { icon: string; label: string; color: string }> = {
    cli: { icon: "⌘", label: "CLI", color: "text-primary" },
    sprint: { icon: "◆", label: "Sprint", color: "text-accent" },
    correction: { icon: "✎", label: "Correction", color: "text-warning" },
    runbook: { icon: "📖", label: "Runbook", color: "text-info" },
    ticket: { icon: "🎫", label: "Ticket", color: "text-muted-foreground" },
    servicenow: { icon: "🎫", label: "ServiceNow", color: "text-primary" },
    auto: { icon: "⚡", label: "Auto", color: "text-confidence-high" },
    peer: { icon: "👥", label: "Peer", color: "text-accent" },
    slack: { icon: "💬", label: "Slack", color: "text-primary" },
  };

  const freshnessColor = {
    fresh: "text-confidence-high",
    approaching: "text-confidence-moderate",
    stale: "text-confidence-low",
    expired: "text-destructive",
  }[freshnessState];

  const config = sourceConfig[source];

  return (
    <div className="flex items-center gap-2 flex-wrap text-[10px]">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={`inline-flex items-center gap-1 ${config.color} font-medium`}
            >
              <span className="text-xs">{config.icon}</span>
              {description}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Source: {config.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator orientation="vertical" className="h-3" />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-muted-foreground">
              {validations} validation
              {validations !== 1 ? "s" : ""}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              Cross-validated {validations} times
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator orientation="vertical" className="h-3" />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={`font-medium tabular-nums ${freshnessColor}`}
            >
              {freshnessPercent}% fresh
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              Freshness: {freshnessState}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// ─────────────────────────────────────────────
// O-1 SPECIFIC COMPONENTS
// ─────────────────────────────────────────────

// § Navigation Sidebar — PRD §5.1
function NavSidebar({ activeArea, onNavigate }: { activeArea: "operations" | "knowledge" | "insights"; onNavigate?: (area: "operations" | "knowledge" | "insights") => void }) {
  const navItems = [
    {
      id: "operations" as const,
      label: "Operations",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
    {
      id: "knowledge" as const,
      label: "Knowledge",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      id: "insights" as const,
      label: "Insights",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-16 bg-sidebar flex flex-col items-center py-4 gap-1 shrink-0">
      {/* Logo */}
      <div className="w-9 h-9 rounded-lg bg-sidebar-primary/20 flex items-center justify-center mb-6">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>

      {/* Nav Items */}
      {navItems.map((item) => (
        <TooltipProvider key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${activeArea === item.id ? "bg-sidebar-accent text-white" : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"}`} onClick={() => onNavigate?.(item.id)}>
    {item.icon}
  </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      <div className="flex-1" />

      {/* User Avatar */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/30 flex items-center justify-center cursor-pointer">
              <span className="text-[10px] font-semibold text-sidebar-foreground">
                JL
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="text-xs">Jordan Liu · Shift A</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// § Alert Card — PRD §7.1
function AlertCard({
  severity,
  title,
  device,
  timeAgo,
  knowledgeScores,
  aiConfidence,
  tierForecast,
  selected = false,
}: {
  severity: Severity;
  title: string;
  device: string;
  timeAgo: string;
  knowledgeScores: Record<KnowledgeType, number>;
  aiConfidence?: number;
  tierForecast?: Tier;
  selected?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 rounded-lg border cursor-pointer transition-all hover:bg-accent/50 ${
        selected
          ? "bg-accent border-primary/30 shadow-sm"
          : "bg-card border-border"
      }`}
    >
      <SeverityDot level={severity} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground truncate">
            {title}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            · {timeAgo}
          </span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {device}
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <KnowledgeReadinessScore
          scores={knowledgeScores}
          size="sm"
        />
        {aiConfidence !== undefined && (
          <div className="w-20">
            <ConfidenceMeter value={aiConfidence} size="sm" />
          </div>
        )}
        {tierForecast !== undefined && (
          <TierBadge tier={tierForecast} size="sm" />
        )}
      </div>
    </div>
  );
}

// § Compact Alert Row — for flood mode (PRD §7.1 edge case: >50 alerts)
function AlertRowCompact({
  severity,
  title,
  device,
  timeAgo,
  aiConfidence,
  tierForecast,
}: {
  severity: Severity;
  title: string;
  device: string;
  timeAgo: string;
  aiConfidence?: number;
  tierForecast?: Tier;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded border border-transparent hover:bg-accent/30 hover:border-border cursor-pointer transition-all text-xs">
      <SeverityDot level={severity} size="sm" />
      <span className="font-medium text-foreground truncate flex-1">
        {title}
      </span>
      <span className="font-mono text-muted-foreground shrink-0 w-36 truncate">
        {device}
      </span>
      <span className="text-muted-foreground shrink-0 w-10 text-right">
        {timeAgo}
      </span>
      {aiConfidence !== undefined && (
        <span
          className={`shrink-0 w-10 text-right font-semibold tabular-nums ${
            aiConfidence >= 85
              ? "text-confidence-high"
              : aiConfidence >= 70
                ? "text-confidence-moderate"
                : "text-confidence-low"
          }`}
        >
          {aiConfidence}%
        </span>
      )}
      {tierForecast !== undefined && (
        <TierBadge tier={tierForecast} size="sm" />
      )}
    </div>
  );
}

// § Autonomous Resolution Entry — PRD §7.1
function AutoResolutionEntry({
  title,
  device,
  action,
  time,
  policyBasis,
  isExpanded,
  onToggle,
}: {
  title: string;
  device: string;
  action: string;
  time: string;
  policyBasis: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-accent/30 transition-all"
      >
        <span className="relative flex h-2 w-2 mt-1.5 shrink-0">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-tier-1" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground truncate">
              {title}
            </span>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {time}
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {device}
          </span>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 mt-1 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 space-y-2 border-t border-border">
          <div className="pt-2">
            <p className="text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">
                Action:
              </span>{" "}
              {action}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              <span className="font-medium text-foreground">
                Basis:
              </span>{" "}
              {policyBasis}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] px-2"
            >
              View Details
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] px-2 text-muted-foreground"
            >
              Flag for Review
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// § Persistent Status Bar — PRD §7.1
function PersistentStatusBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-card border-t border-border flex items-center justify-between px-4 text-xs text-muted-foreground z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tier-1 opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-tier-1" />
          </span>
          <span>
            AUTONOMOUS{" "}
            <span className="text-foreground font-medium">
              ACTIVE
            </span>{" "}
            — 3 incidents auto-resolved this shift
          </span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-1.5">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>
            <span className="text-foreground font-medium">
              847 items
            </span>{" "}
            · 74% high confidence
          </span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-1.5">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span>
            5 sources ingesting · last capture 4 min ago
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-primary">
            JL
          </span>
        </div>
        <span className="text-foreground font-medium">
          Jordan Liu
        </span>
        <span className="opacity-50">·</span>
        <span>Shift A · 6h remaining</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────

const alerts = [
  {
    severity: "p1" as Severity,
    title: "BGP session flapping — upstream peer down",
    device: "Chicago-Core-01 · 10.0.1.1",
    timeAgo: "3m",
    knowledgeScores: {
      topological: 95,
      historical: 88,
      operational: 92,
      tacit: 76,
    },
    aiConfidence: 84,
    tierForecast: 2 as Tier,
  },
  {
    severity: "p1" as Severity,
    title: "MPLS LDP session timeout — core path",
    device: "Chicago-Core-02 · Lo0",
    timeAgo: "5m",
    knowledgeScores: {
      topological: 90,
      historical: 70,
      operational: 85,
      tacit: 45,
    },
    aiConfidence: 71,
    tierForecast: 3 as Tier,
  },
  {
    severity: "p2" as Severity,
    title: "OSPF adjacency lost on backup link",
    device: "NYC-Edge-03 · ge-0/0/2",
    timeAgo: "12m",
    knowledgeScores: {
      topological: 80,
      historical: 60,
      operational: 75,
      tacit: 0,
    },
    aiConfidence: 67,
    tierForecast: 3 as Tier,
  },
  {
    severity: "p2" as Severity,
    title: "Interface errors exceeding threshold",
    device: "NYC-Dist-07 · Te1/1/1",
    timeAgo: "18m",
    knowledgeScores: {
      topological: 85,
      historical: 55,
      operational: 90,
      tacit: 20,
    },
    aiConfidence: 58,
    tierForecast: 3 as Tier,
  },
  {
    severity: "p3" as Severity,
    title: "High CPU utilization on access switch",
    device: "SFO-Access-14 · Stack 2/1",
    timeAgo: "45m",
    knowledgeScores: {
      topological: 90,
      historical: 45,
      operational: 50,
      tacit: 30,
    },
    aiConfidence: 52,
    tierForecast: 3 as Tier,
  },
  {
    severity: "p3" as Severity,
    title: "DHCP pool exhaustion warning",
    device: "LAX-Core-01 · VLAN 210",
    timeAgo: "1h",
    knowledgeScores: {
      topological: 75,
      historical: 80,
      operational: 60,
      tacit: 55,
    },
    aiConfidence: 78,
    tierForecast: 2 as Tier,
  },
  {
    severity: "p4" as Severity,
    title: "Interface utilization above threshold",
    device: "LAX-Dist-02 · Gi1/0/24",
    timeAgo: "2h",
    knowledgeScores: {
      topological: 95,
      historical: 90,
      operational: 85,
      tacit: 80,
    },
    aiConfidence: 96,
    tierForecast: 1 as Tier,
  },
  {
    severity: "p4" as Severity,
    title: "NTP sync drift detected",
    device: "DEN-Access-22 · mgmt0",
    timeAgo: "3h",
    knowledgeScores: {
      topological: 88,
      historical: 92,
      operational: 95,
      tacit: 90,
    },
    aiConfidence: 94,
    tierForecast: 1 as Tier,
  },
];

const autoResolutions = [
  {
    title: "BGP timer reset",
    device: "ATL-Edge-01",
    action:
      "Cleared BGP session with peer 10.2.1.1, session reconverged in 12s",
    time: "14:22",
    policyBasis:
      "EP-047 · BGP Timer Reset — 14 prior confirmations",
  },
  {
    title: "NTP resync",
    device: "DEN-Access-19",
    action:
      "Restarted NTP daemon and forced clock sync to primary stratum-1 source",
    time: "13:45",
    policyBasis:
      "EP-112 · NTP Drift Correction — 8 prior confirmations",
  },
  {
    title: "DHCP pool extension",
    device: "SFO-Core-02",
    action: "Extended DHCP scope by 50 addresses on VLAN 150",
    time: "12:10",
    policyBasis:
      "EP-089 · DHCP Pool Auto-Extend — 6 prior confirmations",
  },
];

// ─────────────────────────────────────────────
// O-1 SCREEN — ALERT COMMAND CENTER
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// O-2 MOCK DATA
// ─────────────────────────────────────────────

const o2Alert = alerts[0]; // BGP session flapping — the selected alert

const topologicalData = {
  deviceRole: "Core Router",
  upstreamPath:
    "Chicago-Core-01 → Chicago-Agg-01 → WAN-Edge-01 → MPLS PE",
  downstreamDevices: 47,
  downstreamPrefixes: 847,
  affectedServices: [
    "VoIP Backbone",
    "DC Interconnect",
    "Guest WiFi Auth",
  ],
  criticalLinks: [
    "Te1/1/1 → Chicago-Agg-01 (10Gbps, 62% util)",
    "Te1/1/2 → Chicago-Agg-02 (10Gbps, backup, idle)",
  ],
};

const historicalData = [
  {
    date: "Feb 18, 2026",
    type: "BGP flap — same peer",
    resolution: "Cleared BGP session, reconverged 15s",
    time: "4m",
    outcome: "Resolved",
    source: "INC0031204",
  },
  {
    date: "Jan 03, 2026",
    type: "BGP flap — same peer",
    resolution: "Timer adjustment after IOS upgrade",
    time: "12m",
    outcome: "Resolved",
    source: "INC0028917",
  },
  {
    date: "Nov 12, 2025",
    type: "BGP flap — different peer",
    resolution: "ISP-side issue, contacted NOC",
    time: "45m",
    outcome: "Escalated",
    source: "INC0025441",
  },
];

const historicalInsight =
  "This device has had BGP flapping 3 times in the last 6 months — twice after IOS upgrades, once ISP-side.";

const operationalData = {
  changeWindows: [
    {
      name: "IOS Upgrade — Chicago Campus",
      start: "Mar 6 22:00",
      end: "Mar 7 04:00",
      status: "Completed",
    },
  ],
  slaState: "Within SLA — 99.95% target, currently 99.97%",
  locks: [] as {
    name: string;
    reason: string;
    setBy: string;
  }[],
  unscheduledEvent: true,
  unscheduledNote:
    "Unscheduled event detected — no matching change window for current issue. Operator documentation will be requested post-resolution.",
};

const tacitData = [
  {
    fact: "Chicago-Core-01 BGP timers are non-default (hold: 30s, keepalive: 10s). After IOS upgrades, timers sometimes revert to defaults causing peer timeout.",
    confidence: 89,
    source: "cli" as const,
    sourceDesc: "Sarah Chen · CLI session",
    validations: 6,
    freshness: "fresh" as FreshnessState,
    freshnessPercent: 88,
  },
  {
    fact: "Peer 10.0.1.1 is the primary upstream to AT&T MPLS cloud. If this peer flaps, do NOT clear the backup peer (10.0.1.2) simultaneously — causes full outage.",
    confidence: 95,
    source: "sprint" as const,
    sourceDesc: "Knowledge sprint — Sarah Chen",
    validations: 4,
    freshness: "fresh" as FreshnessState,
    freshnessPercent: 92,
  },
  {
    fact: "Weather-related issues at Chicago datacenter have historically correlated with power micro-fluctuations affecting this device's line cards.",
    confidence: 62,
    source: "correction" as const,
    sourceDesc: "Jordan Liu corrected AI",
    validations: 1,
    freshness: "approaching" as FreshnessState,
    freshnessPercent: 45,
  },
];

// ─────────────────────────────────────────────
// O-2 COMPONENTS
// ─────────────────────────────────────────────

// § Knowledge Panel — wrapper for each of the 4 panels
function KnowledgePanel({
  title,
  icon,
  coverage,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  coverage: number;
  children: React.ReactNode;
}) {
  const coverageColor =
    coverage >= 80
      ? "bg-confidence-high"
      : coverage >= 50
        ? "bg-confidence-moderate"
        : "bg-confidence-low";

  return (
    <Card className="flex flex-col">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
            {icon}
            {title}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${coverageColor} rounded-full`}
                style={{ width: `${coverage}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {coverage}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 flex-1 text-xs">
        {children}
      </CardContent>
    </Card>
  );
}

// § O-2 Screen
function AlertContextPanel({
  onBack,
  onBeginInvestigation,
}: {
  onBack: () => void;
  onBeginInvestigation: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Alert Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border bg-card">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="text-xs text-muted-foreground">
            Back to Command Center
          </span>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <SeverityDot level={o2Alert.severity} size="md" />
            <div>
              <h1 className="text-base font-semibold text-foreground">
                {o2Alert.title}
              </h1>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                {o2Alert.device}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <TierBadge
                  tier={o2Alert.tierForecast}
                  size="md"
                />
                <span className="text-xs text-muted-foreground">
                  · {o2Alert.timeAgo} ago
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assessment */}
        <div className="mt-3 bg-accent/50 border border-primary/10 rounded-lg px-3 py-2">
          <p className="text-xs text-accent-foreground">
            <span className="font-semibold">
              AI assessment:
            </span>{" "}
            BGP session flapping on Chicago-Core-01 — likely
            cause: NX-OS upgrade 18h ago reverted non-default
            BGP timers.{" "}
            <span className="font-semibold">
              Moderate confidence (
              <span className="text-confidence-moderate">
                {o2Alert.aiConfidence}%
              </span>
              ).
            </span>
          </p>
        </div>
      </div>

      {/* Content: Two columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left — Four Knowledge Panels */}
        <div className="flex-1 overflow-y-auto p-4 pb-14">
          <div className="grid grid-cols-2 gap-3">
            {/* Topological Panel */}
            <KnowledgePanel
              title="Topological"
              coverage={o2Alert.knowledgeScores.topological}
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              }
            >
              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-semibold mb-1">
                    Device Role
                  </p>
                  <p className="text-foreground">
                    {topologicalData.deviceRole}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-semibold mb-1">
                    Upstream Path
                  </p>
                  <p className="font-mono text-[11px] text-foreground/80">
                    {topologicalData.upstreamPath}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-semibold mb-1">
                    Downstream Impact
                  </p>
                  <p className="text-foreground">
                    <span className="font-semibold">
                      {topologicalData.downstreamDevices}
                    </span>{" "}
                    devices ·{" "}
                    <span className="font-semibold">
                      {topologicalData.downstreamPrefixes}
                    </span>{" "}
                    prefixes
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-semibold mb-1">
                    Affected Services
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {topologicalData.affectedServices.map(
                      (s) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {s}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-semibold mb-1">
                    Critical Links
                  </p>
                  {topologicalData.criticalLinks.map((link) => (
                    <p
                      key={link}
                      className="font-mono text-[10px] text-foreground/70"
                    >
                      {link}
                    </p>
                  ))}
                </div>
                <button className="text-[11px] text-primary hover:underline">
                  View full topology →
                </button>
              </div>
            </KnowledgePanel>

            {/* Historical Panel */}
            <KnowledgePanel
              title="Historical"
              coverage={o2Alert.knowledgeScores.historical}
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
            >
              <div className="space-y-3">
                {/* Insight */}
                <div className="bg-warning/10 border border-warning/20 rounded-md px-2.5 py-2">
                  <p className="text-[11px] text-foreground font-medium flex items-start gap-1.5">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-warning shrink-0 mt-0.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line
                        x1="12"
                        y1="16"
                        x2="12.01"
                        y2="16"
                      />
                    </svg>
                    {historicalInsight}
                  </p>
                </div>
                {/* Past incidents */}
                <div className="space-y-2">
                  {historicalData.map((inc, i) => (
                    <div
                      key={i}
                      className="border border-border rounded-md px-2.5 py-2 hover:bg-accent/30 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-foreground">
                          {inc.type}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {inc.date}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {inc.resolution}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            inc.outcome === "Resolved"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-[9px] px-1 py-0"
                        >
                          {inc.outcome}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          · {inc.time} · {inc.source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </KnowledgePanel>

            {/* Operational Panel */}
            <KnowledgePanel
              title="Operational"
              coverage={o2Alert.knowledgeScores.operational}
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                    ry="2"
                  />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              }
            >
              <div className="space-y-3">
                {/* Change Windows */}
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-semibold mb-1">
                    Change Windows
                  </p>
                  {operationalData.changeWindows.map(
                    (cw, i) => (
                      <div
                        key={i}
                        className="border border-border rounded-md px-2.5 py-2"
                      >
                        <p className="text-[11px] font-medium text-foreground">
                          {cw.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {cw.start} → {cw.end}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1 py-0 mt-1"
                        >
                          {cw.status}
                        </Badge>
                      </div>
                    ),
                  )}
                </div>
                {/* SLA */}
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-semibold mb-1">
                    SLA State
                  </p>
                  <p className="text-[11px] text-foreground">
                    {operationalData.slaState}
                  </p>
                </div>
                {/* Locks */}
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase font-semibold mb-1">
                    Institutional Locks
                  </p>
                  {operationalData.locks.length === 0 ? (
                    <p className="text-[11px] text-confidence-high flex items-center gap-1">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      No active locks for this device
                    </p>
                  ) : null}
                </div>
                {/* Unscheduled Event */}
                {operationalData.unscheduledEvent && (
                  <div className="bg-warning/10 border border-warning/20 rounded-md px-2.5 py-2">
                    <p className="text-[11px] text-foreground font-medium flex items-start gap-1.5">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-warning shrink-0
  mt-0.5"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line
                          x1="12"
                          y1="17"
                          x2="12.01"
                          y2="17"
                        />
                      </svg>
                      {operationalData.unscheduledNote}
                    </p>
                  </div>
                )}
              </div>
            </KnowledgePanel>

            {/* Tacit Knowledge Panel */}
            <KnowledgePanel
              title="Tacit Knowledge"
              coverage={o2Alert.knowledgeScores.tacit}
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              }
            >
              <div className="space-y-2.5">
                {tacitData.map((item, i) => {
                  const borderColor =
                    item.confidence >= 85
                      ? "border-l-confidence-high"
                      : item.confidence >= 70
                        ? "border-l-confidence-moderate"
                        : "border-l-confidence-low";
                  return (
                    <div
                      key={i}
                      className={`border border-border ${borderColor} border-l-2 rounded-md px-2.5 py-2 hover:bg-accent/30 cursor-pointer transition-colors`}
                    >
                      <p className="text-[11px] text-foreground leading-relaxed">
                        {item.fact}
                      </p>
                      <div className="mt-1.5">
                        <ProvenanceBadge
                          source={item.source}
                          description={item.sourceDesc}
                          validations={item.validations}
                          confidence={item.confidence}
                          freshnessState={item.freshness}
                          freshnessPercent={
                            item.freshnessPercent
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </KnowledgePanel>
          </div>
        </div>

        {/* Right — Investigation Readiness */}
        <div className="w-72 border-l border-border bg-background/50 p-4 flex flex-col gap-4 shrink-0 overflow-y-auto pb-14">
          {/* Readiness Summary */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-semibold">
                Investigation Readiness
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-3">
              <div className="bg-accent/50 rounded-md px-3 py-2">
                <p className="text-[11px] text-accent-foreground leading-relaxed">
                  <span className="font-semibold">
                    Strong context:
                  </span>{" "}
                  3 of 4 knowledge types have high-confidence
                  information. Tacit knowledge is moderate —
                  capture mode will supplement during
                  investigation.
                </p>
              </div>

              {/* Knowledge Readiness Breakdown */}
              <div className="space-y-1.5">
                {(
                  [
                    "topological",
                    "historical",
                    "operational",
                    "tacit",
                  ] as KnowledgeType[]
                ).map((type) => (
                  <div
                    key={type}
                    className="flex items-center gap-2"
                  >
                    <span className="text-[10px] text-muted-foreground w-20">
                      {knowledgeTypeLabels[type].full}
                    </span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          o2Alert.knowledgeScores[type] >= 80
                            ? "bg-confidence-high"
                            : o2Alert.knowledgeScores[type] >=
                                50
                              ? "bg-confidence-moderate"
                              : "bg-confidence-low"
                        }`}
                        style={{
                          width: `${o2Alert.knowledgeScores[type]}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold tabular-nums text-foreground w-8 text-right">
                      {o2Alert.knowledgeScores[type]}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tier Forecast */}
          <Card>
            <CardContent className="px-4 py-3 space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                Tier Forecast
              </p>
              <TierBadge
                tier={o2Alert.tierForecast}
                size="md"
              />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Based on current knowledge, this incident will
                likely require{" "}
                <span className="font-medium text-foreground">
                  Tier 2 supervised execution
                </span>
                . One more confirmed BGP timer resolution on
                this device class would unlock Tier 1.
              </p>
            </CardContent>
          </Card>

          {/* Capture Mode */}
          <Card>
            <CardContent className="px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Capture Mode
                </p>
                <Badge className="bg-tier-1/10 text-tier-1 border-tier-1/20 text-[10px] px-1.5 py-0">
                  Active
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                CLI commands, MCP tool calls, config diffs, and
                resolution actions will be observed and stored.
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="mt-auto space-y-2">
            <Button
              className="w-full h-10"
              onClick={onBeginInvestigation}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Begin Investigation
            </Button>
            <Button
              variant="outline"
              className="w-full h-8 text-xs"
            >
              Assign to Colleague
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// O-3 MOCK DATA
// ─────────────────────────────────────────────

const investigationThread = [
  {
    type: "mcp-group" as const,
    time: "14:30:12",
    calls: [
      {
        server: "Catalyst Center",
        query: "Get device topology for Chicago-Core-01",
        result:
          "47 downstream devices, 2 upstream aggregation links",
      },
      {
        server: "ThousandEyes",
        query: "Path trace to peer 10.0.1.1 last 2h",
        result:
          "Path stable until 14:27 — 3 consecutive timeouts detected",
      },
      {
        server: "Splunk",
        query: "BGP events for Chicago-Core-01 last 24h",
        result:
          "12 BGP state changes in last 30min, peer 10.0.1.1 only",
      },
      {
        server: "Catalyst Center",
        query: "Config change history Chicago-Core-01 last 48h",
        result:
          "IOS upgrade applied 18h ago — version 17.9.4 → 17.11.1",
      },
    ],
    duration: "2.3s",
  },
  {
    type: "hypothesis" as const,
    time: "14:30:15",
    leading:
      "BGP hold timers reverted to defaults after IOS upgrade 18h ago, causing peer timeout with AT&T MPLS PE.",
    confidence: 78,
    previousConfidence: null as number | null,
    evidence: [
      {
        text: "IOS upgrade to 17.11.1 applied 18h ago",
        source: "Catalyst Center config diff",
      },
      {
        text: "BGP timers on this device are non-default (hold: 30s)",
        source: "Tacit knowledge — Sarah Chen",
      },
      {
        text: "2 prior BGP flaps on this device were caused by timer reversion after upgrades",
        source: "Historical — INC0028917, INC0031204",
      },
    ],
    conflicts: [
      {
        text: "ThousandEyes shows path was stable until 14:27 — 18h after upgrade. If timers reverted, flap should have started sooner.",
        source: "ThousandEyes path trace",
      },
    ],
    alternatives: [
      {
        hypothesis: "ISP-side issue on AT&T MPLS PE",
        confidence: 22,
      },
    ],
  },
  {
    type: "operator-query" as const,
    time: "14:31:40",
    query: "Check current BGP timer values on this device",
  },
  {
    type: "mcp-single" as const,
    time: "14:31:42",
    server: "Device CLI",
    query: "show ip bgp neighbors 10.0.1.1 | include hold time",
    result:
      "BGP hold time: 180s (default), keepalive: 60s (default)\nConfigured hold time: 180, keepalive: 60\nLast reset: 00:03:22, due to BGP Notification sent",
    isExpanded: true,
  },
  {
    type: "evidence-delta" as const,
    time: "14:31:44",
    text: "Confirmed: BGP timers are at defaults (180s/60s) instead of custom values (30s/10s). Timer reversion after IOS upgrade confirmed.",
    confidenceBefore: 78,
    confidenceAfter: 91,
  },
  {
    type: "hypothesis" as const,
    time: "14:31:45",
    leading:
      "BGP hold timers reverted to defaults (180s/60s) after IOS 17.11.1 upgrade. Non-default timers (30s/10s) required for AT&T MPLS PE compatibility.",
    confidence: 91,
    previousConfidence: 78,
    evidence: [
      {
        text: "IOS upgrade to 17.11.1 applied 18h ago",
        source: "Catalyst Center config diff",
      },
      {
        text: "Current BGP timers confirmed at defaults: hold 180s, keepalive 60s",
        source: "Device CLI — live query",
      },
      {
        text: "Known non-default timers: hold 30s, keepalive 10s",
        source: "Tacit knowledge — Sarah Chen",
      },
      {
        text: "2 prior incidents with same root cause on this device",
        source: "Historical — INC0028917, INC0031204",
      },
    ],
    conflicts: [],
    alternatives: [],
  },
];

const captureItems = [
  {
    time: "14:30",
    type: "mcp" as CaptureType,
    content: "Queried Catalyst Center topology",
    impact: { value: "+5% topology", positive: true },
  },
  {
    time: "14:30",
    type: "mcp" as CaptureType,
    content: "Queried ThousandEyes path trace",
    impact: { value: "+3% path", positive: true },
  },
  {
    time: "14:30",
    type: "mcp" as CaptureType,
    content: "Queried Splunk BGP events",
    impact: { value: "+4% pattern", positive: true },
  },
  {
    time: "14:30",
    type: "mcp" as CaptureType,
    content: "Queried config change history",
    impact: { value: "+8% root cause", positive: true },
  },
  {
    time: "14:31",
    type: "cli" as CaptureType,
    content: "show ip bgp neighbors 10.0.1.1",
    impact: { value: "+13% confidence", positive: true },
  },
  {
    time: "14:31",
    type: "config" as CaptureType,
    content: "Timer values confirmed as defaults",
  },
];

const suggestedQueries = [
  "Verify BGP timer config in running vs. startup config",
  "Check if other peers on this device have correct timers",
  "Pull NWS weather data for Chicago",
];

// ─────────────────────────────────────────────
// O-3 COMPONENTS
// ─────────────────────────────────────────────

// § MCP Tool Call Group — PRD §7.3
function MCPGroupCard({
  calls,
  duration,
  time,
}: {
  calls: { server: string; query: string; result: string }[];
  duration: string;
  time: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-muted/30 border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-xs">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span className="text-foreground font-medium">
            Queried {calls.length} sources simultaneously
          </span>
          <span className="text-muted-foreground">
            → results in {duration}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {time}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          {calls.map((call, i) => (
            <div key={i} className="px-3 py-2">
              <div className="flex items-center gap-1.5 text-[10px]">
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0 font-mono"
                >
                  {call.server}
                </Badge>
                <span className="text-muted-foreground">
                  {call.query}
                </span>
              </div>
              <p className="text-[11px] text-foreground mt-1 pl-1 border-l-2 border-primary/20 ml-0.5">
                {call.result}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// § Single MCP Call — for operator-initiated queries
function MCPSingleCard({
  server,
  query,
  result,
  time,
}: {
  server: string;
  query: string;
  result: string;
  time: string;
}) {
  return (
    <div className="bg-muted/30 border border-border rounded-lg px-3 py-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 text-[10px]">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <Badge
            variant="outline"
            className="text-[9px] px-1 py-0 font-mono"
          >
            {server}
          </Badge>
          <span className="text-muted-foreground">{query}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {time}
        </span>
      </div>
      <pre className="text-[11px] text-foreground font-mono bg-foreground/5 rounded px-2 py-1.5 whitespace-pre-wrap leading-relaxed">
        {result}
      </pre>
    </div>
  );
}

// § AI Hypothesis Card — PRD §7.3 "The most important component in O-3"
function HypothesisCard({
  leading,
  confidence,
  previousConfidence,
  evidence,
  conflicts,
  alternatives,
  time,
}: {
  leading: string;
  confidence: number;
  previousConfidence: number | null;
  evidence: { text: string; source: string }[];
  conflicts: { text: string; source: string }[];
  alternatives: { hypothesis: string; confidence: number }[];
  time: string;
}) {
  const [showWhy, setShowWhy] = useState(false);
  const [showAlts, setShowAlts] = useState(false);
  const zone =
    confidence >= 85
      ? "high"
      : confidence >= 70
        ? "moderate"
        : "low";
  const borderColor = {
    high: "border-l-confidence-high",
    moderate: "border-l-confidence-moderate",
    low: "border-l-confidence-low",
  }[zone];

  return (
    <div
      className={`border border-border ${borderColor} border-l-3 rounded-lg bg-card overflow-hidden`}
    >
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="text-xs font-semibold text-foreground">
              Leading Hypothesis
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {time}
          </span>
        </div>

        {/* Hypothesis statement */}
        <p className="text-sm text-foreground leading-relaxed mb-3">
          {leading}
        </p>

        {/* Confidence */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-48">
            <ConfidenceMeter value={confidence} />
          </div>
          {previousConfidence !== null && (
            <span
              className={`text-[11px] font-medium ${confidence > previousConfidence ? "text-confidence-high" : "text-confidence-moderate"}`}
            >
              {previousConfidence}% → {confidence}%
            </span>
          )}
        </div>

        {/* Supporting Evidence */}
        <div className="mb-2">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1.5">
            Supporting Evidence
          </p>
          <div className="space-y-1">
            {evidence.map((e, i) => (
              <div
                key={i}
                className="flex items-start gap-1.5 text-[11px]"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-confidence-high shrink-0
  mt-0.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-foreground">
                  {e.text}
                </span>
                <span className="text-muted-foreground shrink-0">
                  — {e.source}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Conflicting Evidence — shown transparently per PRD */}
        {conflicts.length > 0 && (
          <div className="mb-2">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1.5">
              Conflicting Evidence
            </p>
            <div className="space-y-1">
              {conflicts.map((c, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 text-[11px]"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-confidence-moderate shrink-0
   mt-0.5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  <span className="text-foreground">
                    {c.text}
                  </span>
                  <span className="text-muted-foreground shrink-0">
                    — {c.source}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-[10px] px-2 gap-1 text-confidence-high border-confidence-high/30 hover:bg-confidence-high/10"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-[10px] px-2 gap-1"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Reject
          </Button>
          <button
            onClick={() => setShowWhy(!showWhy)}
            className="text-[10px] text-primary hover:underline ml-auto"
          >
            {showWhy ? "Hide reasoning" : "Why?"}
          </button>
          {alternatives.length > 0 && (
            <button
              onClick={() => setShowAlts(!showAlts)}
              className="text-[10px] text-muted-foreground hover:underline"
            >
              {showAlts
                ? "Hide alternatives"
                : `${alternatives.length} alternative${alternatives.length > 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      </div>

      {/* Expanded "Why" reasoning chain */}
      {showWhy && (
        <div className="border-t border-border bg-muted/20 px-4 py-3">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-2">
            Reasoning Chain
          </p>
          <ol className="space-y-1.5 text-[11px] text-foreground/80 list-decimal list-inside">
            <li>
              Alert received: BGP session flapping on
              Chicago-Core-01, peer 10.0.1.1
            </li>
            <li>
              Topology query confirmed device role as core
              router with 47 downstream devices
            </li>
            <li>
              Config change history shows IOS upgrade 18h ago
              (17.9.4 → 17.11.1)
            </li>
            <li>
              Tacit knowledge indicates non-default BGP timers
              (hold: 30s, keepalive: 10s) are required
            </li>
            <li>
              Live CLI query confirmed timers at defaults (hold:
              180s, keepalive: 60s)
            </li>
            <li>
              Historical pattern: 2 of 3 prior BGP flaps on this
              device caused by timer reversion after IOS upgrade
            </li>
            <li>
              Conclusion: IOS upgrade reset BGP timers to
              defaults, causing incompatibility with AT&T MPLS
              PE
            </li>
          </ol>
        </div>
      )}

      {/* Alternative hypotheses */}
      {showAlts && alternatives.length > 0 && (
        <div className="border-t border-border bg-muted/20 px-4 py-3">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-2">
            Alternative Hypotheses
          </p>
          {alternatives.map((alt, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-[11px] py-1"
            >
              <span className="text-foreground/70">
                {alt.hypothesis}
              </span>
              <span className="text-confidence-low font-semibold tabular-nums">
                {alt.confidence}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// § Evidence Delta — PRD §7.3
function EvidenceDelta({
  text,
  before,
  after,
  time,
}: {
  text: string;
  before: number;
  after: number;
  time: string;
}) {
  return (
    <div className="flex items-start gap-2 bg-confidence-high/5 border border-confidence-high/15 rounded-lg px-3 py-2">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-confidence-high shrink-0 mt-0.5"
      >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
      <div className="flex-1">
        <p className="text-[11px] text-foreground">{text}</p>
        <p className="text-[10px] text-confidence-high font-semibold mt-0.5">
          Hypothesis confidence: {before}% → {after}%
        </p>
      </div>
      <span className="text-[10px] text-muted-foreground shrink-0">
        {time}
      </span>
    </div>
  );
}

// § Operator Query Bubble
function OperatorBubble({
  query,
  time,
}: {
  query: string;
  time: string;
}) {
  return (
    <div className="flex justify-end">
      <div className="bg-primary/10 border border-primary/15 rounded-lg px-3 py-2 max-w-md">
        <div className="flex items-center justify-between gap-4 mb-0.5">
          <span className="text-[10px] font-medium text-primary">
            You
          </span>
          <span className="text-[10px] text-muted-foreground">
            {time}
          </span>
        </div>
        <p className="text-xs text-foreground">{query}</p>
      </div>
    </div>
  );
}

// § Correction Opportunity Indicator — PRD §7.3
function CorrectionOpportunity() {
  return (
    <div className="flex items-center gap-2 bg-confidence-moderate/5 border border-confidence-moderate/15 rounded-lg px-3 py-2">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-confidence-moderate shrink-0"
      >
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
      <p className="text-[11px] text-foreground/70">
        Your approach here will be captured — if you proceed
        differently from the recommendation, the difference
        becomes a{" "}
        <span className="font-medium text-foreground">
          correction signal
        </span>
        .
      </p>
    </div>
  );
}

// § Context Sidebar (collapsible summary of O-2) — PRD §7.3
function ContextSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  if (collapsed) {
    return (
      <div className="w-10 border-r border-border bg-card flex flex-col items-center py-3 shrink-0">
        <button
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <div className="flex flex-col items-center gap-3 mt-4">
          <SeverityDot level="p1" size="md" />
          <KnowledgeReadinessScore
            scores={o2Alert.knowledgeScores}
            size="sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col shrink-0 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Context
        </span>
        <button
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        {/* Alert summary */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SeverityDot level="p1" size="md" />
            <span className="font-medium text-foreground text-[11px]">
              {o2Alert.title}
            </span>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground">
            {o2Alert.device}
          </p>
          <TierBadge tier={o2Alert.tierForecast} size="sm" />
        </div>

        <Separator />

        {/* Knowledge readiness */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1.5">
            Knowledge Readiness
          </p>
          {(
            [
              "topological",
              "historical",
              "operational",
              "tacit",
            ] as KnowledgeType[]
          ).map((type) => (
            <div
              key={type}
              className="flex items-center gap-1.5 mb-1"
            >
              <span className="text-[10px] text-muted-foreground w-16">
                {knowledgeTypeLabels[type].short}
              </span>
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${o2Alert.knowledgeScores[type] >= 80 ? "bg-confidence-high" : o2Alert.knowledgeScores[type] >= 50 ? "bg-confidence-moderate" : "bg-confidence-low"}`}
                  style={{
                    width: `${o2Alert.knowledgeScores[type]}%`,
                  }}
                />
              </div>
              <span className="text-[10px] tabular-nums text-muted-foreground w-6 text-right">
                {o2Alert.knowledgeScores[type]}%
              </span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Key tacit items */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1.5">
            Key Tacit Knowledge
          </p>
          {tacitData.slice(0, 2).map((item, i) => (
            <div
              key={i}
              className={`border-l-2 ${item.confidence >= 85 ? "border-l-confidence-high" : "border-l-confidence-moderate"} pl-2 mb-2`}
            >
              <p className="text-[10px] text-foreground/80 leading-relaxed">
                {item.fact.slice(0, 100)}...
              </p>
              <span className="text-[9px] text-muted-foreground">
                {item.confidence}% confidence
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// § Capture Entry — Individual capture item
function CaptureEntry({
  time,
  type,
  content,
  impact,
}: {
  time: string;
  type: CaptureType;
  content: string;
  impact?: { value: string; positive: boolean };
}) {
  const typeConfig = {
    mcp: { icon: "🔌", color: "text-primary", label: "MCP" },
    cli: { icon: "⌘", color: "text-accent", label: "CLI" },
    config: { icon: "⚙️", color: "text-muted-foreground", label: "Config" },
  };

  const config = typeConfig[type];

  return (
    <div className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-muted/30 transition-colors text-[10px]">
      <span className="text-[9px] text-muted-foreground font-mono mt-0.5 shrink-0">
        {time}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={config.color}>{config.icon}</span>
          <span className="text-foreground font-medium truncate">
            {content}
          </span>
        </div>
        {impact && (
          <div
            className={`text-[9px] ${impact.positive ? "text-success" : "text-warning"}`}
          >
            {impact.value}
          </div>
        )}
      </div>
    </div>
  );
}

// § Capture Feed Panel (collapsible) — PRD §7.3
function CaptureFeedPanel({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  if (collapsed) {
    return (
      <div className="w-10 border-l border-border bg-card flex flex-col items-center py-3 shrink-0">
        <button
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="mt-3 flex items-center gap-1">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <Badge
            variant="secondary"
            className="text-[9px] px-1 py-0"
          >
            {captureItems.length}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-l border-border bg-card flex flex-col shrink-0">
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <div className="flex items-center gap-1.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Live Capture
          </span>
          <Badge
            variant="secondary"
            className="text-[9px] px-1 py-0"
          >
            {captureItems.length}
          </Badge>
        </div>
        <button
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-0.5">
          {captureItems.map((item, i) => (
            <CaptureEntry key={i} {...item} />
          ))}
        </div>
      </div>
      <div className="border-t border-border px-3 py-2">
        <p className="text-[9px] text-muted-foreground">
          847 tickets mined · 156 CLI sessions · 41 corrections
        </p>
      </div>
    </div>
  );
}

// § O-3 Screen
function ActiveInvestigation({
  onBack,
  onExecutionReady,
}: {
  onBack: () => void;
  onExecutionReady: () => void;
}) {
  const [contextCollapsed, setContextCollapsed] =
    useState(false);
  const [captureCollapsed, setCaptureCollapsed] =
    useState(false);

  return (
    <div className="flex-1 flex min-w-0 overflow-hidden">
      {/* Left — Context Sidebar */}
      <ContextSidebar
        collapsed={contextCollapsed}
        onToggle={() => setContextCollapsed(!contextCollapsed)}
      />

      {/* Center — Investigation Thread */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-5 py-3 border-b border-border bg-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div>
              <h1 className="text-sm font-semibold text-foreground">
                Active Investigation
              </h1>
              <p className="text-[10px] text-muted-foreground">
                {o2Alert.title} · {o2Alert.device}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] px-2 gap-1"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
              Escalate
            </Button>
            <Button
              size="sm"
              className="h-7 text-[11px] px-3"
              onClick={onExecutionReady}
            >
              Proceed to Execution →
            </Button>
          </div>
        </div>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto px-5 py-4 pb-14 space-y-3">
          {investigationThread.map((item, i) => {
            switch (item.type) {
              case "mcp-group":
                return (
                  <MCPGroupCard
                    key={i}
                    calls={item.calls}
                    duration={item.duration}
                    time={item.time}
                  />
                );
              case "mcp-single":
                return (
                  <MCPSingleCard
                    key={i}
                    server={item.server}
                    query={item.query}
                    result={item.result}
                    time={item.time}
                  />
                );
              case "hypothesis":
                return (
                  <HypothesisCard
                    key={i}
                    leading={item.leading}
                    confidence={item.confidence}
                    previousConfidence={item.previousConfidence}
                    evidence={item.evidence}
                    conflicts={item.conflicts}
                    alternatives={item.alternatives}
                    time={item.time}
                  />
                );
              case "operator-query":
                return (
                  <OperatorBubble
                    key={i}
                    query={item.query}
                    time={item.time}
                  />
                );
              case "evidence-delta":
                return (
                  <EvidenceDelta
                    key={i}
                    text={item.text}
                    before={item.confidenceBefore}
                    after={item.confidenceAfter}
                    time={item.time}
                  />
                );
              default:
                return null;
            }
          })}

          {/* Correction opportunity — shown because confidence was <85% earlier */}
          <CorrectionOpportunity />
        </div>

        {/* Query Input */}
        <div className="border-t border-border bg-card px-5 py-3 pb-14">
          <div className="flex gap-2 mb-2">
            {suggestedQueries.map((q, i) => (
              <button
                key={i}
                className="text-[10px] text-primary bg-primary/5 hover:bg-primary/10 border border-primary/15 rounded-full px-2.5 py-1 transition-colors truncate"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask a question or request a specific tool call..."
              className="flex-1 h-9 px-3 text-sm bg-muted/50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button size="sm" className="h-9 px-3">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Right — Capture Feed */}
      <CaptureFeedPanel
        collapsed={captureCollapsed}
        onToggle={() => setCaptureCollapsed(!captureCollapsed)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────                                                                                                                                                             
  // O-4 MOCK DATA & COMPONENTS                                                                                                                                                                                
  // ─────────────────────────────────────────────
                                                                                                                                                                                                               
  const executionRecommendation = {
    tier: 3 as Tier,
    tierExplanation: "This action is Tier 3 because: fix confidence is 91% but this exact fix (BGP timer restoration after IOS upgrade) has only been confirmed on this device class twice — once resolved cleanly, once caused secondary OSPF reconvergence.",
    tierPromotion: "2 more confirmed resolutions of this pattern on Catalyst 9300s would promote this to Tier 2. 5 more would unlock Tier 1.",
    action: "Restore non-default BGP timers on Chicago-Core-01 for peer 10.0.1.1",
    commands: [
      "configure terminal",
      "router bgp 65001",
      " neighbor 10.0.1.1 timers 10 30",
      " end",
      "clear ip bgp 10.0.1.1 soft",
    ],
    confidence: 91,
    knowledgeBasis: [
      { item: "BGP timers for this peer should be hold: 30s, keepalive: 10s", confidence: 95, source: "Tacit — Sarah Chen, 6 validations" },
      { item: "IOS 17.11.1 upgrade reverts non-default BGP timers", confidence: 89, source: "Historical — INC0028917, INC0031204" },
      { item: "Current timers confirmed at defaults (180s/60s)", confidence: 99, source: "Live CLI query — 14:31:42" },
    ],
    alternatives: [
      { action: "Full BGP process restart", reason: "Overkill — timer adjustment is sufficient. Full restart would drop all peers, not just the affected one.", confidence: 45 },
      { action: "Contact AT&T NOC for ISP-side investigation", reason: "Evidence does not support ISP-side issue — timers confirmed reverted on our side.", confidence: 22 },
    ],
  };

  const safetyChecks = {
    reversibility: {
      status: "pass" as const,
      detail: "REVERSIBLE — BGP session will reconverge within 30 seconds if the fix does not resolve the issue. Rollback: restore default timers with 'neighbor 10.0.1.1 timers 60 180'.",
    },
    blastRadius: {
      status: "warning" as const,
      detail: "Estimated impact: 847 downstream prefixes will experience 15-30 second reconvergence during soft reset. No customer-facing services in blast radius.",
      source: "Topology source: Catalyst Center (verified 4 hours ago)",
      affectedPrefixes: 847,
      reconvergenceTime: "15-30s",
      customerImpact: false,
    },
    institutionalLock: {
      status: "pass" as const,
      detail: "No institutional locks apply to this device at this time.",
    },
    collisionDetection: {
      status: "pass" as const,
      detail: "No concurrent changes detected on this device or downstream segment.",
    },
  };

  const rejectionReasons = [
    "Wrong root cause",
    "Correct root cause, wrong fix",
    "Correct fix, wrong device",
    "Operational constraint not captured",
    "Not enough confidence",
    "Other",
  ];

  function SafetyCheckItem({ label, status, detail, icon }: {
    label: string; status: "pass" | "warning" | "fail" | "blocked"; detail: string; icon: React.ReactNode;
  }) {
    const statusConfig = {
      pass: { bg: "bg-confidence-high/10", border: "border-confidence-high/20", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
   strokeLinejoin="round" className="text-confidence-high"><polyline points="20 6 9 17 4 12" /></svg>, label: "PASS" },
      warning: { bg: "bg-confidence-moderate/10", border: "border-confidence-moderate/20", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
  strokeLinecap="round" strokeLinejoin="round" className="text-confidence-moderate"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" 
  x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>, label: "WARNING" },
      fail: { bg: "bg-severity-p1/10", border: "border-severity-p1/20", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" 
  strokeLinejoin="round" className="text-severity-p1"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>, label: "FAIL" },
      blocked: { bg: "bg-severity-p1/15", border: "border-severity-p1/30", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" 
  strokeLinejoin="round" className="text-severity-p1"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>, label: "BLOCKED" },
    };
    const config = statusConfig[status];
    return (
      <div className={`${config.bg} border ${config.border} rounded-lg px-4 py-3`}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{icon}</span>
            <span className="text-xs font-semibold text-foreground">{label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {config.icon}
            <span className="text-[10px] font-semibold uppercase tracking-wide">{config.label}</span>
          </div>
        </div>
        <p className="text-[11px] text-foreground/80 leading-relaxed">{detail}</p>
      </div>
    );
  }

  function ExecutionDecisionScreen({ onBack, onApprove }: { onBack: () => void; onApprove: () => void }) {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState<string | null>(null);

    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="text-xs text-muted-foreground">Back to Investigation</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <SeverityDot level="p1" size="md" />
              <div>
                <h1 className="text-base font-semibold text-foreground">Execution Decision</h1>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">Chicago-Core-01 · BGP session flapping — upstream peer down</p>
              </div>
            </div>
            <TierBadge tier={executionRecommendation.tier} size="lg" />
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Execution Decision Card */}
          <div className="flex-1 overflow-y-auto p-5 pb-14 space-y-4">
            {/* Tier Explanation */}
            <Card>
              <CardContent className="px-5 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <TierBadge tier={executionRecommendation.tier} size="lg" />
                  <div className="flex-1">
                    <div className="w-48"><ConfidenceMeter value={executionRecommendation.confidence} /></div>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-3">{executionRecommendation.tierExplanation}</p>
                <div className="bg-accent/50 border border-primary/10 rounded-md px-3 py-2">
                  <p className="text-[11px] text-accent-foreground">
                    <span className="font-semibold">What would change this tier:</span> {executionRecommendation.tierPromotion}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Action */}
            <Card>
              <CardHeader className="py-3 px-5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="4
  17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
                  Recommended Action
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-4">
                {/* Plain english action */}
                <div className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{executionRecommendation.action}</p>
                </div>

                {/* Technical commands */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-2">Technical Commands</p>
                  <pre className="text-[12px] font-mono bg-foreground/5 rounded-lg px-4 py-3 text-foreground leading-relaxed overflow-x-auto">
  {executionRecommendation.commands.join("\n")}
                  </pre>
                </div>

                {/* Execution Basis */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-2">Execution Basis</p>
                  <div className="space-y-2">
                    {executionRecommendation.knowledgeBasis.map((item, i) => {
                      const borderColor = item.confidence >= 85 ? "border-l-confidence-high" : item.confidence >= 70 ? "border-l-confidence-moderate" : "border-l-confidence-low";
                      return (
                        <div key={i} className={`border border-border ${borderColor} border-l-2 rounded-md px-3 py-2`}>
                          <p className="text-[11px] text-foreground">{item.item}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-muted-foreground">{item.source}</span>
                            <span className={`text-[10px] font-semibold tabular-nums ${item.confidence >= 85 ? "text-confidence-high" : item.confidence >= 70 ? "text-confidence-moderate" :
  "text-confidence-low"}`}>{item.confidence}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Alternatives Considered */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-2">Alternatives Considered</p>
                  <div className="space-y-2">
                    {executionRecommendation.alternatives.map((alt, i) => (
                      <div key={i} className="border border-border rounded-md px-3 py-2 opacity-70">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-foreground">{alt.action}</span>
                          <span className="text-[10px] font-semibold text-confidence-low tabular-nums">{alt.confidence}%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{alt.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval Action Area */}
            <Card className="border-primary/20">
              <CardContent className="px-5 py-5">
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 h-12 text-sm font-semibold bg-primary hover:bg-primary/90"
                      onClick={() => setShowPolicyModal(true)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="20 6 9
  17 4 12" /></svg>
                      Approve & Create Policy
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 text-sm font-semibold px-6 border-primary/30 text-primary hover:bg-primary/5"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="20 6 9
  17 4 12" /></svg>
                      Approve & Execute
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-9 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M11 4H4a2 2 0
  0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      Modify Recommendation
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-9 text-xs text-severity-p1/80 border-severity-p1/20 hover:bg-severity-p1/5 hover:text-severity-p1"
                      onClick={() => setShowRejectModal(true)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><circle cx="12" cy="12"
   r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                      Reject
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-1">
                    "Approve & Create Policy" is recommended — this will also create a candidate execution policy so similar future incidents can be handled at a lower tier.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Safety Checks Panel */}
          <div className="w-80 border-l border-border bg-background/50 p-4 flex flex-col gap-3 shrink-0 overflow-y-auto pb-14">
            <h2 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8
  10z" /></svg>
              Safety Checks
            </h2>

            <SafetyCheckItem
              label="Reversibility"
              status={safetyChecks.reversibility.status}
              detail={safetyChecks.reversibility.detail}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path 
  d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>}
            />

            <SafetyCheckItem
              label="Blast Radius"
              status={safetyChecks.blastRadius.status}
              detail={safetyChecks.blastRadius.detail}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle 
  cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>}
            />

            {/* Blast radius visual breakdown */}
            <Card className="bg-confidence-moderate/5 border-confidence-moderate/15">
              <CardContent className="px-4 py-3">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-2">Impact Breakdown</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Downstream prefixes</span>
                    <span className="font-semibold text-foreground tabular-nums">{safetyChecks.blastRadius.affectedPrefixes}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Reconvergence time</span>
                    <span className="font-semibold text-foreground">{safetyChecks.blastRadius.reconvergenceTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Customer-facing impact</span>
                    <span className="font-semibold text-confidence-high">None</span>
                  </div>
                  <Separator />
                  <p className="text-[10px] text-muted-foreground">{safetyChecks.blastRadius.source}</p>
                </div>
              </CardContent>
            </Card>

            <SafetyCheckItem
              label="Institutional Lock"
              status={safetyChecks.institutionalLock.status}
              detail={safetyChecks.institutionalLock.detail}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" 
  rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
            />

            <SafetyCheckItem
              label="Collision Detection"
              status={safetyChecks.collisionDetection.status}
              detail={safetyChecks.collisionDetection.detail}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0
  0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>}
            />

            {/* Summary card */}
            <Card className="mt-auto">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-confidence-high"><path d="M12
  22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  <span className="text-xs font-semibold text-foreground">Safety Summary</span>
                </div>
                <p className="text-[11px] text-foreground/80 leading-relaxed">
                  All 4 safety checks passed. Action is reversible with known rollback path. Blast radius is calculated and contains no customer-facing services.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reject Modal Overlay */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowRejectModal(false)}>
            <div className="bg-card border border-border rounded-xl shadow-2xl w-[420px] max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Reject Recommendation</h2>
                <p className="text-[11px] text-muted-foreground mt-1">Your rejection reason helps Groundwork learn. Each reason creates a different type of correction signal.</p>
              </div>
              <div className="px-5 py-4 space-y-2">
                {rejectionReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-all ${selectedReason === reason ? "border-primary bg-primary/5 text-foreground font-medium" : "border-border hover:bg-accent/30 text-foreground/80"}`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-border flex gap-3">
                <Button variant="outline" className="flex-1 h-9 text-xs" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                <Button className="flex-1 h-9 text-xs bg-severity-p1/80 hover:bg-severity-p1" disabled={!selectedReason}>Confirm Rejection</Button>
              </div>
            </div>
          </div>
        )}

        {/* Policy Modal Overlay */}
        {showPolicyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPolicyModal(false)}>
            <div className="bg-card border border-border rounded-xl shadow-2xl w-[520px] max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Draft Execution Policy</h2>
                <p className="text-[11px] text-muted-foreground mt-1">Review the conditions under which this action would execute automatically in the future.</p>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1.5">Policy Name</p>
                  <p className="text-sm font-medium text-foreground">BGP Timer Restoration — Catalyst 9300 Series</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1.5">Trigger Conditions</p>
                  <div className="space-y-1.5">
                    {[
                      "BGP session flapping detected on Catalyst 9300 device",
                      "IOS upgrade detected within previous 48 hours",
                      "BGP timers confirmed at defaults (not custom values)",
                      "Peer is in known custom-timer peer list",
                    ].map((condition, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-confidence-high
  shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                        <span className="text-foreground">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1.5">Confidence Thresholds Required</p>
                  <div className="flex gap-4 text-[11px]">
                    <div><span className="text-muted-foreground">Root cause:</span> <span className="font-semibold text-foreground">≥ 90%</span></div>
                    <div><span className="text-muted-foreground">Fix:</span> <span className="font-semibold text-foreground">≥ 85%</span></div>
                    <div><span className="text-muted-foreground">Blast radius:</span> <span className="font-semibold text-foreground">Verified</span></div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1.5">Policy Expiry</p>
                  <p className="text-[11px] text-foreground">No expiry — active until manually revoked or device class changes.</p>
                </div>
                <div className="bg-accent/50 border border-primary/10 rounded-md px-3 py-2">
                  <p className="text-[11px] text-accent-foreground"><span className="font-semibold">Note:</span> This policy requires 3 more confirmed resolutions before it can unlock Tier 1 autonomous
  execution. Until then, it will execute as Tier 2 (supervised).</p>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-border flex gap-3">
                <Button variant="outline" className="flex-1 h-9 text-xs" onClick={() => { setShowPolicyModal(true); }}>Cancel</Button>
                <Button className="flex-1 h-9 text-xs" onClick={onApprove}>Approve & Create Policy</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
// ─────────────────────────────────────────────                                                                                                                                                             
  // O-5 MOCK DATA & COMPONENTS                                                                                                                                                                                
  // ─────────────────────────────────────────────                                                                                                                                                             
                                                                                                                                                                                                               
  const resolutionSummary = {                                                                                                                                                                                  
    incidentType: "BGP session flapping — upstream peer down",                                                                                                                                                 
    device: "Chicago-Core-01 · 10.0.1.1",                                                                                                                                                                      
    timeToResolution: "4m 22s",                                                                                                                                                                                
    action: "Restored non-default BGP timers (hold: 30s, keepalive: 10s) and performed soft reset",                                                                                                            
    tier: 3 as Tier,                                                                                                                                                                                           
  };                                                                                                                                                                                                           
                                                                                                                                                                                                               
  const capturedItems = [                                                                                                                                                                                      
    {                                                                                                                                                                                                          
      id: "root-cause",                                                                                                                                                                                        
      label: "Root Cause",                                                                                                                                                                                     
      value: "IOS 17.11.1 upgrade reverted non-default BGP timers to defaults (180s/60s), causing peer timeout with AT&T MPLS PE which expects 30s hold time.",                                                
      source: "CLI sequence + config diff correlation",                                                                                                                                                        
      confidence: 89,                                                                                                                                                                                          
      confirmed: null as boolean | null,                                                                                                                                                                       
    },                                                                                                                                                                                                         
    {
      id: "fix-pattern",
      label: "Fix Pattern",
      value: "Restore BGP timers to hold: 30s, keepalive: 10s using 'neighbor <peer> timers 10 30' followed by soft reset.",
      source: "Operator CLI commands + resolution action",
      confidence: 92,
      confirmed: null as boolean | null,
    },
    {
      id: "blast-radius",
      label: "Blast Radius Observation",
      value: "Soft reset caused 12-second reconvergence for 847 downstream prefixes. No customer-facing impact detected. Actual reconvergence was faster than estimated 15-30s.",
      source: "Post-execution monitoring — ThousandEyes + Catalyst Center",
      confidence: 96,
      confirmed: null as boolean | null,
    },
    {
      id: "tacit-new",
      label: "New Tacit Knowledge",
      value: "IOS 17.11.1 specifically reverts BGP timer configurations. Previous version (17.9.4) preserved custom timers through upgrades. This is a regression in 17.11.x.",
      source: "Inferred from config diff + historical comparison",
      confidence: 71,
      confirmed: null as boolean | null,
    },
  ];

  const microQuestions = [
    {
      id: "q1",
      type: "approach-fork" as const,
      question: "You ran: 'clear ip bgp 10.0.1.1 soft' (soft reset). AI recommended: hard reset. Why did you choose soft reset?",
      options: [
        "Soft reset avoids dropping established prefixes",
        "Hard reset on this peer has caused cascading flaps before",
        "Soft reset is standard practice for timer changes",
        "No specific reason — either would have worked",
      ],
      selected: null as number | null,
    },
    {
      id: "q2",
      type: "sequence-rationale" as const,
      question: "You checked 'show ip bgp neighbors' before checking 'show running-config | section router bgp'. Is there a reason you check neighbor state first?",
      options: [
        "Neighbor state confirms the symptom before investigating config",
        "Running config on this device takes 10+ seconds to load",
        "Habit from training — always verify peer state first",
        "No specific reason",
      ],
      selected: null as number | null,
    },
    {
      id: "q3",
      type: "skip-rationale" as const,
      question: "In 3 similar past incidents, engineers checked interface error counters. You resolved this without checking them. Was that intentional?",
      options: [
        "Timer issue was obvious from BGP neighbor output — errors wouldn't help",
        "Error counters on this device are unreliable after IOS upgrades",
        "Forgot to check — would normally do so",
        "Error counters only matter for physical layer issues",
      ],
      selected: null as number | null,
    },
  ];

  function CapturedItemCard({ label, value, source, confidence, confirmed, onConfirm, onCorrect }: {
    label: string; value: string; source: string; confidence: number;
    confirmed: boolean | null; onConfirm: () => void; onCorrect: () => void;
  }) {
    const [editing, setEditing] = useState(false);
    const borderColor = confidence >= 85 ? "border-l-confidence-high" : confidence >= 70 ? "border-l-confidence-moderate" : "border-l-confidence-low";
    const promotedConfidence = Math.min(99, confidence + 7);

    return (
      <div className={`border border-border ${borderColor} border-l-3 rounded-lg bg-card overflow-hidden`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">{label}</span>
            <div className="w-32"><ConfidenceMeter value={confirmed === true ? promotedConfidence : confidence} size="sm" /></div>
          </div>
          <div className="bg-muted/30 border border-border rounded-md px-3 py-2 mb-2">
            <p className="text-[12px] text-foreground leading-relaxed">{value}</p>
          </div>
          <p className="text-[10px] text-muted-foreground italic mb-3">Captured from: {source}</p>

          {confirmed === null && !editing && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-7 text-[11px] px-3 border-confidence-high/30 text-confidence-high hover:bg-confidence-high/5" onClick={onConfirm}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="20 6 9 17 4
   12" /></svg>
                Confirm
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[11px] px-3 text-muted-foreground" onClick={() => setEditing(true)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M11 4H4a2 2 0 0 0-2
  2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Correct
              </Button>
            </div>
          )}

          {confirmed === true && (
            <div className="flex items-center gap-2 text-[11px] text-confidence-high font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Confirmed — {confidence}% → {promotedConfidence}%
            </div>
          )}

          {editing && (
            <div className="space-y-2">
              <textarea
                defaultValue={value}
                className="w-full h-20 px-3 py-2 text-xs bg-muted/50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-[11px] px-3" onClick={() => { setEditing(false); onCorrect(); }}>Save Correction</Button>
                <Button variant="ghost" size="sm" className="h-7 text-[11px] px-3" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function MicroQuestionCard({ type, question, options, selected, onSelect }: {
    type: string; question: string; options: string[]; selected: number | null; onSelect: (i: number) => void;
  }) {
    const typeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
      "approach-fork": {
        label: "Approach Fork",
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8" /><line x1="4" 
  y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>,
      },
      "sequence-rationale": {
        label: "Sequence Rationale",
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" 
  y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
      },
      "skip-rationale": {
        label: "Skip Rationale",
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 12 12 5 19 12" /><polyline 
  points="12 19 12 5" /></svg>,
      },
    };
    const config = typeLabels[type] || typeLabels["approach-fork"];

    return (
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-muted-foreground">{config.icon}</span>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0">{config.label}</Badge>
          </div>
          <p className="text-[12px] text-foreground leading-relaxed mb-3">{question}</p>
          <div className="space-y-1.5">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className={`w-full text-left px-3 py-2 rounded-md border text-[11px] transition-all ${selected === i ? "border-primary bg-primary/5 text-foreground font-medium" : "border-border hover:bg-accent/30 text-foreground/80"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function PostResolutionScreen({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
    const [items, setItems] = useState(capturedItems);
    const [questions, setQuestions] = useState(microQuestions);
    const confirmedCount = items.filter((i) => i.confirmed !== null).length;
    const answeredCount = questions.filter((q) => q.selected !== null).length;
    const totalActions = items.length + questions.length;
    const completedActions = confirmedCount + answeredCount;
    const estimatedSeconds = Math.max(10, (totalActions - completedActions) * 8);

    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="text-xs text-muted-foreground">Back to Execution</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-foreground">Post-Resolution Capture</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Here's what we captured — confirm or correct to strengthen the knowledge base.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">{totalActions - completedActions} items to review</p>
                <p className="text-[10px] text-muted-foreground">~{estimatedSeconds}s remaining</p>
              </div>
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(completedActions / totalActions) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-14">
          <div className="max-w-2xl mx-auto px-5 py-5 space-y-6">
            {/* Resolution Summary */}
            <Card className="bg-muted/30">
              <CardContent className="px-5 py-4">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-2">Resolution Summary</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-muted-foreground">Incident:</span> <span className="text-foreground font-medium">{resolutionSummary.incidentType}</span></div>
                  <div><span className="text-muted-foreground">Device:</span> <span className="text-foreground font-mono">{resolutionSummary.device}</span></div>
                  <div><span className="text-muted-foreground">Resolution time:</span> <span className="text-foreground font-semibold">{resolutionSummary.timeToResolution}</span></div>
                  <div><span className="text-muted-foreground">Action:</span> <span className="text-foreground">{resolutionSummary.action}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Captured Items */}
            <div>
              <h2 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12
  10 13 2" /></svg>
                Groundwork Captured
              </h2>
              <div className="space-y-3">
                {items.map((item, i) => (
                  <CapturedItemCard
                    key={item.id}
                    {...item}
                    onConfirm={() => {
                      const next = [...items];
                      next[i] = { ...next[i], confirmed: true };
                      setItems(next);
                    }}
                    onCorrect={() => {
                      const next = [...items];
                      next[i] = { ...next[i], confirmed: false };
                      setItems(next);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Micro-Questions */}
            <div>
              <h2 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09
  9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                Quick Questions ({3 - answeredCount} remaining)
              </h2>
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <MicroQuestionCard
                    key={q.id}
                    {...q}
                    onSelect={(optIdx) => {
                      const next = [...questions];
                      next[i] = { ...next[i], selected: optIdx };
                      setQuestions(next);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Optional Addition */}
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">Anything else? (optional)</p>
              <textarea
                placeholder="e.g. specific conditions, timing notes, related devices, ISP contact details."
                className="w-full h-16 px-3 py-2 text-xs bg-muted/30 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            {/* Submit */}
            <div className="space-y-2">
              <Button className="w-full h-11 text-sm font-semibold" onClick={onComplete}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 2L2 7l10 5
  10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                Save to Knowledge Base
              </Button>
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                If you close now without confirming, Groundwork has already captured the execution sequence. Confirmation promotes these entries to higher confidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

// ─────────────────────────────────────────────                                                                                                                                                             
  // O-6 MOCK DATA & COMPONENTS                                                                                                                                                                                
  // ─────────────────────────────────────────────

  const knowledgeUpdates = [
    { icon: "confirm", text: "Root cause confirmed — confidence promoted: 89% → 96%", type: "promotion" },
    { icon: "confirm", text: "Fix pattern confirmed — BGP_TIMER_IOS_UPGRADE · Catalyst 9300 · 6 confirmations", type: "promotion" },
    { icon: "new", text: "New tacit item created: IOS 17.11.1 reverts BGP timer configs (regression vs 17.9.4)", type: "new" },
    { icon: "policy", text: "Execution policy candidate created: EP-Draft-089 · BGP Timer Restoration", type: "policy" },
    { icon: "correction", text: "Soft reset preference recorded as correction signal (vs. hard reset recommendation)", type: "correction" },
  ];

  function KnowledgeConfirmationScreen({ onReturn }: { onReturn: () => void }) {
    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-14">
          <div className="max-w-xl mx-auto px-5 py-10 space-y-8">
            {/* Success header */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-confidence-high/10 flex items-center justify-center mx-auto">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-confidence-high"><polyline 
  points="20 6 9 17 4 12" /></svg>
              </div>
              <h1 className="text-lg font-semibold text-foreground">Incident Resolved & Knowledge Updated</h1>
              <p className="text-sm text-muted-foreground">Here's what changed in the knowledge base from your investigation.</p>
            </div>

            {/* Knowledge Update Summary */}
            <Card>
              <CardHeader className="py-3 px-5">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path 
  d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                  Knowledge Base Changes
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-2">
                {knowledgeUpdates.map((item, i) => {
                  const icons: Record<string, React.ReactNode> = {
                    confirm: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
  className="text-confidence-high"><polyline points="20 6 9 17 4 12" /></svg>,
                    new: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><line x1="12" 
  y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
                    policy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tier-3"><path d="M14
   2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
                    correction: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
  className="text-confidence-moderate"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>,
                  };
                  return (
                    <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-muted/30 border border-border">
                      <span className="mt-0.5 shrink-0">{icons[item.icon]}</span>
                      <p className="text-[12px] text-foreground leading-relaxed">{item.text}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Autonomy Coverage Delta */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="px-5 py-5">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-4">Autonomy Coverage Impact</p>
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="text-center">
                    <TierBadge tier={3} size="lg" />
                    <p className="text-[10px] text-muted-foreground mt-1.5">Previous</p>
                  </div>
                  <div className="flex items-center gap-1 text-confidence-high">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" 
  /><polyline points="12 5 19 12 12 19" /></svg>
                  </div>
                  <div className="text-center">
                    <TierBadge tier={2} size="lg" />
                    <p className="text-[10px] text-muted-foreground mt-1.5">New</p>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg px-4 py-3 text-center">
                  <p className="text-sm text-foreground font-medium">This incident type is now eligible for <span className="text-tier-2 font-semibold">Tier 2 supervised execution</span>.</p>
                  <p className="text-xs text-muted-foreground mt-1.5">2 more confirmations needed for Tier 1 autonomous execution.</p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-confidence-high rounded-full" style={{ width: "60%" }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">3/5 confirmations</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Return */}
            <Button className="w-full h-11 text-sm font-semibold" onClick={onReturn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 12h-4l-3 9L9 3l-3
  9H2" /></svg>
              Return to Command Center
            </Button>
          </div>
        </div>
      </div>
    );
  }

// ─────────────────────────────────────────────
  // K-1 MOCK DATA & COMPONENTS
  // ─────────────────────────────────────────────

  const knowledgeItems = [
    { id: 1, type: "tacit" as KnowledgeType, device: "Chicago-Core-01", content: "BGP timers are non-default (hold: 30s, keepalive: 10s). After IOS upgrades, timers sometimes revert to defaults.",
  confidence: 96, freshness: 88, freshnessState: "fresh" as FreshnessState, source: "cli" as ProvenanceSource, owner: "Sarah Chen", lastValidated: "Mar 7, 2026", validations: 7 },
    { id: 2, type: "tacit" as KnowledgeType, device: "Chicago-Core-01", content: "Peer 10.0.1.1 is primary upstream to AT&T MPLS cloud. Never clear backup peer (10.0.1.2) simultaneously.", confidence: 95,
  freshness: 92, freshnessState: "fresh" as FreshnessState, source: "sprint" as ProvenanceSource, owner: "Sarah Chen", lastValidated: "Mar 5, 2026", validations: 4 },
    { id: 3, type: "historical" as KnowledgeType, device: "Chicago-Core-01", content: "BGP flapping on this device: 3 occurrences in 6 months. Twice after IOS upgrades, once ISP-side.", confidence: 92,
  freshness: 75, freshnessState: "fresh" as FreshnessState, source: "servicenow" as ProvenanceSource, owner: "System", lastValidated: "Feb 18, 2026", validations: 3 },
    { id: 4, type: "operational" as KnowledgeType, device: "Chicago-Core-*", content: "IOS upgrade window for Chicago campus: Saturdays 10pm–4am CT. No unscheduled changes to core routers.", confidence: 98,
  freshness: 95, freshnessState: "fresh" as FreshnessState, source: "servicenow" as ProvenanceSource, owner: "Marcus Webb", lastValidated: "Mar 1, 2026", validations: 12 },
    { id: 5, type: "topological" as KnowledgeType, device: "Chicago-Core-01", content: "Core router: 47 downstream devices, 847 prefixes. Dual upstream to Chicago-Agg-01/02. Role: MPLS PE.", confidence: 99,
  freshness: 98, freshnessState: "fresh" as FreshnessState, source: "auto" as ProvenanceSource, owner: "System", lastValidated: "Mar 7, 2026", validations: 0 },
    { id: 6, type: "tacit" as KnowledgeType, device: "NYC-Edge-03", content: "OSPF adjacency on ge-0/0/2 is flaky after heavy rain. Suspect cable plant issue in MDF-3 riser.", confidence: 68, freshness: 40,
  freshnessState: "approaching" as FreshnessState, source: "correction" as ProvenanceSource, owner: "Jordan Liu", lastValidated: "Jan 15, 2026", validations: 2 },
    { id: 7, type: "operational" as KnowledgeType, device: "SFO-Core-*", content: "DHCP pools on VLAN 150/210 hit 85% during all-hands events. Auto-extend policy EP-089 active.", confidence: 88, freshness:
  70, freshnessState: "fresh" as FreshnessState, source: "cli" as ProvenanceSource, owner: "Alex Park", lastValidated: "Feb 20, 2026", validations: 6 },
    { id: 8, type: "tacit" as KnowledgeType, device: "LAX-Dist-02", content: "Gi1/0/24 shows phantom utilization spikes every Tuesday 2–3am PT. Monitoring artifact, not real traffic.", confidence: 82,
  freshness: 55, freshnessState: "approaching" as FreshnessState, source: "peer" as ProvenanceSource, owner: "Sarah Chen", lastValidated: "Feb 10, 2026", validations: 3 },
  ];

  function KnowledgeBrowser() {
    const [typeFilter, setTypeFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const filtered = knowledgeItems.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (searchQuery && !item.content.toLowerCase().includes(searchQuery.toLowerCase()) && !item.device.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Knowledge Base</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{knowledgeItems.length} items · {knowledgeItems.filter((i) => i.confidence >= 85).length} high confidence</p>
            </div>
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{selectedItems.length} selected</span>
                <Button variant="outline" size="sm" className="h-7 text-[11px]">Flag for Review</Button>
                <Button variant="outline" size="sm" className="h-7 text-[11px]">Request Revalidation</Button>
                <Button variant="outline" size="sm" className="h-7 text-[11px]">Export</Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2
  -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text" placeholder="Search knowledge items..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-background rounded-md border border-border focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 w-36 text-[11px] bg-background"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="topological">Topological</SelectItem>
                <SelectItem value="historical">Historical</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="tacit">Tacit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto pb-14">
          <div className="divide-y divide-border">
            {filtered.map((item) => {
              const borderColor = item.confidence >= 85 ? "border-l-confidence-high" : item.confidence >= 70 ? "border-l-confidence-moderate" : "border-l-confidence-low";
              const isSelected = selectedItems.includes(item.id);
              return (
                <div key={item.id} className={`flex items-center gap-4 px-5 py-3 hover:bg-accent/30 cursor-pointer transition-colors ${isSelected ? "bg-accent/50" : ""}`}
                  onClick={() => setSelectedItems(isSelected ? selectedItems.filter((id) => id !== item.id) : [...selectedItems, item.id])}
                >
                  <div className={`w-1 h-10 rounded-full ${borderColor.replace("border-l-", "bg-")}`} />
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 shrink-0 w-14 justify-center">{knowledgeTypeLabels[item.type].full.slice(0, 4)}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{item.content}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{item.device}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-16"><ConfidenceMeter value={item.confidence} size="sm" /></div>
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.freshnessState === "fresh" ? "bg-confidence-high" : "bg-confidence-moderate"}`} style={{ width: `${item.freshness}%` }} />
                    </div>
                    <span className="text-muted-foreground shrink-0">{sourceIcons[item.source].icon}</span>
                    <span className="text-[10px] text-muted-foreground w-20 truncate">{item.owner}</span>
                    <span className="text-[10px] text-muted-foreground w-20 text-right">{item.lastValidated}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

// ─────────────────────────────────────────────
  // K-2 COMPONENTS
  // ─────────────────────────────────────────────

  const sampleItemDetail = knowledgeItems[0];
  const provenanceChain = [
    { time: "Mar 7, 2026 14:35", action: "Confirmed", actor: "Jordan Liu", confidenceAtTime: 96, note: "Confirmed during O-5 post-resolution review" },
    { time: "Feb 18, 2026 11:22", action: "Confirmed", actor: "Sarah Chen", confidenceAtTime: 89, note: "Confirmed during BGP flap investigation" },
    { time: "Jan 03, 2026 09:15", action: "Corrected", actor: "Sarah Chen", confidenceAtTime: 78, note: "Updated timer values from 20s/60s to 10s/30s" },
    { time: "Nov 12, 2025 16:40", action: "Created", actor: "Sarah Chen", confidenceAtTime: 65, note: "Captured from CLI session during BGP investigation" },
  ];
  const usageStats = { timesSurfaced: 14, timesActedOn: 11, usageRate: 79 };

  function KnowledgeItemDetail({ onBack }: { onBack: () => void }) {
    const item = sampleItemDetail;
    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="text-xs text-muted-foreground">Back to Knowledge Base</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">{knowledgeTypeLabels[item.type].full}</Badge>
                <span className="text-xs font-mono text-muted-foreground">{item.device}</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed max-w-2xl">{item.content}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-24"><ConfidenceMeter value={item.confidence} /></div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-14">
          <div className="max-w-3xl mx-auto px-5 py-5 space-y-6">
            {/* Provenance Chain */}
            <Card>
              <CardHeader className="py-3 px-5"><CardTitle className="text-xs font-semibold">Provenance Chain</CardTitle></CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <div className="space-y-0">
                  {provenanceChain.map((entry, i) => (
                    <div key={i} className="flex gap-3 pb-4 relative">
                      {i < provenanceChain.length - 1 && <div className="absolute left-[7px] top-5 w-0.5 h-full bg-border" />}
                      <div className={`w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center ${entry.action === "Created" ? "bg-primary/20" : entry.action === "Confirmed" ?
  "bg-confidence-high/20" : "bg-confidence-moderate/20"}`}>
                        <div className={`w-2 h-2 rounded-full ${entry.action === "Created" ? "bg-primary" : entry.action === "Confirmed" ? "bg-confidence-high" : "bg-confidence-moderate"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground">{entry.action}</span>
                          <span className="text-[10px] text-muted-foreground">by {entry.actor}</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">{entry.time}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{entry.note}</p>
                        <span className="text-[10px] text-muted-foreground">Confidence at time: {entry.confidenceAtTime}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card>
              <CardHeader className="py-3 px-5"><CardTitle className="text-xs font-semibold">Usage History</CardTitle></CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="text-[10px] text-muted-foreground uppercase">Times Surfaced</p><p className="text-lg font-bold text-foreground">{usageStats.timesSurfaced}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase">Times Acted On</p><p className="text-lg font-bold text-foreground">{usageStats.timesActedOn}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase">Usage Rate</p><p className="text-lg font-bold text-confidence-high">{usageStats.usageRate}%</p></div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Controls */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs">Correct Content</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">Mark as Outdated</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">Expire</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">Transfer Ownership</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">Request Peer Review</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

// ─────────────────────────────────────────────
  // K-3 MOCK DATA & COMPONENTS
  // ─────────────────────────────────────────────

  const validationQueues = {
    pending: [
      { id: 1, content: "NTP drift on DEN-Access switches correlates with HVAC cycling. Resolved by hardcoding stratum-1 source.", confidence: 68, source: "correction" as ProvenanceSource, owner: "Jordan Liu", question: "Promote this to high-confidence based on 4 independent confirmations?" },
      { id: 2, content: "DHCP pool exhaustion on SFO VLANs during all-hands is predictable 2 hours before event start.", confidence: 72, source: "cli" as ProvenanceSource, owner: "Alex Park", question: "Sufficient evidence to promote? 6 occurrences observed, 4 confirmed." },
    ],
    divergences: [
      { id: 3, itemA: "Clear BGP session with hard reset for timer issues", itemB: "Use soft reset to avoid dropping established prefixes", device: "Catalyst 9300 series", contributors: ["Sarah Chen", "Jordan Liu"] },
    ],
    staleness: [
      { id: 4, content: "Weather-related power fluctuations affect Chicago-Core-01 line cards", confidence: 52, owner: "Jordan Liu", lastValidated: "Jan 15, 2026", daysStale: 51 },
    ],
    flagged: [
      { id: 5, content: "Gi1/0/24 phantom utilization — monitoring artifact, not real traffic", confidence: 82, owner: "Sarah Chen", flaggedBy: "Alex Park", reason: "May have been fixed in latest firmware update" },
    ],
  };

  function ValidationQueue() {
    const [activeTab, setActiveTab] = useState<"pending" | "divergences" | "staleness" | "flagged">("pending");
    const tabs = [
      { id: "pending" as const, label: "Pending Promotion", count: validationQueues.pending.length },
      { id: "divergences" as const, label: "Divergences", count: validationQueues.divergences.length },
      { id: "staleness" as const, label: "Approaching Staleness", count: validationQueues.staleness.length },
      { id: "flagged" as const, label: "Flagged", count: validationQueues.flagged.length },
    ];
    const totalItems = tabs.reduce((s, t) => s + t.count, 0);

    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Validation Queue</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{totalItems} items · Est. {totalItems * 2} min review time</p>
            </div>
          </div>
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>
                {tab.label} <span className="ml-1 opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pb-14 space-y-3">
          {activeTab === "pending" && validationQueues.pending.map((item) => (
            <Card key={item.id}>
              <CardContent className="px-5 py-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-1 h-12 rounded-full shrink-0 ${item.confidence >= 85 ? "bg-confidence-high" : item.confidence >= 70 ? "bg-confidence-moderate" : "bg-confidence-low"}`} />
                  <div className="flex-1">
                    <p className="text-xs text-foreground leading-relaxed">{item.content}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-muted-foreground">{sourceIcons[item.source].icon}</span>
                      <span className="text-[10px] text-muted-foreground">{item.owner}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <div className="w-16"><ConfidenceMeter value={item.confidence} size="sm" /></div>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-foreground font-medium mb-2">{item.question}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-[11px] bg-confidence-high/90 hover:bg-confidence-high">Approve Promotion</Button>
                  <Button variant="outline" size="sm" className="h-7 text-[11px]">Reject</Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {activeTab === "divergences" && validationQueues.divergences.map((item) => (
            <Card key={item.id}>
              <CardContent className="px-5 py-4">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-2">Conflicting Approaches · {item.device}</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-muted/30 border border-border rounded-md px-3 py-2">
                    <p className="text-[10px] text-muted-foreground mb-1">Approach A — {item.contributors[0]}</p>
                    <p className="text-xs text-foreground">{item.itemA}</p>
                  </div>
                  <div className="bg-muted/30 border border-border rounded-md px-3 py-2">
                    <p className="text-[10px] text-muted-foreground mb-1">Approach B — {item.contributors[1]}</p>
                    <p className="text-xs text-foreground">{item.itemB}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-[11px]">A is preferred</Button>
                  <Button variant="outline" size="sm" className="h-7 text-[11px]">B is preferred</Button>
                  <Button variant="outline" size="sm" className="h-7 text-[11px]">Both valid (different contexts)</Button>
                  <Button variant="outline" size="sm" className="h-7 text-[11px]">Escalate to team</Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {activeTab === "staleness" && validationQueues.staleness.map((item) => (
            <Card key={item.id}>
              <CardContent className="px-5 py-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-foreground leading-relaxed flex-1">{item.content}</p>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 ml-3 shrink-0 text-confidence-moderate border-confidence-moderate/30">{item.daysStale}d stale</Badge>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] text-muted-foreground">{item.owner} · Last validated: {item.lastValidated}</span>
                  <div className="w-16"><ConfidenceMeter value={item.confidence} size="sm" /></div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-[11px]">Revalidate</Button>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] text-muted-foreground">Expire</Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {activeTab === "flagged" && validationQueues.flagged.map((item) => (
            <Card key={item.id}>
              <CardContent className="px-5 py-4">
                <p className="text-xs text-foreground leading-relaxed mb-2">{item.content}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-muted-foreground">Owner: {item.owner}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground">Flagged by: {item.flaggedBy}</span>
                  <div className="w-16"><ConfidenceMeter value={item.confidence} size="sm" /></div>
                </div>
                <div className="bg-warning/10 border border-warning/20 rounded-md px-3 py-2 mb-3">
                  <p className="text-[11px] text-foreground">{item.reason}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-[11px]">Still Valid</Button>
                  <Button variant="outline" size="sm" className="h-7 text-[11px]">Update</Button>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] text-muted-foreground">Expire</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

// ─────────────────────────────────────────────
  // K-4 MOCK DATA & COMPONENTS
  // ─────────────────────────────────────────────

  const ingestionSources = [
    { name: "ServiceNow", type: "ITSM", status: "active" as const, itemsCaptured: 312, lastCapture: "2 min ago", pendingValidation: 8, errorCount: 0 },
    { name: "Splunk", type: "Log Analytics", status: "active" as const, itemsCaptured: 156, lastCapture: "5 min ago", pendingValidation: 3, errorCount: 0 },
    { name: "Catalyst Center", type: "Network Controller", status: "active" as const, itemsCaptured: 89, lastCapture: "4h ago", pendingValidation: 0, errorCount: 0 },
    { name: "CLI Sessions", type: "SSH Relay", status: "active" as const, itemsCaptured: 203, lastCapture: "14 min ago", pendingValidation: 5, errorCount: 0 },
    { name: "Slack (#noc-ops)", type: "Chat", status: "active" as const, itemsCaptured: 41, lastCapture: "1h ago", pendingValidation: 12, errorCount: 0 },
    { name: "ThousandEyes", type: "Path Intelligence", status: "paused" as const, itemsCaptured: 28, lastCapture: "3d ago", pendingValidation: 0, errorCount: 2 },
  ];

  function IngestionSources() {
    const [expandedSource, setExpandedSource] = useState<number | null>(null);
    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-border bg-card">
          <h1 className="text-lg font-semibold text-foreground">Ingestion Sources</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{ingestionSources.filter((s) => s.status === "active").length} active · {ingestionSources.reduce((s, i) => s + i.itemsCaptured, 0)} total items
  captured</p>
        </div>
        <div className="flex-1 overflow-y-auto p-5 pb-14 space-y-2">
          {ingestionSources.map((source, i) => (
            <Card key={i}>
              <button onClick={() => setExpandedSource(expandedSource === i ? null : i)} className="w-full text-left">
                <CardContent className="px-5 py-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${source.status === "active" ? "bg-confidence-high" : source.status === "paused" ? "bg-confidence-moderate" : "bg-severity-p1"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{source.name}</span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">{source.type}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs shrink-0">
                      <div className="text-right"><p className="text-muted-foreground">Captured</p><p className="font-semibold text-foreground">{source.itemsCaptured}</p></div>
                      <div className="text-right"><p className="text-muted-foreground">Last</p><p className="font-medium text-foreground">{source.lastCapture}</p></div>
                      <div className="text-right"><p className="text-muted-foreground">Pending</p><p className={`font-semibold ${source.pendingValidation > 0 ? "text-confidence-moderate" :
  "text-foreground"}`}>{source.pendingValidation}</p></div>
                      {source.errorCount > 0 && <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-severity-p1 border-severity-p1/30">{source.errorCount} errors</Badge>}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-muted-foreground 
  transition-transform ${expandedSource === i ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9" /></svg>
                    </div>
                  </div>
                </CardContent>
              </button>
              {expandedSource === i && (
                <div className="px-5 pb-4 border-t border-border">
                  <div className="grid grid-cols-3 gap-4 pt-3 text-xs">
                    <div><p className="text-muted-foreground text-[10px] uppercase font-semibold mb-1">Status</p><Badge className={source.status === "active" ? "bg-confidence-high/10 text-confidence-high border-confidence-high/20" : "bg-confidence-moderate/10 text-confidence-moderate border-confidence-moderate/20"} variant="outline">{source.status}</Badge></div>
                    <div><p className="text-muted-foreground text-[10px] uppercase font-semibold mb-1">Items / Day (avg)</p><p className="text-foreground font-medium">{Math.round(source.itemsCaptured / 30)}</p></div>
                    <div><p className="text-muted-foreground text-[10px] uppercase font-semibold mb-1">Validation Rate</p><p className="text-foreground font-medium">{Math.round((source.itemsCaptured - source.pendingValidation) / source.itemsCaptured * 100)}%</p></div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="h-7 text-[11px]">View Captures</Button>
                    {source.status === "active" ? <Button variant="outline" size="sm" className="h-7 text-[11px]">Pause</Button> : <Button variant="outline" size="sm" className="h-7
  text-[11px]">Resume</Button>}
                    <Button variant="outline" size="sm" className="h-7 text-[11px]">Configure</Button>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {/* Pending Validation Summary */}
          <Card className="mt-4 border-confidence-moderate/20">
            <CardHeader className="py-3 px-5">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Badge className="bg-confidence-moderate/10 text-confidence-moderate border-confidence-moderate/20 text-[9px]">{ingestionSources.reduce((s, i) => s + i.pendingValidation, 0)}</Badge>
                Total Pending Validation
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4 pt-0">
              <p className="text-[11px] text-muted-foreground">Items captured automatically that need engineer confirmation to reach full confidence.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

 // ─────────────────────────────────────────────
  // I-1, I-2, I-3 COMPONENTS
  // ─────────────────────────────────────────────

  function AutonomyDashboard() {
    const coverageByType: Record<KnowledgeType, number> = { topological: 82, historical: 68, operational: 74, tacit: 41 };
    const tierDistribution = { tier1: 34, tier2: 28, tier3: 38 };
    const coverageGaps = [
      { type: "OSPF adjacency flaps", currentTier: 3, needed: "3 more confirmed resolutions on Catalyst 9300", progress: 40 },
      { type: "DHCP pool exhaustion", currentTier: 2, needed: "2 more confirmations for Tier 1", progress: 60 },
      { type: "NTP drift correction", currentTier: 1, needed: "Fully autonomous", progress: 100 },
      { type: "Interface error threshold", currentTier: 3, needed: "5 more confirmed resolutions", progress: 20 },
      { type: "High CPU on access switches", currentTier: 3, needed: "Root cause pattern needed", progress: 10 },
    ];

    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-border bg-card">
          <h1 className="text-lg font-semibold text-foreground">Autonomy Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">System-wide autonomy coverage and progress</p>
        </div>
        <div className="flex-1 overflow-y-auto p-5 pb-14 space-y-5">
          {/* Hero Metric */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Autonomy Coverage</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-bold text-foreground">34%</span>
                    <span className="text-sm font-medium text-confidence-high">↑ 2% this week</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">of incident types eligible for Tier 1 autonomous execution</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Target</p>
                  <p className="text-lg font-bold text-foreground">60%</p>
                  <p className="text-[10px] text-muted-foreground">by Q3 2026</p>
                </div>
              </div>
              <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: "34%" }} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {/* Knowledge Coverage by Type */}
            <Card>
              <CardHeader className="py-3 px-5"><CardTitle className="text-xs font-semibold">Knowledge Coverage by Type</CardTitle></CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-3">
                {(["topological", "historical", "operational", "tacit"] as KnowledgeType[]).map((type) => (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-[11px] text-muted-foreground w-20">{knowledgeTypeLabels[type].full}</span>
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${coverageByType[type] >= 80 ? "bg-confidence-high" : coverageByType[type] >= 60 ? "bg-confidence-moderate" : "bg-confidence-low"}`} style={{ width:
   `${coverageByType[type]}%` }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums w-10 text-right">{coverageByType[type]}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tier Distribution */}
            <Card>
              <CardHeader className="py-3 px-5"><CardTitle className="text-xs font-semibold">Tier Distribution (Last 30 Days)</CardTitle></CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <div className="flex h-8 rounded-lg overflow-hidden mb-3">
                  <div className="bg-tier-1 flex items-center justify-center" style={{ width: `${tierDistribution.tier1}%` }}><span className="text-[10px] font-bold
  text-tier-1-foreground">{tierDistribution.tier1}%</span></div>
                  <div className="bg-tier-2 flex items-center justify-center" style={{ width: `${tierDistribution.tier2}%` }}><span className="text-[10px] font-bold
  text-tier-2-foreground">{tierDistribution.tier2}%</span></div>
                  <div className="bg-tier-3 flex items-center justify-center" style={{ width: `${tierDistribution.tier3}%` }}><span className="text-[10px] font-bold
  text-tier-3-foreground">{tierDistribution.tier3}%</span></div>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-tier-1" />Tier 1 Autonomous</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-tier-2" />Tier 2 Supervised</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-tier-3" />Tier 3 Approval</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coverage Gaps */}
          <Card>
            <CardHeader className="py-3 px-5"><CardTitle className="text-xs font-semibold">Top 5 — Closest to Tier Promotion</CardTitle></CardHeader>
            <CardContent className="px-5 pb-5 pt-0 space-y-2.5">
              {coverageGaps.map((gap, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <TierBadge tier={gap.currentTier as Tier} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{gap.type}</p>
                    <p className="text-[10px] text-muted-foreground">{gap.needed}</p>
                  </div>
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                    <div className={`h-full rounded-full ${gap.progress === 100 ? "bg-confidence-high" : "bg-primary"}`} style={{ width: `${gap.progress}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

function BusinessImpact() {
    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-border bg-card">
          <h1 className="text-lg font-semibold text-foreground">Business Impact</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Operational improvements driven by institutional knowledge</p>
        </div>
        <div className="flex-1 overflow-y-auto p-5 pb-14 space-y-5">
          {/* Hero Metrics */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "MTTR Improvement", value: "38%", trend: "↓ vs 30-day baseline", trendColor: "text-confidence-high", sublabel: "4.2 min avg → 2.6 min avg" },
              { label: "Auto-Resolved", value: "23", trend: "this month", trendColor: "text-muted-foreground", sublabel: "incidents handled autonomously" },
              { label: "On-Call Pages Avoided", value: "17", trend: "↓ 22% vs last month", trendColor: "text-confidence-high", sublabel: "off-hours pages prevented" },
              { label: "Engineer Hours Saved", value: "34h", trend: "this month", trendColor: "text-muted-foreground", sublabel: "estimated from auto-resolution" },
            ].map((metric, i) => (
              <Card key={i}>
                <CardContent className="px-4 py-4">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{metric.value}</p>
                  <p className={`text-[10px] font-medium ${metric.trendColor} mt-0.5`}>{metric.trend}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{metric.sublabel}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Knowledge Attribution */}
          <Card>
            <CardHeader className="py-3 px-5"><CardTitle className="text-xs font-semibold">Knowledge Attribution</CardTitle></CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <div className="bg-confidence-high/5 border border-confidence-high/15 rounded-lg px-4 py-3">
                <p className="text-sm text-foreground leading-relaxed">
                  Of <span className="font-bold">47 incidents</span> this month where Groundwork surfaced institutional knowledge: average resolution was <span className="font-bold text-confidence-high">38%
  faster</span> than the baseline.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Adoption Metrics */}
          <Card>
            <CardHeader className="py-3 px-5"><CardTitle className="text-xs font-semibold">Adoption Metrics</CardTitle></CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: "Investigation Adoption", value: "78%", target: "> 65%", met: true, desc: "alerts investigated via Groundwork" },
                  { label: "O-5 Completion Rate", value: "72%", target: "> 70%", met: true, desc: "resolved incidents with knowledge capture" },
                  { label: "Avg Questions / O-5", value: "2.4", target: "> 2.0", met: true, desc: "of 3 micro-questions answered" },
                ].map((m, i) => (
                  <div key={i}>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">{m.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{m.value}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={m.met ? "text-confidence-high"
  : "text-severity-p1"}><polyline points="20 6 9 17 4 12" /></svg>
                      <span className={`text-[10px] ${m.met ? "text-confidence-high" : "text-severity-p1"}`}>Target: {m.target}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

function BootstrapStatus() {
    const miningPipelines = [
      { source: "ServiceNow", processed: 1047, total: 1203, extracted: 312, pending: 8, lastRun: "2 min ago" },
      { source: "Splunk", processed: 890, total: 890, extracted: 156, pending: 3, lastRun: "5 min ago" },
      { source: "Catalyst Center", processed: 1, total: 1, extracted: 89, pending: 0, lastRun: "4h ago" },
      { source: "Slack", processed: 420, total: 520, extracted: 41, pending: 12, lastRun: "1h ago" },
    ];
    const sprintStatus = [
      { name: "Sarah Chen", role: "Senior Network Engineer", completed: true, items: 18, lastActive: "Mar 5" },
      { name: "Marcus Webb", role: "Team Lead", completed: true, items: 14, lastActive: "Mar 4" },
      { name: "Alex Park", role: "Senior Network Engineer", completed: true, items: 11, lastActive: "Mar 3" },
      { name: "Priya Sharma", role: "Network Engineer", completed: false, items: 0, lastActive: "—" },
    ];

    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="px-5 pt-5 pb-3 border-b border-border bg-card">
          <h1 className="text-lg font-semibold text-foreground">Bootstrap & Ingestion Status</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Data pipeline health and onboarding progress</p>
        </div>
        <div className="flex-1 overflow-y-auto p-5 pb-14 space-y-5">
          {/* Mining Pipelines */}
          <Card>
            <CardHeader className="py-3 px-5"><CardTitle className="text-xs font-semibold">Mining Pipelines</CardTitle></CardHeader>
            <CardContent className="px-5 pb-5 pt-0 space-y-3">
              {miningPipelines.map((p, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{p.source}</span>
                    <span className="text-muted-foreground">{p.processed} / {p.total} processed · {p.extracted} extracted · {p.pending} pending</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(p.processed / p.total) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Last run: {p.lastRun}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Knowledge Sprint Status */}
          <Card>
            <CardHeader className="py-3 px-5"><CardTitle className="text-xs font-semibold">Knowledge Sprint Status</CardTitle></CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <div className="space-y-2">
                {sprintStatus.map((s, i) => (
                  <div key={i} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold ${s.completed ? "bg-confidence-high/10 text-confidence-high" : "bg-muted text-muted-foreground"}`}>
                      {s.completed
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        : s.name.split(" ").map((n) => n[0]).join("")
                      }
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.role}</p>
                    </div>
                    <div className="text-right text-xs">
                      {s.completed ? (
                        <><p className="font-medium text-foreground">{s.items} items</p><p className="text-[10px] text-muted-foreground">Last active: {s.lastActive}</p></>
                      ) : (
                        <Button variant="outline" size="sm" className="h-7 text-[11px]">Invite to Sprint</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ingestion Health */}
          <Card>
            <CardHeader className="py-3 px-5"><CardTitle className="text-xs font-semibold">Ingestion Health</CardTitle></CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-confidence-high opacity-40" /><span className="relative inline-flex rounded-full h-2 w-2 bg-confidence-high" /></span>
                <span className="text-foreground font-medium">All sources healthy</span>
                <span className="text-muted-foreground">· Last error: 3 days ago (ThousandEyes auth timeout — auto-recovered)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
                                                                                                                                                                                 function SubNav({ items, active, onSelect }: { items: { id: string; label: string }[]; active: string; onSelect: (id: string) => void }) {
    return (
      <div className="w-48 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-3 space-y-0.5">
          {items.map((item) => (
            <button key={item.id} onClick={() => onSelect(item.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${active === item.id ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

export default function App() {
    const [currentScreen, setCurrentScreen] = useState<
      "o1" | "o2" | "o3" | "o4" | "o5" | "o6" |
      "k1" | "k2" | "k3" | "k4" |
      "i1" | "i2" | "i3"
    >("o1");
    const [selectedAlert, setSelectedAlert] = useState(0);
    const [sortBy, setSortBy] = useState("severity");
    const [expandedResolution, setExpandedResolution] = useState<number | null>(null);
    const [isFloodMode, setIsFloodMode] = useState(false);
    const [severityFilter, setSeverityFilter] = useState("all");

    const filteredAlerts = severityFilter === "all"
      ? alerts
      : alerts.filter((a) => a.severity === severityFilter);

    // Determine active area for nav sidebar
    const activeArea = currentScreen.startsWith("o") ? "operations" as const
      : currentScreen.startsWith("k") ? "knowledge" as const
      : "insights" as const;

    return (
      <div className="h-screen flex bg-background">
        <NavSidebar
          activeArea={activeArea}
          onNavigate={(area: "operations" | "knowledge" | "insights") => {
            if (area === "operations") setCurrentScreen("o1");
            else if (area === "knowledge") setCurrentScreen("k1");
            else setCurrentScreen("i1");
          }}
        />

        {/* ═══════════════ O-1: Alert Command Center ═══════════════ */}
        {currentScreen === "o1" && (
          <>
            <div className="flex-1 flex flex-col min-w-0 border-r border-border">
              <div className="px-5 pt-5 pb-3 border-b border-border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h1 className="text-lg font-semibold text-foreground">Alert Command Center</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">{filteredAlerts.length} active alerts · Sorted by {sortBy}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider><Tooltip><TooltipTrigger asChild>
                      <Button variant={isFloodMode ? "default" : "outline"} size="sm" className="h-7 text-[11px] px-2 gap-1" onClick={() => setIsFloodMode(!isFloodMode)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" 
  /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" 
  /></svg>
                        {isFloodMode ? "Triage" : "Normal"}
                      </Button>
                    </TooltipTrigger><TooltipContent><p className="text-xs">Toggle triage mode for high alert volume</p></TooltipContent></Tooltip></TooltipProvider>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="h-7 w-28 text-[11px] bg-background"><SelectValue placeholder="Severity" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Severity</SelectItem><SelectItem value="p1">P1 Critical</SelectItem><SelectItem value="p2">P2 High</SelectItem><SelectItem value="p3">P3
  Medium</SelectItem><SelectItem value="p4">P4 Low</SelectItem></SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-7 w-36 text-[11px] bg-background"><SelectValue placeholder="Sort by" /></SelectTrigger>
                    <SelectContent><SelectItem value="severity">Severity</SelectItem><SelectItem value="knowledge">Knowledge Readiness</SelectItem><SelectItem value="confidence">AI
  Confidence</SelectItem><SelectItem value="time">Time</SelectItem></SelectContent>
                  </Select>
                  {severityFilter !== "all" && <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2 text-muted-foreground" onClick={() => setSeverityFilter("all")}>Clear filters</Button>}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 pb-14 space-y-1.5">
                {isFloodMode && <div className="flex items-center gap-3 px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"><span className="w-3" /><span 
  className="flex-1">Alert</span><span className="w-36">Device</span><span className="w-10 text-right">Time</span><span className="w-10 text-right">Conf.</span><span className="w-16">Tier</span></div>}
                {!isFloodMode && filteredAlerts.length > 0 && <div className="flex items-center gap-4 px-4 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"><span className="w-3"
   /><span className="flex-1">Alert</span><span className="w-16 text-center">Knowledge</span><span className="w-20 text-center">Confidence</span><span className="w-16">Tier</span></div>}
                {isFloodMode
                  ? filteredAlerts.map((alert, i) => <div key={i} onClick={() => { setSelectedAlert(i); setCurrentScreen("o2"); }}><AlertRowCompact {...alert} /></div>)
                  : filteredAlerts.map((alert, i) => <div key={i} onClick={() => { setSelectedAlert(i); setCurrentScreen("o2"); }}><AlertCard {...alert} selected={selectedAlert === i} /></div>)
                }
                {filteredAlerts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 rounded-full bg-tier-1/10 flex items-center justify-center mb-3"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-tier-1"><polyline points="20 6 9 17 4 12" /></svg></div>
                    <h3 className="text-sm font-medium text-foreground">All clear</h3>
                    <p className="text-xs text-muted-foreground mt-1">No active alerts matching your filter.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="w-80 flex flex-col bg-card border-l border-border shrink-0">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-4 pt-5 pb-3 border-b border-border">
                  <div className="flex items-center justify-between"><h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Autonomous Resolutions</h2><Badge className="bg-tier-1/10
  text-tier-1 border-tier-1/20 text-[10px] px-1.5 py-0">3 this shift</Badge></div>
                  <p className="text-[11px] text-muted-foreground mt-1">Resolved without operator intervention</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">{autoResolutions.map((res, i) => <AutoResolutionEntry key={i} {...res} isExpanded={expandedResolution === i} onToggle={() =>
  setExpandedResolution(expandedResolution === i ? null : i)} />)}</div>
              </div>
              <div className="border-t border-border p-4 pb-14 bg-background/50">
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Shift Summary</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-[10px] text-muted-foreground uppercase">Active / Resolved</p><p className="text-lg font-bold text-foreground mt-0.5">{filteredAlerts.length} <span 
  className="text-muted-foreground font-normal text-xs">/ 14</span></p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase">Avg Resolution</p><div className="flex items-baseline gap-1 mt-0.5"><p className="text-lg font-bold
  text-foreground">8.2m</p><span className="text-[10px] font-medium text-confidence-high">↓ 34%</span></div></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase">Knowledge Captured</p><p className="text-lg font-bold text-foreground mt-0.5">12 <span className="text-muted-foreground
  font-normal text-xs">items</span></p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase">Autonomy Coverage</p><div className="flex items-baseline gap-1 mt-0.5"><p className="text-lg font-bold
  text-foreground">34%</p><span className="text-[10px] font-medium text-confidence-high">↑ 2%</span></div></div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════ O-2: Alert Context Panel ═══════════════ */}
        {currentScreen === "o2" && <AlertContextPanel onBack={() => setCurrentScreen("o1")} onBeginInvestigation={() => setCurrentScreen("o3")} />}

        {/* ═══════════════ O-3: Active Investigation ═══════════════ */}
        {currentScreen === "o3" && <ActiveInvestigation onBack={() => setCurrentScreen("o2")} onExecutionReady={() => setCurrentScreen("o4")} />}

        {/* ═══════════════ O-4: Execution Decision ═══════════════ */}
        {currentScreen === "o4" && <ExecutionDecisionScreen onBack={() => setCurrentScreen("o3")} onApprove={() => setCurrentScreen("o5")} />}

        {/* ═══════════════ O-5: Post-Resolution Capture ═══════════════ */}
        {currentScreen === "o5" && <PostResolutionScreen onBack={() => setCurrentScreen("o4")} onComplete={() => setCurrentScreen("o6")} />}

        {/* ═══════════════ O-6: Knowledge Confirmation ═══════════════ */}
        {currentScreen === "o6" && <KnowledgeConfirmationScreen onReturn={() => setCurrentScreen("o1")} />}

        {/* ═══════════════ KNOWLEDGE AREA ═══════════════ */}
        {currentScreen.startsWith("k") && (
          <>
            <SubNav
              items={[
                { id: "k1", label: "Knowledge Base" },
                { id: "k2", label: "Item Detail" },
                { id: "k3", label: "Validation Queue" },
                { id: "k4", label: "Ingestion Sources" },
              ]}
              active={currentScreen}
              onSelect={(id) => setCurrentScreen(id as typeof currentScreen)}
            />
            {currentScreen === "k1" && <KnowledgeBrowser />}
            {currentScreen === "k2" && <KnowledgeItemDetail onBack={() => setCurrentScreen("k1")} />}
            {currentScreen === "k3" && <ValidationQueue />}
            {currentScreen === "k4" && <IngestionSources />}
          </>
        )}

        {/* ═══════════════ INSIGHTS AREA ═══════════════ */}
        {currentScreen.startsWith("i") && (
          <>
            <SubNav
              items={[
                { id: "i1", label: "Autonomy Dashboard" },
                { id: "i2", label: "Business Impact" },
                { id: "i3", label: "Bootstrap Status" },
              ]}
              active={currentScreen}
              onSelect={(id) => setCurrentScreen(id as typeof currentScreen)}
            />
            {currentScreen === "i1" && <AutonomyDashboard />}
            {currentScreen === "i2" && <BusinessImpact />}
            {currentScreen === "i3" && <BootstrapStatus />}
          </>
        )}
        <PersistentStatusBar />
      </div>
    );
  }
