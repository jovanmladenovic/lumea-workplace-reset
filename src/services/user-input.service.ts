import { UserInput, GestureLabel, HandCursorResult } from '@fitsee/user-input';

import {
  ColorPickerOptions,
  ConfirmSelectOptions,
  InputEmitEvents,
  InputReceiveEvents,
  TutorialOptions,
} from '@/utils';
import {
  INPUT_VIDEO_ROTATION,
  INPUT_VIDEO_ZOOM_FACTOR,
  ENABLE_LOGGER,
} from '@/constants/env.constants';

import { Logger } from './logger.service';

export { GestureLabel, HandCursorResult };

const logger = new Logger(ENABLE_LOGGER);

type EventNamesContainer = Record<string, any>;
type EventHandler = (opt?: any) => void;

type OutputGestureResponse = {
  label: GestureLabel;
  value?: number | HandCursorResult;
};

type SocketEmitEventsPayload = {
  type: string;
  options?: (string | number)[];
};

type SocketEmitOption = {
  receiveEvent: string;
  label: string;
  value?: number | HandCursorResult;
  option?: string | number;
};

const RequestToReceiveEventMappings: Record<InputEmitEvents, InputReceiveEvents | 'cancel'> = {
  [InputEmitEvents.request_camera_frames]: InputReceiveEvents.user_input,
  [InputEmitEvents.cancel_camera_frames]: 'cancel',
  [InputEmitEvents.request_user_input]: InputReceiveEvents.user_input,
  [InputEmitEvents.request_back]: InputReceiveEvents.back,
  [InputEmitEvents.cancel_request_back]: 'cancel',
};

const RequestToGestureMappings: Record<string, OutputGestureResponse> = {
  [InputEmitEvents.request_back]: { label: GestureLabel.CLOSED_PALM },
  [InputEmitEvents.request_user_input]: { label: GestureLabel.NUMBER },
};

const TutorialOptionsToGesturesMappings: Record<TutorialOptions, OutputGestureResponse> = {
  [TutorialOptions.one]: { label: GestureLabel.NUMBER, value: 1 },
  [TutorialOptions.seven]: { label: GestureLabel.NUMBER, value: 7 },
  [TutorialOptions.eight]: { label: GestureLabel.NUMBER, value: 8 },
  [TutorialOptions.zero]: { label: GestureLabel.NUMBER, value: 0 },
  [TutorialOptions.stop]: { label: GestureLabel.CLOSED_PALM },
  [TutorialOptions.ok]: { label: GestureLabel.THUMB_UP },
  [TutorialOptions.cross]: { label: GestureLabel.FINGERS_CROSSED },
};

const ConfirmSelectOptionsToGesturesMappings: Record<ConfirmSelectOptions, OutputGestureResponse> =
  {
    [ConfirmSelectOptions.yes]: { label: GestureLabel.THUMB_UP },
    [ConfirmSelectOptions.no]: { label: GestureLabel.CLOSED_FIST },
  };

const ColorPickerSelectOptionsToGesturesMappings: Record<
  ColorPickerOptions,
  OutputGestureResponse
> = {
  [ColorPickerOptions.swipeLeft]: { label: GestureLabel.SWIPE, value: -1 },
  [ColorPickerOptions.swipeRight]: { label: GestureLabel.SWIPE, value: 1 },
  [ColorPickerOptions.random]: { label: GestureLabel.VICTORY },
  [ColorPickerOptions.ok]: { label: GestureLabel.THUMB_UP },
};

const OptionsToGestureMappings: Record<string | number, any> = {
  tutorial: TutorialOptionsToGesturesMappings,
  confirm: ConfirmSelectOptionsToGesturesMappings,
  yes: ConfirmSelectOptionsToGesturesMappings,
  colorPicker: ColorPickerSelectOptionsToGesturesMappings,
};

class Observable {
  protected _eventHandlers: Map<string, EventHandler[]> = new Map<string, EventHandler[]>();

  public on(nameOrContainer: string | EventNamesContainer, handler?: EventHandler): Observable {
    if (typeof nameOrContainer === 'string') {
      const eventName: string = nameOrContainer;

      if (handler && typeof handler === 'function') {
        if (!this._eventHandlers.has(eventName)) {
          this._eventHandlers.set(eventName, []);
        }

        (<EventHandler[]>this._eventHandlers.get(eventName)).push(handler);
      }
    } else {
      const container: EventNamesContainer = nameOrContainer;

      for (let key in container) {
        const handler: any = container[key];
        this.on(key, handler);
      }
    }

    return this;
  }

  public off(
    nameOrContainer?: string | EventNamesContainer,
    handler?: EventHandler | null
  ): Observable {
    if (!nameOrContainer) {
      this._eventHandlers.forEach((value, key) => {
        this.removeEventHandler(key);
      });

      return this;
    }

    if (typeof nameOrContainer === 'string') {
      const eventName: string = nameOrContainer;

      if (!this._eventHandlers.has(eventName)) {
        return this;
      }

      if (handler && typeof handler === 'function') {
        this.removeEventHandler(eventName, handler);
      } else {
        this.removeEventHandler(eventName);
      }
    } else {
      const container: EventNamesContainer = nameOrContainer;
      for (let key in container) {
        const handler: any = container[key];
        this.off(key, handler);
      }
    }

    return this;
  }

  public dispatch(eventName: string, options?: any): Observable {
    if (this._eventHandlers.size <= 0 || !this._eventHandlers.has(eventName)) {
      return this;
    }

    const handlers: EventHandler[] = <EventHandler[]>this._eventHandlers.get(eventName);
    handlers.forEach(handler => handler(options));

    return this;
  }

  public dispose(): void {
    this.dispatch('dispose');
    this.release();
  }

  protected release(): void {
    this._eventHandlers.clear();
  }

  protected removeEventHandler(eventName: string, handler?: EventHandler): void {
    if (!this._eventHandlers.has(eventName)) {
      return;
    }

    const handlersList: EventHandler[] = <EventHandler[]>this._eventHandlers.get(eventName);

    if (handler) {
      const index: number = handlersList.indexOf(handler);
      if (index >= 0) {
        handlersList.splice(index, 1);
      }
    } else {
      this._eventHandlers.set(eventName, []);
    }
  }
}

class UserInputService extends Observable {
  protected _userInput: UserInput;
  protected _videoElement: HTMLVideoElement | null = null;

  protected _responseOptions: SocketEmitOption[] = [];

  protected _containerWidth: number = -1;
  protected _containerHeight: number = -1;

  constructor() {
    super();

    this._userInput = new UserInput({
      videoRotation: INPUT_VIDEO_ROTATION,
      videoZoomFactor: INPUT_VIDEO_ZOOM_FACTOR,
      isDebug: false,
      handGestureProps: {
        filterBeta: 15,
        filterMinCutoff: 1,
        filterDCutOff: 1,
      },
    });

    this._userInput.setOnErrorCallback((type: string) => this.handleOnError(type));
    this._userInput.setOnEventCallback((type: string, data: any) => this.handleOnEvent(type, data));

    this._userInput.initialize();
  }

  public setVideoElement(videoElement: HTMLVideoElement, isInitialized: boolean = true): void {
    this._userInput.setInputVideoStream(videoElement, isInitialized);
    this._videoElement = videoElement;
  }

  public setContainerSize(width: number, height: number): void {
    this._containerWidth = width;
    this._containerHeight = height;
  }

  public emit(event: InputEmitEvents, payload?: SocketEmitEventsPayload): void {
    logger.log('emit:: payload:', payload);

    const receiveEvent: InputReceiveEvents | 'cancel' = RequestToReceiveEventMappings[event];

    if (receiveEvent === 'cancel') {
      this.stop();
      return;
    }

    if (payload) {
      if (payload.options) {
        const mappings: Record<string | number, any> = OptionsToGestureMappings[payload.type] || {};

        if (payload.type === GestureLabel.NUMBER) {
          payload.options.forEach(option => {
            mappings[option] = { label: GestureLabel.NUMBER, value: option };
          });
        }

        payload.options.forEach(option => {
          const label: string = mappings[option].label;
          const value: number | undefined = mappings[option].value;

          this._responseOptions.push({ receiveEvent, option, label, value });
        });
      } else {
        // this._responseOptions.push({ receiveEvent, label: OutputGestureLabel.NUMBER });
        this._responseOptions.push({ receiveEvent, label: payload.type });
      }
    } else {
      const expected: OutputGestureResponse = RequestToGestureMappings[event];
      const label: string = expected.label;
      const value: number | HandCursorResult | undefined = expected.value;

      this._responseOptions.push({ receiveEvent, label, value });
    }

    const labels: string[] = [];

    this._responseOptions.forEach(option => {
      const label: string = option.label;
      if (!labels.includes(label)) {
        labels.push(label);
      }
    });

    logger.log('emit:: labels:', labels);

    this._userInput.wait(labels, true);
  }

  protected release(): void {
    super.release();

    this._userInput.dispose();
  }

  protected handleOnError(type: string): void {
    logger.warn('UserInput Error:', type);
  }

  protected handleOnEvent(type: string, data: any): void {
    logger.log('input::handleOnEvent', type, data);

    if (data) {
      const response: any = data.data;
      const label: string = response.label;
      const value: number | HandCursorResult | undefined = response.value;

      logger.log('handleOnEvent:: label, value:', label, value);
      logger.log('handleOnEvent:: options:', this._responseOptions);

      if (label === GestureLabel.CURSOR) {
        const position: HandCursorResult = <HandCursorResult>value;
        position.x = (1 - position.x) * this._containerWidth;
        position.y *= this._containerHeight;
      }

      const result: SocketEmitOption | undefined = this._responseOptions.find(
        el => el.label === label && (el.value ? el.value === value : true)
      );

      logger.log('handleOnEvent:: result:', result);

      if (result === undefined) return;

      if (label !== GestureLabel.CURSOR) {
        this.stop();
      }

      this.dispatch(result.receiveEvent, result.option ?? value);
    }
  }

  protected stop(): void {
    this._userInput.stop();
    this._responseOptions = [];
  }

  protected adjustCursorOutput(output: HandCursorResult, toWidth: number, toHeight: number): void {
    output.x = output.x * toWidth;
    output.y = output.y * toHeight;
  }
}

export const userInput = new UserInputService();
