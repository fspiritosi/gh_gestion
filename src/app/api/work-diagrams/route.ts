import { supabaseServer } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
export async function GET(request: NextRequest) {
  const supabase = supabaseServer();
  //   const searchParams = request.nextUrl.searchParams;
  //   const company_id = searchParams.get('actual');
  //   const user_id = searchParams.get('user');

  try {
    let { data: diagrams, error } = await supabase.from('work-diagram').select('*');

    if (error) {
      throw new Error(JSON.stringify(error));
    }
    return Response.json({ diagrams });
  } catch (error) {
    console.log(error);
  }
}

export async function POST(request: NextRequest) {
  const supabase = supabaseServer();
  const body = await request.json();
  const { name, active_working_days, inactive_working_days } = body;
  try {
    let { data: diagram, error } = await supabase
      .from('work-diagram')
      .insert([{ name, active_working_days, inactive_working_days }])
      .single();

    if (error) {
      throw new Error(JSON.stringify(error));
    }
    return Response.json({ diagram });
  } catch (error) {
    console.log(error);
  }
}

export async function PUT(request: NextRequest) {
  const supabase = supabaseServer();
  const id = request.nextUrl.searchParams.get('id');
  const body = await request.json();
  const { name, active_working_days, inactive_working_days, is_active } = body;
  try {
    let { data: diagram, error } = await supabase
      .from('work-diagram')
      .update({ name, active_working_days, inactive_working_days, is_active })
      .eq('id', id || '')
      .single();

    if (error) {
      throw new Error(JSON.stringify(error));
    }
    return Response.json({ diagram });
  } catch (error) {
    console.log(error);
  }
}
