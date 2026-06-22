import { NextResponse } from "next/server";
import { getCityProfile } from "@/lib/cityProfiles";
import { getMockWeather } from "@/lib/weather";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") ?? "Freiburg";
  const profile = getCityProfile(city);

  if (!profile) {
    return NextResponse.json({ error: `Unknown city: ${city}` }, { status: 404 });
  }

  return NextResponse.json({ weather: getMockWeather(profile) });
}
