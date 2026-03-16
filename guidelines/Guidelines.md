# Groundwork Design System — Cisco Theme

## Color Usage

- **Primary actions** use Cisco Blue (#049fd9) — buttons, links, active states
- **Accent/highlight** use Cisco Cyan (#00bceb) — hover states, secondary highlights
- **Dark backgrounds** use Cisco Navy (#00435b) — sidebar, navigation
- **Success** use Cisco Green (#6cc04a) — healthy status, confirmations
- **Warning** use Cisco Yellow (#ffbf00) — alerts needing attention
- **Destructive/Critical** use Cisco Red (#cf2030) — errors, critical alerts, delete actions
- **Info** use Cisco Cyan (#00bceb) with low-opacity background
- Never use raw hex values — always reference CSS variables (e.g., `bg-primary`, `text-destructive`)

## Typography

- Use system font stack, weight 400 for body, 600 for headings and labels
- Base font-size: 16px
- Use muted-foreground (#58585b) for secondary/descriptive text
- Headings should be concise and action-oriented (e.g., "Active Alerts" not "List of Current Active Alerts")

## Components

### Buttons

- One primary button per section — the main action
- Use `outline` or `ghost` for secondary actions
- Use `destructive` only for irreversible actions (delete, disconnect)
- Always include clear action-oriented labels (e.g., "Deploy Config" not "Submit")

### Cards

- Use cards to group related metrics or information
- Always include a status indicator dot (green/yellow/red) for operational dashboards
- Card titles should be short (2-3 words max)

### Badges

- Use `bg-success` for healthy/online status
- Use `bg-warning` for degraded/attention states
- Use `destructive` for critical/offline states
- Use `bg-info` for informational labels

### Status Indicators

- Green dot = healthy/online
- Yellow dot = degraded/warning
- Red dot = critical/offline
- Blue dot = informational/processing

## Layout

- Use responsive grid layouts — avoid absolute positioning
- Max content width: 80rem (1280px)
- Consistent spacing: 4px grid (gap-1 = 4px, gap-2 = 8px, etc.)
- Sidebar navigation uses dark Cisco Navy background with light text
- Cards use white background with subtle border

## Network Ops Conventions

- Device names should be monospaced
- IP addresses and MAC addresses should be monospaced
- Timestamps use relative format when < 24h, absolute otherwise
- Always show severity level alongside alert counts