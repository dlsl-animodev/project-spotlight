import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint") || "pageviews";
  const timeframe = searchParams.get("timeframe") || "30d";

  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!projectId) {
    return NextResponse.json(
      { error: "VERCEL_PROJECT_ID not configured" },
      { status: 500 }
    );
  }

  let apiUrl = "";
  const baseUrl = "https://vercel.com/api/web/insights";

  // Calculate date range
  const now = new Date();
  const from = new Date();
  if (timeframe === "24h") {
    from.setHours(from.getHours() - 24);
  } else if (timeframe === "7d") {
    from.setDate(from.getDate() - 7);
  } else if (timeframe === "30d") {
    from.setDate(from.getDate() - 30);
  } else if (timeframe === "90d") {
    from.setDate(from.getDate() - 90);
  }

  switch (endpoint) {
    case "pageviews":
      apiUrl = `${baseUrl}/stats/path?projectId=${projectId}&from=${from.getTime()}&to=${now.getTime()}`;
      break;
    case "visitors":
      apiUrl = `${baseUrl}/stats/country?projectId=${projectId}&from=${from.getTime()}&to=${now.getTime()}`;
      break;
    case "referrers":
      apiUrl = `${baseUrl}/stats/referrer?projectId=${projectId}&from=${from.getTime()}&to=${now.getTime()}`;
      break;
    case "browsers":
      apiUrl = `${baseUrl}/stats/browser?projectId=${projectId}&from=${from.getTime()}&to=${now.getTime()}`;
      break;
    case "devices":
      apiUrl = `${baseUrl}/stats/device?projectId=${projectId}&from=${from.getTime()}&to=${now.getTime()}`;
      break;
    case "os":
      apiUrl = `${baseUrl}/stats/os?projectId=${projectId}&from=${from.getTime()}&to=${now.getTime()}`;
      break;
    case "timeseries":
      apiUrl = `${baseUrl}/timeseries?projectId=${projectId}&from=${from.getTime()}&to=${now.getTime()}`;
      break;
    default:
      apiUrl = `${baseUrl}/stats/path?projectId=${projectId}&from=${from.getTime()}&to=${now.getTime()}`;
  }

  try {
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Vercel API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch analytics", details: errorText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
