"use client";

import {
  DCASScores,
  dcasColors as defaultDcasColors,
  defaultDCASNames,
  DCASType,
  defaultDCASSymbols,
  getScoreLevel,
} from "@/lib/dcas/scoring";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface DCASChartProps {
  scores: DCASScores;
  colors?: Record<DCASType, { primary: string; light: string; bg: string }>;
  names?: Record<DCASType, string>;
  symbols?: Record<DCASType, string>;
}

export function DCASBarChart({
  scores,
  colors = defaultDcasColors,
  names = defaultDCASNames,
  symbols = defaultDCASSymbols,
  maxScore = 30,
}: DCASChartProps & { maxScore?: number }) {
  const data = [
    {
      name: names.D,
      value: scores.D,
      color: colors.D.primary,
      shortName: symbols.D,
    },
    {
      name: names.C,
      value: scores.C,
      color: colors.C.primary,
      shortName: symbols.C,
    },
    {
      name: names.A,
      value: scores.A,
      color: colors.A.primary,
      shortName: symbols.A,
    },
    {
      name: names.S,
      value: scores.S,
      color: colors.S.primary,
      shortName: symbols.S,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="shortName"
          className="fill-muted-foreground text-sm"
          tick={{ fill: "currentColor" }}
        />
        <YAxis
          domain={[0, maxScore]}
          className="fill-muted-foreground text-sm"
          tick={{ fill: "currentColor" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
          formatter={(value, name) => [value ?? 0, name]}
          labelFormatter={(label) => {
            const item = data.find((d) => d.shortName === label);
            return item?.name || label;
          }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={80}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DCASRadarChart({
  scores,
  colors = defaultDcasColors,
  names = defaultDCASNames,
  symbols = defaultDCASSymbols,
  maxScore = 30,
}: DCASChartProps & { maxScore?: number }) {
  const data = [
    {
      subject: symbols.D,
      fullName: names.D,
      value: scores.D,
      fullMark: maxScore,
      color: colors.D.primary,
    },
    {
      subject: symbols.C,
      fullName: names.C,
      value: scores.C,
      fullMark: maxScore,
      color: colors.C.primary,
    },
    {
      subject: symbols.A,
      fullName: names.A,
      value: scores.A,
      fullMark: maxScore,
      color: colors.A.primary,
    },
    {
      subject: symbols.S,
      fullName: names.S,
      value: scores.S,
      fullMark: maxScore,
      color: colors.S.primary,
    },
  ];

  const CustomTick = ({
    payload,
    x = 0,
    y = 0,
    textAnchor,
  }: {
    payload: { value: string };
    x?: number | string;
    y?: number | string;
    textAnchor?: "inherit" | "end" | "start" | "middle";
  }) => {
    const item = data.find((d) => d.subject === payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          textAnchor={textAnchor}
          fill={item?.color || "currentColor"}
          fontSize={14}
          fontWeight="bold"
          dy={4}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-48 w-48 rounded-full bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-2xl" />
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
              <stop
                offset="0%"
                stopColor={colors.D.primary}
                stopOpacity={0.8}
              />
              <stop
                offset="33%"
                stopColor={colors.C.primary}
                stopOpacity={0.8}
              />
              <stop
                offset="66%"
                stopColor={colors.A.primary}
                stopOpacity={0.8}
              />
              <stop
                offset="100%"
                stopColor={colors.S.primary}
                stopOpacity={0.8}
              />
            </linearGradient>
            <linearGradient id="radarFillGradient" x1="0" y1="0" x2="1" y2="1">
              <stop
                offset="0%"
                stopColor={colors.D.primary}
                stopOpacity={0.3}
              />
              <stop
                offset="33%"
                stopColor={colors.C.primary}
                stopOpacity={0.3}
              />
              <stop
                offset="66%"
                stopColor={colors.A.primary}
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor={colors.S.primary}
                stopOpacity={0.3}
              />
            </linearGradient>
          </defs>
          <PolarGrid
            stroke="hsl(var(--muted-foreground))"
            strokeOpacity={0.2}
            radialLines={true}
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={(props) => <CustomTick {...props} />}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, maxScore]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            tickCount={4}
            axisLine={false}
          />
          <Radar
            name="DCAS Profile"
            dataKey="value"
            stroke="url(#radarGradient)"
            fill="url(#radarFillGradient)"
            strokeWidth={3}
            dot={{
              r: 6,
              fill: "hsl(var(--card))",
              stroke: "url(#radarGradient)",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 8,
              fill: "hsl(var(--primary))",
              stroke: "hsl(var(--card))",
              strokeWidth: 2,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              color: "hsl(var(--foreground))",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              padding: "12px 16px",
            }}
            formatter={(value, _name, props) => {
              const numValue = typeof value === "number" ? value : 0;
              const percentage = Math.round((numValue / maxScore) * 100);
              const payload = (props as any).payload;
              return [
                `${numValue} / ${maxScore} (${percentage}%)`,
                payload?.fullName || "",
              ];
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap justify-center gap-4">
        {data.map((item) => (
          <div key={item.subject} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground text-xs">
              {item.fullName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ScoreCardProps {
  type: "D" | "C" | "A" | "S";
  score: number;
  maxScore?: number;
  colors?: Record<DCASType, { primary: string; light: string; bg: string }>;
  names?: Record<DCASType, string>;
  symbols?: Record<DCASType, string>;
}

export function ScoreCard({
  type,
  score,
  maxScore = 30,
  colors = defaultDcasColors,
  names = defaultDCASNames,
  symbols = defaultDCASSymbols,
}: ScoreCardProps) {
  const config = { ...colors[type], name: names[type] };
  const percentage = (score / maxScore) * 100;

  /* 
    Import getScoreLevel at the top of file if not already imported. 
    It is not in the diff context, so I must start from line 1 or check imports first.
    I will assume I need to add it to the import list.
  */
  const level = getScoreLevel(score, maxScore);
  let levelColor: string;

  if (level === "Low") {
    levelColor = "text-muted-foreground";
  } else if (level === "Moderate") {
    levelColor = "text-amber-500";
  } else {
    levelColor = "text-emerald-500";
  }

  return (
    <div className="bg-card relative overflow-hidden rounded-xl border p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm font-medium">
            {config.name}
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className="text-3xl font-bold"
              style={{ color: config.primary }}
            >
              {score}
            </span>
            <span className="text-muted-foreground text-sm">/ {maxScore}</span>
          </div>
          <p className={`text-sm font-medium ${levelColor}`}>{level}</p>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
          style={{ backgroundColor: config.light }}
        >
          {symbols[type]}
        </div>
      </div>
      <div className="mt-4">
        <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${percentage}%`, backgroundColor: config.primary }}
          />
        </div>
      </div>
      <div
        className="absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-10"
        style={{ backgroundColor: config.primary }}
      />
    </div>
  );
}
