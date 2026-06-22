import { promises as fs } from "fs";
import path from "path";
import { getCityProfile } from "@/lib/cityProfiles";
import { renderLocalCitySvg } from "@/lib/localImageRenderer";
import { generateOpenAIImage, openAIImageModel } from "@/lib/openaiImageProvider";
import { buildCityImagePrompt, buildFreeformCityImagePrompt } from "@/lib/promptBuilder";
import type { CityCardRequest, CityProfile, GeneratedImage, TimeOfDay, WeatherCode } from "@/lib/types";
import { getConditionLabel, getMockWeather } from "@/lib/weather";

const cacheFile = path.join(process.cwd(), "data", "image-cache.json");
const generatedDir = path.join(process.cwd(), "public", "generated");
const imageStyleVersion = "card-v6";

type ImageCache = Record<string, GeneratedImage>;

type GenerateCityCardOptions = {
  apiKey?: string;
};

type PersistedImage = {
  imageUrl: string;
  persisted: boolean;
};

export async function generateCityCardImage(
  request: CityCardRequest,
  options: GenerateCityCardOptions = {}
): Promise<GeneratedImage> {
  const cityPrompt = request.cityPrompt?.trim();
  const cityProfile = cityPrompt
    ? buildCustomCityProfile(cityPrompt)
    : getCityProfile(request.city ?? "Freiburg") ?? buildCustomCityProfile(request.city ?? "Freiburg");

  const currentWeather = getMockWeather(cityProfile);
  const weather = request.weather ?? currentWeather.condition;
  const timeOfDay = request.timeOfDay ?? currentWeather.timeOfDay;
  const provider = request.provider === "openai" && options.apiKey ? "openai" : "local";
  const referenceImages = provider === "openai" ? request.referenceImages ?? [] : [];
  const referenceKey = referenceImages.length
    ? `ref-${stableSeed(referenceImages.map((image) => image.dataUrl).join("|"))}`
    : undefined;
  const cacheKey = buildCacheKey(cityProfile.id, weather, timeOfDay, provider, referenceKey);
  const promptInputWeather = {
    condition: weather,
    conditionLabel: getConditionLabel(weather)
  };
  const { prompt, negativePrompt } = cityPrompt
    ? buildFreeformCityImagePrompt({
        cityPrompt,
        weather: promptInputWeather,
        timeOfDay
      })
    : buildCityImagePrompt({
        cityProfile,
        weather: promptInputWeather,
        timeOfDay
      });
  const seed = stableSeed(`${cityProfile.id}:${cityPrompt ?? cityProfile.city}:${weather}:${timeOfDay}`);
  const cache = await readCache();
  const cached = cache[cacheKey];

  if (cached && !request.force) {
    return {
      ...cached,
      cached: true
    };
  }

  if (provider === "openai" && options.apiKey) {
    return generateOpenAIBackedImage({
      apiKey: options.apiKey,
      cache,
      cacheKey,
      cityId: cityProfile.id,
      city: cityProfile.city,
      weather,
      timeOfDay,
      prompt,
      negativePrompt,
      seed,
      referenceImages
    });
  }

  const svg = renderLocalCitySvg({ cityProfile, weather, timeOfDay, seed });
  const fileName = `${cacheKey}.svg`;
  const persistedImage = await persistGeneratedImage({
    fileName,
    content: svg,
    mimeType: "image/svg+xml"
  });

  const generated: GeneratedImage = {
    id: cacheKey,
    cityId: cityProfile.id,
    city: cityProfile.city,
    weather,
    timeOfDay,
    prompt,
    negativePrompt,
    imageUrl: persistedImage.imageUrl,
    seed,
    cached: false,
    createdAt: new Date().toISOString(),
    provider: "local-svg"
  };

  if (persistedImage.persisted) {
    cache[cacheKey] = generated;
    await writeCache(cache);
  }

  return generated;
}

export function buildCacheKey(
  cityId: string,
  weather: WeatherCode,
  timeOfDay: TimeOfDay,
  provider: "local" | "openai" = "local",
  referenceKey?: string
): string {
  const providerPart = provider === "openai" ? `openai-${openAIImageModel}` : "local";
  const referencePart = referenceKey ? `-${referenceKey}` : "";

  return `${imageStyleVersion}-${providerPart}${referencePart}-${cityId}-${weather}-${timeOfDay}`;
}

async function readCache(): Promise<ImageCache> {
  try {
    const raw = await fs.readFile(cacheFile, "utf8");
    return JSON.parse(raw) as ImageCache;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

async function writeCache(cache: ImageCache): Promise<void> {
  try {
    await fs.mkdir(path.dirname(cacheFile), { recursive: true });
    await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2), "utf8");
  } catch (error) {
    console.warn("Image cache is not writable; continuing without persistent cache.", error);
  }
}

function stableSeed(input: string): number {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0);
}

function buildCustomCityProfile(cityPrompt: string): CityProfile {
  const seed = stableSeed(cityPrompt);

  return {
    id: `custom-${seed}`,
    city: "自定义城市",
    country: "",
    countryCode: "XX",
    flag: "",
    timeZone: "Asia/Tokyo",
    latitude: 0,
    longitude: 0,
    landmarks: [cityPrompt],
    visualKeywords: [cityPrompt],
    description: cityPrompt,
    imageFocus: cityPrompt,
    palette: {
      roof: "#b94736",
      landmark: "#8d9188",
      water: "#5db8d7",
      landscape: "#3d8f62"
    }
  };
}

async function generateOpenAIBackedImage({
  apiKey,
  cache,
  cacheKey,
  cityId,
  city,
  weather,
  timeOfDay,
  prompt,
  negativePrompt,
  seed,
  referenceImages
}: {
  apiKey: string;
  cache: ImageCache;
  cacheKey: string;
  cityId: string;
  city: string;
  weather: WeatherCode;
  timeOfDay: TimeOfDay;
  prompt: string;
  negativePrompt: string;
  seed: number;
  referenceImages: NonNullable<CityCardRequest["referenceImages"]>;
}): Promise<GeneratedImage> {
  const imageBytes = await generateOpenAIImage({
    apiKey,
    prompt: `${prompt} Avoid: ${negativePrompt}`,
    referenceImages
  });
  const fileName = `${cacheKey}.png`;
  const persistedImage = await persistGeneratedImage({
    fileName,
    content: imageBytes,
    mimeType: "image/png"
  });

  const generated: GeneratedImage = {
    id: cacheKey,
    cityId,
    city,
    weather,
    timeOfDay,
    prompt,
    negativePrompt,
    imageUrl: persistedImage.imageUrl,
    seed,
    cached: false,
    createdAt: new Date().toISOString(),
    provider: "openai-image"
  };

  if (persistedImage.persisted) {
    cache[cacheKey] = generated;
    await writeCache(cache);
  }

  return generated;
}

async function persistGeneratedImage({
  fileName,
  content,
  mimeType
}: {
  fileName: string;
  content: Buffer | string;
  mimeType: "image/png" | "image/svg+xml";
}): Promise<PersistedImage> {
  const imagePath = path.join(generatedDir, fileName);

  try {
    await fs.mkdir(generatedDir, { recursive: true });
    await fs.writeFile(imagePath, content);

    return {
      imageUrl: `/generated/${fileName}`,
      persisted: true
    };
  } catch (error) {
    console.warn("Generated image directory is not writable; returning inline image data.", error);

    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");

    return {
      imageUrl: `data:${mimeType};base64,${buffer.toString("base64")}`,
      persisted: false
    };
  }
}
