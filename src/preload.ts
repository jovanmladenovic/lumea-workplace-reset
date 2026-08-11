import { contextBridge, ipcRenderer } from 'electron';

const envVars = ipcRenderer.sendSync('env:getEnvSync');

contextBridge.exposeInMainWorld('electronAPI', {
  getAuthToken: (data: { faceId: string }) => ipcRenderer.invoke('auth:getAuthToken', data),
  env: envVars,
  incrementCount: (counterName: 'passersBy' | 'approaches' | 'engagements') =>
    ipcRenderer.invoke('counts:increment', counterName),
  getCounts: () => ipcRenderer.invoke('counts:get'),
});
