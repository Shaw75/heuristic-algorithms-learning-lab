import ArrowRight from "lucide-react/dist/esm/icons/arrow-right.mjs";

const rows = [
  ["GA", "遗传算法", "0/1 串、排列、混合编码", "选择、交叉、变异", "组合优化、调度、特征选择", "编码灵活，但参数与算子设计较多", "ga"],
  ["ACO", "蚁群算法", "逐步构造的路径", "信息素 + 距离启发", "TSP、路径规划、网络路由", "擅长路径，正反馈过强会早熟", "aco"],
  ["PSO", "粒子群算法", "连续坐标向量", "pbest + gbest + 速度", "连续函数、参数调优", "公式最简洁，适合作为连续优化入门", "pso"],
  ["WPA", "狼群算法", "连续坐标向量", "探寻、召唤、围攻", "连续黑箱优化", "阶段直观，但不同论文版本差异较大", "wpa"],
];

export default function ChoicePage() {
  return (
    <article className="choice-page page-content" data-testid="choice-page">
      <header className="choice-intro">
        <h1>按问题结构选算法，<br />不要只看名字</h1>
        <p>先判断解是“组合/路径”还是“连续坐标”，再看你希望算法怎样传递经验。</p>
      </header>

      <section className="decision-path" aria-labelledby="decision-title">
        <header className="section-title-row">
          <span>01</span>
          <div><h2 id="decision-title">一分钟选择法</h2><p>这是入门时的首选建议，不是绝对规则。</p></div>
        </header>
        <div className="decision-tree">
          <div><strong>你的解是什么形式？</strong><p>先看变量，不要先看算法热度。</p></div>
          <div><span>0/1、排列或混合编码</span><a href="#/ga">先试 GA <ArrowRight aria-hidden="true" /></a></div>
          <div><span>需要逐个城市构造路线</span><a href="#/aco">先试 ACO <ArrowRight aria-hidden="true" /></a></div>
          <div><span>连续参数向量</span><a href="#/pso">先试 PSO <ArrowRight aria-hidden="true" /></a></div>
          <div><span>想研究分阶段群体搜索</span><a href="#/wpa">再看 WPA <ArrowRight aria-hidden="true" /></a></div>
        </div>
      </section>

      <section className="comparison-section" aria-labelledby="comparison-title">
        <header className="section-title-row">
          <span>02</span>
          <div><h2 id="comparison-title">把四种算法放在一张表里</h2><p>横向比较“解、更新方式、场景和代价”。</p></div>
        </header>
        <div className="comparison-table-wrap">
          <table>
            <thead>
              <tr><th>算法</th><th>解的表示</th><th>经验如何传递</th><th>典型场景</th><th>新手要注意</th></tr>
            </thead>
            <tbody>
              {rows.map(([short, name, representation, update, scenario, caution, id]) => (
                <tr key={id}>
                  <th scope="row"><a href={`#/${id}`}><b>{short}</b><span>{name}</span></a></th>
                  <td data-label="解的表示">{representation}</td>
                  <td data-label="经验传递">{update}</td>
                  <td data-label="典型场景">{scenario}</td>
                  <td data-label="新手注意">{caution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
