import { NextApiRequest, NextApiResponse } from 'next';
import * as zlib from 'zlib';
import crc32 from 'crc/crc32';
import { Buffer } from 'buffer';

const addITXtChunkToDataUri = (dataUri: string, keyword: string, text: string, language = '', translatedKeyword = ''): string => {
  console.log("Received data URI:", dataUri.substring(0, 50) + "...");
  let buffer = Buffer.from(dataUri.split(',')[1], 'base64');

  const iendPosition = buffer.indexOf('IEND', 0, 'ascii') - 4;
  console.log("Position of IEND chunk:", iendPosition);

  const textBuffer = zlib.deflateSync(text);
  const iTXtData = Buffer.concat([Buffer.from(keyword + '\0', 'ascii'), Buffer.from([0, 0]), textBuffer]);

  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(iTXtData.length, 0);

  const crcBuffer = Buffer.alloc(4);
  const crcValue = crc32(Buffer.concat([Buffer.from('iTXt', 'ascii'), iTXtData]));
  crcBuffer.writeUInt32BE(crcValue, 0);

  console.log("iTXt chunk length:", iTXtData.length);
  console.log("iTXt chunk CRC value:", crcValue);

  buffer = Buffer.concat([buffer.slice(0, iendPosition), lengthBuffer, Buffer.from('iTXt', 'ascii'), iTXtData, crcBuffer, buffer.slice(iendPosition)]);
  const updatedDataUri = `data:image/png;base64,${buffer.toString('base64')}`;
  console.log("Updated data URI:", updatedDataUri.substring(0, 50) + "...");

  return updatedDataUri;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log("Request body:", req.body);
      const updatedDataUri = addITXtChunkToDataUri(req.body.dataUri, req.body.keyword, req.body.text);
      res.status(200).json({ updatedDataUri });
    } catch (error) {
      console.error("Error in iTXt chunk processing:", error);
      res.status(500).json({ error: 'Server error processing image.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
