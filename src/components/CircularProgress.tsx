interface CircularProgressProps {
  value: number;       // 0..100
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  gradient?: "sky" | "peach" | "bloom";
}

const gradients = {
  sky: ["hsl(199 94% 80%)", "hsl(199 89% 58%)"],
  peach: ["hsl(12 100% 88%)", "hsl(6 93% 70%)"],
  bloom: ["hsl(199 94% 80%)", "hsl(6 93% 75%)"],
};

export const CircularProgress = ({
  value, size = 140, stroke = 12, label, sublabel, gradient = "sky",
}: CircularProgressProps) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  const offset = c - (v / 100) * c;
  const id = `cp-${gradient}`;
  const [from, to] = gradients[gradient];

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round" fill="none"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="font-display text-3xl font-bold text-foreground">{label}</span>}
        {sublabel && <span className="text-xs text-muted-foreground mt-1">{sublabel}</span>}
      </div>
    </div>
  );
};
