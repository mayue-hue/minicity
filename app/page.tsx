"use client";

import {
  Download,
  ImageIcon,
  KeyRound,
  Loader2,
  Map,
  PencilLine,
  RefreshCw,
  Sparkles,
  UploadCloud,
  X
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import type { GeneratedImage, ReferenceImageInput, TimeOfDay, WeatherCode } from "@/lib/types";

const weatherOptions: { value: WeatherCode; label: string }[] = [
  { value: "clear", label: "晴朗" },
  { value: "partly_cloudy", label: "多云间晴" },
  { value: "cloudy", label: "多云" },
  { value: "rain", label: "小雨" },
  { value: "snow", label: "降雪" }
];

const timeOptions: { value: TimeOfDay; label: string }[] = [
  { value: "dawn", label: "清晨" },
  { value: "morning", label: "上午" },
  { value: "afternoon", label: "下午" },
  { value: "dusk", label: "黄昏" },
  { value: "night", label: "夜晚" }
];

const defaultCityPrompt =
  "弗赖堡老城，哥特式大教堂作为中心地标，红色屋顶的中世纪房屋，鹅卵石广场，窄街，小水渠，绿色有轨电车，背后有黑森林山坡。";
const maxReferenceImages = 3;

type EnvironmentTheme = {
  label: string;
  textColor: string;
  pageBackground: string;
  panelBackground: string;
  panelBorder: string;
  panelShadow: string;
  stageHalo: string;
  cardShadow: string;
  cardBorder: string;
  imageFilter: string;
  imageOverlay: string;
  noteBackground: string;
  noteColor: string;
};

type EnvironmentStyle = CSSProperties & {
  "--panel-bg": string;
  "--panel-border": string;
  "--panel-shadow": string;
};

function getProviderLabel(provider?: GeneratedImage["provider"]): string {
  if (provider === "openai-image") {
    return "真实模型";
  }

  if (provider === "local-svg") {
    return "本地预览";
  }

  return "未生成";
}

function getDownloadFileName(image: GeneratedImage): string {
  const extension = image.provider === "local-svg" ? "svg" : "png";
  return `minicity-${image.id}.${extension}`;
}

function getEnvironmentTheme(weather: WeatherCode, timeOfDay: TimeOfDay): EnvironmentTheme {
  const isNight = timeOfDay === "night";

  if (weather === "rain") {
    return {
      label: isNight ? "雨夜冷光" : "雨天湿冷光",
      textColor: isNight ? "#eef5f6" : "#17212b",
      pageBackground: isNight
        ? "radial-gradient(circle at 50% 18%, #30445b 0%, #172434 42%, #0d1520 100%)"
        : "radial-gradient(circle at 54% 20%, #cad9dd 0%, #8da5ae 46%, #526a76 100%)",
      panelBackground: isNight ? "rgba(20, 30, 42, 0.72)" : "rgba(238, 244, 242, 0.74)",
      panelBorder: isNight ? "rgba(196, 218, 228, 0.18)" : "rgba(255, 255, 255, 0.58)",
      panelShadow: isNight ? "rgba(4, 10, 18, 0.38)" : "rgba(45, 65, 76, 0.22)",
      stageHalo: isNight
        ? "radial-gradient(circle, rgba(108, 154, 190, 0.26), rgba(8, 14, 22, 0) 68%)"
        : "radial-gradient(circle, rgba(197, 225, 230, 0.76), rgba(67, 93, 104, 0) 70%)",
      cardShadow: isNight
        ? "0 36px 110px rgba(2, 8, 16, 0.64), 0 0 70px rgba(106, 151, 176, 0.16)"
        : "0 34px 90px rgba(38, 61, 72, 0.32), 0 0 54px rgba(223, 245, 248, 0.38)",
      cardBorder: isNight ? "rgba(185, 216, 229, 0.18)" : "rgba(255, 255, 255, 0.62)",
      imageFilter: isNight ? "brightness(0.78) saturate(0.84) contrast(0.98)" : "brightness(0.9) saturate(0.84) contrast(0.94)",
      imageOverlay: "linear-gradient(145deg, rgba(58, 79, 94, 0.28), rgba(214, 237, 240, 0.16) 46%, rgba(14, 25, 35, 0.22))",
      noteBackground: isNight ? "rgba(20, 30, 42, 0.78)" : "rgba(239, 246, 244, 0.82)",
      noteColor: isNight ? "#dce9ee" : "#465e68"
    };
  }

  if (weather === "snow") {
    return {
      label: isNight ? "雪夜蓝白反光" : "雪天漫反射",
      textColor: "#14212e",
      pageBackground: isNight
        ? "radial-gradient(circle at 52% 16%, #d5e8f4 0%, #8ca9c0 44%, #25364d 100%)"
        : "radial-gradient(circle at 52% 16%, #ffffff 0%, #dcecf0 44%, #abc3ca 100%)",
      panelBackground: "rgba(255, 255, 255, 0.72)",
      panelBorder: "rgba(255, 255, 255, 0.86)",
      panelShadow: "rgba(91, 114, 126, 0.18)",
      stageHalo: "radial-gradient(circle, rgba(255, 255, 255, 0.9), rgba(187, 214, 226, 0) 72%)",
      cardShadow: "0 34px 90px rgba(87, 112, 126, 0.28), 0 0 76px rgba(255, 255, 255, 0.72)",
      cardBorder: "rgba(255, 255, 255, 0.88)",
      imageFilter: isNight ? "brightness(0.92) saturate(0.82) contrast(0.96)" : "brightness(1.08) saturate(0.82) contrast(0.92)",
      imageOverlay: "linear-gradient(145deg, rgba(255, 255, 255, 0.28), rgba(206, 231, 245, 0.18) 56%, rgba(118, 151, 170, 0.12))",
      noteBackground: "rgba(255, 255, 255, 0.82)",
      noteColor: "#52636d"
    };
  }

  if (weather === "cloudy") {
    return {
      label: isNight ? "阴天夜间低对比" : "阴天低对比漫射光",
      textColor: isNight ? "#eef2f0" : "#18242b",
      pageBackground: isNight
        ? "radial-gradient(circle at 50% 14%, #3c4a5d 0%, #1b2531 45%, #111820 100%)"
        : "radial-gradient(circle at 50% 14%, #e0e5e3 0%, #b8c4c4 48%, #87989a 100%)",
      panelBackground: isNight ? "rgba(25, 34, 42, 0.72)" : "rgba(250, 252, 249, 0.72)",
      panelBorder: isNight ? "rgba(219, 229, 229, 0.18)" : "rgba(255, 255, 255, 0.7)",
      panelShadow: isNight ? "rgba(5, 9, 14, 0.36)" : "rgba(73, 88, 91, 0.16)",
      stageHalo: isNight
        ? "radial-gradient(circle, rgba(151, 165, 178, 0.2), rgba(17, 24, 32, 0) 70%)"
        : "radial-gradient(circle, rgba(244, 247, 244, 0.74), rgba(139, 153, 153, 0) 72%)",
      cardShadow: isNight ? "0 30px 90px rgba(3, 7, 12, 0.52)" : "0 28px 72px rgba(70, 86, 90, 0.22)",
      cardBorder: isNight ? "rgba(216, 226, 225, 0.16)" : "rgba(255, 255, 255, 0.72)",
      imageFilter: isNight ? "brightness(0.82) saturate(0.78) contrast(0.9)" : "brightness(0.96) saturate(0.82) contrast(0.9)",
      imageOverlay: "linear-gradient(145deg, rgba(160, 173, 176, 0.2), rgba(243, 247, 245, 0.18) 52%, rgba(84, 99, 105, 0.14))",
      noteBackground: isNight ? "rgba(25, 34, 42, 0.78)" : "rgba(250, 252, 249, 0.78)",
      noteColor: isNight ? "#dce3e2" : "#536267"
    };
  }

  if (weather === "clear") {
    return {
      label: isNight ? "晴夜冷月光" : "晴天硬光",
      textColor: isNight ? "#eef4fa" : "#17212b",
      pageBackground: isNight
        ? "radial-gradient(circle at 50% 12%, #38527b 0%, #172342 43%, #0b1220 100%)"
        : "radial-gradient(circle at 54% 12%, #fff3bf 0%, #bfe5ed 40%, #79aec7 100%)",
      panelBackground: isNight ? "rgba(19, 29, 49, 0.72)" : "rgba(255, 255, 255, 0.76)",
      panelBorder: isNight ? "rgba(192, 213, 240, 0.18)" : "rgba(255, 255, 255, 0.76)",
      panelShadow: isNight ? "rgba(5, 10, 22, 0.42)" : "rgba(44, 61, 68, 0.16)",
      stageHalo: isNight
        ? "radial-gradient(circle, rgba(128, 168, 233, 0.24), rgba(8, 14, 28, 0) 70%)"
        : "radial-gradient(circle, rgba(255, 241, 169, 0.72), rgba(105, 171, 202, 0) 72%)",
      cardShadow: isNight
        ? "0 36px 100px rgba(2, 6, 18, 0.62), 0 0 76px rgba(120, 164, 233, 0.18)"
        : "0 34px 96px rgba(68, 91, 89, 0.26), 0 0 70px rgba(255, 231, 135, 0.38)",
      cardBorder: isNight ? "rgba(196, 216, 244, 0.2)" : "rgba(255, 255, 255, 0.82)",
      imageFilter: isNight ? "brightness(0.86) saturate(0.94) contrast(1.02)" : "brightness(1.08) saturate(1.06) contrast(1.04)",
      imageOverlay: isNight
        ? "linear-gradient(145deg, rgba(84, 124, 188, 0.18), rgba(12, 22, 42, 0.18))"
        : "linear-gradient(145deg, rgba(255, 239, 166, 0.22), rgba(255, 255, 255, 0.06) 48%, rgba(75, 119, 122, 0.1))",
      noteBackground: isNight ? "rgba(19, 29, 49, 0.78)" : "rgba(255, 255, 255, 0.8)",
      noteColor: isNight ? "#dce9fb" : "#52645b"
    };
  }

  return {
    label: isNight ? "夜间云隙光" : "多云柔光",
    textColor: isNight ? "#eef4f7" : "#17212b",
    pageBackground: isNight
      ? "radial-gradient(circle at 48% 16%, #435976 0%, #1b2a3d 44%, #0e1722 100%)"
      : "radial-gradient(circle at 52% 14%, #e8f1d5 0%, #a8d6df 42%, #76a9c2 100%)",
    panelBackground: isNight ? "rgba(21, 32, 45, 0.72)" : "rgba(255, 255, 255, 0.74)",
    panelBorder: isNight ? "rgba(202, 220, 232, 0.18)" : "rgba(255, 255, 255, 0.74)",
    panelShadow: isNight ? "rgba(5, 10, 18, 0.38)" : "rgba(44, 61, 68, 0.16)",
    stageHalo: isNight
      ? "radial-gradient(circle, rgba(120, 160, 198, 0.22), rgba(10, 17, 25, 0) 70%)"
      : "radial-gradient(circle, rgba(237, 247, 217, 0.7), rgba(117, 177, 206, 0) 70%)",
    cardShadow: isNight
      ? "0 34px 96px rgba(3, 8, 18, 0.56), 0 0 58px rgba(121, 163, 199, 0.16)"
      : "0 34px 90px rgba(55, 81, 83, 0.26), 0 0 58px rgba(232, 247, 214, 0.36)",
    cardBorder: isNight ? "rgba(202, 220, 232, 0.18)" : "rgba(255, 255, 255, 0.8)",
    imageFilter: isNight ? "brightness(0.84) saturate(0.9) contrast(0.98)" : "brightness(1.02) saturate(1.0) contrast(0.98)",
    imageOverlay: "linear-gradient(145deg, rgba(232, 247, 217, 0.18), rgba(255, 255, 255, 0.08) 48%, rgba(82, 111, 122, 0.12))",
    noteBackground: isNight ? "rgba(21, 32, 45, 0.78)" : "rgba(255, 255, 255, 0.8)",
    noteColor: isNight ? "#dce8ef" : "#52645b"
  };
}

export default function HomePage() {
  const [cityPrompt, setCityPrompt] = useState(defaultCityPrompt);
  const [weatherCode, setWeatherCode] = useState<WeatherCode>("partly_cloudy");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("afternoon");
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [referenceImages, setReferenceImages] = useState<ReferenceImageInput[]>([]);
  const environmentTheme = getEnvironmentTheme(weatherCode, timeOfDay);
  const environmentStyle: EnvironmentStyle = {
    background: environmentTheme.pageBackground,
    color: environmentTheme.textColor,
    "--panel-bg": "rgba(255, 255, 255, 0.76)",
    "--panel-border": "rgba(255, 255, 255, 0.72)",
    "--panel-shadow": environmentTheme.panelShadow
  };

  useEffect(() => {
    const storedApiKey = window.localStorage.getItem("minicity.openaiApiKey") ?? "";
    const storedCityPrompt = window.localStorage.getItem("minicity.cityPrompt") ?? defaultCityPrompt;
    setApiKey(storedApiKey);
    setCityPrompt(storedCityPrompt);
    void generateImage(storedCityPrompt, weatherCode, timeOfDay, true, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateImage(
    promptText: string,
    condition: WeatherCode,
    dayPart: TimeOfDay,
    quiet = false,
    useOpenAI = Boolean(apiKey),
    references = referenceImages
  ) {
    if (!promptText.trim()) {
      setError("请输入城市提示词");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      if (useOpenAI && apiKey.trim()) {
        headers["x-openai-api-key"] = apiKey.trim();
      }

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers,
        body: JSON.stringify({
          cityPrompt: promptText,
          weather: condition,
          timeOfDay: dayPart,
          provider: useOpenAI ? "openai" : "local",
          referenceImages: useOpenAI ? references : []
        })
      });

      const payload = (await response.json()) as { image?: GeneratedImage; error?: string };

      if (!response.ok || !payload.image) {
        throw new Error(payload.error ?? "图像生成失败");
      }

      setGeneratedImage(payload.image);
    } catch (generationError) {
      if (!quiet) {
        setError(generationError instanceof Error ? generationError.message : "图像生成失败");
      }
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden text-[#17212b] transition-colors duration-500" style={environmentStyle}>
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-6 md:grid-cols-[minmax(330px,410px)_minmax(360px,1fr)] md:px-8 lg:px-10">
        <WorkflowControls
          cityPrompt={cityPrompt}
          weatherCode={weatherCode}
          timeOfDay={timeOfDay}
          generatedImage={generatedImage}
          isGenerating={isGenerating}
          error={error}
          apiKey={apiKey}
          referenceImages={referenceImages}
          environmentLabel={environmentTheme.label}
          onCityPromptChange={(nextCityPrompt) => {
            setCityPrompt(nextCityPrompt);
            window.localStorage.setItem("minicity.cityPrompt", nextCityPrompt);
          }}
          onWeatherChange={setWeatherCode}
          onTimeChange={setTimeOfDay}
          onApiKeyChange={(nextApiKey) => {
            setApiKey(nextApiKey);

            if (nextApiKey.trim()) {
              window.localStorage.setItem("minicity.openaiApiKey", nextApiKey.trim());
            } else {
              window.localStorage.removeItem("minicity.openaiApiKey");
            }
          }}
          onReferenceImagesChange={setReferenceImages}
          onGenerate={() =>
            generateImage(cityPrompt, weatherCode, timeOfDay, false, Boolean(apiKey.trim()), referenceImages)
          }
        />

        <section className="flex min-h-[760px] items-center justify-center py-4">
          <WeatherCardPreview
            generatedImage={generatedImage}
            isGenerating={isGenerating}
            environmentTheme={environmentTheme}
            onGenerate={() =>
              generateImage(cityPrompt, weatherCode, timeOfDay, false, Boolean(apiKey.trim()), referenceImages)
            }
          />
        </section>
      </div>
    </main>
  );
}

function WorkflowControls({
  cityPrompt,
  weatherCode,
  timeOfDay,
  generatedImage,
  isGenerating,
  error,
  apiKey,
  referenceImages,
  environmentLabel,
  onCityPromptChange,
  onWeatherChange,
  onTimeChange,
  onApiKeyChange,
  onReferenceImagesChange,
  onGenerate
}: {
  cityPrompt: string;
  weatherCode: WeatherCode;
  timeOfDay: TimeOfDay;
  generatedImage: GeneratedImage | null;
  isGenerating: boolean;
  error: string | null;
  apiKey: string;
  referenceImages: ReferenceImageInput[];
  environmentLabel: string;
  onCityPromptChange: (cityPrompt: string) => void;
  onWeatherChange: (weather: WeatherCode) => void;
  onTimeChange: (timeOfDay: TimeOfDay) => void;
  onApiKeyChange: (apiKey: string) => void;
  onReferenceImagesChange: (images: ReferenceImageInput[]) => void;
  onGenerate: () => void;
}) {
  const [isReadingReferences, setIsReadingReferences] = useState(false);
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const steps = [
    "输入城市提示词",
    "补充参考图片",
    "选择天气状态",
    "模拟环境光照",
    "构建图像提示词",
    "调用图像模型",
    "缓存并叠加界面"
  ];

  return (
    <aside className="flex flex-col gap-5 py-4">
      <div>
        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#5b6f63]">
          <Sparkles size={16} aria-hidden />
          微缩城市工作流
        </div>
        <h1 className="mt-3 max-w-sm text-4xl font-semibold leading-[1.04] text-[#17212b]">
          45 度俯视城市天气卡片
        </h1>
      </div>

      <div className="glass-panel rounded-[28px] p-4">
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#3b4a42]" htmlFor="city-prompt">
          <PencilLine size={16} aria-hidden />
          城市提示词
        </label>
        <textarea
          id="city-prompt"
          className="min-h-32 w-full resize-y rounded-2xl border border-[#d8e2d6] bg-white px-3 py-3 text-sm font-semibold leading-6 outline-none transition focus:border-[#547968] focus:ring-4 focus:ring-[#7ab28f]/20"
          value={cityPrompt}
          placeholder="例如：京都东山，木造寺庙，红色鸟居，传统町屋，樱花树，远处山坡，清晨薄雾。"
          onChange={(event) => onCityPromptChange(event.target.value)}
        />

        <div className="mt-4">
          <label
            className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#b8cbbd] bg-[#f8fbf5] px-4 py-4 text-center transition hover:border-[#547968] hover:bg-white"
            htmlFor="reference-images"
          >
            <UploadCloud size={22} aria-hidden />
            <span className="text-sm font-semibold text-[#3b4a42]">
              参考图片（可选，最多 {maxReferenceImages} 张）
            </span>
            <span className="text-xs font-medium text-[#6a7d72]">PNG / JPG / WebP</span>
          </label>
          <input
            id="reference-images"
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={(event) => {
              setReferenceError(null);
              void handleReferenceImageFiles(
                event.target.files,
                referenceImages,
                onReferenceImagesChange,
                setIsReadingReferences
              ).catch((referenceImageError) => {
                setReferenceError(
                  referenceImageError instanceof Error ? referenceImageError.message : "参考图片读取失败"
                );
              });
              event.target.value = "";
            }}
          />
          {referenceError ? <p className="mt-2 text-xs font-semibold text-[#b14336]">{referenceError}</p> : null}

          {referenceImages.length > 0 ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {referenceImages.map((image, index) => (
                <div key={`${image.name}-${index}`} className="group relative aspect-square overflow-hidden rounded-2xl bg-[#d8e2d6]">
                  <img className="h-full w-full object-cover" src={image.dataUrl} alt={image.name} />
                  <button
                    className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-[#17212b]/84 text-white opacity-90 transition hover:bg-[#17212b]"
                    type="button"
                    aria-label="移除参考图片"
                    onClick={() =>
                      onReferenceImagesChange(referenceImages.filter((_, imageIndex) => imageIndex !== index))
                    }
                  >
                    <X size={15} aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#3b4a42]">天气</span>
            <select
              className="h-11 w-full rounded-2xl border border-[#d8e2d6] bg-white px-3 text-sm font-semibold outline-none transition focus:border-[#547968] focus:ring-4 focus:ring-[#7ab28f]/20"
              value={weatherCode}
              onChange={(event) => onWeatherChange(event.target.value as WeatherCode)}
            >
              {weatherOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#3b4a42]">时间</span>
            <select
              className="h-11 w-full rounded-2xl border border-[#d8e2d6] bg-white px-3 text-sm font-semibold outline-none transition focus:border-[#547968] focus:ring-4 focus:ring-[#7ab28f]/20"
              value={timeOfDay}
              onChange={(event) => onTimeChange(event.target.value as TimeOfDay)}
            >
              {timeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#3b4a42]">
            <KeyRound size={16} aria-hidden />
            图像模型密钥
          </span>
          <input
            className="h-11 w-full rounded-2xl border border-[#d8e2d6] bg-white px-3 text-sm font-semibold outline-none transition focus:border-[#547968] focus:ring-4 focus:ring-[#7ab28f]/20"
            type="password"
            value={apiKey}
            placeholder="粘贴密钥"
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => onApiKeyChange(event.target.value)}
          />
        </label>

        <button
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#17212b] px-4 text-sm font-semibold text-white transition hover:bg-[#25313d] disabled:cursor-not-allowed disabled:opacity-70"
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || isReadingReferences}
        >
          {isGenerating || isReadingReferences ? (
            <Loader2 className="animate-spin" size={18} aria-hidden />
          ) : (
            <ImageIcon size={18} aria-hidden />
          )}
          {isReadingReferences ? "读取参考图" : apiKey.trim() ? "调用真实模型生成" : "生成本地预览"}
        </button>
        {error ? <p className="mt-3 text-sm font-medium text-[#b14336]">{error}</p> : null}
      </div>

      <div className="glass-panel rounded-[28px] p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#3b4a42]">流程</p>
            <p className="text-xs text-[#62756b]">
              {generatedImage?.cached ? "已读取缓存" : "等待生成"} · {environmentLabel}
            </p>
          </div>
          <span className="rounded-full bg-[#e7f0e1] px-3 py-1 text-xs font-bold text-[#476f55]">
            {getProviderLabel(generatedImage?.provider)}
          </span>
        </div>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#dce8d7] text-sm font-bold text-[#3f684d]">
                {index + 1}
              </span>
              <span className="text-sm font-semibold text-[#26362e]">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-[28px] p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#3b4a42]">
          <Map size={16} aria-hidden />
          当前城市描述
        </div>
        <p className="text-sm leading-6 text-[#52645b]">{cityPrompt}</p>
      </div>

      {generatedImage ? (
        <div className="glass-panel rounded-[28px] p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#3b4a42]">生成记录</p>
            <span className="text-xs font-semibold text-[#66786d]">种子 {generatedImage.seed}</span>
          </div>
          <p className="text-xs leading-5 text-[#52645b]">
            {generatedImage.provider === "openai-image" ? "已使用真实图像模型生成。" : "当前为本地预览图。输入密钥后可调用真实模型。"}
          </p>
        </div>
      ) : null}
    </aside>
  );
}

async function handleReferenceImageFiles(
  files: FileList | null,
  currentImages: ReferenceImageInput[],
  onReferenceImagesChange: (images: ReferenceImageInput[]) => void,
  setIsReadingReferences: (isReading: boolean) => void
) {
  if (!files?.length) {
    return;
  }

  if (currentImages.length >= maxReferenceImages) {
    return;
  }

  setIsReadingReferences(true);

  try {
    const availableSlots = Math.max(0, maxReferenceImages - currentImages.length);
    const selectedFiles = Array.from(files).slice(0, availableSlots);
    const nextImages = await Promise.all(selectedFiles.map((file) => fileToReferenceImage(file)));

    onReferenceImagesChange([...currentImages, ...nextImages]);
  } finally {
    setIsReadingReferences(false);
  }
}

function fileToReferenceImage(file: File): Promise<ReferenceImageInput> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const maxEdge = 1024;
      const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("无法读取参考图片"));
        return;
      }

      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);

      resolve({
        dataUrl: canvas.toDataURL("image/jpeg", 0.82),
        name: file.name.replace(/\.[^.]+$/, "") || "reference",
        mimeType: "image/jpeg"
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("参考图片读取失败"));
    };

    image.src = objectUrl;
  });
}

function WeatherCardPreview({
  generatedImage,
  isGenerating,
  environmentTheme,
  onGenerate
}: {
  generatedImage: GeneratedImage | null;
  isGenerating: boolean;
  environmentTheme: EnvironmentTheme;
  onGenerate: () => void;
}) {
  return (
    <div className="relative w-full max-w-[760px]">
      <div
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[56px] blur-2xl transition-colors duration-500"
        style={{ background: environmentTheme.stageHalo }}
      />
      <section
        className="relative aspect-square w-full overflow-hidden rounded-[38px] bg-[#73acd8] transition-shadow duration-500"
        style={{
          border: `1px solid ${environmentTheme.cardBorder}`,
          boxShadow: environmentTheme.cardShadow
        }}
      >
        {generatedImage?.imageUrl ? (
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={generatedImage.imageUrl}
            alt="45 度俯视城市沙盘背景图"
            style={{ filter: environmentTheme.imageFilter }}
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#74b4e0_0%,#85c3e8_48%,#6aa5cf_100%)]" />
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: environmentTheme.imageOverlay, mixBlendMode: "soft-light" }}
        />

        {!generatedImage?.imageUrl ? (
          <button
            className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#17212b] shadow-xl transition hover:bg-[#f6f4e8] disabled:opacity-70"
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} aria-hidden /> : <RefreshCw size={18} aria-hidden />}
            生成
          </button>
        ) : null}
      </section>

      {generatedImage?.imageUrl ? (
        <div
          className="mt-4 flex flex-col gap-3 rounded-[24px] p-3 shadow-sm ring-1 ring-white/60 sm:flex-row sm:items-center sm:justify-between"
          style={{ background: environmentTheme.noteBackground }}
        >
          <p className="text-sm font-semibold" style={{ color: environmentTheme.noteColor }}>
            当前下载为纯背景图，不包含天气、日期或界面文字；环境光已写入生成提示词和本地预览。
          </p>
          <a
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#17212b] px-4 text-sm font-semibold text-white transition hover:bg-[#25313d]"
            href={generatedImage.imageUrl}
            download={getDownloadFileName(generatedImage)}
          >
            <Download size={17} aria-hidden />
            下载图片
          </a>
        </div>
      ) : null}
    </div>
  );
}
