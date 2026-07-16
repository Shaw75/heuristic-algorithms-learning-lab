import ArrowDown from "lucide-react/dist/esm/icons/arrow-down.mjs";
import BookOpen from "lucide-react/dist/esm/icons/book-open.mjs";
import CircleDot from "lucide-react/dist/esm/icons/circle-dot.mjs";
import Dna from "lucide-react/dist/esm/icons/dna.mjs";
import Home from "lucide-react/dist/esm/icons/house.mjs";
import Map from "lucide-react/dist/esm/icons/map.mjs";
import PawPrint from "lucide-react/dist/esm/icons/paw-print.mjs";
import Scale from "lucide-react/dist/esm/icons/scale.mjs";
import { useEffect, useState } from "react";

import AlgorithmComparison from "./components/AlgorithmComparison";
import HeroTrajectory from "./components/HeroTrajectory";
import LessonSection from "./components/LessonSection";
import SearchSkeleton from "./components/SearchSkeleton";
import { lessons } from "./data/lessonData";

const navigation = [
  { id: "overview", label: "全局地图", icon: Home, color: "#0f63e9" },
  { id: "ga", label: "遗传算法", icon: Dna, color: "#f34f52" },
  { id: "aco", label: "蚁群算法", icon: Map, color: "#f58a13" },
  { id: "pso", label: "粒子群算法", icon: CircleDot, color: "#00a7ae" },
  { id: "wpa", label: "狼群算法", icon: PawPrint, color: "#8247e5" },
  { id: "compare", label: "横向对比", icon: Scale, color: "#0f63e9" },
];

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function App() {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const updateActiveSection = () => {
      const offset = window.innerHeight * 0.28;
      let current = "overview";
      navigation.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= offset) current = id;
      });
      setActiveSection(current);
    };
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, []);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#overview">跳到正文</a>

      <header className="site-header">
        <button className="brand" type="button" onClick={() => scrollToSection("overview")}>
          <BookOpen aria-hidden="true" />
          <span>启发式算法</span>
          <i />
          <small>学习实验室</small>
        </button>
        <p>看见搜索过程，公式就不再抽象</p>
      </header>

      <aside className="side-navigation" aria-label="课程目录">
        <div className="side-label">学习地图</div>
        <nav>
          {navigation.map(({ id, label, icon: Icon, color }, index) => (
            <button
              type="button"
              key={id}
              className={activeSection === id ? "is-active" : ""}
              onClick={() => scrollToSection(id)}
              style={{ "--nav-color": color }}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {index > 0 && index < 5 && <small>0{index}</small>}
            </button>
          ))}
        </nav>
        <div className="side-tip">
          <strong>新手提示</strong>
          <p>先看动画和直觉，再读框架，最后对照公式与代码。</p>
        </div>
      </aside>

      <nav className="mobile-navigation" aria-label="移动端课程目录">
        {navigation.map(({ id, label, color }) => (
          <button
            type="button"
            key={id}
            className={activeSection === id ? "is-active" : ""}
            onClick={() => scrollToSection(id)}
            style={{ "--nav-color": color }}
          >
            {label}
          </button>
        ))}
      </nav>

      <main>
        <section className="hero-section" id="overview">
          <div className="hero-copy">
            <p className="eyebrow">A VISUAL GUIDE TO METAHEURISTICS</p>
            <h1>从一群候选解开始，<br />理解四种搜索策略</h1>
            <p className="hero-intro">
              遗传、蚁群、粒子群、狼群看起来不同，本质上都在回答同一个问题：
              <strong>怎样在庞大的搜索空间里，用有限计算找到足够好的解？</strong>
            </p>
            <div className="hero-actions">
              <button type="button" className="primary-action" onClick={() => scrollToSection("ga")}>
                从遗传算法开始
                <ArrowDown aria-hidden="true" />
              </button>
              <button type="button" className="text-action" onClick={() => scrollToSection("compare")}>
                先看四种算法对比
              </button>
            </div>
          </div>
          <HeroTrajectory />
        </section>

        <section className="overview-section" aria-labelledby="shared-skeleton-title">
          <header className="section-heading compact-heading">
            <p className="eyebrow">ONE SHARED SKELETON</p>
            <h2 id="shared-skeleton-title">先看共同骨架，再看各自策略</h2>
            <p>四种算法的“故事”不同，但程序结构高度相似。</p>
          </header>
          <SearchSkeleton />
          <AlgorithmComparison compact />
        </section>

        {lessons.map((lesson) => <LessonSection lesson={lesson} key={lesson.id} />)}

        <section className="final-comparison" id="compare">
          <header className="section-heading">
            <p className="eyebrow">CHOOSE BY PROBLEM STRUCTURE</p>
            <h2>四种算法，应该怎么选？</h2>
            <p>先看解的表示方式，再看问题是“构造路径”还是“移动坐标”，最后才调参数。</p>
          </header>
          <AlgorithmComparison />
          <div className="beginner-route">
            <div>
              <span>1</span>
              <strong>先学 GA</strong>
              <p>它最完整地展示了候选解、评价、选择和随机变化。</p>
            </div>
            <div>
              <span>2</span>
              <strong>再学 PSO</strong>
              <p>只靠位置与速度更新，最容易把公式和动画对应起来。</p>
            </div>
            <div>
              <span>3</span>
              <strong>然后看 ACO</strong>
              <p>理解“在图上逐步构造解”和信息素正反馈。</p>
            </div>
            <div>
              <span>4</span>
              <strong>最后看 WPA</strong>
              <p>把探寻、靠近和局部围攻理解成不同搜索阶段。</p>
            </div>
          </div>
          <aside className="choice-rule">
            <strong>一句话选择法</strong>
            <p>离散编码优先想到 GA；路线构造优先想到 ACO；连续参数优化先试 PSO；想研究分阶段群体搜索，再看 WPA。</p>
          </aside>
        </section>
      </main>

      <footer>
        <BookOpen aria-hidden="true" />
        <span>启发式算法学习实验室 · 公式由 KaTeX 实时渲染 · 演示均为确定性教学示例</span>
      </footer>
    </div>
  );
}
