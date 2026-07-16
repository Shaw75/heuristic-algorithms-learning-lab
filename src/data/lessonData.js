export const lessons = [
  {
    id: "ga",
    number: "01",
    short: "GA",
    title: "遗传算法",
    subtitle: "让优秀方案繁殖，同时保留一点随机变化",
    accent: "#f34f52",
    accentName: "珊瑚红",
    problem: "0/1 背包",
    intuition:
      "每条染色体代表一种装包方案。更好的方案更容易成为父代，交叉负责重组经验，变异负责探索新可能。",
    steps: [
      ["初始化种群", "随机生成 N 个候选解，每个解是一条 0/1 染色体。"],
      ["评估适应度", "计算每条染色体的总价值，并修复超重方案。"],
      ["选择父代", "用锦标赛选择，让优秀个体获得更多繁殖机会。"],
      ["交叉重组", "交换两条父代染色体的片段，组合已有好结构。"],
      ["随机变异", "以小概率翻转基因，保持种群多样性。"],
      ["精英替换", "保留历史最好个体，再进入下一代。"],
    ],
    formulaTitle: "适应度函数（0/1 背包）",
    formulas: [
      {
        latex:
          "f(\\mathbf{x})=\\begin{cases}\\sum_{i=1}^{n}v_i x_i,&\\sum_{i=1}^{n}w_i x_i\\le C\\\\0,&\\text{otherwise}\\end{cases}",
        note: "xᵢ∈{0,1} 表示是否选择物品，vᵢ 为价值，wᵢ 为重量，C 为容量。",
      },
      {
        latex: "p_i=\\frac{f_i}{\\sum_{j=1}^{N}f_j}",
        note: "轮盘赌选择中，适应度越高，被选为父代的概率越大。",
      },
    ],
    code: `def genetic_algorithm(weights, values, capacity, generations=80):
    population = random_binary_population()
    best = None

    for _ in range(generations):
        population = [repair(x, weights, capacity)
                      for x in population]
        scores = [x @ values for x in population]
        best = keep_elite(best, population, scores)

        children = [best.copy()]
        while len(children) < len(population):
            p1, p2 = tournament_select(population, scores)
            c1, c2 = one_point_crossover(p1, p2)
            children += [mutate(c1), mutate(c2)]

        population = children[:len(population)]

    return best`,
  },
  {
    id: "aco",
    number: "02",
    short: "ACO",
    title: "蚁群算法",
    subtitle: "让好路径留下更多痕迹，下一只蚂蚁就更容易发现它",
    accent: "#f58a13",
    accentName: "琥珀橙",
    problem: "旅行商问题",
    intuition:
      "蚂蚁逐步构造路线，既参考边上的历史信息素，也偏好眼前较短的边。短路线释放更多信息素，形成正反馈。",
    steps: [
      ["初始化信息素", "给图中每条边相同的初始信息素。"],
      ["选择下一城市", "按信息素和距离启发计算转移概率。"],
      ["完成闭环", "每只蚂蚁访问所有城市并回到起点。"],
      ["评价路线", "计算路线总长度，保存历史最短路线。"],
      ["挥发旧经验", "按比例降低全部信息素，避免早期经验永久统治。"],
      ["强化好路线", "路线越短，沿途边获得的信息素越多。"],
    ],
    formulaTitle: "路径转移概率与信息素更新",
    formulas: [
      {
        latex:
          "p_{ij}^{(k)}=\\frac{\\tau_{ij}^{\\alpha}\\eta_{ij}^{\\beta}}{\\sum_{l\\in N_i^{(k)}}\\tau_{il}^{\\alpha}\\eta_{il}^{\\beta}}",
        note: "τ 是信息素，η=1/d 是距离启发；α、β 控制二者的影响。",
      },
      {
        latex:
          "\\tau_{ij}\\leftarrow(1-\\rho)\\tau_{ij}+\\sum_k\\Delta\\tau_{ij}^{(k)}",
        note: "ρ 是挥发率；通常令 Δτ=Q/L，使短路线释放更多信息素。",
      },
    ],
    code: `def ant_colony_tsp(points, ants=20, iterations=80):
    pheromone = np.ones((len(points), len(points)))
    best_tour, best_length = None, np.inf

    for _ in range(iterations):
        tours = []
        for ant in range(ants):
            tour = construct_tour(
                pheromone=pheromone,
                heuristic=1 / distance_matrix(points),
            )
            tours.append(tour)
            best_tour, best_length = update_best(
                tour, best_tour, best_length
            )

        pheromone *= 1 - evaporation
        deposit_pheromone(pheromone, tours)

    return best_tour, best_length`,
  },
  {
    id: "pso",
    number: "03",
    short: "PSO",
    title: "粒子群算法",
    subtitle: "每个粒子相信自己，也参考整个群体发现的最好位置",
    accent: "#00a7ae",
    accentName: "青绿色",
    problem: "Sphere 函数",
    intuition:
      "粒子带着位置和速度在搜索空间中飞行。它会保留自己的历史最好位置 pbest，同时朝群体最好位置 gbest 加速。",
    steps: [
      ["初始化粒子", "在边界内随机产生位置和初始速度。"],
      ["记录个体经验", "每个粒子保存自己去过的最好位置 pbest。"],
      ["共享群体经验", "全体粒子共享当前最好位置 gbest。"],
      ["更新速度", "叠加惯性、个体学习和群体学习三部分。"],
      ["更新位置", "粒子按新速度移动，并处理越界。"],
      ["重复搜索", "重新评估并更新 pbest、gbest，直到停止。"],
    ],
    formulaTitle: "速度与位置更新",
    formulas: [
      {
        latex:
          "\\mathbf{v}_i^{t+1}=\\omega\\mathbf{v}_i^t+c_1\\mathbf{r}_1\\odot(\\mathbf{p}_i-\\mathbf{x}_i^t)+c_2\\mathbf{r}_2\\odot(\\mathbf{g}-\\mathbf{x}_i^t)",
        note: "三项依次表示保持惯性、相信自己、学习群体。",
      },
      {
        latex: "\\mathbf{x}_i^{t+1}=\\mathbf{x}_i^t+\\mathbf{v}_i^{t+1}",
        note: "速度决定下一步位置；示例会把越界位置裁剪回 [-5,5]。",
      },
    ],
    code: `def particle_swarm(objective, bounds, iterations=100):
    x = random_positions(bounds)
    v = random_velocities(bounds)
    pbest = x.copy()
    gbest = pbest[np.argmin(evaluate(objective, pbest))]

    for _ in range(iterations):
        r1, r2 = np.random.rand(*x.shape), np.random.rand(*x.shape)
        v = (w * v
             + c1 * r1 * (pbest - x)
             + c2 * r2 * (gbest - x))
        x = np.clip(x + v, bounds[:, 0], bounds[:, 1])
        pbest = update_personal_bests(x, pbest, objective)
        gbest = min(pbest, key=objective)

    return gbest`,
  },
  {
    id: "wpa",
    number: "04",
    short: "WPA",
    title: "狼群算法",
    subtitle: "先派探狼寻找方向，再召唤狼群靠近，最后围攻精细搜索",
    accent: "#8247e5",
    accentName: "紫色",
    problem: "Sphere 函数",
    intuition:
      "头狼代表当前最好解；探狼负责扩大搜索，其他狼响应召唤靠近头狼，围攻阶段再缩小步长。弱狼会被随机新狼替换。",
    steps: [
      ["选出头狼", "把当前目标值最好的候选解作为头狼。"],
      ["探狼游走", "部分狼沿多个随机方向寻找更好区域。"],
      ["召唤奔袭", "其余狼快速向头狼靠近，利用当前经验。"],
      ["围攻搜索", "在头狼附近缩小步长，进行局部精细搜索。"],
      ["强者生存", "保留优秀狼，淘汰最弱个体并随机补充。"],
      ["更新历史最优", "保存找到过的最好位置，进入下一轮。"],
    ],
    formulaTitle: "教学版 WPA 的位置更新",
    formulas: [
      {
        latex:
          "\\mathbf{x}_i' = \\mathbf{x}_i+s_a\\mathbf{d},\\qquad \\lVert\\mathbf{d}\\rVert_2=1",
        note: "探寻阶段沿随机单位方向 d 移动，尝试多个候选位置。",
      },
      {
        latex:
          "\\mathbf{x}_i' = \\mathbf{x}_i+\\lambda(\\mathbf{x}_{leader}-\\mathbf{x}_i)",
        note: "召唤阶段向头狼靠近；围攻阶段则在头狼附近加入逐渐减小的扰动。",
      },
    ],
    callout:
      "这里实现的是 WPA（Wolf Pack Algorithm）的教学版本，不是使用 α、β、δ 三只领导狼的 GWO。",
    code: `def wolf_pack(objective, bounds, iterations=100):
    wolves = random_positions(bounds)
    best = min(wolves, key=objective)

    for step in range(iterations):
        scouts = choose_scouts(wolves)
        wolves = scouting(scouts, wolves, objective)

        leader = min(wolves, key=objective)
        wolves = rush_toward_leader(wolves, leader)
        wolves = besiege_near_leader(wolves, leader)

        wolves = replace_weak_wolves(wolves, bounds)
        best = min(best, *wolves, key=objective)

    return best`,
  },
];

export const comparisonRows = [
  {
    id: "ga",
    name: "遗传算法 (GA)",
    inspiration: "生物进化",
    transfer: "选择、交叉、变异",
    strength: "编码灵活，适合混合变量",
    scenario: "组合优化、调度",
  },
  {
    id: "aco",
    name: "蚁群算法 (ACO)",
    inspiration: "蚂蚁觅食",
    transfer: "边上的信息素",
    strength: "擅长逐步构造路径",
    scenario: "路径规划、TSP",
  },
  {
    id: "pso",
    name: "粒子群算法 (PSO)",
    inspiration: "鸟群协作",
    transfer: "pbest 与 gbest",
    strength: "公式简单，前期收敛快",
    scenario: "连续函数、参数调优",
  },
  {
    id: "wpa",
    name: "狼群算法 (WPA)",
    inspiration: "狼群狩猎",
    transfer: "探寻、召唤、围攻",
    strength: "搜索阶段直观",
    scenario: "连续黑箱优化",
  },
];
