"""遗传算法：求解一个 0/1 背包小例子。"""

import numpy as np


def genetic_algorithm(seed=7, population_size=30, generations=60):
    weights = np.array([2, 3, 4, 5, 9])
    values = np.array([3, 4, 5, 8, 10])
    capacity = 10
    rng = np.random.default_rng(seed)

    def repair(x):
        """超重时，优先删除价值重量比较低的物品。"""
        x = x.copy()
        for i in np.argsort(values / weights):
            if x @ weights <= capacity:
                break
            x[i] = 0
        return x

    population = rng.integers(0, 2, (population_size, len(weights)))
    population = np.array([repair(x) for x in population])
    best = population[0].copy()

    for _ in range(generations):
        scores = population @ values
        elite = population[np.argmax(scores)].copy()
        if elite @ values > best @ values:
            best = elite.copy()

        children = [elite]
        while len(children) < population_size:
            # 锦标赛选择：随机取 3 个，留下其中最好者。
            ids = rng.integers(0, population_size, 3)
            p1 = population[ids[np.argmax(scores[ids])]].copy()
            ids = rng.integers(0, population_size, 3)
            p2 = population[ids[np.argmax(scores[ids])]].copy()

            # 单点交叉。
            point = rng.integers(1, len(weights))
            p1[point:], p2[point:] = p2[point:].copy(), p1[point:].copy()

            # 以 5% 概率翻转每个基因。
            p1 ^= rng.random(len(weights)) < 0.05
            p2 ^= rng.random(len(weights)) < 0.05
            children.extend([repair(p1), repair(p2)])

        population = np.array(children[:population_size], dtype=int)

    return best, int(best @ weights), int(best @ values)


if __name__ == "__main__":
    solution, total_weight, total_value = genetic_algorithm()
    print("选择方案:", solution.tolist())
    print("总重量:", total_weight)
    print("总价值:", total_value)
