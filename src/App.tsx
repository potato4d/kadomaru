import React, { useState, useCallback, useRef } from "react";

type Size = {
  width: number;
  height: number;
};

const MAX_PREVIEW_WIDTH = 960;

export const App: React.FC = () => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<Size | null>(null);
  const [radius, setRadius] = useState<number>(4);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        setImageData(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setOriginalSize({ width: naturalWidth, height: naturalHeight });
  };

  const handleRadiusChange = (value: string) => {
    const num = parseInt(value, 10);
    setRadius(
      isNaN(num) ? 0 : num
    );
  };

  const handleDownload = () => {
    if (!imageData) return;

    const image = new Image();
    image.src = imageData;
    image.onload = () => {
      const { width, height } = image;
      const r = Math.min(radius, width / 2, height / 2);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(width - r, 0);
      ctx.quadraticCurveTo(width, 0, width, r);
      ctx.lineTo(width, height - r);
      ctx.quadraticCurveTo(width, height, width - r, height);
      ctx.lineTo(r, height);
      ctx.quadraticCurveTo(0, height, 0, height - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(image, 0, 0);

      const link = document.createElement("a");
      link.download = "rounded-image.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  const previewBorderRadius =
    originalSize && originalSize.width > MAX_PREVIEW_WIDTH
      ? (radius * MAX_PREVIEW_WIDTH) / originalSize.width
      : radius;

  return (
    <div className="mx-auto max-w-screen-lg min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4 text-center flex items-center justify-center gap-1">
        <span>画像角丸くん</span>
        <img src="/kadomaru/favicon.png" width="28" height="28" alt="" />
      </h1>
      <p className="mb-8 text-center text-gray-500 text-sm">サーバーへの画像データ保存なし・ブラウザで完結する画像角丸化ツール</p>

      <div
        role="button"
        aria-label="画像ファイルをドロップ"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter") fileInputRef.current?.click();
        }}
        className={
          !imageData
            ? "relative w-full h-96 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-sm bg-white mb-4 overflow-hidden"
            : "relative w-full flex items-center justify-center bg-white mb-4 overflow-hidden"
        }
        style={{ maxWidth: `${MAX_PREVIEW_WIDTH}px`, margin: "0 auto" }}
      >
        {imageData ? (
          <img
            src={imageData}
            alt="プレビュー画像"
            onLoad={onImageLoad}
            style={{
              objectFit: "cover",
              borderRadius: `${previewBorderRadius}px`,
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />
        ) : (
          <p className="text-gray-500">ここに画像ファイルをドロップ</p>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
          hidden
        />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <div className="mb-4 inline-flex justify-end gap-2 w-full">
          <input
            type="range"
            min={0}
            max={300}
            value={radius}
            onChange={(e) => handleRadiusChange(e.target.value)}
            aria-label="角丸の半径を調整"
          />
          <label className="inline-flex gap-2 items-end">
            <input
              type="number"
              className="border p-1 rounded w-16"
              value={radius}
              onChange={(e) => handleRadiusChange(e.target.value)}
              aria-label="角丸の半径(px)"
            />
            <span className="inline-block mb-1">px</span>
          </label>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={!imageData}
          >
            ダウンロード
          </button>
        </div>
      </div>

      <footer className="text-center font-sm p-8 text-gray-800">
        &copy; 2025 @potato4d
      </footer>
    </div>
  );
};
