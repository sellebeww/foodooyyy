// src/db/zip.ts
export interface ZipEntry {
  name: string;
  data: Uint8Array;
}

const LOCAL_SIGNATURE = 0x04034b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const END_SIGNATURE = 0x06054b50;
const UTF8_FLAG = 0x0800;
const DOS_DATE_1980 = 0x21;
const METHOD_STORE = 0;
const METHOD_DEFLATE = 8;
const END_RECORD_SIZE = 22;
const MAX_COMMENT = 0xffff;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = (CRC_TABLE[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function transform(
  data: Uint8Array,
  stream: CompressionStream | DecompressionStream,
): Promise<Uint8Array> {
  const writer = stream.writable.getWriter();
  writer.write(new Uint8Array(data)).catch(() => undefined);
  writer.close().catch(() => undefined);
  const reader = stream.readable.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    length += value.length;
  }
  const out = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

export function deflateRaw(data: Uint8Array): Promise<Uint8Array> {
  return transform(data, new CompressionStream("deflate-raw"));
}

export function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  return transform(data, new DecompressionStream("deflate-raw"));
}

class ByteWriter {
  private readonly parts: Uint8Array[] = [];
  length = 0;

  bytes(data: Uint8Array): void {
    this.parts.push(data);
    this.length += data.length;
  }

  u16(value: number): void {
    const part = new Uint8Array(2);
    new DataView(part.buffer).setUint16(0, value, true);
    this.bytes(part);
  }

  u32(value: number): void {
    const part = new Uint8Array(4);
    new DataView(part.buffer).setUint32(0, value, true);
    this.bytes(part);
  }

  result(): Uint8Array {
    const out = new Uint8Array(this.length);
    let offset = 0;
    for (const part of this.parts) {
      out.set(part, offset);
      offset += part.length;
    }
    return out;
  }
}

export async function zip(
  entries: readonly ZipEntry[],
  compress = true,
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const body = new ByteWriter();
  const central = new ByteWriter();
  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const packed = compress ? await deflateRaw(entry.data) : entry.data;
    const method = compress ? METHOD_DEFLATE : METHOD_STORE;
    const crc = crc32(entry.data);
    const offset = body.length;

    body.u32(LOCAL_SIGNATURE);
    body.u16(20);
    body.u16(UTF8_FLAG);
    body.u16(method);
    body.u16(0);
    body.u16(DOS_DATE_1980);
    body.u32(crc);
    body.u32(packed.length);
    body.u32(entry.data.length);
    body.u16(name.length);
    body.u16(0);
    body.bytes(name);
    body.bytes(packed);

    central.u32(CENTRAL_SIGNATURE);
    central.u16(20);
    central.u16(20);
    central.u16(UTF8_FLAG);
    central.u16(method);
    central.u16(0);
    central.u16(DOS_DATE_1980);
    central.u32(crc);
    central.u32(packed.length);
    central.u32(entry.data.length);
    central.u16(name.length);
    central.u16(0);
    central.u16(0);
    central.u16(0);
    central.u16(0);
    central.u32(0);
    central.u32(offset);
    central.bytes(name);
  }
  const out = new ByteWriter();
  out.bytes(body.result());
  out.bytes(central.result());
  out.u32(END_SIGNATURE);
  out.u16(0);
  out.u16(0);
  out.u16(entries.length);
  out.u16(entries.length);
  out.u32(central.length);
  out.u32(body.length);
  out.u16(0);
  return out.result();
}

function findEndRecord(view: DataView): number {
  const last = view.byteLength - END_RECORD_SIZE;
  const first = Math.max(0, last - MAX_COMMENT);
  for (let offset = last; offset >= first; offset -= 1) {
    if (view.getUint32(offset, true) === END_SIGNATURE) {
      return offset;
    }
  }
  throw new Error("Not a zip file");
}

export async function unzip(
  data: Uint8Array,
): Promise<Map<string, Uint8Array>> {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const end = findEndRecord(view);
  const count = view.getUint16(end + 10, true);
  let pointer = view.getUint32(end + 16, true);
  const decoder = new TextDecoder();
  const files = new Map<string, Uint8Array>();
  for (let index = 0; index < count; index += 1) {
    if (view.getUint32(pointer, true) !== CENTRAL_SIGNATURE) {
      throw new Error("Broken zip directory");
    }
    const method = view.getUint16(pointer + 10, true);
    const size = view.getUint32(pointer + 20, true);
    const nameLength = view.getUint16(pointer + 28, true);
    const extraLength = view.getUint16(pointer + 30, true);
    const commentLength = view.getUint16(pointer + 32, true);
    const localOffset = view.getUint32(pointer + 42, true);
    const name = decoder.decode(
      data.subarray(pointer + 46, pointer + 46 + nameLength),
    );
    pointer += 46 + nameLength + extraLength + commentLength;

    if (view.getUint32(localOffset, true) !== LOCAL_SIGNATURE) {
      throw new Error("Broken zip entry");
    }
    const start =
      localOffset +
      30 +
      view.getUint16(localOffset + 26, true) +
      view.getUint16(localOffset + 28, true);
    const packed = data.subarray(start, start + size);
    if (method === METHOD_STORE) {
      files.set(name, packed.slice());
    } else if (method === METHOD_DEFLATE) {
      files.set(name, await inflateRaw(packed));
    } else {
      throw new Error("Unsupported zip compression");
    }
  }
  return files;
}
