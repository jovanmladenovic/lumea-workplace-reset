// General

export enum ConfirmSelectOptions {
  yes = 'yes',
  no = 'no',
}

export enum MoodSelectOptions {
  good = 'good',
  idk = 'idk', // I don't know
  bad = 'bad', // Not so good
  calmer = 'calmer', // I feel calmer
  move = 'move', //
}

export enum ProgramSelectOptions {
  cta = 'yes',
  body = 'train',
  plan = 'weight',
}

export enum TutorialOptions {
  one = 1,
  seven = 7,
  eight = 8,
  zero = 'train',
  stop = 'no',
  ok = 'yes',
  cross = 'weight',
}

export enum ColorPickerOptions {
  swipeLeft = 'swipe-left',
  swipeRight = 'swipe-right',
  random = 'victory',
  ok = 'yes',
}

export enum ColorPickerColor {
  peach = 'peach',
  rose = 'rose',
  purple = 'purple',
  blue = 'blue',
  matcha = 'matcha',
}

export enum AnimationDirection {
  up = 'up',
  down = 'down',
  left = 'left',
  right = 'right',
}

export enum TextAnimation {
  'fadeIn' = 'fadeIn',
  'typeIn' = 'typeIn',
}

export enum ComponentAnimationEvents {
  entered = 'entered',
  left = 'left',
}

export enum InputEmitEvents {
  request_camera_frames = 'request_camera_frames', // Requests frames from camera
  cancel_camera_frames = 'cancel_camera_frames',
  request_user_input = 'request_user_input', // Requests gesture input from user
  request_back = 'request_back', // Allow users to go back
  cancel_request_back = 'cancel_request_back',
}

export enum InputReceiveEvents {
  user_input = 'user_input', // User gesture response
  camera_frame = 'camera_frame', // Single camera frame
  back = 'back',
}

export const InputEmitEventsPayloads = {
  tutorial: {
    type: 'tutorial',
    options: [
      TutorialOptions.one,
      TutorialOptions.seven,
      TutorialOptions.eight,
      TutorialOptions.zero,
      TutorialOptions.stop,
      TutorialOptions.ok,
      TutorialOptions.cross,
    ],
  },
  confirm: {
    type: 'confirm',
    options: [ConfirmSelectOptions.yes, ConfirmSelectOptions.no],
  },
  number: {
    type: 'number',
  },
  colorPicker: {
    type: 'colorPicker',
    options: [
      ColorPickerOptions.swipeLeft,
      ColorPickerOptions.swipeRight,
      ColorPickerOptions.random,
      ColorPickerOptions.ok,
    ],
  },
  cursor: {
    type: 'cursor',
  },
  yes: {
    type: 'yes',
    options: [ConfirmSelectOptions.yes],
  },
};

export enum GestureNumberType {
  ONE = 'one',
  TWO = 'two',
  THREE = 'three',
  FOUR = 'four',
  FIVE = 'five',
}

export enum InterventionType {
  EnergyBoost = 'Energy boost',
  MentalBalance = 'Mental Balance',
  ResetFocus = 'Reset & Focus',
}
