import Braces from "lucide-react/dist/esm/icons/braces.mjs";
import Code2 from "lucide-react/dist/esm/icons/code-2.mjs";
import Workflow from "lucide-react/dist/esm/icons/workflow.mjs";
import { memo, useState } from "react";

import CodePanel from "./CodePanel";
import FormulaPanel from "./FormulaPanel";
import FrameworkTimeline from "./FrameworkTimeline";
import SimulationPanel from "./SimulationPanel";

const tabs = [
  { id: "framework", label: "算法框架", icon: Workflow },
  { id: "formula", label: "公式", icon: Braces },
  { id: "code", label: "Python 代码", icon: Code2 },
];

function LessonSection({ lesson }) {
  const [activeTab, setActiveTab] = useState("framework");

  return (
    <section
      className="lesson-section"
      id={lesson.id}
      data-testid={`lesson-${lesson.id}`}
      style={{ "--accent": lesson.accent }}
    >
      <div className="lesson-heading">
        <span className="lesson-number">{lesson.number}</span>
        <div>
          <p className="eyebrow">{lesson.short} · {lesson.problem}</p>
          <h2>{lesson.title}</h2>
          <p className="lesson-subtitle">{lesson.subtitle}</p>
        </div>
      </div>

      <div className="intuition-line">
        <strong>先抓住直觉</strong>
        <p>{lesson.intuition}</p>
      </div>

      <SimulationPanel lesson={lesson} />

      <div className="lesson-tabs" role="tablist" aria-label={`${lesson.title}学习内容`}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`${lesson.id}-${id}-panel`}
            id={`${lesson.id}-${id}-tab`}
            className={activeTab === id ? "is-active" : ""}
            key={id}
            onClick={() => setActiveTab(id)}
          >
            <Icon aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="study-grid">
        <article
          className={`study-panel framework-card ${activeTab === "framework" ? "is-active" : ""}`}
          id={`${lesson.id}-framework-panel`}
          role="tabpanel"
          aria-labelledby={`${lesson.id}-framework-tab`}
        >
          <header>
            <span>01</span>
            <div><strong>算法框架</strong><small>每一轮到底做什么</small></div>
          </header>
          <FrameworkTimeline steps={lesson.steps} accent={lesson.accent} />
        </article>

        <article
          className={`study-panel formula-card ${activeTab === "formula" ? "is-active" : ""}`}
          id={`${lesson.id}-formula-panel`}
          role="tabpanel"
          aria-labelledby={`${lesson.id}-formula-tab`}
        >
          <header>
            <span>02</span>
            <div><strong>关键公式</strong><small>看懂符号如何控制搜索</small></div>
          </header>
          <FormulaPanel title={lesson.formulaTitle} formulas={lesson.formulas} callout={lesson.callout} />
        </article>

        <article
          className={`study-panel code-card ${activeTab === "code" ? "is-active" : ""}`}
          id={`${lesson.id}-code-panel`}
          role="tabpanel"
          aria-labelledby={`${lesson.id}-code-tab`}
        >
          <header>
            <span>03</span>
            <div><strong>Python 框架</strong><small>把流程和代码对应起来</small></div>
          </header>
          <CodePanel code={lesson.code} />
        </article>
      </div>
    </section>
  );
}

export default memo(LessonSection);
