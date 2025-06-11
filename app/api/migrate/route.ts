export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { load } from 'cheerio';
import { createClient } from '@/utils/supabase/server';

type MetaLists = {
  parodies: string[];
  characters: string[];
  tags: string[];
  artists: string[];
  languages: string[];
  categories: string[];
};

type Metadata = MetaLists & {
  title: string;
  featureImageSrc: string;
  totalPages: number;
};

async function scrapeMetadata(id: number): Promise<Metadata> {
  const url = `https://nhentai.net/g/${id}/`;
  const html = await axios
    .get<string>(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    .then(r => r.data);

  const $ = load(html);
  const title = $('h1.title span.pretty, h2.title span.pretty')
    .first()
    .text()
    .trim();

  const featureImageSrc =
    $('#cover img').attr('data-src') || $('#cover img').attr('src') || '';
  if (!featureImageSrc) {
    throw new Error(`Feature image not found for ID ${id}`);
  }

  // initialize all six lists
  const meta: Metadata = {
    title,
    featureImageSrc,
    totalPages: $('#thumbnail-container .thumb-container').length,
    parodies: [],
    characters: [],
    tags: [],
    artists: [],
    languages: [],
    categories: [],
  };

  $('#tags .tag-container').each((_, container) => {
    const $c = $(container);
    // extract the label (e.g. "Tags", "Parodies", etc.)
    const label = $c
      .clone()
      .children()
      .remove()
      .end()
      .text()
      .replace(':', '')
      .trim()
      .toLowerCase() as keyof MetaLists;

    // push each name into the correct array
    $c.find('a.tag .name').each((_, el) => {
      const name = $(el).text().trim();
      if (name && Array.isArray(meta[label])) {
        meta[label].push(name);
      }
    });
  });

  return meta;
}

async function scrapePageImage(id: number, page: number): Promise<string> {
  const url = `https://nhentai.net/g/${id}/${page}/`;
  const html = await axios
    .get<string>(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    .then(r => r.data);

  const $ = load(html);
  const img =
    $('#image-container img').attr('src') ||
    $('#image-container img').attr('data-src') ||
    '';
  if (!img) throw new Error(`Page image not found for ${id}/${page}`);
  return img;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { id, blacklistTags }: { id: number; blacklistTags?: string[] } =
      await request.json();
    const numId = Number(id);
    if (isNaN(numId)) throw new Error('Invalid ID');

    // 1) scrape metadata
    const meta = await scrapeMetadata(numId);

    // 2) scrape each page URL
    const pageUrls: string[] = [];
    for (let p = 1; p <= meta.totalPages; p++) {
      pageUrls.push(await scrapePageImage(numId, p));
    }

    // 3) insert manga record (UUID auto-generated)
    const { data: mangaData, error: mangaError } = await supabase
      .from('manga')
      .insert({
        manga_id: numId,
        title: meta.title,
        feature_image_url: meta.featureImageSrc,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (mangaError || !mangaData) throw mangaError || new Error('Insert failed');

    const newUuid = mangaData.id;

    // 4) map slug = numeric post ID
    await supabase.from('slug_map').insert({
      slug: String(numId),
      manga_id: newUuid,
    });

    // 5) insert pages
    if (pageUrls.length) {
      const pagesData = pageUrls.map((url, idx) => ({
        manga_id: newUuid,
        page_number: idx + 1,
        image_url: url,
      }));
      const { error: pagesError } = await supabase.from('pages').insert(pagesData);
      if (pagesError) throw pagesError;
    }

    // 6) upsert & link metadata
    const blacklistLower = (blacklistTags || []).map(t => t.toLowerCase());
    const joinMap: Record<keyof MetaLists, string> = {
      tags: 'tag_id',
      parodies: 'parody_id',
      characters: 'character_id',
      artists: 'artist_id',
      languages: 'language_id',
      categories: 'category_id',
    };

    for (const key of Object.keys(joinMap) as (keyof MetaLists)[]) {
      for (const name of meta[key]) {
        if (blacklistLower.includes(name.toLowerCase())) continue;

        // upsert entity
        const { data: existing, error: fetchErr } = await supabase
          .from(key)
          .select('id')
          .eq('name', name)
          .limit(1)
          .single();
        if (fetchErr && fetchErr.code !== 'PGRST116') throw fetchErr;

        let entityId: number;
        if (existing?.id) {
          entityId = existing.id;
        } else {
          const { data: ins, error: insErr } = await supabase
            .from(key)
            .insert({ name, slug: name.toLowerCase().replace(/\s+/g, '-') })
            .select('id')
            .single();
          if (insErr || !ins) throw insErr || new Error(`Upsert ${key} failed`);
          entityId = ins.id;
        }

        // link join table
        await supabase.from(`manga_${key}`).insert({
          manga_id: newUuid,
          [joinMap[key]]: entityId,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  try {
    const { id } = await request.json();
    const uuid = String(id);
    if (!uuid) throw new Error('Invalid ID');

    await supabase.from('pages').delete().eq('manga_id', uuid);
    for (const key of [
      'tags',
      'parodies',
      'characters',
      'artists',
      'languages',
      'categories',
    ] as const) {
      await supabase.from(`manga_${key}`).delete().eq('manga_id', uuid);
    }
    await supabase.from('slug_map').delete().eq('manga_id', uuid);
    await supabase.from('manga').delete().eq('id', uuid);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
