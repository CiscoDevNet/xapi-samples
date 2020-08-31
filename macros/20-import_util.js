// main macro
import { getVolume, sleepFor } from './import_utils';

async function main() {
  const timeout = 2000;
  console.log(`fetching volume + sleeping for ${timeout}ms`);

  const [volume] = await Promise.all([
    getVolume(),
    sleepFor(timeout),
  ]);
  console.log(`DONE: volume is ${volume}`);
}

main();
