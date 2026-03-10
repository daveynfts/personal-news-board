/**
 * Converts an image File to a WebP Blob using the browser Canvas API.
 * This reduces file size significantly before uploading to Vercel Blob.
 */
export async function convertToWebP(file: File, quality = 0.85): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas toBlob failed'));
                            return;
                        }
                        // Use original filename but with .webp extension
                        const newName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
                        const webpFile = new File([blob], newName, { type: 'image/webp' });
                        resolve(webpFile);
                    },
                    'image/webp',
                    quality
                );
            } catch (err) {
                reject(err);
            } finally {
                URL.revokeObjectURL(url);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}
