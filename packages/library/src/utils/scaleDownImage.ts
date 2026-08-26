/**
 * Scales down an image to max 1200x1200 while maintaining aspect ratio.
 * @param fileOrBlob - The image as a File or Blob.
 * @param maxWidth - Maximum width (default 1200).
 * @param maxHeight - Maximum height (default 1200).
 * @returns Promise<Blob> - The scaled image as a Blob (JPEG or PNG).
 */
export async function scaleDownImage(fileOrBlob: File | Blob, maxWidth = 1200, maxHeight = 1200): Promise<Blob> {
    // Read image as data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrBlob);
    });

    // Create image element
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = dataUrl;
    });

    const originalWidth = img.width;
    const originalHeight = img.height;

    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (originalWidth > maxWidth || originalHeight > maxHeight) {
        const widthRatio = maxWidth / originalWidth;
        const heightRatio = maxHeight / originalHeight;
        const ratio = Math.min(widthRatio, heightRatio);
        newWidth = Math.round(originalWidth * ratio);
        newHeight = Math.round(originalHeight * ratio);
    } else {
        // Already small enough, return original
        return fileOrBlob;
    }

    // Draw to canvas
    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    // Get output format
    const type = fileOrBlob.type === "image/png" ? "image/png" : "image/jpeg";
    const quality = 0.92; // JPEG quality

    // Convert canvas to Blob
    return new Promise<Blob>((resolve) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) throw new Error("Failed to scale image");
                resolve(blob);
            },
            type,
            quality
        );
    });
}
