import { algorithmAbstractModels, commonOptimizationModel } from "../data/modelLearningContent";
import MathFormula from "./MathFormula";

import "./ModelLearningPath.css";

const pathSteps = [
  ["A", "通用优化模型", "先看四种算法都在解决什么"],
  ["B", "算法抽象模型", "再看这一种算法如何更新状态"],
  ["C", "具体例子模型", "把 x、f、Ω 换成本页真实含义"],
  ["D", "公式对应代码", "最后把符号映射到 Python 变量"],
];

function LayerHeading({ marker, title, description, id }) {
  return (
    <header className="model-layer-heading">
      <span>{marker}</span>
      <div>
        <h3 id={id}>{title}</h3>
        <p>{description}</p>
      </div>
    </header>
  );
}

function FormulaStatement({ statement }) {
  return (
    <article className="model-statement">
      <h4>{statement.title}</h4>
      <MathFormula latex={statement.latex} label={statement.title} />
      {statement.constraints?.map((constraint) => (
        <MathFormula
          className="model-statement-constraint"
          latex={constraint}
          key={constraint}
          label={`${statement.title}的约束`}
        />
      ))}
      <p>{statement.plain}</p>
    </article>
  );
}

function UniversalLayer({ lessonId }) {
  const model = commonOptimizationModel;

  return (
    <section className="model-layer" aria-labelledby={`${lessonId}-universal-model-title`}>
      <LayerHeading
        marker="A"
        title="先看所有启发式算法的共同骨架"
        description="共同的是优化任务与循环，不同的是每种算法自己的更新规则。"
        id={`${lessonId}-universal-model-title`}
      />

      <aside className="model-verdict">
        <strong>先给结论</strong>
        <p>{model.verdict}</p>
      </aside>

      <div className="model-foundation">
        <FormulaStatement statement={model.problem} />
        <FormulaStatement statement={model.state} />
        <FormulaStatement statement={model.best} />
      </div>

      <div className="common-symbols">
        <h4>先认识六个通用符号</h4>
        <div role="table" aria-label="启发式算法通用符号">
          {model.symbols.map(({ symbol, name, meaning }) => (
            <div role="row" key={symbol}>
              <div role="cell"><MathFormula latex={symbol} inline label={name} /></div>
              <div role="cell"><strong>{name}</strong><span>{meaning}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="model-cycle">
        <h4>任何一个启发式算法，都可以用这七步阅读</h4>
        <ol>
          {model.cycle.map(([title, description], index) => (
            <li key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{title}</strong>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function AbstractAlgorithmLayer({ lesson, model }) {
  return (
    <section className="model-layer" aria-labelledby={`${lesson.id}-abstract-model-title`}>
      <LayerHeading
        marker="B"
        title={`${lesson.title}的抽象更新模型`}
        description={model.question}
        id={`${lesson.id}-abstract-model-title`}
      />

      <div className="algorithm-state-line">
        <div>
          <span>这一算法在第 t 轮保存的状态</span>
          <MathFormula latex={model.stateLatex} label={`${lesson.title}的搜索状态`} />
        </div>
        <p>{model.statePlain}</p>
      </div>

      <ol className="abstract-update-list">
        {model.updates.map(({ title, latex, plain }, index) => (
          <li key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h4>{title}</h4>
              <p>{plain}</p>
            </div>
            <MathFormula latex={latex} label={`${title}公式`} />
          </li>
        ))}
      </ol>

      <aside className="model-implementation-note">
        <strong>本页采用的具体版本</strong>
        <p>{model.implementationNote}</p>
      </aside>
    </section>
  );
}

function ConcreteExampleLayer({ lesson, model }) {
  return (
    <section className="model-layer" aria-labelledby={`${lesson.id}-concrete-model-title`}>
      <LayerHeading
        marker="C"
        title="把抽象符号落到本页具体例子"
        description="现在才把通用的 x、f(x)、Ω 换成背包、路线或坐标。"
        id={`${lesson.id}-concrete-model-title`}
      />

      <div className="concrete-model-grid">
        <div className="concrete-formula-area">
          <span>本页示例模型</span>
          <h4>{lesson.optimizationModel.title}</h4>
          <MathFormula latex={lesson.optimizationModel.latex} label={lesson.optimizationModel.title} />
          <div className="concrete-constraints">
            <strong>约束条件</strong>
            {lesson.optimizationModel.subjectTo.map((constraint) => (
              <MathFormula latex={constraint} key={constraint} label="示例约束条件" />
            ))}
          </div>
          <p>{lesson.optimizationModel.plain}</p>
        </div>

        <div className="abstract-to-example">
          <h4>抽象概念 → 本页含义</h4>
          <dl>
            {model.bridge.map(([term, meaning]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="example-symbols">
        <h4>本页后面会用到的符号</h4>
        <div role="table" aria-label={`${lesson.title}示例变量解释`}>
          {lesson.variables.map(({ symbol, meaning, example }) => (
            <div role="row" key={symbol}>
              <div role="cell"><MathFormula latex={symbol} inline label={symbol} /></div>
              <div role="cell"><strong>{meaning}</strong><span>{example}</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PythonBridgeLayer({ lesson, model }) {
  return (
    <section className="model-layer" aria-labelledby={`${lesson.id}-python-map-title`}>
      <LayerHeading
        marker="D"
        title="从数学公式走到 Python 变量"
        description="先认出符号在代码里叫什么，再去读后面的完整主循环。"
        id={`${lesson.id}-python-map-title`}
      />

      <div className="formula-code-map" role="table" aria-label={`${lesson.title}公式与 Python 对应表`}>
        <div className="formula-code-map__header" role="row">
          <span role="columnheader">数学符号</span>
          <span role="columnheader">在算法中表示</span>
          <span role="columnheader">Python 中对应</span>
        </div>
        {model.codeMap.map(({ math, meaning, code }) => (
          <div className="formula-code-map__row" role="row" key={`${math}-${code}`}>
            <div role="cell"><MathFormula latex={math} inline label={meaning} /></div>
            <div role="cell">{meaning}</div>
            <div role="cell"><code>{code}</code></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ModelLearningPath({ lesson }) {
  const model = algorithmAbstractModels[lesson.id];

  if (!model) return null;

  return (
    <div className="model-learning-path" data-testid={`model-learning-path-${lesson.id}`}>
      <ol className="model-path-index" aria-label="数学模型学习顺序">
        {pathSteps.map(([marker, title, description]) => (
          <li key={marker}>
            <span>{marker}</span>
            <div><strong>{title}</strong><small>{description}</small></div>
          </li>
        ))}
      </ol>

      <UniversalLayer lessonId={lesson.id} />
      <AbstractAlgorithmLayer lesson={lesson} model={model} />
      <ConcreteExampleLayer lesson={lesson} model={model} />
      <PythonBridgeLayer lesson={lesson} model={model} />
    </div>
  );
}
