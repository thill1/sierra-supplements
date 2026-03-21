import sharp from "sharp";

const MAX_MAIN_DIMENSION = 1600;
const THUMB_MAX = 400;

export type ProcessedProductImage = {
    mainJpeg: Buffer;
    thumbJpeg: Buffer;
};

/**
 * Decode, apply EXIF orientation, strip metadata, emit main + thumbnail JPEG.
 */
export async function processProductImage(
    input: Buffer,
): Promise<ProcessedProductImage> {
    const pipeline = sharp(input).rotate();
    const mainJpeg = await pipeline
        .clone()
        .resize({
            width: MAX_MAIN_DIMENSION,
            height: MAX_MAIN_DIMENSION,
            fit: "inside",
            withoutEnlargement: true,
        })
        .jpeg({ quality: 88, mozjpeg: true })
        .toBuffer();

    const thumbJpeg = await sharp(input)
        .rotate()
        .resize({
            width: THUMB_MAX,
            height: THUMB_MAX,
            fit: "inside",
            withoutEnlargement: true,
        })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();

    return { mainJpeg, thumbJpeg };
}
