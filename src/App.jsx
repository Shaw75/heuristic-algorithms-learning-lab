import BookOpen from "lucide-react/dist/esm/icons/book-open.mjs";
import CircleDot from "lucide-react/dist/esm/icons/circle-dot.mjs";
import Dna from "lucide-react/dist/esm/icons/dna.mjs";
import Home from "lucide-react/dist/esm/icons/house.mjs";
import Map from "lucide-react/dist/esm/icons/map.mjs";
import Menu from "lucide-react/dist/esm/icons/menu.mjs";
import PawPrint from "lucide-react/dist/esm/icons/paw-print.mjs";
import Scale from "lucide-react/dist/esm/icons/scale.mjs";
import X from "lucide-react/dist/esm/icons/x.mjs";
import { useEffect, useState } from "react";

import AlgorithmPage from "./components/AlgorithmPage";
import ChoicePage from "./components/ChoicePage";
import StartPage from "./components/StartPage";
import { courseLessonMap, courseLessons } from "./data/courseContent";

const navigation = [
  { id: "start", label: "学习起点", shortLabel: "起点", icon: Home, color: "#2563eb" },
  { id: "ga", label: "遗传算法", shortLabel: "GA", icon: Dna, color: "#ef4444" },
  { id: "aco", label: "蚁群算法", shortLabel: "ACO", icon: Map, color: "#f59e0b" },
  { id: "pso", label: "粒子群算法", shortLabel: "PSO", icon: CircleDot, color: "#0891b2" },
  { id: "wpa", label: "狼群算法", shortLabel: "WPA", icon: PawPrint, color: "#7c3aed" },
  { id: "choice", label: "算法选择", shortLabel: "选择", icon: Scale, color: "#2563eb" },
];

const routeIds = new Set(navigation.map(({ id }) => id));

function getRouteFromHash() {
  const candidate = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  return routeIds.has(candidate) ? candidate : "start";
}

function getPageTitle(route) {
  if (route === "start") return "学习起点";
  if (route === "choice") return "算法选择";
  return courseLessonMap.get(route)?.title ?? "启发式算法";
}

export default function App() {
  const [route, setRoute] = useState(getRouteFromHash);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    document.title = `${getPageTitle(route)} · 启发式算法学习实验室`;
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setMobileMenuOpen(false);
    window.requestAnimationFrame(() => document.getElementById("main-content")?.focus({ preventScroll: true }));
  }, [route]);

  const lesson = courseLessonMap.get(route);
  const lessonIndex = courseLessons.findIndex(({ id }) => id === route);
  const previousLesson = lessonIndex > 0 ? courseLessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex >= 0 && lessonIndex < courseLessons.length - 1 ? courseLessons[lessonIndex + 1] : null;

  return (
    <div className="app-shell" data-route={route}>
      <a className="skip-link" href="#main-content">跳到正文</a>

      <header className="site-header">
        <a className="brand" href="#/start" aria-label="返回学习起点">
          <BookOpen aria-hidden="true" />
          <strong>启发式算法学习实验室</strong>
        </a>
        <span>先理解数学模型，再运行算法</span>
        <button
          type="button"
          className="mobile-menu-button"
          aria-label={mobileMenuOpen ? "关闭课程目录" : "打开课程目录"}
          aria-expanded={mobileMenuOpen}
          aria-controls="course-sidebar"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </header>

      <aside className={`side-navigation ${mobileMenuOpen ? "is-open" : ""}`} id="course-sidebar" aria-label="课程目录">
        <div className="side-label">课程目录</div>
        <nav>
          {navigation.map(({ id, label, icon: Icon, color }, index) => (
            <a
              href={`#/${id}`}
              className={route === id ? "is-active" : ""}
              style={{ "--nav-color": color }}
              aria-current={route === id ? "page" : undefined}
              key={id}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {index > 0 && index < 5 ? <small>{String(index).padStart(2, "0")}</small> : null}
            </a>
          ))}
        </nav>
        <div className="side-learning-order">
          <strong>新手顺序</strong>
          <p>GA → PSO → ACO → WPA</p>
          <span>每页都从数学问题开始，不需要预先会公式。</span>
        </div>
      </aside>

      <button
        type="button"
        className={`navigation-scrim ${mobileMenuOpen ? "is-visible" : ""}`}
        aria-label="关闭课程目录"
        tabIndex={mobileMenuOpen ? 0 : -1}
        onClick={() => setMobileMenuOpen(false)}
      />

      <nav className="mobile-navigation" aria-label="算法页面切换">
        {navigation.map(({ id, shortLabel, color }) => (
          <a
            href={`#/${id}`}
            className={route === id ? "is-active" : ""}
            style={{ "--nav-color": color }}
            aria-current={route === id ? "page" : undefined}
            key={id}
          >
            {shortLabel}
          </a>
        ))}
      </nav>

      <main id="main-content" tabIndex="-1">
        {route === "start" ? <StartPage /> : null}
        {route === "choice" ? <ChoicePage /> : null}
        {lesson ? (
          <AlgorithmPage
            key={lesson.id}
            lesson={lesson}
            previousLesson={previousLesson}
            nextLesson={nextLesson}
          />
        ) : null}
      </main>

      <footer>
        <BookOpen aria-hidden="true" />
        <span>启发式算法学习实验室 · 公式由 KaTeX 渲染 · 演示为可复现的教学示例</span>
      </footer>
    </div>
  );
}
