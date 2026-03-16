import { useState, useCallback, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

// Helper to load an image and get its natural dimensions
const loadImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });

const getRadianAngle = (deg: number) => (deg * Math.PI) / 180;

// Given the image natural size and the crop aspect ratio,
// calculate the minimum zoom so the full image fits inside the crop frame.
function calcFitZoom(imgW: number, imgH: number, cropAspect: number): number {
    const imgAspect = imgW / imgH;
    if (imgAspect > cropAspect) {
        // Image is wider than crop frame → constrained by height
        return cropAspect / imgAspect;
    } else {
        // Image is taller than crop frame → constrained by width
        return imgAspect / cropAspect;
    }
}

async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    fileName: string,
    rotation = 0,
    outputWidth = 1200,
    outputHeight = 630
): Promise<File> {
    const image = await loadImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const rotRad = getRadianAngle(rotation);
    const bw = Math.abs(Math.cos(rotRad) * image.naturalWidth)  + Math.abs(Math.sin(rotRad) * image.naturalHeight);
    const bh = Math.abs(Math.sin(rotRad) * image.naturalWidth)  + Math.abs(Math.cos(rotRad) * image.naturalHeight);

    canvas.width = bw;
    canvas.height = bh;
    ctx.translate(bw / 2, bh / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
    ctx.drawImage(image, 0, 0);

    // Output canvas at the target OG-image resolution (1200×630)
    const out = document.createElement('canvas');
    const octx = out.getContext('2d')!;
    out.width  = outputWidth;
    out.height = outputHeight;

    // Fill black so letterbox bars look intentional
    octx.fillStyle = '#000';
    octx.fillRect(0, 0, outputWidth, outputHeight);

    octx.drawImage(
        canvas,
        pixelCrop.x, pixelCrop.y,
        pixelCrop.width, pixelCrop.height,
        0, 0,
        outputWidth, outputHeight
    );

    return new Promise((resolve, reject) => {
        out.toBlob(blob => {
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
    aspectRatio = 16 / 9,
}: ImageCropperModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [minZoom, setMinZoom] = useState(0.1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
        x: number; y: number; width: number; height: number;
    } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fitZoomRef = useRef(1);

    // On mount: load image, compute the "fit all" zoom, apply it immediately
    useEffect(() => {
        loadImage(imageSrc).then(img => {
            const fit = calcFitZoom(img.naturalWidth, img.naturalHeight, aspectRatio);
            fitZoomRef.current = fit;
            setMinZoom(fit * 0.5); // allow going a bit smaller than fit if desired
            setZoom(fit);           // start fully zoomed-out (all content visible)
            setCrop({ x: 0, y: 0 });
        });
    }, [imageSrc, aspectRatio]);

    const handleFitAll = () => {
        setZoom(fitZoomRef.current);
        setCrop({ x: 0, y: 0 });
    };

    const onCropCompleteEvent = useCallback(
        (_: unknown, pixels: { x: number; y: number; width: number; height: number }) => {
            setCroppedAreaPixels(pixels);
        }, []
    );

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        setIsSaving(true);
        try {
            const file = await getCroppedImg(imageSrc, croppedAreaPixels, fileName, rotation);
            onCropComplete(file);
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
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>Crop Image</h3>
                    {/* Fit All shortcut button */}
                    <button
                        onClick={handleFitAll}
                        title="Show full image (fit all content in frame)"
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '6px 14px',
                            cursor: 'pointer',
                            letterSpacing: '0.03em',
                            transition: 'background 0.2s',
                        }}
                    >
                        ⤢ Fit All
                    </button>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', marginTop: '4px' }}>
                    Scroll or drag to reposition. Use <strong style={{ color: '#fff' }}>⤢ Fit All</strong> to show full image.
                    <span style={{ marginLeft: 8, opacity: 0.55, fontSize: '0.75rem' }}>Output: 1200 × 630 px</span>
                </p>

                {/* Crop canvas — always 16:9 landscape */}
                <div style={{
                    position: 'relative',
                    width: '100%',
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
                        minZoom={minZoom}
                        maxZoom={4}
                        rotation={rotation}
                        aspect={aspectRatio}
                        objectFit="contain"
                        showGrid={true}
                        onCropChange={setCrop}
                        onRotationChange={setRotation}
                        onCropComplete={onCropCompleteEvent}
                        onZoomChange={setZoom}
                        style={{ containerStyle: { background: '#000' } }}
                    />
                </div>

                {/* Controls */}
                <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', width: 24, textAlign: 'center' }}>🔍</span>
                        <input
                            type="range"
                            min={minZoom}
                            max={4}
                            step={0.01}
                            value={zoom}
                            onChange={e => setZoom(Number(e.target.value))}
                            style={{ flex: 1, accentColor: 'var(--accent-color)' }}
                            title="Zoom"
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 38, textAlign: 'right' }}>
                            {Math.round(zoom * 100)}%
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', width: 24, textAlign: 'center' }}>🔄</span>
                        <input
                            type="range"
                            min={0}
                            max={360}
                            step={1}
                            value={rotation}
                            onChange={e => setRotation(Number(e.target.value))}
                            style={{ flex: 1, accentColor: 'var(--accent-color)' }}
                            title="Rotate"
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 38, textAlign: 'right' }}>
                            {rotation}°
                        </span>
                    </div>
                </div>

                <div className="btn-group" style={{ marginTop: '18px' }}>
                    <button className="btn-secondary" onClick={onCancel} disabled={isSaving}>Cancel</button>
                    <button className="submit-btn" onClick={handleSave} disabled={isSaving} style={{ width: 'auto', flex: 1 }}>
                        {isSaving ? '⏳ Processing...' : '✓ Confirm & Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
}
