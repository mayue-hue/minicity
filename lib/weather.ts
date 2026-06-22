import type { CityProfile, TimeOfDay, WeatherCode, WeatherProfile } from "@/lib/types";

const mockWeatherByCity: Record<string, Omit<WeatherProfile, "localTime" | "dateLabel" | "timeOfDay">> = {
  freiburg: {
    cityId: "freiburg",
    temperature: 31,
    condition: "partly_cloudy",
    conditionLabel: "多云间晴",
    humidity: 46,
    windKph: 9
  },
  tokyo: {
    cityId: "tokyo",
    temperature: 27,
    condition: "rain",
    conditionLabel: "小雨",
    humidity: 74,
    windKph: 13
  },
  kyoto: {
    cityId: "kyoto",
    temperature: 29,
    condition: "clear",
    conditionLabel: "晴朗",
    humidity: 58,
    windKph: 7
  },
  yokohama: {
    cityId: "yokohama",
    temperature: 26,
    condition: "cloudy",
    conditionLabel: "多云",
    humidity: 66,
    windKph: 15
  },
  helsinki: {
    cityId: "helsinki",
    temperature: 18,
    condition: "partly_cloudy",
    conditionLabel: "多云间晴",
    humidity: 51,
    windKph: 18
  }
};

export function getMockWeather(profile: CityProfile): WeatherProfile {
  const localDate = new Date();
  const localTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: profile.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(localDate);
  const dateLabel = new Intl.DateTimeFormat("zh-CN", {
    timeZone: profile.timeZone,
    weekday: "long",
    month: "short",
    day: "numeric"
  }).format(localDate);
  const hour = Number(localTime.split(":")[0]);
  const base = mockWeatherByCity[profile.id] ?? mockWeatherByCity.freiburg;

  return {
    ...base,
    localTime,
    dateLabel,
    timeOfDay: getTimeOfDay(hour)
  };
}

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 8) {
    return "dawn";
  }

  if (hour >= 8 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }

  if (hour >= 17 && hour < 20) {
    return "dusk";
  }

  return "night";
}

export function getConditionLabel(condition: WeatherCode): string {
  const labels: Record<WeatherCode, string> = {
    clear: "晴朗",
    partly_cloudy: "多云间晴",
    cloudy: "多云",
    rain: "小雨",
    snow: "降雪"
  };

  return labels[condition];
}
