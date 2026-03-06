interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email using Resend
 * Requires RESEND_API_KEY environment variable
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // If no API key, silently fail (allows app to work without email service)
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured - skipping email');
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@thebuilders.lab',
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Email send failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

/**
 * Send a new lead notification email
 */
export async function sendLeadNotificationEmail(
  userEmail: string,
  funnelName: string,
  contactName: string,
  contactEmail: string,
  funnelId: string
): Promise<boolean> {
  const subject = `🎉 New Lead Captured - ${funnelName}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 30px; color: white; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎉 New Lead Captured!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">From <strong>${funnelName}</strong></p>
      </div>

      <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin-top: 20px;">
        <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #1a1a1a;">Lead Details</h2>

        <div style="background: white; border-radius: 6px; padding: 16px; margin-bottom: 16px; border: 1px solid #e0e0e0;">
          <p style="margin: 0 0 8px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Name</p>
          <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">${contactName}</p>
        </div>

        <div style="background: white; border-radius: 6px; padding: 16px; border: 1px solid #e0e0e0;">
          <p style="margin: 0 0 8px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
          <p style="margin: 0; color: #1a1a1a; font-size: 16px;">
            <a href="mailto:${contactEmail}" style="color: #667eea; text-decoration: none;">${contactEmail}</a>
          </p>
        </div>
      </div>

      <div style="margin-top: 24px;">
        <a href="https://thebuilders.lab/apps/crm?funnel=${funnelId}"
           style="display: inline-block; background: #667eea; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
          View in CRM
        </a>
      </div>

      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e0e0e0; text-align: center;">
        <p style="margin: 0; color: #999; font-size: 13px;">
          You received this email because a lead was captured through your funnel at The Builder's Lab.
        </p>
        <p style="margin: 8px 0 0 0; color: #999; font-size: 13px;">
          <a href="https://thebuilders.lab/settings" style="color: #667eea; text-decoration: none;">Manage email preferences</a>
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject,
    html,
  });
}
