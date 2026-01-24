# 专业能力图谱系统（复刻版）

一个基于 Next.js + ECharts 的知识图谱可视化项目，复刻自在线示例站点。提供根节点筛选、层级展开、主题切换、图谱布局切换、图谱导出与参数配置等功能。

## 功能特性

- 图谱展示：基于 ECharts Graph 的力导布局与环形布局
- 根节点筛选：根据数据元信息动态生成类型与选项（不再限定“专业”）
- 层级控制：按层级展开（默认 3 层），支持按层级设置节点大小与显隐
- 主题切换：经典/海洋/森林/日落/科技
- 图谱设置：按层级节点颜色/大小/显隐，线条参数、布局参数
- 统计信息：节点/关系数量实时更新
- 导出图片：一键导出 PNG
- Excel 导入/导出：单 sheet 链式结构
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
- `public/js/app.js`：图谱逻辑（配置、数据加载、渲染、交互、元信息同步）
- `public/data/graph_full.json`：图谱数据
- `src/app/api/graph/route.ts`：服务端持久化接口（读写本地文件）

## 配置说明

图谱配置集中在 `public/js/app.js` 的 `Config` 对象中：

- `defaults.colors`：节点颜色
- `defaults.levelSettings`：节点大小与显隐（`{ size, visible }`，按层级）
- `defaults.display`：显示设置与默认层级
- `defaults.line`：线条宽度/透明度
- `defaults.layout`：力导布局参数
- `themes`：主题色与背景
- `LEVEL_SIZE_MAX/STEP/MIN`：层级默认大小规则
- `BASE_COLOR_ORDER`：层级颜色映射顺序

配置会存储在浏览器 `localStorage` 的 `graph_config_v3`。
若检测到旧版配置（如 `sizes` 字段）会自动清理并回退到默认配置。

## Excel 导入/导出

- 单个 Excel 文件仅 1 个工作表，表头固定为：
  `专业 | 关系(专业-课程类别) | 课程类别 | 关系(课程类别-课程名称) | 课程名称 | 关系(课程名称-能力类型) | 能力类型 | 关系(能力类型-能力) | 能力 | 关系(能力-能力点) | 能力点`
- 仅节点列为必填，关系列可为空；缺失节点信息的行会被跳过并提示
- 节点 ID 由系统自动生成（稳定规则：节点类型 + 名称 + 父节点），无需在 Excel 中填写
- 导出 Excel 仅支持从 Excel 导入的数据；原始为 JSON 时提示直接导出 JSON
- 模板中必填字段会用颜色标记（若 Excel 不显示颜色，以列名为准）
- 每次导入前会自动备份当前图谱数据，可通过“恢复备份”一键回滚
- 运维密码配置在 `public/config/ops.json`，修改 `password` 即可生效
- 可选：在 Excel 第二个工作表中填写自定义标题，工作表名建议 `标题`，任意单元格的第一个非空值将作为页面左上角标题

## 服务端持久化

- 本分支用于 Vercel 部署，导入 Excel 后会保存到 Vercel Blob（`graph_saved.json`）。
- 服务端接口：`GET /api/graph` 读取 Blob（不存在则回退到 `public/data/graph_full.json`），`POST /api/graph` 写入 Blob。
- 需要在 Vercel 项目配置环境变量 `BLOB_READ_WRITE_TOKEN`。
- 未配置 Token 时，`/api/graph` 将返回错误。

## 数据元信息

- 图谱数据可包含 `meta` 字段，例如 `meta.title`（标题）与 `meta.nodeTypes`（节点层级/类型列表）。
- 页面中的根节点筛选、图例、节点颜色/大小/显隐会根据 `meta.nodeTypes` 动态生成。

## 性能说明

- 生产模式（`npm run build` + `npm run start`）性能明显优于开发模式
- 首次渲染已做轻量优化（减少重绘、缩短动画、渐进渲染）

## 许可

仅用于学习/展示目的。
