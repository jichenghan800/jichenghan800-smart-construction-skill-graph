import Script from "next/script";

export default function Home() {
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
            <label htmlFor="courseSelect">选择专业：</label>
            <select id="courseSelect" defaultValue="all">
              <option value="all">全部专业</option>
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
              <div className="legend-item">
                <span
                  className="legend-color"
                  style={{ background: "var(--color-major)" }}
                />
                <span>专业</span>
              </div>
              <div className="legend-item">
                <span
                  className="legend-color"
                  style={{ background: "var(--color-category)" }}
                />
                <span>课程类别</span>
              </div>
              <div className="legend-item">
                <span
                  className="legend-color"
                  style={{ background: "var(--color-course)" }}
                />
                <span>课程名称</span>
              </div>
              <div className="legend-item">
                <span
                  className="legend-color"
                  style={{ background: "var(--color-type)" }}
                />
                <span>能力类型</span>
              </div>
              <div className="legend-item">
                <span
                  className="legend-color"
                  style={{ background: "var(--color-ability)" }}
                />
                <span>能力</span>
              </div>
              <div className="legend-item">
                <span
                  className="legend-color"
                  style={{ background: "var(--color-point)" }}
                />
                <span>能力点</span>
              </div>
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
              <div className="color-grid">
                <div className="config-item color-item">
                  <label>专业</label>
                  <input type="color" id="colorMajor" defaultValue="#E74C3C" />
                </div>
                <div className="config-item color-item">
                  <label>课程类别</label>
                  <input type="color" id="colorCategory" defaultValue="#3498DB" />
                </div>
                <div className="config-item color-item">
                  <label>课程名称</label>
                  <input type="color" id="colorCourse" defaultValue="#2ECC71" />
                </div>
                <div className="config-item color-item">
                  <label>能力类型</label>
                  <input type="color" id="colorType" defaultValue="#F39C12" />
                </div>
                <div className="config-item color-item">
                  <label>能力</label>
                  <input type="color" id="colorAbility" defaultValue="#9B59B6" />
                </div>
                <div className="config-item color-item">
                  <label>能力点</label>
                  <input type="color" id="colorPoint" defaultValue="#1ABC9C" />
                </div>
              </div>
            </section>

            <section className="config-section">
              <h4>节点大小</h4>
              <div className="config-item slider-item">
                <label>
                  专业 <span id="sizeMajorVal">100</span>
                </label>
                <input type="range" id="sizeMajor" min="40" max="150" defaultValue="100" />
              </div>
              <div className="config-item slider-item">
                <label>
                  课程类别 <span id="sizeCategoryVal">85</span>
                </label>
                <input
                  type="range"
                  id="sizeCategory"
                  min="30"
                  max="120"
                  defaultValue="85"
                />
              </div>
              <div className="config-item slider-item">
                <label>
                  课程名称 <span id="sizeCourseVal">75</span>
                </label>
                <input type="range" id="sizeCourse" min="30" max="110" defaultValue="75" />
              </div>
              <div className="config-item slider-item">
                <label>
                  能力类型 <span id="sizeTypeVal">70</span>
                </label>
                <input type="range" id="sizeType" min="25" max="100" defaultValue="70" />
              </div>
              <div className="config-item slider-item">
                <label>
                  能力 <span id="sizeAbilityVal">60</span>
                </label>
                <input type="range" id="sizeAbility" min="20" max="90" defaultValue="60" />
              </div>
              <div className="config-item slider-item">
                <label>
                  能力点 <span id="sizePointVal">45</span>
                </label>
                <input type="range" id="sizePoint" min="15" max="70" defaultValue="45" />
              </div>
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
