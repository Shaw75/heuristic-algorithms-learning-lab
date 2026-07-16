"""教学版狼群算法：最小化 f(x, y) = x² + y²。"""

import numpy as np


def sphere(x):
    return np.sum(x**2, axis=-1)


def wolf_pack(seed=19, wolf_count=25, iterations=80):
    rng = np.random.default_rng(seed)
    wolves = rng.uniform(-5, 5, (wolf_count, 2))
    best = wolves[np.argmin(sphere(wolves))].copy()

    for step in range(iterations):
        # 1. 探寻：每只狼尝试一个随机方向。
        direction = rng.normal(size=wolves.shape)
        direction /= np.linalg.norm(direction, axis=1, keepdims=True)
        candidate = np.clip(wolves + 0.45 * direction, -5, 5)
        improved = sphere(candidate) < sphere(wolves)
        wolves[improved] = candidate[improved]

        # 2. 召唤：狼群向当前头狼靠近。
        leader = wolves[np.argmin(sphere(wolves))].copy()
        strength = rng.uniform(0.25, 0.65, (wolf_count, 1))
        wolves += strength * (leader - wolves)

        # 3. 围攻：在头狼附近做逐渐变细的局部搜索。
        radius = 0.7 * (1 - step / iterations) + 0.02
        local = leader + rng.normal(0, radius, wolves.shape)
        local = np.clip(local, -5, 5)
        improved = sphere(local) < sphere(wolves)
        wolves[improved] = local[improved]

        # 4. 强者生存：用随机新狼替换最弱的 20%。
        weak = np.argsort(sphere(wolves))[-max(1, wolf_count // 5) :]
        wolves[weak] = rng.uniform(-5, 5, (len(weak), 2))
        current = wolves[np.argmin(sphere(wolves))]
        if sphere(current[None, :])[0] < sphere(best[None, :])[0]:
            best = current.copy()

    return best, float(sphere(best[None, :])[0])


if __name__ == "__main__":
    point, value = wolf_pack()
    print("最好位置:", np.round(point, 6).tolist())
    print("最小函数值:", value)
