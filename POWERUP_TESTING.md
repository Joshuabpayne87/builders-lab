# AI Powerup API Testing Guide

## Prerequisites

### 1. Run the Database Migration

Before testing, you need to create the database tables. Open the Supabase dashboard and run the migration:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20260108_create_ai_powerups.sql`
4. Paste and execute the SQL

This will create:
- ✅ `bl_ai_powerups` table (global powerup library)
- ✅ `bl_ai_loadouts` table (user saved configurations)
- ✅ `bl_ai_session_overrides` table (temporary session state)
- ✅ `bl_ai_powerup_analytics` table (usage tracking)
- ✅ `ai-powerup-files` storage bucket (for knowledge files)
- ✅ All RLS policies and indexes

### 2. Ensure Admin Access

Make sure you're logged in as an admin user. The test script creates powerups, which requires admin permissions.

To set yourself as admin (if not already):
1. Get your user ID from Supabase Auth
2. Run: `UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}' WHERE id = 'YOUR_USER_ID';`

Or use the existing `/api/admin/set-admin` endpoint.

---

## Testing Methods

### Option 1: Automated Test Script (Recommended)

Run the comprehensive test script that creates sample data and tests all endpoints:

```bash
# Make sure dev server is running
npm run dev

# In another terminal, run the test script
node test-powerup-api.js
```

This will:
1. ✅ Create 3 sample powerups (SKILL, PERSONA, KNOWLEDGE)
2. ✅ List all powerups
3. ✅ Filter powerups by type
4. ✅ Create a default loadout
5. ✅ Equip powerups to slots
6. ✅ Create a session override

### Option 2: Manual API Testing with cURL

#### Create a SKILL powerup:
```bash
curl -X POST http://localhost:3000/api/powerups \
  -H "Content-Type: application/json" \
  -d '{
    "powerup_type": "SKILL",
    "name": "SEO Optimization Expert",
    "description": "Advanced SEO strategies for content optimization",
    "icon": "🔍",
    "category": "marketing",
    "content": {
      "instructions": "You are an SEO expert...",
      "examples": ["Optimize this blog post..."],
      "use_cases": ["Blog post optimization"]
    },
    "tags": ["seo", "marketing"]
  }'
```

#### List all powerups:
```bash
curl http://localhost:3000/api/powerups
```

#### Filter by type:
```bash
curl "http://localhost:3000/api/powerups?type=SKILL&category=marketing"
```

#### Create a loadout:
```bash
curl -X POST http://localhost:3000/api/powerups/loadouts \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "name": "Marketing Pro",
    "is_default": true
  }'
```

#### Equip a powerup to a slot:
```bash
curl -X POST http://localhost:3000/api/powerups/loadouts \
  -H "Content-Type: application/json" \
  -d '{
    "action": "equip",
    "loadout_id": "LOADOUT_ID_HERE",
    "powerup_id": "POWERUP_ID_HERE",
    "slot": "marketing"
  }'
```

### Option 3: Browser DevTools

1. Open your browser to `http://localhost:3000`
2. Log in as admin
3. Open DevTools Console (F12)
4. Paste and run:

```javascript
// Create a skill powerup
const skill = await fetch('/api/powerups', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    powerup_type: 'SKILL',
    name: 'SEO Expert',
    description: 'SEO optimization specialist',
    icon: '🔍',
    category: 'marketing',
    content: {
      instructions: 'You are an SEO expert with deep knowledge...',
      examples: ['Optimize blog posts', 'Create meta descriptions'],
      use_cases: ['Content optimization', 'Keyword research']
    },
    tags: ['seo', 'marketing']
  })
}).then(r => r.json());

console.log('Created:', skill);

// List all powerups
const powerups = await fetch('/api/powerups').then(r => r.json());
console.log('All powerups:', powerups);
```

---

## Sample Data Structure

### SKILL Powerup
```json
{
  "powerup_type": "SKILL",
  "name": "SEO Optimization Expert",
  "description": "Advanced SEO strategies",
  "icon": "🔍",
  "category": "marketing",
  "content": {
    "instructions": "Detailed instructions...",
    "examples": ["Example 1", "Example 2"],
    "use_cases": ["Use case 1", "Use case 2"]
  },
  "tags": ["seo", "marketing"]
}
```

### PERSONA Powerup
```json
{
  "powerup_type": "PERSONA",
  "name": "Professional Marketing Consultant",
  "description": "B2B marketing strategist",
  "icon": "🎯",
  "category": "marketing",
  "content": {
    "role": "Senior Marketing Consultant",
    "tone": "Professional yet approachable",
    "expertise": ["B2B Marketing", "Content Marketing"],
    "system_prompt": "You are a seasoned marketing consultant..."
  },
  "tags": ["persona", "marketing"]
}
```

### KNOWLEDGE Powerup
```json
{
  "powerup_type": "KNOWLEDGE",
  "name": "Brand Guidelines",
  "description": "Official brand voice and messaging",
  "icon": "📘",
  "category": "copywriting",
  "content": {
    "file_url": "",
    "file_type": "txt",
    "file_size": 1234,
    "processed_text": "Full text content...",
    "chunks": [{"text": "...", "index": 0}]
  },
  "tags": ["brand", "guidelines"]
}
```

---

## Verification Checklist

After running tests, verify in Supabase dashboard:

### Tables
- [ ] `bl_ai_powerups` has 3 rows (skill, persona, knowledge)
- [ ] `bl_ai_loadouts` has 1 row (default loadout)
- [ ] `bl_ai_session_overrides` has 1 row (session override)
- [ ] All powerups have `is_active = true`
- [ ] Loadout has `is_default = true`
- [ ] Session override `expires_at` is 24 hours from creation

### Data Quality
- [ ] Powerup embeddings are populated (768-dimensional vectors)
- [ ] Slot config in loadout shows equipped powerups
- [ ] Tags are arrays, not empty
- [ ] All `user_id` fields match your user ID

### RLS Policies
- [ ] Non-admin users can read powerups but not create
- [ ] Users can only see their own loadouts
- [ ] Users can only manage their own session overrides

---

## Troubleshooting

### Error: "Unauthorized"
- Make sure you're logged in
- Check that your session is valid

### Error: "Admin access required"
- Verify your user has `role: 'admin'` in `user_metadata`
- Run the admin setup endpoint first

### Error: "relation does not exist"
- The migration hasn't been run
- Go to Supabase SQL Editor and run the migration

### Error: "function match_powerups does not exist"
- This is expected - semantic search fallback will work
- The function can be added later if needed

---

## Next Steps

Once API testing is successful:

1. ✅ **Phase 2**: Build admin interface (`/admin/powerups`)
2. ✅ **Phase 3**: Build user Brain Canvas interface (`/powerups`)
3. ✅ **Phase 4**: Add neural network visuals
4. ✅ **Phase 5**: Integrate with AI Assistant
5. ✅ **Phase 6**: Polish and optimize

---

## Sample Test Output

Expected output from `node test-powerup-api.js`:

```
🚀 Starting Powerup API Tests
==================================================

📦 STEP 1: Creating Sample Powerups

📝 Creating SKILL powerup: "SEO Optimization Expert"
✅ Created successfully!
   ID: f47ac10b-58cc-4372-a567-0e02b2c3d479
   Category: marketing

📝 Creating PERSONA powerup: "Professional Marketing Consultant"
✅ Created successfully!
   ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
   Category: marketing

📝 Creating KNOWLEDGE powerup: "Company Brand Guidelines"
✅ Created successfully!
   ID: 12345678-90ab-cdef-1234-567890abcdef
   Category: copywriting

📦 STEP 2: Listing All Powerups

📋 Listing powerups...
✅ Found 3 powerups
   - 🔍 SEO Optimization Expert (SKILL)
   - 🎯 Professional Marketing Consultant (PERSONA)
   - 📘 Company Brand Guidelines (KNOWLEDGE)

📦 STEP 3: Filtering by Type (SKILL)

📋 Listing powerups...
✅ Found 1 powerups
   - 🔍 SEO Optimization Expert (SKILL)

📦 STEP 4: Creating Default Loadout

💼 Creating loadout: "Marketing Pro"
✅ Loadout created!
   ID: abc123-def456-789012-345678
   Is Default: true

📦 STEP 5: Equipping Powerups to Slots

🔧 Equipping powerup to marketing slot...
✅ Equipped successfully!
   Slot Config: { marketing: 'f47ac10b-...' }

🔧 Equipping powerup to copywriter slot...
✅ Equipped successfully!
   Slot Config: { marketing: '...', copywriter: 'a1b2c3d4-...' }

🔧 Equipping powerup to brain slot...
✅ Equipped successfully!
   Slot Config: { marketing: '...', copywriter: '...', brain: ['12345678-...'] }

📦 STEP 6: Testing Session Override

⚡ Creating session override...
✅ Session override created!
   Session ID: 9f8e7d6c-5b4a-3210-fedc-ba9876543210
   Expires: 2026-01-09T12:34:56.789Z

==================================================
✨ All tests completed!

Next steps:
1. Check Supabase dashboard to verify data
2. Test the Brain Canvas UI
3. Integrate with AI Assistant
```
