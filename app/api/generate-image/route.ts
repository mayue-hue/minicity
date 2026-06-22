import { NextResponse } from "next/server";
import { generateCityCardImage } from "@/lib/imageWorkflow";
import type { CityCardRequest } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") ?? undefined;
  const cityPrompt = searchParams.get("cityPrompt") ?? undefined;
  const weather = searchParams.get("weather") as CityCardRequest["weather"];
  const timeOfDay = searchParams.get("timeOfDay") as CityCardRequest["timeOfDay"];
  const provider = searchParams.get("provider") as CityCardRequest["provider"];
  const force = searchParams.get("force") === "true";

  return handleGenerate({ city, cityPrompt, weather, timeOfDay, provider, force }, request);
}

export async function POST(request: Request) {
  const body = (await request.json()) as CityCardRequest;
  return handleGenerate(body, request);
}

async function handleGenerate(body: CityCardRequest, request: Request) {
  if (!body.city && !body.cityPrompt?.trim()) {
    return NextResponse.json({ error: "请输入城市提示词" }, { status: 400 });
  }

  try {
    const apiKey = request.headers.get("x-openai-api-key")?.trim();
    const image = await generateCityCardImage(body, { apiKey });
    return NextResponse.json({ image });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown generation error" },
      { status: 400 }
    );
  }
}
