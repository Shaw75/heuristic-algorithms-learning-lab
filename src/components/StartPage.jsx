import ArrowRight from "lucide-react/dist/esm/icons/arrow-right.mjs";
import Check from "lucide-react/dist/esm/icons/check.mjs";

const sharedQuestions = [
  ["解是什么？", "先决定一个候选方案怎样写成数字、向量、排列或 0/1 串。"],
  ["好坏怎么算？", "用目标函数 f(x) 把“更好”变成可以比较的数字。"],
  ["下一步怎么找？", "根据当前解和群体经验，生成或移动到新的候选解。"],
  ["什么时候停？", "达到迭代次数、目标精度，或长时间没有明显改进。"],
];

const learningOrder = [
  ["ga", "遗传算法", "先理解编码、评价、选择和随机变化。"],
  ["pso", "粒子群算法", "用一条速度公式把变量和移动对应起来。"],
  ["aco", "蚁群算法", "学习如何在图上一步步构造一条完整路径。"],
  ["wpa", "狼群算法", "理解探寻、靠近与局部围攻三个搜索阶段。"],
];

export default function StartPage() {
  return (
    <article className="start-page page-content" data-testid="start-page">
      <header className="start-intro">
        <h1>先学会把现实问题<br />翻译成优化问题</h1>
        <p>
          这四种算法的故事不同，但数学任务相同：在许多候选解中，持续寻找让目标函数更好的那个解。
          先掌握共同语言，再进入每个算法的独立页面。
        </p>
        <a className="primary-link" href="#/ga">
          从遗传算法开始
          <ArrowRight aria-hidden="true" />
        </a>
      </header>

      <section className="shared-model" aria-labelledby="shared-model-title">
        <header className="section-title-row">
          <span>00</span>
          <div>
            <h2 id="shared-model-title">所有启发式算法都在回答四个问题</h2>
            <p>看到任何新算法时，先用这四问拆解它。</p>
          </div>
        </header>
        <div className="shared-question-rail">
          {sharedQuestions.map(([title, description], index) => (
            <div key={title}>
              <span>{index + 1}</span>
              <strong>{title}</strong>
              <p>{description}</p>
            </div>
          ))}
        </div>
        <div className="common-equation" aria-label="共同优化模型">
          <span>候选解</span>
          <b>x</b>
          <i>→</i>
          <span>评价好坏</span>
          <b>f(x)</b>
          <i>→</i>
          <span>产生新解</span>
          <b>x′</b>
          <i>→</i>
          <span>保留更好结果</span>
        </div>
      </section>

      <section className="learning-order" aria-labelledby="learning-order-title">
        <header className="section-title-row">
          <span>01</span>
          <div>
            <h2 id="learning-order-title">新手推荐顺序</h2>
            <p>顺序不是按算法强弱，而是按概念的理解难度安排。</p>
          </div>
        </header>
        <ol>
          {learningOrder.map(([id, title, description], index) => (
            <li key={id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <a href={`#/${id}`} aria-label={`学习${title}`}>
                开始学习
                <ArrowRight aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>
      </section>

      <aside className="finish-standard">
        <Check aria-hidden="true" />
        <div>
          <strong>怎样才算学明白？</strong>
          <p>你能不用背公式，解释“解怎样表示、怎样评价、怎样产生下一步”，并能手算一轮小例子。</p>
        </div>
      </aside>
    </article>
  );
}

