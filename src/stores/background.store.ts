import { defineStore } from 'pinia';

export type BlobStyle = {
  translateX: number;
  translateY: number;
  rotate: number;
};

export type BackgroundStyles = {
  right: BlobStyle;
  left: BlobStyle;
  bottom: BlobStyle;
  top: BlobStyle;
};

const defaultStyles: BackgroundStyles = {
  right: {
    translateY: -200,
    translateX: 950,
    rotate: 0,
  },
  left: {
    translateY: 546,
    translateX: -880,
    rotate: 0,
  },
  bottom: {
    translateY: 999,
    translateX: 411,
    rotate: 11,
  },
  top: {
    translateY: -1053,
    translateX: -268,
    rotate: 5,
  },
};

function cloneStyles(src: BackgroundStyles): BackgroundStyles {
  return {
    right: { ...src.right },
    left: { ...src.left },
    bottom: { ...src.bottom },
    top: { ...src.top },
  };
}

export const useBackgroundStore = defineStore('background', {
  state: () => ({
    styles: cloneStyles(defaultStyles) as BackgroundStyles,
  }),
  actions: {
    setAllStyles(payload: Partial<BackgroundStyles>) {
      if (payload.right) Object.assign(this.styles.right, payload.right);
      if (payload.left) Object.assign(this.styles.left, payload.left);
      if (payload.bottom) Object.assign(this.styles.bottom, payload.bottom);
      if (payload.top) Object.assign(this.styles.top, payload.top);
    },
    setBubbleStyle(name: keyof BackgroundStyles, style: Partial<BlobStyle>) {
      Object.assign(this.styles[name], style);
    },
    reset() {
      this.styles = cloneStyles(defaultStyles);
    },
    setToGatheredLayout() {
      // Centralized layout variant if a view wants to "gather" bubbles
      this.setAllStyles({
        right: {
          translateY: -540,
          translateX: 530,
          rotate: -12,
        },
        top: {
          translateY: -653,
          translateX: -268,
          rotate: 33,
        },
        left: {
          translateY: 483,
          translateX: -500,
          rotate: -33,
        },
        bottom: {
          translateY: 999 - 200,
          translateX: 411 + 100,
          rotate: 31,
        },
      });
    },
  },
  getters: {
    defaults: () => defaultStyles,
  },
});
