import { ref, Ref } from 'vue';

import { sleep, TEXT_FADE_IN_DURATION } from '@/utils';

export function usePageController() {
  const titleRef = ref();
  const headerRef = ref();
  const footerRef = ref();

  const showComponent = (component: Ref) => {
    if (!component.value) {
      return true;
    }

    return component.value.animateIn();
  };

  const hideComponent = (component: Ref) => {
    if (!component.value) {
      return true;
    }

    return component.value.animateOut();
  };

  const showTitle = () => {
    return showComponent(titleRef);
  };

  const hideTitle = () => {
    return hideComponent(titleRef);
  };

  const showHeader = () => {
    return showComponent(headerRef);
  };

  const hideHeader = () => {
    if (!headerRef.value) return;
    headerRef.value.hideBack();
    return hideComponent(headerRef);
  };

  const showFooter = () => {
    return showComponent(footerRef);
  };

  const hideFooter = () => {
    return hideComponent(footerRef);
  };

  const hideAll = () => {
    return Promise.all([hideFooter(), hideHeader(), hideTitle()]);
  };

  const showMain = async (main: Ref) => {
    showHeader();
    await showTitle();

    await sleep(500);

    // @ts-ignore
    showComponent(main);

    await sleep(TEXT_FADE_IN_DURATION);
    showFooter();
  };

  return {
    titleRef,
    footerRef,
    headerRef,
    controller: {
      showFooter,
      hideFooter,
      showHeader,
      hideHeader,
      showTitle,
      hideTitle,
      showMain,
      hideAll,
      showComponent,
      hideComponent,
    },
  };
}
