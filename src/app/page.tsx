"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

type LevelSetting = {
  size: number;
  visible: boolean;
};

type RootOption = {
  id: string;
  name: string;
};

const DEFAULT_LEVEL_COLORS = [
  "#E74C3C",
  "#3498DB",
  "#2ECC71",
  "#F39C12",
  "#9B59B6",
  "#1ABC9C",
];

export default function Home() {
  const [nodeTypes, setNodeTypes] = useState<string[]>([]);
  const [levelSettings, setLevelSettings] = useState<LevelSetting[]>([]);
  const [rootType, setRootType] = useState<string>("专业");
  const [rootOptions, setRootOptions] = useState<RootOption[]>([]);
  const [levelColors, setLevelColors] = useState<string[]>(DEFAULT_LEVEL_COLORS);

  useEffect(() => {
    const syncFromApp = (detail?: {
      nodeTypes?: string[];
      levelSettings?: LevelSetting[];
      rootType?: string;
      rootOptions?: RootOption[];
      levelColors?: string[];
    }) => {
      const app = (window as unknown as { graphApp?: any }).graphApp;
      const types = detail?.nodeTypes ?? app?.getNodeTypes?.() ?? app?.meta?.nodeTypes ?? [];
      const settings =
        detail?.levelSettings ?? app?.getLevelSettings?.() ?? [];
      const nextRootType = detail?.rootType ?? app?.getRootType?.() ?? "专业";
      const options = detail?.rootOptions ?? app?.getRootOptions?.() ?? [];
      const colors = detail?.levelColors ?? app?.getLevelColors?.() ?? DEFAULT_LEVEL_COLORS;
      setNodeTypes(Array.isArray(types) ? types : []);
      if (Array.isArray(settings) && settings.length) {
        setLevelSettings(settings.map((setting: LevelSetting) => ({
          size: Number(setting.size),
          visible: setting.visible !== false,
        })));
      } else if (Array.isArray(types)) {
        setLevelSettings(
          types.map((_, index) => ({
            size: app?.getLevelSize?.(index) ?? Math.max(100 - index * 15, 20),
            visible: app?.isLevelVisible?.(index) ?? true,
          }))
        );
      }
      setRootType(nextRootType);
      setRootOptions(Array.isArray(options) ? options : []);
      setLevelColors(Array.isArray(colors) && colors.length ? colors : DEFAULT_LEVEL_COLORS);
    };

    syncFromApp();

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      syncFromApp(customEvent.detail);
    };

    window.addEventListener("graphApp:meta", handler);
    return () => {
      window.removeEventListener("graphApp:meta", handler);
    };
  }, []);

  const handleSizeChange = (index: number, value: number) => {
    setLevelSettings((prev) => {
      const next = [...prev];
      const current = next[index] ?? { size: value, visible: true };
      next[index] = { ...current, size: value };
      return next;
    });
    const app = (window as unknown as { graphApp?: any }).graphApp;
    app?.updateLevelSize?.(index, value);
  };

  const handleVisibilityChange = (index: number, value: boolean) => {
    setLevelSettings((prev) => {
      const next = [...prev];
      const current = next[index] ?? { size: 100, visible: value };
      next[index] = { ...current, visible: value };
      return next;
    });
    const app = (window as unknown as { graphApp?: any }).graphApp;
    app?.updateLevelVisibility?.(index, value);
  };

  const handleColorChange = (index: number, value: string) => {
    setLevelColors((prev) => {
      const next = prev.length ? [...prev] : [...DEFAULT_LEVEL_COLORS];
      const colorIndex = index % next.length;
      next[colorIndex] = value;
      return next;
    });
    const app = (window as unknown as { graphApp?: any }).graphApp;
    app?.updateLevelColor?.(index, value);
  };
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"
        strategy="beforeInteractive"
      />
      <Script src="js/app.js" strategy="afterInteractive" />

      <header className="toolbar">
        <div className="toolbar-left">
          <h1 id="graphTitle" className="logo">专业能力图谱系统</h1>
        </div>
        <div className="toolbar-center">
          <div className="course-selector">
            <label htmlFor="courseSelect">选择{rootType}：</label>
            <select id="courseSelect" defaultValue="all">
              <option value="all">全部{rootType}</option>
              {rootOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div className="level-selector">
            <label htmlFor="levelSelect">展开层级：</label>
            <select id="levelSelect" defaultValue="3">
              <option value="1">1层</option>
              <option value="2">2层</option>
              <option value="3">3层</option>
              <option value="4">4层</option>
              <option value="5">5层</option>
              <option value="0">全部</option>
            </select>
          </div>
          <div className="theme-selector">
            <label htmlFor="themeSelect">主题：</label>
            <select id="themeSelect" defaultValue="classic">
              <option value="classic">经典主题</option>
              <option value="ocean">海洋主题</option>
              <option value="forest">森林主题</option>
              <option value="sunset">日落主题</option>
              <option value="tech">科技主题</option>
            </select>
          </div>
          <button id="btnSwitchLayout" className="btn btn-primary" type="button">
            切换布局
          </button>
        </div>
        <div className="toolbar-right">
          <div className="ops-menu">
            <button id="btnOpsMenu" className="btn btn-secondary" type="button">
              <span className="icon">🧰</span> 运维
            </button>
            <div id="opsPanel" className="ops-panel">
              <button id="btnTemplateExcel" className="btn btn-secondary" type="button">
                <span className="icon">🧾</span> 下载模板
              </button>
              <button id="btnImportExcel" className="btn btn-primary" type="button">
                <span className="icon">📥</span> 导入Excel
              </button>
              <button id="btnExportExcel" className="btn btn-success" type="button">
                <span className="icon">📤</span> 导出Excel
              </button>
              <button id="btnRestoreBackup" className="btn btn-secondary" type="button">
                <span className="icon">🕘</span> 恢复备份
              </button>
            </div>
          </div>
          <button id="btnExport" className="btn btn-success" type="button">
            <span className="icon">📷</span> 导出图片
          </button>
          <button id="btnTogglePanel" className="btn btn-secondary" type="button">
            <span className="icon">⚙️</span> 设置
          </button>
        </div>
      </header>
      <input
        id="excelFileInput"
        className="visually-hidden"
        type="file"
        accept=".xlsx,.xls"
      />

      <main className="main-container">
        <div className="graph-container">
          <div id="graphChart" className="graph-chart" />
          <div id="loadingOverlay" className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner" />
              <div className="loading-nodes">
                <div className="loading-node" />
                <div className="loading-node" />
                <div className="loading-node" />
                <div className="loading-node" />
                <div className="loading-node" />
              </div>
              <p>正在加载图谱数据...</p>
              <span className="loading-tip">首次加载可能需要几秒钟</span>
            </div>
          </div>
          <div className="legend-panel">
            <h4>节点类型</h4>
            <div className="legend-items">
              {nodeTypes.length === 0 ? (
                <div className="legend-item">暂无节点类型</div>
              ) : (
                nodeTypes.map((typeName, index) => (
                  <div className="legend-item" key={`${typeName}-${index}`}>
                    <span
                      className="legend-color"
                      style={{
                        background:
                          levelColors[index % levelColors.length] || "#999999",
                      }}
                    />
                    <span>{typeName}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="stats-panel">
            <span id="statsNodes">节点数: 0</span>
            <span id="statsLinks">关系数: 0</span>
          </div>
        </div>

        <aside id="configPanel" className="config-panel">
          <div className="panel-header">
            <h3>图谱设置</h3>
            <button id="btnClosePanel" className="btn-close" type="button">
              ×
            </button>
          </div>

          <div className="panel-content">
            <section className="config-section">
              <h4>数据源</h4>
              <div className="config-item">
                <label>
                  <input type="radio" name="dataSource" value="local" defaultChecked />
                  本地数据
                </label>
              </div>
              <div className="config-item">
                <label>
                  <input type="radio" name="dataSource" value="remote" />
                  在线数据
                </label>
              </div>
              <div className="config-item" id="remoteUrlGroup" style={{ display: "none" }}>
                <input
                  type="text"
                  id="remoteUrl"
                  placeholder="输入JSON URL"
                  className="input-text"
                />
                <button id="btnLoadRemote" className="btn btn-sm" type="button">
                  加载
                </button>
              </div>
            </section>

            <section className="config-section">
              <h4>显示设置</h4>
              <div className="config-item">
                <label>
                  <input type="checkbox" id="showLabels" defaultChecked />
                  显示节点文字
                </label>
              </div>
              <div className="config-item">
                <label>
                  <input type="checkbox" id="showEdgeLabels" />
                  显示关系文字
                </label>
              </div>
              <div className="config-item">
                <label>
                  <input type="checkbox" id="enableAnimation" defaultChecked />
                  启用动画效果
                </label>
              </div>
            </section>

            <section className="config-section">
              <h4>节点颜色</h4>
              {nodeTypes.length === 0 ? (
                <div className="config-item">暂无节点层级</div>
              ) : (
                <div className="color-grid">
                  {nodeTypes.map((typeName, index) => {
                    const color =
                      levelColors[index % levelColors.length] ||
                      DEFAULT_LEVEL_COLORS[index % DEFAULT_LEVEL_COLORS.length];
                    return (
                      <div className="config-item color-item" key={`${typeName}-${index}`}>
                        <label>{typeName}</label>
                        <input
                          type="color"
                          value={color}
                          onChange={(event) =>
                            handleColorChange(index, event.target.value)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="config-section">
              <h4>节点大小</h4>
              {nodeTypes.length === 0 ? (
                <div className="config-item">暂无节点层级</div>
              ) : (
                nodeTypes.map((typeName, index) => {
                  const setting = levelSettings[index];
                  const size = setting?.size ?? Math.max(100 - index * 15, 20);
                  const visible = setting?.visible ?? true;
                  return (
                    <div key={`${typeName}-${index}`}>
                      <div className="config-item slider-item">
                        <label>
                          {typeName} 大小 <span>{size}</span>
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="150"
                          step="1"
                          value={size}
                          onChange={(event) =>
                            handleSizeChange(index, Number(event.target.value))
                          }
                        />
                      </div>
                      <div className="config-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={visible}
                            onChange={(event) =>
                              handleVisibilityChange(index, event.target.checked)
                            }
                          />
                          显示 {typeName}
                        </label>
                      </div>
                    </div>
                  );
                })
              )}
            </section>

            <section className="config-section">
              <h4>线条设置</h4>
              <div className="config-item slider-item">
                <label>
                  线条粗细 <span id="lineWidthVal">1</span>
                </label>
                <input
                  type="range"
                  id="lineWidth"
                  min="0.5"
                  max="5"
                  step="0.5"
                  defaultValue="1"
                />
              </div>
              <div className="config-item slider-item">
                <label>
                  线条透明度 <span id="lineOpacityVal">0.6</span>
                </label>
                <input
                  type="range"
                  id="lineOpacity"
                  min="0.1"
                  max="1"
                  step="0.1"
                  defaultValue="0.6"
                />
              </div>
            </section>

            <section className="config-section">
              <h4>布局参数</h4>
              <div className="config-item slider-item">
                <label>
                  节点斥力 <span id="repulsionVal">300</span>
                </label>
                <input
                  type="range"
                  id="repulsion"
                  min="50"
                  max="1000"
                  step="50"
                  defaultValue="300"
                />
              </div>
              <div className="config-item slider-item">
                <label>
                  边长度 <span id="edgeLengthVal">100</span>
                </label>
                <input
                  type="range"
                  id="edgeLength"
                  min="30"
                  max="300"
                  step="10"
                  defaultValue="100"
                />
              </div>
              <div className="config-item slider-item">
                <label>
                  引力强度 <span id="gravityVal">0.1</span>
                </label>
                <input
                  type="range"
                  id="gravity"
                  min="0"
                  max="0.5"
                  step="0.05"
                  defaultValue="0.1"
                />
              </div>
            </section>

            <section className="config-section">
              <div className="btn-group">
                <button id="btnApply" className="btn btn-primary btn-block" type="button">
                  应用设置
                </button>
                <button id="btnReset" className="btn btn-secondary btn-block" type="button">
                  重置默认
                </button>
              </div>
            </section>
          </div>
        </aside>
      </main>

      <div id="nodeDetailModal" className="modal" style={{ display: "none" }}>
        <div className="modal-content">
          <div className="modal-header">
            <h3 id="modalTitle">节点信息</h3>
            <button className="btn-close" type="button">
              ×
            </button>
          </div>
          <div className="modal-body" id="modalBody" />
        </div>
      </div>
    </>
  );
}
