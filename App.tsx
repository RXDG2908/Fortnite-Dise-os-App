
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AdItem, AdConfig } from './types';
import EditorSidebar from './components/EditorSidebar';
import AdPreview from './components/AdPreview';
import { Download, Layout, Menu, Maximize2, Minimize2, ChevronLeft, ChevronRight, Monitor } from 'lucide-react';
import { toJpeg, toPng, toBlob } from 'html-to-image';

export default function App() {
  // --- State ---
  const [items, setItems] = useState<AdItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [config, setConfig] = useState<AdConfig>({
    backgroundColor: '#D35400',
    backgroundSrc: null,
    backgroundSplit: 'none',
    headerLogoSrc: '/images/logo/NUEVO CODEMesa de trabajo 1.png',
    cardBackgroundSrc: null,
    footerText: 'FB.COM/RXDGREGALOS',
    footerColor: '#E91E63',
    footerImageSrc: '/images/footer/FOOTER.png',
    useFooterImage: true,
    priceTagColor: '#D35400', 
    gridColumns: 4,
    priceSize: 48, // Default 48px (text-5xl approx)
    fontFamily: 'BurbankBigCondensed-Black',
    mode: 'products',
    aspectRatio: 'none',
    qrConfig: {
      url: 'https://facebook.com/rxdgregalos',
      label: '¡SÍGUENOS EN FACEBOOK!',
      qrSize: 400,
      qrColor: '#000000',
      qrBgColor: '#FFFFFF',
    },
  });
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // --- Fullscreen Logic ---
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // --- Utilities ---
  const resizeImage = (file: File, maxDim: number = 2400): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
          }
          
          // Si el archivo original es PNG, mantenemos PNG para preservar transparencia
          // De lo contrario usamos JPEG para ahorrar memoria
          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          resolve(canvas.toDataURL(outputType, 0.92));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // --- Handlers ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const newItems: AdItem[] = [];
      
      for (const file of files) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        let extractedPrice = 'S/19.99'; 
        const priceMatch = nameWithoutExt.match(/\sS\s*(\d+(\.\d{1,2})?)$/i);
        
        if (priceMatch && priceMatch[1]) {
            extractedPrice = `S/${priceMatch[1]}`;
        }

        // Optimizamos la imagen antes de añadirla al estado
        const optimizedSrc = await resizeImage(file);

        newItems.push({
          id: crypto.randomUUID(),
          imageSrc: optimizedSrc,
          price: extractedPrice,
          span: 1,
          offsetX: 0,
          offsetY: 0,
          scale: 100,
          name: nameWithoutExt,
          fadeTop: 0,
          fadeBottom: 0,
          fadeLeft: 0,
          fadeRight: 0,
          allowOverflow: false,
        });
      }
      setItems((prev) => [...prev, ...newItems]);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const optimizedSrc = await resizeImage(e.target.files[0], 800); // Logo no necesita ser tan grande
      setConfig((prev) => ({ ...prev, headerLogoSrc: optimizedSrc }));
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const optimizedSrc = await resizeImage(e.target.files[0], 2000); // Fondo sí puede ser grande
      setConfig((prev) => ({ ...prev, backgroundSrc: optimizedSrc }));
    }
  };

  const handleCardBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const optimizedSrc = await resizeImage(e.target.files[0], 1000);
      setConfig((prev) => ({ ...prev, cardBackgroundSrc: optimizedSrc }));
    }
  };

  const handleFooterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const optimizedSrc = await resizeImage(e.target.files[0], 1200); // Footer image can be medium width
      setConfig((prev) => ({ ...prev, footerImageSrc: optimizedSrc, useFooterImage: true }));
    }
  };

  const updateItem = (id: string, updates: Partial<AdItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const moveItem = (id: string, direction: 'forward' | 'backward') => {
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return;
    
    const newItems = [...items];
    if (direction === 'backward' && index > 0) {
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    } else if (direction === 'forward' && index < newItems.length - 1) {
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    }
    setItems(newItems);
  };

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    const newItems = [...items];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    setItems(newItems);
  };

  const handleExport = useCallback(async () => {
    if (previewRef.current === null) return;
    setIsExporting(true);
    setSelectedId(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Attempting Ultra-HD export (JPEG, 3x)...');
      
      // JPEG es más eficiente en memoria para resoluciones altas
      const dataUrl = await toJpeg(previewRef.current, { 
        quality: 0.98,
        pixelRatio: 3, // 3600px de ancho (Ultra HD)
        backgroundColor: config.backgroundColor,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `rxdg-ad-ultrahd-${Date.now()}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err: any) {
      console.error('Ultra-HD Export failed, trying 2x...', err);
      try {
        // Reintento automático a 2x (2400px) si 3x falla
        const dataUrl = await toJpeg(previewRef.current, { 
          quality: 0.95,
          pixelRatio: 2, 
          backgroundColor: config.backgroundColor,
        });
        const link = document.createElement('a');
        link.download = `rxdg-ad-hd-${Date.now()}.jpg`;
        link.href = dataUrl;
        link.click();
      } catch (retryErr) {
        console.error('HD Export failed, trying 1.5x...', retryErr);
        try {
          const dataUrl = await toJpeg(previewRef.current, { 
            quality: 0.90,
            pixelRatio: 1.5, 
            backgroundColor: config.backgroundColor,
          });
          const link = document.createElement('a');
          link.download = `rxdg-ad-high-${Date.now()}.jpg`;
          link.href = dataUrl;
          link.click();
        } catch (finalErr) {
          alert('La imagen es demasiado compleja para la memoria de tu navegador. Intenta reducir el número de objetos o usa imágenes más pequeñas.');
        }
      }
    } finally {
      setIsExporting(false);
    }
  }, [config.backgroundColor]);

  const selectedItem = items.find((i) => i.id === selectedId);

  return (
    <div className="flex h-screen w-full bg-neutral-900 text-gray-100 font-sans overflow-hidden">
      
      {/* Left Panel: Editor Sidebar */}
      <div 
        className={`flex-shrink-0 border-r border-neutral-800 bg-neutral-900 z-20 flex flex-col h-full shadow-xl transition-all duration-300 ease-in-out ${isSidebarVisible ? 'w-80' : 'w-0 overflow-hidden border-none'}`}
      >
        <div className="p-5 border-b border-neutral-800 flex items-center gap-3">
          <div className="p-2 bg-brand-orange rounded-lg">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight whitespace-nowrap">RXDG Builder</h1>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
           <EditorSidebar 
             config={config}
             setConfig={setConfig}
             selectedItem={selectedItem}
             updateItem={updateItem}
             deleteItem={deleteItem}
             moveItem={moveItem}
             onDeselect={() => setSelectedId(null)}
             onUploadImages={handleFileUpload}
             onUploadLogo={handleLogoUpload}
             onUploadBackground={handleBackgroundUpload}
             onUploadCardBackground={handleCardBackgroundUpload}
             onUploadFooterImage={handleFooterImageUpload}
           />
        </div>

        <div className="p-4 border-t border-neutral-800 bg-neutral-900">
           <button 
             onClick={handleExport}
             disabled={isExporting || items.length === 0}
             className={`w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95
               ${isExporting || items.length === 0 
                 ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed' 
                 : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'}`}
           >
             {isExporting ? 'Rendering...' : (
               <>
                 <Download size={20} />
                 Export Ultra-HD JPG
               </>
             )}
           </button>
        </div>
      </div>

      {/* Right Panel: Canvas Preview */}
      <div className="flex-1 bg-neutral-950 relative overflow-hidden flex flex-col">
        {/* Toolbar / Status Bar */}
        <div className="h-14 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between px-6 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-semibold"
              title={isSidebarVisible ? "Ocultar Editor" : "Mostrar Editor"}
            >
              {isSidebarVisible ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              {isSidebarVisible ? 'Ocultar Editor' : 'Mostrar Editor'}
            </button>
            <div className="h-6 w-px bg-neutral-800" />
            <span className="text-neutral-400 text-sm flex items-center gap-2">
              <Menu size={16} />
              {items.length} Objetos
            </span>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={toggleFullscreen}
               className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-bold transition-all text-neutral-300 hover:text-white border border-neutral-700"
             >
               {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
               {isFullscreen ? 'Salir' : 'Pantalla Completa'}
             </button>
             <div className="h-6 w-px bg-neutral-800 mx-1" />
             <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
                <span className="flex items-center gap-1"><Monitor size={12} /> ULTRA-HD MODE</span>
                <span>ZOOM: AUTO</span>
             </div>
          </div>
        </div>

        {/* Scrollable Canvas Area */}
        <div 
          className="flex-1 overflow-auto p-8 flex justify-center items-start custom-scrollbar bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:24px_24px]"
          onClick={() => setSelectedId(null)}
        >
          <div 
            className={`relative transition-all duration-500 ease-in-out origin-top shadow-2xl ${isExporting ? 'scale-100' : 'scale-[0.9] lg:scale-100'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <AdPreview 
              ref={previewRef}
              items={items}
              config={config}
              selectedId={selectedId}
              onSelectItem={setSelectedId}
              onReorder={handleReorder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
