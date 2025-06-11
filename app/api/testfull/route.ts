export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { load } from 'cheerio';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 });
  }

  try {
    // 1) Fetch the gallery page HTML
    const { data: html } = await axios.get(`https://nhentai.net/g/${id}/`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const $ = load(html);

    // 2) Scrape basic info
    const title = $('h1.title span.pretty, h2.title span.pretty')
      .first()
      .text()
      .trim();
    const featureImage =
      $('#cover img').attr('data-src') || $('#cover img').attr('src') || '';
    const totalPages = $('#thumbnail-container .thumb-container').length;

    // 3) Scrape each metadata block (tags, parodies, etc.)
    const out: Record<string, string[]> = {
      tags: [],
      parodies: [],
      characters: [],
      artists: [],
      languages: [],
      categories: [],
    };

    $('#tags .tag-container').each((_, container) => {
      const $c = $(container);
      // clone & remove child tags to leave only the label text
      const labelRaw = $c
        .clone()
        .children()
        .remove()
        .end()
        .text()
        .trim()
        .replace(':', '')
        .toLowerCase();
      // now gather all <a class="tag"><span class="name">…</span>
      $c.find('a.tag .name').each((_, el) => {
        const name = $(el).text().trim();
        if (name && out[labelRaw]) {
          out[labelRaw].push(name);
        }
      });
    });

    // 4) Return structured JSON
    return NextResponse.json({
      success: true,
      title,
      featureImage,
      totalPages,
      tags: out.tags,
      parodies: out.parodies,
      characters: out.characters,
      artists: out.artists,
      languages: out.languages,
      categories: out.categories,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
