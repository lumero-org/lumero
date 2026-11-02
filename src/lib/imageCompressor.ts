/**
 * Uncompressed Image Reader.
 * Image compression removed — preserves 100% original image quality,
 * full resolution, and color fidelity directly from the uploaded file.
 */

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || "");
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Backward-compatible aliases (no compression applied)
export const fileToDataUrlUncompressed = fileToDataUrl;
export const compressProductImage = (file: File) => fileToDataUrl(file);
export const optimizeBannerImage = (file: File) => fileToDataUrl(file);
