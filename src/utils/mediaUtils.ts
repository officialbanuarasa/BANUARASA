/**
 * Utility for handling image uploads, Google Drive URL transformation,
 * and media asset formatting for Banua Rasa Weekend Market.
 */

/**
 * Converts various formats of Google Drive sharing links into direct-renderable
 * image URLs (such as Googleusercontent direct link) that can be rendered in <img> tags.
 */
export function convertGoogleDriveUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // If it's already a data URL or blob, return as is
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Check for standard Google Drive /file/d/FILE_ID pattern
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) {
    const fileId = matchFileD[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Check for id query parameter (open?id=FILE_ID or uc?id=FILE_ID)
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) {
    const fileId = matchIdParam[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Check if user just pasted a bare Google Drive File ID (alphanumeric 25-45 chars)
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
    return `https://lh3.googleusercontent.com/d/${trimmed}`;
  }

  return trimmed;
}

/**
 * Extracts Google Drive File ID if present
 */
export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) return trimmed;

  return null;
}

/**
 * Detects whether a URL is a Google Drive link
 */
export function isGoogleDriveLink(url: string): boolean {
  if (!url) return false;
  const trimmed = url.toLowerCase();
  return (
    trimmed.includes('drive.google.com') ||
    trimmed.includes('docs.google.com') ||
    trimmed.includes('googleusercontent.com/d/')
  );
}

/**
 * Converts a browser File object to a compressed Data URL (Base64),
 * ensuring fast rendering and preventing localStorage quota overflow.
 */
export function fileToDataUrl(
  file: File,
  maxWidth = 1600,
  maxHeight = 1200,
  quality = 0.88
): Promise<{ dataUrl: string; sizeText: string; dimension: string }> {
  return new Promise((resolve, reject) => {
    // If SVG, read directly as text Data URL without raster canvas compression
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve({
          dataUrl: result,
          sizeText: formatBytes(file.size),
          dimension: 'Vector SVG',
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const origWidth = img.naturalWidth || img.width;
        const origHeight = img.naturalHeight || img.height;

        let targetWidth = origWidth;
        let targetHeight = origHeight;

        // Scale down proportionally if larger than maximum bounds
        if (targetWidth > maxWidth || targetHeight > maxHeight) {
          const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
          targetWidth = Math.round(targetWidth * ratio);
          targetHeight = Math.round(targetHeight * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // If PNG with transparency, keep PNG
          const isPng = file.type === 'image/png';
          if (!isPng) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
          }
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          const mimeType = isPng ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(mimeType, isPng ? undefined : quality);

          // Calculate approximate base64 size
          const approxBytes = Math.round((dataUrl.length * 3) / 4);

          resolve({
            dataUrl,
            sizeText: formatBytes(approxBytes),
            dimension: `${targetWidth} × ${targetHeight} px`,
          });
        } else {
          resolve({
            dataUrl: event.target?.result as string,
            sizeText: formatBytes(file.size),
            dimension: `${origWidth} × ${origHeight} px`,
          });
        }
      };

      img.onerror = () => {
        resolve({
          dataUrl: event.target?.result as string,
          sizeText: formatBytes(file.size),
          dimension: 'Unknown',
        });
      };

      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to readable size string
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
