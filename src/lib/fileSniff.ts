/**
 * Проверка сигнатуры файла — MIME с клиента нельзя считать доверенным.
 */
export async function fileMatchesClaimedImageOrVideo(file: File): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (head.length < 3) return false;

  // JPEG
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) {
    return file.type.toLowerCase().startsWith("image/");
  }
  // PNG
  if (
    head[0] === 0x89 &&
    head[1] === 0x50 &&
    head[2] === 0x4e &&
    head[3] === 0x47
  ) {
    return file.type.toLowerCase().startsWith("image/");
  }
  // GIF
  if (
    head[0] === 0x47 &&
    head[1] === 0x49 &&
    head[2] === 0x46 &&
    head[3] === 0x38
  ) {
    return file.type.toLowerCase().startsWith("image/");
  }
  // WebP: RIFF....WEBP
  if (head.length >= 12) {
    const riff =
      head[0] === 0x52 &&
      head[1] === 0x49 &&
      head[2] === 0x46 &&
      head[3] === 0x46;
    const webp =
      head[8] === 0x57 &&
      head[9] === 0x45 &&
      head[10] === 0x42 &&
      head[11] === 0x50;
    if (riff && webp) return file.type.toLowerCase().startsWith("image/");
  }
  // WebM / Matroska (EBML)
  if (
    head[0] === 0x1a &&
    head[1] === 0x45 &&
    head[2] === 0xdf &&
    head[3] === 0xa3
  ) {
    return file.type.toLowerCase().startsWith("video/");
  }
  // MP4 / MOV: ....ftyp at offset 4
  if (head.length >= 8) {
    const ftyp =
      head[4] === 0x66 &&
      head[5] === 0x74 &&
      head[6] === 0x79 &&
      head[7] === 0x70;
    if (ftyp) return file.type.toLowerCase().startsWith("video/");
  }
  // ISO BMFF (some MP4) starting with ftyp at 0
  if (
    head[0] === 0x66 &&
    head[1] === 0x74 &&
    head[2] === 0x79 &&
    head[3] === 0x70
  ) {
    return file.type.toLowerCase().startsWith("video/");
  }

  return false;
}
