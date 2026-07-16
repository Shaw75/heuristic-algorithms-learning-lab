const trajectories = [
  {
    id: "ga",
    color: "#f34f52",
    label: "遗传算法 (GA)",
    path: "M24 124 C58 68 112 154 162 86 S244 104 286 64",
    nodes: [[24, 124], [72, 91], [118, 132], [162, 86], [214, 105], [286, 64]],
  },
  {
    id: "aco",
    color: "#f58a13",
    label: "蚁群算法 (ACO)",
    path: "M174 142 C230 116 238 78 302 100 S372 78 420 66",
    nodes: [[174, 142], [224, 119], [268, 83], [302, 100], [354, 88], [420, 66]],
  },
  {
    id: "pso",
    color: "#00a7ae",
    label: "粒子群算法 (PSO)",
    path: "M250 162 C302 122 338 144 370 94 S448 68 504 78",
    nodes: [[250, 162], [302, 124], [338, 142], [370, 94], [430, 73], [504, 78]],
  },
  {
    id: "wpa",
    color: "#8247e5",
    label: "狼群算法 (WPA)",
    path: "M344 172 C388 124 420 150 454 112 S520 98 560 76",
    nodes: [[344, 172], [392, 126], [424, 148], [454, 112], [510, 102], [560, 76]],
  },
];

export default function HeroTrajectory() {
  return (
    <div className="hero-visual" aria-label="四种算法从不同起点搜索同一个目标">
      <div className="trajectory-legend" aria-hidden="true">
        {trajectories.map((trajectory) => (
          <span key={trajectory.id}>
            <i style={{ background: trajectory.color }} />
            {trajectory.label}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 620 210" role="img" aria-label="四条彩色搜索轨迹逐渐靠近最优目标">
        <g className="contours" aria-hidden="true">
          {[18, 30, 43, 58, 74].map((radius) => (
            <ellipse key={radius} cx="572" cy="76" rx={radius} ry={radius * 0.58} />
          ))}
          <line x1="548" x2="598" y1="76" y2="76" />
          <line x1="572" x2="572" y1="48" y2="104" />
        </g>
        {trajectories.map((trajectory) => (
          <g key={trajectory.id} style={{ color: trajectory.color }}>
            <path className="trajectory-path" d={trajectory.path} />
            {trajectory.nodes.map(([x, y], index) => (
              <circle
                className="trajectory-node"
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r={index === trajectory.nodes.length - 1 ? 4.5 : 3.3}
              />
            ))}
          </g>
        ))}
        <path className="target-star" d="M572 64l3.6 7.4 8.2 1.2-5.9 5.7 1.4 8.1-7.3-3.8-7.3 3.8 1.4-8.1-5.9-5.7 8.2-1.2z" />
      </svg>
    </div>
  );
}
