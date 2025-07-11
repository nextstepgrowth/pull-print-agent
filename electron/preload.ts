// Example preload script. Expose a minimal safe API to the renderer.
import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ping: () => 'pong',
});
