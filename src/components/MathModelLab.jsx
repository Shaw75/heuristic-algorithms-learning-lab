import { memo, useState } from "react";

import "./MathModelLab.css";

const LAB_META = {
  ga: {
    eyebrow: "轮盘赌选择 · 概率模型",
    title: "适应度越高，被选中复制的机会越大",
    description: "把三个候选解想成三张彩票。适应度不是“必胜分数”，而是它在总票数中占了多少。",
  },
  aco: {
    eyebrow: "路径选择 · 条件概率",
    title: "蚂蚁同时参考经验和眼前距离",
    description: "信息素 τ 代表历史经验，距离的倒数 η=1/d 代表眼前启发。两者先加权相乘，再归一化成概率。",
  },
  pso: {
    eyebrow: "速度更新 · 一维拆解",
    title: "下一步速度，由三股力量相加",
    description: "惯性保留原方向，认知项拉向自己的最好位置，社会项拉向群体最好位置。先更新速度，再更新位置。",
  },
  wpa: {
    eyebrow: "分阶段搜索 · 一维教学模型",
    title: "先向两侧探寻，再靠近头狼，最后局部围攻",
    description: "狼群算法有多种版本。这里把复杂动作压缩到一条数轴上，专门用来理解“全局探索 → 集体靠近 → 局部开发”。",
  },
};

function cleanZero(value) {
  return Math.abs(value) < 0.000_001 ? 0 : value;
}

function fixed(value, digits = 2) {
  return cleanZero(value).toFixed(digits);
}

function compact(value, digits = 2) {
  return Number(fixed(value, digits)).toString();
}

function Slider({ id, label, value, min, max, step, onChange, suffix = "", hint }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const valueText = `${compact(value)}${suffix}`;

  return (
    <div className="math-slider">
      <div className="math-slider__label">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{valueText}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-describedby={hintId}
        aria-valuetext={valueText}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {hint ? <small id={hintId}>{hint}</small> : null}
    </div>
  );
}

function EquationStep({ number, label, children, result }) {
  return (
    <li className="math-equation-step">
      <span aria-hidden="true">{number}</span>
      <div>
        <strong>{label}</strong>
        <p>{children}</p>
      </div>
      <output>{result}</output>
    </li>
  );
}

function ProbabilityBars({ entries }) {
  return (
    <div className="probability-bars" aria-label="归一化后的概率对比">
      {entries.map(({ label, probability, detail }) => (
        <div className="probability-row" key={label}>
          <div>
            <strong>{label}</strong>
            <small>{detail}</small>
          </div>
          <div className="probability-track" aria-hidden="true">
            <i style={{ width: `${probability * 100}%` }} />
          </div>
          <output>{(probability * 100).toFixed(1)}%</output>
        </div>
      ))}
    </div>
  );
}

function NumberLine({ points, label }) {
  const values = points.map((point) => point.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const span = Math.max(rawMax - rawMin, 2);
  const min = rawMin - span * 0.12;
  const max = rawMax + span * 0.12;

  return (
    <div className="number-line" role="img" aria-label={label}>
      <div className="number-line__axis" aria-hidden="true">
        {points.map((point, index) => {
          const position = ((point.value - min) / (max - min)) * 100;
          return (
            <span
              className={`number-line__point number-line__point--${index % 3}`}
              key={`${point.label}-${point.value}`}
              style={{ "--point-position": `${position}%`, "--point-color": point.color }}
            >
              <i />
              <b>{point.label}</b>
              <small>{compact(point.value)}</small>
            </span>
          );
        })}
      </div>
      <div className="number-line__bounds" aria-hidden="true">
        <span>{compact(min)}</span>
        <span>{compact(max)}</span>
      </div>
    </div>
  );
}

function GeneticLab() {
  const [fitnessA, setFitnessA] = useState(2);
  const [fitnessB, setFitnessB] = useState(5);
  const [fitnessC, setFitnessC] = useState(3);
  const values = [fitnessA, fitnessB, fitnessC];
  const total = values.reduce((sum, value) => sum + value, 0);
  const probabilities = values.map((value) => value / total);
  const winner = probabilities.indexOf(Math.max(...probabilities));
  const labels = ["候选解 A", "候选解 B", "候选解 C"];

  return (
    <div className="math-model-layout">
      <fieldset className="math-controls">
        <legend>拖动适应度，观察选择概率</legend>
        <p>先只改变一个候选解，看看它如何“抢走”其他候选解的概率。</p>
        <Slider id="ga-fitness-a" label="候选解 A 的适应度" value={fitnessA} min="1" max="20" step="1" onChange={setFitnessA} />
        <Slider id="ga-fitness-b" label="候选解 B 的适应度" value={fitnessB} min="1" max="20" step="1" onChange={setFitnessB} />
        <Slider id="ga-fitness-c" label="候选解 C 的适应度" value={fitnessC} min="1" max="20" step="1" onChange={setFitnessC} />
      </fieldset>

      <div className="math-workbench">
        <p className="math-main-formula" aria-label="第 i 个个体的选择概率等于它的适应度除以全部个体适应度之和">
          <var>p</var><sub>i</sub> = <var>f</var><sub>i</sub> ÷ Σ<var>f</var>
        </p>
        <ol className="math-equation-list">
          <EquationStep number="1" label="先算总票数" result={`Σf = ${fixed(total, 0)}`}>
            {fixed(fitnessA, 0)} + {fixed(fitnessB, 0)} + {fixed(fitnessC, 0)} = {fixed(total, 0)}
          </EquationStep>
          <EquationStep number="2" label="再除以总票数" result={`pB = ${(probabilities[1] * 100).toFixed(1)}%`}>
            例如 B：{fixed(fitnessB, 0)} ÷ {fixed(total, 0)} = {fixed(probabilities[1], 3)}
          </EquationStep>
        </ol>
        <ProbabilityBars
          entries={labels.map((label, index) => ({
            label,
            probability: probabilities[index],
            detail: `${fixed(values[index], 0)} ÷ ${fixed(total, 0)}`,
          }))}
        />
        <p className="math-result-sentence">
          <span>现在最容易被抽中</span>
          <strong>{labels[winner]} · {(probabilities[winner] * 100).toFixed(1)}%</strong>
          <small>概率高不等于一定被选中，所以种群仍保留随机探索能力。</small>
        </p>
      </div>
    </div>
  );
}

function AntColonyLab() {
  const [tauA, setTauA] = useState(2);
  const [distanceA, setDistanceA] = useState(3);
  const [tauB, setTauB] = useState(1);
  const [distanceB, setDistanceB] = useState(2);
  const [alpha, setAlpha] = useState(1);
  const [beta, setBeta] = useState(2);
  const etaA = 1 / distanceA;
  const etaB = 1 / distanceB;
  const scoreA = tauA ** alpha * etaA ** beta;
  const scoreB = tauB ** alpha * etaB ** beta;
  const totalScore = scoreA + scoreB;
  const probabilityA = scoreA / totalScore;
  const probabilityB = scoreB / totalScore;

  return (
    <div className="math-model-layout math-model-layout--aco">
      <fieldset className="math-controls">
        <legend>设置两条候选边</legend>
        <p>τ 越大代表过去走得好；距离 <var>d</var> 越小，启发值 η=1/<var>d</var> 越大。</p>
        <div className="math-control-group">
          <strong>边 A</strong>
          <Slider id="aco-tau-a" label="边 A 的信息素 τ" value={tauA} min="0.2" max="5" step="0.1" onChange={setTauA} />
          <Slider id="aco-distance-a" label="边 A 的距离 d" value={distanceA} min="1" max="10" step="0.5" onChange={setDistanceA} />
        </div>
        <div className="math-control-group">
          <strong>边 B</strong>
          <Slider id="aco-tau-b" label="边 B 的信息素 τ" value={tauB} min="0.2" max="5" step="0.1" onChange={setTauB} />
          <Slider id="aco-distance-b" label="边 B 的距离 d" value={distanceB} min="1" max="10" step="0.5" onChange={setDistanceB} />
        </div>
        <div className="math-control-pair">
          <Slider id="aco-alpha" label="经验权重 α" value={alpha} min="0" max="4" step="0.1" onChange={setAlpha} hint="α 越大，越信任信息素。" />
          <Slider id="aco-beta" label="距离权重 β" value={beta} min="0" max="5" step="0.1" onChange={setBeta} hint="β 越大，越偏爱近路。" />
        </div>
      </fieldset>

      <div className="math-workbench">
        <p className="math-main-formula" aria-label="选择边 i 的权重等于信息素的 alpha 次方乘以启发值的 beta 次方">
          <var>w</var><sub>i</sub> = τ<sub>i</sub><sup>α</sup> · (1/<var>d</var><sub>i</sub>)<sup>β</sup>
          <span>再做归一化：<var>p</var><sub>i</sub> = <var>w</var><sub>i</sub> ÷ Σ<var>w</var></span>
        </p>
        <ol className="math-equation-list">
          <EquationStep number="1" label="把距离变成启发值" result={`ηA=${fixed(etaA, 3)} · ηB=${fixed(etaB, 3)}`}>
            η<sub>A</sub> = 1 ÷ {fixed(distanceA, 1)}；η<sub>B</sub> = 1 ÷ {fixed(distanceB, 1)}
          </EquationStep>
          <EquationStep number="2" label="计算未归一化权重" result={`wA=${fixed(scoreA, 3)} · wB=${fixed(scoreB, 3)}`}>
            A：{fixed(tauA, 1)}<sup>{fixed(alpha, 1)}</sup> × {fixed(etaA, 3)}<sup>{fixed(beta, 1)}</sup>；B：{fixed(tauB, 1)}<sup>{fixed(alpha, 1)}</sup> × {fixed(etaB, 3)}<sup>{fixed(beta, 1)}</sup>
          </EquationStep>
          <EquationStep number="3" label="除以权重之和" result={`Σw=${fixed(totalScore, 3)}`}>
            <var>p</var><sub>A</sub> = {fixed(scoreA, 3)} ÷ {fixed(totalScore, 3)}；<var>p</var><sub>B</sub> = {fixed(scoreB, 3)} ÷ {fixed(totalScore, 3)}
          </EquationStep>
        </ol>
        <ProbabilityBars
          entries={[
            { label: "选择边 A", probability: probabilityA, detail: `τ=${compact(tauA)} · d=${compact(distanceA)}` },
            { label: "选择边 B", probability: probabilityB, detail: `τ=${compact(tauB)} · d=${compact(distanceB)}` },
          ]}
        />
        <p className="math-result-sentence">
          <span>本次更倾向</span>
          <strong>{probabilityA >= probabilityB ? "边 A" : "边 B"} · {(Math.max(probabilityA, probabilityB) * 100).toFixed(1)}%</strong>
          <small>这仍是概率选择，并非每只蚂蚁都必须走同一条边。</small>
        </p>
      </div>
    </div>
  );
}

function ParticleSwarmLab() {
  const [x, setX] = useState(4);
  const [velocity, setVelocity] = useState(-0.5);
  const [personalBest, setPersonalBest] = useState(2);
  const [globalBest, setGlobalBest] = useState(0);
  const [omega, setOmega] = useState(0.7);
  const [cognitiveWeight, setCognitiveWeight] = useState(1.5);
  const [socialWeight, setSocialWeight] = useState(1.5);
  const randomOne = 0.5;
  const randomTwo = 0.5;
  const inertia = omega * velocity;
  const cognition = cognitiveWeight * randomOne * (personalBest - x);
  const social = socialWeight * randomTwo * (globalBest - x);
  const nextVelocity = inertia + cognition + social;
  const nextPosition = x + nextVelocity;

  return (
    <div className="math-model-layout math-model-layout--pso">
      <fieldset className="math-controls">
        <legend>设置粒子当前状态</legend>
        <p>为便于复算，本实验固定随机数 <var>r</var><sub>1</sub>=<var>r</var><sub>2</sub>=0.5；实际算法每轮会重新采样。</p>
        <div className="math-control-pair">
          <Slider id="pso-x" label="当前位置 x" value={x} min="-10" max="10" step="0.5" onChange={setX} />
          <Slider id="pso-v" label="当前速度 v" value={velocity} min="-5" max="5" step="0.25" onChange={setVelocity} />
          <Slider id="pso-pbest" label="个体最好 pbest" value={personalBest} min="-10" max="10" step="0.5" onChange={setPersonalBest} />
          <Slider id="pso-gbest" label="群体最好 gbest" value={globalBest} min="-10" max="10" step="0.5" onChange={setGlobalBest} />
        </div>
        <div className="math-control-pair math-control-pair--weights">
          <Slider id="pso-omega" label="惯性权重 ω" value={omega} min="0" max="1.2" step="0.1" onChange={setOmega} />
          <Slider id="pso-c1" label="认知系数 c₁" value={cognitiveWeight} min="0" max="3" step="0.1" onChange={setCognitiveWeight} />
          <Slider id="pso-c2" label="社会系数 c₂" value={socialWeight} min="0" max="3" step="0.1" onChange={setSocialWeight} />
        </div>
      </fieldset>

      <div className="math-workbench">
        <p className="math-main-formula math-main-formula--stacked" aria-label="下一时刻速度等于惯性项加认知项加社会项；下一时刻位置等于当前位置加下一时刻速度">
          <span><var>v</var><sub>next</sub> = ω<var>v</var> + <var>c</var><sub>1</sub><var>r</var><sub>1</sub>(<var>pbest</var>−<var>x</var>) + <var>c</var><sub>2</sub><var>r</var><sub>2</sub>(<var>gbest</var>−<var>x</var>)</span>
          <span><var>x</var><sub>next</sub> = <var>x</var> + <var>v</var><sub>next</sub></span>
        </p>
        <ol className="math-equation-list math-equation-list--forces">
          <EquationStep number="1" label="惯性项：沿原速度前进" result={fixed(inertia)}>
            {fixed(omega)} × ({fixed(velocity)}) = {fixed(inertia)}
          </EquationStep>
          <EquationStep number="2" label="认知项：拉向自己的历史最好" result={fixed(cognition)}>
            {fixed(cognitiveWeight)} × 0.50 × ({fixed(personalBest)} − {fixed(x)}) = {fixed(cognition)}
          </EquationStep>
          <EquationStep number="3" label="社会项：拉向全群历史最好" result={fixed(social)}>
            {fixed(socialWeight)} × 0.50 × ({fixed(globalBest)} − {fixed(x)}) = {fixed(social)}
          </EquationStep>
        </ol>
        <div className="math-final-equation">
          <span><var>v</var><sub>next</sub> = {fixed(inertia)} + ({fixed(cognition)}) + ({fixed(social)}) = <strong>{fixed(nextVelocity)}</strong></span>
          <span><var>x</var><sub>next</sub> = {fixed(x)} + ({fixed(nextVelocity)}) = <strong>{fixed(nextPosition)}</strong></span>
        </div>
        <NumberLine
          label={`粒子从当前位置 ${compact(x)} 移动到下一位置 ${compact(nextPosition)}`}
          points={[
            { label: "gbest", value: globalBest, color: "#111827" },
            { label: "pbest", value: personalBest, color: "#64748b" },
            { label: "当前 x", value: x, color: "var(--math-accent)" },
            { label: "下一步", value: nextPosition, color: "#0f766e" },
          ]}
        />
        <p className="math-result-sentence">
          <span>这一轮的更新结果</span>
          <strong>速度 {fixed(nextVelocity)}，位置 {fixed(nextPosition)}</strong>
          <small>正负号表示方向；绝对值表示移动幅度。</small>
        </p>
      </div>
    </div>
  );
}

function WolfPackLab() {
  const [position, setPosition] = useState(7);
  const [leaderPosition, setLeaderPosition] = useState(1);
  const [searchStep, setSearchStep] = useState(2);
  const [lambda, setLambda] = useState(0.6);
  const exploreLeft = position - searchStep;
  const exploreRight = position + searchStep;
  const summon = position + lambda * (leaderPosition - position);
  const siegeLeft = leaderPosition - searchStep / 2;
  const siegeRight = leaderPosition + searchStep / 2;
  const candidates = [
    { label: "向左探寻", value: exploreLeft },
    { label: "向右探寻", value: exploreRight },
    { label: "召唤靠近", value: summon },
    { label: "围攻左侧", value: siegeLeft },
    { label: "围攻右侧", value: siegeRight },
  ];
  const winner = candidates.reduce((best, candidate) => (
    Math.abs(candidate.value - leaderPosition) < Math.abs(best.value - leaderPosition) ? candidate : best
  ));

  return (
    <div className="math-model-layout math-model-layout--wpa">
      <fieldset className="math-controls">
        <legend>设置一维狼群位置</legend>
        <p>把头狼当成当前已知最好解；普通狼在不同阶段产生候选位置，再交给目标函数评价。</p>
        <Slider id="wpa-position" label="普通狼当前位置 x" value={position} min="-10" max="10" step="0.5" onChange={setPosition} />
        <Slider id="wpa-leader" label="头狼位置 xₗ" value={leaderPosition} min="-10" max="10" step="0.5" onChange={setLeaderPosition} />
        <Slider id="wpa-step" label="探寻步长 s" value={searchStep} min="0.5" max="6" step="0.5" onChange={setSearchStep} hint="步长大：看得远；步长小：搜得细。" />
        <Slider id="wpa-lambda" label="召唤比例 λ" value={lambda} min="0" max="1" step="0.1" onChange={setLambda} hint="λ=0 不移动；λ=1 直接到头狼位置。" />
      </fieldset>

      <div className="math-workbench">
        <aside className="teaching-simplification">
          <strong>教学简化</strong>
          <p>真实狼群算法的探寻方向、距离判定和围攻公式因论文版本而异。这里固定在一维，并用头狼距离 <var>f</var>(z)=|z−<var>x</var><sub>l</sub>| 演示候选解评价。</p>
        </aside>
        <ol className="math-equation-list math-equation-list--wolf">
          <EquationStep number="1" label="探寻：向左右各试一步" result={`${fixed(exploreLeft)} / ${fixed(exploreRight)}`}>
            <var>x</var>−<var>s</var> = {fixed(position)}−{fixed(searchStep)}；<var>x</var>+<var>s</var> = {fixed(position)}+{fixed(searchStep)}
          </EquationStep>
          <EquationStep number="2" label="召唤：按比例靠近头狼" result={fixed(summon)}>
            <var>x</var> + λ(<var>x</var><sub>l</sub>−<var>x</var>) = {fixed(position)} + {fixed(lambda)}×({fixed(leaderPosition)}−{fixed(position)})
          </EquationStep>
          <EquationStep number="3" label="围攻：在头狼附近细搜" result={`${fixed(siegeLeft)} / ${fixed(siegeRight)}`}>
            <var>x</var><sub>l</sub> ± <var>s</var>/2 = {fixed(leaderPosition)} ± {fixed(searchStep)}/2
          </EquationStep>
        </ol>
        <NumberLine
          label={`普通狼当前位置 ${compact(position)}，头狼位置 ${compact(leaderPosition)}，教学模型选出的候选位置 ${compact(winner.value)}`}
          points={[
            { label: "普通狼", value: position, color: "var(--math-accent)" },
            { label: "头狼", value: leaderPosition, color: "#111827" },
            { label: "探寻−", value: exploreLeft, color: "#64748b" },
            { label: "探寻+", value: exploreRight, color: "#64748b" },
            { label: "召唤", value: summon, color: "#2563eb" },
            { label: "围攻−", value: siegeLeft, color: "#0f766e" },
            { label: "围攻+", value: siegeRight, color: "#0f766e" },
          ]}
        />
        <div className="candidate-readout" aria-label="各候选位置与头狼的距离">
          {candidates.map((candidate) => (
            <span key={candidate.label}>
              <small>{candidate.label}</small>
              <strong>{fixed(candidate.value)}</strong>
              <i>距离 {fixed(Math.abs(candidate.value - leaderPosition))}</i>
            </span>
          ))}
        </div>
        <p className="math-result-sentence">
          <span>按本实验的距离目标，最佳候选</span>
          <strong>{winner.label} · 位置 {fixed(winner.value)}</strong>
          <small>真实优化中，这一步应替换为你的目标函数，例如成本、误差或路线长度。</small>
        </p>
      </div>
    </div>
  );
}

const LABS = {
  ga: GeneticLab,
  aco: AntColonyLab,
  pso: ParticleSwarmLab,
  wpa: WolfPackLab,
};

function MathModelLab({ algorithmId, accent }) {
  const Lab = LABS[algorithmId];
  const meta = LAB_META[algorithmId];

  if (!Lab || !meta) return null;

  return (
    <section
      className="math-model-lab"
      style={{ "--math-accent": accent || "#0f63e9" }}
      aria-labelledby={`${algorithmId}-math-model-title`}
      data-testid={`math-model-${algorithmId}`}
    >
      <header className="math-model-header">
        <p>{meta.eyebrow}</p>
        <h3 id={`${algorithmId}-math-model-title`}>{meta.title}</h3>
        <span>{meta.description}</span>
      </header>
      <Lab />
    </section>
  );
}

export default memo(MathModelLab);
