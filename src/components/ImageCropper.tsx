'use client';

import React, { useState, useCallback } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  image,
  onCropComplete,
  onCancel,
  aspectRatio = 16 / 9,
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (crop: Point) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteInternal = useCallback((_extendedArea: Area, _croppedAreaPixels: Area) => {
    setCroppedAreaPixels(_croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      const img = await createImage(image);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        onCropComplete(file);
      }, 'image/jpeg', 0.9);
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  return (
    <div className="cropper-modal-overlay">
      <div className="cropper-modal-content glass-panel">
        <header className="cropper-header">
          <h3 className="text-lg font-bold">
            Dostosuj kadr {aspectRatio === 16/9 ? '(16:9)' : aspectRatio === 3/4 ? '(3:4)' : ''}
          </h3>
          <button onClick={onCancel} className="close-btn">
            <X size={20} />
          </button>
        </header>

        <div className="cropper-container-wrapper">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteInternal}
          />
        </div>

        <div className="cropper-controls p-6">
          <p className="text-secondary text-xs mb-4 text-center">
            Powiększ suwakiem i przesuń zdjęcie, aby wybrać idealny kadr.
          </p>
          <div className="flex items-center gap-4 mb-6">
            <ZoomOut size={18} className="text-secondary" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="zoom-range flex-1"
            />
            <ZoomIn size={18} className="text-secondary" />
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={handleSave} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
              <Check size={20} /> Zatwierdź kadr
            </button>
            <button type="button" onClick={onCancel} className="btn-secondary py-3 px-8">
              Anuluj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
