import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { courseLessons } from "../data/courseContent";
import { algorithmAbstractModels } from "../data/modelLearningContent";
import ModelLearningPath from "./ModelLearningPath";

describe("ModelLearningPath", () => {
  it.each(courseLessons)("connects the common model to the $short example and code", (lesson) => {
    render(<ModelLearningPath lesson={lesson} />);
    const path = screen.getByTestId(`model-learning-path-${lesson.id}`);

    expect(within(path).getByRole("heading", { name: "先看所有启发式算法的共同骨架" })).toBeVisible();
    expect(within(path).getByRole("heading", { name: `${lesson.title}的抽象更新模型` })).toBeVisible();
    expect(within(path).getByRole("heading", { name: "把抽象符号落到本页具体例子" })).toBeVisible();
    expect(within(path).getByRole("heading", { name: "从数学公式走到 Python 变量" })).toBeVisible();
    expect(within(path).getByText(lesson.optimizationModel.title)).toBeVisible();
    expect(algorithmAbstractModels[lesson.id].codeMap.length).toBeGreaterThanOrEqual(5);
  });

  it("states that the common state equation is a teaching abstraction, not one shared update rule", () => {
    render(<ModelLearningPath lesson={courseLessons[0]} />);

    expect(screen.getByText(/没有一条共同的算法更新公式/)).toBeVisible();
    expect(screen.getByText(/Sₜ 表示第 t 轮的完整搜索状态/)).toBeVisible();
  });
});
