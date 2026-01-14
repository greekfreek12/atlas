import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { normalizePhoneNumber } from '@/lib/textgrid';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    const { data: phoneNumbers, error } = await supabase
      .from('sms_phone_numbers')
      .select('*')
      .order('state', { ascending: true });

    if (error) {
      console.error('Error fetching phone numbers:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(phoneNumbers || []);
  } catch (error) {
    console.error('Phone numbers API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phone numbers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone_number, state, area_code, friendly_name } = body;

    if (!phone_number || !state) {
      return NextResponse.json(
        { error: 'phone_number and state are required' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    // Normalize and extract area code
    const normalizedPhone = normalizePhoneNumber(phone_number);
    const extractedAreaCode = area_code || normalizedPhone.slice(2, 5); // After +1

    const { data: phoneNumber, error } = await supabase
      .from('sms_phone_numbers')
      .insert({
        phone_number: normalizedPhone,
        state: state.toUpperCase(),
        area_code: extractedAreaCode,
        friendly_name: friendly_name || `${state} Line`,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding phone number:', error);
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This phone number already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(phoneNumber);
  } catch (error) {
    console.error('Phone number add error:', error);
    return NextResponse.json(
      { error: 'Failed to add phone number' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, friendly_name, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Phone number ID is required' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    const updateData: Record<string, unknown> = {};
    if (friendly_name !== undefined) updateData.friendly_name = friendly_name;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: phoneNumber, error } = await supabase
      .from('sms_phone_numbers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating phone number:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(phoneNumber);
  } catch (error) {
    console.error('Phone number update error:', error);
    return NextResponse.json(
      { error: 'Failed to update phone number' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Phone number ID is required' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerClient() as any;

    const { error } = await supabase
      .from('sms_phone_numbers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting phone number:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Phone number delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete phone number' },
      { status: 500 }
    );
  }
}
