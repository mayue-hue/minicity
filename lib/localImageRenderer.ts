import type { CityProfile, TimeOfDay, WeatherCode } from "@/lib/types";

type RenderInput = {
  cityProfile: CityProfile;
  weather: WeatherCode;
  timeOfDay: TimeOfDay;
  seed: number;
};

type SceneLighting = {
  sky: [string, string];
  ground: string;
  shadow: string;
  keyLight: string;
  keyLightOpacity: number;
  tint: string;
  tintOpacity: number;
  topShadeOpacity: number;
  bottomShadeOpacity: number;
};

const skyByTime: Record<TimeOfDay, [string, string]> = {
  dawn: ["#f6c8a5", "#9dc8d6"],
  morning: ["#92d5ed", "#d8f1f4"],
  afternoon: ["#80c7ee", "#f7f0cf"],
  dusk: ["#e9a26f", "#6f86b6"],
  night: ["#14213d", "#31436f"]
};

const groundByTime: Record<TimeOfDay, string> = {
  dawn: "#84b886",
  morning: "#81bf82",
  afternoon: "#78b879",
  dusk: "#6f9973",
  night: "#476865"
};

export function renderLocalCitySvg({ cityProfile, weather, timeOfDay, seed }: RenderInput): string {
  const lighting = getSceneLighting(weather, timeOfDay);
  const [skyTop, skyBottom] = lighting.sky;
  const ground = lighting.ground;
  const palette = cityProfile.palette;
  const isNight = timeOfDay === "night";
  const clouds = renderClouds(weather, isNight);
  const precipitation = renderPrecipitation(weather);
  const cityVariant = renderCityVariant(cityProfile.id, palette, isNight);
  const forest = renderForest(palette.landscape);
  const seedDots = renderSeedTexture(seed, isNight);
  const environmentEffects = renderEnvironmentEffects(weather, timeOfDay, lighting);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" role="img" aria-label="45-degree isometric miniature city background">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${skyTop}"/>
      <stop offset="100%" stop-color="${skyBottom}"/>
    </linearGradient>
    <linearGradient id="overlay" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(8, 14, 28, ${lighting.topShadeOpacity})"/>
      <stop offset="52%" stop-color="rgba(8, 14, 28, 0)"/>
      <stop offset="100%" stop-color="rgba(8, 14, 28, ${lighting.bottomShadeOpacity})"/>
    </linearGradient>
    <radialGradient id="keyLight" cx="24%" cy="18%" r="62%">
      <stop offset="0%" stop-color="${lighting.keyLight}" stop-opacity="${lighting.keyLightOpacity}"/>
      <stop offset="42%" stop-color="${lighting.keyLight}" stop-opacity="${lighting.keyLightOpacity * 0.42}"/>
      <stop offset="100%" stop-color="${lighting.keyLight}" stop-opacity="0"/>
    </radialGradient>
    <filter id="softShadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="22" stdDeviation="18" flood-color="${lighting.shadow}"/>
    </filter>
    <filter id="tinyBlur">
      <feGaussianBlur stdDeviation="1.8"/>
    </filter>
  </defs>
  <rect width="1200" height="1200" fill="url(#sky)"/>
  <rect width="1200" height="1200" fill="url(#keyLight)"/>
  ${clouds}
  ${renderBaseSlab(ground, weather)}
  ${forest}
  <g transform="translate(600 690) scale(0.78)" filter="url(#softShadow)">
    <g transform="rotate(0)">
      ${renderRoads(palette.water, weather)}
      ${cityVariant}
    </g>
  </g>
  ${environmentEffects}
  ${seedDots}
  ${precipitation}
  <rect width="1200" height="1200" fill="${lighting.tint}" opacity="${lighting.tintOpacity}"/>
  <rect width="1200" height="1200" fill="url(#overlay)"/>
</svg>`;
}

function getSceneLighting(weather: WeatherCode, timeOfDay: TimeOfDay): SceneLighting {
  const isNight = timeOfDay === "night";
  const sky = skyByTime[timeOfDay];
  const ground = groundByTime[timeOfDay];

  const timeLighting: SceneLighting = {
    sky,
    ground,
    shadow: isNight ? "rgba(3, 10, 28, 0.48)" : "rgba(57, 68, 58, 0.22)",
    keyLight: isNight ? "#a9c7ff" : "#fff4c0",
    keyLightOpacity: isNight ? 0.18 : 0.34,
    tint: isNight ? "#213a69" : "#fff1c1",
    tintOpacity: isNight ? 0.16 : 0.04,
    topShadeOpacity: isNight ? 0.38 : 0.06,
    bottomShadeOpacity: isNight ? 0.5 : 0.04
  };

  if (weather === "clear") {
    return {
      ...timeLighting,
      keyLightOpacity: isNight ? 0.2 : 0.42,
      tint: isNight ? "#1a3262" : "#ffe8a3",
      tintOpacity: isNight ? 0.1 : 0.035
    };
  }

  if (weather === "partly_cloudy") {
    return {
      ...timeLighting,
      keyLightOpacity: isNight ? 0.16 : 0.26,
      tint: isNight ? "#243b64" : "#d8ecff",
      tintOpacity: isNight ? 0.13 : 0.055,
      shadow: isNight ? "rgba(3, 10, 28, 0.44)" : "rgba(64, 79, 82, 0.18)"
    };
  }

  if (weather === "cloudy") {
    return {
      ...timeLighting,
      sky: isNight ? ["#1b2740", "#34425f"] : ["#a9bac3", "#d6dde0"],
      ground: isNight ? "#445b62" : "#78a579",
      keyLight: "#d6e2ea",
      keyLightOpacity: 0.14,
      tint: "#aebcc5",
      tintOpacity: isNight ? 0.2 : 0.14,
      shadow: "rgba(38, 51, 56, 0.18)",
      topShadeOpacity: isNight ? 0.42 : 0.12,
      bottomShadeOpacity: isNight ? 0.56 : 0.08
    };
  }

  if (weather === "rain") {
    return {
      ...timeLighting,
      sky: isNight ? ["#101827", "#26364e"] : ["#7f98ab", "#b8cbd4"],
      ground: isNight ? "#3f5f5f" : "#5e8f70",
      keyLight: "#c9d8e8",
      keyLightOpacity: 0.1,
      tint: "#4e6473",
      tintOpacity: isNight ? 0.28 : 0.18,
      shadow: "rgba(10, 24, 34, 0.34)",
      topShadeOpacity: isNight ? 0.48 : 0.18,
      bottomShadeOpacity: isNight ? 0.58 : 0.14
    };
  }

  return {
    ...timeLighting,
    sky: isNight ? ["#17233c", "#344765"] : ["#c4dceb", "#eef5f7"],
    ground: isNight ? "#556d70" : "#9ab58e",
    keyLight: "#eff8ff",
    keyLightOpacity: isNight ? 0.22 : 0.3,
    tint: "#e8f5ff",
    tintOpacity: isNight ? 0.18 : 0.12,
    shadow: "rgba(62, 79, 93, 0.16)",
    topShadeOpacity: isNight ? 0.4 : 0.08,
    bottomShadeOpacity: isNight ? 0.46 : 0.06
  };
}

function renderBaseSlab(ground: string, weather: WeatherCode): string {
  const wetLayer =
    weather === "rain"
      ? `<path d="M306 714 L600 578 L894 714 L600 940 Z" fill="#cde5ec" opacity="0.18"/>
         <path d="M356 790 L512 708 L690 790 L535 888 Z" fill="#ffffff" opacity="0.18"/>
         <path d="M660 746 L792 690 L874 730 L740 802 Z" fill="#ffffff" opacity="0.14"/>`
      : "";
  const snowLayer =
    weather === "snow"
      ? `<path d="M276 702 L600 542 L926 702 L600 978 Z" fill="#ffffff" opacity="0.42"/>
         <path d="M248 704 L600 1010 L952 704" fill="none" stroke="#f8fdff" stroke-width="7" opacity="0.5"/>`
      : "";

  return `
    <g filter="url(#softShadow)">
      <path d="M248 704 L600 520 L952 704 L600 1010 Z" fill="${ground}"/>
      <path d="M248 704 L600 1010 L600 1082 L248 780 Z" fill="#8f8675"/>
      <path d="M952 704 L600 1010 L600 1082 L952 778 Z" fill="#6f685c"/>
      <path d="M248 704 L600 520 L952 704 L600 1010 Z" fill="#cfc6a4" opacity="0.22"/>
      <path d="M290 706 L600 560 L910 706 L600 966 Z" fill="#e7dfc8" opacity="0.52"/>
      ${wetLayer}
      ${snowLayer}
      <path d="M248 704 L600 1010 L952 704" fill="none" stroke="rgba(255,255,255,0.24)" stroke-width="5"/>
    </g>
  `;
}

function renderRoads(water: string, weather: WeatherCode): string {
  const wetHighlights =
    weather === "rain"
      ? `<path d="M-300 96 L-34 -52 L260 108" stroke="#f4ffff" stroke-width="9" stroke-linecap="round" opacity="0.28"/>
         <path d="M-210 178 L-78 105 L96 200" stroke="#f4ffff" stroke-width="7" stroke-linecap="round" opacity="0.22"/>`
      : "";
  const snowDusting =
    weather === "snow"
      ? `<path d="M-350 64 L-42 -110 L348 100 L42 274 Z" fill="#ffffff" opacity="0.2"/>`
      : "";

  return `
    <path d="M-410 80 L-45 -130 L420 120 L60 330 Z" fill="#dddbc8"/>
    <path d="M-360 86 L-38 -96 L348 112 L42 286 Z" fill="#ece8d4"/>
    ${snowDusting}
    <path d="M-330 30 L15 222" stroke="#bbb49c" stroke-width="24" stroke-linecap="round"/>
    <path d="M-192 -38 L176 164" stroke="#bbb49c" stroke-width="18" stroke-linecap="round"/>
    <path d="M-72 -92 L292 109" stroke="#bbb49c" stroke-width="16" stroke-linecap="round"/>
    <path d="M-266 160 L86 -42 L276 60" stroke="${water}" stroke-width="20" stroke-linecap="round" opacity="0.78"/>
    <path d="M-256 160 L90 -35 L268 58" stroke="#f5fffb" stroke-width="5" stroke-linecap="round" opacity="0.45"/>
    ${wetHighlights}
  `;
}

function renderEnvironmentEffects(
  weather: WeatherCode,
  timeOfDay: TimeOfDay,
  lighting: SceneLighting
): string {
  const isNight = timeOfDay === "night";
  const duskWarmth =
    timeOfDay === "dusk"
      ? `<rect width="1200" height="1200" fill="#ff9d62" opacity="0.08"/>`
      : "";
  const dawnWarmth =
    timeOfDay === "dawn"
      ? `<rect width="1200" height="1200" fill="#ffd7a3" opacity="0.08"/>`
      : "";
  const nightCoolness = isNight
    ? `<rect width="1200" height="1200" fill="#102143" opacity="0.16"/>`
    : "";

  if (weather === "clear") {
    return `
      ${dawnWarmth}
      ${duskWarmth}
      ${nightCoolness}
      <path d="M116 198 C264 108 420 92 600 138 C394 188 236 292 82 454 Z" fill="${lighting.keyLight}" opacity="${isNight ? "0.08" : "0.16"}"/>
    `;
  }

  if (weather === "partly_cloudy") {
    return `
      ${dawnWarmth}
      ${duskWarmth}
      ${nightCoolness}
      <path d="M190 576 C316 496 446 500 566 574 C448 616 320 666 190 756 Z" fill="#31455a" opacity="${isNight ? "0.16" : "0.08"}"/>
      <path d="M620 464 C756 402 902 426 1014 512 C850 540 742 606 590 664 Z" fill="#ffffff" opacity="${isNight ? "0.04" : "0.12"}"/>
    `;
  }

  if (weather === "cloudy") {
    return `
      ${nightCoolness}
      <rect width="1200" height="1200" fill="#afbcc4" opacity="${isNight ? "0.16" : "0.12"}"/>
      <path d="M180 720 C356 636 538 630 720 710 C558 770 358 812 164 860 Z" fill="#52636b" opacity="${isNight ? "0.12" : "0.08"}"/>
    `;
  }

  if (weather === "rain") {
    return `
      ${nightCoolness}
      <rect width="1200" height="1200" fill="#3b5061" opacity="${isNight ? "0.18" : "0.12"}"/>
      <path d="M256 804 C430 724 620 728 816 812 C654 876 446 924 246 948 Z" fill="#dff7ff" opacity="0.12"/>
      <path d="M96 470 C262 378 468 360 680 430 C454 480 274 582 74 710 Z" fill="#e8f5ff" opacity="0.1"/>
      <g opacity="0.2">
        ${Array.from({ length: 20 })
          .map((_, index) => {
            const x = 120 + ((index * 89) % 960);
            const y = 360 + ((index * 53) % 480);
            return `<path d="M${x} ${y} L${x + 64} ${y - 22}" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>`;
          })
          .join("")}
      </g>
    `;
  }

  return `
    ${nightCoolness}
    <rect width="1200" height="1200" fill="#eef8ff" opacity="${isNight ? "0.14" : "0.16"}"/>
    <path d="M196 780 C392 678 604 686 838 804 C646 856 414 918 178 974 Z" fill="#ffffff" opacity="0.2"/>
    <path d="M86 338 C270 254 478 258 650 340 C432 364 246 448 86 560 Z" fill="#ffffff" opacity="0.12"/>
  `;
}

function renderCityVariant(
  cityId: string,
  palette: CityProfile["palette"],
  isNight: boolean
): string {
  const sharedBlocks = `
    ${building(-295, 46, 76, 68, 48, palette.roof, "#efe5ce", isNight)}
    ${building(-205, -6, 74, 76, 54, palette.roof, "#e7dcc6", isNight)}
    ${building(-120, 70, 78, 58, 44, palette.roof, "#f3ead8", isNight)}
    ${building(28, -65, 86, 70, 62, palette.roof, "#eadfc9", isNight)}
    ${building(130, -10, 78, 68, 50, palette.roof, "#f6ecd7", isNight)}
    ${building(222, 42, 90, 76, 58, palette.roof, "#e8ddc7", isNight)}
    ${building(-78, 172, 88, 74, 52, palette.roof, "#efe3ca", isNight)}
    ${building(25, 228, 78, 70, 46, palette.roof, "#eadcc2", isNight)}
    ${building(132, 168, 82, 76, 56, palette.roof, "#f0e5d0", isNight)}
  `;

  if (cityId === "tokyo") {
    return `
      ${sharedBlocks}
      ${tower(5, 36, palette.landmark, isNight)}
      ${highRise(-180, 132, 62, 58, 148, "#b9c5cf", "#718596", isNight)}
      ${highRise(214, -76, 66, 58, 136, "#c4d3da", "#8092a0", isNight)}
      <path d="M-310 260 C-120 198 45 208 318 290" stroke="#596b73" stroke-width="18" fill="none"/>
      <path d="M-305 246 C-112 185 52 196 325 277" stroke="#f1f1dc" stroke-width="7" fill="none"/>
    `;
  }

  if (cityId === "kyoto") {
    return `
      ${sharedBlocks}
      ${temple(-14, 28, palette.landmark, isNight)}
      ${building(-238, 130, 98, 54, 34, "#5e3a2c", "#d2a875", isNight)}
      ${building(230, 126, 95, 52, 34, "#5e3a2c", "#d2a875", isNight)}
      <ellipse cx="-315" cy="-76" rx="52" ry="28" fill="${palette.water}" opacity="0.82"/>
      <ellipse cx="-315" cy="-76" rx="34" ry="16" fill="#eef9ee" opacity="0.32"/>
    `;
  }

  if (cityId === "yokohama") {
    return `
      ${sharedBlocks}
      <path d="M118 -250 C285 -200 374 -78 395 84 C278 55 169 24 68 -45 Z" fill="${palette.water}" opacity="0.84"/>
      ${ferrisWheel(120, -95, palette.landmark, isNight)}
      ${highRise(-105, 20, 70, 58, 130, "#b8cbd3", "#72899b", isNight)}
      ${highRise(-8, -22, 62, 52, 160, "#cad8de", "#8598a4", isNight)}
      <path d="M190 -170 L284 -124 L235 -98 L144 -144 Z" fill="#f0efe4"/>
    `;
  }

  if (cityId === "helsinki") {
    return `
      ${sharedBlocks}
      <path d="M-380 -172 C-222 -256 -46 -252 110 -198 C242 -151 344 -144 430 -112 L430 110 C292 76 162 34 10 5 C-134 -22 -256 14 -380 64 Z" fill="${palette.water}" opacity="0.88"/>
      ${cathedral(10, 24, palette.landmark, "#79a06a", isNight)}
      <path d="M-262 -136 L-174 -98 L-220 -74 L-306 -112 Z" fill="#f2ead7"/>
      <path d="M246 -72 L326 -38 L282 -12 L202 -48 Z" fill="#eef0e7"/>
    `;
  }

  return `
    <path d="M-342 -78 C-236 -150 -108 -168 40 -152 C184 -136 286 -156 392 -218 L420 -150 C304 -92 170 -84 20 -94 C-138 -104 -244 -72 -342 10 Z" fill="${palette.landscape}" opacity="0.8"/>
    <path d="M-312 -55 C-228 -112 -118 -132 42 -118 C178 -105 282 -128 368 -176" stroke="#2f6f4c" stroke-width="18" opacity="0.42"/>
    ${sharedBlocks}
    <g transform="translate(-30 -95) scale(1.65)">
      ${cathedral(-6, 34, palette.landmark, palette.roof, isNight)}
    </g>
    <path d="M-238 242 L-86 156" stroke="#4f8b55" stroke-width="16"/>
    <rect x="-88" y="148" width="72" height="22" rx="8" fill="#4eae70" transform="rotate(-29 -52 159)"/>
  `;
}

function building(
  x: number,
  y: number,
  width: number,
  depth: number,
  height: number,
  roof: string,
  wall: string,
  isNight: boolean
): string {
  const left = darken(wall, 16);
  const right = darken(wall, 8);
  const light = isNight ? "#ffd77b" : "#ffffff";
  const windowOpacity = isNight ? 0.86 : 0.26;

  return `
    <g transform="translate(${x} ${y})">
      <path d="M0 0 L${width / 2} ${-depth / 2} L${width} 0 L${width / 2} ${depth / 2} Z" fill="${roof}"/>
      <path d="M0 0 L${width / 2} ${depth / 2} L${width / 2} ${depth / 2 + height} L0 ${height} Z" fill="${left}"/>
      <path d="M${width} 0 L${width / 2} ${depth / 2} L${width / 2} ${depth / 2 + height} L${width} ${height} Z" fill="${right}"/>
      <path d="M0 ${height} L${width / 2} ${depth / 2 + height} L${width} ${height} L${width / 2} ${height + depth / 2 + 8} Z" fill="rgba(50, 55, 60, 0.08)"/>
      <circle cx="${width * 0.26}" cy="${height * 0.48}" r="4" fill="${light}" opacity="${windowOpacity}"/>
      <circle cx="${width * 0.72}" cy="${height * 0.54}" r="4" fill="${light}" opacity="${windowOpacity}"/>
    </g>
  `;
}

function cathedral(
  x: number,
  y: number,
  stone: string,
  roof: string,
  isNight: boolean
): string {
  return `
    <g transform="translate(${x - 72} ${y - 92})">
      <path d="M0 90 L72 48 L152 94 L78 136 Z" fill="${roof}"/>
      <path d="M20 100 L78 136 L78 210 L20 176 Z" fill="${darken(stone, 12)}"/>
      <path d="M152 94 L78 136 L78 210 L152 170 Z" fill="${darken(stone, 4)}"/>
      <path d="M60 38 L78 -48 L100 40 L80 58 Z" fill="${darken(stone, 16)}"/>
      <path d="M78 -48 L118 44 L100 40 Z" fill="${stone}"/>
      <path d="M64 52 L80 20 L100 54 L82 66 Z" fill="${isNight ? "#f7d37b" : "#40545b"}" opacity="${isNight ? "0.85" : "0.45"}"/>
      <path d="M58 164 C58 132 98 132 98 164 L98 197 L58 185 Z" fill="#39494d" opacity="0.56"/>
    </g>
  `;
}

function temple(x: number, y: number, wood: string, isNight: boolean): string {
  return `
    <g transform="translate(${x - 105} ${y - 52})">
      <path d="M0 76 L106 12 L220 78 L112 142 Z" fill="#5e3a2c"/>
      <path d="M34 82 L112 38 L188 84 L112 128 Z" fill="${wood}"/>
      <path d="M52 96 L112 128 L112 190 L52 158 Z" fill="${darken(wood, 14)}"/>
      <path d="M188 84 L112 128 L112 190 L188 148 Z" fill="${darken(wood, 5)}"/>
      <path d="M86 150 C86 124 138 124 138 150 L138 178 L86 178 Z" fill="${isNight ? "#f3c36a" : "#4d332b"}" opacity="${isNight ? "0.82" : "0.56"}"/>
    </g>
  `;
}

function tower(x: number, y: number, color: string, isNight: boolean): string {
  return `
    <g transform="translate(${x} ${y})">
      <path d="M-28 106 L0 -122 L28 106 Z" fill="none" stroke="${color}" stroke-width="16" stroke-linejoin="round"/>
      <path d="M-54 106 L54 106 L24 134 L-24 134 Z" fill="${darken(color, 14)}"/>
      <path d="M-20 34 L20 34 M-13 -18 L13 -18 M-7 -66 L7 -66" stroke="#f6e7d6" stroke-width="10" stroke-linecap="round" opacity="${isNight ? "0.9" : "0.72"}"/>
      <circle cx="0" cy="-122" r="8" fill="${isNight ? "#ffd36d" : "#fff4dc"}"/>
    </g>
  `;
}

function highRise(
  x: number,
  y: number,
  width: number,
  depth: number,
  height: number,
  top: string,
  side: string,
  isNight: boolean
): string {
  return `
    <g transform="translate(${x} ${y})">
      <path d="M0 0 L${width / 2} ${-depth / 2} L${width} 0 L${width / 2} ${depth / 2} Z" fill="${top}"/>
      <path d="M0 0 L${width / 2} ${depth / 2} L${width / 2} ${depth / 2 + height} L0 ${height} Z" fill="${darken(side, 8)}"/>
      <path d="M${width} 0 L${width / 2} ${depth / 2} L${width / 2} ${depth / 2 + height} L${width} ${height} Z" fill="${side}"/>
      ${Array.from({ length: 4 })
        .map((_, index) => {
          const cy = 34 + index * 26;
          return `<circle cx="${width * 0.72}" cy="${cy}" r="3.6" fill="${isNight ? "#ffd776" : "#f7fbff"}" opacity="${isNight ? 0.82 : 0.38}"/>`;
        })
        .join("")}
    </g>
  `;
}

function ferrisWheel(x: number, y: number, color: string, isNight: boolean): string {
  const light = isNight ? "#ffd277" : "#fff2dc";
  return `
    <g transform="translate(${x} ${y})">
      <circle cx="0" cy="0" r="72" fill="none" stroke="${color}" stroke-width="10" opacity="0.9"/>
      <circle cx="0" cy="0" r="9" fill="${color}"/>
      <path d="M0 -72 L0 72 M-72 0 L72 0 M-50 -50 L50 50 M50 -50 L-50 50" stroke="${color}" stroke-width="5" opacity="0.72"/>
      <path d="M-36 86 L0 0 L36 86" stroke="#6b777d" stroke-width="9" fill="none"/>
      <circle cx="0" cy="-72" r="6" fill="${light}"/>
      <circle cx="72" cy="0" r="6" fill="${light}"/>
      <circle cx="0" cy="72" r="6" fill="${light}"/>
      <circle cx="-72" cy="0" r="6" fill="${light}"/>
    </g>
  `;
}

function renderForest(color: string): string {
  return Array.from({ length: 34 })
    .map((_, index) => {
      const x = 360 + ((index * 53) % 480);
      const y = 555 + ((index * 31) % 104);
      const scale = 0.52 + ((index % 5) * 0.06);
      return `<path d="M${x} ${y - 38 * scale} L${x - 22 * scale} ${y + 22 * scale} L${x + 22 * scale} ${y + 22 * scale} Z" fill="${color}" opacity="0.55"/>`;
    })
    .join("");
}

function renderClouds(weather: WeatherCode, isNight: boolean): string {
  if (weather === "clear") {
    return "";
  }

  const opacity = weather === "cloudy" ? 0.7 : 0.45;
  const fill = isNight ? "#dee7f2" : "#ffffff";
  return `
    <g opacity="${opacity}" filter="url(#tinyBlur)">
      <ellipse cx="214" cy="170" rx="90" ry="38" fill="${fill}"/>
      <ellipse cx="285" cy="156" rx="64" ry="34" fill="${fill}"/>
      <ellipse cx="352" cy="180" rx="86" ry="36" fill="${fill}"/>
      <ellipse cx="820" cy="258" rx="120" ry="48" fill="${fill}"/>
      <ellipse cx="910" cy="238" rx="76" ry="38" fill="${fill}"/>
      <ellipse cx="992" cy="264" rx="96" ry="42" fill="${fill}"/>
      ${
        weather === "cloudy" || weather === "rain" || weather === "snow"
          ? `<ellipse cx="574" cy="230" rx="156" ry="56" fill="${fill}"/><ellipse cx="694" cy="212" rx="92" ry="44" fill="${fill}"/>`
          : ""
      }
    </g>
  `;
}

function renderPrecipitation(weather: WeatherCode): string {
  if (weather !== "rain" && weather !== "snow") {
    return "";
  }

  return `<g opacity="${weather === "rain" ? "0.45" : "0.72"}">
    ${Array.from({ length: 58 })
      .map((_, index) => {
        const x = 75 + ((index * 97) % 1050);
        const y = 360 + ((index * 61) % 650);

        if (weather === "snow") {
          return `<circle cx="${x}" cy="${y}" r="${2 + (index % 3)}" fill="#ffffff"/>`;
        }

        return `<path d="M${x} ${y} L${x - 22} ${y + 44}" stroke="#d8f2ff" stroke-width="4" stroke-linecap="round"/>`;
      })
      .join("")}
  </g>`;
}

function renderSeedTexture(seed: number, isNight: boolean): string {
  return Array.from({ length: 20 })
    .map((_, index) => {
      const x = 170 + ((seed + index * 59) % 840);
      const y = 1020 + ((seed + index * 41) % 210);
      return `<circle cx="${x}" cy="${y}" r="${1.6 + (index % 3)}" fill="${isNight ? "#dfe8ff" : "#ffffff"}" opacity="${isNight ? "0.22" : "0.16"}"/>`;
    })
    .join("");
}

function darken(hex: string, amount: number): string {
  const value = hex.replace("#", "");
  const red = Math.max(0, parseInt(value.slice(0, 2), 16) - amount);
  const green = Math.max(0, parseInt(value.slice(2, 4), 16) - amount);
  const blue = Math.max(0, parseInt(value.slice(4, 6), 16) - amount);

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function toHex(value: number): string {
  return value.toString(16).padStart(2, "0");
}
