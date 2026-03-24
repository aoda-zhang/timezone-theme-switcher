const vscode = require('vscode');

// 存储自动切换的 interval ID
let autoSwitchInterval = null;
// 存储状态栏项
let statusBarItem = null;

/**
 * 根据 IANA 时区名获取当前时间信息
 * @param {string} timezone - IANA 时区名
 * @returns {{ isDay: boolean, currentHour: number, timezoneName: string, localTime: string }}
 */
function getTimeInfo(timezone) {
    const now = new Date();
    
    // 获取指定时区的小时
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === 'hour').value, 10);
    
    // 获取配置中的白天时段
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const dayStart = config.get('dayStartHour', 6);
    const dayEnd = config.get('dayEndHour', 18);
    const isDay = hour >= dayStart && hour < dayEnd;
    
    // 获取完整时间字符串
    const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    return {
        isDay,
        currentHour: hour,
        timezoneName: timezone,
        localTime: timeFormatter.format(now)
    };
}

/**
 * 切换到指定主题
 * @param {boolean} isDay - true 为白天，false 为黑夜
 */
async function switchTheme(isDay) {
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const theme = isDay 
        ? config.get('dayTheme', 'Default Light Modern')
        : config.get('nightTheme', 'Default Dark Modern');
    
    try {
        // 直接通过配置设置主题（不需要用户交互）
        const workbenchConfig = vscode.workspace.getConfiguration('workbench');
        await workbenchConfig.update('colorTheme', theme, vscode.ConfigurationTarget.Global);
        
        const status = isDay ? '☀️ 白天' : '🌙 黑夜';
        const timeInfo = getTimeInfo(config.get('timezone', 'Asia/Shanghai'));
        
        // 更新状态栏
        updateStatusBar(isDay, theme);
        
        vscode.window.showInformationMessage(
            `✅ 主题已切换为 "${theme}" (${status})\n当前时间: ${timeInfo.localTime}`,
            { modal: false }
        );
        
        return { success: true, theme, isDay };
    } catch (error) {
        vscode.window.showErrorMessage(`切换主题失败: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * 根据时区自动切换主题
 * @param {string} timezone - IANA 时区名
 */
async function switchByTimezone(timezone) {
    if (!isValidTimezone(timezone)) {
        vscode.window.showErrorMessage(`无效的时区: ${timezone}`);
        return { success: false, error: 'Invalid timezone' };
    }
    
    const timeInfo = getTimeInfo(timezone);
    return switchTheme(timeInfo.isDay);
}

/**
 * 验证时区是否有效
 * @param {string} timezone 
 * @returns {boolean}
 */
function isValidTimezone(timezone) {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
        return true;
    } catch {
        return false;
    }
}

/**
 * 显示时区选择器
 */
async function showTimezonePicker() {
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const currentZone = config.get('timezone', 'Asia/Shanghai');
    
    const quickPick = vscode.window.createQuickPick();
    quickPick.placeholder = '选择时区（输入搜索或直接输入 IANA 时区名）';
    quickPick.canSelectMany = false;
    
    // 常用时区列表（按地区分组）
    const commonTimezones = [
        { group: '🌏 亚洲', timezones: [
            { label: '北京 / 上海', value: 'Asia/Shanghai', offset: 'UTC+8' },
            { label: '香港', value: 'Asia/Hong_Kong', offset: 'UTC+8' },
            { label: '新加坡', value: 'Asia/Singapore', offset: 'UTC+8' },
            { label: '东京', value: 'Asia/Tokyo', offset: 'UTC+9' },
            { label: '首尔', value: 'Asia/Seoul', offset: 'UTC+9' },
            { label: '台北', value: 'Asia/Taipei', offset: 'UTC+8' },
            { label: '曼谷', value: 'Asia/Bangkok', offset: 'UTC+7' },
            { label: '孟买', value: 'Asia/Kolkata', offset: 'UTC+5:30' },
            { label: '迪拜', value: 'Asia/Dubai', offset: 'UTC+4' },
        ]},
        { group: '🌍 欧洲', timezones: [
            { label: '伦敦', value: 'Europe/London', offset: 'UTC+0' },
            { label: '巴黎', value: 'Europe/Paris', offset: 'UTC+1' },
            { label: '柏林', value: 'Europe/Berlin', offset: 'UTC+1' },
            { label: '莫斯科', value: 'Europe/Moscow', offset: 'UTC+3' },
            { label: '罗马', value: 'Europe/Rome', offset: 'UTC+1' },
            { label: '阿姆斯特丹', value: 'Europe/Amsterdam', offset: 'UTC+1' },
        ]},
        { group: '🌎 美洲', timezones: [
            { label: '纽约', value: 'America/New_York', offset: 'UTC-5' },
            { label: '洛杉矶', value: 'America/Los_Angeles', offset: 'UTC-8' },
            { label: '旧金山', value: 'America/Los_Angeles', offset: 'UTC-8' },
            { label: '芝加哥', value: 'America/Chicago', offset: 'UTC-6' },
            { label: '多伦多', value: 'America/Toronto', offset: 'UTC-5' },
            { label: '温哥华', value: 'America/Vancouver', offset: 'UTC-8' },
            { label: '圣保罗', value: 'America/Sao_Paulo', offset: 'UTC-3' },
        ]},
        { group: '🌏 大洋洲', timezones: [
            { label: '悉尼', value: 'Australia/Sydney', offset: 'UTC+11' },
            { label: '墨尔本', value: 'Australia/Melbourne', offset: 'UTC+11' },
            { label: '奥克兰', value: 'Pacific/Auckland', offset: 'UTC+13' },
            { label: '惠灵顿', value: 'Pacific/Auckland', offset: 'UTC+13' },
        ]},
    ];
    
    // 将分组转换为 quick pick items
    const items = [];
    for (const group of commonTimezones) {
        items.push({ label: group.group, kind: vscode.QuickPickItemKind.Separator });
        for (const tz of group.timezones) {
            items.push({
                label: `  ${tz.label}`,
                description: `${tz.value} (${tz.offset})`,
                value: tz.value
            });
        }
    }
    
    quickPick.items = items;
    
    // 高亮当前时区
    for (const item of items) {
        if (item.value === currentZone) {
            quickPick.selectedItem = item;
            break;
        }
    }
    
    quickPick.onDidAccept(async () => {
        const selected = items.find(item => item === quickPick.selectedItems[0]);
        if (selected && selected.value) {
            const timezone = selected.value;
            await config.update('timezone', timezone, vscode.ConfigurationTarget.Global);
            
            const timeInfo = getTimeInfo(timezone);
            await switchTheme(timeInfo.isDay);
            
            quickPick.hide();
        }
    });
    
    // 支持直接输入时区
    quickPick.onDidChangeValue(async (value) => {
        if (value.includes('/') && isValidTimezone(value)) {
            // 用户输入了有效的 IANA 时区
            await config.update('timezone', value, vscode.ConfigurationTarget.Global);
            const timeInfo = getTimeInfo(value);
            await switchTheme(timeInfo.isDay);
            quickPick.hide();
        }
    });
    
    quickPick.show();
}

/**
 * 显示主题选择器
 */
async function showThemePicker(type) {
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const currentTheme = type === 'day' 
        ? config.get('dayTheme', 'Default Light Modern')
        : config.get('nightTheme', 'Default Dark Modern');
    
    const quickPick = vscode.window.createQuickPick();
    quickPick.placeholder = `选择${type === 'day' ? '白天☀️' : '黑夜🌙'}主题`;
    quickPick.canSelectMany = false;
    
    // 常用主题列表
    const builtInThemes = [
        // VSCode 内置主题
        'Default Light Modern',
        'Default Dark Modern', 
        'Visual Studio Light',
        'Visual Studio Dark',
        'High Contrast Light',
        'High Contrast Dark',
        'Solarized Light',
        'Solarized Dark',
        // 热门主题
        'Monokai',
        'Monokai+',
        'One Dark Pro',
        'One Light Pro',
        'One Monokai',
        'GitHub Light Default',
        'GitHub Dark Default',
        'GitHub Light High Contrast',
        'GitHub Dark High Contrast',
        'GitHub Dark Dimmed',
        'Dracula',
        'Dracula Official',
        'Night Owl',
        'Night Owl No Italics',
        'Solarized Flare',
        'Solarized Ocean',
        'Palenight',
        'Palenight Theme',
        'Material Theme',
        'Material Theme Ocean',
        'Material Theme Darker',
        'Atom One Dark',
        'Atom One Light',
        'Hopscotch',
        'Pepesitheme',
    ];
    
    const items = builtInThemes.map(label => ({
        label: label,
        picked: label === currentTheme
    }));
    
    quickPick.items = items;
    
    // 默认选中当前
    const selectedIndex = items.findIndex(item => item.label === currentTheme);
    if (selectedIndex >= 0) {
        quickPick.activeItems = [items[selectedIndex]];
    }
    
    quickPick.onDidAccept(async () => {
        const selected = items.find(item => item === quickPick.selectedItems[0]);
        if (selected) {
            const settingKey = type === 'day' ? 'dayTheme' : 'nightTheme';
            await config.update(settingKey, selected.label, vscode.ConfigurationTarget.Global);
            
            const icon = type === 'day' ? '☀️' : '🌙';
            vscode.window.showInformationMessage(
                `${icon} ${type === 'day' ? '白天' : '黑夜'}主题已设置为: ${selected.label}`
            );
            
            // 立即应用（如果当前时段匹配）
            const timezone = config.get('timezone', 'Asia/Shanghai');
            const timeInfo = getTimeInfo(timezone);
            if ((type === 'day' && timeInfo.isDay) || (type === 'night' && !timeInfo.isDay)) {
                await switchTheme(timeInfo.isDay);
            }
            
            quickPick.hide();
        }
    });
    
    quickPick.show();
}

/**
 * 显示状态信息面板
 */
function showStatusInfo() {
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const timezone = config.get('timezone', 'Asia/Shanghai');
    const timeInfo = getTimeInfo(timezone);
    const isAuto = autoSwitchInterval !== null;
    
    const panel = vscode.window.createWebviewPanel(
        'timezoneStatus',
        '⏰ 时区主题状态',
        vscode.ViewColumn.One,
        { enableScripts: false }
    );
    
    const dayTheme = config.get('dayTheme', 'Default Light Modern');
    const nightTheme = config.get('nightTheme', 'Default Dark Modern');
    const dayStart = config.get('dayStartHour', 6);
    const dayEnd = config.get('dayEndHour', 18);
    const interval = config.get('autoIntervalMinutes', 30);
    
    panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
                    padding: 24px;
                    color: var(--vscode-foreground, #333);
                    background: var(--vscode-editor-background, #fff);
                    line-height: 1.6;
                }
                .card {
                    background: var(--vscode-editorWidget-background, #f5f5f5);
                    border: 1px solid var(--vscode-widget-border, #ddd);
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 16px;
                }
                .header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .icon {
                    font-size: 32px;
                }
                .title {
                    font-size: 20px;
                    font-weight: 600;
                }
                .subtitle {
                    font-size: 14px;
                    opacity: 0.7;
                }
                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                }
                .day-badge {
                    background: #fef3c7;
                    color: #d97706;
                }
                .night-badge {
                    background: #dbeafe;
                    color: #2563eb;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid var(--vscode-widget-border, #eee);
                }
                .info-row:last-child {
                    border-bottom: none;
                }
                .label {
                    color: var(--vscode-foreground, #666);
                }
                .value {
                    font-weight: 500;
                    font-family: 'SF Mono', Monaco, monospace;
                }
                .day-value { color: #d97706; }
                .night-value { color: #2563eb; }
                .commands {
                    background: var(--vscode-sideBar-background, #fafafa);
                    border-radius: 8px;
                    padding: 16px;
                }
                .commands h3 {
                    margin: 0 0 12px 0;
                    font-size: 14px;
                }
                .cmd {
                    display: flex;
                    gap: 8px;
                    padding: 6px 0;
                    font-size: 13px;
                }
                .cmd code {
                    background: var(--vscode-textPreformat-background, #f0f0f0);
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 12px;
                }
                code {
                    background: var(--vscode-textPreformat-background, #f0f0f0);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="header">
                    <span class="icon">${timeInfo.isDay ? '☀️' : '🌙'}</span>
                    <div>
                        <div class="title">${timeInfo.isDay ? '白天模式' : '黑夜模式'}</div>
                        <div class="subtitle">
                            <span class="status-badge ${timeInfo.isDay ? 'day-badge' : 'night-badge'}">
                                ${timeInfo.isDay ? '☀️ Day' : '🌙 Night'}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="info-row">
                    <span class="label">当前时区</span>
                    <span class="value">${timeInfo.timezoneName}</span>
                </div>
                <div class="info-row">
                    <span class="label">本地时间</span>
                    <span class="value">${timeInfo.localTime}</span>
                </div>
                <div class="info-row">
                    <span class="label">当前小时</span>
                    <span class="value">${String(timeInfo.currentHour).padStart(2, '0')}:00</span>
                </div>
                <div class="info-row">
                    <span class="label">自动切换</span>
                    <span class="value">${isAuto ? '✅ 开启中' : '❌ 已关闭'}</span>
                </div>
            </div>
            
            <div class="card">
                <div class="header">
                    <span class="icon">⚙️</span>
                    <div>
                        <div class="title">当前配置</div>
                        <div class="subtitle">Settings</div>
                    </div>
                </div>
                <div class="info-row">
                    <span class="label">☀️ 白天主题</span>
                    <span class="value day-value">${dayTheme}</span>
                </div>
                <div class="info-row">
                    <span class="label">🌙 黑夜主题</span>
                    <span class="value night-value">${nightTheme}</span>
                </div>
                <div class="info-row">
                    <span class="label">白天时段</span>
                    <span class="value">${dayStart}:00 - ${dayEnd}:00</span>
                </div>
                <div class="info-row">
                    <span class="label">检测间隔</span>
                    <span class="value">${interval} 分钟</span>
                </div>
            </div>
            
            <div class="card commands">
                <h3>💡 快捷命令</h3>
                <div class="cmd"><code>Ctrl+Shift+P</code> → 输入 Timezone Theme</div>
                <div class="cmd"><code>timezone-theme.switchByZone</code> 切换时区</div>
                <div class="cmd"><code>timezone-theme.auto</code> 开启自动切换</div>
                <div class="cmd"><code>timezone-theme.status</code> 查看状态</div>
            </div>
        </body>
        </html>
    `;
}

/**
 * 更新状态栏显示
 */
function updateStatusBar(isDay, theme) {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    
    statusBarItem = vscode.window.createStatusBarItem(1, 0);
    statusBarItem.text = `${isDay ? '☀️' : '🌙'} ${theme}`;
    statusBarItem.command = 'timezone-theme.status';
    statusBarItem.tooltip = '点击查看时区主题状态';
    statusBarItem.show();
}

/**
 * 启动自动切换
 */
async function startAutoSwitch() {
    if (autoSwitchInterval) {
        vscode.window.showInformationMessage('⏰ 自动切换已在运行中');
        return;
    }
    
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const intervalMinutes = config.get('autoIntervalMinutes', 30);
    const timezone = config.get('timezone', 'Asia/Shanghai');
    
    // 立即执行一次
    const timeInfo = getTimeInfo(timezone);
    await switchTheme(timeInfo.isDay);
    
    // 设置定时器
    autoSwitchInterval = setInterval(async () => {
        const tz = vscode.workspace.getConfiguration('timezoneTheme').get('timezone', 'Asia/Shanghai');
        const ti = getTimeInfo(tz);
        await switchTheme(ti.isDay);
    }, intervalMinutes * 60 * 1000);
    
    vscode.window.showInformationMessage(
        `✅ 已开启自动切换\n⏰ 每 ${intervalMinutes} 分钟检测一次\n🌍 时区: ${timezone}`,
        { modal: false }
    );
}

/**
 * 停止自动切换
 */
function stopAutoSwitch() {
    if (autoSwitchInterval) {
        clearInterval(autoSwitchInterval);
        autoSwitchInterval = null;
        
        if (statusBarItem) {
            statusBarItem.dispose();
            statusBarItem = null;
        }
        
        vscode.window.showInformationMessage('⏹️ 已停止自动切换');
    } else {
        vscode.window.showInformationMessage('ℹ️ 当前没有运行自动切换');
    }
}

// ============ 插件入口 ============

function activate(context) {
    console.log('[Timezone Theme] Extension activated');
    
    // 注册所有命令
    const commands = [
        { cmd: 'timezone-theme.switch', handler: switchCommand },
        { cmd: 'timezone-theme.switchByZone', handler: () => showTimezonePicker() },
        { cmd: 'timezone-theme.setDayTheme', handler: () => showThemePicker('day') },
        { cmd: 'timezone-theme.setNightTheme', handler: () => showThemePicker('night') },
        { cmd: 'timezone-theme.status', handler: showStatusInfo },
        { cmd: 'timezone-theme.auto', handler: startAutoSwitch },
        { cmd: 'timezone-theme.stopAuto', handler: stopAutoSwitch },
        { cmd: 'timezone-theme.testTimezone', handler: testTimezoneCommand },
    ];
    
    for (const { cmd, handler } of commands) {
        const disposable = vscode.commands.registerCommand(cmd, handler);
        context.subscriptions.push(disposable);
    }
    
    // 插件激活时执行一次切换
    setTimeout(async () => {
        const config = vscode.workspace.getConfiguration('timezoneTheme');
        const timezone = config.get('timezone', 'Asia/Shanghai');
        const timeInfo = getTimeInfo(timezone);
        
        // 自动切换到当前时区对应的主题
        await switchTheme(timeInfo.isDay);
        
        console.log(`[Timezone Theme] Initialized: ${timezone}, ${timeInfo.isDay ? 'Day' : 'Night'}`);
    }, 1000);
}

// 根据时区切换主题命令
async function switchCommand(timezone) {
    if (!timezone) {
        return showTimezonePicker();
    }
    
    if (!isValidTimezone(timezone)) {
        vscode.window.showErrorMessage(`❌ 无效的时区: ${timezone}`);
        return;
    }
    
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    await config.update('timezone', timezone, vscode.ConfigurationTarget.Global);
    await switchByTimezone(timezone);
}

// 测试时区命令（用于调试）
async function testTimezoneCommand() {
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const timezone = config.get('timezone', 'Asia/Shanghai');
    const timeInfo = getTimeInfo(timezone);
    
    vscode.window.showInformationMessage(
        `🧪 测试结果\n时区: ${timezone}\n时间: ${timeInfo.localTime}\n状态: ${timeInfo.isDay ? '☀️ 白天' : '🌙 黑夜'}`
    );
}

// 插件停用
function deactivate() {
    if (autoSwitchInterval) {
        clearInterval(autoSwitchInterval);
        autoSwitchInterval = null;
    }
    if (statusBarItem) {
        statusBarItem.dispose();
        statusBarItem = null;
    }
}

module.exports = {
    activate,
    deactivate
};
