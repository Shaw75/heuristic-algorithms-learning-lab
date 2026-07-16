"""粒子群算法：最小化 f(x, y) = x² + y²。"""

import numpy as np


def sphere(x):
    return np.sum(x**2, axis=-1)


def particle_swarm(seed=11, particle_count=25, iterations=80):
    rng = np.random.default_rng(seed)
    position = rng.uniform(-5, 5, (particle_count, 2))
    velocity = rng.uniform(-1, 1, (particle_count, 2))
    personal_best = position.copy()
    personal_value = sphere(personal_best)
    global_best = personal_best[np.argmin(personal_value)].copy()

    for _ in range(iterations):
        r1 = rng.random(position.shape)
        r2 = rng.random(position.shape)
        velocity = (
            0.72 * velocity
            + 1.49 * r1 * (personal_best - position)
            + 1.49 * r2 * (global_best - position)
        )
        position = np.clip(position + velocity, -5, 5)
        value = sphere(position)

        improved = value < personal_value
        personal_best[improved] = position[improved]
        personal_value[improved] = value[improved]
        global_best = personal_best[np.argmin(personal_value)].copy()

    return global_best, float(sphere(global_best))


if __name__ == "__main__":
    point, value = particle_swarm()
    print("最好位置:", np.round(point, 6).tolist())
    print("最小函数值:", value)
