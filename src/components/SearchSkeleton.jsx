import ArrowRight from "lucide-react/dist/esm/icons/arrow-right.mjs";

const stages = [
  ["初始化", "生成候选解（种群）"],
  ["评估", "计算目标函数（适应度）"],
  ["选择 / 移动", "依据策略更新候选解"],
  ["迭代", "重复直到满足停止条件"],
];

export default function SearchSkeleton() {
  return (
    <div className="search-skeleton">
      <div className="exploration-cloud" aria-hidden="true">
        {Array.from({ length: 38 }, (_, index) => (
          <i
            key={index}
            style={{
              left: `${12 + ((index * 29) % 76)}%`,
              top: `${10 + ((index * 43) % 78)}%`,
              opacity: 0.35 + (index % 5) * 0.12,
            }}
          />
        ))}
        <strong>探索</strong>
      </div>
      <div className="stage-flow">
        {stages.map(([title, description], index) => (
          <div className="stage-unit" key={title}>
            <div className="stage-box">
              <strong>{title}</strong>
              <span>{description}</span>
            </div>
            {index < stages.length - 1 && <ArrowRight aria-hidden="true" />}
          </div>
        ))}
      </div>
      <div className="exploitation-target" aria-hidden="true">
        {[44, 33, 22, 11].map((size) => (
          <i key={size} style={{ width: size, height: size }} />
        ))}
        <b>★</b>
        <strong>开发</strong>
      </div>
      <div className="balance-line">
        <span />
        <b>在探索与开发之间取得平衡</b>
        <span />
      </div>
    </div>
  );
}
