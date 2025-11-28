/**
 * Vosk Model Proxy API Route
 * 
 * This endpoint proxies the Vosk model download to avoid CORS issues.
 * The alphacephei.com server doesn't set Access-Control-Allow-Origin headers,
 * so browsers block direct requests from our app. This proxy fetches the model
 * server-side and streams it to the client.
 */

import { NextRequest, NextResponse } from "next/server";

const MODEL_URL = "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip";

// Route segment config for streaming large files
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Max duration for serverless functions (for Vercel)
export const maxDuration = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Check for range header for resumable downloads
    const rangeHeader = request.headers.get("range");
    
    // Fetch from the original source
    const fetchHeaders: HeadersInit = {};
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }
    
    console.log("[Vosk Proxy] Fetching model from:", MODEL_URL);
    
    const response = await fetch(MODEL_URL, {
      headers: fetchHeaders,
    });

    if (!response.ok && response.status !== 206) {
      console.error("[Vosk Proxy] Failed to fetch model:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to fetch Vosk model" },
        { status: response.status }
      );
    }

    // Get content info
    const contentLength = response.headers.get("content-length");
    const contentType = response.headers.get("content-type") || "application/zip";
    const contentRange = response.headers.get("content-range");

    // Create response headers
    const responseHeaders: HeadersInit = {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range",
      "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
    };

    if (contentLength) {
      responseHeaders["Content-Length"] = contentLength;
    }
    if (contentRange) {
      responseHeaders["Content-Range"] = contentRange;
    }

    // Stream the response
    if (!response.body) {
      return NextResponse.json(
        { error: "No response body" },
        { status: 500 }
      );
    }

    console.log("[Vosk Proxy] Streaming model, size:", contentLength);

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error("[Vosk Proxy] Error:", error);
    return NextResponse.json(
      { error: "Failed to proxy Vosk model" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range",
      "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
    },
  });
}

// HEAD request for size checking
export async function HEAD() {
  try {
    const response = await fetch(MODEL_URL, { method: "HEAD" });
    
    const contentLength = response.headers.get("content-length");
    const contentType = response.headers.get("content-type") || "application/zip";

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": contentLength || "0",
        "Access-Control-Allow-Origin": "*",
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[Vosk Proxy] HEAD error:", error);
    return NextResponse.json(
      { error: "Failed to get model info" },
      { status: 500 }
    );
  }
}
