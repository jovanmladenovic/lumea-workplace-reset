import {
  FaceRecognition,
  FaceRecognitionEvents,
  type FaceDetectionResult,
} from '@fitsee/face-recognition';
import { Users } from './Users';

const initializeVideoStream = (videoElement: HTMLVideoElement): Promise<HTMLVideoElement> => {
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: 'user' },
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
    } else {
      console.error('MediaDevices interface not available.');
      reject(videoElement);
    }
  });
};

const init = async (): Promise<void> => {
  const videoEl = document.getElementById('video-input');

  if (videoEl === null || !(videoEl instanceof HTMLVideoElement)) {
    throw new Error('Video element is missing.');
  }

  initializeVideoStream(videoEl).then(() => {
    const detector: FaceRecognition = new FaceRecognition({
      videoElement: videoEl,
      initializeVideo: false,
      videoRotation: 0,
      checkInterval: 1,
      logoutTimeWindow: 3,
      maxFaceAngle: 30,
      maxFaceDistance: 0.5,
    });
    detector.subscribe(FaceRecognitionEvents.LOGIN, payload => {
      console.log('event____', payload.eventName, payload);

      const login = async () => {
        const detection = payload.detection;

        await authenticateUser(detector, detection);
        detector.monitorLogout(detection);
      };

      login();
    });

    detector.subscribe(FaceRecognitionEvents.LOGOUT, payload => {
      console.log('event____', payload.eventName, payload);

      // TODO Log off user
    });

    detector.subscribe(FaceRecognitionEvents.FACE_DETECTED, payload => {
      console.log('event____', payload.eventName, payload);
    });

    detector.subscribe(FaceRecognitionEvents.FACE_MISSING, payload => {
      console.log('event____', payload.eventName, payload);
    });

    detector.subscribe(FaceRecognitionEvents.ERROR, payload => {
      console.log('error____', payload.eventName, payload);
    });

    detector.initialize();
    detector.monitorIdle();

    /*
        setTimeout(() => {
            recognitionModule.dispose();
        }, 1000);
        */
  });
};

const getAllFaceSnapshots = async (): Promise<Float32Array[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const vectors: Float32Array[] = [];

      for (const user of Users) {
        const faceDescriptor = new Float32Array(Object.values(user.faceDescriptor));
        vectors.push(faceDescriptor);
      }

      resolve(vectors);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

const addFaceSnapshot = async (faceSnapshot: any): Promise<string> => {
  const id: string = Math.floor(Math.random() * 1000).toString();
  await new Promise(resolve => setTimeout(resolve, 1000));

  return id;
};

const authenticateUser = async (detector: FaceRecognition, target: FaceDetectionResult) => {
  const allFaceSnapshots: Float32Array[] = await getAllFaceSnapshots();
  const descriptorIndex: number = detector.findMatch(target, allFaceSnapshots);
  const isMatch: boolean = descriptorIndex >= 0;

  if (!isMatch) {
    // If no match is found, add face snapshot
    const faceSnapshot = {
      vector: JSON.stringify(target.descriptor),
      createdAt: new Date().toISOString(),
    };

    const snapshotId = await addFaceSnapshot(faceSnapshot);

    console.log(snapshotId, target.descriptor);
  }
};

setTimeout(() => {
  init();
}, 300);
