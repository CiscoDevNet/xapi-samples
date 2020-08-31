// utils macro
import xapi from 'xapi';

export async function getVolume() {
  return await xapi.Status.Audio.Volume.get();
}

export function sleepFor(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
