# 专业能力图谱系统（复刻版）

一个基于 Next.js + ECharts 的知识图谱可视化项目，复刻自在线示例站点。提供课程筛选、层级展开、主题切换、图谱布局切换、图谱导出与参数配置等功能。

## 功能特性

- 图谱展示：基于 ECharts Graph 的力导布局与环形布局
- 课程筛选：按课程过滤相关能力链路
- 层级控制：按层级展开（默认 3 层）
- 主题切换：经典/海洋/森林/日落/科技
- 图谱设置：节点颜色、大小、线条参数、布局参数
- 统计信息：节点/关系数量实时更新
- 导出图片：一键导出 PNG
- Excel 导入/导出：nodes/links 多工作表结构
- 模板下载：提供 Excel 空模板（含工作表与表头）
- Excel 功能使用本地 `public/vendor/xlsx.full.min.js`，避免依赖外网

## 技术栈

- Next.js (App Router)
- React
- ECharts
- TypeScript

## 本地运行

### 开发模式

```bash
npm install
HOSTNAME=0.0.0.0 PORT=7000 npm run dev
```

### 生产模式

```bash
npm install
npm run build
HOSTNAME=0.0.0.0 PORT=7000 npm run start
```

## 目录说明

- `src/app/page.tsx`：页面结构（工具栏、图谱区、侧边设置面板、弹窗）
- `src/app/globals.css`：样式与主题变量
- `public/js/app.js`：图谱逻辑（配置、数据加载、渲染、交互）
- `public/data/graph_full.json`：图谱数据

## 配置说明

图谱配置集中在 `public/js/app.js` 的 `Config` 对象中：

- `defaults.colors`：节点颜色
- `defaults.sizes`：节点大小
- `defaults.display`：显示设置与默认层级
- `defaults.line`：线条宽度/透明度
- `defaults.layout`：力导布局参数
- `themes`：主题色与背景

配置会存储在浏览器 `localStorage` 的 `graph_config_v3`。

## Excel 导入/导出

- 单个 Excel 文件包含多个工作表：`nodes`、`links`（可选 `meta`、`categories`）
- `nodes` 字段建议：`id`、`name`、`category`、`size`、`color`、`properties`
- `links` 字段建议：`source`、`target`、`name`、`properties`
- 缺失的 `size` / `color` / `properties` 会按 `Config` 默认配置自动补全
- 如果 `links` 里的 `source/target` 在 `nodes` 中不存在，会给出警告并跳过该关系
- 模板中必填字段会用颜色标记（若 Excel 不显示颜色，以列名为准）
- 每次导入前会自动备份当前图谱数据，可通过“恢复备份”一键回滚

## 性能说明

- 生产模式（`npm run build` + `npm run start`）性能明显优于开发模式
- 首次渲染已做轻量优化（减少重绘、缩短动画、渐进渲染）

## 许可

仅用于学习/展示目的。
