export const getCroppedImg = (
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> => {
    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
            image.src = url;
        });

    return new Promise(async (resolve, reject) => {
        try {
            const image = await createImage(imageSrc);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return reject(new Error('No 2d context'));
            }

            // set width to double for high resolution (optional, or just stick to pixelCrop)
            // sticking to pixelCrop width/height for exact output
            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;

            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height
            );

            // As Blob
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Canvas is empty');
                    return reject(new Error('Canvas is empty'));
                }
                resolve(blob);
            }, 'image/jpeg');
        } catch (e) {
            reject(e);
        }
    });
};
