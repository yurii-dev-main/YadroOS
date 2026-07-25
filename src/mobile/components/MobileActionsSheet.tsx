import { Camera, FileText, Share2 } from 'lucide-react';
import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import Webcam from 'react-webcam';
import { animated, useSpring } from '@react-spring/web';

import { BottomSheet } from './BottomSheet';

export interface MobileActionsSheetProps {
  open: boolean;
  onClose: () => void;
}

export const MobileActionsSheet = ({ open, onClose }: MobileActionsSheetProps) => {
  const webcamRef = useRef<Webcam | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [pdfInfo, setPdfInfo] = useState<string>('');
  const [locationInfo, setLocationInfo] = useState<string>('');
  const pulseStyles = useSpring({
    loop: processing,
    to: [{ opacity: 0.4 }, { opacity: 1 }],
    from: { opacity: 1 },
    config: { duration: 600 }
  });

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      return;
    }
    setSnapshot(imageSrc);
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const recognizeText = useCallback(async () => {
    if (!snapshot) {
      return;
    }
    setProcessing(true);
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('ukr+eng');
      const {
        data: { text }
      } = await worker.recognize(snapshot);
      setRecognizedText(text.trim());
      await worker.terminate();
    } finally {
      setProcessing(false);
    }
  }, [snapshot]);

  const handlePdfUpload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setProcessing(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfjs: any = await import('pdfjs-dist');
      if ('GlobalWorkerOptions' in pdfjs) {
        pdfjs.GlobalWorkerOptions.workerSrc =
          pdfjs.GlobalWorkerOptions.workerSrc ??
          new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
      }
      const data = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data });
      const pdf = await loadingTask.promise;
      setPdfInfo(`Pages found: ${pdf.numPages}`);
      await pdf.destroy();
    } finally {
      setProcessing(false);
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (!snapshot || !navigator.share) {
      return;
    }
    const response = await fetch(snapshot);
    const blob = await response.blob();
    await navigator.share({
      title: 'YadroOS Capture',
      files: [new File([blob], 'capture.png', { type: 'image/png' })]
    });
  }, [snapshot]);

  return (
    <BottomSheet isOpen={open} onClose={onClose} title="Quick Actions">
      <div className="space-y-4 text-slate-100">
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <Webcam
            ref={(instance) => {
              webcamRef.current = instance;
            }}
            audio={false}
            screenshotFormat="image/png"
            className="h-48 w-full object-cover"
          />
        </div>
        <div className="grid grid-cols-4 gap-3">
          <button
            type="button"
            onClick={capture}
            className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-semibold"
          >
            <Camera className="h-5 w-5" />
            <span>Photo</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-semibold"
          >
            <FileText className="h-5 w-5" />
            <span>PDF</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={!snapshot || !navigator.share}
            className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-semibold disabled:opacity-50"
          >
            <Share2 className="h-5 w-5" />
            <span>Share</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!('geolocation' in navigator)) {
                setLocationInfo('Geolocation is not available on device');
                return;
              }
              navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                  setLocationInfo(
                    `Latitude: ${coords.latitude.toFixed(4)}, Longitude: ${coords.longitude.toFixed(4)}`
                  );
                },
                () => setLocationInfo('Failed to determine geolocation'),
                { enableHighAccuracy: true, timeout: 5000 }
              );
            }}
            className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs font-semibold"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-slate-100"
            >
              <path
                d="M12 21c-4.556 0-8.25-3.694-8.25-8.25S7.444 4.5 12 4.5s8.25 3.694 8.25 8.25S16.556 21 12 21Zm0-9.75a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Location</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handlePdfUpload}
        />
        <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-xs text-slate-400">Recognized text</p>
          <animated.div
            style={pulseStyles}
            className="min-h-[80px] rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-sm"
          >
            {processing ? 'Processing...' : recognizedText || 'Take a photo and click "Recognize"'}
          </animated.div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={recognizeText}
              disabled={!snapshot || processing}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Recognize
            </button>
            <button
              type="button"
              onClick={() => setRecognizedText('')}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
        {snapshot && (
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-400">Latest snapshot</p>
            <img src={snapshot} alt="Snapshot" className="w-full rounded-xl" />
          </div>
        )}
        {pdfInfo && <p className="text-xs text-emerald-400">{pdfInfo}</p>}
        {locationInfo && <p className="text-xs text-sky-400">{locationInfo}</p>}
      </div>
    </BottomSheet>
  );
};
