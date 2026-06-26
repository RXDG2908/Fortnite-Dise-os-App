
import React, { forwardRef, useState } from 'react';
import { AdItem, AdConfig } from '../types';
import { QRCodeCanvas } from 'qrcode.react';

interface AdPreviewProps {
  items: AdItem[];
  config: AdConfig;
  selectedId: string | null;
  onSelectItem: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

const AdPreview = forwardRef<HTMLDivElement, AdPreviewProps>(({ items, config, selectedId, onSelectItem, onReorder }, ref) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

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
                    <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 pointer-events-none z-20">
                      {config.priceTagBgSrc ? (
                        <div 
                          className="self-start relative flex items-center justify-center select-none"
                          style={{
                            backgroundImage: `url(${config.priceTagBgSrc})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            height: `${config.priceSize * 1.35}px`,
                            width: `${config.priceSize * 1.35 * (1208 / 465)}px`,
                          }}
                        >
                          <span 
                            className="text-white tracking-wider leading-none text-center font-bold"
                            style={{ 
                              fontSize: `${config.priceSize}px`,
                              fontFamily: config.fontFamily === 'Inter' ? undefined : config.fontFamily,
                              transform: 'translateY(-2%)'
                            }}
                          >
                            {item.price}
                          </span>
                        </div>
                      ) : (
                        <div 
                          className="self-start bg-neutral-900/90 px-4 py-2 rounded transform -skew-x-12 border-l-4 shadow-lg"
                          style={{ borderColor: config.priceTagColor }}
                        >
                          <span 
                              className="block transform skew-x-12 text-white tracking-wider leading-none"
                              style={{ 
                                fontSize: `${config.priceSize}px`,
                                fontFamily: config.fontFamily === 'Inter' ? undefined : config.fontFamily
                              }}
                            >
                            {item.price}
                          </span>
                        </div>
                      )}
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
