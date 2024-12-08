export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size to desired output size
  canvas.width = 400; // Fixed size for profile picture
  canvas.height = 400;

  // Draw white circle for background (in case of transparent images)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(200, 200, 200, 0, Math.PI * 2);
  ctx.fill();

  // Create temporary canvas for cropping
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  // Set proper canvas dimensions for the crop
  tempCanvas.width = pixelCrop.width;
  tempCanvas.height = pixelCrop.height;

  // First draw the image on temp canvas with rotation
  tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
  tempCtx.rotate(rotation * (Math.PI / 180));
  tempCtx.translate(-tempCanvas.width / 2, -tempCanvas.height / 2);

  tempCtx.drawImage(
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

  // Draw the temp canvas onto the final canvas with circular mask
  ctx.save();
  ctx.beginPath();
  ctx.arc(200, 200, 200, 0, Math.PI * 2);
  ctx.clip();

  // Scale the cropped image to fit the circle
  const scale = 400 / Math.min(pixelCrop.width, pixelCrop.height);
  const x = 200 - (pixelCrop.width * scale) / 2;
  const y = 200 - (pixelCrop.height * scale) / 2;

  ctx.drawImage(
    tempCanvas,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
    x,
    y,
    pixelCrop.width * scale,
    pixelCrop.height * scale
  );

  ctx.restore();

  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve({ blob, url: URL.createObjectURL(blob) });
    }, 'image/jpeg', 0.95);
  });
};
