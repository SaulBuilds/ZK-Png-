// @types/yourProjectName/pngUtils.d.ts

    export function dataUriToBuffer(dataUri: string): Buffer;
    export function addITXtChunkToDataUri(
      dataUri: string,
      keyword: string,
      text: string,
      language?: string,
      translatedKeyword?: string
    ): string;
