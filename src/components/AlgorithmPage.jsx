import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left.mjs";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right.mjs";
import Download from "lucide-react/dist/esm/icons/download.mjs";
import Lightbulb from "lucide-react/dist/esm/icons/lightbulb.mjs";

import CodePanel from "./CodePanel";
import MathFormula from "./MathFormula";
import MathModelLab from "./MathModelLab";
import ModelLearningPath from "./ModelLearningPath";
import QuizCheck from "./QuizCheck";
import SimulationPanel from "./SimulationPanel";

function SectionHeading({ number, title, description, id }) {
  return (
    <header className="section-title-row">
      <span>{number}</span>
      <div>
        <h2 id={id}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </header>
  );
}

function formatTuple(values) {
  return `(${values.join(", ")})`;
}

function decodeParent(items, key) {
  return items
    .filter((item) => item[key] === 1)
    .map((item) => item.name)
    .join("、");
}

function ExampleEncodingGuide({ guide }) {
  const weights = guide.items.map((item) => item.weight);
  const values = guide.items.map((item) => item.value);
  const parentA = guide.items.map((item) => item.parentA);
  const parentB = guide.items.map((item) => item.parentB);
  const parentACode = parentA.join("");
  const parentBCode = parentB.join("");

  return (
    <section className="encoding-guide" aria-labelledby="encoding-guide-title">
      <header className="encoding-guide__header">
        <div>
          <h3 id="encoding-guide-title">先固定顺序：数组第 i 位对应哪件物品？</h3>
          <p>
            从左到右始终是同一顺序。重量、价值和染色体在相同位置上的数字，描述的是同一件物品；
            这里按数学下标从 1 开始。
          </p>
        </div>
        <dl className="encoding-guide__legend" aria-label="背包容量与二进制含义">
          <div><dt>容量</dt><dd>C = {guide.capacity} kg</dd></div>
          <div><dt>编码</dt><dd><b>1</b> = 选择，<b>0</b> = 不选择</dd></div>
        </dl>
      </header>

      <dl className="encoding-guide__arrays" aria-label="背包示例输入数组">
        <div>
          <dt>固定物品顺序</dt>
          <dd>{guide.items.map((item) => item.name).join(" → ")}</dd>
        </div>
        <div><dt>重量数组</dt><dd><code>w = {formatTuple(weights)}</code></dd></div>
        <div><dt>价值数组</dt><dd><code>v = {formatTuple(values)}</code></dd></div>
      </dl>

      <ol className="encoding-guide__items" aria-label="数组位置与物品对应关系">
        {guide.items.map((item, index) => (
          <li key={item.name}>
            <header><span>第 {index + 1} 位</span><strong>{item.name}</strong></header>
            <dl>
              <div><dt>重量</dt><dd><MathFormula latex={`w_${index + 1}=${item.weight}`} inline label={`${item.name}重量`} /> kg</dd></div>
              <div><dt>价值</dt><dd><MathFormula latex={`v_${index + 1}=${item.value}`} inline label={`${item.name}价值`} /> 分</dd></div>
            </dl>
            <div className="encoding-guide__bits">
              <span data-selected={item.parentA === 1}><small>父代 A</small><b>{item.parentA}</b><em>{item.parentA === 1 ? "选择" : "不选"}</em></span>
              <span data-selected={item.parentB === 1}><small>父代 B</small><b>{item.parentB}</b><em>{item.parentB === 1 ? "选择" : "不选"}</em></span>
            </div>
          </li>
        ))}
      </ol>

      <dl className="encoding-guide__decoded" aria-label="两位父代解码结果">
        <div><dt><code>A = {parentACode}</code></dt><dd>选择：{decodeParent(guide.items, "parentA")}</dd></div>
        <div><dt><code>B = {parentBCode}</code></dt><dd>选择：{decodeParent(guide.items, "parentB")}</dd></div>
      </dl>
      <p className="encoding-guide__note">本例的价值是人为设定的教学效用分；遗传算法负责寻找总价值最大的组合，不负责定义这些分数。</p>
    </section>
  );
}

function WorkedExample({ example }) {
  return (
    <section className="worked-example" aria-labelledby="worked-example-title">
      <SectionHeading
        number="02"
        title={example.title}
        description="跟着数字一步一步算，不跳过中间过程。"
        id="worked-example-title"
      />
      {example.encodingGuide ? (
        <ExampleEncodingGuide guide={example.encodingGuide} />
      ) : (
        <dl className="example-inputs">
          {example.input.map(({ label, value }) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
      )}
      <ol className="calculation-steps">
        {example.steps.map(({ label, latex, explanation }, index) => (
          <li key={label}>
            <span>{index + 1}</span>
            <div>
              <h3>{label}</h3>
              <MathFormula latex={latex} label={`${label}的计算式`} />
              <p>{explanation}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="example-conclusion"><strong>这一轮说明了什么？</strong>{example.conclusion}</p>
    </section>
  );
}

function FormulaBreakdown({ formula, index }) {
  return (
    <article className="formula-breakdown">
      <header><span>{String(index + 1).padStart(2, "0")}</span><h3>{formula.title}</h3></header>
      <MathFormula latex={formula.latex} label={formula.title} />
      <p>{formula.plain}</p>
      <dl>
        {formula.termBreakdown.map(({ term, meaning }) => (
          <div key={term}>
            <dt><MathFormula latex={term} inline label={term} /></dt>
            <dd>{meaning}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export default function AlgorithmPage({ lesson, previousLesson, nextLesson }) {
  const previousTarget = previousLesson
    ? { href: `#/${previousLesson.id}`, label: previousLesson.title }
    : { href: "#/start", label: "学习起点" };
  const nextTarget = nextLesson
    ? { href: `#/${nextLesson.id}`, label: nextLesson.title }
    : { href: "#/choice", label: "算法选择" };
  const exampleHref = `.${lesson.codeFile}`;

  return (
    <article
      className="algorithm-page page-content"
      style={{ "--accent": lesson.accent }}
      data-testid={`lesson-${lesson.id}`}
    >
      <header className="algorithm-intro">
        <div className="algorithm-title-block">
          <span className="algorithm-number">{lesson.number}</span>
          <div>
            <h1>{lesson.title} <em>{lesson.short}</em></h1>
            <p>{lesson.subtitle}</p>
          </div>
        </div>
        <dl className="lesson-meta">
          <div><dt>示例问题</dt><dd>{lesson.problem}</dd></div>
          <div><dt>学习难度</dt><dd>{lesson.difficulty}</dd></div>
          <div><dt>建议时间</dt><dd>{lesson.estimatedMinutes} 分钟</dd></div>
        </dl>
        <ol className="learning-goals" aria-label="本页学习目标">
          {lesson.learningGoals.map((goal, index) => (
            <li key={goal}><span>{index + 1}</span><p>{goal}</p></li>
          ))}
        </ol>
      </header>

      <section className="intuition-section" aria-labelledby={`${lesson.id}-intuition-title`}>
        <div>
          <span>先抓住直觉</span>
          <h2 id={`${lesson.id}-intuition-title`}>如果暂时忘掉术语，它在做什么？</h2>
        </div>
        <div className="intuition-copy">
          <p>{lesson.story}</p>
          <p><strong>一句话：</strong>{lesson.intuition}</p>
          {lesson.variantNote ? <aside>{lesson.variantNote}</aside> : null}
        </div>
      </section>

      <section className="model-section" aria-labelledby={`${lesson.id}-model-title`}>
        <SectionHeading
          number="01"
          title="从通用优化模型，走到本页具体例子"
          description="按共同问题 → 算法更新 → 具体建模 → Python 映射的顺序，从头建立完整数学链。"
          id={`${lesson.id}-model-title`}
        />
        <ModelLearningPath lesson={lesson} />
      </section>

      <WorkedExample example={lesson.workedExample} />

      <section className="mechanism-section" aria-labelledby={`${lesson.id}-mechanism-title`}>
        <SectionHeading
          number="03"
          title="把抽象更新模型展开成一轮流程"
          description="回到执行顺序，逐步回答做什么、为什么，以及对应哪条公式。"
          id={`${lesson.id}-mechanism-title`}
        />
        <ol className="mechanism-rail">
          {lesson.mechanismSteps.map(({ title, action, why, math }, index) => (
            <li key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div className="mechanism-copy"><h3>{title}</h3><p>{action}</p><small>{why}</small></div>
              <MathFormula latex={math} label={`${title}公式`} />
            </li>
          ))}
        </ol>
      </section>

      <section className="interactive-model-section" aria-labelledby={`${lesson.id}-interactive-title`}>
        <SectionHeading
          number="04"
          title="代入数字，让一个更新算子现场计算"
          description="这里专门放大一条核心更新规则；先改一个参数，再观察中间项与结果。"
          id={`${lesson.id}-interactive-title`}
        />
        <MathModelLab algorithmId={lesson.id} accent={lesson.accent} />
      </section>

      <section className="simulation-section" aria-labelledby={`${lesson.id}-simulation-title`}>
        <SectionHeading
          number="05"
          title="运行完整搜索过程"
          description="观察候选解怎样变化，以及最好目标值是否逐步改善。"
          id={`${lesson.id}-simulation-title`}
        />
        <SimulationPanel lesson={lesson} />
      </section>

      <section className="formula-section" aria-labelledby={`${lesson.id}-formula-title`}>
        <SectionHeading
          number="06"
          title="回看核心公式，检查每一项的作用"
          description="有了完整模型后再复习公式；不要求背诵，只要能解释每一项。"
          id={`${lesson.id}-formula-title`}
        />
        <div className="formula-list">
          {lesson.coreFormulas.map((formula, index) => (
            <FormulaBreakdown formula={formula} index={index} key={formula.title} />
          ))}
        </div>
      </section>

      <section className="practice-section" aria-labelledby={`${lesson.id}-practice-title`}>
        <SectionHeading
          number="07"
          title="框架、参数与常见误区"
          description="把数学模型落到实际实现时，最容易在这些位置出错。"
          id={`${lesson.id}-practice-title`}
        />
        <div className="framework-and-parameters">
          <div className="framework-block">
            <h3>{lesson.framework.title}</h3>
            <ol>
              {lesson.framework.steps.map(({ label, action }, index) => (
                <li key={label}><span>{index + 1}</span><div><strong>{label}</strong><p>{action}</p></div></li>
              ))}
            </ol>
          </div>
          <div className="parameter-block">
            <h3>参数变大或变小，会发生什么？</h3>
            <div className="parameter-table-wrap">
              <table>
                <thead><tr><th>参数</th><th>控制什么</th><th>太小</th><th>太大</th></tr></thead>
                <tbody>
                  {lesson.parameters.map(({ symbol, name, effect, tooSmall, tooLarge }) => (
                    <tr key={symbol}>
                      <th scope="row"><MathFormula latex={symbol} inline label={symbol} /><span>{name}</span></th>
                      <td data-label="控制什么">{effect}</td>
                      <td data-label="太小">{tooSmall}</td>
                      <td data-label="太大">{tooLarge}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="mistake-list">
          <h3><Lightbulb aria-hidden="true" />新手最容易混淆的地方</h3>
          {lesson.commonMistakes.map(({ title, wrong, right }, index) => (
            <details key={title} open={index === 0}>
              <summary>{title}</summary>
              <div><p><strong>容易这样想：</strong>{wrong}</p><p><strong>正确理解：</strong>{right}</p></div>
            </details>
          ))}
        </div>
      </section>

      <section className="code-section" aria-labelledby={`${lesson.id}-code-title`}>
        <SectionHeading
          number="08"
          title="把流程对应到 Python"
          description="先沿着框架读主循环，再进入完整示例修改参数。"
          id={`${lesson.id}-code-title`}
        />
        <CodePanel code={lesson.code} />
        <a className="example-download" href={exampleHref} download>
          <Download aria-hidden="true" />
          下载可直接运行的 {lesson.codeFile.split("/").at(-1)}
        </a>
      </section>

      <QuizCheck lessonId={lesson.id} quiz={lesson.quiz} accent={lesson.accent} />

      <nav className="page-pager" aria-label="课程翻页">
        <a href={previousTarget.href}><ArrowLeft aria-hidden="true" /><span>上一页<small>{previousTarget.label}</small></span></a>
        <a href={nextTarget.href}><span>下一页<small>{nextTarget.label}</small></span><ArrowRight aria-hidden="true" /></a>
      </nav>
    </article>
  );
}
