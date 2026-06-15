
import React, { useState } from 'react';
import { AdItem, AdConfig, SPAN_OPTIONS } from '../types';
import { Upload, Trash, ArrowUp, ArrowDown, Palette, Image as ImageIcon, X, MoveVertical, MoveHorizontal, ZoomIn, Grid3x3, Grid2x2, Maximize, Square, Type, Link, QrCode, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';

interface EditorSidebarProps {
  config: AdConfig;
  setConfig: React.Dispatch<React.SetStateAction<AdConfig>>;
  selectedItem?: AdItem;
  updateItem: (id: string, updates: Partial<AdItem>) => void;
  deleteItem: (id: string) => void;
  moveItem: (id: string, direction: 'forward' | 'backward') => void;
  onDeselect: () => void;
  onUploadImages: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadLogo: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadBackground: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadCardBackground: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadFooterImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({
  config,
  setConfig,
  selectedItem,
  updateItem,
  deleteItem,
  moveItem,
  onDeselect,
  onUploadImages,
  onUploadLogo,
  onUploadBackground,
  onUploadCardBackground,
  onUploadFooterImage,
}) => {
  const [isFadeExpanded, setIsFadeExpanded] = useState(false);
  const [isBgExpanded, setIsBgExpanded] = useState(false);
  
  return (
    <div className="flex flex-col gap-8 p-5">
      
      {/* 0. Mode Selector */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Modo de Diseño</h2>
        <div className="flex bg-neutral-800 rounded-xl p-1 border border-neutral-700 shadow-inner">
          <button 
            onClick={() => setConfig({...config, mode: 'products'})}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${config.mode === 'products' ? 'bg-brand-orange text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
          >
            <ShoppingCart size={16} /> Productos
          </button>
          <button 
            onClick={() => setConfig({...config, mode: 'qr'})}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${config.mode === 'qr' ? 'bg-brand-orange text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
          >
            <QrCode size={16} /> Código QR
          </button>
        </div>
      </section>

      {/* 1. Global Actions */}
      {config.mode === 'products' && (
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Assets & Branding</h2>
          
          <label className="flex items-center gap-3 w-full p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg cursor-pointer transition-colors border border-neutral-700 group">
            <div className="p-2 bg-blue-600 rounded group-hover:bg-blue-500">
              <ImageIcon size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Add Products</span>
              <span className="text-xs text-neutral-400">Select multiple images</span>
            </div>
            <input type="file" multiple accept="image/*" onChange={onUploadImages} className="hidden" />
          </label>
        </section>
      )}

      {/* QR Settings Section */}
      {config.mode === 'qr' && (
        <section className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
          <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Configuración QR</h2>
          
          <div className="space-y-3 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700">
            <div className="space-y-2">
              <label className="text-[10px] text-neutral-400 uppercase font-bold">Enlace (URL)</label>
              <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 rounded px-2 focus-within:border-brand-orange">
                <Link size={14} className="text-neutral-500" />
                <input 
                  type="text" 
                  value={config.qrConfig.url}
                  onChange={(e) => setConfig({ ...config, qrConfig: { ...config.qrConfig, url: e.target.value } })}
                  className="w-full bg-transparent py-2 text-xs text-white focus:outline-none"
                  placeholder="https://wa.me/..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-neutral-400 uppercase font-bold">Texto de Llamada</label>
              <textarea 
                value={config.qrConfig.label}
                onChange={(e) => setConfig({ ...config, qrConfig: { ...config.qrConfig, label: e.target.value } })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-xs text-white focus:outline-none focus:border-brand-orange h-20 resize-none"
                placeholder="¡ESCANEAME!"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-400 uppercase font-bold">Color QR</label>
                <input 
                  type="color" 
                  value={config.qrConfig.qrColor}
                  onChange={(e) => setConfig({ ...config, qrConfig: { ...config.qrConfig, qrColor: e.target.value } })}
                  className="w-full h-8 bg-transparent rounded cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-neutral-400 uppercase font-bold">Fondo QR</label>
                <input 
                  type="color" 
                  value={config.qrConfig.qrBgColor}
                  onChange={(e) => setConfig({ ...config, qrConfig: { ...config.qrConfig, qrBgColor: e.target.value } })}
                  className="w-full h-8 bg-transparent rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-neutral-400 uppercase font-bold">Tamaño QR</label>
                <span className="text-[10px] text-neutral-500 font-mono">{config.qrConfig.qrSize}px</span>
              </div>
              <input 
                type="range"
                min="200"
                max="600"
                step="10"
                value={config.qrConfig.qrSize}
                onChange={(e) => setConfig({ ...config, qrConfig: { ...config.qrConfig, qrSize: parseInt(e.target.value) } })}
                className="w-full h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-brand-orange"
              />
            </div>
          </div>
        </section>
      )}

      {/* 2. Global Styling */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Global Styling</h2>
        
        {/* Grid Layout Selector */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-neutral-400">Relación de Aspecto (Canvas)</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'none', label: 'Default' },
                { value: '16/9', label: '16:9' },
                { value: '9/16', label: '9:16 (Story)' },
                { value: '1/1', label: '1:1' },
                { value: '4/5', label: '4:5 (Post)' }
              ].map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => setConfig({ ...config, aspectRatio: ratio.value as any })}
                  className={`py-1.5 px-1 text-[10px] font-bold rounded border transition-all
                    ${config.aspectRatio === ratio.value 
                      ? 'bg-brand-orange border-brand-orange text-white' 
                      : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-500'}
                  `}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-neutral-400">Layout Grid</label>
            <div className="flex bg-neutral-800 rounded-lg p-1 border border-neutral-700">
              <button 
                onClick={() => setConfig({...config, gridColumns: 3})}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded ${config.gridColumns === 3 ? 'bg-brand-orange text-white shadow' : 'text-neutral-400 hover:text-white'}`}
              >
                <Grid2x2 size={14} /> 3 Columns
              </button>
              <button 
                onClick={() => setConfig({...config, gridColumns: 4})}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded ${config.gridColumns === 4 ? 'bg-brand-orange text-white shadow' : 'text-neutral-400 hover:text-white'}`}
              >
                <Grid3x3 size={14} /> 4 Columns
              </button>
            </div>
          </div>
        </div>

        {/* Price Font Size Control */}
        <div className="space-y-2">
           <div className="flex justify-between items-center">
             <label className="text-xs text-neutral-400">Tamaño de Precios</label>
             <span className="text-[10px] text-neutral-500 font-mono">{config.priceSize}px</span>
           </div>
           <div className="flex items-center gap-3 bg-neutral-800 p-2 rounded-lg border border-neutral-700">
             <Type size={14} className="text-neutral-500" />
             <input 
                type="range"
                min="24"
                max="120"
                step="2"
                value={config.priceSize}
                onChange={(e) => setConfig({ ...config, priceSize: parseInt(e.target.value) })}
                className="flex-1 h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-brand-orange"
             />
           </div>
        </div>

        {/* Font Family Selector */}
        <div className="space-y-2">
           <label className="text-xs text-neutral-400">Fuente de Texto</label>
           <select 
             value={config.fontFamily}
             onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
             className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white focus:border-brand-orange focus:outline-none"
           >
             <option value="Inter">Inter (Default)</option>
             <option value="BurbankBigCondensed-Black">Burbank Black</option>
             <option value="BurbankBigCondensed-Bold">Burbank Bold</option>
             <option value="Impact">Impact</option>
             <option value="Arial Black">Arial Black</option>
             <option value="custom">-- Usar Fuente de Carpeta --</option>
           </select>
           {config.fontFamily === 'custom' && (
             <input 
               type="text"
               placeholder="Nombre de la fuente en index.css"
               onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
               className="w-full mt-2 bg-neutral-900 border border-neutral-700 rounded p-2 text-xs focus:border-brand-orange focus:outline-none"
             />
           )}
           <p className="text-[10px] text-neutral-500 italic">
             Para usar fuentes propias, súbelas a /public/fonts/ y regístralas en index.css
           </p>
        </div>


        {/* Main Background Image */}
        <div className="space-y-2">
            <label className="text-xs text-neutral-400">Page Background</label>
            <div className="flex flex-col gap-2">
               <div className="flex gap-2">
                  <label className="flex items-center gap-2 flex-1 p-2 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 cursor-pointer text-sm transition-colors">
                     <Upload size={14} />
                     <span>Upload BG</span>
                     <input type="file" accept="image/*" onChange={onUploadBackground} className="hidden" />
                  </label>
                  <div className="flex items-center gap-2 flex-[1.5] bg-neutral-800 border border-neutral-700 rounded px-2 focus-within:border-brand-orange transition-colors">
                     <Link size={14} className="text-neutral-500" />
                     <input 
                       type="text" 
                       placeholder="Paste image URL..."
                       value={config.backgroundSrc?.startsWith('http') ? config.backgroundSrc : ''}
                       onChange={(e) => setConfig({ ...config, backgroundSrc: e.target.value })}
                       className="w-full bg-transparent py-2 text-xs text-white focus:outline-none"
                     />
                  </div>
               </div>
               {config.backgroundSrc && (
                 <div className="relative w-full h-16 rounded overflow-hidden border border-neutral-600">
                    <img src={config.backgroundSrc} className="w-full h-full object-cover" alt="Background Preview" />
                    <button 
                      onClick={() => setConfig({...config, backgroundSrc: null})}
                      className="absolute top-1 right-1 bg-black/70 p-1 rounded-full text-white hover:bg-red-500"
                    >
                      <X size={12} />
                    </button>
                 </div>
               )}
               {config.backgroundSrc && (
                 <div className="space-y-2 pt-2 border-t border-neutral-700/50">
                   <label className="text-[10px] text-neutral-400 uppercase font-bold">Imagen Compartida (Page BG)</label>
                   <div className="grid grid-cols-3 gap-1">
                     {[
                       { value: 'none', label: 'Ninguno' },
                       { value: 'left', label: 'Izquierda' },
                       { value: 'right', label: 'Derecha' }
                     ].map((opt) => (
                       <button
                         key={opt.value}
                         onClick={() => setConfig({ ...config, backgroundSplit: opt.value as any })}
                         className={`
                           py-1.5 px-1 text-[10px] font-bold rounded border transition-all
                           ${config.backgroundSplit === opt.value 
                             ? 'bg-brand-orange border-brand-orange text-white' 
                             : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-500'}
                         `}
                       >
                         {opt.label}
                       </button>
                     ))}
                   </div>
                 </div>
               )}
            </div>
        </div>

         {/* Card Background (Global) */}
         <div className="space-y-2">
            <label className="text-xs text-neutral-400">Card Background</label>
            <div className="flex flex-col gap-2">
               <div className="flex gap-2">
                  <label className="flex items-center gap-2 flex-1 p-2 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 cursor-pointer text-sm transition-colors">
                     <Upload size={14} />
                     <span>Upload Card BG</span>
                     <input type="file" accept="image/*" onChange={onUploadCardBackground} className="hidden" />
                  </label>
                  <div className="flex items-center gap-2 flex-[1.5] bg-neutral-800 border border-neutral-700 rounded px-2 focus-within:border-brand-orange transition-colors">
                     <Link size={14} className="text-neutral-500" />
                     <input 
                       type="text" 
                       placeholder="Paste image URL..."
                       value={config.cardBackgroundSrc?.startsWith('http') ? config.cardBackgroundSrc : ''}
                       onChange={(e) => setConfig({ ...config, cardBackgroundSrc: e.target.value })}
                       className="w-full bg-transparent py-2 text-xs text-white focus:outline-none"
                     />
                  </div>
               </div>
               {config.cardBackgroundSrc && (
                 <div className="relative w-full h-10 rounded border border-neutral-600 overflow-hidden group">
                    <img src={config.cardBackgroundSrc} className="w-full h-full object-cover" alt="Card BG Preview" />
                    <button 
                      onClick={() => setConfig({...config, cardBackgroundSrc: null})}
                      className="absolute top-1 right-1 bg-black/70 p-1 rounded-full text-white hover:bg-red-500"
                    >
                      <X size={12} />
                    </button>
                 </div>
               )}
            </div>
        </div>

        {/* Fallback Color */}
        {!config.backgroundSrc && (
            <div className="space-y-1">
                <label className="text-xs text-neutral-400">Or Solid Page Color</label>
                <div className="flex gap-2">
                <input 
                    type="color" 
                    value={config.backgroundColor}
                    onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                    className="h-9 w-9 p-0 border-none rounded cursor-pointer bg-transparent"
                />
                <input 
                    type="text" 
                    value={config.backgroundColor}
                    onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                    className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 text-sm focus:border-brand-orange focus:outline-none"
                />
                </div>
            </div>
        )}

        {/* Price Tag Color */}
        <div className="space-y-1">
            <label className="text-xs text-neutral-400">Price Tag Accent</label>
            <div className="flex gap-2">
            <input 
                type="color" 
                value={config.priceTagColor}
                onChange={(e) => setConfig({ ...config, priceTagColor: e.target.value })}
                className="h-9 w-9 p-0 border-none rounded cursor-pointer bg-transparent"
            />
            <input 
                type="text" 
                value={config.priceTagColor}
                onChange={(e) => setConfig({ ...config, priceTagColor: e.target.value })}
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 text-sm focus:border-brand-orange focus:outline-none"
            />
            </div>
        </div>

        {/* Logo */}
        <div className="space-y-2">
            <label className="text-xs text-neutral-400">Main Logo</label>
            <label className="flex items-center gap-2 w-full p-2 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 cursor-pointer text-sm">
                <Upload size={14} />
                <span>Upload Logo (Center)</span>
                <input type="file" accept="image/*" onChange={onUploadLogo} className="hidden" />
            </label>
             {config.headerLogoSrc && (
                 <div className="relative w-full p-2 bg-neutral-800 rounded border border-neutral-700 flex justify-center">
                    <img src={config.headerLogoSrc} className="h-10 object-contain" alt="Logo Preview" />
                    <button 
                      onClick={() => setConfig({...config, headerLogoSrc: null})}
                      className="absolute top-1 right-1 bg-black/70 p-1 rounded-full text-white hover:bg-red-500"
                    >
                      <X size={12} />
                    </button>
                 </div>
               )}
        </div>

        {/* Footer */}
        <div className="space-y-3 pt-2 border-t border-neutral-800">
          <label className="text-xs text-neutral-400 font-bold">Pie de Página (Footer)</label>
          <div className="flex bg-neutral-800 rounded-lg p-1 border border-neutral-700">
            <button 
              onClick={() => setConfig({...config, useFooterImage: false})}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded ${!config.useFooterImage ? 'bg-brand-orange text-white shadow' : 'text-neutral-400 hover:text-white'}`}
            >
              <Type size={12} /> Texto
            </button>
            <button 
              onClick={() => setConfig({...config, useFooterImage: true})}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded ${config.useFooterImage ? 'bg-brand-orange text-white shadow' : 'text-neutral-400 hover:text-white'}`}
            >
              <ImageIcon size={12} /> Imagen
            </button>
          </div>

          {!config.useFooterImage ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-neutral-400">Footer Text</label>
                <input 
                  type="text"
                  value={config.footerText}
                  onChange={(e) => setConfig({ ...config, footerText: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-sm focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-400">Footer Color</label>
                <div className="flex gap-2">
                   <input 
                    type="color" 
                    value={config.footerColor}
                    onChange={(e) => setConfig({ ...config, footerColor: e.target.value })}
                    className="h-9 w-9 p-0 border-none rounded cursor-pointer bg-transparent"
                   />
                   <input 
                     type="text" 
                     value={config.footerColor}
                     onChange={(e) => setConfig({ ...config, footerColor: e.target.value })}
                     className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 text-sm focus:border-brand-orange focus:outline-none"
                   />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 flex justify-between">
                  <span>Footer Image</span>
                  <span className="text-[10px] text-neutral-500">PNG transparente ideal</span>
                </label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 flex-1 p-2 bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 cursor-pointer text-sm transition-colors">
                    <Upload size={14} />
                    <span>Subir Imagen</span>
                    <input type="file" accept="image/*" onChange={onUploadFooterImage} className="hidden" />
                  </label>
                  <div className="flex items-center gap-2 flex-[1.5] bg-neutral-800 border border-neutral-700 rounded px-2 focus-within:border-brand-orange transition-colors">
                    <Link size={14} className="text-neutral-500" />
                    <input 
                      type="text" 
                      placeholder="Paste image URL or path..."
                      value={config.footerImageSrc || ''}
                      onChange={(e) => setConfig({ ...config, footerImageSrc: e.target.value })}
                      className="w-full bg-transparent py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500 leading-tight pt-1">
                  También puedes arrastrarla aquí o subirla a <code className="text-brand-orange bg-black/30 px-1 py-0.5 rounded">/images/footer/</code> en el explorador.
                </p>
              </div>

              {/* Quick select folder file if exists */}
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold uppercase block">Archivos Disponibles</label>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, footerImageSrc: '/images/footer/FOOTER.png', useFooterImage: true })}
                  className="w-full text-left text-xs bg-neutral-800 hover:bg-brand-orange/20 border border-neutral-700 hover:border-brand-orange p-2 rounded flex items-center justify-between text-neutral-300 transition-colors"
                >
                  <span className="truncate font-mono">/images/footer/FOOTER.png</span>
                  <span className="text-[10px] bg-neutral-700 px-1.5 py-0.5 rounded text-white font-sans">Usar</span>
                </button>
              </div>

              {config.footerImageSrc && (
                <div className="relative w-full p-2 bg-neutral-800 rounded border border-neutral-700 flex justify-center">
                  <img src={config.footerImageSrc} className="h-10 object-contain" alt="Footer Preview" />
                  <button 
                    onClick={() => setConfig({...config, footerImageSrc: null})}
                    className="absolute top-1 right-1 bg-black/70 p-1 rounded-full text-white hover:bg-red-500 animate-fade-in"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. Item Inspector */}
      <section className={`space-y-4 transition-opacity duration-200 ${selectedItem ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-brand-orange uppercase tracking-wider flex items-center gap-2">
            <Palette size={14} />
            Item Editor
          </h2>
          {selectedItem && (
              <button 
                onClick={onDeselect}
                className="text-[10px] bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded text-white flex items-center gap-1 transition-colors"
              >
                  Done <X size={10} />
              </button>
          )}
        </div>

        {selectedItem ? (
          <div className="p-4 bg-neutral-800/50 border border-neutral-700 rounded-xl space-y-4">
            
            {/* Fade Controls */}
            <div className="space-y-2">
              <button 
                onClick={() => setIsFadeExpanded(!isFadeExpanded)}
                className="flex items-center justify-between w-full p-2 bg-neutral-900/50 hover:bg-neutral-900 rounded-lg border border-neutral-700 transition-colors group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                  <Palette size={14} className="text-brand-orange" />
                  <span>Desvanecimiento de Bordes</span>
                </div>
                {isFadeExpanded ? <ChevronUp size={14} className="text-neutral-500" /> : <ChevronDown size={14} className="text-neutral-500" />}
              </button>
              
              {isFadeExpanded && (
                <div className="grid grid-cols-1 gap-3 p-3 bg-neutral-900/30 rounded-lg border border-neutral-800/50 animate-in slide-in-from-top-2 duration-200">
                  {[
                    { key: 'fadeTop', label: 'Arriba' },
                    { key: 'fadeBottom', label: 'Abajo' },
                    { key: 'fadeLeft', label: 'Izquierda' },
                    { key: 'fadeRight', label: 'Derecha' }
                  ].map((side) => (
                    <div key={side.key} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-neutral-400 uppercase font-bold">{side.label}</label>
                        <span className="text-[10px] text-neutral-500 font-mono">{(selectedItem as any)[side.key] || 0}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={(selectedItem as any)[side.key] || 0}
                        onChange={(e) => updateItem(selectedItem.id, { [side.key]: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-neutral-700" />

            {/* Price */}
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-medium">Price Tag</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={selectedItem.price}
                  onChange={(e) => updateItem(selectedItem.id, { price: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 pl-3 text-white font-bold tracking-wider focus:ring-1 focus:ring-brand-orange focus:outline-none"
                />
              </div>
            </div>

            {/* Position & Scale Group */}
            <div className="space-y-3 pt-2 border-t border-neutral-700/50">
                <label className="text-xs text-neutral-400 font-medium block">Image Adjustments</label>
                
                {/* Scale */}
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <label className="text-[10px] text-neutral-500 flex items-center gap-1">
                            <ZoomIn size={10} /> Scale
                        </label>
                        <span className="text-[10px] text-neutral-500">{selectedItem.scale || 100}%</span>
                    </div>
                    <input 
                      type="range"
                      min="50"
                      max="250"
                      step="5"
                      value={selectedItem.scale || 100}
                      onChange={(e) => updateItem(selectedItem.id, { scale: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    />
                </div>

                {/* Vertical Position */}
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <label className="text-[10px] text-neutral-500 flex items-center gap-1">
                            <MoveVertical size={10} /> Offset Y
                        </label>
                        <span className="text-[10px] text-neutral-500">{selectedItem.offsetY}px</span>
                    </div>
                    <input 
                      type="range"
                      min="-500"
                      max="500"
                      step="5"
                      value={selectedItem.offsetY}
                      onChange={(e) => updateItem(selectedItem.id, { offsetY: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    />
                </div>

                {/* Horizontal Position */}
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <label className="text-[10px] text-neutral-500 flex items-center gap-1">
                            <MoveHorizontal size={10} /> Offset X
                        </label>
                        <span className="text-[10px] text-neutral-500">{selectedItem.offsetX || 0}px</span>
                    </div>
                    <input 
                      type="range"
                      min="-500"
                      max="500"
                      step="5"
                      value={selectedItem.offsetX || 0}
                      onChange={(e) => updateItem(selectedItem.id, { offsetX: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-brand-orange"
                    />
                </div>

                {/* Overflow Toggle */}
                <div className="flex items-center justify-between pt-2">
                    <label className="text-[10px] text-neutral-400 uppercase font-bold flex items-center gap-2">
                        <Maximize size={12} className="text-brand-orange" />
                        Salirse del Cuadro (Overflow)
                    </label>
                    <button
                        onClick={() => updateItem(selectedItem.id, { allowOverflow: !selectedItem.allowOverflow })}
                        className={`w-10 h-5 rounded-full transition-colors relative ${selectedItem.allowOverflow ? 'bg-brand-orange' : 'bg-neutral-900'}`}
                    >
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${selectedItem.allowOverflow ? 'translate-x-5' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Size (Span) */}
            <div className="space-y-1 pt-2 border-t border-neutral-700/50">
              <label className="text-xs text-neutral-400 font-medium">Card Width</label>
              <div className="grid grid-cols-4 gap-2">
                {SPAN_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateItem(selectedItem.id, { span: opt.value as any })}
                    className={`px-1 py-2 text-[10px] font-bold rounded border transition-all truncate
                      ${selectedItem.span === opt.value 
                        ? 'bg-brand-orange border-brand-orange text-white' 
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-neutral-500'}
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ordering */}
            <div className="flex gap-2 pt-2">
               <button 
                 onClick={() => moveItem(selectedItem.id, 'backward')}
                 className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-950 border border-neutral-700 rounded flex items-center justify-center gap-2 text-xs font-bold transition-colors"
               >
                 <ArrowUp size={14} /> Back
               </button>
               <button 
                 onClick={() => moveItem(selectedItem.id, 'forward')}
                 className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-950 border border-neutral-700 rounded flex items-center justify-center gap-2 text-xs font-bold transition-colors"
               >
                 <ArrowDown size={14} /> Forward
               </button>
            </div>

            {/* Delete */}
            <button 
              onClick={() => deleteItem(selectedItem.id)}
              className="w-full mt-2 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-500 rounded flex items-center justify-center gap-2 text-xs font-bold transition-colors"
            >
              <Trash size={14} /> Remove Item
            </button>

          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-center p-4 border border-dashed border-neutral-700 rounded-xl text-neutral-500 text-sm">
            Select an item on the canvas to edit its properties.
          </div>
        )}
      </section>
    </div>
  );
};

export default EditorSidebar;
