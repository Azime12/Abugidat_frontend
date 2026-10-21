/**
 * D25 Photo Compression:
 * Resizes photos to max 600px wide and compresses to ~100 KB target size.
 * Fast, pure browser-canvas based compression with no external dependencies.
 */
export async function compressImageTo100KB(
  fileOrDataUrl: File | string,
  maxWidth = 600,
  targetSizeBytes = 105 * 1024
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    const processImage = () => {
      let width = img.width;
      let height = img.height;

      // Scale down to maxWidth preserving aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Canvas context could not be created"));
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Binary search / iterative quality adjustment to hit ~100 KB
      let quality = 0.85;
      let resultDataUrl = canvas.toDataURL("image/jpeg", quality);

      // Estimate byte size from base64 length (~0.75 * base64 chars)
      let estimatedBytes = Math.round(resultDataUrl.length * 0.75);

      if (estimatedBytes > targetSizeBytes) {
        quality = 0.70;
        resultDataUrl = canvas.toDataURL("image/jpeg", quality);
        estimatedBytes = Math.round(resultDataUrl.length * 0.75);
      }

      if (estimatedBytes > targetSizeBytes) {
        quality = 0.55;
        resultDataUrl = canvas.toDataURL("image/jpeg", quality);
      }

      resolve(resultDataUrl);
    };

    img.onerror = () => reject(new Error("Failed to load image for compression"));

    if (typeof fileOrDataUrl === "string") {
      img.src = fileOrDataUrl;
      if (img.complete) processImage();
      else img.onload = processImage;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
        img.onload = processImage;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
