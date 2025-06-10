export async function POST(req: Request) {
  const { postUrl } = await req.json();

  try {
    const res = await fetch(postUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch' }), {
        status: res.status,
      });
    }

    const html = await res.text();
    return Response.json({ html });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
    });
  }
}
