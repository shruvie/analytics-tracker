import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { classifySource } from '@/lib/classification';

export async function POST(request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not configured' }, { status: 500, headers: getCorsHeaders() });
    }

    const body = await request.json();
    const {
      visitor_id,
      session_id,
      event_type, // 'pageview' or custom events
      page_url,
      page_path,
      referrer = '',
      utms = {}, // { utm_source, utm_medium, utm_campaign, utm_term, utm_content }
      device = 'Desktop',
      browser = 'Unknown',
      operating_system = 'Unknown',
    } = body;

    if (!visitor_id || !session_id || !event_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: getCorsHeaders() });
    }

    const classification = classifySource(referrer, utms);

    // 1. Upsert Visitor
    // Instead of raw ON CONFLICT DO UPDATE we can use supabase upsert if visitor_id is a UNIQUE constraint.
    const { error: visitorError } = await supabase
      .from('visitors')
      .upsert({
        visitor_id,
        last_seen_at: new Date().toISOString(),
      }, { onConflict: 'visitor_id' });

    if (visitorError) {
      console.error('Visitor error:', visitorError);
    }

    // 2. Upsert Session
    // We update last_seen_at. If it's new, it creates it with the landing_page details.
    const { data: existingSession } = await supabase
      .from('sessions')
      .select('id')
      .eq('session_id', session_id)
      .single();

    if (!existingSession) {
      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          session_id,
          visitor_id,
          started_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          landing_page: page_path,
          referrer,
          source: classification.source,
          medium: classification.medium,
          campaign: utms.utm_campaign || null,
          device,
          browser,
          operating_system,
        });
      if (sessionError) console.error('Session error:', sessionError);
    } else {
      await supabase
        .from('sessions')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('session_id', session_id);
    }

    // 3. Insert Event
    const { error: eventError } = await supabase
      .from('events')
      .insert({
        visitor_id,
        session_id,
        event_type,
        page_url,
        page_path,
        referrer,
        utm_source: utms.utm_source || null,
        utm_medium: utms.utm_medium || null,
        utm_campaign: utms.utm_campaign || null,
        utm_term: utms.utm_term || null,
        utm_content: utms.utm_content || null,
        source: classification.source,
        medium: classification.medium,
        channel: classification.channel,
        device,
        browser,
        operating_system,
        created_at: new Date().toISOString(),
      });

    if (eventError) {
      console.error('Event insert error:', eventError);
      return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
    }

    return NextResponse.json({ success: true, classification }, { headers: getCorsHeaders() });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: getCorsHeaders() });
  }
}

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(),
  });
}
