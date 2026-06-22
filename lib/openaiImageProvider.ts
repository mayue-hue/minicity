type GenerateOpenAIImageInput = {
  apiKey: string;
  prompt: string;
  referenceImages?: Array<{
    dataUrl: string;
    name: string;
    mimeType: string;
  }>;
};

type OpenAIImageResponse = {
  data?: Array<{
    b64_json?: string;
    revised_prompt?: string;
    url?: string;
  }>;
  error?: {
    message?: string;
    type?: string;
  };
};

export const openAIImageModel = "gpt-image-2";

export async function generateOpenAIImage({
  apiKey,
  prompt,
  referenceImages = []
}: GenerateOpenAIImageInput): Promise<Buffer> {
  if (referenceImages.length > 0) {
    return generateOpenAIImageEdit({ apiKey, prompt, referenceImages });
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: openAIImageModel,
      prompt,
      size: "1024x1024",
      quality: "medium",
      output_format: "png",
      background: "opaque"
    })
  });
  const payload = (await response.json()) as OpenAIImageResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `OpenAI image request failed with ${response.status}`);
  }

  const imageBase64 = payload.data?.[0]?.b64_json;

  if (!imageBase64) {
    throw new Error("OpenAI image response did not include b64_json image data");
  }

  return Buffer.from(imageBase64, "base64");
}

async function generateOpenAIImageEdit({
  apiKey,
  prompt,
  referenceImages
}: Required<GenerateOpenAIImageInput>): Promise<Buffer> {
  const formData = new FormData();
  formData.append("model", openAIImageModel);
  formData.append(
    "prompt",
    `${prompt} Use the provided image only as visual reference for style, composition, proportions, and city-block scale. Do not copy any text, numbers, UI, logos, or watermarks from the reference image.`
  );
  formData.append("size", "1024x1024");
  formData.append("quality", "medium");
  formData.append("output_format", "png");
  formData.append("background", "opaque");

  for (const referenceImage of referenceImages) {
    const blob = dataUrlToBlob(referenceImage.dataUrl, referenceImage.mimeType);
    formData.append("image[]", blob, referenceImage.name || "reference.png");
  }

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`
    },
    body: formData
  });
  const payload = (await response.json()) as OpenAIImageResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `OpenAI image edit request failed with ${response.status}`);
  }

  const imageBase64 = payload.data?.[0]?.b64_json;

  if (!imageBase64) {
    throw new Error("OpenAI image edit response did not include b64_json image data");
  }

  return Buffer.from(imageBase64, "base64");
}

function dataUrlToBlob(dataUrl: string, fallbackMimeType: string): Blob {
  const [metadata, base64Data] = dataUrl.split(",");

  if (!metadata || !base64Data) {
    throw new Error("参考图片格式无效");
  }

  const mimeTypeMatch = metadata.match(/^data:([^;]+);base64$/);
  const mimeType = mimeTypeMatch?.[1] ?? fallbackMimeType;
  const bytes = new Uint8Array(Buffer.from(base64Data, "base64"));

  return new Blob([bytes], { type: mimeType });
}
