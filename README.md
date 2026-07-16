# 启发式算法学习实验室（Web 版）

面向初学者的交互式网页，系统讲解遗传算法（GA）、蚁群算法（ACO）、粒子群算法（PSO）和狼群算法（WPA）。四种算法各自拥有独立课程页，从实际问题、数学模型和手算例子开始，再进入搜索机制、交互公式、完整动画、参数分析与 Python 实现。

- 在线学习：[GitHub Pages](https://shaw75.github.io/heuristic-algorithms-learning-lab/)
- 源码仓库：[Shaw75/heuristic-algorithms-learning-lab](https://github.com/Shaw75/heuristic-algorithms-learning-lab)
- 部署状态：[GitHub Actions](https://github.com/Shaw75/heuristic-algorithms-learning-lab/actions/workflows/deploy-pages.yml)

## 页面包含什么

- 独立课程路由：`#/ga`、`#/aco`、`#/pso`、`#/wpa`
- 目标函数、约束条件、变量符号和核心更新公式
- 不省略中间步骤的手算示例
- 可拖动参数的数学模型实验，以及逐帧搜索动画和收敛曲线
- 算法框架、参数大小的影响、常见误区和一分钟自测
- 可复制的 Python 骨架与四个可直接运行的完整示例
- 响应式字号和布局：2K 宽屏自动放大，平板与手机切换为抽屉目录和横向算法导航

## 最简单的启动方式（Windows）

双击 `启动网页.bat`。脚本会在缺少依赖时自动安装，然后启动网页并打开浏览器。

## 命令行启动

```powershell
npm install
npm run dev -- --port 4173
```

浏览器访问：`http://127.0.0.1:4173/`

## 测试和生产构建

```powershell
npm test
npm run build
npm run preview -- --port 4173
```

生产文件位于 `dist/`。公式字体与网页资源会一并构建，不依赖在线公式服务。

## 可直接运行的 Python 示例

网页中的代码栏用于突出算法骨架；完整且可直接运行的小例子位于 `public/examples/`：

- `ga_knapsack.py`
- `aco_tsp.py`
- `pso_sphere.py`
- `wpa_sphere.py`

安装依赖并全部运行：

```powershell
pip install -r public/examples/requirements.txt
python public/examples/ga_knapsack.py
python public/examples/aco_tsp.py
python public/examples/pso_sphere.py
python public/examples/wpa_sphere.py
```

## 推荐学习顺序

1. 从“学习起点”理解候选解、目标函数与约束。
2. 先学 GA，再学 PSO，建立“种群搜索”和“位置更新”的直觉。
3. 接着学习 ACO 的路径概率与信息素更新。
4. 最后学习 WPA 的探寻、召唤和围攻阶段，再到“算法选择”横向比较。

每一页建议按“直觉 → 数学模型 → 手算 → 一轮机制 → 交互实验 → 完整动画 → 公式与代码”的顺序阅读。

## 自动部署

推送到 `main` 分支后，GitHub Actions 会依次执行测试、生产构建并发布到 GitHub Pages。
