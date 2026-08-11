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

    // Unconditional (not gated by ENABLE_LOGGER) — this is the quickest way to
    // confirm from DevTools that the camera + pose model are actually running.
    this._detector.subscribe(PersonDetectionEvents.PERSON_PRESENT, () =>
      console.log('[person-detection] PERSON_PRESENT')
    );
    this._detector.subscribe(PersonDetectionEvents.PERSON_MISSING, () =>
      console.log('[person-detection] PERSON_MISSING')
    );

    this._detector.initialize();
    console.log('[person-detection] PersonDetection initialized against', videoElement);
    this._resolveReady(this._detector);
  }

  onReady(): Promise<PersonDetection> {
    return this._readyPromise;
  }
}

export const personDetectionService = new PersonDetectionService();
