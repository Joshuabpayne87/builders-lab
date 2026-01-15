# Live Workshops Feature Design

## Overview
Add a feature for admins to share live workshops that users can easily see and join. Users see the next upcoming workshop on their dashboard with a clickable cover image that takes them directly to the meeting.

## Requirements
- Admin can create/edit/archive workshops
- Each workshop has: title, date/time, cover image (uploaded), meeting link
- Users see only the next upcoming active workshop on dashboard
- Clicking the workshop card opens the meeting link
- Past workshops are manually archived by admin

---

## Database Structure

### Table: `bl_workshops`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, auto-generated |
| title | TEXT NOT NULL | Workshop title |
| description | TEXT | Brief description (optional) |
| scheduled_at | TIMESTAMPTZ NOT NULL | When the workshop happens |
| cover_image_url | TEXT | Supabase storage URL |
| meeting_link | TEXT NOT NULL | Zoom/Meet/etc link |
| status | TEXT DEFAULT 'active' | 'active' or 'archived' |
| created_by | UUID | FK to auth.users |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-updated |

### RLS Policies
- **SELECT**: Anyone can view where `status = 'active'`
- **INSERT/UPDATE/DELETE**: Only admins (role = 'admin' in user_metadata)

---

## User Dashboard Widget

### Component: `WorkshopsWidget.tsx`

**Location:** Below CalendarWidget, spans 2 columns

**Display:**
- Header: "Live Workshop" with Video icon
- Cover image (large, clickable)
- Title
- Formatted date/time (e.g., "Sat, Jan 18 at 2:00 PM")
- Entire card clickable → opens meeting link in new tab

**Empty State:**
- "No workshops scheduled" with subtle icon

**Styling:**
- Matches existing dark theme
- `bg-white/5`, `border-white/10`
- Hover effects consistent with other widgets

---

## Admin Panel

### Location
New "Workshops" tab in admin navigation

### Workshop List View
- Table: Cover thumbnail, Title, Date/Time, Status, Actions
- Status badges: green "Active" / gray "Archived"
- Actions: Edit, Archive/Restore, Delete

### Create/Edit Form (Modal)
- Title (text input, required)
- Description (textarea, optional)
- Date & Time (datetime-local input, required)
- Cover Image (file upload to Supabase storage)
- Meeting Link (URL input, required)
- Image preview after upload

### Archive Flow
- "Archive" button changes status to 'archived'
- Workshop hidden from user dashboard
- "Restore" button to reactivate

---

## Implementation Files

### Create New Files
1. `supabase/migrations/20260115_create_workshops.sql` - Table + RLS
2. `app/dashboard/WorkshopsWidget.tsx` - User widget
3. `app/admin/components/WorkshopsManager.tsx` - Admin CRUD
4. `lib/workshops-service.ts` - Server-side service
5. `lib/workshops-client.ts` - Client API wrapper
6. `app/api/workshops/route.ts` - GET (list) / POST (create)
7. `app/api/workshops/[id]/route.ts` - GET / PUT / DELETE

### Modify Existing Files
1. `app/dashboard/page.tsx` - Add WorkshopsWidget below CalendarWidget
2. `app/admin/page.tsx` - Add Workshops tab

---

## Technical Notes

- Uses existing Supabase storage utilities from `/lib/supabase/storage.ts`
- Follows Powerups pattern for service/client/API structure
- Image uploads go to `user-images` bucket with admin user ID path
- Datetime stored in UTC, displayed in user's local timezone
