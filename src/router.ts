import { createWebHistory, createRouter, RouteLocationNormalized } from 'vue-router';

import Idle from './views/Idle.vue';
import Intro from './views/Intro.vue';
import Tutorial from './views/Tutorial.vue';
import CheckIn from './views/CheckIn.vue';
import CheckOut from './views/CheckOut.vue';
import Inactive from './views/Inactive.vue';

// Activities
import EnergyBoost1 from './views/activity/EnergyBoost1.vue';
import EnergyBoost2 from './views/activity/EnergyBoost2.vue';
import MentalBalance1 from './views/activity/MentalBalance1.vue';
import MentalBalance2 from './views/activity/MentalBalance2.vue';
import ResetAndFocus1 from './views/activity/ResetAndFocus1.vue';
import ResetAndFocus2 from './views/activity/ResetAndFocus2.vue';

export enum RoutePaths {
  Idle = '/idle',
  Intro = '/',
  Tutorial = '/tutorial',
  CheckIn = '/check-in',
  EnergyBoost1 = '/energy-boost-1',
  EnergyBoost2 = '/energy-boost-2',
  CheckOut = '/check-out',
  CheckOutAnimated = '/check-out-animated',
  MentalBalance1 = '/mental-balance-1',
  MentalBalance2 = '/mental-balance-2',
  ResetAndFocus1 = '/reset-and-focus-1',
  ResetAndFocus2 = '/reset-and-focus-2',
  Inactive = '/inactive',
}

export const routes = [
  {
    path: RoutePaths.Idle,
    name: 'Idle',
    component: Idle,
  },
  {
    path: RoutePaths.Intro,
    name: 'Intro',
    component: Intro,
  },
  {
    path: RoutePaths.Tutorial,
    name: 'Tutorial',
    component: Tutorial,
  },
  {
    path: RoutePaths.CheckIn,
    name: 'CheckIn',
    component: CheckIn,
  },
  {
    path: RoutePaths.EnergyBoost1,
    name: 'EnergyBoost1',
    component: EnergyBoost1,
  },
  {
    path: RoutePaths.EnergyBoost2,
    name: 'EnergyBoost2',
    component: EnergyBoost2,
  },
  {
    path: RoutePaths.CheckOut,
    name: 'CheckOut',
    component: CheckOut,
    props: {
      animated: false,
    },
  },
  {
    path: RoutePaths.CheckOutAnimated,
    name: 'CheckOutAnimated',
    component: CheckOut,
    props: {
      animated: true,
    },
  },
  {
    path: RoutePaths.MentalBalance1,
    name: 'MentalBalance1',
    component: MentalBalance1,
  },
  {
    path: RoutePaths.MentalBalance2,
    name: 'MentalBalance2',
    component: MentalBalance2,
  },
  {
    path: RoutePaths.ResetAndFocus1,
    name: 'ResetAndFocus1',
    component: ResetAndFocus1,
  },
  {
    path: RoutePaths.ResetAndFocus2,
    name: 'ResetAndFocus2',
    component: ResetAndFocus2,
  },
  {
    path: RoutePaths.Inactive,
    name: 'Inactive',
    component: Inactive,
    props: (route: RouteLocationNormalized) => ({
      returnPath: route.query.returnPath as string,
    }),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
