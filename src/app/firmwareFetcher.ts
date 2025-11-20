'use server';

const urls: Record<string, string> = {
  '3.0.8':
    'http://gotaserver.xteink.com/api/download/ESP32C3/V3.0.8/V3.0.8-EN.bin',
};

export async function getFirmware(version: string) {
  const url = urls[version];

  if (!url) {
    throw new Error('Unknown firmware version');
  }

  const response = await fetch(url);
  return new Uint8Array(await response.arrayBuffer());
}
