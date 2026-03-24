# Timezone Theme Switcher

[中文说明](./README_zh.md)

A VSCode extension that automatically switches themes based on the local time of a specified IANA timezone — day or night.

[![Version](https://vsmarketplacebadges.dev/version-short/aoda-zhang.timezone-theme-switcher.svg)](https://marketplace.visualstudio.com/items?itemName=aoda-zhang.timezone-theme-switcher)
[![Installs](https://vsmarketplacebadges.dev/installs-short/aoda-zhang.timezone-theme-switcher.svg)](https://marketplace.visualstudio.com/items?itemName=aoda-zhang.timezone-theme-switcher)
[![Rating](https://vsmarketplacebadges.dev/rating-star/aoda-zhang.timezone-theme-switcher.svg)](https://marketplace.visualstudio.com/items?itemName=aoda-zhang.timezone-theme-switcher)

## ✨ Features

- 🌍 **All IANA Timezones**: Supports `Asia/Shanghai`, `America/New_York`, `Europe/London`, and more
- ⏰ **Auto Day/Night Detection**: Automatically detects day/night based on current hour in the specified timezone (default: 06:00-18:00)
- 🔄 **Auto Timer Switch**: Configurable interval for automatic theme switching
- 🎨 **Customizable Themes**: Configure separate themes for day and night
- ⚙️ **Flexible Hours**: Customize day/night hours to your preference

## 📸 Screenshots

> Screenshots to be added

## 📦 Installation

### Option 1: VSCode Marketplace (Recommended)

Search for `Timezone Theme Switcher` directly in VSCode and install.

### Option 2: VSIX File

1. Download the `.vsix` file from [Releases](https://github.com/aoda-zhang/timezone-theme-switcher/releases)
2. In VSCode, press `Ctrl+Shift+P` and type "Install from VSIX"

### Option 3: Command Line

```bash
code --install-extension timezone-theme-switcher-1.0.0.vsix
```

## 🚀 Quick Start

### 1. Open Command Palette

Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS), then type:

```
Timezone Theme
```

### 2. Select Timezone

Choose "Switch by Timezone" and select your timezone from the list.

### 3. Done!

The extension will automatically detect whether it's day or night and switch to the appropriate theme.

## ⌨️ All Commands

| Command | Description |
|---------|-------------|
| `Timezone Theme: Switch Theme` | Switch theme based on current configured timezone |
| `Timezone Theme: Switch by Zone` | Interactively select a timezone and switch |
| `Timezone Theme: Set Day Theme` | Choose the theme for daytime |
| `Timezone Theme: Set Night Theme` | Choose the theme for nighttime |
| `Timezone Theme: View Status` | Show current timezone and theme configuration |
| `Timezone Theme: Start Auto` | Start automatic theme switching |
| `Timezone Theme: Stop Auto` | Stop automatic theme switching |

## ⚙️ Configuration

Configure in VSCode settings (`Ctrl+,`):

```json
{
  // Daytime theme
  "timezoneTheme.dayTheme": "Default Light Modern",
  
  // Nighttime theme
  "timezoneTheme.nightTheme": "Default Dark Modern",
  
  // Default timezone (IANA format)
  "timezoneTheme.timezone": "Asia/Shanghai",
  
  // Auto-switch interval (minutes)
  "timezoneTheme.autoIntervalMinutes": 30,
  
  // Day starts at hour (0-24)
  "timezoneTheme.dayStartHour": 6,
  
  // Day ends at hour (0-24)
  "timezoneTheme.dayEndHour": 18
}
```

## 🌍 Supported Timezones

Supports all [IANA timezone database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) timezones. Common ones:

| Timezone | City | UTC Offset |
|----------|------|------------|
| `Asia/Shanghai` | Beijing, Shanghai | UTC+8 |
| `Asia/Tokyo` | Tokyo | UTC+9 |
| `Asia/Seoul` | Seoul | UTC+9 |
| `Asia/Singapore` | Singapore | UTC+8 |
| `Asia/Kolkata` | Mumbai | UTC+5:30 |
| `Europe/London` | London | UTC+0 |
| `Europe/Paris` | Paris | UTC+1 |
| `Europe/Berlin` | Berlin | UTC+1 |
| `America/New_York` | New York | UTC-5 |
| `America/Los_Angeles` | Los Angeles | UTC-8 |
| `Australia/Sydney` | Sydney | UTC+11 |

## 💡 Use Cases

### Scenario 1: Remote Team Collaboration

Team members in different regions can set their own timezones for a local day/night experience.

### Scenario 2: Eye Protection

Automatically switch to dark mode after sunset to protect your eyes.

### Scenario 3: Cross-timezone Development

Simulate theme effects in different timezones when developing global products.

## 🔧 Development

```bash
# Clone the project
git clone https://github.com/aoda-zhang/timezone-theme-switcher.git
cd timezone-theme-switcher

# Install dependencies
npm install

# Package
npm run package

# Publish (requires Azure Personal Access Token)
npm run publish
```

## 📝 Changelog

### [1.0.0] - 2024-XX-XX

- ✨ Initial release
- Support timezone-based theme switching
- Auto timer switching
- Customizable day/night hours

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

[MIT License](./LICENSE)

---

If you find this extension useful, please give it a ⭐!

[![Star](https://img.shields.io/github/stars/aoda-zhang/timezone-theme-switcher?style=social)](https://github.com/aoda-zhang/timezone-theme-switcher)
