import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/gemini";

/**
 * POST /api/powerups/upload-skill
 * Allows users to upload their own skill markdown files
 *
 * Body:
 * - fileName: string (e.g., "my-skill.md")
 * - content: string (markdown content)
 * - skillName: string (parsed from filename or provided)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, content, skillName } = body;

    // Validate inputs
    if (!fileName || !content) {
      return NextResponse.json(
        { success: false, error: 'fileName and content are required' },
        { status: 400 }
      );
    }

    if (!fileName.endsWith('.md')) {
      return NextResponse.json(
        { success: false, error: 'Only .md files are supported' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse skill content
    // Extract description from content (first paragraph or heading)
    const lines = content.trim().split('\n');
    let description = '';
    let instructions = content;

    // Try to extract a description from the first few lines
    for (const line of lines.slice(0, 5)) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
        description = trimmed;
        break;
      }
    }

    // If no description found, use a default
    if (!description) {
      description = `Custom skill: ${skillName}`;
    }

    // Truncate description to 200 chars
    if (description.length > 200) {
      description = description.substring(0, 197) + '...';
    }

    // Create skill content object
    const skillContent = {
      instructions: content,
      examples: [],
      use_cases: []
    };

    // Generate embedding for semantic search
    const textForEmbedding = `${skillName} ${description} ${content.substring(0, 1000)}`;
    const embedding = await generateEmbedding(textForEmbedding);

    // Determine category based on content keywords
    const lowerContent = content.toLowerCase();
    let category: 'development' | 'research' | 'copywriting' | 'analysis' | 'custom' = 'custom';

    if (lowerContent.includes('code') || lowerContent.includes('debug') || lowerContent.includes('test')) {
      category = 'development';
    } else if (lowerContent.includes('research') || lowerContent.includes('analyze')) {
      category = 'research';
    } else if (lowerContent.includes('write') || lowerContent.includes('copy')) {
      category = 'copywriting';
    } else if (lowerContent.includes('analyz') || lowerContent.includes('data')) {
      category = 'analysis';
    }

    // Insert into database
    const { data, error } = await supabase
      .from('bl_ai_powerups')
      .insert({
        powerup_type: 'SKILL',
        name: skillName,
        description: description,
        icon: '📄', // Default icon for user-uploaded skills
        category: category,
        content: skillContent,
        embedding,
        tags: ['user-uploaded', fileName.replace('.md', '')],
        is_active: true,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      powerup: data,
      message: `Skill "${skillName}" uploaded successfully`
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/powerups/upload-skill error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload skill' },
      { status: 500 }
    );
  }
}
