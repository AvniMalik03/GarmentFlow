# GarmentFlow Dashboard Redesign — Light Theme SaaS

## Design Preview

![Dashboard Mockup](C:\Users\AVNI MALIK\.gemini\antigravity-ide\brain\6f3f712b-6cc9-4e4e-86b0-d95811a9e63b\dashboard_mockup_1781874318713.png)

> [!NOTE]
> The mockup above shows the general direction — a clean, light-theme SaaS dashboard inspired by Linear, Stripe, and Notion. The actual implementation will follow Tailwind CSS classes and render pixel-perfectly in the browser.

---

## Scope & Constraints

| Rule | Status |
|------|--------|
| Modify only the Dashboard page | ✅ |
| Do NOT modify Orders page | ✅ |
| Do NOT modify Order Details page | ✅ |
| Do NOT modify Sidebar routes | ✅ |
| Do NOT modify Navbar functionality | ✅ |
| Do NOT modify backend code | ✅ |
| Do NOT install packages | ✅ |

---

## Current State Analysis

The Dashboard is rendered by [page.tsx](file:///c:/Users/AVNI MALIK/OneDrive/Desktop/GarmentFlow/app/page.tsx) (the root route `/`). The `app/dashboard/page.tsx` simply redirects to `/`.

**Current dashboard** has:
- Dark theme (`bg-slate-950`, `bg-slate-900/40`, `text-white`)
- Only a welcome header and 4 KPI cards
- No production pipeline visualization
- No recent activity panel
- No alerts panel

**Layout stack**: `DashboardLayout` wraps the page with `Navbar` + `Sidebar`. These will **NOT** be modified.

> [!IMPORTANT]
> The `DashboardLayout` uses dark theme classes (`bg-slate-950`, `bg-slate-900/30`) for the shell. To achieve a light-theme dashboard **without modifying layout/sidebar/navbar**, the dashboard content area will override the background using its own container styles. The sidebar and navbar will remain dark — this creates a striking contrast common in professional SaaS dashboards (dark chrome + light content).

---

## Proposed Changes

### Dashboard Content

#### [MODIFY] [page.tsx](file:///c:/Users/AVNI MALIK/OneDrive/Desktop/GarmentFlow/app/page.tsx)

Complete rewrite of the dashboard content (the JSX returned by the `Home` component). **No changes to imports or the DashboardLayout wrapper.**

**New sections being added:**

1. **Welcome Header** — Clean white card with left indigo accent bar
   - Title: "Garment Production Tracking System"
   - Subtitle: "Track garment production from cloth receiving to final dispatch."
   - System status badge (green dot + "System Operational")

2. **KPI Cards (4-card grid)** — White cards with rounded corners, subtle shadows
   - Total Orders (24) — Indigo accent
   - Active Orders (12) — Blue accent with live pulse
   - Completed Orders (8) — Emerald/Green accent
   - Delayed Orders (4) — Red/Rose accent with warning pulse
   - Each card: large bold number, description text, colored icon badge
   - Hover: subtle lift + shadow animation

3. **Production Pipeline Overview** — New section
   - Horizontal flow: `Cloth Received → Cutting → Stitching → QC → Ironing → Packing → Dispatch`
   - Each stage as a rounded pill/node with indigo/slate coloring
   - Connected by styled arrow/chevron separators
   - Responsive: wraps gracefully on mobile
   - Sample order counts per stage for visual context

4. **Recent Activity Panel** — New section (left column)
   - Timeline-style feed with colored dots
   - Sample events:
     - "Order #1042 moved to Stitching" — blue dot
     - "QC inspection completed for Order #1038" — green dot
     - "Dispatch scheduled for Order #1035" — indigo dot
     - "New order #1043 created" — slate dot
   - Timestamps (e.g., "2 hours ago", "5 hours ago")

5. **Alerts Panel** — New section (right column)
   - Warning cards with left accent borders
   - Sample alerts:
     - "3 orders delayed beyond estimated completion" — orange/amber
     - "2 pending QC inspections require attention" — red
     - "Cutting department at 90% capacity" — yellow
   - Each alert with an icon, title, and description

**Design tokens used (Tailwind classes):**

| Token | Value | Usage |
|-------|-------|-------|
| Background | `bg-[#F8FAFC]` | Dashboard content area |
| Card BG | `bg-white` | All cards and panels |
| Accent | `indigo-600` / `indigo-500` | Headers, active elements |
| Text Primary | `text-slate-900` | Headings |
| Text Secondary | `text-slate-500` | Descriptions, subtitles |
| Success | `emerald-500` | Completed orders, success states |
| Warning | `amber-500` | Capacity alerts |
| Error | `rose-500` | Delayed orders, urgent alerts |
| Shadows | `shadow-sm` / `shadow-md` | Card elevation |
| Borders | `border-slate-200` | Card borders |
| Radius | `rounded-xl` / `rounded-2xl` | Card corners |

---

## What Is NOT Changing

- [DashboardLayout.tsx](file:///c:/Users/AVNI MALIK/OneDrive/Desktop/GarmentFlow/components/layout/DashboardLayout.tsx) — No modifications
- [Navbar.tsx](file:///c:/Users/AVNI MALIK/OneDrive/Desktop/GarmentFlow/components/layout/Navbar.tsx) — No modifications
- [Sidebar.tsx](file:///c:/Users/AVNI MALIK/OneDrive/Desktop/GarmentFlow/components/layout/Sidebar.tsx) — No modifications
- [globals.css](file:///c:/Users/AVNI MALIK/OneDrive/Desktop/GarmentFlow/app/globals.css) — No modifications
- All other pages (orders, dispatch, QC, workers, stage-update) — No modifications
- No new packages installed

---

## Verification Plan

### Manual Verification
1. Run `npm run dev` and navigate to `/`
2. Verify all 5 sections render correctly:
   - Welcome header with proper styling
   - 4 KPI cards with correct data & hover effects
   - Production pipeline with all 7 stages
   - Recent activity timeline
   - Alerts panel
3. Verify responsive layout on different viewports
4. Verify sidebar navigation still works (clicking other pages)
5. Verify the dark sidebar/navbar contrast with light dashboard content
6. Take a browser screenshot to confirm visual quality
