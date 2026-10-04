import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const backendUrl = process.env.REACHMARK_AGENT_URL;

export async function POST(request: NextRequest) {
  if (!backendUrl) {
    return NextResponse.json(
      {
        error:
          "Reachmark agent backend is not configured. Set REACHMARK_AGENT_URL.",
      },
      { status: 503 },
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

    const contentType = upstream.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await upstream.json();
      return NextResponse.json(data, { status: upstream.status });
    }

    const text = await upstream.text();
    return NextResponse.json(
      { content: text },
      { status: upstream.status },
    );
  } catch (error) {
    console.error("Reachmark agent proxy error", error);
    return NextResponse.json(
      { error: "Unable to reach the Reachmark agent backend." },
      { status: 502 },
    );
  }
}
