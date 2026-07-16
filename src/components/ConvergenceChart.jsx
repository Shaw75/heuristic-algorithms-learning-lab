export default function ConvergenceChart({ history, accent, logarithmic = false, label }) {
  const width = 320;
  const height = 112;
  const padding = 14;
  const transformed = history.map((value) =>
    logarithmic ? Math.log10(Math.max(value, 1e-14)) : value,
  );
  const min = Math.min(...transformed);
  const max = Math.max(...transformed);
  const range = Math.max(max - min, Number.EPSILON);
  const points = transformed
    .map((value, index) => {
      const x = padding + (index / Math.max(transformed.length - 1, 1)) * (width - padding * 2);
      const y = padding + ((max - value) / range) * (height - padding * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <div className="convergence-chart">
      <div>
        <strong>历史最好</strong>
        <span>{label}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`历史最好收敛曲线：${label}`}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} />
        <polyline points={points} fill="none" stroke={accent} strokeWidth="3" />
        {points && (
          <circle
            cx={points.split(" ").at(-1).split(",")[0]}
            cy={points.split(" ").at(-1).split(",")[1]}
            r="4"
            fill={accent}
          />
        )}
      </svg>
    </div>
  );
}
