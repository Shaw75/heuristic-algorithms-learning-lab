import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import MathModelLab from "./MathModelLab";

describe("MathModelLab", () => {
  it("updates GA selection probabilities from the fitness sliders", () => {
    render(<MathModelLab algorithmId="ga" accent="#ef4444" />);
    const lab = screen.getByTestId("math-model-ga");

    expect(within(lab).getByText("候选解 B · 50.0%")).toBeVisible();
    fireEvent.change(within(lab).getByRole("slider", { name: "候选解 A 的适应度" }), {
      target: { value: "10" },
    });

    expect(within(lab).getByText("候选解 A · 55.6%")).toBeVisible();
  });

  it("normalizes ACO edge weights and explains both influences", () => {
    render(<MathModelLab algorithmId="aco" accent="#f59e0b" />);
    const lab = screen.getByTestId("math-model-aco");

    expect(within(lab).getByRole("slider", { name: "边 A 的信息素 τ" })).toBeVisible();
    expect(within(lab).getByRole("slider", { name: "距离权重 β" })).toBeVisible();
    expect(within(lab).getByText("本次更倾向")).toBeVisible();
  });

  it("shows every term and the next PSO state", () => {
    render(<MathModelLab algorithmId="pso" accent="#0ea5a8" />);
    const lab = screen.getByTestId("math-model-pso");

    expect(within(lab).getByText("惯性项：沿原速度前进")).toBeVisible();
    expect(within(lab).getByText("认知项：拉向自己的历史最好")).toBeVisible();
    expect(within(lab).getByText("社会项：拉向全群历史最好")).toBeVisible();
    expect(within(lab).getByText("速度 -4.85，位置 -0.85")).toBeVisible();
  });

  it("labels WPA as a teaching simplification and evaluates candidates", () => {
    render(<MathModelLab algorithmId="wpa" accent="#8b5cf6" />);
    const lab = screen.getByTestId("math-model-wpa");

    expect(within(lab).getByText("教学简化")).toBeVisible();
    expect(within(lab).getByText("最佳候选", { exact: false })).toBeVisible();
    expect(within(lab).getByRole("slider", { name: "召唤比例 λ" })).toBeVisible();
  });
});
