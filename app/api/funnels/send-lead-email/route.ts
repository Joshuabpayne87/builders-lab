import { sendLeadNotificationEmail } from '@/lib/email-service';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userEmail, funnelName, contactName, contactEmail, funnelId } = body;

    // Validate required fields
    if (!userEmail || !funnelName || !contactName || !contactEmail || !funnelId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send the email
    const success = await sendLeadNotificationEmail(
      userEmail,
      funnelName,
      contactName,
      contactEmail,
      funnelId
    );

    return NextResponse.json({
      success,
      message: success
        ? 'Email sent successfully'
        : 'Failed to send email (service may not be configured)',
    });
  } catch (error) {
    console.error('Lead email error:', error);
    return NextResponse.json(
      { error: 'Failed to process email request' },
      { status: 500 }
    );
  }
}
