import { PersonDetection, PersonDetectionEvents } from '@fitsee/user-tasks';

export { PersonDetectionEvents };

// Body-pose-based presence sensor — mediapipe pose landmarks only, no face
// recognition, no identity, matches the "body pose detection only" decision in
// docs/lumea-project-handoff.md. Wraps @fitsee/user-tasks' PersonDetection, which
// isn't used anywhere else in this app yet.
//
// checkInterval/logoutTimeWindow below are placeholders — not yet tuned against
// real foot traffic on the actual device. See README "Open items".
class PersonDetectionService {
  private _detector: PersonDetection | null = null;
  private _resolveReady!: (detector: PersonDetection) => void;
  private _readyPromise: Promise<PersonDetection> = new Promise(resolve => {
    this._resolveReady = resolve;
  });

  init(videoElement: HTMLVideoElement): void {
    if (this._detector) return;

    this._detector = new PersonDetection({
      videoElement,
      checkInterval: 500,
      logoutTimeWindow: 3,
    });

    this._detector.initialize();
    this._resolveReady(this._detector);
  }

  onReady(): Promise<PersonDetection> {
    return this._readyPromise;
  }
}

export const personDetectionService = new PersonDetectionService();
