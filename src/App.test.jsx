import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "./App";

describe("learning lab", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the learning structure and all four lessons", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "从一群候选解开始，理解四种搜索策略",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("lesson-ga")).toBeInTheDocument();
    expect(screen.getByTestId("lesson-aco")).toBeInTheDocument();
    expect(screen.getByTestId("lesson-pso")).toBeInTheDocument();
    expect(screen.getByTestId("lesson-wpa")).toBeInTheDocument();
  });

  it("switches the GA lesson to a rendered formula", () => {
    render(<App />);
    const lesson = screen.getByTestId("lesson-ga");

    fireEvent.click(within(lesson).getByRole("tab", { name: "公式" }));

    expect(within(lesson).getByText("适应度函数（0/1 背包）")).toBeVisible();
    expect(lesson.querySelector(".katex-display")).not.toBeNull();
  });

  it("advances the GA simulation when run is pressed", () => {
    vi.useFakeTimers();
    render(<App />);
    const lesson = screen.getByTestId("lesson-ga");

    expect(within(lesson).getByText(/第 0 \/ 24 代/)).toBeVisible();
    fireEvent.click(within(lesson).getByRole("button", { name: "运行一次" }));

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(within(lesson).queryByText(/第 0 \/ 24 代/)).not.toBeInTheDocument();
  });
});
