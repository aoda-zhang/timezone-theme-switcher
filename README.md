# Timezone Theme Switcher

根据指定的 IANA 时区自动判断白天/黑夜，并切换 VSCode 主题的插件。

根据指定的 IANA 时区自动判断白天/黑夜，并切换 VSCode 主题的插件。

[![Version](https://vsmarketplacebadges.dev/version-short/aoda-zhang.timezone-theme-switcher.svg)](https://marketplace.visualstudio.com/items?itemName=aoda-zhang.timezone-theme-switcher)
[![Installs](https://vsmarketplacebadges.dev/installs-short/aoda-zhang.timezone-theme-switcher.svg)](https://marketplace.visualstudio.com/items?itemName=aoda-zhang.timezone-theme-switcher)
[![Rating](https://vsmarketplacebadges.dev/rating-star/aoda-zhang.timezone-theme-switcher.svg)](https://marketplace.visualstudio.com/items?itemName=aoda-zhang.timezone-theme-switcher)

## ✨ 功能特性

- 🌍 **支持所有 IANA 时区**：`Asia/Shanghai`、`America/New_York`、`Europe/London` 等
- ⏰ **自动判断白天/黑夜**：根据时区的当前小时（默认 6:00-18:00 为白天）
- 🔄 **自动定时切换**：可设置每隔 N 分钟自动检测并切换
- 🎨 **自定义主题**：可配置白天和黑夜使用的主题
- ⚙️ **智能配置**：支持自定义白天/黑夜时段

## 📸 截图

> 截图待添加

## 📦 安装

### 方式一：VSCode Marketplace（推荐）

在 VSCode 中直接搜索 `Timezone Theme Switcher` 并安装。

### 方式二：VSIX 文件安装

1. 从 [Releases](https://github.com/aoda-zhang/timezone-theme-switcher/releases) 下载 `.vsix` 文件
2. 在 VSCode 中按 `Ctrl+Shift+P`，输入「从 VSIX 安装」

### 方式三：命令行安装

```bash
code --install-extension timezone-theme-switcher-1.0.0.vsix
```

## 🚀 快速开始

### 1. 打开命令面板

按 `Ctrl+Shift+P`（Windows/Linux）或 `Cmd+Shift+P`（macOS），然后输入：

```
Timezone Theme
```

### 2. 选择时区

选择「按时区切换」，然后从列表中选择你的时区。

### 3. 完成！

插件会自动判断当前是白天还是黑夜，并切换到对应的主题。

## ⌨️ 所有命令

| 命令 | 说明 |
|------|------|
| `Timezone Theme: 切换主题` | 根据当前配置的时区切换主题 |
| `Timezone Theme: 按时区切换` | 交互式选择时区并切换 |
| `Timezone Theme: 设置白天主题` | 选择白天使用的主题 |
| `Timezone Theme: 设置黑夜主题` | 选择黑夜使用的主题 |
| `Timezone Theme: 查看状态` | 显示当前时区和主题配置 |
| `Timezone Theme: 开启自动切换` | 启动定时自动切换 |
| `Timezone Theme: 停止自动切换` | 停止自动切换 |

## ⚙️ 配置选项

在 VSCode 设置中配置（`Ctrl+,` 打开设置）：

```json
{
  // 白天使用的主题
  "timezoneTheme.dayTheme": "Default Light Modern",
  
  // 黑夜使用的主题
  "timezoneTheme.nightTheme": "Default Dark Modern",
  
  // 默认时区（IANA 格式）
  "timezoneTheme.timezone": "Asia/Shanghai",
  
  // 自动切换间隔（分钟）
  "timezoneTheme.autoIntervalMinutes": 30,
  
  // 白天开始时间（小时，0-24）
  "timezoneTheme.dayStartHour": 6,
  
  // 白天结束时间（小时，0-24）
  "timezoneTheme.dayEndHour": 18
}
```

## 🌍 支持的时区

支持所有 [IANA 时区数据库](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 中的时区，常见时区：

| 时区 | 城市 | UTC 偏移 |
|------|------|---------|
| `Asia/Shanghai` | 北京、上海 | UTC+8 |
| `Asia/Tokyo` | 东京 | UTC+9 |
| `Asia/Seoul` | 首尔 | UTC+9 |
| `Asia/Singapore` | 新加坡 | UTC+8 |
| `Asia/Kolkata` | 孟买 | UTC+5:30 |
| `Europe/London` | 伦敦 | UTC+0 |
| `Europe/Paris` | 巴黎 | UTC+1 |
| `Europe/Berlin` | 柏林 | UTC+1 |
| `America/New_York` | 纽约 | UTC-5 |
| `America/Los_Angeles` | 洛杉矶 | UTC-8 |
| `Australia/Sydney` | 悉尼 | UTC+11 |

## 💡 使用场景

### 场景 1：远程团队协作

不同地区的团队成员可以设置各自的时区，享受符合当地时间的视觉体验。

### 场景 2：保护眼睛

插件会在日落后自动切换到暗色主题，保护眼睛。

### 场景 3：跨时区开发

开发面向全球用户的产品时，可以模拟不同时区的主题效果。

## 🔧 开发

```bash
# 克隆项目
git clone https://github.com/aoda-zhang/timezone-theme-switcher.git
cd timezone-theme-switcher

# 安装依赖
npm install

# 打包
npm run package

# 发布（需要 Azure Personal Access Token）
npm run publish
```

## 📝 更新日志

### [1.0.0] - 2024-XX-XX

- ✨ 初始版本
- 支持根据 IANA 时区切换主题
- 支持自动定时切换
- 支持自定义白天/黑夜时段

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](./LICENSE)

---

如果你觉得这个插件有用，请给个 ⭐！

[![Star](https://img.shields.io/github/stars/aoda-zhang/timezone-theme-switcher?style=social)](https://github.com/aoda-zhang/timezone-theme-switcher)
