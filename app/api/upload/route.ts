import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    const fileName = `license-${Date.now()}.pdf`;
    const { data, error } = await supabaseService.storage
      .from('licenses')
      .upload(fileName, file, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const url = supabaseService.storage.from('licenses').getPublicUrl(data.path).data.publicUrl;
    return NextResponse.json({ url });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}