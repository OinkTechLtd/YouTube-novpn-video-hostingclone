import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Range",
};

const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get("url");
    const videoId = url.searchParams.get("videoId");

    if (!targetUrl && !videoId) {
      return new Response(
        JSON.stringify({ error: "Missing 'url' or 'videoId' parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let finalUrl = targetUrl;

    if (videoId && !finalUrl) {
      finalUrl = `https://www.youtube.com/oembed?url=https://youtube.com/watch?v=${videoId}&format=json`;
    }

    const headers: Record<string, string> = {
      "User-Agent": userAgent,
      "Accept-Language": "en-US,en;q=0.9",
      "Accept": "application/json, text/plain, */*",
      "Referer": "https://www.youtube.com/",
      "Origin": "https://www.youtube.com",
    };

    if (req.headers.has("range")) {
      headers["range"] = req.headers.get("range") || "";
    }

    const response = await fetch(finalUrl, {
      headers,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "application/json";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600",
        },
      });
    } else {
      const buffer = await response.arrayBuffer();
      return new Response(buffer, {
        status: response.status,
        headers: {
          ...corsHeaders,
          "Content-Type": contentType,
          "Content-Length": buffer.byteLength.toString(),
          "Cache-Control": response.headers.get("cache-control") || "public, max-age=86400",
        },
      });
    }
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch resource",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});