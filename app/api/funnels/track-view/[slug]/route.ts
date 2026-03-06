import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const supabase = await createClient();

    // Get funnel by slug
    const { data: funnel } = await supabase
      .from('bl_funnels_projects')
      .select('id')
      .eq('domain_slug', slug)
      .eq('status', 'published')
      .single();

    if (!funnel) {
      return NextResponse.json(
        { error: 'Funnel not found' },
        { status: 404 }
      );
    }

    // Increment view count using the function we created
    await supabase.rpc('increment_funnel_views', {
      funnel_id: funnel.id
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking funnel view:', error);
    // Don't error out - view tracking is non-critical
    return NextResponse.json({ success: true });
  }
}
