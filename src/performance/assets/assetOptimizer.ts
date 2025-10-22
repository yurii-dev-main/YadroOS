export interface ImageOptimizationOptions {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'webp' | 'jpeg' | 'png';
  lazy?: boolean;
}

export const buildImageAttributes = (src: string, options: ImageOptimizationOptions = {}) => {
  const params = new URLSearchParams();
  if (options.quality) params.set('q', String(options.quality));
  if (options.width) params.set('w', String(options.width));
  if (options.height) params.set('h', String(options.height));
  if (options.format) params.set('format', options.format);
  const optimizedSrc = params.toString() ? `${src}?${params.toString()}` : src;
  return {
    src: optimizedSrc,
    loading: options.lazy ? 'lazy' : 'eager',
    decoding: 'async' as const
  };
};

export interface FontPreloadOptions {
  weight?: number;
  style?: 'normal' | 'italic';
  display?: 'swap' | 'fallback' | 'optional';
}

export const buildFontPreloadTag = (href: string, options: FontPreloadOptions = {}) => ({
  rel: 'preload',
  href,
  as: 'font' as const,
  type: 'font/woff2' as const,
  crossOrigin: 'anonymous' as const,
  ...options
});
