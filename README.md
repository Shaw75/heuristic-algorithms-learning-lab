# 启发式算法学习实验室（Web 版）

面向初学者的交互式网页，包含遗传算法（GA）、蚁群算法（ACO）、粒子群算法（PSO）和狼群算法（WPA）。每种算法都有直觉解释、运行过程、收敛曲线、算法框架、KaTeX 公式与 Python 代码。

- 在线学习：[GitHub Pages](https://shaw75.github.io/heuristic-algorithms-learning-lab/)
- 源码仓库：[Shaw75/heuristic-algorithms-learning-lab](https://github.com/Shaw75/heuristic-algorithms-learning-lab)
- 部署状态：[GitHub Actions](https://github.com/Shaw75/heuristic-algorithms-learning-lab/actions/workflows/deploy-pages.yml)

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

1. 先看首页共同搜索骨架。
2. 进入 GA，运行一次背包演示。
3. 按“直觉 → 框架 → 公式 → 代码”阅读。
4. 再学习 PSO、ACO、WPA，最后看横向对比。

## 自动部署

推送到 `main` 分支后，GitHub Actions 会依次执行测试、生产构建并发布到 GitHub Pages。
