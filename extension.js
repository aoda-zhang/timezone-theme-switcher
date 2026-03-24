const vscode = require('vscode');

// Auto switch interval ID
let autoSwitchInterval = null;
// Status bar item
let statusBarItem = null;

/**
 * Get current time info for a given IANA timezone
 * @param {string} timezone - IANA timezone name
 * @returns {{ isDay: boolean, currentHour: number, timezoneName: string, localTime: string }}
 */
function getTimeInfo(timezone) {
    const now = new Date();
    
    // Get hour in specified timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === 'hour').value, 10);
    
    // Get day/night hours from config
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const dayStart = config.get('dayStartHour', 6);
    const dayEnd = config.get('dayEndHour', 18);
    const isDay = hour >= dayStart && hour < dayEnd;
    
    // Get full time string
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
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
 * Switch to specified theme
 * @param {boolean} isDay - true for day, false for night
 */
async function switchTheme(isDay) {
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const theme = isDay 
        ? config.get('dayTheme', 'Default Light Modern')
        : config.get('nightTheme', 'Default Dark Modern');
    
    try {
        // Set theme directly via workbench config (no user interaction needed)
        const workbenchConfig = vscode.workspace.getConfiguration('workbench');
        await workbenchConfig.update('colorTheme', theme, vscode.ConfigurationTarget.Global);
        
        const status = isDay ? 'Day' : 'Night';
        const timeInfo = getTimeInfo(config.get('timezone', 'Asia/Shanghai'));
        
        // Update status bar
        updateStatusBar(isDay, theme);
        
        vscode.window.showInformationMessage(
            `Theme switched to "${theme}" (${status})\nTime: ${timeInfo.localTime}`,
            { modal: false }
        );
        
        return { success: true, theme, isDay };
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to switch theme: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Switch theme based on timezone
 * @param {string} timezone - IANA timezone name
 */
async function switchByTimezone(timezone) {
    if (!isValidTimezone(timezone)) {
        vscode.window.showErrorMessage(`Invalid timezone: ${timezone}`);
        return { success: false, error: 'Invalid timezone' };
    }
    
    const timeInfo = getTimeInfo(timezone);
    return switchTheme(timeInfo.isDay);
}

/**
 * Validate timezone
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
 * Show timezone picker
 */
async function showTimezonePicker() {
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const currentZone = config.get('timezone', 'Asia/Shanghai');
    
    const quickPick = vscode.window.createQuickPick();
    quickPick.placeholder = 'Select timezone (type to search or enter IANA timezone)';
    quickPick.canSelectMany = false;
    
    // Common timezones grouped by region
    const commonTimezones = [
        { group: 'Asia', timezones: [
            { label: 'Beijing / Shanghai', value: 'Asia/Shanghai', offset: 'UTC+8' },
            { label: 'Hong Kong', value: 'Asia/Hong_Kong', offset: 'UTC+8' },
            { label: 'Singapore', value: 'Asia/Singapore', offset: 'UTC+8' },
            { label: 'Tokyo', value: 'Asia/Tokyo', offset: 'UTC+9' },
            { label: 'Seoul', value: 'Asia/Seoul', offset: 'UTC+9' },
            { label: 'Taipei', value: 'Asia/Taipei', offset: 'UTC+8' },
            { label: 'Bangkok', value: 'Asia/Bangkok', offset: 'UTC+7' },
            { label: 'Mumbai', value: 'Asia/Kolkata', offset: 'UTC+5:30' },
            { label: 'Dubai', value: 'Asia/Dubai', offset: 'UTC+4' },
        ]},
        { group: 'Europe', timezones: [
            { label: 'London', value: 'Europe/London', offset: 'UTC+0' },
            { label: 'Paris', value: 'Europe/Paris', offset: 'UTC+1' },
            { label: 'Berlin', value: 'Europe/Berlin', offset: 'UTC+1' },
            { label: 'Moscow', value: 'Europe/Moscow', offset: 'UTC+3' },
            { label: 'Rome', value: 'Europe/Rome', offset: 'UTC+1' },
            { label: 'Amsterdam', value: 'Europe/Amsterdam', offset: 'UTC+1' },
        ]},
        { group: 'Americas', timezones: [
            { label: 'New York', value: 'America/New_York', offset: 'UTC-5' },
            { label: 'Los Angeles', value: 'America/Los_Angeles', offset: 'UTC-8' },
            { label: 'San Francisco', value: 'America/Los_Angeles', offset: 'UTC-8' },
            { label: 'Chicago', value: 'America/Chicago', offset: 'UTC-6' },
            { label: 'Toronto', value: 'America/Toronto', offset: 'UTC-5' },
            { label: 'Vancouver', value: 'America/Vancouver', offset: 'UTC-8' },
            { label: 'Sao Paulo', value: 'America/Sao_Paulo', offset: 'UTC-3' },
        ]},
        { group: 'Oceania', timezones: [
            { label: 'Sydney', value: 'Australia/Sydney', offset: 'UTC+11' },
            { label: 'Melbourne', value: 'Australia/Melbourne', offset: 'UTC+11' },
            { label: 'Auckland', value: 'Pacific/Auckland', offset: 'UTC+13' },
            { label: 'Wellington', value: 'Pacific/Auckland', offset: 'UTC+13' },
        ]},
    ];
    
    // Convert groups to quick pick items
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
    
    // Highlight current timezone
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
    
    // Support direct timezone input
    quickPick.onDidChangeValue(async (value) => {
        if (value.includes('/') && isValidTimezone(value)) {
            await config.update('timezone', value, vscode.ConfigurationTarget.Global);
            const timeInfo = getTimeInfo(value);
            await switchTheme(timeInfo.isDay);
            quickPick.hide();
        }
    });
    
    quickPick.show();
}

/**
 * Show theme picker
 */
async function showThemePicker(type) {
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const currentTheme = type === 'day' 
        ? config.get('dayTheme', 'Default Light Modern')
        : config.get('nightTheme', 'Default Dark Modern');
    
    const quickPick = vscode.window.createQuickPick();
    quickPick.placeholder = `Select ${type === 'day' ? 'day' : 'night'} theme`;
    quickPick.canSelectMany = false;
    
    // Popular themes list
    const builtInThemes = [
        // VSCode built-in
        'Default Light Modern',
        'Default Dark Modern', 
        'Visual Studio Light',
        'Visual Studio Dark',
        'High Contrast Light',
        'High Contrast Dark',
        'Solarized Light',
        'Solarized Dark',
        // Popular themes
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
    
    // Default to current
    const selectedIndex = items.findIndex(item => item.label === currentTheme);
    if (selectedIndex >= 0) {
        quickPick.activeItems = [items[selectedIndex]];
    }
    
    quickPick.onDidAccept(async () => {
        const selected = items.find(item => item === quickPick.selectedItems[0]);
        if (selected) {
            const settingKey = type === 'day' ? 'dayTheme' : 'nightTheme';
            await config.update(settingKey, selected.label, vscode.ConfigurationTarget.Global);
            
            vscode.window.showInformationMessage(
                `${type === 'day' ? 'Day' : 'Night'} theme set to: ${selected.label}`
            );
            
            // Apply immediately if current period matches
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
 * Show status info panel
 */
function showStatusInfo() {
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const timezone = config.get('timezone', 'Asia/Shanghai');
    const timeInfo = getTimeInfo(timezone);
    const isAuto = autoSwitchInterval !== null;
    
    const panel = vscode.window.createWebviewPanel(
        'timezoneStatus',
        'Timezone Theme Status',
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
                    <span class="icon">${timeInfo.isDay ? 'Sun' : 'Moon'}</span>
                    <div>
                        <div class="title">${timeInfo.isDay ? 'Day Mode' : 'Night Mode'}</div>
                        <div class="subtitle">
                            <span class="status-badge ${timeInfo.isDay ? 'day-badge' : 'night-badge'}">
                                ${timeInfo.isDay ? 'Day' : 'Night'}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="info-row">
                    <span class="label">Current Timezone</span>
                    <span class="value">${timeInfo.timezoneName}</span>
                </div>
                <div class="info-row">
                    <span class="label">Local Time</span>
                    <span class="value">${timeInfo.localTime}</span>
                </div>
                <div class="info-row">
                    <span class="label">Current Hour</span>
                    <span class="value">${String(timeInfo.currentHour).padStart(2, '0')}:00</span>
                </div>
                <div class="info-row">
                    <span class="label">Auto Switch</span>
                    <span class="value">${isAuto ? 'On' : 'Off'}</span>
                </div>
            </div>
            
            <div class="card">
                <div class="header">
                    <span class="icon">Settings</span>
                    <div>
                        <div class="title">Current Configuration</div>
                        <div class="subtitle">Settings</div>
                    </div>
                </div>
                <div class="info-row">
                    <span class="label">Day Theme</span>
                    <span class="value day-value">${dayTheme}</span>
                </div>
                <div class="info-row">
                    <span class="label">Night Theme</span>
                    <span class="value night-value">${nightTheme}</span>
                </div>
                <div class="info-row">
                    <span class="label">Day Hours</span>
                    <span class="value">${dayStart}:00 - ${dayEnd}:00</span>
                </div>
                <div class="info-row">
                    <span class="label">Check Interval</span>
                    <span class="value">${interval} minutes</span>
                </div>
            </div>
            
            <div class="card commands">
                <h3>Commands</h3>
                <div class="cmd"><code>Ctrl+Shift+P</code> → Type Timezone Theme</div>
                <div class="cmd"><code>timezone-theme.switchByZone</code> Switch timezone</div>
                <div class="cmd"><code>timezone-theme.auto</code> Start auto switch</div>
                <div class="cmd"><code>timezone-theme.status</code> View status</div>
            </div>
        </body>
        </html>
    `;
}

/**
 * Update status bar display
 */
function updateStatusBar(isDay, theme) {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    
    statusBarItem = vscode.window.createStatusBarItem(1, 0);
    statusBarItem.text = `${isDay ? 'Day' : 'Night'} - ${theme}`;
    statusBarItem.command = 'timezone-theme.status';
    statusBarItem.tooltip = 'Click to view timezone theme status';
    statusBarItem.show();
}

/**
 * Start auto switching
 */
async function startAutoSwitch() {
    if (autoSwitchInterval) {
        vscode.window.showInformationMessage('Auto switch is already running');
        return;
    }
    
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const intervalMinutes = config.get('autoIntervalMinutes', 30);
    const timezone = config.get('timezone', 'Asia/Shanghai');
    
    // Run immediately
    const timeInfo = getTimeInfo(timezone);
    await switchTheme(timeInfo.isDay);
    
    // Set interval
    autoSwitchInterval = setInterval(async () => {
        const tz = vscode.workspace.getConfiguration('timezoneTheme').get('timezone', 'Asia/Shanghai');
        const ti = getTimeInfo(tz);
        await switchTheme(ti.isDay);
    }, intervalMinutes * 60 * 1000);
    
    vscode.window.showInformationMessage(
        `Auto switch enabled\nEvery ${intervalMinutes} minutes\nTimezone: ${timezone}`,
        { modal: false }
    );
}

/**
 * Stop auto switching
 */
function stopAutoSwitch() {
    if (autoSwitchInterval) {
        clearInterval(autoSwitchInterval);
        autoSwitchInterval = null;
        
        if (statusBarItem) {
            statusBarItem.dispose();
            statusBarItem = null;
        }
        
        vscode.window.showInformationMessage('Auto switch stopped');
    } else {
        vscode.window.showInformationMessage('Auto switch is not running');
    }
}

// ============ Extension Entry Point ============

function activate(context) {
    console.log('[Timezone Theme] Extension activated');
    
    // Register all commands
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
    
    // Run once on activation
    setTimeout(async () => {
        const config = vscode.workspace.getConfiguration('timezoneTheme');
        const timezone = config.get('timezone', 'Asia/Shanghai');
        const timeInfo = getTimeInfo(timezone);
        
        await switchTheme(timeInfo.isDay);
        
        console.log(`[Timezone Theme] Initialized: ${timezone}, ${timeInfo.isDay ? 'Day' : 'Night'}`);
    }, 1000);
}

// Switch theme command handler
async function switchCommand(timezone) {
    if (!timezone) {
        return showTimezonePicker();
    }
    
    if (!isValidTimezone(timezone)) {
        vscode.window.showErrorMessage(`Invalid timezone: ${timezone}`);
        return;
    }
    
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    await config.update('timezone', timezone, vscode.ConfigurationTarget.Global);
    await switchByTimezone(timezone);
}

// Test timezone command (for debugging)
async function testTimezoneCommand() {
    const config = vscode.workspace.getConfiguration('timezoneTheme');
    const timezone = config.get('timezone', 'Asia/Shanghai');
    const timeInfo = getTimeInfo(timezone);
    
    vscode.window.showInformationMessage(
        `Test Result\nTimezone: ${timezone}\nTime: ${timeInfo.localTime}\nStatus: ${timeInfo.isDay ? 'Day' : 'Night'}`
    );
}

// Extension deactivation
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
