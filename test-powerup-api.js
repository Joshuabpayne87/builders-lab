/**
 * Test script for Powerup API
 *
 * Prerequisites:
 * 1. Run the migration: supabase/migrations/20260108_create_ai_powerups.sql
 *    - Copy the SQL to Supabase dashboard SQL editor and execute
 * 2. Make sure you're logged in as an admin user
 * 3. Run: node test-powerup-api.js
 */

const BASE_URL = 'http://localhost:3000';

// Sample powerup data
const samplePowerups = {
  skill: {
    powerup_type: 'SKILL',
    name: 'SEO Optimization Expert',
    description: 'Advanced SEO strategies for content optimization and ranking',
    icon: '🔍',
    category: 'marketing',
    content: {
      instructions: `You are an SEO expert with deep knowledge of search engine algorithms, keyword research, and content optimization strategies. When helping with SEO:

1. Analyze content for keyword density and relevance
2. Suggest meta descriptions and title tags
3. Recommend internal/external linking strategies
4. Optimize for featured snippets and rich results
5. Consider user intent and search behavior
6. Focus on E-A-T (Expertise, Authoritativeness, Trustworthiness)`,
      examples: [
        'Optimize this blog post for the keyword "AI productivity tools"',
        'Create a meta description for an article about remote work',
        'Suggest internal linking opportunities for our content cluster on marketing automation'
      ],
      use_cases: [
        'Blog post optimization',
        'Product page SEO',
        'Content cluster strategy',
        'Technical SEO audit'
      ]
    },
    tags: ['seo', 'marketing', 'content', 'optimization']
  },

  persona: {
    powerup_type: 'PERSONA',
    name: 'Professional Marketing Consultant',
    description: 'Experienced B2B marketing strategist with agency background',
    icon: '🎯',
    category: 'marketing',
    content: {
      role: 'Senior Marketing Consultant',
      tone: 'Professional yet approachable. Uses clear, actionable language. Backs recommendations with data and industry best practices.',
      expertise: [
        'B2B Marketing Strategy',
        'Content Marketing',
        'Lead Generation',
        'Marketing Automation',
        'Analytics & Reporting'
      ],
      system_prompt: `You are a seasoned marketing consultant with 10+ years of experience helping B2B companies grow. You communicate in a professional yet friendly manner, always focusing on practical, results-driven advice.

Your approach:
- Ask clarifying questions to understand business context
- Provide specific, actionable recommendations
- Reference industry benchmarks and best practices
- Consider budget constraints and resource availability
- Think holistically about marketing strategy

You avoid:
- Vague, generic advice
- Overpromising results
- Pushing specific tools without context
- Marketing jargon without explanation`
    },
    tags: ['persona', 'marketing', 'consultant', 'b2b']
  },

  knowledge: {
    powerup_type: 'KNOWLEDGE',
    name: 'Company Brand Guidelines',
    description: 'Official brand voice, tone, and messaging guidelines',
    icon: '📘',
    category: 'copywriting',
    content: {
      file_url: '', // Would be populated after file upload
      file_type: 'txt',
      file_size: 0,
      processed_text: `BRAND VOICE GUIDELINES - The Builder's Lab

Brand Personality: Innovative, Empowering, Professional with a Human Touch

Voice Attributes:
- Innovative: We're at the cutting edge of AI-powered productivity
- Empowering: We help creators and builders achieve more
- Accessible: Complex tech made simple and approachable
- Human: Technology should feel personal, not robotic

Tone Guidelines:
✓ DO: Use active voice, be direct and clear
✓ DO: Celebrate user achievements and creativity
✓ DO: Explain AI capabilities in simple terms
✓ DON'T: Use overly technical jargon
✓ DON'T: Make unrealistic promises
✓ DON'T: Sound corporate or stuffy

Key Messages:
1. "Build more, stress less" - Our tools amplify your creativity
2. "Your AI-powered creative partner" - We're here to assist, not replace
3. "From idea to execution in minutes" - Speed meets quality

Writing Style:
- Sentence length: Mix short (10-15 words) and medium (15-25 words)
- Paragraph length: 2-4 sentences max
- Use contractions naturally (we're, you'll, it's)
- Address users as "you" - make it personal
- Lead with benefits, not features

Example Good Copy:
"Transform your ideas into polished content in minutes. Our AI tools handle the heavy lifting while you focus on what matters - your creativity."

Example Bad Copy:
"Leverage our advanced AI algorithms to facilitate streamlined content generation workflows."`,
      chunks: [
        {
          text: 'BRAND VOICE GUIDELINES - The Builder\'s Lab...',
          index: 0
        }
      ]
    },
    tags: ['brand', 'guidelines', 'copywriting', 'voice']
  }
};

// Test functions
async function testCreatePowerup(powerupData) {
  console.log(`\n📝 Creating ${powerupData.powerup_type} powerup: "${powerupData.name}"`);

  try {
    const response = await fetch(`${BASE_URL}/api/powerups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(powerupData)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Created successfully!');
      console.log(`   ID: ${data.powerup.id}`);
      console.log(`   Category: ${data.powerup.category}`);
      return data.powerup;
    } else {
      console.error('❌ Failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function testListPowerups(filters = {}) {
  console.log('\n📋 Listing powerups...');

  const params = new URLSearchParams(filters);

  try {
    const response = await fetch(`${BASE_URL}/api/powerups?${params}`);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Found ${data.count} powerups`);
      data.powerups.forEach(p => {
        console.log(`   - ${p.icon || '⚡'} ${p.name} (${p.powerup_type})`);
      });
      return data.powerups;
    } else {
      console.error('❌ Failed:', data.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  }
}

async function testCreateLoadout(name, powerupIds = []) {
  console.log(`\n💼 Creating loadout: "${name}"`);

  try {
    const response = await fetch(`${BASE_URL}/api/powerups/loadouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create',
        name,
        is_default: true,
        equipped_powerups: powerupIds,
        slot_config: {}
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Loadout created!');
      console.log(`   ID: ${data.loadout.id}`);
      console.log(`   Is Default: ${data.loadout.is_default}`);
      return data.loadout;
    } else {
      console.error('❌ Failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function testEquipPowerup(loadoutId, powerupId, slot) {
  console.log(`\n🔧 Equipping powerup to ${slot} slot...`);

  try {
    const response = await fetch(`${BASE_URL}/api/powerups/loadouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'equip',
        loadout_id: loadoutId,
        powerup_id: powerupId,
        slot
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Equipped successfully!');
      console.log(`   Slot Config:`, data.loadout.slot_config);
      return data.loadout;
    } else {
      console.error('❌ Failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function testSessionOverride(sessionId, powerupIds) {
  console.log(`\n⚡ Creating session override...`);

  try {
    const response = await fetch(`${BASE_URL}/api/powerups/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'set',
        session_id: sessionId,
        equipped_powerups: powerupIds,
        slot_config: {
          marketing: powerupIds[0]
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Session override created!');
      console.log(`   Session ID: ${data.override.session_id}`);
      console.log(`   Expires: ${data.override.expires_at}`);
      return data.override;
    } else {
      console.error('❌ Failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Main test sequence
async function runTests() {
  console.log('🚀 Starting Powerup API Tests');
  console.log('=' .repeat(50));

  // Step 1: Create sample powerups
  console.log('\n📦 STEP 1: Creating Sample Powerups');
  const skill = await testCreatePowerup(samplePowerups.skill);
  const persona = await testCreatePowerup(samplePowerups.persona);
  const knowledge = await testCreatePowerup(samplePowerups.knowledge);

  if (!skill || !persona || !knowledge) {
    console.log('\n⚠️  Some powerups failed to create. Check your auth and migration.');
    return;
  }

  // Step 2: List all powerups
  console.log('\n📦 STEP 2: Listing All Powerups');
  await testListPowerups();

  // Step 3: Filter by type
  console.log('\n📦 STEP 3: Filtering by Type (SKILL)');
  await testListPowerups({ type: 'SKILL' });

  // Step 4: Create a loadout
  console.log('\n📦 STEP 4: Creating Default Loadout');
  const loadout = await testCreateLoadout('Marketing Pro', [skill.id, persona.id]);

  if (!loadout) {
    console.log('\n⚠️  Loadout creation failed.');
    return;
  }

  // Step 5: Equip powerups to slots
  console.log('\n📦 STEP 5: Equipping Powerups to Slots');
  await testEquipPowerup(loadout.id, skill.id, 'marketing');
  await testEquipPowerup(loadout.id, persona.id, 'copywriter');
  await testEquipPowerup(loadout.id, knowledge.id, 'brain');

  // Step 6: Test session override
  console.log('\n📦 STEP 6: Testing Session Override');
  const sessionId = crypto.randomUUID();
  await testSessionOverride(sessionId, [skill.id]);

  console.log('\n' + '='.repeat(50));
  console.log('✨ All tests completed!');
  console.log('\nNext steps:');
  console.log('1. Check Supabase dashboard to verify data');
  console.log('2. Test the Brain Canvas UI');
  console.log('3. Integrate with AI Assistant');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, samplePowerups };
