import { useState, useCallback, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

const loadImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });

const getRadianAngle = (deg: number) => (deg * Math.PI) / 180;

/**
 * With objectFit="cover":
 *   zoom=1  → image fills crop area (ready to pan)
 *   zoom<1  → image smaller than crop area (full image visible, black bars in output)
 *
 * This computes the zoom where the ENTIRE image is visible inside the crop frame.
 */
function calcFitZoom(imgW: number, imgH: number, cropAspect: number): number {
    const imgAspect = imgW / imgH;
    // With cover, fit = ratio of container-aspect / image-aspect (or inverse)
    // Essentially: how much to shrink so the smaller dimension fits
    if (imgAspect > cropAspect) {
        // Wide image: constrained by height, width extends → shrink so width fits
        return cropAspect / imgAspect;
    } else {
        // Tall image: constrained by width, height extends → shrink so height fits
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
    const bw = Math.abs(Math.cos(rotRad) * image.naturalWidth) + Math.abs(Math.sin(rotRad) * image.naturalHeight);
    const bh = Math.abs(Math.sin(rotRad) * image.naturalWidth) + Math.abs(Math.cos(rotRad) * image.naturalHeight);

    canvas.width = bw;
    canvas.height = bh;
    ctx.translate(bw / 2, bh / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
    ctx.drawImage(image, 0, 0);

    const out = document.createElement('canvas');
    const octx = out.getContext('2d')!;
    out.width = outputWidth;
    out.height = outputHeight;

    // Black fill for any letterbox areas (when zoom < 1)
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
    const [mode, setMode] = useState<'crop' | 'fit'>('crop');
    const fitZoomRef = useRef(0.1);

    useEffect(() => {
        loadImage(imageSrc).then(img => {
            const fit = calcFitZoom(img.naturalWidth, img.naturalHeight, aspectRatio);
            fitZoomRef.current = fit;
            // Allow zooming out below fit so user can always fully see the image
            setMinZoom(Math.min(fit * 0.9, 0.1));
            // Start at zoom=1 (cover mode) so user can immediately pan freely
            setZoom(1);
            setCrop({ x: 0, y: 0 });
            setMode('crop');
        });
    }, [imageSrc, aspectRatio]);

    /** Toggle between "see full image" and "crop mode" */
    const handleFitAll = () => {
        if (mode === 'fit') {
            // Return to crop mode (zoom=1, fill frame)
            setZoom(1);
            setCrop({ x: 0, y: 0 });
            setMode('crop');
        } else {
            // Zoom out to fit the whole image in frame (may add black letterbox bars)
            setZoom(fitZoomRef.current);
            setCrop({ x: 0, y: 0 });
            setMode('fit');
        }
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

    const isFitMode = mode === 'fit';

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
                    <button
                        onClick={handleFitAll}
                        title={isFitMode ? 'Back to crop mode' : 'View full image'}
                        style={{
                            background: isFitMode ? 'rgba(99,179,237,0.18)' : 'rgba(255,255,255,0.08)',
                            border: `1px solid ${isFitMode ? 'rgba(99,179,237,0.4)' : 'rgba(255,255,255,0.15)'}`,
                            borderRadius: '8px',
                            color: isFitMode ? '#63b3ed' : '#fff',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '6px 14px',
                            cursor: 'pointer',
                            letterSpacing: '0.03em',
                        }}
                    >
                        {isFitMode ? '✂ Crop Mode' : '⤢ Fit All'}
                    </button>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', marginTop: '4px' }}>
                    {isFitMode
                        ? '⚠ Fit All mode — click ✂ Crop Mode to pan & select a region'
                        : 'Drag to pan · Scroll to zoom · Use ⤢ Fit All to see the full image'
                    }
                    <span style={{ marginLeft: 8, opacity: 0.5, fontSize: '0.72rem' }}>Output: 1200 × 630 px</span>
                </p>

                {/* Crop canvas */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: `${aspectRatio}`,
                    background: '#000',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: `1px solid ${isFitMode ? 'rgba(99,179,237,0.3)' : 'var(--border-color)'}`,
                }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        minZoom={minZoom}
                        maxZoom={4}
                        rotation={rotation}
                        aspect={aspectRatio}
                        objectFit="cover"
                        showGrid={true}
                        restrictPosition={false}
                        onCropChange={setCrop}
                        onRotationChange={setRotation}
                        onCropComplete={onCropCompleteEvent}
                        onZoomChange={z => { setZoom(z); setMode('crop'); }}
                        style={{ containerStyle: { background: '#000' } }}
                    />
                </div>

                {/* Controls */}
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1rem', color: 'var(--text-muted)', width: 22, textAlign: 'center' }}>🔍</span>
                        <input
                            type="range"
                            min={minZoom}
                            max={4}
                            step={0.01}
                            value={zoom}
                            onChange={e => { setZoom(Number(e.target.value)); setMode('crop'); }}
                            style={{ flex: 1, accentColor: 'var(--accent-color)' }}
                            title="Zoom"
                        />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: 36, textAlign: 'right' }}>
                            {Math.round(zoom * 100)}%
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1rem', color: 'var(--text-muted)', width: 22, textAlign: 'center' }}>🔄</span>
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
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: 36, textAlign: 'right' }}>
                            {rotation}°
                        </span>
                    </div>
                </div>

                <div className="btn-group" style={{ marginTop: '16px' }}>
                    <button className="btn-secondary" onClick={onCancel} disabled={isSaving}>Cancel</button>
                    <button className="submit-btn" onClick={handleSave} disabled={isSaving} style={{ width: 'auto', flex: 1 }}>
                        {isSaving ? '⏳ Processing...' : '✓ Confirm & Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
}
