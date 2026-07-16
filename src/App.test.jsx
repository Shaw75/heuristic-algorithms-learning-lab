import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

function openRoute(route) {
  window.history.replaceState(null, "", `#/${route}`);
}

describe("beginner learning lab", () => {
  beforeEach(() => {
    openRoute("start");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a learning start page and links to four independent lessons", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "先学会把现实问题翻译成优化问题" })).toBeVisible();
    expect(screen.getByRole("link", { name: "学习遗传算法" })).toHaveAttribute("href", "#/ga");
    expect(screen.getByRole("link", { name: "学习粒子群算法" })).toHaveAttribute("href", "#/pso");
    expect(screen.queryByTestId("lesson-ga")).not.toBeInTheDocument();
  });

  it("opens GA as one page with a model, worked example, formulas and interactive lab", () => {
    openRoute("ga");
    render(<App />);
    const lesson = screen.getByTestId("lesson-ga");

    expect(within(lesson).getByRole("heading", { name: /遗传算法 GA/ })).toBeVisible();
    expect(within(lesson).getByRole("heading", { name: "把实际问题翻译成数学模型" })).toBeVisible();
    expect(within(lesson).getByRole("heading", { name: "手算一轮：10 kg 背包" })).toBeVisible();
    expect(within(lesson).getByTestId("math-model-ga")).toBeVisible();
    expect(lesson.querySelectorAll(".katex-display").length).toBeGreaterThan(4);
    expect(screen.queryByTestId("lesson-aco")).not.toBeInTheDocument();
  });

  it("advances the GA simulation when run is pressed", () => {
    vi.useFakeTimers();
    openRoute("ga");
    render(<App />);
    const lesson = screen.getByTestId("lesson-ga");

    expect(within(lesson).getByText(/第 0 \/ 24 代/)).toBeVisible();
    fireEvent.click(within(lesson).getByRole("button", { name: "运行一次" }));

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(within(lesson).queryByText(/第 0 \/ 24 代/)).not.toBeInTheDocument();
  });

  it("resets simulation state when switching to another algorithm page", () => {
    vi.useFakeTimers();
    openRoute("ga");
    render(<App />);
    const lesson = screen.getByTestId("lesson-ga");

    fireEvent.click(within(lesson).getByRole("button", { name: "运行一次" }));
    act(() => {
      vi.advanceTimersByTime(5_200);
    });

    act(() => {
      openRoute("aco");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    expect(screen.getByTestId("lesson-aco")).toBeVisible();
    expect(screen.getByText(/第 0 \/ .* 轮/)).toBeVisible();
  });

  it("checks a lesson quiz and explains the correct answer", () => {
    openRoute("pso");
    render(<App />);
    const lesson = screen.getByTestId("lesson-pso");

    fireEvent.click(within(lesson).getByRole("radio", { name: /保持旧 pbest 不变/ }));
    fireEvent.click(within(lesson).getByRole("button", { name: "检查答案" }));

    expect(within(lesson).getByText("答对了")).toBeVisible();
    expect(within(lesson).getByText(/pbest 比较的是“历史最好”/)).toBeVisible();
  });
});
