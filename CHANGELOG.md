# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2024-03-24

### Added
- ✅ Support all IANA timezones (Asia/Shanghai, America/New_York, etc.)
- ✅ Auto detect day/night based on timezone hour
- ✅ Configurable themes for day and night
- ✅ Auto timer switching with configurable interval
- ✅ Interactive timezone picker with grouped regions
- ✅ Interactive theme picker with popular themes
- ✅ Status panel showing current configuration
- ✅ Status bar item showing current theme
- ✅ Start/Stop auto-switch commands
- ✅ Test timezone command for debugging
- ✅ Customizable day/night hours (default: 6:00-18:00)
- ✅ Settings sync across VSCode instances
- ✅ GitHub Actions workflow for automatic releases
- ✅ Bilingual README (English + Chinese)
- ✅ JSON customization guide

### Commands
| Command | Description |
|---------|-------------|
| `timezone-theme.switch` | Switch theme by timezone |
| `timezone-theme.switchByZone` | Interactive timezone selection |
| `timezone-theme.setDayTheme` | Choose day theme |
| `timezone-theme.setNightTheme` | Choose night theme |
| `timezone-theme.status` | View current status |
| `timezone-theme.auto` | Start auto switching |
| `timezone-theme.stopAuto` | Stop auto switching |
| `timezone-theme.testTimezone` | Test timezone (debug) |

### Configuration
| Setting | Default | Description |
|---------|---------|-------------|
| `timezoneTheme.timezone` | `Asia/Shanghai` | Default IANA timezone |
| `timezoneTheme.dayTheme` | `Default Light Modern` | Daytime theme |
| `timezoneTheme.nightTheme` | `Default Dark Modern` | Nighttime theme |
| `timezoneTheme.autoIntervalMinutes` | `30` | Auto-check interval |
| `timezoneTheme.dayStartHour` | `6` | Day starts at hour (0-24) |
| `timezoneTheme.dayEndHour` | `18` | Day ends at hour (0-24) |

---

## [Unreleased]

### Planned Features
- [ ] Keyboard shortcuts for quick theme switching
- [ ] Sunset/sunrise time integration
- [ ] Multiple timezone profiles
- [ ] Theme transition animations
