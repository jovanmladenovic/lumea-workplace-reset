import { animate as jsAnimate } from 'animejs';

import { AnimationDirection, BASE_ANIMATION_DURATION } from '@/constants';

const defaultAnimationOptions = {
  easing: 'easeInOutQuint',
  duration: BASE_ANIMATION_DURATION,
};

export const getLengthInMilliseconds = (duration: number, percent: number) => {
  return (duration / 100) * percent;
};

export const animate = (
  targets: string | string[] | HTMLElement | HTMLElement[],
  options: any
): Promise<void> => {
  return new Promise(resolve => {
    const userOnComplete = options?.onComplete as (() => void) | undefined;

    jsAnimate(targets, {
      ...defaultAnimationOptions,
      ...options,
      onComplete: () => {
        try {
          userOnComplete && userOnComplete();
        } finally {
          resolve();
        }
      },
    });
  });
};

export const itemFadeIn = (
  targets: string | string[] | HTMLElement | HTMLElement[],
  delay: number = 0,
  duration: number = BASE_ANIMATION_DURATION,
  direction?: AnimationDirection,
  opacity: number = 1
) => {
  let transforms = {};

  if (direction) {
    if (direction === AnimationDirection.up) {
      // @ts-ignore
      transforms = { translateY: 20 };
    } else if (direction === AnimationDirection.down) {
      transforms = { translateY: -20 };
    }
  }

  return jsAnimate(targets, {
    easing: 'easeOutQuint',
    delay,
    duration,
    opacity,
    ...transforms,
  });
};

export const itemFadeOut = (
  targets: string | string[],
  delay: number = 0,
  duration: number = BASE_ANIMATION_DURATION,
  direction?: AnimationDirection
): Promise<void> => {
  let transforms = {};

  if (direction) {
    if (direction === AnimationDirection.up) {
      // @ts-ignore
      transforms = { translateY: 20 };
    } else if (direction === AnimationDirection.down) {
      transforms = { translateY: -20 };
    } else if (direction === AnimationDirection.left) {
      transforms = { translateX: -20 };
    } else if (direction === AnimationDirection.right) {
      transforms = { translateX: 20 };
    }
  }

  return new Promise(resolve => {
    jsAnimate(targets, {
      delay,
      duration,
      opacity: 0,
      ...transforms,
      onComplete: () => {
        resolve();
      },
    });
  });
};

export const pulse = (targets: string | string[]) => {
  return jsAnimate(targets, {
    duration: BASE_ANIMATION_DURATION,
    opacity: 0.5,
    easing: 'linear',
    direction: 'alternate',
    loop: true,
  });
};

export interface CancellableSequence {
  promise: Promise<void>;
  cancel: () => void;
}

/**
 * Executes a sequence of async functions with cancellation support.
 * @param steps - Array of async functions to execute sequentially
 * @returns Object with promise and cancel function
 */
export const createCancellableSequence = (
  steps: (() => Promise<void> | void)[]
): CancellableSequence => {
  let cancelled = false;

  const cancel = () => {
    cancelled = true;
  };

  const promise = (async () => {
    for (const step of steps) {
      if (cancelled) {
        break;
      }
      await step();
    }
  })();

  return { promise, cancel };
};
