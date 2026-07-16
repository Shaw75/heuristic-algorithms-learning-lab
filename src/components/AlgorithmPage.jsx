import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left.mjs";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right.mjs";
import Download from "lucide-react/dist/esm/icons/download.mjs";
import Lightbulb from "lucide-react/dist/esm/icons/lightbulb.mjs";

import CodePanel from "./CodePanel";
import MathFormula from "./MathFormula";
import MathModelLab from "./MathModelLab";
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

function WorkedExample({ example }) {
  return (
    <section className="worked-example" aria-labelledby="worked-example-title">
      <SectionHeading
        number="02"
        title={example.title}
        description="跟着数字一步一步算，不跳过中间过程。"
        id="worked-example-title"
      />
      <dl className="example-inputs">
        {example.input.map(({ label, value }) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}
      </dl>
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
          title="把实际问题翻译成数学模型"
          description="先明确候选解 x、目标函数 f(x) 和约束，再谈算法怎样搜索。"
          id={`${lesson.id}-model-title`}
        />
        <div className="optimization-model">
          <div className="model-formula-area">
            <h3>{lesson.optimizationModel.title}</h3>
            <MathFormula latex={lesson.optimizationModel.latex} label={lesson.optimizationModel.title} />
            <div className="subject-to">
              <span>约束条件</span>
              {lesson.optimizationModel.subjectTo.map((constraint) => (
                <MathFormula latex={constraint} key={constraint} label="约束条件" />
              ))}
            </div>
            <p>{lesson.optimizationModel.plain}</p>
          </div>
          <div className="symbol-legend">
            <h3>把每个符号换成普通话</h3>
            <div role="table" aria-label={`${lesson.title}变量解释`}>
              {lesson.variables.map(({ symbol, meaning, example }) => (
                <div role="row" key={symbol}>
                  <div role="cell"><MathFormula latex={symbol} inline label={symbol} /></div>
                  <div role="cell"><strong>{meaning}</strong><span>{example}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <WorkedExample example={lesson.workedExample} />

      <section className="mechanism-section" aria-labelledby={`${lesson.id}-mechanism-title`}>
        <SectionHeading
          number="03"
          title="看懂一轮搜索怎样发生"
          description="每一步都回答两件事：做什么，以及为什么这样做。"
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
          title="拖动变量，让公式现场算给你看"
          description="先改一个参数，观察中间项和最终结果如何联动。"
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
          title="把核心公式逐项拆开"
          description="不要求背诵；只要能说出每一项把搜索往哪里推。"
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
