<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { useRouter } from 'vue-router';

  import { RoutePaths } from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import { useChime } from '@/composables/useChime';
  import { TEASERS } from '@/constants/teasers';

  const router = useRouter();
  const { playChime } = useChime();

  // Guards real-hardware calls: @/services touches window.electronAPI.env at import
  // time (see src/constants/env.constants.ts), which only exists inside the Electron
  // app. Dynamic-importing it only when isElectron is true keeps this screen safe to
  // mount in a plain browser (GitHub Pages preview build) too.
  const isElectron = typeof window !== 'undefined' && Boolean((window as unknown as { electronAPI?: unknown }).electronAPI);

  const confirmed = ref(false);
  const line = ref('Thanks for stopping by.');
  const sub = ref('A quick thumbs up is all we need.');

  // Fade+scale in on mount, fade+scale out before handing back to AmbientStandby —
  // mirrors the same transition pattern used there instead of a hard cut.
  const entering = ref(true);
  const leaving = ref(false);
  const LEAVE_TRANSITION_MS = 480;

  let returnTimer: number | undefined;
  let leaveTransitionTimer: number | undefined;
  let stopListening: (() => void) | null = null;

  function confirmEngagement(): void {
    const teaser = TEASERS[Math.floor(Math.random() * TEASERS.length)];

    confirmed.value = true;
    line.value = 'Good to see you.';
    sub.value = teaser;
    playChime(0.07);

    window.clearTimeout(returnTimer);
    returnTimer = window.setTimeout(() => {
      leaving.value = true;
      leaveTransitionTimer = window.setTimeout(() => {
        router.push(RoutePaths.AmbientStandby);
      }, LEAVE_TRANSITION_MS);
    }, 4200);
  }

  async function listenForThumbsUp(): Promise<void> {
    const { userInput } = await import('@/services');
    const { InputEmitEvents, InputReceiveEvents } = await import('@/utils');

    // Reuses the existing thumbs-up gesture mapping already wired for 'confirm'/'yes'
    // in src/services/user-input.service.ts (ConfirmSelectOptionsToGesturesMappings).
    userInput.emit(InputEmitEvents.request_user_input, { type: 'confirm', options: ['yes'] });

    const handler = () => confirmEngagement();
    userInput.on(InputReceiveEvents.user_input, handler);
    stopListening = () => userInput.off(InputReceiveEvents.user_input, handler);
  }

  onMounted(() => {
    if (isElectron) {
      listenForThumbsUp();
    }

    requestAnimationFrame(() => {
      entering.value = false;
    });
  });

  onBeforeUnmount(() => {
    window.clearTimeout(returnTimer);
    window.clearTimeout(leaveTransitionTimer);
    stopListening?.();
  });
</script>

<template>
  <DefaultLayout>
    <div class="engage" :class="{ entering, leaving }">
      <div class="engage-orb-wrap" :class="{ confirmed }">
        <div class="engage-ring"></div>
        <div class="engage-orb"></div>
        <svg class="engage-icon" viewBox="0 0 200 265" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M34.6819 168.074L34.3773 167.354C32.1764 162.166 40.2364 151.308 42.2757 148.685C39.7523 146.72 37.8473 144.81 37.1515 143.188C34.3216 136.59 38.0333 129.505 47.6103 123.241C56.6714 117.316 82.5043 116.601 85.1351 116.736C86.2717 115.709 85.6887 111.367 85.302 108.492L85.2957 108.445L85.2957 108.445C85.0666 106.741 84.8505 105.134 84.8099 103.812C84.7542 102.12 83.1869 98.3929 81.3706 94.0779L81.3666 94.0685C78.5018 87.2601 74.5792 77.9378 73.2674 68.8494C71.741 58.2815 77.0143 48.1116 81.9916 42.611C85.3343 38.9254 88.9318 36.926 91.7617 37.0021C95.7255 37.1737 97.3023 38.9042 97.8988 41.9897C100.076 47.1379 98.5254 59.7749 98.3038 61.487C100.694 75.2813 117.49 95.0922 126.389 102.872C131.281 107.149 133.78 115.093 136.426 123.503L136.426 123.504L136.429 123.515C139.317 132.695 142.302 142.186 148.557 147.5C151.341 149.865 157.54 151.789 165.407 153.351L165.146 155.701C156.762 154.028 150.076 151.936 147.005 149.327C140.219 143.565 137.128 133.74 134.138 124.235L134.135 124.224C131.595 116.145 129.196 108.513 124.807 104.675C119.026 99.6211 110.402 90.1128 104.019 80.1519C101.035 82.2754 96.9185 83.0665 96.7244 83.1031L96.4607 81.6862C96.5061 81.6781 100.537 80.898 103.259 78.9198C101.998 76.8841 100.844 74.843 99.8305 72.8173C98.6078 72.9545 96.3637 73.4397 93.2529 75.3367L92.5029 74.1072C95.4584 72.3068 97.6963 71.6961 99.1728 71.4641C98.8593 70.7973 98.5693 70.1375 98.2913 69.4789C95.0292 69.9039 90.1606 72.6914 90.0268 72.768L90.0267 72.768L90.0245 72.7693L89.2921 71.5281L89.2961 71.5257C89.5659 71.369 94.1544 68.7023 97.7252 68.0887C97.0423 66.3151 96.5237 64.5905 96.1623 62.92C95.7049 63.0528 95.223 63.1615 94.7499 63.1615C94.2723 63.1615 93.8153 63.062 93.4462 62.7985C91.7675 61.6012 91.9052 46.5075 92.7577 44.8037C93.3736 43.571 94.5381 42.4252 95.3859 41.6773C94.8498 39.9848 93.7538 39.4876 91.6562 39.3968C89.6378 39.309 86.591 41.1094 83.7728 44.2212C78.7749 49.7394 74.3249 59.3881 75.6403 68.5041C76.9114 77.293 80.7652 86.4536 83.5803 93.1452L83.5804 93.1453L83.5823 93.15C85.6476 98.0534 87.1388 101.598 87.2062 103.735C87.2469 104.939 87.4552 106.492 87.6761 108.138L87.6808 108.173L87.6834 108.193C88.2566 112.469 88.7973 116.502 87.1827 118.27C86.632 118.87 85.8468 119.145 85.0354 119.131C80.7436 118.952 56.8852 120.041 48.9226 125.249C42.9169 129.178 36.384 135.313 39.3575 142.246C42.0352 148.49 66.6582 159.977 69.3768 159.415C71.7172 158.804 77.2958 154.712 80.7619 151.695C80.4022 150.427 79.2454 145.864 80.6146 143.58C81.8186 141.572 84.1385 140.382 85.1042 139.948C84.9823 139.547 84.8167 139.171 84.5871 138.838C83.7375 137.609 82.0853 137.032 79.5893 137.14C76.7476 137.263 75.1334 137.48 74.067 137.623C73.9485 137.639 73.8576 137.646 73.7681 137.653L73.7677 137.653C73.7033 137.658 73.6396 137.663 73.5668 137.671C73.9059 138.914 74.212 140.798 73.6071 142.913L72.2243 142.521C72.7938 140.522 72.3935 138.688 72.0789 137.681C71.3967 137.562 70.8746 137.211 69.9598 136.385C69.2039 135.7 68.0584 134.669 65.8847 133.059C58.2009 127.373 54.744 126.841 54.618 126.822L54.6147 126.821L54.8432 124.435C55.2386 124.47 58.9622 124.953 67.3144 131.133C68.328 131.883 69.1113 132.506 69.7624 133.044C72.1496 128.552 70.2538 121.775 70.2293 121.704L71.5945 121.247C71.6194 121.325 73.8052 128.894 70.8767 133.988C71.1451 134.224 71.3755 134.432 71.5681 134.605C72.4585 135.413 72.4615 135.413 73.722 135.249L73.7477 135.246C74.7906 135.106 76.5366 134.871 79.4867 134.746C80.9416 134.687 82.1789 134.864 83.264 135.201C83.877 130.028 86.4418 122.506 86.5616 122.163L87.9209 122.632L87.9173 122.642C87.8025 122.981 85.1217 130.889 84.6423 135.81C85.4 136.244 86.072 136.766 86.5616 137.474C89.0898 141.136 86.9248 147.213 85.876 149.655C85.697 150.073 85.2114 150.664 84.6087 151.316C84.9884 154.762 89.1905 185.252 118.456 185.252H118.661L118.667 186.692H118.462C90.5265 186.692 84.4201 159.323 83.3428 152.602C82.8425 153.069 82.2673 153.566 81.6769 154.067C82.6628 155.063 84.8618 157.85 85.507 163.516C86.1087 168.801 85.2327 172.776 82.6346 176.424C83.1135 177.079 83.7002 178.052 84.2033 179.391C85.2514 182.189 84.044 191.198 80.7139 194.306C81.466 195.195 82.6068 196.765 82.7357 198.341C83.0491 202.07 81.5638 206.031 78.3208 210.115C76.5803 212.305 74.9441 213.664 73.1227 214.537C81.1263 216.226 96.6866 219.209 104.409 218.639C110.053 218.244 117.802 216.155 124.641 214.311L124.642 214.311L124.642 214.311L124.646 214.31C129.343 213.042 133.544 211.922 136.857 211.349C135.943 209.429 134.97 205.411 137.375 198.305C139.027 193.431 140.489 190.665 141.559 188.648L141.562 188.642C142.723 186.444 143.425 185.115 143.647 182.658L145.44 182.822C145.186 185.635 144.334 187.247 143.157 189.473L143.149 189.488L143.149 189.489C142.05 191.565 140.685 194.144 139.08 198.882C136.523 206.436 138.08 210.019 138.752 211.106C138.916 211.088 139.085 211.067 139.255 211.046L139.255 211.045L139.255 211.045L139.256 211.045L139.256 211.045C139.646 210.996 140.035 210.947 140.36 210.94C140.554 210.937 140.762 210.934 140.99 210.934C141.373 210.934 141.853 210.946 142.335 210.958L142.384 210.959C141.81 208.758 141.35 204.678 143.911 200.006C147.175 194.052 145.728 189.745 145.701 189.665L145.701 189.664L147.391 189.049C147.468 189.254 149.184 194.128 145.487 200.873C142.986 205.438 143.729 209.347 144.257 211.024C149.322 211.236 157.437 211.84 165.787 212.644L165.742 215.017C154.738 213.946 144.103 213.229 140.413 213.341C137.209 213.408 131.42 214.968 125.29 216.62L125.289 216.62L125.27 216.625L125.242 216.633C118.306 218.501 110.447 220.619 104.578 221.034C94.1657 221.769 71.3843 216.653 67.9768 215.868C66.1806 216.077 64.1585 216.171 61.713 216.262C61.1681 216.283 60.6437 216.294 60.1369 216.294C52.3794 216.294 48.9899 213.888 45.0291 209.049C41.5081 204.749 44.0272 199.365 45.6473 196.764C43.8536 195.67 41.993 194.102 39.2432 191.271C34.3729 186.26 38.6983 178.423 40.2858 175.929C37.3354 174.291 36.142 171.539 34.6819 168.074ZM68.6254 212.555C72.207 212.085 74.4448 210.998 77.0289 207.83C79.9037 204.309 81.2302 200.979 80.9674 197.933C80.8902 197.033 79.9433 195.764 79.2264 195C74.1738 196.981 62.0456 198.901 55.2657 198.901C53.5225 198.901 52.1368 198.775 51.3155 198.49C50.113 198.072 49.0914 197.701 48.1319 197.287C46.8161 199.311 44.5994 203.64 47.2234 206.761C51.0348 211.295 54.0188 213.224 62.0877 212.979C64.7587 212.881 66.842 212.789 68.6199 212.556L68.6203 212.554L68.6254 212.555ZM81.7667 180.319C82.55 182.363 81.3162 190.593 78.7367 192.608C76.1308 194.649 55.5098 198.103 51.408 196.655C47.3297 195.233 45.6425 194.643 40.566 189.531C36.6901 185.626 41.1004 178.548 42.1443 177C42.7616 177.175 43.4208 177.326 44.1613 177.437C45.1956 177.591 46.7649 177.893 48.679 178.26L48.6821 178.261L48.6843 178.261L49.0552 178.333C57.5946 179.973 66.1279 181.473 72.1791 181.473C75.6861 181.473 78.3568 180.969 79.7084 179.694C79.9678 179.45 80.1708 179.2 80.3735 178.951L80.3736 178.951C80.5124 178.78 80.6511 178.61 80.8075 178.442C81.1167 178.917 81.4546 179.506 81.7667 180.319ZM84.9912 141C84.0051 141.473 82.3223 142.421 81.4535 143.825C80.6055 145.199 81.1232 148.195 81.5812 150C82.4753 149.183 83.1426 148.495 83.2974 148.143C83.8195 146.966 85.1192 143.712 84.9912 141ZM69.6594 161.653C71.6444 161.135 75.8744 158.344 79.5 155.489C79.8587 155.806 82.18 158.057 82.8223 163.711C83.5236 169.896 82.2002 173.724 77.9368 177.837C74.8681 180.808 57.1743 177.326 49.569 175.83L49.5218 175.82C47.4033 175.403 45.6662 175.063 44.5454 174.89C39.4827 174.112 38.4312 171.615 36.5223 167.083L36.5203 167.078L36.2122 166.35C34.8877 163.222 40.0465 154.884 43.8467 150C52.661 156.216 66.6184 162.45 69.6594 161.653ZM96.9798 42C96.2284 42.6419 95.0198 43.7782 94.4665 44.877C93.6831 46.4268 93.951 59.6376 94.7898 60.9416C95.0985 61.1354 96.3012 60.823 97.3001 60.3576C97.8563 56.0841 98.6893 45.9034 96.9798 42Z" />
        </svg>
      </div>
      <h2>{{ line }}</h2>
      <p>{{ sub }}</p>

      <!-- No Electron hand-gesture hardware available (plain-browser preview, or dev
           machine without the camera pipeline) — fall back to a manual confirm. -->
      <button v-if="!isElectron" class="dev-btn" @click="confirmEngagement">Simulate thumbs up</button>
    </div>
  </DefaultLayout>
</template>

<style scoped>
  .engage {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 40px;
    font-family: 'Archivo', sans-serif;
    color: #f4efe7;
    background: radial-gradient(120% 90% at 50% 12%, #1c1815 0%, #14110f 62%);
    opacity: 1;
    transform: scale(1);
    transition:
      opacity 0.48s cubic-bezier(0.2, 0.7, 0.3, 1),
      transform 0.48s cubic-bezier(0.2, 0.7, 0.3, 1);
  }
  .engage.entering {
    opacity: 0;
    transform: scale(0.96);
  }
  .engage.leaving {
    opacity: 0;
    transform: scale(1.04);
  }

  .engage-orb-wrap {
    position: relative;
    width: 250px;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .engage-ring {
    position: absolute;
    inset: -34px;
    border-radius: 50%;
    border: 1px solid rgba(244, 239, 231, 0.12);
    opacity: 0.5;
    transition:
      opacity 0.5s ease,
      transform 0.5s ease;
  }
  .engage-orb {
    width: 208px;
    height: 208px;
    border-radius: 50%;
    background: radial-gradient(circle at 38% 32%, #f7cf8e, #c8934a 60%, #8a6530 100%);
    box-shadow: 0 0 30px rgba(232, 169, 76, 0.18);
    opacity: 0.55;
    transition:
      box-shadow 0.6s ease,
      transform 0.6s ease,
      opacity 0.6s ease;
  }
  .engage-orb-wrap.confirmed .engage-orb {
    opacity: 1;
    box-shadow: 0 0 70px rgba(232, 169, 76, 0.5);
    transform: scale(1.12);
  }
  .engage-orb-wrap.confirmed .engage-ring {
    opacity: 0.9;
    transform: scale(1.15);
  }
  .engage-icon {
    position: absolute;
    /* source is 200x265 (not square) — sized to preserve its real aspect ratio */
    width: 118px;
    height: 155px;
    color: #14110f;
    opacity: 0.8;
    transition: transform 0.3s ease;
  }
  .engage-orb-wrap.confirmed .engage-icon {
    transform: scale(1.1) rotate(-6deg);
  }

  h2 {
    font-family: 'Fraunces', serif;
    font-weight: 300;
    font-style: italic;
    font-size: 39px;
    margin-top: 49px;
    min-height: 55px;
  }
  p {
    margin-top: 21px;
    font-size: 25px;
    line-height: 1.55;
    color: #8c8378;
    max-width: 559px;
    min-height: 75px;
  }

  .dev-btn {
    all: unset;
    cursor: pointer;
    margin-top: 38px;
    font-size: 22px;
    color: #c9c1b4;
    background: rgba(244, 239, 231, 0.06);
    border: 1px solid rgba(244, 239, 231, 0.12);
    padding: 17px 34px;
    border-radius: 100px;
  }
</style>
