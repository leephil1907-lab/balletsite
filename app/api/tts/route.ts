import { NextRequest } from "next/server";

export const runtime = "nodejs";

const backendUrl = process.env.REACHMARK_TTS_URL;

export async function POST(request: NextRequest) {
  if (!backendUrl) {
    return new Response(
      JSON.stringify({
        error: "Reachmark TTS backend is not configured. Set REACHMARK_TTS_URL.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const body = await request.json();

    const upstream = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.REACHMARK_BACKEND_TOKEN
          ? { Authorization: `Bearer ${process.env.REACHMARK_BACKEND_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") || "audio/wav";
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": contentType,
        ...(upstream.headers.get("content-length")
          ? { "Content-Length": upstream.headers.get("content-length")! }
          : {}),
        ...(upstream.headers.get("content-disposition")
          ? {
              "Content-Disposition":
                upstream.headers.get("content-disposition")!,
            }
          : {}),
      },
    });
  } catch (error) {
    console.error("Reachmark TTS proxy error", error);
    return new Response(
      JSON.stringify({ error: "Unable to reach the Reachmark TTS backend." }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
