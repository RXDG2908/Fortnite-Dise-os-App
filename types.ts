
export interface AdItem {
  id: string;
  imageSrc: string;
  price: string;
  span: 1 | 2 | 3 | 4; // 1 = Quarter, 2 = Half, 3 = Three Quarters, 4 = Full Row
  offsetX: number;
  offsetY: number;
  scale: number; // Percentage (e.g., 100 = 1x)
  name?: string;
  fadeTop: number;
  fadeBottom: number;
  fadeLeft: number;
  fadeRight: number;
  allowOverflow?: boolean;
}

export type AdMode = 'products' | 'qr';

export interface QRConfig {
  url: string;
  label: string;
  qrSize: number;
  qrColor: string;
  qrBgColor: string;
}

export interface AdConfig {
  backgroundColor: string;
  backgroundSrc: string | null;
  backgroundSplit: 'none' | 'left' | 'right';
  headerLogoSrc: string | null;
  cardBackgroundSrc: string | null;
  footerText: string;
  footerColor: string;
  footerImageSrc: string | null;
  useFooterImage: boolean;
  priceTagColor: string;
  gridColumns: 3 | 4;
  priceSize: number; // Font size in pixels
  fontFamily: string;
  mode: AdMode;
  qrConfig: QRConfig;
  aspectRatio: 'none' | '16/9' | '9/16' | '1/1' | '4/5';
}

export const SPAN_OPTIONS = [
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 3, label: '3x' },
  { value: 4, label: '4x' },
] as const;
