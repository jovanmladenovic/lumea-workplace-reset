export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getImageUrl(path: string) {
  return new URL(`../assets/images/${path}.png`, import.meta.url).href;
}

export const initializeVideoStream = (
  videoElement: HTMLVideoElement
): Promise<HTMLVideoElement> => {
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .enumerateDevices()
        .then(devices => {
          const cameraIndex = 0;
          // TODO: Read from .env
          const idealWidth = 1920;
          const idealHeight = 1080;

          const videoDevices = devices.filter(device => device.kind === 'videoinput');

          if (videoDevices.length <= 0) {
            console.error(`Unable to access the camera/webcam.`);
            reject(videoElement);
            return;
          }

          const cIndex = Math.min(Math.max(0, cameraIndex), videoDevices.length - 1);
          const cameraId = videoDevices[cIndex].deviceId;
          const constraints: MediaStreamConstraints = {
            video: {
              deviceId: { exact: cameraId },
              width: { ideal: idealWidth },
              height: { ideal: idealHeight },
            },
          };

          navigator.mediaDevices
            .getUserMedia(constraints)
            .then(stream => {
              videoElement.addEventListener(
                'loadedmetadata',
                e => {
                  resolve(videoElement);
                },
                false
              );

              videoElement.srcObject = stream;
              videoElement.play();
            })
            .catch(error => {
              console.error(`Unable to access the camera/webcam... ${error}`);
              reject(videoElement);
            });
        })
        .catch(error => {
          console.error(`Unable to enumerate devices... ${error}`);
          reject(videoElement);
        });
    } else {
      console.error('Unable to access media devices');
      reject(videoElement);
    }
  });
};

export const getRandomItemFromArray = (array: any[]) => {
  return array[Math.floor(Math.random() * array.length)];
};

export function getColor(
  colorName: string
): { light: string; medium: string; dark: string } | undefined {
  switch (colorName) {
    case 'blue':
      return {
        light: '#C7D8ED',
        medium: '#90B8EA', // Color del lado derecho del gradiente
        dark: '#5785BF',
      };
    case 'matcha':
      return {
        light: '#CEE3CC',
        medium: '#99D192',
        dark: '#63A25B',
      };
    case 'purple':
      return {
        light: '#D7C9EB',
        medium: '#B490EA',
        dark: '#7D5BB1',
      };
    case 'rose':
      return {
        light: '#EDC9CE',
        medium: '#EA909E',
        dark: '#C16473',
      };
    case 'peach':
      return {
        light: '#FAEAE0',
        medium: '#EAB090',
        dark: '#C68968',
      };
    default:
      return undefined;
  }
}
