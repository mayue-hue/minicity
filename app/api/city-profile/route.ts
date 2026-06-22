import { NextResponse } from "next/server";
import { cityProfiles, getCityProfile } from "@/lib/cityProfiles";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  if (!city) {
    return NextResponse.json({ cities: cityProfiles });
  }

  const profile = getCityProfile(city);

  if (!profile) {
    return NextResponse.json({ error: `Unknown city: ${city}` }, { status: 404 });
  }

  return NextResponse.json({ city: profile });
}
