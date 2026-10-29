import { BadRequestException } from '@nestjs/common'

/** The parts of the multer upload the GPX imports use */
export type UploadedGpxFile = { buffer: Buffer; originalname?: string; size: number }

const MAX_GPX_FILE_SIZE = 50_000_000

/**
 * Validates an uploaded GPX file and returns its content.
 * Throws a BadRequestException if the file is missing, too large or not a .gpx file.
 */
export function readUploadedGpx(file: UploadedGpxFile | undefined): string {
  if (!file) {
    throw new BadRequestException('No GPX file provided')
  }

  if (file.size > MAX_GPX_FILE_SIZE) {
    throw new BadRequestException('File size exceeds 50 MB limit')
  }

  if (!file.originalname?.toLowerCase().endsWith('.gpx')) {
    throw new BadRequestException('File must be a .gpx file')
  }

  return file.buffer.toString('utf-8')
}

/** Returns the track name from the GPX content, if it has one */
export function extractGpxName(gpxContent: string): string | undefined {
  const track = gpxContent.match(/<trk(?:\s[^>]*)?>([\s\S]*?)<\/trk>/)
  const name = track?.[1].match(/<name[^>]*>([^<]+)<\/name>/)?.[1].trim()
  return name || undefined
}
