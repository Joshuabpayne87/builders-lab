import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get funnel details with auth check
    const { data: funnel, error: funnelError } = await supabase
      .from('bl_funnels_projects')
      .select('id, name, view_count, submission_count, created_at, updated_at, last_viewed_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (funnelError || !funnel) {
      return NextResponse.json(
        { error: 'Funnel not found' },
        { status: 404 }
      );
    }

    // Get recent leads (last 5)
    const { data: recentLeads } = await supabase
      .from('bl_funnels_leads')
      .select('id, created_at')
      .eq('funnel_id', id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate conversion rate
    const viewCount = funnel.view_count || 0;
    const submissionCount = funnel.submission_count || 0;
    const conversionRate = viewCount > 0 ? ((submissionCount / viewCount) * 100).toFixed(2) : '0.00';

    // Get the last lead info
    const lastLead = recentLeads && recentLeads.length > 0 ? recentLeads[0] : null;

    return NextResponse.json({
      success: true,
      analytics: {
        funnel: {
          id: funnel.id,
          name: funnel.name,
          createdAt: funnel.created_at,
          updatedAt: funnel.updated_at,
          lastViewedAt: funnel.last_viewed_at,
        },
        stats: {
          views: viewCount,
          leads: submissionCount,
          conversionRate: `${conversionRate}%`,
          lastLead: lastLead ? lastLead.created_at : null,
        },
        recentLeads: (recentLeads || []).map((lead) => ({
          id: lead.id,
          createdAt: lead.created_at,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', success: false },
      { status: 500 }
    );
  }
}
