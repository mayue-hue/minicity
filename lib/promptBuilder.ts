import type { CityProfile, TimeOfDay, WeatherCode, WeatherProfile } from "@/lib/types";
import { getConditionLabel } from "@/lib/weather";

type PromptInput = {
  cityProfile: CityProfile;
  weather: Pick<WeatherProfile, "condition" | "conditionLabel"> | { condition: WeatherCode };
  timeOfDay: TimeOfDay;
};

type FreeformPromptInput = {
  cityPrompt: string;
  weather: Pick<WeatherProfile, "condition" | "conditionLabel"> | { condition: WeatherCode };
  timeOfDay: TimeOfDay;
};

const weatherVisuals: Record<WeatherCode, string> = {
  clear: "clear sky, crisp sunlight, bright atmosphere",
  partly_cloudy: "partly cloudy sky, soft sunlight, gentle cloud shadows",
  cloudy: "overcast sky, diffused light, calm muted shadows",
  rain: "light rain atmosphere, wet streets, glossy reflections, soft mist",
  snow: "fresh snow dusting rooftops and streets, cold clean air, soft winter light"
};

const weatherLighting: Record<WeatherCode, string> = {
  clear:
    "strong warm key light from the upper left, clear directional shadows, bright highlights on roofs and stone, saturated clean colors",
  partly_cloudy:
    "large soft sky light with intermittent warm sun patches, gentle cloud-shadow gradients across roofs, balanced contrast",
  cloudy:
    "full overcast ambient light, no hard shadows, low contrast, cooler desaturated materials, soft ambient occlusion under buildings and trees",
  rain:
    "dark wet ambient light, glossy wet streets and rooftops, visible specular reflections on stone and water channels, misty air, reduced contrast",
  snow:
    "cold blue ambient light with strong white bounce from snow, frosted roofs and streets, soft shadows, quiet high-key winter reflections"
};

const timeVisuals: Record<TimeOfDay, string> = {
  dawn: "early dawn light, pale gold horizon, long delicate shadows",
  morning: "fresh morning light, clean air, bright but soft contrast",
  afternoon: "bright afternoon lighting, balanced contrast, soft shadows",
  dusk: "warm dusk light, amber sky glow, lights beginning to turn on",
  night: "clear night scene, cinematic city lighting, readable silhouettes"
};

export function buildCityImagePrompt({ cityProfile, weather, timeOfDay }: PromptInput): {
  prompt: string;
  negativePrompt: string;
} {
  const conditionLabel =
    "conditionLabel" in weather ? weather.conditionLabel : getConditionLabel(weather.condition);
  const landmarks = cityProfile.landmarks.join(", ");
  const visualKeywords = cityProfile.visualKeywords.join(", ");

  const prompt = [
    `A 45-degree isometric miniature diorama of ${cityProfile.city}, ${cityProfile.country}.`,
    cityProfile.imageFocus,
    `Recognizable city cues: ${landmarks}.`,
    `Visual details: ${visualKeywords}.`,
    `Weather mood: ${conditionLabel.toLowerCase()}, ${weatherVisuals[weather.condition]}.`,
    `Time of day: ${timeOfDay}, ${timeVisuals[timeOfDay]}.`,
    `Whole-environment lighting rule: ${weatherLighting[weather.condition]}. The weather must affect every surface in the scene: platform sides, streets, roofs, trees, landmark stone, water, shadows, highlights, reflections, haze, and color temperature. Do not make weather visible only in the sky or background.`,
    "Designed as the square background image for a premium mobile weather app weather card.",
    "Hard composition rule: render one isolated small square city block only, like a toy diorama cube floating in blue sky. The square platform must occupy about 58% of the canvas width, centered horizontally, sitting in the lower half of the image.",
    "The city, streets, buildings, trees, and landmark must all fit completely inside the visible square platform. Show the platform top and the vertical stone sides clearly. Leave broad empty sky around every edge.",
    "Do not zoom in. Do not make a full-frame city. Do not crop the base. The platform corners and all four edges must be visible.",
    "Fixed orthographic isometric camera, three-quarter top-down 45-degree view, compact city blocks, charming high-detail game-like 3D render, polished miniature materials, clean premium composition, safe empty space in the upper-left and upper-right sky for UI overlays."
  ].join(" ");

  return {
    prompt,
    negativePrompt:
      "text, letters, numbers, labels, logo, watermark, map pins, UI, buttons, captions, full-frame city, oversized city, zoomed-in city, cropped base, hidden platform sides, city touching image edges, wide landscape, horizon line, background city outside the block, photorealistic aerial photo, blurry, low resolution, distorted landmark, messy composition"
  };
}

export function buildFreeformCityImagePrompt({
  cityPrompt,
  weather,
  timeOfDay
}: FreeformPromptInput): {
  prompt: string;
  negativePrompt: string;
} {
  const conditionLabel =
    "conditionLabel" in weather ? weather.conditionLabel : getConditionLabel(weather.condition);
  const prompt = [
    "Create a square 45-degree isometric miniature city diorama for a premium mobile weather card.",
    `Use this user-provided city brief as the source of truth for the city identity, landmarks, materials, and visual cues: ${cityPrompt}.`,
    `Weather mood: ${conditionLabel.toLowerCase()}, ${weatherVisuals[weather.condition]}.`,
    `Time of day: ${timeOfDay}, ${timeVisuals[timeOfDay]}.`,
    `Whole-environment lighting rule: ${weatherLighting[weather.condition]}. The weather must affect every surface in the scene: platform sides, streets, roofs, trees, landmark stone, water, shadows, highlights, reflections, haze, and color temperature. Do not make weather visible only in the sky or background.`,
    "The image must be a background only: one isolated small floating square diorama block with visible stone sides, blue sky or weather-appropriate sky behind it, and the main landmark or city identity contained inside the block.",
    "Hard composition rule: the square platform should occupy about 58% of the canvas width, centered horizontally and placed in the lower half of the image. Leave broad empty sky around every edge.",
    "The platform top, vertical stone sides, all four edges, and all four corners must be visible. The city, streets, buildings, trees, and landmark must all fit completely inside the square platform.",
    "Do not zoom in. Do not make a full-frame city. Do not crop the base.",
    "Fixed orthographic isometric camera, three-quarter top-down 45-degree view, charming high-detail game-like 3D render, polished miniature materials, clean premium composition.",
    "Leave safe empty visual space in the upper-left and upper-right sky for frontend UI overlays."
  ].join(" ");

  return {
    prompt,
    negativePrompt:
      "text, letters, numbers, labels, logo, watermark, map pins, UI, buttons, captions, full-frame city, oversized city, zoomed-in city, cropped base, hidden platform sides, city touching image edges, wide landscape, horizon line, background city outside the block, blurry, low resolution, messy composition, distorted landmark, random city unrelated to the user brief"
  };
}

export function buildStoryboardPrompt(cityProfile: CityProfile): string {
  return [
    `Create a stable visual plan for a 45-degree isometric city weather card of ${cityProfile.city}.`,
    "The output should describe fixed composition, main landmark placement, city block rhythm, foreground/midground/background layout, and which areas should remain clear for UI overlay.",
    `Use these source details: ${cityProfile.landmarks.join(", ")}.`,
    "Do not include text, labels, logos, or numbers in the generated image."
  ].join(" ");
}
