"""蚁群算法：求解 6 个城市的旅行商问题。"""

import numpy as np


def ant_colony(seed=5, ant_count=20, iterations=60):
    points = np.array([[0, 0], [2, 0], [3, 1], [2, 3], [0, 3], [-1, 1]])
    rng = np.random.default_rng(seed)
    n = len(points)
    distance = np.linalg.norm(points[:, None] - points[None, :], axis=2)
    heuristic = 1.0 / np.maximum(distance, 1e-12)
    np.fill_diagonal(heuristic, 0)
    pheromone = np.ones((n, n))
    best_tour, best_length = None, float("inf")

    for _ in range(iterations):
        tours = []
        for _ in range(ant_count):
            start = int(rng.integers(n))
            tour = [start]
            unvisited = set(range(n)) - {start}

            while unvisited:
                current = tour[-1]
                candidates = np.array(sorted(unvisited))
                desirability = pheromone[current, candidates]
                desirability *= heuristic[current, candidates] ** 3
                probability = desirability / desirability.sum()
                next_city = int(rng.choice(candidates, p=probability))
                tour.append(next_city)
                unvisited.remove(next_city)

            tour = np.array(tour)
            length = float(distance[tour, np.roll(tour, -1)].sum())
            tours.append((tour, length))
            if length < best_length:
                best_tour, best_length = tour.copy(), length

        # 先挥发，再让短路线释放更多信息素。
        pheromone *= 0.6
        for tour, length in tours:
            amount = 1.0 / length
            for city, next_city in zip(tour, np.roll(tour, -1)):
                pheromone[city, next_city] += amount
                pheromone[next_city, city] += amount

    return best_tour, best_length


if __name__ == "__main__":
    route, length = ant_colony()
    print("城市顺序:", (route + 1).tolist())
    print("闭环长度:", round(length, 4))
