const KNAPSACK_ITEMS = [
  { id: 0, name: "水瓶", weight: 2, value: 3 },
  { id: 1, name: "三明治", weight: 3, value: 4 },
  { id: 2, name: "相机", weight: 4, value: 5 },
  { id: 3, name: "外套", weight: 5, value: 8 },
  { id: 4, name: "书", weight: 9, value: 10 },
];

export const TSP_POINTS = [
  { x: 0, y: 0 },
  { x: 2, y: 0 },
  { x: 3, y: 1 },
  { x: 2, y: 3 },
  { x: 0, y: 3 },
  { x: -1, y: 1 },
];

export function createSeededRandom(seed = 42) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomNormal(random) {
  const u = Math.max(random(), Number.EPSILON);
  const v = Math.max(random(), Number.EPSILON);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function chromosomeStats(chromosome) {
  return chromosome.reduce(
    (stats, selected, index) => ({
      weight: stats.weight + selected * KNAPSACK_ITEMS[index].weight,
      value: stats.value + selected * KNAPSACK_ITEMS[index].value,
    }),
    { weight: 0, value: 0 },
  );
}

function repairChromosome(chromosome, capacity) {
  const repaired = [...chromosome];
  const removalOrder = KNAPSACK_ITEMS.map((item, index) => ({
    index,
    ratio: item.value / item.weight,
  })).sort((a, b) => a.ratio - b.ratio);

  while (chromosomeStats(repaired).weight > capacity) {
    const removable = removalOrder.find(({ index }) => repaired[index] === 1);
    repaired[removable.index] = 0;
  }
  return repaired;
}

export function runGeneticKnapsack({
  seed = 2,
  populationSize = 6,
  generations = 24,
  capacity = 10,
} = {}) {
  const random = createSeededRandom(seed);
  let population = Array.from({ length: populationSize }, () =>
    repairChromosome(
      KNAPSACK_ITEMS.map(() => (random() < 0.5 ? 0 : 1)),
      capacity,
    ),
  );
  let historicalBest = [...population[0]];
  let historicalValue = -Infinity;
  const states = [];
  const history = [];

  const tournament = (scores) => {
    const candidates = Array.from({ length: 3 }, () =>
      Math.floor(random() * population.length),
    );
    return candidates.reduce((best, index) =>
      scores[index] > scores[best] ? index : best,
    );
  };

  for (let generation = 0; generation <= generations; generation += 1) {
    const scores = population.map((chromosome) => chromosomeStats(chromosome).value);
    const generationBestIndex = scores.indexOf(Math.max(...scores));
    if (scores[generationBestIndex] > historicalValue) {
      historicalValue = scores[generationBestIndex];
      historicalBest = [...population[generationBestIndex]];
    }
    const bestStats = chromosomeStats(historicalBest);
    history.push(historicalValue);
    states.push({
      iteration: generation,
      bestChromosome: [...historicalBest],
      bestValue: historicalValue,
      totalWeight: bestStats.weight,
      population: population.map((chromosome) => [...chromosome]),
    });

    if (generation === generations) break;

    const nextPopulation = [[...historicalBest]];
    while (nextPopulation.length < populationSize) {
      const parentA = [...population[tournament(scores)]];
      const parentB = [...population[tournament(scores)]];
      let childA = [...parentA];
      let childB = [...parentB];

      if (random() < 0.82) {
        const point = 1 + Math.floor(random() * (KNAPSACK_ITEMS.length - 1));
        childA = [...parentA.slice(0, point), ...parentB.slice(point)];
        childB = [...parentB.slice(0, point), ...parentA.slice(point)];
      }

      childA = childA.map((gene) => (random() < 0.08 ? 1 - gene : gene));
      childB = childB.map((gene) => (random() < 0.08 ? 1 - gene : gene));
      nextPopulation.push(repairChromosome(childA, capacity));
      if (nextPopulation.length < populationSize) {
        nextPopulation.push(repairChromosome(childB, capacity));
      }
    }
    population = nextPopulation;
  }

  return { items: KNAPSACK_ITEMS, capacity, states, history };
}

function distance(pointA, pointB) {
  return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
}

function tourLength(tour, points = TSP_POINTS) {
  return tour.reduce((total, city, index) => {
    const nextCity = tour[(index + 1) % tour.length];
    return total + distance(points[city], points[nextCity]);
  }, 0);
}

function rouletteChoice(candidates, weights, random) {
  const total = weights.reduce((sum, value) => sum + value, 0);
  if (total <= Number.EPSILON) {
    return candidates[Math.floor(random() * candidates.length)];
  }
  let threshold = random() * total;
  for (let index = 0; index < candidates.length; index += 1) {
    threshold -= weights[index];
    if (threshold <= 0) return candidates[index];
  }
  return candidates.at(-1);
}

export function runAntColony({
  seed = 3,
  ants = 4,
  iterations = 20,
  alpha = 1,
  beta = 2.4,
  evaporation = 0.38,
} = {}) {
  const random = createSeededRandom(seed);
  const cityCount = TSP_POINTS.length;
  let pheromone = Array.from({ length: cityCount }, () =>
    Array(cityCount).fill(1),
  );
  let bestTour = Array.from({ length: cityCount }, (_, index) => index);
  let bestLength = tourLength(bestTour);
  const states = [
    {
      iteration: 0,
      bestTour: [...bestTour],
      bestLength,
      pheromone: pheromone.map((row) => [...row]),
    },
  ];
  const history = [bestLength];

  for (let iteration = 1; iteration <= iterations; iteration += 1) {
    const tours = [];
    for (let ant = 0; ant < ants; ant += 1) {
      const start = Math.floor(random() * cityCount);
      const tour = [start];
      const unvisited = new Set(
        Array.from({ length: cityCount }, (_, index) => index),
      );
      unvisited.delete(start);

      while (unvisited.size > 0) {
        const current = tour.at(-1);
        const candidates = [...unvisited];
        const weights = candidates.map((candidate) => {
          const heuristic = 1 / Math.max(distance(TSP_POINTS[current], TSP_POINTS[candidate]), 0.001);
          return pheromone[current][candidate] ** alpha * heuristic ** beta;
        });
        const nextCity = rouletteChoice(candidates, weights, random);
        tour.push(nextCity);
        unvisited.delete(nextCity);
      }
      const length = tourLength(tour);
      tours.push({ tour, length });
      if (length < bestLength) {
        bestLength = length;
        bestTour = [...tour];
      }
    }

    pheromone = pheromone.map((row) =>
      row.map((value) => Math.max(value * (1 - evaporation), 0.001)),
    );
    tours.forEach(({ tour, length }) => {
      const deposit = 120 / length;
      tour.forEach((city, index) => {
        const nextCity = tour[(index + 1) % tour.length];
        pheromone[city][nextCity] += deposit;
        pheromone[nextCity][city] += deposit;
      });
    });

    history.push(bestLength);
    states.push({
      iteration,
      bestTour: [...bestTour],
      bestLength,
      pheromone: pheromone.map((row) => [...row]),
    });
  }

  return { points: TSP_POINTS, states, history };
}

function sphere(point) {
  return point.x ** 2 + point.y ** 2;
}

export function runParticleSwarm({
  seed = 11,
  particles = 24,
  iterations = 32,
} = {}) {
  const random = createSeededRandom(seed);
  let swarm = Array.from({ length: particles }, () => {
    const point = { x: random() * 10 - 5, y: random() * 10 - 5 };
    return {
      ...point,
      vx: random() * 1.6 - 0.8,
      vy: random() * 1.6 - 0.8,
      px: point.x,
      py: point.y,
      personalValue: sphere(point),
    };
  });
  let globalBest = swarm.reduce((best, particle) =>
    particle.personalValue < best.personalValue ? particle : best,
  );
  let best = { x: globalBest.px, y: globalBest.py };
  let bestValue = globalBest.personalValue;
  const states = [];
  const history = [];

  const record = (iteration) => {
    states.push({
      iteration,
      points: swarm.map(({ x, y }) => ({ x, y })),
      best: { ...best },
      bestValue,
    });
    history.push(bestValue);
  };
  record(0);

  for (let iteration = 1; iteration <= iterations; iteration += 1) {
    swarm = swarm.map((particle) => {
      const vx = Math.max(
        -2,
        Math.min(
          2,
          0.68 * particle.vx +
            1.55 * random() * (particle.px - particle.x) +
            1.55 * random() * (best.x - particle.x),
        ),
      );
      const vy = Math.max(
        -2,
        Math.min(
          2,
          0.68 * particle.vy +
            1.55 * random() * (particle.py - particle.y) +
            1.55 * random() * (best.y - particle.y),
        ),
      );
      const next = {
        ...particle,
        vx,
        vy,
        x: Math.max(-5, Math.min(5, particle.x + vx)),
        y: Math.max(-5, Math.min(5, particle.y + vy)),
      };
      const value = sphere(next);
      if (value < next.personalValue) {
        next.personalValue = value;
        next.px = next.x;
        next.py = next.y;
      }
      return next;
    });

    globalBest = swarm.reduce((currentBest, particle) =>
      particle.personalValue < currentBest.personalValue ? particle : currentBest,
    );
    if (globalBest.personalValue < bestValue) {
      bestValue = globalBest.personalValue;
      best = { x: globalBest.px, y: globalBest.py };
    }
    record(iteration);
  }

  return { states, history };
}

export function runWolfPack({
  seed = 13,
  wolves = 20,
  iterations = 32,
} = {}) {
  const random = createSeededRandom(seed);
  let pack = Array.from({ length: wolves }, () => ({
    x: random() * 10 - 5,
    y: random() * 10 - 5,
  }));
  let historicalBest = pack.reduce((best, wolf) =>
    sphere(wolf) < sphere(best) ? wolf : best,
  );
  historicalBest = { ...historicalBest };
  let historicalValue = sphere(historicalBest);
  const states = [];
  const history = [];

  const record = (iteration, phase = "初始化") => {
    states.push({
      iteration,
      phase,
      wolves: pack.map((wolf) => ({ ...wolf })),
      leader: { ...historicalBest },
      bestValue: historicalValue,
    });
    history.push(historicalValue);
  };
  record(0);

  for (let iteration = 1; iteration <= iterations; iteration += 1) {
    const progress = (iteration - 1) / Math.max(iterations - 1, 1);
    const scoutScale = 1.8 * (1 - progress) + 0.1;
    const rushFraction = 0.35 + 0.45 * progress;
    const siegeScale = 0.8 * (1 - progress) + 0.005;

    let leaderIndex = pack.reduce(
      (bestIndex, wolf, index) =>
        sphere(wolf) < sphere(pack[bestIndex]) ? index : bestIndex,
      0,
    );
    const nonleaders = pack.map((_, index) => index).filter((index) => index !== leaderIndex);
    for (let cursor = nonleaders.length - 1; cursor > 0; cursor -= 1) {
      const other = Math.floor(random() * (cursor + 1));
      [nonleaders[cursor], nonleaders[other]] = [nonleaders[other], nonleaders[cursor]];
    }
    const scouts = nonleaders.slice(0, Math.max(1, Math.round(wolves * 0.2)));
    scouts.forEach((index) => {
      let localBest = pack[index];
      for (let direction = 0; direction < 5; direction += 1) {
        const angle = random() * Math.PI * 2;
        const candidate = {
          x: Math.max(-5, Math.min(5, pack[index].x + Math.cos(angle) * scoutScale)),
          y: Math.max(-5, Math.min(5, pack[index].y + Math.sin(angle) * scoutScale)),
        };
        if (sphere(candidate) < sphere(localBest)) localBest = candidate;
      }
      pack[index] = { ...localBest };
    });

    leaderIndex = pack.reduce(
      (bestIndex, wolf, index) =>
        sphere(wolf) < sphere(pack[bestIndex]) ? index : bestIndex,
      0,
    );
    const leader = { ...pack[leaderIndex] };
    pack = pack.map((wolf, index) => {
      if (index === leaderIndex) return wolf;
      const candidate = {
        x: wolf.x + rushFraction * (leader.x - wolf.x),
        y: wolf.y + rushFraction * (leader.y - wolf.y),
      };
      return sphere(candidate) < sphere(wolf) ? candidate : wolf;
    });

    leaderIndex = pack.reduce(
      (bestIndex, wolf, index) =>
        sphere(wolf) < sphere(pack[bestIndex]) ? index : bestIndex,
      0,
    );
    const siegeLeader = { ...pack[leaderIndex] };
    pack = pack.map((wolf, index) => {
      if (index === leaderIndex) return wolf;
      const candidate = {
        x: Math.max(-5, Math.min(5, siegeLeader.x + randomNormal(random) * siegeScale)),
        y: Math.max(-5, Math.min(5, siegeLeader.y + randomNormal(random) * siegeScale)),
      };
      return sphere(candidate) < sphere(wolf) ? candidate : wolf;
    });

    const sortedWorst = pack
      .map((wolf, index) => ({ index, value: sphere(wolf) }))
      .sort((a, b) => b.value - a.value);
    sortedWorst.slice(0, Math.max(1, Math.round(wolves * 0.1))).forEach(({ index }) => {
      pack[index] = { x: random() * 10 - 5, y: random() * 10 - 5 };
    });

    const currentBest = pack.reduce((best, wolf) =>
      sphere(wolf) < sphere(best) ? wolf : best,
    );
    if (sphere(currentBest) < historicalValue) {
      historicalBest = { ...currentBest };
      historicalValue = sphere(currentBest);
    }
    record(iteration, iteration < iterations * 0.35 ? "探寻" : iteration < iterations * 0.7 ? "召唤" : "围攻");
  }

  return { states, history };
}
