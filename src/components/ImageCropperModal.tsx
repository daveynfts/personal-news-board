import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

// Helper to create an image element out of a URL string
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;
    });

const getRadianAngle = (degreeValue: number) => {
    return (degreeValue * Math.PI) / 180;
};

async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    fileName: string,
    rotation: number = 0,
    outputWidth = 1200,
    outputHeight = 630
): Promise<File> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('No 2d context');

    const rotRad = getRadianAngle(rotation);

    // Bounding box for rotated image
    const boundingBox = {
        width:  Math.abs(Math.cos(rotRad) * image.naturalWidth)  + Math.abs(Math.sin(rotRad) * image.naturalHeight),
        height: Math.abs(Math.sin(rotRad) * image.naturalWidth)  + Math.abs(Math.cos(rotRad) * image.naturalHeight),
    };

    canvas.width  = boundingBox.width;
    canvas.height = boundingBox.height;

    ctx.translate(boundingBox.width / 2, boundingBox.height / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
    ctx.drawImage(image, 0, 0);

    // Output at the target resolution (1200×630 = OG image standard)
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) throw new Error('No 2d context for cropped canvas');

    croppedCanvas.width  = outputWidth;
    croppedCanvas.height = outputHeight;

    // Scale source crop region → target output size (preserves quality)
    croppedCtx.drawImage(
        canvas,
        pixelCrop.x, pixelCrop.y,
        pixelCrop.width, pixelCrop.height,
        0, 0,
        outputWidth, outputHeight
    );

    return new Promise((resolve, reject) => {
        croppedCanvas.toBlob((blob) => {
            if (!blob) { reject(new Error('Canvas is empty')); return; }
            resolve(new File([blob], fileName, { type: 'image/webp' }));
        }, 'image/webp', 0.92);
    });
}

interface ImageCropperModalProps {
    imageSrc: string;
    fileName: string;
    onCropComplete: (croppedFile: File) => void;
    onCancel: () => void;
    aspectRatio?: number;
}

export default function ImageCropperModal({ 
    imageSrc, 
    fileName, 
    onCropComplete, 
    onCancel,
    aspectRatio = 16 / 9
}: ImageCropperModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const onCropCompleteEvent = useCallback((_croppedArea: { x: number; y: number; width: number; height: number }, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        setIsSaving(true);
        try {
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, fileName, rotation);
            onCropComplete(croppedFile);
        } catch (e) {
            console.error('Failed to crop image', e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div
                className="modal-content"
                style={{ width: '92%', maxWidth: '860px', padding: '24px', display: 'flex', flexDirection: 'column' }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>Crop Image</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', marginTop: '4px' }}>
                    Drag to reposition. Scroll or use the slider below to zoom.
                    <span style={{ marginLeft: 8, opacity: 0.6, fontSize: '0.75rem' }}>Output: 1200 × 630 px</span>
                </p>

                {/* Cropper — fixed 16:9 aspect-ratio so it always looks landscape */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    /* Lock to 16/9 so the crop area never goes portrait */
                    aspectRatio: `${aspectRatio}`,
                    background: '#000',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspectRatio}
                        objectFit="cover"
                        showGrid={true}
                        onCropChange={setCrop}
                        onRotationChange={setRotation}
                        onCropComplete={onCropCompleteEvent}
                        onZoomChange={setZoom}
                        style={{
                            containerStyle: { background: '#000' },
                        }}
                    />
                </div>

                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>🔍</span>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.01}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            style={{ flex: 1, accentColor: 'var(--accent-color)' }}
                            title="Zoom"
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>🔄</span>
                        <input
                            type="range"
                            min={0}
                            max={360}
                            step={1}
                            value={rotation}
                            onChange={(e) => setRotation(Number(e.target.value))}
                            style={{ flex: 1, accentColor: 'var(--accent-color)' }}
                            title="Rotate"
                        />
                    </div>
                </div>

                <div className="btn-group" style={{ marginTop: '20px' }}>
                    <button className="btn-secondary" onClick={onCancel} disabled={isSaving}>Cancel</button>
                    <button className="submit-btn" onClick={handleSave} disabled={isSaving} style={{ width: 'auto', flex: 1 }}>
                        {isSaving ? '⏳ Processing...' : '✓ Confirm & Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
}
