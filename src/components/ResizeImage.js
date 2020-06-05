import loadImage from 'blueimp-load-image';

const toBlob = (base64, reject) => {
  const bin = atob(base64.replace(/^.*,/, ''));
  const buffer = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    buffer[i] = bin.charCodeAt(i);
  }
  // Blobを作成
  try {
    const blob = new Blob([buffer.buffer], {
      type: 'image/jpg',
    });
    return blob;
  } catch (e) {
    reject();
    return false;
  }
}

export const resizeImage = (event, maxSize = 1024) => {
  return new Promise((resolve, reject) => {
    const file = event.target.files[0];

    loadImage.parseMetaData(file, (data) => {
      const options = {
        maxWidth: maxSize,
        maxHeight: maxSize,
        canvas: true,
      };
      if (data.exif) {
        options.orientation = data.exif.get('Orientation');
      }
          
      loadImage(file, (canvas) => {
        var scaledImage = loadImage.scale(
          canvas,
          { aspectRatio: 1/1,
            crop: true})
  
        const imageUri = scaledImage.toDataURL('image/jpg');
        const imageFile = toBlob(imageUri, reject);
        resolve({
          imageFile,
          imageUri,
        });
      }, options);

    });
  });
};