const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// 存储自动切换的 interval ID
let autoSwitchInterval = null;

/**
 * 根据 IANA 时区名获取当前时间信息
 * @param {string} timezone - IANA 时区名，如 'Asia/Shanghai'
 * @returns {{ isDay: boolean, currentHour: number, timezoneName: string, localTime: string }}
 */
function getTimeInfo(timezone) {
    const now = new Date();
    
    // 使用 Intl.DateTimeFormat 获取指定时区的当前时间
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === 'hour').value, 10);
    
    // 判断是白天还是黑夜（假设 6:00-18:00 为白天）
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const dayStart = config.get('dayStartHour', 6);
    const dayEnd = config.get('dayEndHour', 18);
    const isDay = hour >= dayStart && hour < dayEnd;
    
    // 获取带时区的完整时间字符串
    const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
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
        await vscode.commands.executeCommand('workbench.action.selectTheme', theme);
        
        const status = isDay ? '☀️ 白天' : '🌙 黑夜';
        const statusBar = vscode.window.createStatusBarItem(
            isDay ? 1 : 2, // priority
            isDay ? 0 : 0  // alignment
        );
        
        vscode.window.showInformationMessage(
            `主题已切换为 "${theme}" (${status})`
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
 * 获取所有已安装的主题列表
 */
async function getInstalledThemes() {
    const extensions = vscode.extensions.all;
    const themes = [];
    
    for (const ext of extensions) {
        const contributes = ext.packageJSON?.contributes?.themes;
        if (contributes && Array.isArray(contributes)) {
            for (const theme of contributes) {
                if (theme.label) {
                    themes.push({
                        label: theme.label,
                        extension: ext.packageJSON?.displayName || ext.id
                    });
                }
            }
        }
    }
    
    return themes;
}

/**
 * 显示主题选择器
 */
async function showThemePicker(type) {
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const currentThemes = type === 'day' 
        ? config.get('dayTheme', 'Default Light Modern')
        : config.get('nightTheme', 'Default Dark Modern');
    
    const quickPick = vscode.window.createQuickPick();
    quickPick.placeholder = `选择${type === 'day' ? '白天' : '黑夜'}主题`;
    
    // 内置常用主题
    const builtInThemes = [
        'Default Light Modern',
        'Default Dark Modern', 
        'Visual Studio Light',
        'Visual Studio Dark',
        'High Contrast Light',
        'High Contrast Dark',
        'Solarized Light',
        'Solarized Dark',
        'Monokai',
        'One Dark Pro',
        'One Light Pro',
        'GitHub Light Default',
        'GitHub Dark Default',
        'GitHub Light High Contrast',
        'GitHub Dark High Contrast'
    ];
    
    quickPick.items = builtInThemes.map(label => ({ label }));
    
    quickPick.onDidAccept(() => {
        const selected = quickPick.selectedItems[0];
        if (selected) {
            config.update(
                type === 'day' ? 'dayTheme' : 'nightTheme',
                selected.label,
                vscode.ConfigurationTarget.Global
            );
            vscode.window.showInformationMessage(
                `${type === 'day' ? '白天' : '黑夜'}主题已设置为: ${selected.label}`
            );
        }
        quickPick.hide();
    });
    
    quickPick.show();
}

/**
 * 显示时区选择器
 */
async function showTimezonePicker() {
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const currentZone = config.get('timezone', 'Asia/Shanghai');
    
    const quickPick = vscode.window.createQuickPick();
    quickPick.placeholder = '选择时区（输入搜索）';
    
    // 常用时区列表
    const commonTimezones = [
        { label: '亚洲 - 北京/上海 (Asia/Shanghai)', description: 'UTC+8' },
        { label: '亚洲 - 东京 (Asia/Tokyo)', description: 'UTC+9' },
        { label: '亚洲 - 首尔 (Asia/Seoul)', description: 'UTC+9' },
        { label: '亚洲 - 香港 (Asia/Hong_Kong)', description: 'UTC+8' },
        { label: '亚洲 - 新加坡 (Asia/Singapore)', description: 'UTC+8' },
        { label: '亚洲 - 孟买 (Asia/Kolkata)', description: 'UTC+5:30' },
        { label: '欧洲 - 伦敦 (Europe/London)', description: 'UTC+0' },
        { label: '欧洲 - 巴黎 (Europe/Paris)', description: 'UTC+1' },
        { label: '欧洲 - 柏林 (Europe/Berlin)', description: 'UTC+1' },
        { label: '欧洲 - 莫斯科 (Europe/Moscow)', description: 'UTC+3' },
        { label: '北美洲 - 纽约 (America/New_York)', description: 'UTC-5' },
        { label: '北美洲 - 洛杉矶 (America/Los_Angeles)', description: 'UTC-8' },
        { label: '北美洲 - 芝加哥 (America/Chicago)', description: 'UTC-6' },
        { label: '北美洲 - 旧金山 (America/Denver)', description: 'UTC-7' },
        { label: '大洋洲 - 悉尼 (Australia/Sydney)', description: 'UTC+11' },
        { label: '大洋洲 - 奥克兰 (Pacific/Auckland)', description: 'UTC+13' },
        { label: '南美洲 - 圣保罗 (America/Sao_Paulo)', description: 'UTC-3' }
    ];
    
    // 添加当前时区到列表顶部（如果不在列表中）
    const timezones = commonTimezones.filter(t => t.label.includes(currentZone));
    if (timezones.length === 0 && currentZone) {
        timezones.push({ label: `当前: ${currentZone}`, description: '当前设置' });
    }
    
    quickPick.items = [
        ...timezones,
        ...commonTimezones
    ];
    
    quickPick.onDidAccept(async () => {
        const selected = quickPick.selectedItems[0];
        if (selected && selected.label.startsWith('当前:')) {
            // 保持当前设置
        } else if (selected) {
            // 提取时区名称
            const match = selected.label.match(/\(([^)]+)\)/);
            if (match) {
                const timezone = match[1];
                config.update('timezone', timezone, vscode.ConfigurationTarget.Global);
                
                // 立即切换主题
                const timeInfo = getTimeInfo(timezone);
                await switchTheme(timeInfo.isDay);
                
                vscode.window.showInformationMessage(
                    `时区已切换为: ${timezone}\n当前时间: ${timeInfo.localTime} (${timeInfo.isDay ? '☀️ 白天' : '🌙 黑夜'})`
                );
            }
        }
        quickPick.hide();
    });
    
    // 支持搜索过滤
    quickPick.onDidChangeValue(() => {
        const filter = quickPick.value.toLowerCase();
        if (filter && !filter.match(/^[a-z_/]+$/i)) {
            // 如果输入看起来像手动输入的时区，尝试直接使用
            return;
        }
    });
    
    quickPick.show();
}

/**
 * 格式化时区列表用于搜索
 */
function formatTimezoneForSearch() {
    const zones = Intl.supportedValuesOf('timeZone');
    return zones.map(zone => ({
        label: zone,
        description: new Date().toLocaleTimeString('en-US', { 
            timeZone: zone, 
            hour: 'numeric', 
            hour12: true 
        })
    }));
}

/**
 * 显示状态栏信息
 */
function showStatusInfo() {
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const timezone = config.get('timezone', 'Asia/Shanghai');
    const timeInfo = getTimeInfo(timezone);
    
    const panel = vscode.window.createWebviewPanel(
        'timezoneStatus',
        '⏰ 时区主题状态',
        vscode.ViewColumn.One,
        {}
    );
    
    panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    padding: 20px;
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                }
                .card {
                    background: var(--vscode-editorWidget-background);
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 16px;
                }
                .title {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 12px;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid var(--vscode-widget-border);
                }
                .label { color: var(--vscode-foreground); opacity: 0.7; }
                .value { font-weight: 500; }
                .day { color: #f59e0b; }
                .night { color: #6366f1; }
                .icon { font-size: 24px; margin-right: 8px; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="title">
                    <span class="icon">${timeInfo.isDay ? '☀️' : '🌙'}</span>
                    当前状态: ${timeInfo.isDay ? '白天' : '黑夜'}
                </div>
                <div class="info-row">
                    <span class="label">时区</span>
                    <span class="value">${timeInfo.timezoneName}</span>
                </div>
                <div class="info-row">
                    <span class="label">本地时间</span>
                    <span class="value">${timeInfo.localTime}</span>
                </div>
                <div class="info-row">
                    <span class="label">当前小时</span>
                    <span class="value">${timeInfo.currentHour}:00</span>
                </div>
            </div>
            
            <div class="card">
                <div class="title">📋 当前配置</div>
                <div class="info-row">
                    <span class="label">白天主题</span>
                    <span class="value day">${config.get('dayTheme')}</span>
                </div>
                <div class="info-row">
                    <span class="label">黑夜主题</span>
                    <span class="value night">${config.get('nightTheme')}</span>
                </div>
                <div class="info-row">
                    <span class="label">自动切换间隔</span>
                    <span class="value">${config.get('autoIntervalMinutes')} 分钟</span>
                </div>
                <div class="info-row">
                    <span class="label">白天时段</span>
                    <span class="value">${config.get('dayStartHour')}:00 - ${config.get('dayEndHour')}:00</span>
                </div>
            </div>
            
            <div class="card">
                <div class="title">💡 使用提示</div>
                <p>• 使用 <code>Ctrl+Shift+P</code> 然后输入 <code>Timezone Theme</code> 查看所有命令</p>
                <p>• 可以设置 <code>timezoneTheme.timezone</code> 为任意 IANA 时区</p>
                <p>• 支持所有标准时区格式，如 <code>America/New_York</code></p>
            </div>
        </body>
        </html>
    `;
}

// 插件激活时执行的函数
function activate(context) {
    console.log('✅ Timezone Theme Switcher 已激活');
    
    // 注册命令: 根据传入时区切换主题
    const switchCommand = vscode.commands.registerCommand(
        'timezone-theme.switch',
        async (timezone) => {
            if (!timezone) {
                // 如果没有传入时区，弹出选择器
                return showTimezonePicker();
            }
            
            if (!isValidTimezone(timezone)) {
                vscode.window.showErrorMessage(`无效的时区: ${timezone}`);
                return;
            }
            
            await switchByTimezone(timezone);
        }
    );
    
    // 注册命令: 交互式时区选择
    const interactiveCommand = vscode.commands.registerCommand(
        'timezone-theme.switchByZone',
        showTimezonePicker
    );
    
    // 注册命令: 设置白天主题
    const setDayThemeCommand = vscode.commands.registerCommand(
        'timezone-theme.setDayTheme',
        () => showThemePicker('day')
    );
    
    // 注册命令: 设置黑夜主题
    const setNightThemeCommand = vscode.commands.registerCommand(
        'timezone-theme.setNightTheme',
        () => showThemePicker('night')
    );
    
    // 注册命令: 查看状态
    const statusCommand = vscode.commands.registerCommand(
        'timezone-theme.status',
        showStatusInfo
    );
    
    // 注册命令: 自动切换
    const autoCommand = vscode.commands.registerCommand(
        'timezone-theme.auto',
        async () => {
            if (autoSwitchInterval) {
                vscode.window.showInformationMessage('自动切换已在运行中');
                return;
            }
            
            const config = vscode.workspace.getConfiguration('timezoneTheme');
            const intervalMinutes = config.get('autoIntervalMinutes', 30);
            const timezone = config.get('timezone', 'Asia/Shanghai');
            
            // 立即执行一次
            await switchByTimezone(timezone);
            
            // 设置定时器
            autoSwitchInterval = setInterval(async () => {
                await switchByTimezone(timezone);
            }, intervalMinutes * 60 * 1000);
            
            vscode.window.showInformationMessage(
                `✅ 已开启自动切换（每 ${intervalMinutes} 分钟检测一次）`
            );
            
            // 显示状态栏
            const statusBar = vscode.window.createStatusBarItem(1, 0);
            statusBar.text = `⏰ 时区主题: 自动切换中`;
            statusBar.command = 'timezone-theme.status';
            statusBar.show();
            
            // 存储状态栏引用以便后续隐藏
            context.subscriptions.push(statusBar);
        }
    );
    
    // 注册命令: 停止自动切换
    const stopAutoCommand = vscode.commands.registerCommand(
        'timezone-theme.stopAuto',
        () => {
            if (autoSwitchInterval) {
                clearInterval(autoSwitchInterval);
                autoSwitchInterval = null;
                vscode.window.showInformationMessage('⏹️ 已停止自动切换');
            } else {
                vscode.window.showInformationMessage('当前没有运行自动切换');
            }
        }
    );
    
    // 将所有命令添加到订阅
    context.subscriptions.push(
        switchCommand,
        interactiveCommand,
        setDayThemeCommand,
        setNightThemeCommand,
        statusCommand,
        autoCommand,
        stopAutoCommand
    );
    
    // 插件激活时显示欢迎信息
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const timezone = config.get('timezone', 'Asia/Shanghai');
    const timeInfo = getTimeInfo(timezone);
    
    vscode.window.showInformationMessage(
        `🎉 Timezone Theme Switcher 已加载！\n` +
        `当前时区: ${timezone}\n` +
        `当前时间: ${timeInfo.localTime}\n` +
        `当前状态: ${timeInfo.isDay ? '☀️ 白天' : '🌙 黑夜'}`
    );
}

// 插件停用时执行的函数
function deactivate() {
    if (autoSwitchInterval) {
        clearInterval(autoSwitchInterval);
        autoSwitchInterval = null;
    }
}

module.exports = {
    activate,
    deactivate
};
