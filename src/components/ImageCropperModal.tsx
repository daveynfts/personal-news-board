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

// Helper to perform the actual crop on a canvas
async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    fileName: string
): Promise<File> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    // Set canvas dimensions to the crop target
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                console.error('Canvas is empty');
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve(new File([blob], fileName, { type: 'image/jpeg' }));
        }, 'image/jpeg', 1);
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
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const onCropCompleteEvent = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        setIsSaving(true);
        try {
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, fileName);
            onCropComplete(croppedFile);
        } catch (e) {
            console.error('Failed to crop image', e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" style={{ width: '90%', maxWidth: '800px', padding: '24px', display: 'flex', flexDirection: 'column', height: '80vh' }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '16px' }}>Crop Image</h3>
                
                <div style={{ position: 'relative', flex: 1, width: '100%', background: '#333', borderRadius: '12px', overflow: 'hidden' }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
                        onCropChange={setCrop}
                        onCropComplete={onCropCompleteEvent}
                        onZoomChange={setZoom}
                    />
                </div>
                
                <div style={{ marginTop: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 700 }}>Zoom:</label>
                    <input 
                        type="range" 
                        min={1} 
                        max={3} 
                        step={0.1} 
                        value={zoom} 
                        onChange={(e) => setZoom(Number(e.target.value))} 
                        style={{ flex: 1, accentColor: 'var(--accent-color)' }}
                    />
                </div>

                <div className="btn-group" style={{ marginTop: '24px' }}>
                    <button className="btn-secondary" onClick={onCancel} disabled={isSaving}>Cancel</button>
                    <button className="submit-btn" onClick={handleSave} disabled={isSaving} style={{ width: 'auto', flex: 1 }}>
                        {isSaving ? '⏳ Processing...' : '✓ Confirm & Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
}
