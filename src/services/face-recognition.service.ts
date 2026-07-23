import {
  FaceRecognition,
  FaceRecognitionEvents as _FaceRecognitionEvents,
  type FaceDetectionResult,
} from '@fitsee/face-recognition';
import { PersonDetection, PersonDetectionEvents } from '@fitsee/user-tasks';

import {
  INPUT_VIDEO_ROTATION,
  FACE_RECOGNITION_CHECK_INTERVAL,
  FACE_RECOGNITION_LOGOUT_TIME_WINDOW,
  FACE_RECOGNITION_MAX_FACE_ANGLE,
  FACE_RECOGNITION_MAX_FACE_DISTANCE,
  BASE_ANIMATION_DURATION,
} from '@/constants';

const FaceRecognitionEvents = {
  ..._FaceRecognitionEvents,
  ...PersonDetectionEvents,
  INACTIVITY_WARNING: 'INACTIVITY_WARNING',
};
export { FaceRecognitionEvents };
export class FaceRecognitionService {
  faceRecognition: FaceRecognition;
  personDetection: PersonDetection;

  private readyPromise: Promise<void>;
  private resolveReadyPromise: () => void;

  private inactivityTimer: number | null = null;
  private readonly INACTIVITY_WARNING_THRESHOLD = 90 * BASE_ANIMATION_DURATION;
  private isMonitoringLogout = false;

  callbacks: Map<typeof FaceRecognitionEvents, (payload: any) => void> = new Map();

  constructor() {
    this.readyPromise = new Promise<void>(resolve => {
      this.resolveReadyPromise = resolve;
    });
  }

  onReady(callback?: () => void): Promise<void> {
    if (callback) {
      this.readyPromise.then(callback);
    }
    return this.readyPromise;
  }

  on(event: typeof FaceRecognitionEvents, callback: (payload: any) => void) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, callback);
    }
  }

  off(event: typeof FaceRecognitionEvents) {
    if (this.callbacks.has(event)) {
      this.callbacks.delete(event);
    }
  }

  pauseMonitoring() {
    this.personDetection.pause();
  }

  resumeMonitoring() {
    this.personDetection.resume();
  }

  startInactivityTimer() {
    this.inactivityTimer = window.setTimeout(() => {
      this.handleEvent(FaceRecognitionEvents.INACTIVITY_WARNING);
    }, this.INACTIVITY_WARNING_THRESHOLD);
  }

  stopInactivityTimer() {
    if (this.inactivityTimer !== null) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  private handleEvent(event: typeof FaceRecognitionEvents, detection?: FaceDetectionResult) {
    console.log(event);
    if (this.callbacks.has(event)) {
      this.callbacks.get(event)!(detection);
    }
  }

  monitorLogout() {
    if (this.isMonitoringLogout) {
      return;
    }
    this.isMonitoringLogout = true;

    this.personDetection.subscribe(
      PersonDetectionEvents.PERSON_MISSING,
      (payload: { eventName: PersonDetectionEvents }) => {
        console.log('⚠️ PERSON MISSING', payload);
      }
    );

    this.personDetection.subscribe(
      PersonDetectionEvents.LOGOUT,
      (payload: { eventName: PersonDetectionEvents }) => {
        this.handleEvent(FaceRecognitionEvents.LOGOUT);
      }
    );

    this.personDetection.initialize();
  }

  findMatchIndex(detection: FaceDetectionResult, allFaceSnapshots: Float32Array[]): number {
    return this.faceRecognition.findMatch(detection, allFaceSnapshots);
  }

  init(videoEl: HTMLVideoElement): void {
    this.faceRecognition = new FaceRecognition({
      videoElement: videoEl,
      initializeVideo: false,
      videoRotation: INPUT_VIDEO_ROTATION,
      checkInterval: FACE_RECOGNITION_CHECK_INTERVAL,
      logoutTimeWindow: FACE_RECOGNITION_LOGOUT_TIME_WINDOW,
      maxFaceAngle: FACE_RECOGNITION_MAX_FACE_ANGLE,
      maxFaceDistance: FACE_RECOGNITION_MAX_FACE_DISTANCE,
    });

    this.faceRecognition.subscribe(
      FaceRecognitionEvents.LOGIN,
      ({ detection }: { detection: FaceDetectionResult }) => {
        this.handleEvent(FaceRecognitionEvents.LOGIN, detection);
      }
    );

    this.faceRecognition.subscribe(
      FaceRecognitionEvents.FACE_DETECTED,
      ({ detection }: { detection: FaceDetectionResult }) => {
        this.handleEvent(FaceRecognitionEvents.FACE_DETECTED, detection);
      }
    );

    this.faceRecognition.subscribe(
      FaceRecognitionEvents.ERROR,
      ({ detection }: { detection: FaceDetectionResult }) => {
        this.handleEvent(FaceRecognitionEvents.ERROR, detection);
      }
    );

    this.personDetection = new PersonDetection({
      videoElement: videoEl,
      logoutTimeWindow: FACE_RECOGNITION_LOGOUT_TIME_WINDOW,
    });

    this.resolveReadyPromise();
  }

  startDetection(): void {
    if (!this.faceRecognition.isInitialized) {
      this.faceRecognition.initialize();
    }

    this.faceRecognition.monitorIdle();
  }

  // Convenience helper to ensure readiness and return to idle monitoring mode
  async startIdleMonitoring(): Promise<void> {
    await this.onReady();
    this.startDetection();
  }

  stopDetection(): void {
    if (!this.faceRecognition || !this.faceRecognition.isInitialized) {
      return;
    }

    this.faceRecognition.unsubscribe(FaceRecognitionEvents.FACE_DETECTED);
    this.faceRecognition.unsubscribe(FaceRecognitionEvents.LOGIN);
    this.faceRecognition.unsubscribe(FaceRecognitionEvents.LOGOUT);
    this.faceRecognition.unsubscribe(FaceRecognitionEvents.PERSON_MISSING);
    this.faceRecognition.unsubscribe(FaceRecognitionEvents.PERSON_PRESENT);

    if (this.personDetection && this.isMonitoringLogout) {
      this.personDetection.unsubscribe(PersonDetectionEvents.PERSON_MISSING);
      this.personDetection.unsubscribe(PersonDetectionEvents.LOGOUT);
      this.isMonitoringLogout = false;
    }

    // Preserve LOGOUT and INACTIVITY_WARNING callbacks as they should persist across sessions
    const logoutCallback = this.callbacks.get(FaceRecognitionEvents.LOGOUT);
    const inactivityCallback = this.callbacks.get(FaceRecognitionEvents.INACTIVITY_WARNING);
    this.callbacks.clear();
    if (logoutCallback) {
      this.callbacks.set(FaceRecognitionEvents.LOGOUT, logoutCallback);
    }
    if (inactivityCallback) {
      this.callbacks.set(FaceRecognitionEvents.INACTIVITY_WARNING, inactivityCallback);
    }
  }
}

export const faceRecognition = new FaceRecognitionService();
