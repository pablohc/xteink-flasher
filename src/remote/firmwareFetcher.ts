'use server';

const urls = {
  '3.0.8-EN':
    'http://gotaserver.xteink.com/api/download/ESP32C3/V3.0.8/V3.0.8-EN.bin',
  '3.0.7-CH':
    'http://47.122.74.33:5000/api/download/ESP32C3/V3.0.7/V3.0.7-CH.bin',
};

export async function getFirmware(version: keyof typeof urls) {
  const url = urls[version];

  const response = await fetch(url);
  return new Uint8Array(await response.arrayBuffer());
}
