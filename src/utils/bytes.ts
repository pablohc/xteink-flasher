/* eslint-disable no-bitwise */

export function u32ToLeBytes(u32: number) {
  return new Uint8Array([
    u32 & 0xff,
    (u32 >>> 8) & 0xff,
    (u32 >>> 16) & 0xff,
    (u32 >>> 24) & 0xff,
  ]);
}

export function leBytesToU32(bytes: Uint8Array) {
  return (
    (bytes.at(0) ?? 0) +
    (((bytes.at(1) ?? 0) << 8) >>> 0) +
    (((bytes.at(2) ?? 0) << 16) >>> 0) +
    (((bytes.at(3) ?? 0) << 24) >>> 0)
  );
}

export function isEqualBytes(bytes1: Uint8Array, bytes2: Uint8Array): boolean {
  if (bytes1.length !== bytes2.length) {
    return false;
  }

  for (let i = 0; i < bytes1.length; i += 1) {
    if (bytes1[i] !== bytes2[i]) {
      return false;
    }
  }

  return true;
}
