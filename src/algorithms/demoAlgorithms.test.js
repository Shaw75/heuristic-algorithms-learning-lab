import { describe, expect, it } from "vitest";

import {
  runAntColony,
  runGeneticKnapsack,
  runParticleSwarm,
  runWolfPack,
} from "./demoAlgorithms";

const isNonDecreasing = (values) =>
  values.every((value, index) => index === 0 || value >= values[index - 1]);

const isNonIncreasing = (values) =>
  values.every((value, index) => index === 0 || value <= values[index - 1]);

describe("interactive algorithm demos", () => {
  it("GA finds the feasible value-15 knapsack solution", () => {
    const result = runGeneticKnapsack({
      seed: 2,
      populationSize: 6,
      generations: 24,
    });
    const finalState = result.states.at(-1);

    expect(finalState.bestValue).toBe(15);
    expect(finalState.totalWeight).toBeLessThanOrEqual(10);
    expect(isNonDecreasing(result.history)).toBe(true);
  });

  it("ACO returns a legal improving six-city tour", () => {
    const result = runAntColony({ seed: 3, ants: 4, iterations: 20 });
    const finalState = result.states.at(-1);

    expect([...finalState.bestTour].sort((a, b) => a - b)).toEqual([
      0, 1, 2, 3, 4, 5,
    ]);
    expect(finalState.bestLength).toBeLessThan(12.5);
    expect(isNonIncreasing(result.history)).toBe(true);
  });

  it("PSO converges toward the Sphere-function origin", () => {
    const result = runParticleSwarm({
      seed: 11,
      particles: 24,
      iterations: 32,
    });

    expect(result.states.at(-1).bestValue).toBeLessThan(1e-3);
    expect(isNonIncreasing(result.history)).toBe(true);
  });

  it("WPA teaching stages converge toward the Sphere-function origin", () => {
    const result = runWolfPack({
      seed: 13,
      wolves: 20,
      iterations: 32,
    });

    expect(result.states.at(-1).bestValue).toBeLessThan(1e-3);
    expect(isNonIncreasing(result.history)).toBe(true);
  });
});
