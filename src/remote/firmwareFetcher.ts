'use server';

const officialFirmwareUrls = {
  '3.1.1-EN':
    'http://gotaserver.xteink.com/api/download/ESP32C3/V3.1.1/V3.1.1-EN.bin',
  '3.1.1-CH':
    'http://47.122.74.33:5000/api/download/ESP32C3/V3.1.1/V3.1.1-CH.bin',
};

export async function getOfficialFirmware(
  version: keyof typeof officialFirmwareUrls,
) {
  const url = officialFirmwareUrls[version];

  const response = await fetch(url);
  return new Uint8Array(await response.arrayBuffer());
}
