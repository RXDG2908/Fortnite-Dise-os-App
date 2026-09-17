
import React, { forwardRef, useState, useEffect } from 'react';
import { AdItem, AdConfig } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { toJpeg } from 'html-to-image';
import { Download } from 'lucide-react';

function getPriceImageFilename(price: string): string {
  if (!price) return 'S0.png';
  let clean = price.trim().toUpperCase().replace(/\s+/g, '');
  
  // Normalize prefix by stripping "S/.", "S/", "S"
  const cleanNum = clean.replace(/^S\/\./, '').replace(/^S\//, '').replace(/^S/, '').trim();
  const num = parseFloat(cleanNum);
  
  if (!isNaN(num)) {
    // Specific match for "S/.4" -> "S3.png" as user requested
    if (num === 4) {
      return 'S3.png';
    }
    return `S${num}.png`;
  }
  
  // Fallback if not a clean number
  return clean.endsWith('.png') ? clean : `${clean}.png`;
}

interface PriceImageProps {
  item: AdItem;
  priceSize: number;
  fontFamily: string;
}

const PriceImage: React.FC<PriceImageProps> = ({ item, priceSize, fontFamily }) => {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const candidates = React.useMemo(() => {
    if (item.priceImageSrc) {
      return [item.priceImageSrc];
    }

    const baseFilename = getPriceImageFilename(item.price);
    const lowerFilename = baseFilename.toLowerCase();
    const upperFilename = baseFilename.toUpperCase();

    let cleanNum = item.price ? item.price.trim().toUpperCase().replace(/\s+/g, '').replace(/^S\/\./, '').replace(/^S\//, '').replace(/^S/, '') : '';
    const num = parseFloat(cleanNum);
    const numCandidates: string[] = [];
    if (!isNaN(num)) {
      numCandidates.push(`S${num}.png`, `s${num}.png`, `S${num}.PNG`, `s${num}.PNG`);
    }

    const uniqueCandidates = Array.from(new Set([
      `/images/logo/PRECIOS/${baseFilename}`,
      `/images/logo/PRECIOS/${lowerFilename}`,
      `/images/logo/PRECIOS/${upperFilename}`,
      ...numCandidates.map(c => `/images/logo/PRECIOS/${c}`)
    ]));

    return uniqueCandidates;
  }, [item.priceImageSrc, item.price]);

  useEffect(() => {
    setCandidateIndex(0);
    setHasError(false);
  }, [candidates]);

  const currentSrc = candidates[candidateIndex];

  const handleImageError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  const isWide = item.span >= 2;

  if (hasError) {
    const filename = getPriceImageFilename(item.price);
    return (
      <div className={`flex flex-col ${isWide ? 'items-start pl-2' : 'items-center'} bg-black/60 px-4 py-2.5 rounded-lg border border-white/20 shadow-xl backdrop-blur-sm pointer-events-auto select-none`}>
        <span 
          className={`text-[#E6F2FF] font-black leading-none select-none tracking-tight ${isWide ? 'text-left' : 'text-center'}`}
          style={{ 
            fontSize: `${priceSize}px`,
            fontFamily: fontFamily === 'Inter' ? undefined : fontFamily,
            textShadow: `${Math.max(2, Math.round(priceSize * 0.08))}px ${Math.max(2, Math.round(priceSize * 0.08))}px 0px #000B47`,
          }}
        >
          {item.price || 'S/.0'}
        </span>
        <span className="text-[9px] font-mono text-neutral-400 mt-1 select-all bg-neutral-900/80 px-1.5 py-0.5 rounded border border-neutral-800">
          Subir: {filename}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`${isWide ? 'self-start pl-2' : 'self-center'} flex items-center justify-center select-none`}
      style={{
        height: `${priceSize * 1.55}px`,
      }}
    >
      <img 
        src={currentSrc} 
        alt={`Precio ${item.price}`} 
        className="h-full object-contain pointer-events-none"
        onError={handleImageError}
      />
    </div>
  );
};

interface AdPreviewProps {
  items: AdItem[];
  config: AdConfig;
  selectedId: string | null;
  onSelectItem: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

const AdPreview = forwardRef<HTMLDivElement, AdPreviewProps>(({ items, config, selectedId, onSelectItem, onReorder }, ref) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggingIndex !== null && draggingIndex !== index) {
      onReorder(draggingIndex, index);
    }
    setDraggingIndex(null);
  };

  // --- Lógica de Dimensiones Constantes Mejorada ---
  // Aumentamos el padding para un mejor centrado visual
  // px-16 equivale a 64px por lado. Total = 128px
  const horizontalPadding = 128; 
  const gapSize = 16;
  const availableWidth = 1200 - horizontalPadding;
  const columnWidth = (availableWidth - (gapSize * (config.gridColumns - 1))) / config.gridColumns;

  // Altura base fija para mantener la proporción alargada de la imagen (estilo Fortnite)
  const baseHeight = 380; 

  const getContainerStyles = () => {
    const baseStyles: React.CSSProperties = {
      backgroundColor: config.backgroundColor,
      backgroundImage: config.backgroundSrc ? `url(${config.backgroundSrc})` : 'none',
      backgroundSize: config.backgroundSplit && config.backgroundSplit !== 'none' ? '200% 100%' : 'cover',
      backgroundPosition: config.backgroundSplit === 'left' ? 'left center' : (config.backgroundSplit === 'right' ? 'right center' : 'center'),
      fontFamily: config.fontFamily
    };

    if (config.aspectRatio && config.aspectRatio !== 'none') {
      const [w, h] = config.aspectRatio.split('/').map(Number);
      const ratio = h / w;
      return {
        ...baseStyles,
        height: `${1200 * ratio}px`,
        minHeight: `${1200 * ratio}px`
      };
    }

    return { ...baseStyles, minHeight: '800px' };
  };

  const getCardStyles = () => {
    return {
      backgroundColor: config.backgroundColor,
      backgroundImage: config.backgroundSrc ? `url(${config.backgroundSrc})` : 'none',
      backgroundSize: config.backgroundSplit && config.backgroundSplit !== 'none' ? '200% 100%' : 'cover',
      backgroundPosition: config.backgroundSplit === 'left' ? 'left center' : (config.backgroundSplit === 'right' ? 'right center' : 'center'),
      fontFamily: config.fontFamily,
      width: '600px',
      height: '800px',
    };
  };

  const exportSingleCard = async (item: AdItem) => {
    const element = document.getElementById(`product-card-${item.id}`);
    if (!element) return;
    try {
      setExportingId(item.id);
      // Give React a brief moment to update the state so that the editor highlight border is hidden before capture
      await new Promise(resolve => setTimeout(resolve, 80));
      const dataUrl = await toJpeg(element, {
        quality: 0.98,
        pixelRatio: 3, // Excellent high quality! 3 * 600 = 1800px width (Perfect 3:4 TikTok quality)
        backgroundColor: config.backgroundColor,
        cacheBust: true,
      });
      const link = document.createElement('a');
      const sanitizedName = (item.name || 'product').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      link.download = `rxdg-tiktok-${sanitizedName}-${Date.now()}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting single card', err);
    } finally {
      setExportingId(null);
    }
  };

  if (config.mode === 'inp_card') {
    return (
      <div 
        ref={ref} 
        className="flex flex-col gap-8 max-w-[1300px] w-full p-4 select-none"
      >
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <h2 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2 justify-center sm:justify-start">
            <span className="w-2.5 h-6 rounded bg-brand-orange inline-block" />
            Mesas de Trabajo (TikTok 3:4)
          </h2>
          <p className="text-xs text-neutral-400">Cada producto se renderiza de forma independiente en una mesa de trabajo de proporción 3:4, con su propio precio automático.</p>
        </div>

        <div className="flex flex-wrap gap-12 justify-center">
          {items.map((item, index) => {
            const isSelected = selectedId === item.id && exportingId !== item.id;
            
            return (
              <div 
                key={item.id}
                className="flex flex-col gap-3"
              >
                {/* Artboard Header */}
                <div className="flex items-center justify-between px-2 text-xs font-semibold text-neutral-400">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-[10px]">
                      {index + 1}
                    </span>
                    <span className="truncate max-w-[200px] text-neutral-300 font-bold uppercase">
                      {item.name || `Producto ${index + 1}`}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportSingleCard(item);
                      }}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 hover:text-white rounded text-brand-orange flex items-center gap-1.5 text-[11px] font-bold border border-neutral-700 transition-colors cursor-pointer"
                      title="Exportar esta mesa de trabajo"
                    >
                      <Download size={12} />
                      Exportar 3:4
                    </button>
                  </div>
                </div>

                {/* The 3:4 Canvas Card */}
                <div 
                  id={`product-card-${item.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectItem(item.id);
                  }}
                  className="relative cursor-pointer rounded-none border-0 transition-all duration-300 shadow-2xl flex flex-col overflow-hidden bg-cover bg-center"
                  style={getCardStyles()}
                >
                  {/* Card Background Overlay (to mimic split background or card background custom style) */}
                  {config.cardBackgroundSrc && (
                    <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                      <img src={config.cardBackgroundSrc} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* --- LOGO (Esquina Superior Derecha) --- */}
                  <div className="absolute top-6 right-6 z-20 pointer-events-none flex items-center justify-end">
                    {config.headerLogoSrc ? (
                        <img 
                          src={config.headerLogoSrc} 
                          alt="Logo" 
                          className="w-auto max-h-[70px] max-w-[180px] object-contain drop-shadow-2xl"
                        />
                    ) : (
                        <div className="border border-dashed border-white/20 rounded px-3 py-1.5 text-white/40 text-[10px] font-bold uppercase tracking-widest bg-black/10 backdrop-blur-sm">
                            LOGO AQUÍ
                        </div>
                    )}
                  </div>

                  {/* --- PRODUCT IMAGE DISPLAY --- */}
                  <div className="flex-1 relative z-10 w-full flex items-center justify-center">
                    <div 
                      className="absolute inset-0 pointer-events-none flex items-center justify-center"
                      style={{ clipPath: item.allowOverflow ? 'inset(-1000px 0px 0px 0px)' : 'inset(0px)' }}
                    >
                      <img 
                        src={item.imageSrc} 
                        alt="Product" 
                        className="w-full h-full object-contain"
                        style={{ 
                          transform: `translate(${item.offsetX || 0}px, ${item.offsetY}px) scale(${item.scale / 100})`,
                          maskImage: (!item.allowOverflow && (item.fadeTop || item.fadeBottom || item.fadeLeft || item.fadeRight))
                            ? `linear-gradient(to right, transparent, black ${item.fadeLeft || 0}%, black ${100 - (item.fadeRight || 0)}%, transparent), 
                               linear-gradient(to bottom, transparent, black ${item.fadeTop || 0}%, black ${100 - (item.fadeBottom || 0)}%, transparent)` 
                            : 'none',
                          WebkitMaskImage: (!item.allowOverflow && (item.fadeTop || item.fadeBottom || item.fadeLeft || item.fadeRight))
                            ? `linear-gradient(to right, transparent, black ${item.fadeLeft || 0}%, black ${100 - (item.fadeRight || 0)}%, transparent), 
                               linear-gradient(to bottom, transparent, black ${item.fadeTop || 0}%, black ${100 - (item.fadeBottom || 0)}%, transparent)` 
                            : 'none',
                          maskComposite: 'intersect',
                          WebkitMaskComposite: 'source-in',
                        }}
                      />
                    </div>

                    {/* Price Tag (Centered inside each card) */}
                    <div className={`absolute bottom-4 left-4 right-4 flex flex-col ${item.span >= 2 ? 'items-start pl-2' : 'items-center'} justify-center z-20 pointer-events-none`}>
                      <PriceImage item={item} priceSize={config.priceSize * 1.1} fontFamily={config.fontFamily} />
                    </div>
                  </div>

                  {/* --- FOOTER (Siempre debajo) --- */}
                  <div 
                    className="h-16 w-full mt-auto flex items-center justify-center text-white text-3xl uppercase tracking-wider relative z-10 overflow-hidden"
                    style={{ 
                      backgroundColor: config.useFooterImage ? 'transparent' : config.footerColor,
                      fontFamily: config.fontFamily === 'Inter' ? undefined : config.fontFamily
                    }}
                  >
                     {config.useFooterImage && config.footerImageSrc ? (
                       <img 
                         src={config.footerImageSrc} 
                         alt="Footer" 
                         className="h-full w-auto max-h-[85%] object-contain"
                         style={{ transform: 'translateY(-5px)' }}
                       />
                     ) : (
                       <span className="relative drop-shadow-md">{config.footerText}</span>
                     )}
                  </div>
                  
                  {isSelected && (
                    <div className="absolute inset-0 border-4 border-yellow-400 pointer-events-none z-50">
                      <div className="absolute top-2 left-2 bg-yellow-400 text-black text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase animate-pulse">
                        EDITANDO
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="h-64 border-4 border-dashed border-white/20 rounded-xl flex items-center justify-center text-white/30 font-bold text-2xl uppercase backdrop-blur-sm bg-black/20">
              Arrastra o sube imágenes para comenzar
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className="w-[1200px] flex flex-col relative bg-cover bg-center"
      style={getContainerStyles()}
    >
      {/* --- HEADER --- */}
      <div className="w-full p-8 flex items-center justify-center relative z-20 min-h-[140px]">
        {config.headerLogoSrc ? (
            <img 
              src={config.headerLogoSrc} 
              alt="Logo" 
              className="h-full w-auto max-h-[150px] max-w-[40%] object-contain drop-shadow-2xl filter"
            />
        ) : (
            <div className="border-2 border-dashed border-white/30 rounded px-8 py-6 text-white/50 text-2xl font-bold uppercase tracking-widest">
                LOGO AQUÍ
            </div>
        )}
      </div>

      {/* --- GRID / QR CONTENT --- */}
      <div className={`flex-1 px-16 py-4 z-10 flex flex-col ${config.aspectRatio !== 'none' ? 'justify-center' : ''}`}>
        {config.mode === 'products' ? (
          <div className="flex flex-col">
            <div className={`grid gap-4 auto-rows-min ${config.gridColumns === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {items.map((item, index) => {
                const colSpanClass = {
                  1: 'col-span-1',
                  2: 'col-span-2',
                  3: 'col-span-3',
                  4: 'col-span-4'
                }[item.span];

                const finalHeight = baseHeight;

                const isSelected = selectedId === item.id;
                const isDragging = draggingIndex === index;

                return (
                  <div 
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(item.id);
                    }}
                    className={`
                      ${colSpanClass}
                      relative group cursor-pointer rounded-xl border-4 transition-all duration-200 shadow-2xl
                      ${isSelected ? 'border-yellow-400 ring-4 ring-yellow-400/30 z-20 scale-[1.02]' : 'border-transparent hover:border-white/30'}
                      ${isDragging ? 'opacity-40 border-dashed border-white' : ''}
                      overflow-visible
                    `}
                    style={{ height: `${finalHeight}px` }}
                  >
                    {/* Background Layer (Visual Box) */}
                    <div className="absolute inset-0 rounded-lg overflow-hidden z-0">
                      <div 
                        className="w-full h-full relative"
                        style={{ 
                          backgroundImage: config.cardBackgroundSrc ? `url(${config.cardBackgroundSrc})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                          {/* Dark Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      </div>
                    </div>
                    
                    {/* Product Image Layer (Only overflow top) */}
                    <div 
                      className="absolute inset-0 z-10 pointer-events-none"
                      style={{ clipPath: item.allowOverflow ? 'inset(-1000px 0px 0px 0px)' : 'inset(0px)' }}
                    >
                        <img 
                          src={item.imageSrc} 
                          alt="Item" 
                          className="w-full h-full object-contain transition-transform duration-100 ease-out"
                          style={{ 
                            transform: `translate(${item.offsetX || 0}px, ${item.offsetY}px) scale(${item.scale / 100})`,
                            maskImage: (!item.allowOverflow && (item.fadeTop || item.fadeBottom || item.fadeLeft || item.fadeRight))
                              ? `linear-gradient(to right, transparent, black ${item.fadeLeft || 0}%, black ${100 - (item.fadeRight || 0)}%, transparent), 
                                 linear-gradient(to bottom, transparent, black ${item.fadeTop || 0}%, black ${100 - (item.fadeBottom || 0)}%, transparent)` 
                              : 'none',
                            WebkitMaskImage: (!item.allowOverflow && (item.fadeTop || item.fadeBottom || item.fadeLeft || item.fadeRight))
                              ? `linear-gradient(to right, transparent, black ${item.fadeLeft || 0}%, black ${100 - (item.fadeRight || 0)}%, transparent), 
                                 linear-gradient(to bottom, transparent, black ${item.fadeTop || 0}%, black ${100 - (item.fadeBottom || 0)}%, transparent)` 
                              : 'none',
                            maskComposite: 'intersect',
                            WebkitMaskComposite: 'source-in',
                          }}
                        />
                    </div>

                    {/* Price Tag & Info */}
                    <div className={`absolute bottom-4 left-4 right-4 flex flex-col ${item.span >= 2 ? 'items-start' : 'items-center'} gap-1 pointer-events-none z-20`}>
                      <PriceImage item={item} priceSize={config.priceSize} fontFamily={config.fontFamily} />
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 text-xs font-bold rounded z-30">
                        EDITANDO
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {items.length === 0 && (
              <div className="h-64 border-4 border-dashed border-white/20 rounded-xl flex items-center justify-center text-white/30 font-bold text-2xl uppercase backdrop-blur-sm bg-black/20">
                  Arrastra o sube imágenes para comenzar
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-8 border-white/20 flex flex-col items-center gap-8">
              <QRCodeCanvas 
                value={config.qrConfig.url}
                size={config.qrConfig.qrSize}
                fgColor={config.qrConfig.qrColor}
                bgColor={config.qrConfig.qrBgColor}
                level="H"
                includeMargin={true}
              />
              <div 
                className="text-black font-bold text-4xl text-center max-w-[600px] uppercase tracking-tighter leading-none"
                style={{ fontFamily: config.fontFamily === 'Inter' ? undefined : config.fontFamily }}
              >
                {config.qrConfig.label}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- FOOTER --- */}
      <div 
        className="h-24 w-full mt-auto flex items-center justify-center text-white text-5xl uppercase tracking-wider relative z-10 overflow-visible"
        style={{ 
          backgroundColor: config.useFooterImage ? 'transparent' : config.footerColor,
          fontFamily: config.fontFamily === 'Inter' ? undefined : config.fontFamily
        }}
      >
         {config.useFooterImage && config.footerImageSrc ? (
           <img 
             src={config.footerImageSrc} 
             alt="Footer" 
             className="h-full w-auto max-h-[85%] object-contain"
             style={{ transform: 'translateY(-20px)' }}
           />
         ) : (
           <span className="relative drop-shadow-md mt-2">{config.footerText}</span>
         )}
      </div>
    </div>
  );
});

AdPreview.displayName = 'AdPreview';
export default AdPreview;
