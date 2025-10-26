import { ImageMetadata } from 'astro'

export function SpintaxImagePreview ({ spintaxItem, previewItemIndex = 0 } : { spintaxItem: ImageMetadata[], previewItemIndex: number}) : ImageMetadata {
    if ((spintaxItem.length < previewItemIndex) || previewItemIndex < 0) {
        return spintaxItem[spintaxItem.length - 1];
    } else {
        return spintaxItem[previewItemIndex];
    }
}