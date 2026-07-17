// 数学模型教学层：把“共同优化问题”与“各算法更新规则”明确分开。
// 这里的统一状态公式是教学记号，不是四种算法共享的一条官方更新公式。

export const commonOptimizationModel = {
  verdict:
    "四种算法解决的是同一类优化问题，但没有一条共同的算法更新公式。共同的是问题结构与迭代逻辑，不同的是怎样产生新解、保存什么记忆。",
  problem: {
    title: "第一层：优化问题本身",
    latex: String.raw`\operatorname{opt}_{\mathbf{x}\in\Omega}\;f(\mathbf{x})`,
    constraints: [
      String.raw`\Omega=\{\mathbf{x}\in\mathcal X:g_r(\mathbf{x})\le 0,\;h_s(\mathbf{x})=0\}`,
    ],
    plain:
      "x 是一个候选方案，f(x) 是评价方案好坏的裁判，Ω 是所有合法方案的集合。opt 可以是最大化，也可以是最小化。",
  },
  state: {
    title: "第二层：启发式算法的统一迭代骨架",
    latex: String.raw`\mathcal S_{t+1}=\mathcal U_A\!\left(\mathcal S_t,f,\Omega,\boldsymbol\theta,\boldsymbol\xi_t\right)`,
    plain:
      "Sₜ 表示第 t 轮的完整搜索状态，既包括当前候选解，也包括算法记忆；U_A 是算法 A 自己的更新规则；θ 是参数；ξₜ 是本轮随机数。",
  },
  best: {
    title: "第三层：始终单独保存历史最好",
    latex: String.raw`\mathbf{x}_{\mathrm{best}}^{t}=\arg\operatorname{opt}_{\mathbf{x}\in\mathcal H_t}f(\mathbf{x})`,
    plain:
      "Hₜ 是截至第 t 轮见过的候选解。历史最好只是目前找到的最好结果，并不自动证明它就是全局最优解。",
  },
  symbols: [
    { symbol: String.raw`\mathbf{x}`, name: "候选解", meaning: "一个完整、可被评价的方案" },
    { symbol: String.raw`f(\mathbf{x})`, name: "目标函数", meaning: "把方案好坏变成可比较的数值" },
    { symbol: String.raw`\Omega`, name: "可行域", meaning: "所有满足边界和约束的合法方案" },
    { symbol: String.raw`\mathcal S_t`, name: "搜索状态", meaning: "第 t 轮的候选解与算法记忆" },
    { symbol: String.raw`\boldsymbol\theta`, name: "算法参数", meaning: "种群规模、学习系数、挥发率或步长等" },
    { symbol: String.raw`\boldsymbol\xi_t`, name: "随机输入", meaning: "本轮抽取的随机数、方向或选择结果" },
  ],
  cycle: [
    ["表示", "决定一个候选解 x 用 0/1 串、排列还是坐标表示。"],
    ["初始化", "在可行域 Ω 中产生一批不同的起点。"],
    ["生成", "按该算法的规则提出新的候选解。"],
    ["合法化", "修复、裁剪，或直接避免产生非法解。"],
    ["评价", "把候选解交给同一个目标函数 f 比较。"],
    ["反馈", "保存最好结果，并更新种群、信息素或群体记忆。"],
    ["停止", "达到预算、精度或长期无改进时返回历史最好。"],
  ],
};

export const algorithmAbstractModels = {
  ga: {
    question: "谁更容易成为父代？两个父代怎样产生一条新染色体？",
    stateLatex: String.raw`\mathcal S_t=(P_t,\mathbf{x}_{\mathrm{best}}^t)`,
    statePlain: "Pₜ 是第 t 代种群；算法记忆主要是当前种群与被保留的精英解。",
    updates: [
      {
        title: "选择父代",
        latex: String.raw`(\mathbf{x}_a,\mathbf{x}_b)\sim\operatorname{Select}(P_t,F)`,
        plain: "适应度较高者获得更大的繁殖机会，但选择算子可以是轮盘赌、锦标赛等不同实现。",
      },
      {
        title: "交叉、变异与修复",
        latex: String.raw`\begin{aligned}\mathbf x^{(c)}&=C_{p_c}(\mathbf x_a,\mathbf x_b)\\\mathbf x^{(m)}&=M_{p_m}(\mathbf x^{(c)})\\\tilde{\mathbf x}&=R_\Omega(\mathbf x^{(m)})\end{aligned}`,
        plain: "第一行得到交叉结果，第二行执行变异，第三行把非法子代修复回可行域；按处理顺序分行后更容易对应代码。",
      },
      {
        title: "形成下一代",
        latex: String.raw`P_{t+1}=\operatorname{Elite}(P_t)\cup\{\tilde{\mathbf{x}}_1,\tilde{\mathbf{x}}_2,\ldots\}`,
        plain: "保住至少一个最好个体，再用新子代把种群补满。",
      },
    ],
    bridge: [
      ["候选解 x", "五位 0/1 装包方案"],
      ["目标 f(x)", "所选物品的总价值"],
      ["可行域 Ω", "总重量不超过 10 kg"],
      ["合法化 RΩ", "超重时删除价值重量比较低的物品"],
      ["算法记忆", "整代种群、精英和历史最高价值"],
    ],
    implementationNote:
      "交互实验用轮盘赌直观展示“适应度影响选择机会”；完整 Python 使用 3 人锦标赛。二者都是 Select 的具体实现，不是同一条选择公式。",
    codeMap: [
      { math: String.raw`P_t`, meaning: "当前种群", code: "population" },
      { math: String.raw`F(P_t)`, meaning: "整代适应度", code: "scores = population @ values" },
      { math: String.raw`\operatorname{Select}`, meaning: "锦标赛选择父代", code: "ids = rng.integers(..., 3)" },
      { math: String.raw`C_{p_c},M_{p_m}`, meaning: "单点交叉与按位变异", code: "point = ...; p1 ^= rng.random(...) < 0.05" },
      { math: String.raw`R_\Omega`, meaning: "修复超重方案", code: "repair(child)" },
    ],
  },
  aco: {
    question: "下一座城市怎样选？完整路线的好坏怎样反馈到每一条边？",
    stateLatex: String.raw`\mathcal S_t=(\boldsymbol\tau^t,\pi_{\mathrm{best}}^t)`,
    statePlain: "τᵗ 是第 t 轮所有边的信息素；πbest 是历史最短完整路线。",
    updates: [
      {
        title: "按概率构造完整路线",
        latex: String.raw`p_{ij}^{(k,t)}=\frac{(\tau_{ij}^{t})^{\alpha}\eta_{ij}^{\beta}}{\sum_{l\in N_i^{(k)}}(\tau_{il}^{t})^{\alpha}\eta_{il}^{\beta}}`,
        plain: "每只蚂蚁只在未访问城市中选择下一站；走完整圈后才得到一个候选解。",
      },
      {
        title: "评价完整解",
        latex: String.raw`L(\pi_k)=\sum_{r=1}^{n-1}d_{\pi_r,\pi_{r+1}}+d_{\pi_n,\pi_1}`,
        plain: "局部短边不保证整个闭环最短，因此必须评价完整路线。",
      },
      {
        title: "挥发并反馈",
        latex: String.raw`\begin{aligned}\tau_{ij}^{t+1}&=(1-\rho)\tau_{ij}^{t}\\&\quad+\sum_k\frac{Q}{L(\pi_k)}\mathbf 1[(i,j)\in\pi_k]\end{aligned}`,
        plain: "旧经验按比例挥发；短路线经过的边获得更多信息素奖励。",
      },
    ],
    bridge: [
      ["候选解 x", "一个城市排列 π"],
      ["目标 f(x)", "闭环总长度 L(π)"],
      ["可行域 Ω", "每座城市恰好访问一次并回到起点"],
      ["合法化", "下一步只从未访问集合 N 中选择"],
      ["算法记忆", "边信息素 τ 与历史最短路线"],
    ],
    implementationNote:
      "交互实验拆解的是“转移概率”这一半；完整 ACO 还必须在每轮结束后执行信息素挥发与路线奖励。",
    codeMap: [
      { math: String.raw`\tau_{ij}^{t}`, meaning: "边信息素", code: "pheromone" },
      { math: String.raw`\eta_{ij}=1/d_{ij}`, meaning: "距离启发", code: "heuristic = 1.0 / distance" },
      { math: String.raw`p_{ij}^{(k,t)}`, meaning: "下一城市概率", code: "probability = desirability / desirability.sum()" },
      { math: String.raw`(1-\rho)\tau`, meaning: "信息素挥发", code: "pheromone *= 0.6" },
      { math: String.raw`Q/L_k`, meaning: "短路线奖励", code: "amount = 1.0 / length" },
    ],
  },
  pso: {
    question: "一个粒子下一步往哪里飞、飞多远，并怎样更新两层最好记忆？",
    stateLatex: String.raw`\mathcal S_t=(\mathbf x_i^t,\mathbf v_i^t,\mathbf p_i^t,\mathbf g^t)_{i=1}^{N}`,
    statePlain: "每个粒子保存位置 x、速度 v、个人最好 p；全群共享群体最好 g。",
    updates: [
      {
        title: "更新速度",
        latex: String.raw`\begin{aligned}\mathbf v_i^{t+1}&=\omega\mathbf v_i^t\\&\quad+c_1\mathbf r_1\odot(\mathbf p_i-\mathbf x_i^t)\\&\quad+c_2\mathbf r_2\odot(\mathbf g-\mathbf x_i^t)\end{aligned}`,
        plain: "惯性、个人经验和群体经验三股力量相加，得到下一步方向与步长。",
      },
      {
        title: "移动并处理边界",
        latex: String.raw`\mathbf x_i^{t+1}=\Pi_{\Omega}(\mathbf x_i^t+\mathbf v_i^{t+1})`,
        plain: "按新速度移动；ΠΩ 表示把越界位置裁剪或投影回合法范围。",
      },
      {
        title: "更新个人与群体记忆",
        latex: String.raw`\begin{aligned}\mathbf p_i^{t+1}&=\arg\min_{\mathbf z\in\{\mathbf p_i^t,\mathbf x_i^{t+1}\}}f(\mathbf z)\\\mathbf g^{t+1}&=\arg\min_i f(\mathbf p_i^{t+1})\end{aligned}`,
        plain: "先更新每个粒子的历史最好，再从所有个人最好中选出群体最好。",
      },
    ],
    bridge: [
      ["候选解 x", "平面上的坐标 (x,y)"],
      ["目标 f(x)", "x²+y²"],
      ["可行域 Ω", "每个坐标都位于 [-5,5]"],
      ["合法化 ΠΩ", "位置裁剪"],
      ["算法记忆", "速度、pbest 与 gbest"],
    ],
    implementationNote:
      "交互实验固定 r₁=r₂=0.5 便于复算；完整 Python 会为每轮、每个粒子和每一维重新抽取随机数。",
    codeMap: [
      { math: String.raw`\mathbf x_i^t`, meaning: "全部粒子位置", code: "position" },
      { math: String.raw`\mathbf v_i^t`, meaning: "全部粒子速度", code: "velocity" },
      { math: String.raw`\mathbf p_i,\mathbf g`, meaning: "个人与群体最好", code: "personal_best, global_best" },
      { math: String.raw`\mathbf r_1,\mathbf r_2`, meaning: "逐维随机向量", code: "r1 = rng.random(...); r2 = rng.random(...)" },
      { math: String.raw`\Pi_\Omega`, meaning: "边界裁剪", code: "np.clip(position + velocity, -5, 5)" },
    ],
  },
  wpa: {
    question: "怎样先看得远，再靠近当前好区域，最后做更细的局部搜索？",
    stateLatex: String.raw`\mathcal S_t=(X_t,\mathbf x_L^t,\mathbf x_{\mathrm{best}}^t,s_t,\sigma_t)`,
    statePlain: "Xₜ 是狼群位置；xL 是当前头狼；xbest 是历史最好；sₜ 与 σₜ 控制搜索尺度。",
    updates: [
      {
        title: "目标函数选出头狼",
        latex: String.raw`\mathbf x_L^t=\arg\min_{\mathbf x_i^t\in X_t}f(\mathbf x_i^t)`,
        plain: "头狼由目标函数比较产生，不是固定编号，也不等于已经找到真正最优点。",
      },
      {
        title: "探寻与召唤",
        latex: String.raw`\begin{aligned}\tilde{\mathbf x}_i^{s}&=\Pi_\Omega(\mathbf x_i^t+s_t\mathbf d_i)\\\tilde{\mathbf x}_i^{r}&=\Pi_\Omega[\mathbf x_i^t+\lambda_i(\mathbf x_L^t-\mathbf x_i^t)]\end{aligned}`,
        plain: "随机单位方向负责向外探寻；向头狼靠近负责共享当前最好区域。",
      },
      {
        title: "围攻、退火与贪婪接受",
        latex: String.raw`\begin{aligned}\tilde{\mathbf x}_i^{b}&=\Pi_\Omega(\mathbf x_L^t+\sigma_t\boldsymbol\varepsilon_i)\\\mathbf x_i&\leftarrow\arg\min_{\mathbf z\in\{\mathbf x_i,\tilde{\mathbf x}_i^{b}\}}f(\mathbf z)\end{aligned}`,
        plain: "在头狼附近采样更细候选，再让目标函数决定是否接受。随后重新竞争头狼并替换部分弱狼。",
      },
      {
        title: "搜索半径从粗到细",
        latex: String.raw`\sigma_t=\sigma_{\min}+(\sigma_{\max}-\sigma_{\min})(1-t/T)`,
        plain: "第 0 轮是 σmax，最后一轮趋近 σmin，避免后期仍用过大的围攻步长。",
      },
    ],
    bridge: [
      ["候选解 x", "狼在平面中的位置"],
      ["目标 f(x)", "x²+y²"],
      ["可行域 Ω", "每个坐标都位于 [-5,5]"],
      ["合法化 ΠΩ", "位置裁剪"],
      ["算法记忆", "当前头狼、历史最好与搜索半径"],
    ],
    implementationNote:
      "本页是与 Python 示例一致的连续优化教学版 WPA：随机方向探寻、按比例召唤、高斯围攻与弱狼替换；它不声称逐式复现原始论文，也不是 GWO。",
    codeMap: [
      { math: String.raw`X_t`, meaning: "狼群位置", code: "wolves" },
      { math: String.raw`\mathbf x_L^t`, meaning: "当前头狼", code: "leader = wolves[np.argmin(sphere(wolves))]" },
      { math: String.raw`s_t\mathbf d_i`, meaning: "随机单位方向探寻", code: "candidate = wolves + 0.45 * direction" },
      { math: String.raw`\lambda_i(\mathbf x_L-\mathbf x_i)`, meaning: "向头狼靠近", code: "wolves += strength * (leader - wolves)" },
      { math: String.raw`\sigma_t\boldsymbol\varepsilon_i`, meaning: "头狼附近围攻", code: "local = leader + rng.normal(0, radius, ...)" },
    ],
  },
};
