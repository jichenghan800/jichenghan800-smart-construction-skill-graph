const Config = {
    // 存储键名
    STORAGE_KEY: 'graph_config_v3',
    LEVEL_SIZE_MAX: 100,
    LEVEL_SIZE_STEP: 15,
    LEVEL_SIZE_MIN: 20,
    BASE_COLOR_ORDER: ['专业', '课程类别', '课程名称', '能力类型', '能力', '能力点'],

    // 预设主题
    themes: {
        'classic': {
            name: '经典主题',
            colors: {
                '专业': '#E74C3C',
                '课程类别': '#3498DB',
                '课程名称': '#2ECC71',
                '能力类型': '#F39C12',
                '能力': '#9B59B6',
                '能力点': '#1ABC9C'
            },
            background: '#ffffff'
        },
        'ocean': {
            name: '海洋主题',
            colors: {
                '专业': '#0D47A1',
                '课程类别': '#1565C0',
                '课程名称': '#1976D2',
                '能力类型': '#1E88E5',
                '能力': '#2196F3',
                '能力点': '#42A5F5'
            },
            background: '#f5f9fc'
        },
        'forest': {
            name: '森林主题',
            colors: {
                '专业': '#1B5E20',
                '课程类别': '#2E7D32',
                '课程名称': '#388E3C',
                '能力类型': '#43A047',
                '能力': '#4CAF50',
                '能力点': '#66BB6A'
            },
            background: '#f5fdf5'
        },
        'sunset': {
            name: '日落主题',
            colors: {
                '专业': '#C62828',
                '课程类别': '#E65100',
                '课程名称': '#F57C00',
                '能力类型': '#FFA000',
                '能力': '#FFB300',
                '能力点': '#FFC107'
            },
            background: '#fffcf5'
        },
        'tech': {
            name: '科技主题',
            colors: {
                '专业': '#6200EA',
                '课程类别': '#304FFE',
                '课程名称': '#00BFA5',
                '能力类型': '#00E676',
                '能力': '#FF4081',
                '能力点': '#536DFE'
            },
            background: '#fafafa'
        }
    },

    // 默认配置
    defaults: {
        // 节点颜色
        colors: {
            '专业': '#E74C3C',
            '课程类别': '#3498DB',
            '课程名称': '#2ECC71',
            '能力类型': '#F39C12',
            '能力': '#9B59B6',
            '能力点': '#1ABC9C'
        },
        
        levelSettings: [],
        
        // 显示设置
        display: {
            showLabels: true,
            showEdgeLabels: false,
            enableAnimation: true,
            defaultLevel: 3  // 默认展开层级
        },
        
        // 线条设置
        line: {
            width: 2,
            opacity: 0.8,
            curveness: 0
        },
        
        // 布局参数
        layout: {
            repulsion: 500,
            edgeLength: 80,
            gravity: 0.1
        },
        
        // 当前主题
        theme: 'classic',
        
        // 数据源
        dataSource: 'local'
    },

    // 当前配置
    current: null,

    
    init() {
        this.current = this.load() || Utils.deepClone(this.defaults);
        this.applyToDOM();
    },

    
    load() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const config = JSON.parse(stored);
                if (this.isLegacyConfig(config)) {
                    localStorage.clear();
                    return null;
                }
                // 合并默认配置（处理新增字段）
                return this.mergeWithDefaults(config);
            }
        } catch (error) {
            console.warn('配置加载失败:', error);
        }
        return null;
    },

    
    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.current));
            console.log('配置已保存');
        } catch (error) {
            console.error('配置保存失败:', error);
        }
    },

    
    mergeWithDefaults(config) {
        const merged = Utils.deepClone(this.defaults);
        
        if (config.colors) {
            Object.assign(merged.colors, config.colors);
        }
        if (Array.isArray(config.levelSettings)) {
            merged.levelSettings = config.levelSettings.map((setting) => ({
                size: Number.isFinite(Number(setting.size)) ? Number(setting.size) : null,
                visible: setting.visible !== false
            }));
        }
        if (config.display) {
            Object.assign(merged.display, config.display);
        }
        if (config.line) {
            Object.assign(merged.line, config.line);
        }
        if (config.layout) {
            Object.assign(merged.layout, config.layout);
        }
        if (config.dataSource) {
            merged.dataSource = config.dataSource;
        }
        if (config.theme) {
            merged.theme = config.theme;
        }
        
        return merged;
    },

    
    reset() {
        this.current = Utils.deepClone(this.defaults);
        this.applyToDOM();
        this.save();
    },

    
    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) {
            console.warn('主题不存在:', themeName);
            return;
        }

        // 更新颜色配置
        Object.assign(this.current.colors, theme.colors);
        this.current.theme = themeName;

        // 应用背景
        const graphContainer = document.querySelector('.graph-container');
        if (graphContainer) {
            graphContainer.style.background = theme.background;
        }

        // 更新DOM和CSS变量
        this.applyToDOM();
        this.updateCSSVariables();
        
        // 更新主题选择器
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = themeName;
        }

        console.log('主题已切换:', theme.name);
    },

    
    getThemeList() {
        return Object.entries(this.themes).map(([key, value]) => ({
            id: key,
            name: value.name
        }));
    },

    isLegacyConfig(config) {
        if (!config || typeof config !== 'object') {
            return false;
        }
        return Boolean(
            config.sizes ||
            Object.prototype.hasOwnProperty.call(config, 'sizeMajor') ||
            Object.prototype.hasOwnProperty.call(config, 'majorSize')
        );
    },

    
    setColor(category, color) {
        if (this.current.colors.hasOwnProperty(category)) {
            this.current.colors[category] = color;
        }
    },

    getLevelColors() {
        return this.BASE_COLOR_ORDER.map((name) => this.getColor(name));
    },

    setBaseColor(levelIndex, color) {
        if (!Number.isFinite(levelIndex)) {
            return;
        }
        const names = this.BASE_COLOR_ORDER;
        if (!names.length) return;
        const index = ((levelIndex % names.length) + names.length) % names.length;
        this.setColor(names[index], color);
        this.updateCSSVariables();
        this.save();
    },

    
    
    setDisplay(key, value) {
        if (this.current.display.hasOwnProperty(key)) {
            this.current.display[key] = value;
        }
    },

    
    setLine(key, value) {
        if (this.current.line.hasOwnProperty(key)) {
            this.current.line[key] = parseFloat(value);
        }
    },

    
    setLayout(key, value) {
        if (this.current.layout.hasOwnProperty(key)) {
            this.current.layout[key] = parseFloat(value);
        }
    },

    
    getColor(category) {
        return this.current.colors[category] || '#999999';
    },

    
    getSize() {
        return this.getLevelSize(0);
    },

    ensureLevelSettings(levelCount) {
        if (!this.current.levelSettings) {
            this.current.levelSettings = [];
        }
        if (!Number.isFinite(levelCount) || levelCount <= 0) {
            return;
        }
        const settings = this.current.levelSettings.slice(0, levelCount);
        for (let i = settings.length; i < levelCount; i += 1) {
            settings.push(this.buildDefaultLevelSetting(i));
        }
        this.current.levelSettings = settings.map((setting, index) => ({
            size: Number.isFinite(Number(setting.size)) ? Number(setting.size) : this.getDefaultLevelSize(index),
            visible: setting.visible !== false
        }));
    },

    buildDefaultLevelSetting(levelIndex) {
        return {
            size: this.getDefaultLevelSize(levelIndex),
            visible: true
        };
    },

    getDefaultLevelSize(levelIndex) {
        return Math.max(
            this.LEVEL_SIZE_MAX - (levelIndex * this.LEVEL_SIZE_STEP),
            this.LEVEL_SIZE_MIN
        );
    },

    getLevelSettings() {
        return Array.isArray(this.current.levelSettings) ? this.current.levelSettings : [];
    },

    getLevelSize(levelIndex) {
        if (!Number.isFinite(levelIndex) || levelIndex < 0) {
            return this.getDefaultLevelSize(0);
        }
        this.ensureLevelSettings(levelIndex + 1);
        return this.current.levelSettings[levelIndex].size;
    },

    isLevelVisible(levelIndex) {
        if (!Number.isFinite(levelIndex) || levelIndex < 0) {
            return true;
        }
        this.ensureLevelSettings(levelIndex + 1);
        return this.current.levelSettings[levelIndex].visible !== false;
    },

    updateLevelSize(levelIndex, value) {
        this.ensureLevelSettings(levelIndex + 1);
        const sizeValue = parseInt(value, 10);
        this.current.levelSettings[levelIndex].size = Number.isFinite(sizeValue)
            ? sizeValue
            : this.getDefaultLevelSize(levelIndex);
        this.save();
    },

    updateLevelVisibility(levelIndex, isVisible) {
        this.ensureLevelSettings(levelIndex + 1);
        this.current.levelSettings[levelIndex].visible = isVisible === true;
        this.save();
    },

    
    applyToDOM() {
        // 颜色配置
        this.setInputValue('colorMajor', this.current.colors['专业']);
        this.setInputValue('colorCategory', this.current.colors['课程类别']);
        this.setInputValue('colorCourse', this.current.colors['课程名称']);
        this.setInputValue('colorType', this.current.colors['能力类型']);
        this.setInputValue('colorAbility', this.current.colors['能力']);
        this.setInputValue('colorPoint', this.current.colors['能力点']);
        
        // 显示设置
        this.setCheckboxValue('showLabels', this.current.display.showLabels);
        this.setCheckboxValue('showEdgeLabels', this.current.display.showEdgeLabels);
        this.setCheckboxValue('enableAnimation', this.current.display.enableAnimation);
        
        // 线条设置
        this.setInputValue('lineWidth', this.current.line.width);
        this.setInputValue('lineOpacity', this.current.line.opacity);
        this.updateSliderDisplay('lineWidth', this.current.line.width);
        this.updateSliderDisplay('lineOpacity', this.current.line.opacity);
        
        // 布局参数
        this.setInputValue('repulsion', this.current.layout.repulsion);
        this.setInputValue('edgeLength', this.current.layout.edgeLength);
        this.setInputValue('gravity', this.current.layout.gravity);
        this.updateSliderDisplay('repulsion', this.current.layout.repulsion);
        this.updateSliderDisplay('edgeLength', this.current.layout.edgeLength);
        this.updateSliderDisplay('gravity', this.current.layout.gravity);
        
        // 数据源
        const dataSourceRadio = document.querySelector(`input[name="dataSource"][value="${this.current.dataSource}"]`);
        if (dataSourceRadio) {
            dataSourceRadio.checked = true;
        }
        
        // 更新CSS变量
        this.updateCSSVariables();
    },

    
    readFromDOM() {
        const hasColorInputs = [
            'colorMajor', 'colorCategory', 'colorCourse',
            'colorType', 'colorAbility', 'colorPoint'
        ].some((id) => document.getElementById(id));
        if (hasColorInputs) {
            // 颜色配置
            this.current.colors['专业'] = this.getInputValue('colorMajor') || this.defaults.colors['专业'];
            this.current.colors['课程类别'] = this.getInputValue('colorCategory') || this.defaults.colors['课程类别'];
            this.current.colors['课程名称'] = this.getInputValue('colorCourse') || this.defaults.colors['课程名称'];
            this.current.colors['能力类型'] = this.getInputValue('colorType') || this.defaults.colors['能力类型'];
            this.current.colors['能力'] = this.getInputValue('colorAbility') || this.defaults.colors['能力'];
            this.current.colors['能力点'] = this.getInputValue('colorPoint') || this.defaults.colors['能力点'];
        }
        
        // 显示设置
        this.current.display.showLabels = this.getCheckboxValue('showLabels');
        this.current.display.showEdgeLabels = this.getCheckboxValue('showEdgeLabels');
        this.current.display.enableAnimation = this.getCheckboxValue('enableAnimation');
        
        // 线条设置
        this.current.line.width = parseFloat(this.getInputValue('lineWidth')) || this.defaults.line.width;
        this.current.line.opacity = parseFloat(this.getInputValue('lineOpacity')) || this.defaults.line.opacity;
        
        // 布局参数
        this.current.layout.repulsion = parseInt(this.getInputValue('repulsion')) || this.defaults.layout.repulsion;
        this.current.layout.edgeLength = parseInt(this.getInputValue('edgeLength')) || this.defaults.layout.edgeLength;
        this.current.layout.gravity = parseFloat(this.getInputValue('gravity')) || this.defaults.layout.gravity;
        
        // 数据源
        const dataSourceRadio = document.querySelector('input[name="dataSource"]:checked');
        if (dataSourceRadio) {
            this.current.dataSource = dataSourceRadio.value;
        }
        
        // 更新CSS变量
        this.updateCSSVariables();
    },

    
    updateCSSVariables() {
        const root = document.documentElement;
        root.style.setProperty('--color-major', this.current.colors['专业']);
        root.style.setProperty('--color-category', this.current.colors['课程类别']);
        root.style.setProperty('--color-course', this.current.colors['课程名称']);
        root.style.setProperty('--color-type', this.current.colors['能力类型']);
        root.style.setProperty('--color-ability', this.current.colors['能力']);
        root.style.setProperty('--color-point', this.current.colors['能力点']);
    },

    
    setInputValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    },

    
    getInputValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : null;
    },

    
    setCheckboxValue(id, checked) {
        const element = document.getElementById(id);
        if (element) {
            element.checked = checked;
        }
    },

    
    getCheckboxValue(id) {
        const element = document.getElementById(id);
        return element ? element.checked : false;
    },

    
    updateSliderDisplay(sliderId, value) {
        const displayElement = document.getElementById(sliderId + 'Val');
        if (displayElement) {
            displayElement.textContent = value;
        }
    },

    
    getEChartsConfig() {
        return {
            force: {
                repulsion: this.current.layout.repulsion,
                edgeLength: this.current.layout.edgeLength,
                gravity: this.current.layout.gravity
            },
            lineStyle: {
                width: this.current.line.width,
                opacity: this.current.line.opacity,
                curveness: this.current.line.curveness
            },
            label: {
                show: this.current.display.showLabels,
                position: 'right',
                fontSize: 12
            },
            edgeLabel: {
                show: this.current.display.showEdgeLabels,
                fontSize: 10
            },
            animation: this.current.display.enableAnimation
        };
    }
};

const Utils = {
    // 数据源配置
    LOCAL_DATA_URL: 'api/graph',
    remoteDataUrl: '',

    
    async loadData(useRemote = false) {
        const url = useRemote && this.remoteDataUrl ? this.remoteDataUrl : this.LOCAL_DATA_URL;
        
        try {
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('数据加载成功:', data.meta);
            return data;
        } catch (error) {
            console.error('数据加载失败:', error);
            throw error;
        }
    },

    
    setRemoteUrl(url) {
        this.remoteDataUrl = url;
    },

    async saveGraphToServer(graphData) {
        if (!graphData) {
            throw new Error('无可保存的数据');
        }
        const response = await fetch('api/graph', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(graphData)
        });
        if (!response.ok) {
            throw new Error(`保存失败: ${response.status}`);
        }
        return response.json().catch(() => ({}));
    },

    SHEETJS_URL: 'vendor/xlsx.full.min.js',
    sheetJSImportPromise: null,
    BACKUP_KEY: 'graph_backup_latest',
    OPS_CONFIG_URL: 'config/ops.json',
    opsPasswordCache: null,
    CHAIN_SPEC: [
        { kind: 'node', key: '专业', category: '专业' },
        { kind: 'rel', key: '关系(专业-课程类别)' },
        { kind: 'node', key: '课程类别', category: '课程类别' },
        { kind: 'rel', key: '关系(课程类别-课程名称)' },
        { kind: 'node', key: '课程名称', category: '课程名称' },
        { kind: 'rel', key: '关系(课程名称-能力类型)' },
        { kind: 'node', key: '能力类型', category: '能力类型' },
        { kind: 'rel', key: '关系(能力类型-能力)' },
        { kind: 'node', key: '能力', category: '能力' },
        { kind: 'rel', key: '关系(能力-能力点)' },
        { kind: 'node', key: '能力点', category: '能力点' }
    ],

    loadSheetJS() {
        if (window.XLSX) {
            return Promise.resolve(window.XLSX);
        }
        if (this.sheetJSImportPromise) {
            return this.sheetJSImportPromise;
        }

        this.sheetJSImportPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = this.SHEETJS_URL;
            script.async = true;
            script.onload = () => {
                if (window.XLSX) {
                    resolve(window.XLSX);
                } else {
                    this.sheetJSImportPromise = null;
                    reject(new Error('SheetJS 加载失败'));
                }
            };
            script.onerror = () => {
                this.sheetJSImportPromise = null;
                reject(new Error('SheetJS 加载失败'));
            };
            document.head.appendChild(script);
        });

        return this.sheetJSImportPromise;
    },

    async getOpsPassword() {
        if (this.opsPasswordCache !== null) {
            return this.opsPasswordCache;
        }

        try {
            const response = await fetch(this.OPS_CONFIG_URL, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.opsPasswordCache = data.password || '';
        } catch (error) {
            console.warn('运维密码读取失败:', error);
            this.opsPasswordCache = '';
        }

        return this.opsPasswordCache;
    },

    saveBackup(data) {
        if (!data) {
            return false;
        }
        try {
            const payload = {
                savedAt: new Date().toISOString(),
                data: this.deepClone(data)
            };
            localStorage.setItem(this.BACKUP_KEY, JSON.stringify(payload));
            return true;
        } catch (error) {
            console.warn('备份保存失败:', error);
            return false;
        }
    },

    loadBackup() {
        try {
            const raw = localStorage.getItem(this.BACKUP_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (error) {
            console.warn('备份读取失败:', error);
            return null;
        }
    },

    getBackupLabel(backup) {
        if (!backup || !backup.savedAt) return '';
        const date = new Date(backup.savedAt);
        if (Number.isNaN(date.getTime())) {
            return backup.savedAt;
        }
        return this.formatDate(date);
    },

    getChainHeaders() {
        return this.CHAIN_SPEC.map((item) => item.key);
    },

    hashString(value) {
        let hash = 2166136261;
        for (let i = 0; i < value.length; i += 1) {
            hash ^= value.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(16);
    },

    buildNodeId(category, name, parentId) {
        const key = `${category}|${name}|${parentId}`;
        return `n_${this.hashString(key)}`;
    },

    normalizeCell(value) {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value).trim();
    },

    parseChainSheet(XLSX, sheet) {
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        if (!rows.length) {
            throw new Error('Excel 表为空');
        }

        const rawHeaders = rows[0].map((cell) => this.normalizeCell(cell));
        if (!rawHeaders.length) {
            throw new Error('Excel 表头为空');
        }
        if (rawHeaders.length % 2 === 0) {
            throw new Error(`表头列数必须为奇数，当前为 ${rawHeaders.length}`);
        }
        rawHeaders.forEach((header, index) => {
            if (!header) {
                throw new Error(`表头第 ${index + 1} 列为空`);
            }
        });

        const chainSpec = rawHeaders.map((header, index) => {
            const isNode = index % 2 === 0;
            return {
                kind: isNode ? 'node' : 'rel',
                key: header,
                category: isNode ? header : null,
                depth: isNode ? Math.floor(index / 2) : null,
                index
            };
        });
        const nodeTypes = chainSpec.filter((spec) => spec.kind === 'node').map((spec) => spec.key);

        const nodes = [];
        const links = [];
        const nodeKeyMap = new Map();
        const linkKeySet = new Set();
        const normalizedRows = [];
        let invalidRows = 0;

        for (let i = 1; i < rows.length; i += 1) {
            const row = rows[i];
            if (!row || row.every((cell) => this.normalizeCell(cell) === '')) {
                continue;
            }

            const rowData = {};
            let hasMissingNode = false;
            chainSpec.forEach((spec) => {
                const value = this.normalizeCell(row[spec.index]);
                rowData[spec.key] = value;
                if (spec.kind === 'node' && !value) {
                    hasMissingNode = true;
                }
                if (spec.kind === 'rel' && !value) {
                    const rowNumber = i + 1;
                    const colNumber = spec.index + 1;
                    throw new Error(`第 ${rowNumber} 行 第 ${colNumber} 列关系缺失`);
                }
            });

            if (hasMissingNode) {
                invalidRows += 1;
                continue;
            }

            let parentId = 'ROOT';
            let prevNodeId = null;
            let pendingRelation = '';

            chainSpec.forEach((spec) => {
                const value = rowData[spec.key] || '';
                if (spec.kind === 'rel') {
                    pendingRelation = value;
                    return;
                }

                const nodeKey = `${spec.category}||${value}||${parentId}`;
                let nodeId = nodeKeyMap.get(nodeKey);
                if (!nodeId) {
                    nodeId = this.buildNodeId(spec.category, value, parentId);
                    nodeKeyMap.set(nodeKey, nodeId);
                    nodes.push({
                        id: nodeId,
                        name: value,
                        category: spec.category,
                        depth: spec.depth,
                        properties: {}
                    });
                }

                if (prevNodeId) {
                    const linkKey = `${prevNodeId}||${nodeId}||${pendingRelation}`;
                    if (!linkKeySet.has(linkKey)) {
                        linkKeySet.add(linkKey);
                        links.push({
                            source: prevNodeId,
                            target: nodeId,
                            name: pendingRelation,
                            properties: {}
                        });
                    }
                }

                prevNodeId = nodeId;
                parentId = nodeId;
                pendingRelation = '';
            });

            normalizedRows.push(rowData);
        }

        if (normalizedRows.length === 0) {
            throw new Error('未找到有效数据行，请检查必填节点列');
        }

        return {
            nodes,
            links,
            normalizedRows,
            invalidRows,
            nodeTypes
        };
    },

    getSheetByName(workbook, candidates) {
        const nameMap = new Map();
        workbook.SheetNames.forEach(name => {
            nameMap.set(name.toLowerCase(), name);
        });

        for (const candidate of candidates) {
            const key = candidate.toLowerCase();
            if (nameMap.has(key)) {
                return workbook.Sheets[nameMap.get(key)];
            }
        }
        return null;
    },

    extractRowData(row, aliasMap) {
        const data = {};
        const extras = {};
        const keyMap = {};
        const originalMap = {};

        Object.keys(row).forEach((key) => {
            const trimmed = String(key).trim();
            const lower = trimmed.toLowerCase();
            keyMap[lower] = row[key];
            originalMap[lower] = trimmed;
        });

        const matchedKeys = new Set();
        Object.entries(aliasMap).forEach(([canonical, aliases]) => {
            for (const alias of aliases) {
                const aliasKey = alias.toLowerCase();
                if (Object.prototype.hasOwnProperty.call(keyMap, aliasKey)) {
                    data[canonical] = keyMap[aliasKey];
                    matchedKeys.add(aliasKey);
                    break;
                }
            }
        });

        Object.entries(keyMap).forEach(([lowerKey, value]) => {
            if (!matchedKeys.has(lowerKey) && value !== '' && value !== null && value !== undefined) {
                extras[originalMap[lowerKey]] = value;
            }
        });

        return { data, extras };
    },

    parseProperties(value) {
        if (value === '' || value === null || value === undefined) {
            return {};
        }
        if (typeof value === 'object') {
            return value;
        }

        try {
            return JSON.parse(String(value));
        } catch (error) {
            console.warn('属性字段解析失败，已忽略:', value);
            return {};
        }
    },

    toNumber(value) {
        if (value === '' || value === null || value === undefined) {
            return null;
        }
        const num = Number(value);
        return Number.isFinite(num) ? num : null;
    },

    buildCategoriesFromNodes(nodes) {
        const counts = {};
        const depths = {};
        nodes.forEach(node => {
            const category = node.category || '未分类';
            counts[category] = (counts[category] || 0) + 1;
            if (depths[category] === undefined && Number.isFinite(Number(node.depth))) {
                depths[category] = Number(node.depth);
            }
        });

        return Object.entries(counts).map(([name, count]) => ({
            name,
            count,
            color: Config.getColor(name),
            size: Config.getLevelSize(depths[name] ?? 0)
        }));
    },

    buildMeta(nodes, links, title = '专业能力图谱系统', nodeTypes = []) {
        const meta = {
            title,
            exportTime: new Date().toISOString(),
            nodeCount: nodes.length,
            linkCount: links.length
        };
        if (Array.isArray(nodeTypes) && nodeTypes.length) {
            meta.nodeTypes = [...nodeTypes];
        }
        return meta;
    },

    parseNodesFromRows(rows) {
        const aliasMap = {
            id: ['id', 'ID', '节点ID', 'nodeId', 'node_id'],
            name: ['name', '名称', '节点名称', 'nodeName'],
            category: ['category', '类别', '节点类型', '类型'],
            size: ['size', '大小', '节点大小'],
            color: ['color', '颜色', '节点颜色'],
            properties: ['properties', '属性', 'props']
        };

        const nodes = [];
        let skipped = 0;

        rows.forEach((row) => {
            const { data, extras } = this.extractRowData(row, aliasMap);
            const id = data.id !== undefined ? String(data.id).trim() : '';
            if (!id) {
                skipped += 1;
                return;
            }

            const category = data.category ? String(data.category).trim() : '未分类';
            const hasCustomSize = data.size !== undefined && String(data.size).trim() !== '';
            const hasCustomColor = data.color !== undefined && String(data.color).trim() !== '';
            const useCustomStyle = hasCustomSize || hasCustomColor;
            const sizeValue = this.toNumber(data.size);
            const size = sizeValue !== null ? sizeValue : Config.getSize(category);
            const color = hasCustomColor ? String(data.color).trim() : Config.getColor(category);
            const properties = {
                ...extras,
                ...this.parseProperties(data.properties)
            };

            nodes.push({
                id,
                name: data.name !== undefined ? String(data.name).trim() : id,
                category,
                size,
                color,
                useCustomStyle,
                properties
            });
        });

        return { nodes, skipped };
    },

    parseLinksFromRows(rows, nodeIdSet) {
        const aliasMap = {
            source: ['source', '源节点', 'from', '起点'],
            target: ['target', '目标节点', 'to', '终点'],
            name: ['name', '关系', '关系名称', 'label'],
            properties: ['properties', '属性', 'props']
        };

        const links = [];
        let skipped = 0;
        let missingRefs = 0;

        rows.forEach((row) => {
            const { data, extras } = this.extractRowData(row, aliasMap);
            const source = data.source !== undefined ? String(data.source).trim() : '';
            const target = data.target !== undefined ? String(data.target).trim() : '';
            if (!source || !target) {
                skipped += 1;
                return;
            }

            if (!nodeIdSet.has(source) || !nodeIdSet.has(target)) {
                missingRefs += 1;
                console.warn(`关系引用的节点不存在，已跳过: ${source} -> ${target}`);
                return;
            }

            const properties = {
                ...extras,
                ...this.parseProperties(data.properties)
            };

            links.push({
                source,
                target,
                name: data.name !== undefined ? String(data.name).trim() : '',
                properties
            });
        });

        return { links, skipped, missingRefs };
    },

    parseMetaSheet(XLSX, sheet) {
        if (!sheet) return null;
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true });
        if (!rows.length) return null;

        const aliasMap = {
            title: ['title', '标题', '名称'],
            exportTime: ['exportTime', '导出时间', '时间'],
            nodeCount: ['nodeCount', '节点数'],
            linkCount: ['linkCount', '关系数']
        };

        const { data } = this.extractRowData(rows[0], aliasMap);
        const nodeCount = this.toNumber(data.nodeCount);
        const linkCount = this.toNumber(data.linkCount);

        return {
            title: data.title ? String(data.title).trim() : '专业能力图谱系统',
            exportTime: data.exportTime ? String(data.exportTime).trim() : new Date().toISOString(),
            nodeCount: nodeCount !== null ? nodeCount : 0,
            linkCount: linkCount !== null ? linkCount : 0
        };
    },

    parseTitleSheet(XLSX, sheet) {
        if (!sheet) return '';
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
            const row = rows[rowIndex] || [];
            for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
                const value = this.normalizeCell(row[colIndex]);
                if (value) {
                    return value;
                }
            }
        }
        return '';
    },

    parseCategoriesSheet(XLSX, sheet) {
        if (!sheet) return [];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true });
        const aliasMap = {
            name: ['name', '名称', '类别'],
            count: ['count', '数量'],
            color: ['color', '颜色'],
            size: ['size', '大小']
        };

        return rows.map((row) => {
            const { data } = this.extractRowData(row, aliasMap);
            return {
                name: data.name ? String(data.name).trim() : '未分类',
                count: this.toNumber(data.count) || 0,
                color: data.color ? String(data.color).trim() : Config.getColor(data.name || '未分类'),
                size: this.toNumber(data.size) || Config.getSize(data.name || '未分类')
            };
        });
    },

    async parseExcelFile(file) {
        const XLSX = await this.loadSheetJS();
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });

        if (!workbook.SheetNames || !workbook.SheetNames.length) {
            throw new Error('Excel 表为空');
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
            throw new Error('未找到有效工作表');
        }

        const { nodes, links, normalizedRows, invalidRows, nodeTypes } = this.parseChainSheet(XLSX, sheet);
        const categories = this.buildCategoriesFromNodes(nodes);
        let titleSheet = this.getSheetByName(workbook, ['标题', 'title', 'header']);
        if (!titleSheet && workbook.SheetNames.length > 1) {
            const fallbackName = workbook.SheetNames[1];
            titleSheet = workbook.Sheets[fallbackName];
        }
        const customTitle = this.parseTitleSheet(XLSX, titleSheet);
        const meta = this.buildMeta(nodes, links, customTitle || '专业能力图谱系统', nodeTypes);

        const graphData = {
            meta,
            categories,
            graph: {
                nodes,
                links
            }
        };

        return {
            graphData,
            normalizedRows,
            invalidRows
        };
    },

    async exportExcel(rows, filename = '专业能力图谱系统') {
        const XLSX = await this.loadSheetJS();
        if (!Array.isArray(rows) || rows.length === 0) {
            throw new Error('暂无可导出的 Excel 数据');
        }
        const safeName = this.sanitizeFilename(filename);

        const headers = this.getChainHeaders();
        const body = rows.map((row) =>
            headers.map((header) => this.normalizeCell(row[header]))
        );
        const sheet = XLSX.utils.aoa_to_sheet([headers, ...body]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, sheet, '图谱');

        XLSX.writeFile(workbook, `${safeName}_${this.formatDate(new Date())}.xlsx`);
    },

    async exportJson(data, filename = '专业能力图谱系统') {
        if (!data) {
            throw new Error('暂无可导出的 JSON 数据');
        }
        const safeName = this.sanitizeFilename(filename);
        const payload = JSON.stringify(data, null, 2);
        const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${safeName}_${this.formatDate(new Date())}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    },

    async exportTemplateExcel(filename = '图谱模板') {
        const XLSX = await this.loadSheetJS();
        const headers = this.getChainHeaders();
        const sheet = XLSX.utils.aoa_to_sheet([headers]);

        const requiredStyle = {
            fill: { patternType: 'solid', fgColor: { rgb: 'FFFCE8B2' } },
            font: { bold: true, color: { rgb: 'FF8A4B08' } }
        };
        const markRequired = (cellAddress) => {
            if (sheet[cellAddress]) {
                sheet[cellAddress].s = requiredStyle;
            }
        };

        this.CHAIN_SPEC.forEach((spec, index) => {
            if (spec.kind === 'node') {
                markRequired(XLSX.utils.encode_cell({ r: 0, c: index }));
            }
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, sheet, '图谱');
        const titleSheet = XLSX.utils.aoa_to_sheet([['']]);
        XLSX.utils.book_append_sheet(workbook, titleSheet, '标题');

        XLSX.writeFile(workbook, `${filename}.xlsx`);
    },

    
    getRootType(graphData) {
        const meta = graphData && graphData.meta ? graphData.meta : {};
        const nodeTypes = Array.isArray(meta.nodeTypes) ? meta.nodeTypes : [];
        return nodeTypes.length ? nodeTypes[0] : '专业';
    },

    getCourseList(graphData) {
        const nodes = graphData.graph ? graphData.graph.nodes : graphData.nodes;
        const rootType = this.getRootType(graphData);
        return nodes.filter(node => node.category === rootType)
                    .map(node => ({
                        id: node.id,
                        name: node.name.replace(/ /g, '')  // 移除插入的空格
                    }));
    },

    
    filterByLevel(graphData, maxLevel) {
        const nodes = graphData.graph ? graphData.graph.nodes : graphData.nodes;
        const links = graphData.graph ? graphData.graph.links : graphData.links;
        
        const rootType = this.getRootType(graphData);
        const rootNodes = nodes.filter(node => node.category === rootType);
        if (!rootNodes.length) {
            return graphData;
        }
        
        // 构建邻接表
        const adjacency = this.buildAdjacency(links);
        
        // BFS按层级获取节点
        const levelNodes = new Set();
        rootNodes.forEach((rootNode) => {
            const rootLevelNodes = this.getNodesByLevel(rootNode.id, adjacency, maxLevel);
            rootLevelNodes.forEach((nodeId) => levelNodes.add(nodeId));
        });
        
        // 过滤节点
        const filteredNodes = nodes.filter(node => levelNodes.has(node.id));
        
        // 获取过滤后节点的ID集合
        const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
        
        // 过滤关系
        const filteredLinks = links.filter(link => 
            filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target)
        );

        // 返回过滤后的数据
        if (graphData.graph) {
            return {
                ...graphData,
                graph: {
                    nodes: filteredNodes,
                    links: filteredLinks
                }
            };
        }
        return {
            nodes: filteredNodes,
            links: filteredLinks
        };
    },

    
    getNodesByLevel(startId, adjacency, maxLevel) {
        const nodeIds = new Set([startId]);
        let currentLevel = [{id: startId}];
        let level = 0;
        
        while (level < maxLevel && currentLevel.length > 0) {
            const nextLevel = [];
            currentLevel.forEach(item => {
                const neighbors = adjacency.get(item.id);
                if (neighbors && neighbors.outgoing) {
                    neighbors.outgoing.forEach(targetId => {
                        if (!nodeIds.has(targetId)) {
                            nodeIds.add(targetId);
                            nextLevel.push({id: targetId});
                        }
                    });
                }
            });
            currentLevel = nextLevel;
            level++;
        }
        
        return nodeIds;
    },

    
    filterByCourse(graphData, courseId) {
        if (courseId === 'all') {
            return graphData;
        }

        const nodes = graphData.graph ? graphData.graph.nodes : graphData.nodes;
        const links = graphData.graph ? graphData.graph.links : graphData.links;
        
        // 构建邻接表
        const adjacency = this.buildAdjacency(links);
        
        // BFS获取相关节点（专业 -> 下游）
        const relatedNodeIds = this.getDownstreamNodes(courseId, adjacency);
        // 添加专业本身
        relatedNodeIds.add(courseId);
        
        // 过滤节点 - 保留专业及其下游全部节点
        const filteredNodes = nodes.filter(node =>
            relatedNodeIds.has(node.id)
        );
        
        // 获取过滤后节点的ID集合
        const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
        
        // 过滤关系 - 只保留两端都在过滤后节点中的关系
        const filteredLinks = links.filter(link => 
            filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target)
        );

        // 返回过滤后的数据
        if (graphData.graph) {
            return {
                ...graphData,
                graph: {
                    nodes: filteredNodes,
                    links: filteredLinks
                }
            };
        }
        return {
            nodes: filteredNodes,
            links: filteredLinks
        };
    },

    
    getDownstreamNodes(startId, adjacency) {
        const relatedIds = new Set();
        const queue = [startId];
        
        while (queue.length > 0) {
            const currentId = queue.shift();
            const neighbors = adjacency.get(currentId);
            if (neighbors && neighbors.outgoing) {
                neighbors.outgoing.forEach(targetId => {
                    if (!relatedIds.has(targetId)) {
                        relatedIds.add(targetId);
                        queue.push(targetId);
                    }
                });
            }
        }
        
        return relatedIds;
    },

    
    buildAdjacency(links) {
        const adjacency = new Map();
        
        links.forEach(link => {
            // 正向关系
            if (!adjacency.has(link.source)) {
                adjacency.set(link.source, { outgoing: [], incoming: [] });
            }
            adjacency.get(link.source).outgoing.push(link.target);
            
            // 反向关系
            if (!adjacency.has(link.target)) {
                adjacency.set(link.target, { outgoing: [], incoming: [] });
            }
            adjacency.get(link.target).incoming.push(link.source);
        });
        
        return adjacency;
    },

    
    getRelatedNodes(courseId, adjacency, nodes) {
        const relatedIds = new Set();
        relatedIds.add(courseId);
        
        // 获取下游节点（能力类型 -> 能力 -> 能力点）
        const queue = [courseId];
        while (queue.length > 0) {
            const currentId = queue.shift();
            const neighbors = adjacency.get(currentId);
            if (neighbors && neighbors.outgoing) {
                neighbors.outgoing.forEach(targetId => {
                    if (!relatedIds.has(targetId)) {
                        relatedIds.add(targetId);
                        queue.push(targetId);
                    }
                });
            }
        }
        
        // 获取上游节点（课程类别 -> 专业）
        const upstreamQueue = [courseId];
        while (upstreamQueue.length > 0) {
            const currentId = upstreamQueue.shift();
            const neighbors = adjacency.get(currentId);
            if (neighbors && neighbors.incoming) {
                neighbors.incoming.forEach(sourceId => {
                    if (!relatedIds.has(sourceId)) {
                        relatedIds.add(sourceId);
                        upstreamQueue.push(sourceId);
                    }
                });
            }
        }
        
        return relatedIds;
    },

    
    exportImage(chartInstance, filename = '能力图谱', transparent = false) {
        if (!chartInstance) {
            console.error('图表实例不存在');
            return;
        }

        try {
            const dataUrl = chartInstance.getDataURL({
                type: 'png',
                pixelRatio: 2,  // 高清导出
                backgroundColor: transparent ? 'transparent' : '#fff'
            });

            // 创建下载链接
            const link = document.createElement('a');
            link.download = `${filename}_${this.formatDate(new Date())}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('图片导出成功');
        } catch (error) {
            console.error('图片导出失败:', error);
            alert('图片导出失败，请稍后重试');
        }
    },

    
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${year}${month}${day}_${hour}${minute}`;
    },

    sanitizeFilename(name) {
        if (!name || typeof name !== 'string') {
            return '专业能力图谱系统';
        }
        const cleaned = name
            .replace(/[\\/:*?"<>|]/g, '_')
            .replace(/\s+/g, ' ')
            .trim();
        return cleaned || '专业能力图谱系统';
    },

    
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    
    throttle(func, limit = 100) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item));
        }
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    },

    
    toggleLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            if (show) {
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
            }
        }
    },

    
    updateStats(nodeCount, linkCount) {
        const statsNodes = document.getElementById('statsNodes');
        const statsLinks = document.getElementById('statsLinks');
        
        if (statsNodes) {
            statsNodes.textContent = `节点数: ${nodeCount}`;
        }
        if (statsLinks) {
            statsLinks.textContent = `关系数: ${linkCount}`;
        }
    },

    
    showNodeDetail(nodeData) {
        const modal = document.getElementById('nodeDetailModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalBody) return;

        // 设置标题
        modalTitle.textContent = nodeData.name || '节点信息';
        
        // 构建内容
        let html = '';
        
        // 节点类型
        if (nodeData.category) {
            html += `
                <div class="detail-item">
                    <span class="detail-label">类型</span>
                    <span class="detail-value">${nodeData.category}</span>
                </div>
            `;
        }
        
        // 节点属性
        if (nodeData.properties) {
            for (const [key, value] of Object.entries(nodeData.properties)) {
                if (key !== 'name') {
                    html += `
                        <div class="detail-item">
                            <span class="detail-label">${key}</span>
                            <span class="detail-value">${value}</span>
                        </div>
                    `;
                }
            }
        }
        
        // 节点ID
        html += `
            <div class="detail-item">
                <span class="detail-label">节点ID</span>
                <span class="detail-value">${nodeData.id}</span>
            </div>
        `;
        
        modalBody.innerHTML = html;
        
        // 显示弹窗
        modal.style.display = 'flex';
        modal.classList.add('active');
    },

    
    closeModal() {
        const modal = document.getElementById('nodeDetailModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 200);
        }
    }
};

// 全局关闭弹窗函数
function closeModal() {
    Utils.closeModal();
}

// 点击弹窗外部关闭
document.addEventListener('click', (e) => {
    const modal = document.getElementById('nodeDetailModal');
    if (modal && e.target === modal) {
        Utils.closeModal();
    }
});

const Graph = {
    // ECharts实例
    chart: null,
    
    // 图谱容器
    container: null,
    
    // 原始数据
    rawData: null,
    
    // 当前显示的数据
    currentData: null,

    // 当前缩放
    zoomScale: 1,
    zoomRaf: null,
    
    // 布局类型
    layoutType: 'force',  // 'force' | 'circular'
    firstRender: true,

    BASE_COLOR_ORDER: ['专业', '课程类别', '课程名称', '能力类型', '能力', '能力点'],

    getBaseColors() {
        return Config.getLevelColors();
    },

    labelMeasureContext: null,

    getMeasureContext() {
        if (this.labelMeasureContext) {
            return this.labelMeasureContext;
        }
        if (typeof document === 'undefined') {
            return null;
        }
        const canvas = document.createElement('canvas');
        this.labelMeasureContext = canvas.getContext('2d');
        return this.labelMeasureContext;
    },

    getLabelFont(fontSize, fontWeight = 'normal') {
        if (typeof document === 'undefined') {
            return `${fontWeight} ${fontSize}px sans-serif`;
        }
        const baseFont = document.body
            ? getComputedStyle(document.body).fontFamily
            : 'sans-serif';
        return `${fontWeight} ${fontSize}px ${baseFont}`;
    },

    getMaxCharsPerLine(text, labelWidth, fontSize, fontWeight = 'normal') {
        const fallback = Number.isFinite(labelWidth) && Number.isFinite(fontSize)
            ? Math.max(1, Math.floor(labelWidth / (fontSize * 0.9)))
            : 1;
        if (!text || !Number.isFinite(labelWidth) || !Number.isFinite(fontSize)) {
            return fallback;
        }
        const ctx = this.getMeasureContext();
        if (!ctx || typeof ctx.measureText !== 'function') {
            return fallback;
        }
        const safeWidth = Math.max(1, labelWidth - Math.ceil(fontSize * 0.1));
        ctx.font = this.getLabelFont(fontSize, fontWeight);
        let width = 0;
        let count = 0;
        for (const ch of Array.from(text)) {
            const nextWidth = width + ctx.measureText(ch).width;
            if (nextWidth > safeWidth) {
                break;
            }
            width = nextWidth;
            count += 1;
        }
        return Math.max(1, count || fallback);
    },

    getNodeDepth(node, nodeTypes) {
        const depthValue = Number(node.depth);
        if (Number.isFinite(depthValue)) {
            return depthValue;
        }
        if (Array.isArray(nodeTypes) && node.category) {
            const index = nodeTypes.indexOf(node.category);
            if (index >= 0) {
                return index;
            }
        }
        return 0;
    },

    
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('图谱容器不存在:', containerId);
            return;
        }

        // 创建ECharts实例
        this.chart = echarts.init(this.container, null, {
            renderer: 'canvas',
            useDirtyRect: true
        });

        // 监听窗口大小变化
        window.addEventListener('resize', Utils.debounce(() => {
            this.resize();
        }, 200));

        // 监听节点点击事件
        this.chart.on('click', (params) => {
            if (params.dataType === 'node') {
                Utils.showNodeDetail(params.data);
            }
        });

        this.chart.on('graphRoam', (params) => {
            this.updateZoomScale(this.getRoamZoom(params));
        });

        console.log('图谱初始化完成');
    },

    
    setData(data) {
        this.ensureNodeTypes(data);
        this.rawData = data;
        this.currentData = data;
    },

    ensureNodeTypes(data) {
        if (!data) return;
        const meta = data.meta ? { ...data.meta } : {};
        if (Array.isArray(meta.nodeTypes) && meta.nodeTypes.length) {
            data.meta = meta;
            return;
        }
        const graphData = data.graph || data;
        const nodes = Array.isArray(graphData.nodes) ? graphData.nodes : [];
        const seen = new Set();
        const ordered = [];
        nodes.forEach((node) => {
            if (!node || !node.category) return;
            if (!seen.has(node.category)) {
                seen.add(node.category);
                ordered.push(node.category);
            }
        });
        meta.nodeTypes = ordered.length ? ordered : [...this.BASE_COLOR_ORDER];
        data.meta = meta;
    },

    
    render(data = null) {
        if (data) {
            this.currentData = data;
        }

        if (!this.currentData || !this.chart) {
            console.error('数据或图表实例不存在');
            return;
        }

        const nodeTypes = this.currentData && this.currentData.meta
            ? this.currentData.meta.nodeTypes
            : [];
        const graphData = this.currentData.graph || this.currentData;
        const rawNodes = Array.isArray(graphData.nodes) ? graphData.nodes : [];
        const rawLinks = Array.isArray(graphData.links) ? graphData.links : [];
        const visibleNodes = rawNodes.filter((node) =>
            Config.isLevelVisible(this.getNodeDepth(node, nodeTypes))
        );
        const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
        const visibleLinks = rawLinks.filter((link) =>
            visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target)
        );
        const nodes = this.processNodes(visibleNodes, nodeTypes, this.zoomScale);
        const links = this.processLinks(visibleLinks);
        const categories = this.getCategories(nodeTypes);

        // 获取配置
        const echartsConfig = Config.getEChartsConfig();

        const option = {
            tooltip: {
                trigger: 'item',
                formatter: (params) => {
                    if (params.dataType === 'node') {
                        return this.formatNodeTooltip(params.data);
                    } else if (params.dataType === 'edge') {
                        return this.formatEdgeTooltip(params.data);
                    }
                    return '';
                },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e1e8ed',
                borderWidth: 1,
                padding: [12, 16],
                textStyle: {
                    color: '#2c3e50',
                    fontSize: 13
                },
                extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.12); border-radius: 8px;'
            },
            legend: {
                show: false  // 使用自定义图例
            },
            animationDuration: 1000,
            animationDurationUpdate: 600,
            animationEasingUpdate: 'quinticInOut',
            series: [{
                name: '能力图谱',
                type: 'graph',
                layout: this.layoutType,
                data: nodes,
                links: links,
                categories: categories,
                roam: true,
                draggable: true,
                force: {
                    ...echartsConfig.force,
                    layoutAnimation: echartsConfig.animation && !this.firstRender
                },
                progressive: 400,
                progressiveThreshold: 800,
                label: {
                    show: echartsConfig.label.show,
                    position: 'inside',
                    fontSize: 12,
                    color: '#333',
                    fontWeight: 'normal',
                    formatter: (params) => {
                        if (params && params.data && params.data.displayName) {
                            return params.data.displayName;
                        }
                        return params && params.name ? params.name : '';
                    }
                },
                labelLayout: {
                    hideOverlap: true
                },
                edgeLabel: {
                    show: echartsConfig.edgeLabel.show,
                    fontSize: 11,
                    color: '#555',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    padding: [2, 6],
                    borderRadius: 3,
                    formatter: (params) => params.data.name || ''
                },
                lineStyle: {
                    color: 'source',
                    width: echartsConfig.lineStyle.width,
                    opacity: echartsConfig.lineStyle.opacity,
                    curveness: echartsConfig.lineStyle.curveness
                },
                emphasis: {
                    focus: 'adjacency',
                    itemStyle: {
                        shadowBlur: 35,
                        shadowColor: 'rgba(0,0,0,0.3)'
                    },
                    lineStyle: {
                        width: echartsConfig.lineStyle.width + 2,
                        opacity: 1
                    },
                    label: {
                        show: false
                    }
                },
                blur: {
                    itemStyle: {
                        opacity: 0.2
                    },
                    lineStyle: {
                        opacity: 0.05
                    }
                },
                scaleLimit: {
                    min: 0.3,
                    max: 3
                },
                animation: echartsConfig.animation
            }]
        };

        // 设置选项
        this.chart.setOption(option, true);
        this.firstRender = false;

        // 更新统计信息
        Utils.updateStats(nodes.length, links.length);

        console.log(`图谱渲染完成: ${nodes.length}节点, ${links.length}关系`);
    },

    
    processNodes(nodes, nodeTypes = [], zoomScale = 1) {
        const baseColors = this.getBaseColors();
        return nodes.map(node => {
            const category = node.category;
            const depth = this.getNodeDepth(node, nodeTypes);
            const size = Config.getLevelSize(depth);
            const normalizedZoom = Number.isFinite(zoomScale) && zoomScale > 0 ? zoomScale : 1;
            const color = baseColors.length
                ? baseColors[depth % baseColors.length]
                : '#999999';
            const name = node.name ? String(node.name) : '';
            const baseFontSize = Math.max(10, Math.min(Math.floor(size / 4.5), 48));
            const fontSize = baseFontSize;
            const fontWeight = 'normal';
            const lineHeight = Math.ceil(fontSize * 1.3);
            const labelWidth = Math.max(12, Math.floor(size * 0.7));
            const baseLineHeight = Math.ceil(baseFontSize * 1.3);
            const baseMaxLines = Math.max(1, Math.floor((size * 0.8) / baseLineHeight));
            const maxLines = Math.max(baseMaxLines, Math.floor(baseMaxLines * normalizedZoom));
            let displayName = name;
            let lineCount = 1;
            let offsetY = 0;
            if (name && !name.includes('\n')) {
                const chars = Array.from(name);
                const length = chars.length;
                const maxCharsPerLine = this.getMaxCharsPerLine(name, labelWidth, fontSize, fontWeight);
                const hasWhitespace = /\s/.test(name);
                const hasCjk = /[\u4e00-\u9fff]/.test(name);
                const hasLatin = /[A-Za-z]/.test(name);
                const avoidWordBreak = !hasWhitespace && hasLatin && !hasCjk;
                const safeLabelWidth = Math.max(12, labelWidth - Math.ceil(fontSize * 0.1));
                const fitsLabelWidth = (text) => {
                    if (!text) return true;
                    const ctx = this.getMeasureContext();
                    if (ctx && typeof ctx.measureText === 'function') {
                        ctx.font = this.getLabelFont(fontSize, fontWeight);
                        return ctx.measureText(text).width <= safeLabelWidth;
                    }
                    return text.length <= maxCharsPerLine;
                };
                const finalizeLines = (lines) => {
                    if (!Array.isArray(lines) || lines.length === 0) return [];
                    if (!Number.isFinite(maxLines) || maxLines <= 0) return [];

                    const needsEllipsis = lines.length > maxLines;
                    let trimmed = lines.slice(0, maxLines).map((line) => line.replace(/…/g, ''));
                    const totalLen = trimmed.reduce((sum, line) => sum + line.length, 0);

                    if (totalLen >= 4 && maxCharsPerLine >= 2) {
                        for (let i = 0; i < trimmed.length; i += 1) {
                            if (trimmed[i].length !== 1) continue;
                            if (i > 0 && trimmed[i - 1].length > 2) {
                                const prev = trimmed[i - 1];
                                trimmed[i - 1] = prev.slice(0, -1);
                                trimmed[i] = `${prev.slice(-1)}${trimmed[i]}`;
                                continue;
                            }
                            if (i < trimmed.length - 1 && trimmed[i + 1].length > 2) {
                                const next = trimmed[i + 1];
                                trimmed[i + 1] = next.slice(1);
                                trimmed[i] = `${trimmed[i]}${next.slice(0, 1)}`;
                            }
                        }
                    }

                    const hasSingleCharLine = trimmed.some((line) => line.length === 1);
                    if (hasSingleCharLine && maxCharsPerLine > 1) {
                        const targetLines = Math.max(1, Math.min(maxLines - 1, trimmed.length - 1));
                        if (targetLines >= 1) {
                            const rebuilt = [];
                            for (let i = 0; i < chars.length; i += maxCharsPerLine) {
                                rebuilt.push(chars.slice(i, i + maxCharsPerLine).join(''));
                            }
                            trimmed = rebuilt.slice(0, targetLines);
                            const shouldEllipsize = rebuilt.length > targetLines;
                            if (shouldEllipsize) {
                                const lastIndex = trimmed.length - 1;
                                const last = trimmed[lastIndex] || '';
                                const safeBase = last.length >= maxCharsPerLine
                                    ? last.slice(0, Math.max(1, maxCharsPerLine - 1))
                                    : last;
                                trimmed[lastIndex] = `${safeBase}…`;
                            }
                        }
                    }

                    if (needsEllipsis) {
                        const lastIndex = trimmed.length - 1;
                        const maxLen = Math.max(1, maxCharsPerLine);
                        if (maxLen <= 1) {
                            trimmed[lastIndex] = '…';
                        } else {
                            const last = trimmed[lastIndex] || '';
                            const safeBase = last.length >= maxLen
                                ? last.slice(0, Math.max(1, maxLen - 1))
                                : last;
                            trimmed[lastIndex] = `${safeBase}…`;
                        }
                    }

                    return trimmed;
                };
                const finalizeWordLines = (lines) => {
                    if (!Array.isArray(lines) || lines.length === 0) return [];
                    if (!Number.isFinite(maxLines) || maxLines <= 0) return [];
                    if (lines.length <= maxLines) return lines;
                    const trimmed = lines.slice(0, maxLines);
                    const lastIndex = trimmed.length - 1;
                    let last = trimmed[lastIndex] || '';
                    const ellipsis = '…';
                    const applyEllipsis = (value) =>
                        value.endsWith(ellipsis) ? value : `${value}${ellipsis}`;
                    let candidate = applyEllipsis(last);
                    if (!fitsLabelWidth(candidate)) {
                        const words = last.split(/\s+/).filter(Boolean);
                        while (words.length > 1) {
                            words.pop();
                            candidate = applyEllipsis(words.join(' '));
                            if (fitsLabelWidth(candidate)) {
                                break;
                            }
                        }
                    }
                    trimmed[lastIndex] = candidate;
                    return trimmed;
                };
                const buildLinesByLengths = (lengths) => {
                    let start = 0;
                    return lengths.map((len) => {
                        const line = chars.slice(start, start + len).join('');
                        start += len;
                        return line;
                    }).filter((line) => line);
                };
                const buildChunkLines = (chunkSize) => {
                    const lines = [];
                    for (let i = 0; i < chars.length; i += chunkSize) {
                        lines.push(chars.slice(i, i + chunkSize).join(''));
                    }
                    return lines;
                };
                const wordLines = (() => {
                    if (!hasWhitespace) return [];
                    const words = name.trim().split(/\s+/).filter(Boolean);
                    if (words.length < 2) return [];
                    const lines = [];
                    let current = '';
                    words.forEach((word) => {
                        const candidate = current ? `${current} ${word}` : word;
                        if (fitsLabelWidth(candidate)) {
                            current = candidate;
                            return;
                        }
                        if (current) {
                            lines.push(current);
                            current = word;
                            return;
                        }
                        lines.push(word);
                    });
                    if (current) {
                        lines.push(current);
                    }
                    return lines;
                })();
                const mixedLines = (() => {
                    if (hasWhitespace || !hasLatin || !hasCjk) return [];
                    const tokens = [];
                    let buffer = '';
                    let bufferType = '';
                    const flushBuffer = () => {
                        if (!buffer) return;
                        tokens.push(buffer);
                        buffer = '';
                        bufferType = '';
                    };
                    chars.forEach((ch) => {
                        if (/[A-Za-z0-9]/.test(ch)) {
                            if (bufferType === 'latin') {
                                buffer += ch;
                            } else {
                                flushBuffer();
                                buffer = ch;
                                bufferType = 'latin';
                            }
                            return;
                        }
                        if (/[\u4e00-\u9fff]/.test(ch)) {
                            flushBuffer();
                            tokens.push(ch);
                            return;
                        }
                        if (/\s/.test(ch)) {
                            flushBuffer();
                            tokens.push(' ');
                            return;
                        }
                        flushBuffer();
                        tokens.push(ch);
                    });
                    flushBuffer();

                    const lines = [];
                    let current = '';
                    tokens.forEach((token) => {
                        if (token === ' ') {
                            if (current && !current.endsWith(' ')) {
                                current += ' ';
                            }
                            return;
                        }
                        const candidate = current ? `${current}${token}` : token;
                        if (current && !fitsLabelWidth(candidate)) {
                            lines.push(current);
                            current = token;
                            return;
                        }
                        if (!current && !fitsLabelWidth(candidate)) {
                            current = candidate;
                            return;
                        }
                        current = candidate;
                    });
                    if (current) {
                        lines.push(current);
                    }
                    return lines;
                })();
                if (!avoidWordBreak && wordLines.length) {
                    const finalLines = finalizeWordLines(wordLines);
                    if (finalLines.length) {
                        displayName = finalLines.join('\n');
                        lineCount = finalLines.length;
                    }
                } else if (!avoidWordBreak && mixedLines.length) {
                    const finalLines = finalizeWordLines(mixedLines);
                    if (finalLines.length) {
                        displayName = finalLines.join('\n');
                        lineCount = finalLines.length;
                    }
                } else if (!avoidWordBreak) {
                    let lines = [];
                    if (maxLines >= 2 && (length === 4 || length === 5)) {
                        const maxLen = length === 4 ? 2 : 3;
                        if (maxCharsPerLine >= maxLen) {
                            lines = buildLinesByLengths([2, length - 2]);
                        }
                    }
                    if (maxLines >= 2 && length === 7 && lines.length === 0) {
                        if (maxCharsPerLine >= 4) {
                            lines = buildLinesByLengths([3, 4]);
                        }
                    }
                    if (maxLines >= 2 && lines.length === 0 && maxCharsPerLine > 0 && length > maxCharsPerLine) {
                        const estimatedLines = Math.ceil(length / maxCharsPerLine);
                        if (estimatedLines === 2) {
                            const lower = Math.ceil(length / 2);
                            const upper = length - lower;
                            const maxLen = Math.max(lower, upper);
                            if (maxCharsPerLine >= maxLen) {
                                lines = buildLinesByLengths([upper, lower]);
                            } else {
                                lines = buildChunkLines(maxCharsPerLine);
                            }
                        } else if (estimatedLines === 3 && maxLines >= 3) {
                            const base = Math.floor(length / 3);
                            const remainder = length % 3;
                            const middle = base + remainder;
                            const left = base;
                            const right = base;
                            const maxLen = Math.max(left, middle, right);
                            if (maxCharsPerLine >= maxLen) {
                                lines = buildLinesByLengths([left, middle, right]);
                            } else {
                                lines = buildChunkLines(maxCharsPerLine);
                            }
                        } else {
                            lines = buildChunkLines(maxCharsPerLine);
                        }
                    }
                    if (lines.length) {
                        const finalLines = finalizeLines(lines);
                        if (finalLines.length) {
                            displayName = finalLines.join('\n');
                            lineCount = finalLines.length;
                        }
                    }
                }
            } else if (name.includes('\n')) {
                lineCount = name.split('\n').length;
            }
            if (lineCount > 1) {
                offsetY = -Math.round(lineHeight * 0.15);
            }

            const hasWhitespace = /\s/.test(name);
            const hasCjk = /[\u4e00-\u9fff]/.test(name);
            const hasLatin = /[A-Za-z]/.test(name);
            const avoidWordBreak = !hasWhitespace && hasLatin && !hasCjk;
            const labelLineClamp = avoidWordBreak ? 1 : maxLines;
            const labelOverflow = hasLatin ? 'none' : 'break';

            return {
                id: node.id,
                name,
                category: category,
                displayName,
                symbolSize: size,
                itemStyle: {
                    color: this.lightenColor(color, 20),
                    borderColor: this.lightenColor(color, 10),
                    borderWidth: 2,
                    shadowBlur: 14,
                    shadowColor: this.hexToRgba(color, 0.45),
                    shadowOffsetX: 0,
                    shadowOffsetY: 0
                },
                label: {
                    show: Config.current.display.showLabels,
                    position: 'inside',
                    color: '#333',
                    fontSize,
                    lineHeight,
                    width: labelWidth,
                    height: lineHeight * labelLineClamp,
                    overflow: labelOverflow,
                    lineOverflow: 'truncate',
                    lineClamp: labelLineClamp,
                    fontWeight,
                    offset: [0, offsetY]
                },
                properties: node.properties || {}
            };
        });
    },

    
    processLinks(links) {
        return links.map(link => ({
            source: link.source,
            target: link.target,
            name: link.name,
            lineStyle: {
                color: '#666',
                type: 'solid'
            },
            emphasis: {
                lineStyle: {
                    color: '#333'
                }
            }
        }));
    },

    
    getCategories(nodeTypes = []) {
        if (!Array.isArray(nodeTypes) || nodeTypes.length === 0) {
            return [];
        }
        const baseColors = this.getBaseColors();
        return nodeTypes.map((name, index) => ({
            name,
            itemStyle: {
                color: baseColors.length
                    ? baseColors[index % baseColors.length]
                    : '#999999'
            }
        }));
    },

    
    formatNodeTooltip(node) {
        let html = `<div style="font-weight: 600; margin-bottom: 8px; font-size: 14px;">${node.name}</div>`;
        html += `<div style="color: #7f8c8d; font-size: 12px;">类型: ${node.category}</div>`;
        
        if (node.properties) {
            for (const [key, value] of Object.entries(node.properties)) {
                if (key !== 'name' && value) {
                    html += `<div style="color: #7f8c8d; font-size: 12px; margin-top: 4px;">${key}: ${value}</div>`;
                }
            }
        }
        
        return html;
    },

    
    formatEdgeTooltip(edge) {
        return `<div style="font-size: 12px;">关系: ${edge.name || '关联'}</div>`;
    },

    
    toggleLayout() {
        this.layoutType = this.layoutType === 'force' ? 'circular' : 'force';
        this.render();
        console.log('布局切换为:', this.layoutType);
    },

    
    resize() {
        if (this.chart) {
            this.chart.resize();
        }
    },

    
    refresh() {
        this.render();
    },

    getRoamZoom(params) {
        if (params && typeof params.zoom === 'number' && params.zoom > 0) {
            return this.zoomScale * params.zoom;
        }
        if (this.chart) {
            const option = this.chart.getOption();
            const series = option && option.series && option.series[0] ? option.series[0] : null;
            if (series && Number.isFinite(series.zoom) && series.zoom > 0) {
                return series.zoom;
            }
        }
        return this.zoomScale || 1;
    },

    updateZoomScale(nextZoom) {
        if (!Number.isFinite(nextZoom) || nextZoom <= 0) {
            return;
        }
        const clamped = Math.max(0.3, Math.min(nextZoom, 3));
        if (Math.abs(clamped - this.zoomScale) < 0.01) {
            return;
        }
        this.zoomScale = clamped;
        this.scheduleLabelUpdate();
    },

    scheduleLabelUpdate() {
        if (this.zoomRaf) {
            return;
        }
        this.zoomRaf = requestAnimationFrame(() => {
            this.zoomRaf = null;
            this.updateLabelLayout();
        });
    },

    updateLabelLayout() {
        if (!this.chart || !this.currentData) {
            return;
        }
        const nodeTypes = this.currentData && this.currentData.meta
            ? this.currentData.meta.nodeTypes
            : [];
        const graphData = this.currentData.graph || this.currentData;
        const rawNodes = Array.isArray(graphData.nodes) ? graphData.nodes : [];
        const rawLinks = Array.isArray(graphData.links) ? graphData.links : [];
        const visibleNodes = rawNodes.filter((node) =>
            Config.isLevelVisible(this.getNodeDepth(node, nodeTypes))
        );
        const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
        const visibleLinks = rawLinks.filter((link) =>
            visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target)
        );
        const nodes = this.processNodes(visibleNodes, nodeTypes, this.zoomScale);
        const links = this.processLinks(visibleLinks);

        this.chart.setOption(
            {
                series: [{
                    data: nodes,
                    links
                }]
            },
            false
        );
    },

    
    filterByCourse(courseId) {
        if (!this.rawData) {
            console.error('原始数据不存在');
            return;
        }

        Utils.toggleLoading(true);

        setTimeout(() => {
            const filteredData = Utils.filterByCourse(this.rawData, courseId);
            this.render(filteredData);
            Utils.toggleLoading(false);
        }, 100);
    },

    
    getChartInstance() {
        return this.chart;
    },

    
    destroy() {
        if (this.chart) {
            this.chart.dispose();
            this.chart = null;
        }
    },

    
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    },

    
    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    },

    
    hexToRgba(hex, alpha) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return hex;
    },

    
    highlightNode(nodeId) {
        if (this.chart) {
            this.chart.dispatchAction({
                type: 'highlight',
                seriesIndex: 0,
                dataIndex: this.getNodeIndex(nodeId)
            });
        }
    },

    
    downplay() {
        if (this.chart) {
            this.chart.dispatchAction({
                type: 'downplay',
                seriesIndex: 0
            });
        }
    },

    
    getNodeIndex(nodeId) {
        const graphData = this.currentData.graph || this.currentData;
        return graphData.nodes.findIndex(node => node.id === nodeId);
    },

    
    focusNode(nodeId) {
        const graphData = this.currentData.graph || this.currentData;
        const node = graphData.nodes.find(n => n.id === nodeId);
        
        if (node && this.chart) {
            // 这里可以添加聚焦动画逻辑
            this.highlightNode(nodeId);
        }
    }
};

const App = {
    // 应用状态
    state: {
        dataLoaded: false,
        currentCourse: 'all',
        currentLevel: 3,
        currentTitle: '专业能力图谱系统',
        panelOpen: false,
        opsOpen: false,
        opsAuthorized: false,
        dataSourceType: 'json',
        excelRows: []
    },
    meta: {
        nodeTypes: []
    },

    
    async init() {
        console.log('应用初始化开始...');
        
        try {
            // 初始化配置
            Config.init();
            if (typeof window !== 'undefined') {
                window.graphApp = this;
                window.updateLevelSize = (levelIndex, value) => {
                    this.updateLevelSize(levelIndex, value);
                };
                window.updateLevelVisibility = (levelIndex, isVisible) => {
                    this.updateLevelVisibility(levelIndex, isVisible);
                };
                window.updateLevelColor = (levelIndex, color) => {
                    this.updateLevelColor(levelIndex, color);
                };
            }
            
            // 初始化图谱
            Graph.init('graphChart');
            
            // 绑定事件
            this.bindEvents();
            
            // 应用当前主题
            this.initTheme();
            
            // 加载数据
            await this.loadData();
            
            console.log('应用初始化完成');
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showError('应用初始化失败，请刷新页面重试');
        }
    },

    
    initTheme() {
        const currentTheme = Config.current.theme || 'classic';
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = currentTheme;
        }
        Config.applyTheme(currentTheme);
        this.dispatchMetaUpdate();
    },

    
    async loadData(useRemote = false) {
        Utils.toggleLoading(true);
        
        try {
            const data = await Utils.loadData(useRemote);
            this.state.dataSourceType = 'json';
            this.state.excelRows = [];
            this.applyGraphData(data);
            Utils.toggleLoading(false);
            
        } catch (error) {
            Utils.toggleLoading(false);
            this.showError('数据加载失败: ' + error.message);
            throw error;
        }
    },

    dispatchMetaUpdate() {
        if (typeof window === 'undefined') {
            return;
        }
        window.graphApp = this;
        const detail = {
            nodeTypes: Array.isArray(this.meta.nodeTypes) ? this.meta.nodeTypes : [],
            levelSettings: Config.getLevelSettings(),
            rootType: this.getRootType(),
            rootOptions: this.getRootOptions(),
            levelColors: this.getLevelColors()
        };
        window.dispatchEvent(new CustomEvent('graphApp:meta', { detail }));
    },

    getNodeTypes() {
        return Array.isArray(this.meta.nodeTypes) ? this.meta.nodeTypes : [];
    },

    getRootType() {
        const nodeTypes = this.getNodeTypes();
        return nodeTypes.length ? nodeTypes[0] : '专业';
    },

    getRootOptions() {
        const rootType = this.getRootType();
        const data = Graph.rawData || Graph.currentData;
        if (!data) return [];
        const graphData = data.graph || data;
        const nodes = Array.isArray(graphData.nodes) ? graphData.nodes : [];
        return nodes
            .filter((node) => node && node.category === rootType)
            .map((node) => ({
                id: node.id,
                name: node.name ? String(node.name).replace(/ /g, '') : ''
            }));
    },

    getLevelSettings() {
        return Config.getLevelSettings();
    },

    getLevelColors() {
        return Config.getLevelColors();
    },

    getLevelSize(levelIndex) {
        return Config.getLevelSize(levelIndex);
    },

    isLevelVisible(levelIndex) {
        return Config.isLevelVisible(levelIndex);
    },

    updateLevelSize(levelIndex, value) {
        Config.updateLevelSize(levelIndex, value);
        Graph.refresh();
        this.dispatchMetaUpdate();
    },

    updateLevelVisibility(levelIndex, isVisible) {
        Config.updateLevelVisibility(levelIndex, isVisible);
        Graph.refresh();
        this.dispatchMetaUpdate();
    },

    updateLevelColor(levelIndex, color) {
        Config.setBaseColor(levelIndex, color);
        Graph.refresh();
        this.dispatchMetaUpdate();
    },

    applyGraphData(graphData) {
        Graph.setData(graphData);
        const title = graphData && graphData.meta && graphData.meta.title
            ? String(graphData.meta.title).trim()
            : '';
        this.updateTitle(title);

        const meta = graphData && graphData.meta ? graphData.meta : { nodeTypes: [] };
        const nodeTypes = Array.isArray(meta.nodeTypes) ? meta.nodeTypes : [];
        Config.ensureLevelSettings(nodeTypes.length);
        this.meta = meta;
        this.dispatchMetaUpdate();

        this.populateCourseSelector(graphData);
        this.state.currentCourse = 'all';

        const levelSelect = document.getElementById('levelSelect');
        if (levelSelect) {
            levelSelect.disabled = false;
            this.state.currentLevel = Config.current.display.defaultLevel || 3;
            levelSelect.value = this.state.currentLevel;
        }

        const filteredData = Utils.filterByLevel(graphData, this.state.currentLevel);
        Graph.render(filteredData);

        this.state.dataLoaded = true;
    },

    updateTitle(title) {
        const normalizedTitle = title || '专业能力图谱系统';
        this.state.currentTitle = normalizedTitle;
        const titleEl = document.getElementById('graphTitle');
        if (titleEl) {
            titleEl.textContent = normalizedTitle;
        }
        document.title = normalizedTitle;
    },

    
    populateCourseSelector(data) {
        const select = document.getElementById('courseSelect');
        if (!select) return;

        const firstOption = select.querySelector('option[value="all"]');
        if (firstOption) {
            firstOption.textContent = `全部${this.getRootType()}`;
        }
        select.value = 'all';
    },

    
    bindEvents() {
        // 专业选择器
        const courseSelect = document.getElementById('courseSelect');
        if (courseSelect) {
            courseSelect.addEventListener('change', (e) => {
                this.onCourseChange(e.target.value);
            });
        }

        // 层级选择器
        const levelSelect = document.getElementById('levelSelect');
        if (levelSelect) {
            levelSelect.addEventListener('change', (e) => {
                this.onLevelChange(parseInt(e.target.value));
            });
        }

        // 主题选择器
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.onThemeChange(e.target.value);
            });
        }

        // 切换布局按钮
        const btnSwitchLayout = document.getElementById('btnSwitchLayout');
        if (btnSwitchLayout) {
            btnSwitchLayout.addEventListener('click', () => {
                Graph.toggleLayout();
            });
        }

        // 导出按钮
        const btnExport = document.getElementById('btnExport');
        if (btnExport) {
            btnExport.addEventListener('click', () => {
                this.exportGraph();
            });
        }

        const btnImportExcel = document.getElementById('btnImportExcel');
        const btnExportExcel = document.getElementById('btnExportExcel');
        const btnTemplateExcel = document.getElementById('btnTemplateExcel');
        const btnRestoreBackup = document.getElementById('btnRestoreBackup');
        const excelFileInput = document.getElementById('excelFileInput');
        if (btnImportExcel && excelFileInput) {
            btnImportExcel.addEventListener('click', () => {
                excelFileInput.click();
            });
            excelFileInput.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                    this.importFile(file);
                }
                e.target.value = '';
            });
        }
        if (btnExportExcel) {
            btnExportExcel.addEventListener('click', () => {
                this.exportExcel();
            });
        }
        if (btnTemplateExcel) {
            btnTemplateExcel.addEventListener('click', () => {
                this.exportTemplateExcel();
            });
        }
        if (btnRestoreBackup) {
            btnRestoreBackup.addEventListener('click', () => {
                this.restoreBackup();
            });
        }
        const btnOpsMenu = document.getElementById('btnOpsMenu');
        const opsPanel = document.getElementById('opsPanel');
        if (btnOpsMenu && opsPanel) {
            btnOpsMenu.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.toggleOpsPanel();
            });
            opsPanel.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            document.addEventListener('click', (e) => {
                if (!this.state.opsOpen) return;
                if (!opsPanel.contains(e.target) && !btnOpsMenu.contains(e.target)) {
                    this.setOpsPanel(false);
                }
            });
        }

        // 设置面板切换
        const btnTogglePanel = document.getElementById('btnTogglePanel');
        if (btnTogglePanel) {
            btnTogglePanel.addEventListener('click', () => {
                this.toggleConfigPanel();
            });
        }

        // 关闭面板
        const btnClosePanel = document.getElementById('btnClosePanel');
        if (btnClosePanel) {
            btnClosePanel.addEventListener('click', () => {
                this.toggleConfigPanel(false);
            });
        }

        const modalClose = document.querySelector('#nodeDetailModal .btn-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                Utils.closeModal();
            });
        }

        // 数据源切换
        const dataSourceRadios = document.querySelectorAll('input[name="dataSource"]');
        dataSourceRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.onDataSourceChange(e.target.value);
            });
        });

        // 加载远程数据
        const btnLoadRemote = document.getElementById('btnLoadRemote');
        if (btnLoadRemote) {
            btnLoadRemote.addEventListener('click', () => {
                this.loadRemoteData();
            });
        }

        // 应用设置
        const btnApply = document.getElementById('btnApply');
        if (btnApply) {
            btnApply.addEventListener('click', () => {
                this.applySettings();
            });
        }

        // 重置设置
        const btnReset = document.getElementById('btnReset');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                this.resetSettings();
            });
        }

        // 滑块实时更新显示
        this.bindSliderEvents();

        // 复选框实时更新
        this.bindCheckboxEvents();

        // 颜色选择器实时预览
        this.bindColorEvents();
    },

    
    bindSliderEvents() {
        const sliders = [
            'lineWidth', 'lineOpacity', 'repulsion', 'edgeLength', 'gravity'
        ];

        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    Config.updateSliderDisplay(sliderId, e.target.value);
                });
            }
        });
    },

    
    bindCheckboxEvents() {
        const checkboxes = ['showLabels', 'showEdgeLabels', 'enableAnimation'];
        
        checkboxes.forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    // 可选：实时预览
                });
            }
        });
    },

    
    bindColorEvents() {
        const colorInputs = [
            'colorMajor', 'colorCategory', 'colorCourse',
            'colorType', 'colorAbility', 'colorPoint'
        ];

        colorInputs.forEach(colorId => {
            const colorInput = document.getElementById(colorId);
            if (colorInput) {
                colorInput.addEventListener('input', (e) => {
                    // 实时更新CSS变量预览
                    const category = this.getColorCategory(colorId);
                    if (category) {
                        document.documentElement.style.setProperty(
                            `--color-${category}`, 
                            e.target.value
                        );
                    }
                });
            }
        });
    },

    
    getColorCategory(colorId) {
        const map = {
            'colorMajor': 'major',
            'colorCategory': 'category',
            'colorCourse': 'course',
            'colorType': 'type',
            'colorAbility': 'ability',
            'colorPoint': 'point'
        };
        return map[colorId];
    },

    
    onCourseChange(courseId) {
        const rootType = this.getRootType();
        this.state.currentCourse = courseId;
        const levelSelect = document.getElementById('levelSelect');
        
        if (courseId === 'all') {
            // 全部根节点类型时，启用层级选择，按层级过滤
            if (levelSelect) {
                levelSelect.disabled = false;
            }
            this.applyLevelFilter();
        } else {
            // 选择具体根节点时，禁用层级选择，按根节点过滤
            if (levelSelect) {
                levelSelect.disabled = true;
            }
            Graph.filterByCourse(courseId);
        }
        console.log(`切换到${rootType}:`, courseId);
    },

    
    onLevelChange(level) {
        this.state.currentLevel = level;
        // 只有在"全部根节点"模式下才应用层级过滤
        if (this.state.currentCourse === 'all') {
            this.applyLevelFilter();
        }
        console.log('切换到层级:', level);
    },

    
    applyLevelFilter() {
        if (!Graph.rawData) return;
        
        Utils.toggleLoading(true);
        setTimeout(() => {
            let filteredData;
            if (this.state.currentLevel === 0) {
                // 0表示显示全部
                filteredData = Graph.rawData;
            } else {
                filteredData = Utils.filterByLevel(Graph.rawData, this.state.currentLevel);
            }
            Graph.render(filteredData);
            Utils.toggleLoading(false);
        }, 100);
    },

    
    onThemeChange(themeName) {
        Config.applyTheme(themeName);
        Config.save();
        Graph.refresh();
        this.dispatchMetaUpdate();
        console.log('切换到主题:', themeName);
    },

    
    onDataSourceChange(source) {
        const remoteUrlGroup = document.getElementById('remoteUrlGroup');
        if (remoteUrlGroup) {
            remoteUrlGroup.style.display = source === 'remote' ? 'block' : 'none';
        }
    },

    
    async loadRemoteData() {
        const urlInput = document.getElementById('remoteUrl');
        if (!urlInput || !urlInput.value.trim()) {
            alert('请输入有效的JSON URL');
            return;
        }

        const url = urlInput.value.trim();
        Utils.setRemoteUrl(url);
        
        try {
            await this.loadData(true);
            alert('远程数据加载成功');
        } catch (error) {
            alert('远程数据加载失败: ' + error.message);
        }
    },

    
    applySettings() {
        // 从DOM读取配置
        Config.readFromDOM();
        
        // 保存配置
        Config.save();
        
        // 刷新图谱
        Graph.refresh();
        
        console.log('设置已应用');
    },

    
    resetSettings() {
        if (confirm('确定要重置所有设置为默认值吗？')) {
            Config.reset();
            Config.ensureLevelSettings(this.getNodeTypes().length);
            Graph.refresh();
            this.dispatchMetaUpdate();
            console.log('设置已重置');
        }
    },

    
    toggleConfigPanel(show = null) {
        const panel = document.getElementById('configPanel');
        if (!panel) return;

        if (show === null) {
            this.state.panelOpen = !this.state.panelOpen;
        } else {
            this.state.panelOpen = show;
        }

        if (this.state.panelOpen) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    },

    
    exportGraph() {
        const chartInstance = Graph.getChartInstance();
        if (chartInstance) {
            const rootType = this.getRootType();
            const courseName = this.state.currentCourse === 'all'
                ? `全部${rootType}`
                : `${rootType}图谱`;
            const title = this.state.currentTitle || '专业能力图谱系统';
            Utils.exportImage(chartInstance, `${title}_${courseName}`);
        } else {
            alert('图表尚未加载完成');
        }
    },

    async toggleOpsPanel() {
        if (this.state.opsOpen) {
            this.setOpsPanel(false);
            return;
        }

        const access = await this.ensureOpsAccess();
        if (access) {
            this.setOpsPanel(true);
        }
    },

    setOpsPanel(open) {
        const panel = document.getElementById('opsPanel');
        if (!panel) return;
        this.state.opsOpen = open;
        if (open) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    },

    async ensureOpsAccess() {
        if (this.state.opsAuthorized) {
            return true;
        }
        const password = await Utils.getOpsPassword();
        if (!password) {
            alert('运维密码未配置');
            return false;
        }
        const input = prompt('请输入运维密码');
        if (input === null) {
            return false;
        }
        if (input !== password) {
            alert('密码错误');
            return false;
        }
        this.state.opsAuthorized = true;
        return true;
    },

    async importFile(file) {
        if (!file) return;
        const fileName = (file.name || '').trim().toLowerCase();
        const isJsonName = fileName.endsWith('.json');
        const isJsonType = file.type ? file.type.includes('json') : false;
        const isExcelName = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
        const excelTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        const isExcelType = file.type ? excelTypes.includes(file.type) : false;

        if (isJsonName || isJsonType) {
            await this.importJson(file);
            return;
        }
        if (isExcelName || isExcelType) {
            await this.importExcel(file);
            return;
        }

        alert('请上传 .xlsx、.xls 或 .json 文件');
    },

    async importExcel(file) {
        if (!file) return;
        const fileName = (file.name || '').trim().toLowerCase();
        const isExcelName = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
        const excelTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        const isExcelType = file.type ? excelTypes.includes(file.type) : false;
        if (!isExcelName && !isExcelType) {
            alert('请上传 .xlsx 或 .xls 文件');
            return;
        }

        const currentData = Graph.rawData || Graph.currentData;
        if (currentData) {
            Utils.saveBackup(currentData);
        }

        Utils.toggleLoading(true);
        try {
            const { graphData, normalizedRows, invalidRows } = await Utils.parseExcelFile(file);
            this.applyGraphData(graphData);
            this.state.dataSourceType = 'excel';
            this.state.excelRows = normalizedRows || [];
            try {
                await Utils.saveGraphToServer(graphData);
            } catch (saveError) {
                console.warn('服务端保存失败:', saveError);
                alert('导入完成，但服务端保存失败，请检查服务是否可用');
            }
            Utils.toggleLoading(false);

            if (invalidRows > 0) {
                const message = `导入完成，已跳过 ${invalidRows} 行（节点信息不完整）。`;
                console.warn(message);
                alert(message);
            }
        } catch (error) {
            Utils.toggleLoading(false);
            this.showError(`导入失败: ${error.message || error}`);
        }
    },

    async importJson(file) {
        if (!file) return;
        const currentData = Graph.rawData || Graph.currentData;
        if (currentData) {
            Utils.saveBackup(currentData);
        }

        Utils.toggleLoading(true);
        try {
            const raw = await file.text();
            const data = JSON.parse(raw);
            const graphData = this.normalizeImportedJson(data);
            if (!graphData) {
                throw new Error('JSON 格式不正确：需要包含 nodes/links 或 nodes/edges');
            }
            this.applyGraphData(graphData);
            this.state.dataSourceType = 'json';
            this.state.excelRows = [];
            try {
                await Utils.saveGraphToServer(graphData);
            } catch (saveError) {
                console.warn('服务端保存失败:', saveError);
                alert('导入完成，但服务端保存失败，请检查服务是否可用');
            }
            Utils.toggleLoading(false);
        } catch (error) {
            Utils.toggleLoading(false);
            this.showError(`导入失败: ${error.message || error}`);
        }
    },

    normalizeImportedJson(data) {
        if (!data || typeof data !== 'object') {
            return null;
        }
        const normalizeNodes = (nodes) => nodes.map((node) => {
            if (!node || typeof node !== 'object') {
                return node;
            }
            const name = node.name !== undefined ? node.name : node.label;
            if (name === undefined) {
                return { ...node };
            }
            return { ...node, name: String(name) };
        });
        const normalizeLinks = (links) => links.map((link) => {
            if (!link || typeof link !== 'object') {
                return link;
            }
            const name = link.name !== undefined ? link.name : link.label;
            if (name === undefined) {
                return { ...link };
            }
            return { ...link, name: String(name) };
        });
        if (data.graph && typeof data.graph === 'object') {
            const nodes = Array.isArray(data.graph.nodes) ? data.graph.nodes : null;
            if (!nodes) {
                return null;
            }
            const linksSource = Array.isArray(data.graph.links)
                ? data.graph.links
                : (Array.isArray(data.graph.edges) ? data.graph.edges : []);
            return {
                ...data,
                graph: {
                    ...data.graph,
                    nodes: normalizeNodes(nodes),
                    links: normalizeLinks(linksSource)
                }
            };
        }
        if (Array.isArray(data.nodes)) {
            const linksSource = Array.isArray(data.links)
                ? data.links
                : (Array.isArray(data.edges) ? data.edges : []);
            return {
                ...data,
                graph: {
                    nodes: normalizeNodes(data.nodes),
                    links: normalizeLinks(linksSource)
                }
            };
        }
        return null;
    },

    async exportExcel() {
        if (this.state.dataSourceType !== 'excel') {
            alert('当前数据来源为 JSON，将导出 JSON');
            await this.exportJson();
            return;
        }
        if (!this.state.excelRows || this.state.excelRows.length === 0) {
            alert('暂无可导出的 Excel 数据');
            return;
        }
        try {
            const title = Utils.sanitizeFilename(this.state.currentTitle || '专业能力图谱系统');
            await Utils.exportExcel(this.state.excelRows, title);
        } catch (error) {
            this.showError(`导出失败: ${error.message || error}`);
        }
    },

    async exportJson() {
        const currentData = Graph.rawData || Graph.currentData;
        if (!currentData) {
            alert('暂无可导出的 JSON 数据');
            return;
        }
        try {
            const title = Utils.sanitizeFilename(this.state.currentTitle || '专业能力图谱系统');
            await Utils.exportJson(currentData, title);
        } catch (error) {
            this.showError(`导出失败: ${error.message || error}`);
        }
    },

    async exportTemplateExcel() {
        try {
            await Utils.exportTemplateExcel('专业能力图谱系统_模板');
        } catch (error) {
            this.showError(`模板下载失败: ${error.message || error}`);
        }
    },

    restoreBackup() {
        const backup = Utils.loadBackup();
        if (!backup || !backup.data) {
            alert('暂无可恢复的备份');
            return;
        }
        const label = Utils.getBackupLabel(backup);
        const confirmMessage = label ? `确定恢复备份（${label}）？` : '确定恢复备份？';
        if (!confirm(confirmMessage)) {
            return;
        }

        Utils.toggleLoading(true);
        try {
            this.applyGraphData(backup.data);
            this.state.dataSourceType = 'json';
            this.state.excelRows = [];
            Utils.toggleLoading(false);
        } catch (error) {
            Utils.toggleLoading(false);
            this.showError(`恢复备份失败: ${error.message || error}`);
        }
    },

    
    showError(message) {
        console.error(message);
        alert(message);
    }
};


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    App.init();
}
