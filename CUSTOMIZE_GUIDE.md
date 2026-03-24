# Timezone Theme Switcher - JSON 自定义主题配置指南

## 📋 概述

本文档说明如何通过 `settings.json` 文件自定义时区主题插件的各种配置。

---

## ⚙️ 快速配置示例

在 VSCode 设置 (`Ctrl+,`) 中添加以下配置：

```json
{
  // ===== 基础配置 =====
  "timezoneTheme.timezone": "Asia/Shanghai",
  
  // ===== 主题配置 =====
  "timezoneTheme.dayTheme": "Default Light Modern",
  "timezoneTheme.nightTheme": "Default Dark Modern",
  
  // ===== 高级配置 =====
  "timezoneTheme.autoIntervalMinutes": 30,
  "timezoneTheme.dayStartHour": 6,
  "timezoneTheme.dayEndHour": 18
}
```

---

## 🎨 主题配置详解

### dayTheme - 白天主题

```json
{
  "timezoneTheme.dayTheme": "Default Light Modern"
}
```

**推荐白天主题：**

| 主题名称 | 来源 | 推荐指数 |
|---------|------|---------|
| `Default Light Modern` | VSCode 内置 | ⭐⭐⭐⭐⭐ |
| `Solarized Light` | VSCode 内置 | ⭐⭐⭐⭐ |
| `Visual Studio Light` | VSCode 内置 | ⭐⭐⭐⭐ |
| `GitHub Light Default` | GitHub 主题插件 | ⭐⭐⭐⭐⭐ |
| `GitHub Light High Contrast` | GitHub 主题插件 | ⭐⭐⭐⭐ |
| `One Light Pro` | One Dark Pro 插件 | ⭐⭐⭐⭐⭐ |
| `Atom One Light` | Atom 主题插件 | ⭐⭐⭐⭐ |
| `Dracula` (亮色版本) | Dracula 插件 | ⭐⭐⭐ |

### nightTheme - 黑夜主题

```json
{
  "timezoneTheme.nightTheme": "Default Dark Modern"
}
```

**推荐黑夜主题：**

| 主题名称 | 来源 | 推荐指数 |
|---------|------|---------|
| `Default Dark Modern` | VSCode 内置 | ⭐⭐⭐⭐⭐ |
| `One Dark Pro` | 插件市场 | ⭐⭐⭐⭐⭐ |
| `Night Owl` | 插件市场 | ⭐⭐⭐⭐⭐ |
| `Dracula` | 插件市场 | ⭐⭐⭐⭐⭐ |
| `Monokai` | 插件市场 | ⭐⭐⭐⭐ |
| `GitHub Dark Default` | GitHub 主题插件 | ⭐⭐⭐⭐ |
| `GitHub Dark Dimmed` | GitHub 主题插件 | ⭐⭐⭐⭐ |
| `Palenight Theme` | 插件市场 | ⭐⭐⭐⭐ |
| `Material Theme` | 插件市场 | ⭐⭐⭐⭐ |

---

## 🌍 时区配置

### timezone - 默认时区

```json
{
  "timezoneTheme.timezone": "Asia/Shanghai"
}
```

### 支持的所有时区格式

```json
{
  // 完整 IANA 时区名
  "timezoneTheme.timezone": "America/New_York",
  
  // 地区/城市格式
  "timezoneTheme.timezone": "Europe/London",
  
  // 亚洲主要城市
  "timezoneTheme.timezone": "Asia/Shanghai",    // 北京、上海
  "timezoneTheme.timezone": "Asia/Hong_Kong",   // 香港
  "timezoneTheme.timezone": "Asia/Tokyo",       // 东京
  "timezoneTheme.timezone": "Asia/Seoul",       // 首尔
  "timezoneTheme.timezone": "Asia/Singapore",   // 新加坡
  "timezoneTheme.timezone": "Asia/Kolkata",     // 孟买
  "timezoneTheme.timezone": "Asia/Dubai",       // 迪拜
  
  // 欧洲主要城市
  "timezoneTheme.timezone": "Europe/London",   // 伦敦
  "timezoneTheme.timezone": "Europe/Paris",     // 巴黎
  "timezoneTheme.timezone": "Europe/Berlin",    // 柏林
  "timezoneTheme.timezone": "Europe/Moscow",    // 莫斯科
  
  // 美洲主要城市
  "timezoneTheme.timezone": "America/New_York",    // 纽约
  "timezoneTheme.timezone": "America/Los_Angeles", // 洛杉矶
  "timezoneTheme.timezone": "America/Chicago",      // 芝加哥
  "timezoneTheme.timezone": "America/Toronto",     // 多伦多
  
  // 大洋洲
  "timezoneTheme.timezone": "Australia/Sydney",  // 悉尼
  "timezoneTheme.timezone": "Pacific/Auckland",  // 奥克兰
}
```

---

## ⏰ 时间配置

### dayStartHour - 白天开始时间

```json
{
  // 默认 6:00 开始算白天
  "timezoneTheme.dayStartHour": 6,
  
  // 如果你想晚点开始白天（比如 7:00）
  "timezoneTheme.dayStartHour": 7,
  
  // 如果你是早起型，想 5:00 就算白天
  "timezoneTheme.dayStartHour": 5
}
```

### dayEndHour - 白天结束时间

```json
{
  // 默认 18:00 (下午6点) 结束白天
  "timezoneTheme.dayEndHour": 18,
  
  // 如果你想早点进入黑夜模式（17:00）
  "timezoneTheme.dayEndHour": 17,
  
  // 如果你是夜猫子，22:00 才结束白天
  "timezoneTheme.dayEndHour": 22
}
```

### 自动切换时间示例

```json
{
  // 正常作息：6:00-18:00 为白天
  "timezoneTheme.dayStartHour": 6,
  "timezoneTheme.dayEndHour": 18,
  
  // 早睡早起：5:00-21:00 为白天
  "timezoneTheme.dayStartHour": 5,
  "timezoneTheme.dayEndHour": 21,
  
  // 夜猫子：10:00-22:00 为白天
  "timezoneTheme.dayStartHour": 10,
  "timezoneTheme.dayEndHour": 22
}
```

---

## 🔄 自动切换配置

### autoIntervalMinutes - 自动检测间隔

```json
{
  // 默认每 30 分钟检测一次
  "timezoneTheme.autoIntervalMinutes": 30,
  
  // 频繁检测（每 5 分钟）
  "timezoneTheme.autoIntervalMinutes": 5,
  
  // 省电模式（每 60 分钟）
  "timezoneTheme.autoIntervalMinutes": 60
}
```

---

## 📝 完整配置示例

### 示例 1：上班族配置

```json
{
  "timezoneTheme.timezone": "Asia/Shanghai",
  "timezoneTheme.dayTheme": "One Light Pro",
  "timezoneTheme.nightTheme": "One Dark Pro",
  "timezoneTheme.autoIntervalMinutes": 30,
  "timezoneTheme.dayStartHour": 7,
  "timezoneTheme.dayEndHour": 19
}
```

### 示例 2：设计师配置（保护眼睛）

```json
{
  "timezoneTheme.timezone": "America/Los_Angeles",
  "timezoneTheme.dayTheme": "GitHub Light Default",
  "timezoneTheme.nightTheme": "Night Owl",
  "timezoneTheme.autoIntervalMinutes": 15,
  "timezoneTheme.dayStartHour": 8,
  "timezoneTheme.dayEndHour": 20
}
```

### 示例 3：跨时区开发（远程团队）

```json
{
  // 模拟纽约时间
  "timezoneTheme.timezone": "America/New_York",
  "timezoneTheme.dayTheme": "Default Light Modern",
  "timezoneTheme.nightTheme": "Dracula",
  "timezoneTheme.autoIntervalMinutes": 60,
  "timezoneTheme.dayStartHour": 9,
  "timezoneTheme.dayEndHour": 18
}
```

---

## 💡 高级用法

### 在工作区级别覆盖配置

在项目的 `.vscode/settings.json` 中配置：

```json
{
  "timezoneTheme.timezone": "Europe/London",
  "timezoneTheme.dayTheme": "GitHub Light Default",
  "timezoneTheme.nightTheme": "GitHub Dark Dimmed"
}
```

### 通过命令行使用

```bash
# 使用命令面板 (Ctrl+Shift+P) 执行：
# timezone-theme.switch Asia/Tokyo

# 或在命令行中：
code --extension-recommendations
```

### 代码调用

```javascript
// 在其他 VSCode 插件中调用
vscode.commands.executeCommand('timezone-theme.switch', 'America/New_York');
vscode.commands.executeCommand('timezone-theme.auto');
```

---

## 🐛 常见问题

### Q: 主题没有切换？

1. 确认主题名称拼写正确
2. 检查该主题是否已安装
3. 查看 VSCode 输出面板（视图 → 输出 → 扩展）

### Q: 时区无效？

确保使用 IANA 标准时区格式：
- ❌ `GMT+8`
- ❌ `中国时间`
- ✅ `Asia/Shanghai`

### Q: 自动切换不工作？

1. 调用「开启自动切换」命令
2. 重启 VSCode

---

## 📚 相关资源

- [IANA 时区数据库](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
- [VSCode 主题市场](https://marketplace.visualstudio.com/search?target=VSCode&category=Themes)
- [GitHub Issues](https://github.com/aoda-zhang/timezone-theme-switcher/issues)
