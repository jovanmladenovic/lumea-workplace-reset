export {};

declare global {
  interface Window {
    electronAPI: {
      // Auth methods
      getAuthToken: (data: { faceId: string }) => Promise<string>;
      // Ambient-layer engagement counters (aggregate only, persisted to a local
      // JSON file — see main.ts). Optional: absent in the GitHub Pages preview
      // build, which never runs inside Electron.
      incrementCount?: (
        counterName: 'passersBy' | 'approaches' | 'engagements'
      ) => Promise<{ passersBy: number; approaches: number; engagements: number }>;
      getCounts?: () => Promise<{ passersBy: number; approaches: number; engagements: number }>;
      // Environment variables available synchronously
      env: {
        DEVICE_ID: string;
        SKIP_VIDEOS: boolean;
        ENABLE_LOGGER: boolean;
        INPUT_VIDEO_ROTATION: number;
        INPUT_VIDEO_ZOOM_FACTOR: number;
        BASE_ANIMATION_DURATION: number;
        FACE_RECOGNITION_CHECK_INTERVAL: number;
        FACE_RECOGNITION_LOGOUT_TIME_WINDOW: number;
        FACE_RECOGNITION_MAX_FACE_ANGLE: number;
        FACE_RECOGNITION_MAX_FACE_DISTANCE: number;
      };
    };
  }
}
