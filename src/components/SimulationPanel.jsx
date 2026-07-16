import BookOpen from "lucide-react/dist/esm/icons/book-open.mjs";
import Camera from "lucide-react/dist/esm/icons/camera.mjs";
import Milk from "lucide-react/dist/esm/icons/milk.mjs";
import Play from "lucide-react/dist/esm/icons/play.mjs";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw.mjs";
import Sandwich from "lucide-react/dist/esm/icons/sandwich.mjs";
import Shirt from "lucide-react/dist/esm/icons/shirt.mjs";
import { useEffect, useMemo, useState } from "react";

import {
  runAntColony,
  runGeneticKnapsack,
  runParticleSwarm,
  runWolfPack,
} from "../algorithms/demoAlgorithms";
import ConvergenceChart from "./ConvergenceChart";

const ITEM_ICONS = [Milk, Sandwich, Camera, Shirt, BookOpen];

function getDemo(id) {
  if (id === "ga") return runGeneticKnapsack();
  if (id === "aco") return runAntColony();
  if (id === "pso") return runParticleSwarm();
  return runWolfPack();
}

function formatValue(value) {
  if (Math.abs(value) < 0.001) return value.toExponential(2);
  return value.toFixed(3).replace(/\.000$/, "");
}

function GeneticView({ result, state, accent }) {
  return (
    <div className="ga-simulation">
      <div className="capacity-summary">
        <span>容量 {state.totalWeight} / {result.capacity}</span>
        <div><i style={{ width: `${(state.totalWeight / result.capacity) * 100}%`, background: accent }} /></div>
        <strong>总价值 {state.bestValue}</strong>
      </div>
      <div className="knapsack-items">
        {result.items.map((item, index) => {
          const Icon = ITEM_ICONS[index];
          const selected = state.bestChromosome[index] === 1;
          return (
            <div className={selected ? "is-selected" : ""} key={item.id}>
              <span className="item-check" aria-label={selected ? "已选择" : "未选择"}>{selected ? "✓" : ""}</span>
              <Icon aria-hidden="true" />
              <strong>{item.name}</strong>
              <small>价值 {item.value} · 重量 {item.weight}</small>
            </div>
          );
        })}
      </div>
      <div className="chromosome-row">
        <span>当前染色体</span>
        <div>{state.bestChromosome.map((gene, index) => <b key={index}>{gene}</b>)}</div>
      </div>
      <div className="population-preview" aria-label="当前种群预览">
        {state.population.slice(0, 4).map((chromosome, index) => (
          <span key={`${index}-${chromosome.join("")}`}>
            <i>{String(index + 1).padStart(2, "0")}</i>
            <code>{chromosome.join(" ")}</code>
          </span>
        ))}
      </div>
    </div>
  );
}

const mapTspPoint = ({ x, y }) => ({
  x: 12 + ((x + 1) / 4) * 76,
  y: 88 - (y / 3) * 72,
});

function AntColonyView({ result, state, accent }) {
  const mapped = result.points.map(mapTspPoint);
  const routeSegments = state.bestTour.map((city, index) => {
    const nextCity = state.bestTour[(index + 1) % state.bestTour.length];
    return [mapped[city], mapped[nextCity]];
  });
  const maxPheromone = Math.max(...state.pheromone.flat());

  return (
    <div className="map-simulation">
      <svg viewBox="0 0 100 100" role="img" aria-label="蚁群算法当前最好旅行商闭环">
        <g className="pheromone-edges">
          {mapped.flatMap((point, i) =>
            mapped.slice(i + 1).map((other, offset) => {
              const j = i + offset + 1;
              const strength = state.pheromone[i][j] / maxPheromone;
              return (
                <line
                  key={`${i}-${j}`}
                  x1={point.x}
                  y1={point.y}
                  x2={other.x}
                  y2={other.y}
                  strokeWidth={0.25 + strength * 1.4}
                  opacity={0.08 + strength * 0.22}
                />
              );
            }),
          )}
        </g>
        <g className="best-route" style={{ color: accent }}>
          {routeSegments.map(([from, to], index) => (
            <line key={index} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
          ))}
        </g>
        {mapped.map((point, index) => (
          <g className="city-node" key={index} transform={`translate(${point.x} ${point.y})`}>
            <circle r="4.5" />
            <text textAnchor="middle" y="1.4">{index + 1}</text>
          </g>
        ))}
      </svg>
      <div className="route-readout">
        <span>当前最好闭环</span>
        <code>{state.bestTour.map((city) => city + 1).join(" → ")} → {state.bestTour[0] + 1}</code>
      </div>
    </div>
  );
}

const mapFieldPoint = ({ x, y }) => ({ x: 50 + x * 8.2, y: 50 - y * 8.2 });

function FieldView({ state, accent, type }) {
  const points = type === "pso" ? state.points : state.wolves;
  const best = mapFieldPoint(type === "pso" ? state.best : state.leader);
  return (
    <div className="field-simulation">
      <svg viewBox="0 0 100 100" role="img" aria-label={`${type === "pso" ? "粒子群" : "狼群"}在二维 Sphere 函数上搜索`}>
        <g className="field-contours">
          {[12, 24, 36, 46].map((radius) => <circle key={radius} cx="50" cy="50" r={radius} />)}
          <line x1="5" x2="95" y1="50" y2="50" />
          <line x1="50" x2="50" y1="5" y2="95" />
        </g>
        <circle className="field-target" cx="50" cy="50" r="2.2" />
        {points.map((point, index) => {
          const mapped = mapFieldPoint(point);
          if (type === "wpa") {
            const size = Math.abs(mapped.x - best.x) < 0.01 && Math.abs(mapped.y - best.y) < 0.01 ? 3.2 : 2.3;
            return (
              <polygon
                key={index}
                points={`${mapped.x},${mapped.y - size} ${mapped.x - size},${mapped.y + size} ${mapped.x + size},${mapped.y + size}`}
                fill={accent}
                opacity={index === 0 ? 1 : 0.68}
              />
            );
          }
          return <circle key={index} cx={mapped.x} cy={mapped.y} r="2.15" fill={accent} opacity="0.72" />;
        })}
        <circle className="field-best" cx={best.x} cy={best.y} r="4.1" style={{ color: accent }} />
      </svg>
      <div className="field-readout">
        <span>{type === "pso" ? "gbest" : `当前阶段：${state.phase}`}</span>
        <code>({(type === "pso" ? state.best.x : state.leader.x).toFixed(3)}, {(type === "pso" ? state.best.y : state.leader.y).toFixed(3)})</code>
      </div>
    </div>
  );
}

export default function SimulationPanel({ lesson }) {
  const result = useMemo(() => getDemo(lesson.id), [lesson.id]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const state = result.states[frameIndex];
  const totalFrames = result.states.length - 1;

  useEffect(() => {
    if (!running) return undefined;
    const interval = window.setInterval(() => {
      setFrameIndex((current) => {
        if (current >= totalFrames) {
          setRunning(false);
          return current;
        }
        return current + 1;
      });
    }, 210);
    return () => window.clearInterval(interval);
  }, [running, totalFrames]);

  const run = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFrameIndex(totalFrames);
      setRunning(false);
      return;
    }
    setFrameIndex(0);
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setFrameIndex(0);
  };

  const unit = lesson.id === "ga" ? "代" : lesson.id === "aco" ? "轮" : "次迭代";
  const value = lesson.id === "ga" ? state.bestValue : lesson.id === "aco" ? state.bestLength : state.bestValue;

  return (
    <div className="simulation-shell" style={{ "--accent": lesson.accent }} data-sim-frame={frameIndex}>
      <div className="simulation-toolbar">
        <div>
          <strong>{lesson.problem}模拟</strong>
          <span>第 {frameIndex} / {totalFrames} {unit}</span>
        </div>
        <div className="simulation-actions">
          <button type="button" className="run-button" onClick={run} disabled={running}>
            <Play aria-hidden="true" />
            {running ? "运行中…" : "运行一次"}
          </button>
          <button type="button" className="reset-button" onClick={reset}>
            <RotateCcw aria-hidden="true" />
            重置
          </button>
        </div>
      </div>
      <div className="simulation-layout">
        <div className="simulation-canvas">
          {lesson.id === "ga" && <GeneticView result={result} state={state} accent={lesson.accent} />}
          {lesson.id === "aco" && <AntColonyView result={result} state={state} accent={lesson.accent} />}
          {lesson.id === "pso" && <FieldView state={state} accent={lesson.accent} type="pso" />}
          {lesson.id === "wpa" && <FieldView state={state} accent={lesson.accent} type="wpa" />}
        </div>
        <ConvergenceChart
          history={result.history.slice(0, frameIndex + 1)}
          accent={lesson.accent}
          logarithmic={lesson.id === "pso" || lesson.id === "wpa"}
          label={`${lesson.id === "ga" ? "最好价值" : lesson.id === "aco" ? "最短长度" : "最小函数值"} ${formatValue(value)}`}
        />
      </div>
    </div>
  );
}
