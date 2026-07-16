// 面向零基础读者的四套算法课程数据。
// 公式使用 String.raw，避免 JavaScript 把 LaTeX 的反斜杠当作转义字符。

const gaCode = `import numpy as np


def genetic_algorithm(seed=7, population_size=30, generations=60):
    weights = np.array([2, 3, 4, 5, 9])
    values = np.array([3, 4, 5, 8, 10])
    capacity = 10
    rng = np.random.default_rng(seed)

    def repair(x):
        # 超重时，优先删除价值/重量比较低的物品。
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

        children = [elite]  # 精英保留
        while len(children) < population_size:
            # 锦标赛选择：随机取 3 个，留下其中最好者。
            ids = rng.integers(0, population_size, 3)
            p1 = population[ids[np.argmax(scores[ids])]].copy()
            ids = rng.integers(0, population_size, 3)
            p2 = population[ids[np.argmax(scores[ids])]].copy()

            # 单点交叉。
            point = rng.integers(1, len(weights))
            p1[point:], p2[point:] = p2[point:].copy(), p1[point:].copy()

            # 每个基因以 5% 的概率翻转。
            p1 ^= rng.random(len(weights)) < 0.05
            p2 ^= rng.random(len(weights)) < 0.05
            children.extend([repair(p1), repair(p2)])

        population = np.array(children[:population_size], dtype=int)

    return best, int(best @ weights), int(best @ values)


solution, total_weight, total_value = genetic_algorithm()
print("选择方案:", solution.tolist())
print("总重量:", total_weight)
print("总价值:", total_value)`;

const acoCode = `import numpy as np


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


route, length = ant_colony()
print("城市顺序:", (route + 1).tolist())
print("闭环长度:", round(length, 4))`;

const psoCode = `import numpy as np


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


point, value = particle_swarm()
print("最好位置:", np.round(point, 6).tolist())
print("最小函数值:", value)`;

const wpaCode = `import numpy as np


def sphere(x):
    return np.sum(x**2, axis=-1)


def wolf_pack(seed=19, wolf_count=25, iterations=80):
    rng = np.random.default_rng(seed)
    wolves = rng.uniform(-5, 5, (wolf_count, 2))
    best = wolves[np.argmin(sphere(wolves))].copy()

    for step in range(iterations):
        # 1. 探寻：每只狼尝试一个随机单位方向。
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
        progress = step / max(iterations - 1, 1)
        radius = 0.02 + (0.7 - 0.02) * (1 - progress)
        local = leader + rng.normal(0, radius, wolves.shape)
        local = np.clip(local, -5, 5)
        improved = sphere(local) < sphere(wolves)
        wolves[improved] = local[improved]

        # 4. 强者生存：用随机新狼替换最弱的 20%。
        weak = np.argsort(sphere(wolves))[-max(1, wolf_count // 5):]
        wolves[weak] = rng.uniform(-5, 5, (len(weak), 2))
        current = wolves[np.argmin(sphere(wolves))]
        if sphere(current[None, :])[0] < sphere(best[None, :])[0]:
            best = current.copy()

    return best, float(sphere(best[None, :])[0])


point, value = wolf_pack()
print("最好位置:", np.round(point, 6).tolist())
print("最小函数值:", value)`;

export const courseLessons = [
  {
    id: "ga",
    number: "01",
    title: "遗传算法",
    short: "GA",
    accent: "#f34f52",
    subtitle: "把候选解当作染色体：让好方案繁殖，也给新可能留一扇门",
    problem: "0/1 背包：容量有限时，怎样装出最高总价值？",
    difficulty: "入门",
    estimatedMinutes: 25,
    learningGoals: [
      "看懂“染色体、基因、种群、适应度”分别对应优化问题里的什么。",
      "能用选择、交叉、变异和精英保留解释一代种群如何产生下一代。",
      "能把一个 0/1 背包问题写成数学模型，并手算一次选择与交叉。",
    ],
    story:
      "你要准备一次徒步，只能背 10 kg。水瓶、三明治、相机、外套和书都有重量与价值。穷举当然能找到答案，但物品一多，组合数会变成 2ⁿ。遗传算法不逐个试完，而是同时养一群装包方案，让表现好的方案更容易留下“后代”。",
    intuition:
      "一个候选解就是一条 0/1 染色体。1 表示带走，0 表示不带。选择负责保留好经验，交叉负责重新组合已有片段，变异负责偶尔跳到没见过的方案；三者共同平衡“利用已知好解”和“探索未知区域”。",
    optimizationModel: {
      title: "0/1 背包的数学模型",
      latex: String.raw`\max_{\mathbf{x}}\; f(\mathbf{x})=\sum_{i=1}^{n}v_i x_i`,
      subjectTo: [
        String.raw`\sum_{i=1}^{n}w_i x_i\le C`,
        String.raw`x_i\in\{0,1\},\quad i=1,\ldots,n`,
      ],
      plain:
        "目标是让被选物品的总价值最大；但总重量不能超过背包容量。每个 xᵢ 只能取 0 或 1，所以这是离散组合优化问题。",
    },
    variables: [
      { symbol: String.raw`x_i`, meaning: "第 i 件物品是否被选择", example: "x₄=1 表示带外套" },
      { symbol: String.raw`v_i`, meaning: "第 i 件物品的价值", example: "外套价值 v₄=8" },
      { symbol: String.raw`w_i`, meaning: "第 i 件物品的重量", example: "外套重量 w₄=5" },
      { symbol: String.raw`C`, meaning: "背包容量上限", example: "C=10" },
      { symbol: String.raw`N`, meaning: "种群中的候选解数量", example: "N=30 条染色体" },
      { symbol: String.raw`f_i`, meaning: "第 i 个候选解的适应度", example: "可行方案的总价值" },
    ],
    mechanismSteps: [
      {
        title: "编码与初始化",
        action: "把方案写成 n 位 0/1 串，并随机生成 N 条染色体。",
        why: "同时从搜索空间的不同位置出发，比只改一个方案更不容易被早期选择困住。",
        math: String.raw`\mathbf{x}^{(k)}=(x_1,\ldots,x_n),\quad k=1,\ldots,N`,
      },
      {
        title: "计算适应度",
        action: "计算每条染色体的重量与价值；超重方案可以修复或给予惩罚。",
        why: "适应度把“方案有多好”变成算法可以比较的数字。",
        math: String.raw`W(\mathbf{x})=\sum_i w_i x_i,\quad V(\mathbf{x})=\sum_i v_i x_i`,
      },
      {
        title: "选择父代",
        action: "让高适应度个体更容易成为父代，但不保证它一定被选中。",
        why: "有偏好但不绝对，才能既推进搜索又保留多样性。",
        math: String.raw`p_i=f_i\big/\sum_{j=1}^{N}f_j`,
      },
      {
        title: "交叉重组",
        action: "选一个切点，交换两条父代染色体的后半段。",
        why: "把两个已有方案中的好片段拼到一起。",
        math: String.raw`110\mid10+001\mid10\longrightarrow11010,\;00110`,
      },
      {
        title: "随机变异",
        action: "每个基因以很小概率由 0 变 1 或由 1 变 0。",
        why: "补回交叉无法创造的新基因组合，降低整个种群过早相同的风险。",
        math: String.raw`x_j' = 1-x_j\quad\text{with probability }p_m`,
      },
      {
        title: "精英保留与迭代",
        action: "把当前最好个体直接放入下一代，其余位置由子代填充。",
        why: "避免随机交叉或变异把已经找到的最好解弄丢。",
        math: String.raw`f_{\mathrm{best}}^{t+1}\ge f_{\mathrm{best}}^{t}`,
      },
    ],
    workedExample: {
      title: "手算一轮：10 kg 背包",
      input: [
        { label: "重量", value: "w=(2,3,4,5,9)" },
        { label: "价值", value: "v=(3,4,5,8,10)" },
        { label: "容量", value: "C=10" },
        { label: "两位父代", value: "A=11010，B=00110" },
      ],
      steps: [
        {
          label: "读懂染色体 A",
          latex: String.raw`W(A)=2+3+5=10,\qquad V(A)=3+4+8=15`,
          explanation: "A 选择水瓶、三明治和外套，刚好装满，适应度为 15。",
        },
        {
          label: "读懂染色体 B",
          latex: String.raw`W(B)=4+5=9,\qquad V(B)=5+8=13`,
          explanation: "B 选择相机和外套，也是可行方案，适应度为 13。",
        },
        {
          label: "看看选择概率",
          latex: String.raw`\text{若种群适应度为 }(15,13,12),\quad p_A=\frac{15}{40}=0.375`,
          explanation: "A 最好，所以机会最大；但它不是 100% 被选中，较弱方案仍有机会提供不同基因。",
        },
        {
          label: "单点交叉并修复",
          latex: String.raw`11\mid010+00\mid110\longrightarrow11110,\;00010`,
          explanation:
            "子代 11110 的重量是 14，超过容量。删除价值重量比最低的相机后得到 11010，重量 10、价值 15。",
        },
        {
          label: "变异与精英保留",
          latex: String.raw`P(x_j'=1-x_j)=p_m,\qquad A_{\mathrm{elite}}\rightarrow\text{下一代}`,
          explanation: "少量基因随机翻转；同时直接保留 A，确保这一代找到的价值 15 不会丢失。",
        },
      ],
      conclusion:
        "一轮之后，新种群既继承了高价值方案的结构，也通过交叉和变异产生了新方案。反复迭代后，示例通常会稳定找到 11010，总重量 10、总价值 15。",
    },
    coreFormulas: [
      {
        title: "带可行性判断的适应度",
        latex: String.raw`F(\mathbf{x})=\begin{cases}\sum_i v_i x_i,&\sum_i w_i x_i\le C\\0,&\text{超重}\end{cases}`,
        plain: "可行时用总价值评分；超重时给 0 分。工程中也常用修复函数或连续惩罚代替直接清零。",
        termBreakdown: [
          { term: String.raw`F(\mathbf{x})`, meaning: "染色体 x 的适应度" },
          { term: String.raw`\sum_i v_i x_i`, meaning: "选中物品的价值总和" },
          { term: String.raw`\sum_i w_i x_i\le C`, meaning: "方案必须满足容量约束" },
        ],
      },
      {
        title: "轮盘赌选择概率",
        latex: String.raw`p_i=\frac{f_i}{\sum_{j=1}^{N}f_j}`,
        plain: "把每个个体的适应度除以全体适应度之和，得到被抽中的相对概率。若适应度可能为负或全为 0，应平移分数或改用锦标赛选择。",
        termBreakdown: [
          { term: String.raw`p_i`, meaning: "第 i 个个体被选择的概率" },
          { term: String.raw`f_i`, meaning: "第 i 个个体的适应度" },
          { term: String.raw`N`, meaning: "种群规模" },
        ],
      },
      {
        title: "位翻转变异",
        latex: String.raw`x_j'=\begin{cases}1-x_j,&u_j<p_m\\x_j,&u_j\ge p_m\end{cases},\quad u_j\sim U(0,1)`,
        plain: "给每个基因抽一个 0 到 1 的随机数；小于变异率时才翻转。",
        termBreakdown: [
          { term: String.raw`p_m`, meaning: "单个基因的变异概率" },
          { term: String.raw`u_j`, meaning: "第 j 个基因独立抽到的随机数" },
          { term: String.raw`1-x_j`, meaning: "0/1 基因翻转" },
        ],
      },
    ],
    parameters: [
      { symbol: String.raw`N`, name: "种群规模", effect: "越大覆盖越广，但每代评估更慢", tooSmall: "多样性不足，容易早熟", tooLarge: "耗时增加，收益可能有限" },
      { symbol: String.raw`p_c`, name: "交叉率", effect: "决定重组父代片段的频率", tooSmall: "已有好片段组合得太慢", tooLarge: "频繁打散结构，需要精英保护" },
      { symbol: String.raw`p_m`, name: "变异率", effect: "控制新基因组合的出现", tooSmall: "种群趋同后难以跳出", tooLarge: "搜索接近随机抽样" },
      { symbol: String.raw`G`, name: "迭代代数", effect: "决定进化持续多久", tooSmall: "尚未稳定就停止", tooLarge: "结果不再改善却继续计算" },
      { symbol: String.raw`k`, name: "锦标赛规模", effect: "k 越大，偏爱强者越明显", tooSmall: "选择压力弱，改进缓慢", tooLarge: "弱个体很快消失，多样性降低" },
    ],
    commonMistakes: [
      { title: "把目标值和适应度完全等同", wrong: "最小化问题直接拿目标值做轮盘赌。", right: "先把评分转换为“越大越好”，或使用只依赖排序的锦标赛选择。" },
      { title: "不处理超重子代", wrong: "交叉后无论是否超重都参与比较。", right: "明确使用修复、惩罚或可行性优先规则，并在代码里始终一致。" },
      { title: "变异率理解成每代只变一个基因", wrong: "整条染色体只抽一次随机数。", right: "常见位变异是每个基因独立以 pₘ 概率翻转。" },
      { title: "忘记保存历史最好解", wrong: "只返回最后一代的随便一个个体。", right: "维护 best 或使用精英保留，返回搜索过程中见过的最好可行解。" },
    ],
    quiz: {
      question: "当种群已经几乎全是相同染色体时，哪个操作最直接地帮助产生从未出现过的基因组合？",
      options: ["适应度评估", "精英保留", "随机变异", "增加选择压力"],
      answer: 2,
      explanation: "变异会以小概率主动翻转基因，是种群趋同时恢复多样性的直接来源。精英保留只负责不丢掉最好解。",
    },
    framework: {
      title: "遗传算法通用框架",
      steps: [
        { label: "定义编码与适应度", action: "确定一条染色体怎样表示一个合法方案。" },
        { label: "初始化种群", action: "随机产生 N 个候选解并处理约束。" },
        { label: "循环评估", action: "计算适应度并更新历史最好解。" },
        { label: "选择父代", action: "按适应度偏好抽取父代。" },
        { label: "交叉与变异", action: "生成子代，再修复不合法方案。" },
        { label: "形成新一代", action: "保留精英，用子代补满种群。" },
        { label: "停止并返回", action: "达到代数或长期无改进时，返回历史最好解。" },
      ],
    },
    codeLanguage: "python",
    codeFile: "/examples/ga_knapsack.py",
    code: gaCode,
  },

  {
    id: "aco",
    number: "02",
    title: "蚁群算法",
    short: "ACO",
    accent: "#f58a13",
    subtitle: "每只蚂蚁只做下一步选择，整个群体却能逐渐强化一条好路线",
    problem: "旅行商问题（TSP）：访问所有城市一次并回到起点，怎样让总路程最短？",
    difficulty: "入门",
    estimatedMinutes: 25,
    learningGoals: [
      "理解信息素 τ、距离启发 η 和转移概率分别扮演什么角色。",
      "能手算一只蚂蚁从当前城市选择下一城市的概率。",
      "能解释为什么信息素既要强化也要挥发，以及二者如何平衡。",
    ],
    story:
      "蚂蚁找食物时不会先画出整条路线，而是在每个路口决定下一步。短路上的蚂蚁往返更快，会较快留下浓的信息素；后来者更容易沿着这条路走，正反馈便把群体逐渐聚集到好路线。算法借用了这个机制，但额外加入挥发，避免一次偶然选择永久主宰整个群体。",
    intuition:
      "ACO 是“边走边构造解”的算法。每一步都混合两类信息：信息素代表群体积累的历史经验，1/距离代表眼前的局部常识。走完一整圈后，短路线获得更多奖励，旧信息则按比例淡化。",
    optimizationModel: {
      title: "对称旅行商问题的数学模型",
      latex: String.raw`\min_{\pi\in S_n}\;L(\pi)=\sum_{t=1}^{n-1}d_{\pi_t,\pi_{t+1}}+d_{\pi_n,\pi_1}`,
      subjectTo: [
        String.raw`\pi=(\pi_1,\ldots,\pi_n)\text{ 是 }\{1,\ldots,n\}\text{ 的一个排列}`,
        String.raw`d_{ij}=d_{ji}\ge 0,\qquad d_{ii}=0`,
      ],
      plain:
        "π 给出城市访问顺序；每个城市恰好出现一次，最后还要从末城回到起点。所有相邻边（含返程边）的距离相加，就是要最小化的闭环长度。",
    },
    variables: [
      { symbol: String.raw`\pi`, meaning: "一条完整的城市访问顺序", example: "π=(A,B,D,C)" },
      { symbol: String.raw`d_{ij}`, meaning: "城市 i 与 j 之间的距离", example: "d_AB=2" },
      { symbol: String.raw`\tau_{ij}`, meaning: "边 (i,j) 上的信息素浓度", example: "τ_AB=2" },
      { symbol: String.raw`\eta_{ij}=1/d_{ij}`, meaning: "距离启发值；距离越短越大", example: "d_AB=2 时 η_AB=0.5" },
      { symbol: String.raw`N_i^{(k)}`, meaning: "蚂蚁 k 在城市 i 时仍可访问的城市集合", example: "已经访问的城市不再进入集合" },
      { symbol: String.raw`\rho`, meaning: "信息素挥发率", example: "ρ=0.2 表示保留 80%" },
    ],
    mechanismSteps: [
      {
        title: "初始化信息素",
        action: "给所有可走的边相同正值 τ₀。",
        why: "搜索刚开始时没有历史依据，保持对称才不会凭空偏向某条边。",
        math: String.raw`\tau_{ij}^{0}=\tau_0>0,\quad i\ne j`,
      },
      {
        title: "逐步选择下一城市",
        action: "只在未访问集合中，按“信息素 × 距离启发”计算概率并随机抽取。",
        why: "随机性保留探索，权重又让短边和历史好边更有机会。",
        math: String.raw`p_{ij}^{(k)}\propto\tau_{ij}^{\alpha}\eta_{ij}^{\beta}`,
      },
      {
        title: "构造完整闭环",
        action: "访问完所有城市后回到起点，并计算整条路线长度。",
        why: "一条边看起来短，不等于整条闭环一定短；必须评价完整解。",
        math: String.raw`L_k=\sum_{t=1}^{n-1}d_{\pi_t,\pi_{t+1}}+d_{\pi_n,\pi_1}`,
      },
      {
        title: "挥发旧信息",
        action: "所有边的信息素先乘以 1-ρ。",
        why: "让早期错误经验逐渐消退，也防止信息素无限累积。",
        math: String.raw`\tau_{ij}\leftarrow(1-\rho)\tau_{ij}`,
      },
      {
        title: "奖励本轮路线",
        action: "蚂蚁走过的边增加 Q/Lₖ；路线越短，单条边得到的奖励越大。",
        why: "把完整解的质量反馈到组成它的边上，形成正反馈。",
        math: String.raw`\Delta\tau_{ij}^{(k)}=Q/L_k\quad\text{if }(i,j)\in\pi^{(k)}`,
      },
      {
        title: "记录最好路线并重复",
        action: "保存历史最短闭环，再让下一批蚂蚁读取更新后的信息素。",
        why: "信息在多轮之间积累，群体偏好才会逐渐成形。",
        math: String.raw`L_{\mathrm{best}}\leftarrow\min(L_{\mathrm{best}},L_1,\ldots,L_m)`,
      },
    ],
    workedExample: {
      title: "手算一次转移与更新",
      input: [
        { label: "当前位置", value: "城市 A" },
        { label: "候选城市", value: "B、C" },
        { label: "距离", value: "d_AB=2，d_AC=4" },
        { label: "信息素", value: "τ_AB=2，τ_AC=1" },
        { label: "参数", value: "α=1，β=2，ρ=0.2，Q=1" },
      ],
      steps: [
        {
          label: "计算距离启发",
          latex: String.raw`\eta_{AB}=\frac12,\qquad\eta_{AC}=\frac14`,
          explanation: "B 更近，所以它的启发值更大。",
        },
        {
          label: "计算未归一化吸引力",
          latex: String.raw`a_{AB}=2^1(1/2)^2=0.5,\qquad a_{AC}=1^1(1/4)^2=0.0625`,
          explanation: "这里既考虑历史信息素，也考虑距离；β=2 让距离差异被平方放大。",
        },
        {
          label: "归一化成概率",
          latex: String.raw`p_{AB}=\frac{0.5}{0.5+0.0625}=\frac89\approx0.889,\qquad p_{AC}=\frac19`,
          explanation: "B 更可能被选择，但 C 仍保留约 11.1% 的探索机会。",
        },
        {
          label: "挥发并奖励",
          latex: String.raw`\tau_{AB}'=(1-0.2)\times2+\frac1{10}=1.7`,
          explanation: "假设本轮一条长度 L=10 的路线使用了 AB。旧信息素先变成 1.6，再获得 0.1 奖励。",
        },
      ],
      conclusion:
        "转移概率不是“永远选最短边”，而是带偏好的随机选择；信息素更新也不是只加不减。正是随机选择、奖励和挥发的组合，让 ACO 能在探索与利用之间取得平衡。",
    },
    coreFormulas: [
      {
        title: "状态转移概率",
        latex: String.raw`p_{ij}^{(k)}=\frac{\tau_{ij}^{\alpha}\eta_{ij}^{\beta}}{\sum_{l\in N_i^{(k)}}\tau_{il}^{\alpha}\eta_{il}^{\beta}},\quad j\in N_i^{(k)}`,
        plain: "分子是候选边的吸引力，分母把所有可选边的吸引力相加，因此这些概率之和等于 1。",
        termBreakdown: [
          { term: String.raw`\tau_{ij}^{\alpha}`, meaning: "历史经验的加权影响" },
          { term: String.raw`\eta_{ij}^{\beta}`, meaning: "当前距离启发的加权影响" },
          { term: String.raw`N_i^{(k)}`, meaning: "蚂蚁 k 当前尚未访问的城市" },
        ],
      },
      {
        title: "信息素挥发与沉积",
        latex: String.raw`\tau_{ij}\leftarrow(1-\rho)\tau_{ij}+\sum_{k=1}^{m}\Delta\tau_{ij}^{(k)}`,
        plain: "先保留旧信息素的 1-ρ，再叠加本轮 m 只蚂蚁对这条边的奖励。",
        termBreakdown: [
          { term: String.raw`\rho`, meaning: "挥发率，通常位于 (0,1]" },
          { term: String.raw`m`, meaning: "每轮蚂蚁数量" },
          { term: String.raw`\Delta\tau_{ij}^{(k)}`, meaning: "第 k 只蚂蚁给边 (i,j) 的奖励" },
        ],
      },
      {
        title: "按路线质量奖励",
        latex: String.raw`\Delta\tau_{ij}^{(k)}=\begin{cases}Q/L_k,&(i,j)\text{ 在路线 }k\text{ 中}\\0,&\text{否则}\end{cases}`,
        plain: "路线越短，Q/Lₖ 越大，所以短路线沿途的边被强化得更多。",
        termBreakdown: [
          { term: String.raw`Q`, meaning: "统一的奖励尺度" },
          { term: String.raw`L_k`, meaning: "第 k 只蚂蚁的完整闭环长度" },
          { term: String.raw`Q/L_k`, meaning: "这只蚂蚁对每条已走边的沉积量" },
        ],
      },
    ],
    parameters: [
      { symbol: String.raw`\alpha`, name: "信息素权重", effect: "越大越相信历史路线", tooSmall: "群体经验几乎不起作用", tooLarge: "早期随机路线可能迅速垄断" },
      { symbol: String.raw`\beta`, name: "启发权重", effect: "越大越偏爱当前较短的边", tooSmall: "忽略明显的距离信息", tooLarge: "接近贪心最近邻，可能忽略全局闭环" },
      { symbol: String.raw`\rho`, name: "挥发率", effect: "控制旧经验消失速度", tooSmall: "错误经验保留太久", tooLarge: "刚学到的信息很快消失" },
      { symbol: String.raw`m`, name: "蚂蚁数量", effect: "决定每轮采样多少条路线", tooSmall: "路线样本少、波动大", tooLarge: "每轮计算成本高" },
      { symbol: String.raw`Q`, name: "沉积尺度", effect: "统一缩放奖励强度", tooSmall: "新路线难以改变旧信息", tooLarge: "少数路线造成信息素陡增" },
    ],
    commonMistakes: [
      { title: "允许蚂蚁重复访问城市", wrong: "下一城市从全部城市中选择。", right: "维护未访问集合 N，只有完成所有城市后才回到起点。" },
      { title: "忘记把权重归一化", wrong: "直接把 τᵅηᵝ 当概率传给随机选择。", right: "除以全部候选权重之和，确保概率和为 1。" },
      { title: "距离为 0 时直接取倒数", wrong: "计算 1/0 得到无穷大。", right: "屏蔽自身边，并对重合点使用很小正数或先合并重复城市。" },
      { title: "把 ρ 当作保留率", wrong: "公式和代码一处乘 ρ，另一处乘 1-ρ。", right: "先统一定义：本课程中 ρ 是挥发率，因此旧信息保留 1-ρ。" },
      { title: "无向图只更新一个方向", wrong: "只增加 τᵢⱼ，不增加 τⱼᵢ。", right: "对称 TSP 中两方向代表同一条边，应同时更新；有向问题则分别处理。" },
    ],
    quiz: {
      question: "其他条件不变时，如果把 β 调得非常大，蚂蚁的行为最可能变成什么？",
      options: ["几乎随机游走", "非常偏爱距离最近的候选城市", "完全只看信息素", "停止产生信息素"],
      answer: 1,
      explanation: "η=1/d，β 很大会把距离启发的差异强烈放大，行为会接近最近邻贪心；这不保证整条闭环全局最短。",
    },
    framework: {
      title: "蚁群算法通用框架",
      steps: [
        { label: "建图", action: "定义节点、边、代价和启发函数 η。" },
        { label: "初始化信息素", action: "为可行边设置相同正值 τ₀。" },
        { label: "逐蚁构造解", action: "从可行候选集合按转移概率选择下一节点。" },
        { label: "评价完整解", action: "闭合路线、计算总长度并更新历史最好。" },
        { label: "全局挥发", action: "所有边的信息素乘以 1-ρ。" },
        { label: "路线沉积", action: "按 Q/L 奖励本轮路线使用的边。" },
        { label: "停止并返回", action: "达到轮数或长期无改进时，返回历史最好路线。" },
      ],
    },
    codeLanguage: "python",
    codeFile: "/examples/aco_tsp.py",
    code: acoCode,
  },

  {
    id: "pso",
    number: "03",
    title: "粒子群算法",
    short: "PSO",
    accent: "#00a7ae",
    subtitle: "每个粒子保留自己的最好经验，同时向全群最好的位置学习",
    problem: "连续函数优化：在平面上寻找 f(x,y)=x²+y² 的最低点",
    difficulty: "入门",
    estimatedMinutes: 22,
    learningGoals: [
      "能区分粒子的当前位置 x、速度 v、个体最好 pbest 和群体最好 gbest。",
      "能把速度公式拆成惯性、个体学习、群体学习三部分。",
      "能手算一个粒子的一次速度与位置更新，并判断是否更新 pbest。",
    ],
    story:
      "想象一群鸟在雾中寻找最低的山谷。每只鸟只知道自己去过的最低点，也能听见全群目前发现的最低点。它不会瞬移到答案，而是根据原来的飞行趋势、自己的记忆和群体消息，改变下一步速度。",
    intuition:
      "PSO 的核心不是“粒子直接追最优点”，而是先更新速度，再由速度更新位置。惯性让它继续探索，pbest 把它拉回个人成功区域，gbest 让信息在群体中共享；随机数让不同粒子不会走出完全相同的轨迹。",
    optimizationModel: {
      title: "Sphere 测试函数",
      latex: String.raw`\min_{\mathbf{x}}\;f(\mathbf{x})=\sum_{d=1}^{D}x_d^2`,
      subjectTo: [
        String.raw`-5\le x_d\le5,\quad d=1,\ldots,D`,
        String.raw`\mathbf{x}^{\star}=\mathbf{0},\qquad f(\mathbf{x}^{\star})=0`,
      ],
      plain:
        "每个坐标的平方都不小于 0，所以所有坐标都等于 0 时总和最小。二维时曲面像一个光滑碗，离原点越远，函数值越大。",
    },
    variables: [
      { symbol: String.raw`\mathbf{x}_i^t`, meaning: "粒子 i 在第 t 轮的位置", example: "x=(4,2)" },
      { symbol: String.raw`\mathbf{v}_i^t`, meaning: "粒子 i 当前的速度", example: "v=(-0.5,0.2)" },
      { symbol: String.raw`\mathbf{p}_i`, meaning: "粒子 i 历史上到过的最好位置 pbest", example: "p=(3,1)" },
      { symbol: String.raw`\mathbf{g}`, meaning: "全体粒子历史上发现的最好位置 gbest", example: "g=(0.4,-0.2)" },
      { symbol: String.raw`\omega`, meaning: "惯性权重", example: "ω=0.72" },
      { symbol: String.raw`c_1,c_2`, meaning: "个体与群体学习系数", example: "c₁=c₂=1.49" },
      { symbol: String.raw`\mathbf{r}_1,\mathbf{r}_2`, meaning: "逐维独立的 [0,1) 随机向量", example: "每轮重新抽取" },
    ],
    mechanismSteps: [
      {
        title: "初始化位置与速度",
        action: "在边界内随机放置一群粒子，并为每个粒子赋初速度。",
        why: "覆盖多个起点，为全局搜索提供多样性。",
        math: String.raw`\mathbf{x}_i^0\sim U(\mathbf{l},\mathbf{u})`,
      },
      {
        title: "建立两层记忆",
        action: "每个粒子先把当前位置记作 pbest，再从所有 pbest 中选出 gbest。",
        why: "个人记忆防止忘记自己的成功，群体记忆负责传播最好的发现。",
        math: String.raw`\mathbf{p}_i\leftarrow\mathbf{x}_i^0,\qquad\mathbf{g}=\arg\min_{\mathbf{p}_i}f(\mathbf{p}_i)`,
      },
      {
        title: "更新速度",
        action: "将惯性、朝向 pbest 的拉力、朝向 gbest 的拉力相加。",
        why: "三个分量共同决定探索强度和收敛方向。",
        math: String.raw`\mathbf{v}_i^{t+1}=\omega\mathbf{v}_i^t+c_1\mathbf{r}_1\odot(\mathbf{p}_i-\mathbf{x}_i^t)+c_2\mathbf{r}_2\odot(\mathbf{g}-\mathbf{x}_i^t)`,
      },
      {
        title: "更新位置并处理边界",
        action: "位置加上新速度；若越界，则裁剪、反弹或重新采样。",
        why: "优化变量有合法范围，粒子不能无限飞出搜索区。",
        math: String.raw`\mathbf{x}_i^{t+1}=\operatorname{clip}(\mathbf{x}_i^t+\mathbf{v}_i^{t+1},\mathbf{l},\mathbf{u})`,
      },
      {
        title: "更新 pbest 与 gbest",
        action: "只有新位置更好时才替换个人最好，再重新比较出群体最好。",
        why: "“当前位置”和“最好记忆”必须分开，否则粒子变差时会丢掉成功经验。",
        math: String.raw`\mathbf{p}_i\leftarrow\mathbf{x}_i^{t+1}\quad\text{if }f(\mathbf{x}_i^{t+1})<f(\mathbf{p}_i)`,
      },
      {
        title: "重复直到停止",
        action: "持续飞行，记录每轮 gbest 的目标值。",
        why: "收敛曲线能告诉你算法是否仍在改善，以及是否过早停滞。",
        math: String.raw`f(\mathbf{g}^{t+1})\le f(\mathbf{g}^{t})`,
      },
    ],
    workedExample: {
      title: "一维粒子的一次完整更新",
      input: [
        { label: "当前位置", value: "x=4" },
        { label: "当前速度", value: "v=-0.5" },
        { label: "个人最好", value: "pbest=3" },
        { label: "群体最好", value: "gbest=1" },
        { label: "参数与随机数", value: "ω=0.7，c₁=c₂=1.5，r₁=0.4，r₂=0.2" },
      ],
      steps: [
        {
          label: "惯性分量",
          latex: String.raw`\omega v=0.7\times(-0.5)=-0.35`,
          explanation: "粒子原本向左飞，所以惯性仍推动它向左。",
        },
        {
          label: "个体学习分量",
          latex: String.raw`c_1r_1(p-x)=1.5\times0.4\times(3-4)=-0.6`,
          explanation: "个人最好在当前位置左侧，因此这个分量也指向左。",
        },
        {
          label: "群体学习分量",
          latex: String.raw`c_2r_2(g-x)=1.5\times0.2\times(1-4)=-0.9`,
          explanation: "群体最好更靠左，继续提供向左的拉力。",
        },
        {
          label: "合成速度并移动",
          latex: String.raw`v'=-0.35-0.6-0.9=-1.85,\qquad x'=4-1.85=2.15`,
          explanation: "PSO 先算出新速度，再把新速度加到位置上。",
        },
        {
          label: "评价并更新记忆",
          latex: String.raw`f(2.15)=2.15^2=4.6225< f(3)=9`,
          explanation: "新位置比旧 pbest 更好，所以 pbest 更新为 2.15；但它仍不如 gbest=1，因此全群最好不变。",
        },
      ],
      conclusion:
        "一次更新后，粒子从 4 移到 2.15，明显靠近最优点 0。关键顺序是：速度更新 → 位置更新 → 目标评价 → pbest 更新 → gbest 更新。",
    },
    coreFormulas: [
      {
        title: "速度更新",
        latex: String.raw`\mathbf{v}_i^{t+1}=\underbrace{\omega\mathbf{v}_i^t}_{\text{惯性}}+\underbrace{c_1\mathbf{r}_1\odot(\mathbf{p}_i-\mathbf{x}_i^t)}_{\text{个体学习}}+\underbrace{c_2\mathbf{r}_2\odot(\mathbf{g}-\mathbf{x}_i^t)}_{\text{群体学习}}`,
        plain: "第一项延续原方向，第二项回忆自己的成功，第三项学习全群成功；⊙ 表示逐元素相乘。",
        termBreakdown: [
          { term: String.raw`\omega\mathbf{v}_i^t`, meaning: "保持当前运动趋势" },
          { term: String.raw`\mathbf{p}_i-\mathbf{x}_i^t`, meaning: "从当前位置指向个人最好位置的向量" },
          { term: String.raw`\mathbf{g}-\mathbf{x}_i^t`, meaning: "从当前位置指向群体最好位置的向量" },
        ],
      },
      {
        title: "位置更新",
        latex: String.raw`\mathbf{x}_i^{t+1}=\mathbf{x}_i^t+\mathbf{v}_i^{t+1}`,
        plain: "新速度同时包含方向和步长，把它加到当前位置即可得到下一位置。",
        termBreakdown: [
          { term: String.raw`\mathbf{x}_i^t`, meaning: "移动前位置" },
          { term: String.raw`\mathbf{v}_i^{t+1}`, meaning: "刚计算出的新速度" },
          { term: String.raw`\mathbf{x}_i^{t+1}`, meaning: "移动后位置" },
        ],
      },
      {
        title: "个体最好更新（最小化）",
        latex: String.raw`\mathbf{p}_i^{t+1}=\begin{cases}\mathbf{x}_i^{t+1},&f(\mathbf{x}_i^{t+1})<f(\mathbf{p}_i^t)\\\mathbf{p}_i^t,&\text{否则}\end{cases}`,
        plain: "只有新位置的目标值更小时，才覆盖个人最好记忆。最大化问题需要把小于号改为大于号。",
        termBreakdown: [
          { term: String.raw`f(\mathbf{x}_i^{t+1})`, meaning: "粒子新位置的目标值" },
          { term: String.raw`f(\mathbf{p}_i^t)`, meaning: "个人历史最好目标值" },
          { term: String.raw`<`, meaning: "本例是最小化，因此越小越好" },
        ],
      },
    ],
    parameters: [
      { symbol: String.raw`\omega`, name: "惯性权重", effect: "控制延续原速度的程度", tooSmall: "步子很快缩小，可能早停", tooLarge: "粒子容易振荡或飞越好区域" },
      { symbol: String.raw`c_1`, name: "个体学习系数", effect: "控制回到个人最好位置的拉力", tooSmall: "忽略个人探索经验", tooLarge: "粒子在自己的最好点附近强烈摆动" },
      { symbol: String.raw`c_2`, name: "群体学习系数", effect: "控制追随全群最好位置的拉力", tooSmall: "好消息传播慢", tooLarge: "粒子过快扎堆，容易早熟" },
      { symbol: String.raw`N`, name: "粒子数量", effect: "决定同时探索的起点数量", tooSmall: "空间覆盖不足", tooLarge: "每轮目标函数评估成本高" },
      { symbol: String.raw`v_{\max}`, name: "速度上限", effect: "限制单轮最大移动距离", tooSmall: "移动缓慢、难以跨区", tooLarge: "可能频繁越界并错过精细区域" },
    ],
    commonMistakes: [
      { title: "把当前位置当成 pbest", wrong: "粒子每移动一次就无条件覆盖个人最好。", right: "只在新目标值更优时更新 pbest。" },
      { title: "最小化问题比较方向写反", wrong: "使用 value > personal_best_value。", right: "最小化使用 <；最大化才使用 >。" },
      { title: "先移动再用旧速度公式", wrong: "更新顺序混乱，公式中的 t 和 t+1 对不上。", right: "先用第 t 轮状态算 vᵗ⁺¹，再算 xᵗ⁺¹。" },
      { title: "完全不处理越界与速度爆炸", wrong: "粒子飞出定义域后仍继续评价。", right: "明确采用位置裁剪、反弹或重采样，并视任务设置速度上限。" },
      { title: "数组没有复制导致记忆被联动修改", wrong: "pbest 和 position 指向同一个数组。", right: "初始化和更新 pbest 时使用 copy，确保历史位置独立保存。" },
    ],
    quiz: {
      question: "粒子的新位置比旧 pbest 差，但比它上一轮的当前位置好。此时应该怎样处理 pbest？",
      options: ["更新为新位置", "保持旧 pbest 不变", "更新为 gbest", "随机重置"],
      answer: 1,
      explanation: "pbest 比较的是“历史最好”，不是只和上一轮位置比较。新位置没有打破个人历史纪录，所以记忆保持不变。",
    },
    framework: {
      title: "粒子群算法通用框架",
      steps: [
        { label: "定义目标与边界", action: "明确是最小化还是最大化，并给出每维合法范围。" },
        { label: "初始化粒子", action: "随机设置位置、速度、pbest，并选出 gbest。" },
        { label: "抽取随机向量", action: "为每个粒子、每个维度生成 r₁ 和 r₂。" },
        { label: "更新速度", action: "叠加惯性、个体学习和群体学习。" },
        { label: "更新位置", action: "按新速度移动并执行边界策略。" },
        { label: "更新两层记忆", action: "先更新每个 pbest，再从中更新 gbest。" },
        { label: "停止并返回", action: "达到轮数或长期无改善时，返回历史 gbest。" },
      ],
    },
    codeLanguage: "python",
    codeFile: "/examples/pso_sphere.py",
    code: psoCode,
  },

  {
    id: "wpa",
    number: "04",
    title: "狼群算法",
    short: "WPA",
    accent: "#8247e5",
    subtitle: "探狼扩大视野，狼群响应头狼，围攻阶段再把搜索半径逐渐缩小",
    problem: "连续黑箱优化：用教学版 WPA 寻找 f(x,y)=x²+y² 的最低点",
    difficulty: "入门",
    estimatedMinutes: 24,
    variantNote:
      "本页讲的是 Wolf Pack Algorithm（WPA）的教学版：探寻 scouting、召唤 calling/rushing、围攻 besieging、强者生存。它不是 Grey Wolf Optimizer（GWO）；GWO 由 α、β、δ 三只领导狼共同更新位置，本页算法只使用当前头狼并明确分阶段搜索。",
    learningGoals: [
      "能说明一只狼、头狼和猎物在优化问题中分别代表什么。",
      "能用公式区分探寻、召唤、围攻三个阶段的搜索范围和方向。",
      "能解释强者生存、历史最好保存和逐渐缩小半径各自解决什么问题。",
    ],
    story:
      "在一片看不见地形的区域里，狼群要寻找气味最浓的猎物。少量探狼先从不同方向试探；发现更好位置后，当前最好的狼成为头狼并发出召唤；其他狼快速靠近，再在附近小范围围攻。最弱的狼会被随机新狼替换，让狼群不至于全部困在同一个错误山谷。",
    intuition:
      "优化时，一只狼就是一个候选位置，猎物代表未知的最优解，目标函数值决定“气味好坏”。探寻偏向探索，召唤偏向利用当前最好区域，围攻负责精细搜索；替换弱狼重新注入多样性。",
    optimizationModel: {
      title: "教学示例：Sphere 函数",
      latex: String.raw`\min_{\mathbf{x}}\;f(\mathbf{x})=\sum_{d=1}^{D}x_d^2`,
      subjectTo: [
        String.raw`-5\le x_d\le5,\quad d=1,\ldots,D`,
        String.raw`\mathbf{x}^{\star}=\mathbf{0},\qquad f(\mathbf{x}^{\star})=0`,
      ],
      plain:
        "每只狼的位置 x 是一个候选解，函数值越小越好。头狼不是预先指定，而是当前函数值最小的狼；真正的最优点是原点。",
    },
    variables: [
      { symbol: String.raw`\mathbf{x}_i^t`, meaning: "第 i 只狼在第 t 轮的位置", example: "x=(3,4)" },
      { symbol: String.raw`\mathbf{x}_{L}^{t}`, meaning: "当前头狼位置", example: "全群当前目标值最小的位置" },
      { symbol: String.raw`s_t`, meaning: "探寻步长", example: "早期大、后期可减小" },
      { symbol: String.raw`\mathbf{d}_i`, meaning: "探寻使用的随机单位方向", example: "‖dᵢ‖₂=1" },
      { symbol: String.raw`\lambda_i`, meaning: "向头狼靠近的召唤强度", example: "λᵢ∈(0,1)" },
      { symbol: String.raw`\sigma_t`, meaning: "围攻搜索半径", example: "随迭代逐渐缩小" },
      { symbol: String.raw`r`, meaning: "每轮替换的弱狼比例", example: "r=0.2" },
    ],
    mechanismSteps: [
      {
        title: "初始化并产生头狼",
        action: "在边界内随机生成狼群，评价所有狼，当前最好者成为头狼。",
        why: "头狼来自竞争结果，而不是固定编号；更好的狼随时可以接任。",
        math: String.raw`L=\arg\min_i f(\mathbf{x}_i)`,
      },
      {
        title: "探寻（scouting）",
        action: "探狼沿一个或多个随机单位方向移动一步，仅在候选更优时接受。",
        why: "从当前区域向外试探，负责发现尚未被头狼覆盖的新方向。",
        math: String.raw`\tilde{\mathbf{x}}_i=\mathbf{x}_i+s_t\mathbf{d}_i,\quad\lVert\mathbf{d}_i\rVert_2=1`,
      },
      {
        title: "更新头狼",
        action: "探寻后重新比较全群；若探狼更好，它立即成为新头狼。",
        why: "这就是 winner-take-all：领导权跟随当前最好解变化。",
        math: String.raw`\mathbf{x}_L\leftarrow\arg\min_{\mathbf{x}_i}f(\mathbf{x}_i)`,
      },
      {
        title: "召唤 / 奔袭（calling / rushing）",
        action: "其余狼沿着“头狼减当前位置”的方向靠近。",
        why: "把探狼发现的好区域迅速分享给整个狼群。",
        math: String.raw`\tilde{\mathbf{x}}_i=\mathbf{x}_i+\lambda_i(\mathbf{x}_L-\mathbf{x}_i)`,
      },
      {
        title: "围攻（besieging）",
        action: "在头狼附近生成随机候选，半径随迭代缩小，只保留更优位置。",
        why: "大半径先看附近多个位置，小半径后期做精细定位。",
        math: String.raw`\tilde{\mathbf{x}}_i=\mathbf{x}_L+\sigma_t\boldsymbol{\varepsilon}_i,\quad\sigma_t\downarrow`,
      },
      {
        title: "强者生存与历史最好",
        action: "保留历史最好解，用随机新狼替换末尾一部分弱狼。",
        why: "前者防止好解丢失，后者恢复多样性、提供跳出局部最优的机会。",
        math: String.raw`\mathbf{x}_{\mathrm{best}}\leftarrow\arg\min\{f(\mathbf{x}_{\mathrm{best}}),f(\mathbf{x}_1),\ldots\}`, 
      },
    ],
    workedExample: {
      title: "三只狼的一轮位置变化",
      input: [
        { label: "目标函数", value: "f(x,y)=x²+y²" },
        { label: "狼 A", value: "(3,4)，f=25" },
        { label: "狼 B", value: "(1,2)，f=5，当前头狼" },
        { label: "狼 C", value: "(-2,3)，f=13" },
        { label: "示例参数", value: "探寻步长 s=0.5，召唤强度 λ=0.5，围攻半径 σ=0.5" },
      ],
      steps: [
        {
          label: "探狼 C 向右试探",
          latex: String.raw`\tilde{\mathbf{x}}_C=(-2,3)+0.5(1,0)=(-1.5,3)`,
          explanation: "新函数值 1.5²+3²=11.25，小于原来的 13，因此接受这个探寻位置。",
        },
        {
          label: "狼 A 响应召唤",
          latex: String.raw`\tilde{\mathbf{x}}_A=(3,4)+0.5\big[(1,2)-(3,4)\big]=(2,3)`,
          explanation: "A 向头狼 B 走了一半距离，函数值从 25 降到 13。",
        },
        {
          label: "在头狼附近围攻",
          latex: String.raw`\tilde{\mathbf{x}}=(1,2)+0.5(0.2,-0.3)=(1.1,1.85)`,
          explanation: "这里 ε=(0.2,-0.3)。新函数值为 1.1²+1.85²=4.6325，比头狼的 5 更小。",
        },
        {
          label: "头狼换代并保存历史最好",
          latex: String.raw`4.6325<5\quad\Longrightarrow\quad\mathbf{x}_L\leftarrow(1.1,1.85)`,
          explanation: "围攻候选成为新头狼；即使后面替换弱狼，也要单独保存这个历史最好位置。",
        },
      ],
      conclusion:
        "探寻让个体从不同方向找机会，召唤让远处的狼快速靠近好区域，围攻则在头狼周围做更细的搜索。一轮结束后，全群最好值从 5 改善到 4.6325。",
    },
    coreFormulas: [
      {
        title: "探寻更新",
        latex: String.raw`\tilde{\mathbf{x}}_i=\operatorname{clip}(\mathbf{x}_i+s_t\mathbf{d}_i,\mathbf{l},\mathbf{u}),\qquad\lVert\mathbf{d}_i\rVert_2=1`,
        plain: "沿随机单位方向走 sₜ，因此步长不受随机向量原始长度影响；clip 把越界坐标裁回合法范围。",
        termBreakdown: [
          { term: String.raw`s_t`, meaning: "探寻移动距离" },
          { term: String.raw`\mathbf{d}_i`, meaning: "归一化后的随机方向" },
          { term: String.raw`\operatorname{clip}`, meaning: "边界裁剪操作" },
        ],
      },
      {
        title: "召唤 / 奔袭更新",
        latex: String.raw`\tilde{\mathbf{x}}_i=\mathbf{x}_i+\lambda_i(\mathbf{x}_L-\mathbf{x}_i),\qquad0<\lambda_i<1`,
        plain: "xᴸ-xᵢ 是指向头狼的方向；λ=0.5 表示移动到当前位置与头狼的中点。",
        termBreakdown: [
          { term: String.raw`\mathbf{x}_L-\mathbf{x}_i`, meaning: "从第 i 只狼指向头狼的向量" },
          { term: String.raw`\lambda_i`, meaning: "本轮靠近头狼的比例" },
          { term: String.raw`0<\lambda_i<1`, meaning: "移动后位于自己与头狼之间" },
        ],
      },
      {
        title: "围攻与半径退火",
        latex: String.raw`\tilde{\mathbf{x}}_i=\mathbf{x}_L+\sigma_t\boldsymbol{\varepsilon}_i,\qquad\sigma_t=\sigma_{\min}+(\sigma_{\max}-\sigma_{\min})(1-t/T)`,
        plain: "围绕头狼随机采样；σₜ 从大到小，使算法从较粗的邻域搜索过渡到精细定位。",
        termBreakdown: [
          { term: String.raw`\boldsymbol{\varepsilon}_i`, meaning: "零均值随机扰动，本示例使用高斯扰动" },
          { term: String.raw`t/T`, meaning: "当前搜索进度" },
          { term: String.raw`\sigma_{\min}`, meaning: "后期仍保留的最小搜索半径" },
        ],
      },
      {
        title: "贪婪接受规则",
        latex: String.raw`\mathbf{x}_i\leftarrow\begin{cases}\tilde{\mathbf{x}}_i,&f(\tilde{\mathbf{x}}_i)<f(\mathbf{x}_i)\\\mathbf{x}_i,&\text{否则}\end{cases}`,
        plain: "本教学版只接受更优候选。它让每只狼不变差，但也更依赖随机替换来跳出局部最优。",
        termBreakdown: [
          { term: String.raw`\tilde{\mathbf{x}}_i`, meaning: "某阶段产生的候选位置" },
          { term: String.raw`f(\tilde{\mathbf{x}}_i)<f(\mathbf{x}_i)`, meaning: "最小化问题中的改进条件" },
          { term: String.raw`\mathbf{x}_i`, meaning: "候选不更好时保留原位置" },
        ],
      },
    ],
    parameters: [
      { symbol: String.raw`s_t`, name: "探寻步长", effect: "控制探狼向外试探的距离", tooSmall: "只能查看很近的邻域", tooLarge: "频繁越界或跨过有希望区域" },
      { symbol: String.raw`q`, name: "探狼比例", effect: "决定有多少狼负责探索", tooSmall: "新方向发现得少", tooLarge: "跟随头狼利用好区域的狼太少" },
      { symbol: String.raw`\lambda`, name: "召唤强度", effect: "控制每轮向头狼靠近的比例", tooSmall: "群体信息传播慢", tooLarge: "狼群迅速挤成一团，过早失去多样性" },
      { symbol: String.raw`\sigma_t`, name: "围攻半径", effect: "控制头狼附近局部搜索范围", tooSmall: "只能做极小修补", tooLarge: "后期仍然跳动，难以精细收敛" },
      { symbol: String.raw`r`, name: "弱狼替换比例", effect: "控制每轮注入多少随机新位置", tooSmall: "停滞后难以恢复多样性", tooLarge: "大量已有搜索经验被随机丢弃" },
    ],
    commonMistakes: [
      { title: "把 WPA 写成 GWO", wrong: "使用 α、β、δ 三只领导狼的平均位置，却仍称为本页 WPA。", right: "本教学版明确使用单个当前头狼，并按探寻、召唤、围攻三个阶段更新。" },
      { title: "固定第一只狼永远当头狼", wrong: "初始化后不再竞争头狼。", right: "每个阶段后都可重新比较；当前最好者才能成为头狼。" },
      { title: "只保存当前头狼，不保存历史最好", wrong: "弱狼替换或随机操作后丢掉最佳结果。", right: "额外维护 historical best，最终返回搜索过程中见过的最好位置。" },
      { title: "随机方向没有归一化", wrong: "方向向量越长，实际探寻步长越大。", right: "先令 d/‖d‖ 成为单位方向，再乘设定步长 s。" },
      { title: "围攻半径始终不变", wrong: "后期仍用和早期一样大的随机扰动。", right: "让 σₜ 随进度减小，形成先粗后细的搜索。" },
    ],
    quiz: {
      question: "下面哪项最能证明本页讲的是教学版 WPA，而不是 GWO？",
      options: ["候选解被称为狼", "目标函数越小越好", "使用探寻、召唤、围攻并由单个当前头狼引导", "种群从随机位置初始化"],
      answer: 2,
      explanation: "“狼”只是共同隐喻。关键机制不同：本页 WPA 分为 scouting、calling、besieging，并使用当前头狼；经典 GWO 由 α、β、δ 三个领导解共同引导更新。",
    },
    framework: {
      title: "教学版狼群算法通用框架",
      steps: [
        { label: "定义目标与边界", action: "明确比较方向以及每维合法区间。" },
        { label: "初始化狼群", action: "随机产生候选位置，选当前最好者为头狼。" },
        { label: "探狼游走", action: "沿随机单位方向试探，仅接受更优候选。" },
        { label: "竞争头狼", action: "重新评价，当前最优狼获得领导权。" },
        { label: "召唤奔袭", action: "其余狼按 λ 向头狼靠近。" },
        { label: "近域围攻", action: "在头狼附近按逐渐缩小的 σₜ 采样。" },
        { label: "强者生存", action: "保存历史最好，用随机新狼替换末尾弱狼。" },
        { label: "停止并返回", action: "达到轮数或长期无改善时，返回历史最好狼。" },
      ],
    },
    codeLanguage: "python",
    codeFile: "/examples/wpa_sphere.py",
    code: wpaCode,
  },
];

export const courseLessonMap = new Map(
  courseLessons.map((lesson) => [lesson.id, lesson]),
);
