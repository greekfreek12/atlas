import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessId, name, phone, email, message } = body;

    if (!businessId || !name || !phone || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { error } = await supabase.from('form_submissions').insert({
      business_id: businessId,
      name,
      phone,
      email: email || null,
      message,
    } as any);

    if (error) {
      console.error('Error saving form submission:', error);
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    // TODO: Send email notification (Resend, SendGrid, etc.)
    console.log(`New form submission for business ${businessId}:`, { name, phone, message });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
