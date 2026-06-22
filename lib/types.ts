export type WeatherCode =
  | "clear"
  | "partly_cloudy"
  | "cloudy"
  | "rain"
  | "snow";

export type TimeOfDay = "dawn" | "morning" | "afternoon" | "dusk" | "night";

export type CityProfile = {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  flag: string;
  timeZone: string;
  latitude: number;
  longitude: number;
  landmarks: string[];
  visualKeywords: string[];
  description: string;
  imageFocus: string;
  palette: {
    roof: string;
    landmark: string;
    water: string;
    landscape: string;
  };
};

export type WeatherProfile = {
  cityId: string;
  localTime: string;
  dateLabel: string;
  temperature: number;
  condition: WeatherCode;
  conditionLabel: string;
  humidity: number;
  windKph: number;
  timeOfDay: TimeOfDay;
};

export type GeneratedImage = {
  id: string;
  cityId: string;
  city: string;
  weather: WeatherCode;
  timeOfDay: TimeOfDay;
  prompt: string;
  negativePrompt: string;
  imageUrl: string;
  seed: number;
  cached: boolean;
  createdAt: string;
  provider: "local-svg" | "openai-image";
};

export type ReferenceImageInput = {
  dataUrl: string;
  name: string;
  mimeType: string;
};

export type CityCardRequest = {
  city?: string;
  cityPrompt?: string;
  referenceImages?: ReferenceImageInput[];
  weather?: WeatherCode;
  timeOfDay?: TimeOfDay;
  provider?: "local" | "openai";
  force?: boolean;
};
