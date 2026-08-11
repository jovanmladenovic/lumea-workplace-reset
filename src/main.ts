import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import started from 'electron-squirrel-startup';
import dotenv from 'dotenv';
import * as Sentry from "@sentry/electron";

// Load environment variables from .env file
dotenv.config();

Sentry.init({
  dsn: "https://32a58fde90b9c950d473eab669a17efc@o310554.ingest.us.sentry.io/4510985631563776",
});

import { getAuthToken } from './firebase/firebaseAdmin';

if (started) {
  app.quit();
}

// Ambient-layer engagement counter — aggregate numbers only, no timestamps, no
// identity, no per-event log. Just three running totals persisted to a JSON file
// in Electron's userData dir, so they survive app restarts.
type EngagementCounts = {
  passersBy: number;
  approaches: number;
  engagements: number;
};

const DEFAULT_COUNTS: EngagementCounts = { passersBy: 0, approaches: 0, engagements: 0 };

const getCountsFilePath = () => path.join(app.getPath('userData'), 'engagement-counts.json');

const readCounts = (): EngagementCounts => {
  try {
    const raw = fs.readFileSync(getCountsFilePath(), 'utf-8');
    return { ...DEFAULT_COUNTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_COUNTS };
  }
};

const writeCounts = (counts: EngagementCounts): void => {
  fs.writeFileSync(getCountsFilePath(), JSON.stringify(counts, null, 2));
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 1920,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  ipcMain.handle('auth:getAuthToken', (_event, arg) => {
    return getAuthToken(arg);
  });

  ipcMain.handle('counts:increment', (_event, counterName: keyof EngagementCounts) => {
    const counts = readCounts();
    counts[counterName] = (counts[counterName] ?? 0) + 1;
    writeCounts(counts);
    return counts;
  });

  ipcMain.handle('counts:get', () => {
    return readCounts();
  });

  // Set up synchronous IPC for environment variables
  ipcMain.on('env:getEnvSync', event => {
    const env = process.env;
    event.returnValue = {
      DEVICE_ID: env.DEVICE_ID,
      SKIP_VIDEOS: env.SKIP_VIDEOS === 'true',
      ENABLE_LOGGER: env.ENABLE_LOGGER === 'true',
      INPUT_VIDEO_ROTATION: Number(env.INPUT_VIDEO_ROTATION) || 0,
      INPUT_VIDEO_ZOOM_FACTOR: Number(env.INPUT_VIDEO_ZOOM_FACTOR) || 1.5,
      BASE_ANIMATION_DURATION: Number(env.BASE_ANIMATION_DURATION) || 1000,
      FACE_RECOGNITION_CHECK_INTERVAL: Number(env.FACE_RECOGNITION_CHECK_INTERVAL) || 1,
      FACE_RECOGNITION_LOGOUT_TIME_WINDOW: Number(env.FACE_RECOGNITION_LOGOUT_TIME_WINDOW) || 25,
      FACE_RECOGNITION_MAX_FACE_ANGLE: Number(env.FACE_RECOGNITION_MAX_FACE_ANGLE) || 50,
      FACE_RECOGNITION_MAX_FACE_DISTANCE: Number(env.FACE_RECOGNITION_MAX_FACE_DISTANCE) || 0.5,
    };
  });

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
