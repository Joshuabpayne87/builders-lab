# Product Requirements Document: Content Calendar & Task Management System

## Executive Summary

This PRD documents the Builder's Lab content calendar and task management system. The system enables users to plan, schedule, and track content creation across all 6 apps (Banana Blitz, Unravel, InsightLens, PromptStash, Component Studio, Serendipity) with AI-powered reminders and automated workflows.

**Status:** Phase 1 Complete (Infrastructure & Core Features)
**Next Phase:** App Integration, Notifications, AI Assistant

---

## ✅ COMPLETED FEATURES (Phase 1)

### 1. Database Infrastructure

**Status:** ✅ Complete
**Location:** `supabase/migrations/20260107_create_calendar.sql`

**Implementation:**
```sql
- Table: bl_content_calendar
- RLS Policies: Users only access their own tasks
- Enums: task_status, content_platform, content_type
- Indexes: user_id, user_due_date, user_status, reminder_idx
- Functions: get_upcoming_tasks(), get_incomplete_tasks()
```

**Fields:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to auth.users
- `title` (TEXT) - Task title **(required)**
- `description` (TEXT) - Task details (optional)
- `due_date` (TIMESTAMP) - When task is due **(required)**
- `status` (ENUM) - draft, in_progress, scheduled, completed, cancelled
- `platform` (ENUM) - linkedin, instagram, twitter, facebook, youtube, tiktok, blog, email, other
- `content_type` (ENUM) - image, carousel, video, blog_post, social_post, podcast, infographic, story, reel, other
- `linked_session_id` (UUID) - Links to bl_app_sessions (optional)
- `app_needed` (TEXT) - Which app to use (banana-blitz, unravel, etc.)
- `reminder_sent` (BOOLEAN) - Whether reminder was sent
- `reminder_date` (TIMESTAMP) - When to send reminder
- `metadata` (JSONB) - Flexible additional data
- `created_at`, `updated_at` (TIMESTAMP)

**Action Required:** Apply this migration in Supabase Dashboard

---

### 2. Backend Services

**Status:** ✅ Complete
**Location:** `lib/calendar-service.ts`

**CalendarService Methods:**
- `create(params)` - Create new task
- `list(status?, startDate?, endDate?, limit, offset)` - Get tasks with filters
- `get(id)` - Get single task
- `update(id, params)` - Update task
- `delete(id)` - Delete task
- `getUpcoming(hoursAhead)` - Get tasks due soon (for reminders)
- `getIncomplete()` - Get overdue tasks without linked content
- `getStats()` - Get task counts by status

**Types Exported:**
- `CalendarTask` - Main task interface
- `CreateTaskParams` - Task creation parameters
- `UpdateTaskParams` - Task update parameters
- `UpcomingTask` - Upcoming task interface
- `IncompleteTask` - Incomplete task interface

---

### 3. Client API Wrapper

**Status:** ✅ Complete
**Location:** `lib/calendar-client.ts`

**Client Functions:**
```typescript
createTask(params) → { success, task }
listTasks(status?, startDate?, endDate?, limit, offset) → CalendarTask[]
getTask(id) → CalendarTask | null
updateTask(id, params) → { success, task }
deleteTask(id) → { success }
getUpcomingTasks(hoursAhead) → UpcomingTask[]
getIncompleteTasks() → IncompleteTask[]
getTaskStats() → Record<TaskStatus, number>
```

All functions handle errors and authentication automatically.

---

### 4. API Endpoint

**Status:** ✅ Complete
**Location:** `app/api/calendar/route.ts`

**POST /api/calendar** with actions:
- `create` - Create task (requires: title, due_date)
- `list` - List tasks (optional: status, startDate, endDate, limit, offset)
- `get` - Get task (requires: id)
- `update` - Update task (requires: id + update fields)
- `delete` - Delete task (requires: id)
- `getUpcoming` - Get upcoming tasks (optional: hoursAhead)
- `getIncomplete` - Get incomplete tasks
- `getStats` - Get task statistics

Returns proper error codes (400, 401, 500) with messages.

---

### 5. Calendar Page

**Status:** ✅ Complete
**Location:** `app/calendar/page.tsx`

**Features:**
- **Calendar View:** Monthly grid with tasks displayed on dates
- **List View:** Detailed task list with filters
- **Create/Edit Modal:** Full form with all fields
- **Quick Actions:** Mark complete, edit, delete
- **Stats Dashboard:** Shows task counts by status (draft, in_progress, scheduled, completed, cancelled)
- **Navigation:** Month forward/backward, today highlighting
- **Empty States:** Clear CTAs when no tasks exist

**UI Components:**
- Status color coding (draft=slate, in_progress=blue, scheduled=purple, completed=green, cancelled=red)
- Platform badges (LinkedIn, Instagram, Twitter, etc.)
- Content type labels (Image, Carousel, Video, Blog Post, etc.)
- Responsive design (mobile + desktop)

---

### 6. Dashboard Calendar Widget

**Status:** ✅ Complete
**Location:** `app/dashboard/CalendarWidget.tsx`

**Features:**
- Replaces fake "Recent Activity" with real upcoming tasks
- Shows next 5 tasks (from upcoming 48 hours + incomplete)
- **Smart Alerts:**
  - Red pulsing dot for overdue incomplete tasks
  - Alert icon for tasks without linked content
  - "No content" badge for tasks past due with no session
- **Time Display:** Relative times (2h, Tomorrow, 3d, Overdue)
- **Task Metadata:** Shows platform and content type
- **Empty State:** CTA to create first task
- **Navigation:** Links to full calendar page

**Integration:**
- Added to `app/dashboard/page.tsx`
- Replaced fake activity section
- Added "Calendar" link to main navigation menu

---

### 7. Session Storage Migration

**Status:** ✅ Complete (Separate Feature)
**Migrated Apps:** All 6 apps now use Supabase

**Infrastructure:**
- Table: `bl_app_sessions`
- Service: `lib/session-service.ts`
- Client: `lib/session-client.ts`
- API: `app/api/sessions/route.ts`

**This provides the foundation for linking calendar tasks to created content.**

---

## 🚧 PENDING FEATURES (Phase 2)

### 8. App Integration - "Schedule This" Feature

**Status:** ❌ Not Started
**Priority:** HIGH

**Requirement:**
When users save content in any of the 6 apps, give them the option to "Schedule for Later" which creates a calendar task linked to that session.

**Apps to Update:**
1. **Banana Blitz** (`app/apps/banana-blitz/page.tsx`)
2. **Unravel** (`app/apps/unravel/page.tsx`)
3. **InsightLens** (`app/apps/insightlens/page.tsx`)
4. **PromptStash** (`app/apps/promptstash/page.tsx`)
5. **Component Studio** (`app/apps/component-studio/page.tsx`)
6. **Serendipity** (`app/apps/serendipity/components/WorkflowGenerator.tsx`)

**Implementation Pattern (for each app):**

```typescript
// After successful save, show modal or inline form:

import { createTask } from '@/lib/calendar-client';

// Option 1: Add checkbox during save
const [scheduleForLater, setScheduleForLater] = useState(false);
const [scheduledDate, setScheduledDate] = useState("");
const [scheduledPlatform, setScheduledPlatform] = useState("");

// Option 2: Add button after save completes
<button onClick={() => setShowScheduleModal(true)}>
  📅 Schedule This
</button>

// Create task with linked session
const handleSchedule = async () => {
  try {
    await createTask({
      title: "Post to LinkedIn: " + contentTitle,
      due_date: scheduledDate,
      platform: scheduledPlatform,
      content_type: "carousel", // Based on app
      linked_session_id: savedSessionId, // Link to the session just created
      status: "scheduled",
      app_needed: "banana-blitz", // Current app
    });
    alert("Scheduled successfully!");
  } catch (error) {
    alert("Failed to schedule");
  }
};
```

**UI Patterns:**

**Option A - Inline (Recommended):**
```tsx
{isSaved && (
  <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl">
    <p className="text-sm text-white mb-3">📅 Schedule this content?</p>
    <div className="flex gap-3">
      <input
        type="date"
        className="..."
        onChange={(e) => setScheduledDate(e.target.value)}
      />
      <select className="..." onChange={(e) => setPlatform(e.target.value)}>
        <option value="linkedin">LinkedIn</option>
        <option value="instagram">Instagram</option>
        <option value="twitter">Twitter</option>
      </select>
      <button onClick={handleSchedule} className="...">
        Schedule
      </button>
    </div>
  </div>
)}
```

**Option B - Modal:**
Create a shared component `components/ScheduleContentModal.tsx` that all apps can use.

**Success Criteria:**
- User can schedule content directly from app after saving
- Task is automatically linked to the saved session (`linked_session_id`)
- Platform and content type are pre-filled based on app context
- User only needs to select date and optionally adjust metadata

---

### 9. Real-Time Notification System

**Status:** ❌ Not Started
**Priority:** HIGH

**Requirement:**
Send browser notifications to users when:
1. Task is due in 1 hour
2. Task is due tomorrow (at 9am)
3. Task is overdue and has no linked content

**Implementation Approach:**

**Option A - Client-Side Polling (Simple):**
```typescript
// Create: app/hooks/useCalendarNotifications.ts

import { useEffect } from 'react';
import { getUpcomingTasks, getIncompleteTasks } from '@/lib/calendar-client';

export function useCalendarNotifications() {
  useEffect(() => {
    const checkNotifications = async () => {
      // Check every 5 minutes
      const upcoming = await getUpcomingTasks(1); // 1 hour ahead
      const incomplete = await getIncompleteTasks();

      // Request notification permission if needed
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      // Send notifications
      if (Notification.permission === 'granted') {
        upcoming.forEach(task => {
          if (!task.has_linked_session) {
            new Notification(`Task due soon: ${task.title}`, {
              body: `Due in less than 1 hour. No content created yet!`,
              icon: '/icon.png',
              tag: task.id, // Prevent duplicates
            });
          }
        });

        incomplete.forEach(task => {
          new Notification(`Overdue: ${task.title}`, {
            body: `This task is overdue and has no content.`,
            icon: '/icon.png',
            tag: task.id,
          });
        });
      }
    };

    // Check on mount and every 5 minutes
    checkNotifications();
    const interval = setInterval(checkNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
```

**Usage:**
Add to `app/dashboard/page.tsx` and `app/calendar/page.tsx`:
```typescript
import { useCalendarNotifications } from '@/hooks/useCalendarNotifications';

export default function DashboardPage() {
  useCalendarNotifications(); // Hook runs in background
  // ...
}
```

**Option B - Server-Side with Edge Functions (Advanced):**
- Create Supabase Edge Function that runs hourly
- Query tasks due in next hour or overdue
- Send web push notifications via service worker
- Requires more setup but scales better

**Recommendation:** Start with Option A (client-side polling), upgrade to Option B if needed.

---

### 10. AI Assistant Integration

**Status:** ❌ Not Started
**Priority:** MEDIUM

**Requirement:**
When user opens `/assistant`, the AI should proactively check calendar tasks and offer to help create missing content.

**Implementation:**

**Step 1: Update Assistant to Check Tasks**

Modify `app/assistant/page.tsx` to load tasks on mount:

```typescript
import { getUpcomingTasks, getIncompleteTasks } from '@/lib/calendar-client';

useEffect(() => {
  async function checkTasks() {
    const upcoming = await getUpcomingTasks(24); // Next 24 hours
    const incomplete = await getIncompleteTasks();

    if (incomplete.length > 0 || upcoming.length > 0) {
      // Add system message to assistant
      const taskSummary = generateTaskSummary(upcoming, incomplete);
      setMessages([
        {
          role: 'assistant',
          content: taskSummary
        }
      ]);
    }
  }
  checkTasks();
}, []);

function generateTaskSummary(upcoming, incomplete) {
  let summary = "📅 **Calendar Check:**\n\n";

  if (incomplete.length > 0) {
    summary += "⚠️ **Overdue Tasks:**\n";
    incomplete.forEach(task => {
      summary += `• ${task.title} (${task.platform}) - No content created yet\n`;
    });
  }

  if (upcoming.length > 0) {
    summary += "\n📌 **Upcoming Tasks:**\n";
    upcoming.forEach(task => {
      const hasContent = task.has_linked_session ? "✓" : "✗";
      summary += `• ${task.title} ${hasContent} - Due ${formatDate(task.due_date)}\n`;
    });
  }

  summary += "\nWould you like help creating content for any of these?";
  return summary;
}
```

**Step 2: Add Context to Assistant Prompts**

When user asks assistant for help, include calendar context:

```typescript
const systemPrompt = `
You are the Builder's Lab AI Assistant.

Current Calendar Context:
${JSON.stringify({
  upcomingTasks: upcoming,
  incompleteTasks: incomplete
})}

If the user mentions creating content, check if it matches any upcoming tasks. If so, suggest linking it to the calendar task.
`;
```

**Step 3: Add Quick Actions**

```tsx
{incomplete.length > 0 && (
  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
    <h3 className="text-white font-semibold mb-2">⚠️ Overdue Tasks</h3>
    {incomplete.map(task => (
      <div key={task.id} className="flex items-center justify-between mb-2">
        <span className="text-sm text-white">{task.title}</span>
        <button
          onClick={() => handleCreateContent(task)}
          className="px-3 py-1 bg-white text-black rounded-lg text-xs"
        >
          Create Now
        </button>
      </div>
    ))}
  </div>
)}
```

**Step 4: Create Content Helper**

```typescript
function handleCreateContent(task) {
  // Determine which app to use
  const appMap = {
    'image': '/apps/banana-blitz',
    'carousel': '/apps/banana-blitz',
    'blog_post': '/apps/unravel',
    'podcast': '/apps/insightlens',
    'social_post': '/apps/serendipity',
  };

  const appUrl = appMap[task.content_type] || '/apps';

  // Redirect with task context in URL params
  router.push(`${appUrl}?taskId=${task.id}&title=${encodeURIComponent(task.title)}`);
}
```

**Success Criteria:**
- Assistant shows calendar summary on load
- Users see which tasks need content
- Quick actions to create content for specific tasks
- Assistant can suggest which app to use based on content type

---

## 📊 TESTING REQUIREMENTS

### Before Deployment

**Database Migration:**
- [ ] Apply migration in Supabase Dashboard
- [ ] Verify RLS policies work (test with 2 different users)
- [ ] Verify helper functions return correct data
- [ ] Test cascade deletes (delete session should not break tasks)

**Calendar Page:**
- [ ] Create task manually
- [ ] Edit task
- [ ] Delete task with confirmation
- [ ] View calendar grid (all tasks appear on correct dates)
- [ ] View list (tasks sorted by due date)
- [ ] Navigate months forward/backward
- [ ] Test on mobile (responsive design)

**Dashboard Widget:**
- [ ] Shows upcoming tasks
- [ ] Shows incomplete tasks with red dot
- [ ] "No content" badge appears correctly
- [ ] Time display is accurate (2h, Tomorrow, 3d)
- [ ] Empty state shows when no tasks
- [ ] Link to calendar works

**App Integration (After Phase 2):**
- [ ] Schedule content from each of 6 apps
- [ ] Verify linked_session_id is set correctly
- [ ] Task appears in calendar with link to session
- [ ] Platform and content type are correct

**Notifications (After Phase 2):**
- [ ] Browser notification permission requested
- [ ] Notification appears 1 hour before due date
- [ ] Notification appears for overdue incomplete tasks
- [ ] No duplicate notifications
- [ ] Notifications can be clicked to open calendar

**AI Assistant (After Phase 2):**
- [ ] Assistant shows calendar summary on load
- [ ] Quick actions work (redirect to correct app)
- [ ] Task context passed in URL params
- [ ] After creating content, task is linked

---

## 🎯 ACCEPTANCE CRITERIA

### Phase 1 (Complete)
- [x] Users can create tasks with title, due date, platform, content type
- [x] Users can view tasks in calendar or list view
- [x] Users can edit and delete tasks
- [x] Dashboard shows upcoming tasks
- [x] Calendar navigation added to main menu
- [x] All data stored in Supabase with RLS

### Phase 2 (Pending)
- [ ] Users can schedule content directly from apps after saving
- [ ] Tasks are automatically linked to created sessions
- [ ] Users receive browser notifications for upcoming/overdue tasks
- [ ] AI assistant proactively suggests creating content for tasks
- [ ] Users can create content from assistant with one click

---

## 🔧 TECHNICAL NOTES

### Performance Considerations
- Calendar page loads tasks for current month only (not all tasks)
- Dashboard widget limits to 5 tasks
- Indexes on user_id + due_date ensure fast queries
- Client-side caching could be added if performance is an issue

### Security
- RLS ensures users only see their own tasks
- All API endpoints check authentication
- CSRF protection via Next.js built-in middleware

### Scalability
- Database functions (get_upcoming_tasks, get_incomplete_tasks) are efficient
- Pagination supported (limit/offset)
- JSONB metadata field allows flexible extension without schema changes

### Future Enhancements (Phase 3+)
- Recurring tasks (weekly, monthly)
- Task templates (save common task configurations)
- Team tasks (shared tasks with multiple users)
- Integration with external calendars (Google Calendar, Outlook)
- Task dependencies (Task B can't start until Task A is complete)
- Time tracking (how long did content take to create?)
- Analytics dashboard (tasks completed per week, most used platforms)

---

## 📁 FILE REFERENCE

### Database
- `supabase/migrations/20260107_create_calendar.sql` - Database schema

### Backend
- `lib/calendar-service.ts` - Service layer (CRUD operations)
- `lib/calendar-client.ts` - Client API wrapper
- `app/api/calendar/route.ts` - REST endpoint

### Frontend
- `app/calendar/page.tsx` - Full calendar page
- `app/dashboard/CalendarWidget.tsx` - Dashboard widget
- `app/dashboard/page.tsx` - Dashboard (includes widget)

### Related Systems
- `lib/session-service.ts` - Session storage (for linking tasks)
- `app/api/sessions/route.ts` - Session API (for linking tasks)

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deploy
- [x] All code committed to Git
- [x] Build passes without errors
- [ ] **Migration applied in Supabase Dashboard** (REQUIRED BEFORE USE)
- [ ] Environment variables verified

### Post-Deploy
- [ ] Test calendar page functionality
- [ ] Test dashboard widget displays correctly
- [ ] Verify navigation links work
- [ ] Test with multiple users (RLS isolation)
- [ ] Monitor error logs for issues

### Phase 2 Deploy
- [ ] App integration tested in all 6 apps
- [ ] Notification permission flow tested
- [ ] AI assistant integration tested
- [ ] Update user documentation

---

## 📚 USER DOCUMENTATION (To Be Created)

### Calendar Page Guide
- How to create a task
- Understanding task statuses
- Linking tasks to content
- Using calendar vs list view

### App Integration Guide
- How to schedule content from apps
- Viewing scheduled content in calendar
- Editing scheduled posts

### Notification Guide
- How to enable notifications
- Managing notification preferences
- Understanding notification types

### AI Assistant Guide
- How assistant checks calendar
- Creating content from assistant
- Linking content to tasks

---

## 🤝 HANDOFF TO GEMINI

**Current State:**
All Phase 1 infrastructure is complete and deployed. The system is ready to use once the database migration is applied in Supabase Dashboard.

**Your Tasks:**
1. **Immediate:** Apply `supabase/migrations/20260107_create_calendar.sql` in Supabase
2. **Phase 2a:** Implement "Schedule This" feature in all 6 apps (see Section 8)
3. **Phase 2b:** Implement real-time notifications (see Section 9)
4. **Phase 2c:** Integrate AI assistant with calendar (see Section 10)

**Code Patterns:**
- Follow existing patterns in `lib/session-client.ts` and `lib/session-service.ts`
- Use same error handling approach as session API
- Match UI styling from existing calendar page and dashboard widget
- All client components use `"use client"` directive

**Questions to Ask:**
- Which notification approach? (Client polling vs Server edge functions)
- Should scheduling be modal or inline in apps?
- How prominent should AI assistant calendar check be?

**Ready to Start:** All infrastructure is in place. You can begin Phase 2 implementation immediately after applying the database migration.
