// utils/pngUtils.ts
import * as zlib from 'zlib';
import crc32 from 'crc/crc32';
import { Buffer } from 'buffer';

type addITXtChunkToDataUri = {
    dataUri: string,
    keyword: string,
    text: string,
    language?: string,
    translatedKeyword?: string
  };

export const dataUriToBuffer = (dataUri: string): Buffer => {
  const base64 = dataUri.split(',')[1];
  return Buffer.from(base64, 'base64');
};

export const addITXtChunkToDataUri = (dataUri: string, keyword: string, text: string, language = '', translatedKeyword = ''): string => {
  const buffer: Buffer = dataUriToBuffer(dataUri);
  const iendPosition: number = buffer.indexOf('IEND', 0, 'ascii') - 4;

  const textBuffer: Buffer = zlib.deflateSync(text);
  const iTXtData: Buffer = Buffer.concat([
    Buffer.from(keyword + '\0', 'ascii'),
    Buffer.from([1]),
    Buffer.from([0]),
    Buffer.from(language + '\0', 'ascii'),
    Buffer.from(translatedKeyword + '\0', 'ascii'),
    textBuffer
  ]);

  const iTXtLength: Buffer = Buffer.alloc(4);
  iTXtLength.writeUInt32BE(iTXtData.length, 0);
  const iTXtType: Buffer = Buffer.from('iTXt', 'ascii');
  const crcValue = crc32(iTXtData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crcValue, 0);

  const iTXtChunk: Buffer = Buffer.concat([iTXtLength, iTXtType, iTXtData, crcBuffer]);

  const newBuffer: Buffer = Buffer.concat([
    buffer.subarray(0, iendPosition),
    iTXtChunk,
    buffer.subarray(iendPosition)
  ]);

  return `data:image/png;base64,${newBuffer.toString('base64')}`;
};
