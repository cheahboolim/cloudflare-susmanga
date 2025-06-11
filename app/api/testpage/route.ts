export const runtime = 'edge';

// app/api/testpage/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { load } from 'cheerio';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');
  const pageId = searchParams.get('pageId');
  if (!postId || !pageId) {
    return NextResponse.json(
      { success: false, message: 'Missing postId or pageId' },
      { status: 400 }
    );
  }

  try {
    // 1) Fetch the reader page HTML
    const url = `https://nhentai.net/g/${postId}/${pageId}/`;
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const $ = load(html);

    // 2) Extract the image URL in the reader
    //    <section id="image-container"><a ...><img src="..." /></a></section>
    const img = $('#image-container img').first().attr('src') || '';

    if (!img) {
      throw new Error('Image not found on page');
    }

    // 3) Return structured JSON
    return NextResponse.json({
      success: true,
      postId,
      pageId,
      imageUrl: img,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
