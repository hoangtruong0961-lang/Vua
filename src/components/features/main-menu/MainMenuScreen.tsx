
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Play, 
  RotateCcw, 
  Upload,
  X,
  Clock,
  FileText,
  Trash2,
  CheckCircle,
  Download,
  Database,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Settings,
  DownloadCloud,
  Users,
  Volume2,
  VolumeX,
  Info,
  MessageCircle,
  Heart
} from 'lucide-react';
import Button from '../../ui/Button';
import { useDatabaseStatus } from '../../../hooks/useDatabaseStatus';
import { useAppStore } from '../../../store/appStore';
import { NavigationProps, GameState, SaveFile, WorldData, AppSettings } from '../../../types';
import { dbService, DEFAULT_SETTINGS } from '../../../services/db/indexedDB';
import AdaptiveUI from '../../layout/AdaptiveUI';
import { MobileMainMenu } from '../../../mobile/MobileLibrary';
import { CharacterLibraryScreen } from './CharacterLibraryScreen';
import { ArkLogo } from '../../ui/ArkLogo';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50 } }
};

const MainMenuScreen: React.FC<NavigationProps> = ({ onNavigate, onGameStart }) => {
  const bgMusicEnabled = useAppStore(state => state.bgMusicEnabled);
  const setBgMusicEnabled = useAppStore(state => state.setBgMusicEnabled);
  const [isIntroing, setIsIntroing] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIntroing(false);
    }, 2500); // 2.5s loading screen
    return () => clearTimeout(timer);
  }, []);

  const { hasSaves } = useDatabaseStatus();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showCharacterLibrary, setShowCharacterLibrary] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [saveList, setSaveList] = useState<SaveFile[]>([]);
  const [activeSaveTab, setActiveSaveTab] = useState<'manual' | 'autosave'>('manual');
  
  // Toast State (Auto Dismiss)
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Background Image State
  const [bgImage, setBgImage] = useState<string | null>("https://i.ibb.co/cS6YkxK1/f0c7caebe311a0c1e0e5e7a3ca5599e7.jpg");
  const [bgBlur, setBgBlur] = useState<boolean>(localStorage.getItem('ark_v2_bg_blur') !== 'false'); // Default to true
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load Background Image and Settings from IndexedDB
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      // Load Background
      const savedBg = await dbService.getAsset('ark_v2_custom_bg');
      if (savedBg) {
        setBgImage(savedBg);
      } else {
        const legacyBg = await dbService.getAsset('ark_v1_custom_bg') || localStorage.getItem('ark_v1_custom_bg');
        if (legacyBg) {
          setBgImage(legacyBg);
          await dbService.saveAsset('ark_v2_custom_bg', legacyBg);
          // Keep old one for safety or remove it? I'll keep it for now but use v2 as primary
        }
      }

      // Load Settings
      const savedSettings = await dbService.getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    };
    loadData();
  }, []);

  // Toast Timer
  useEffect(() => {
    if (toast.show) {
        const timer = setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3000); // 3 seconds
        return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // --- Import Logic ---
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      const fileContent = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(file);
      });

      try {
        const parsedData = JSON.parse(fileContent);
        let worldData: WorldData | null = null;
        
        // CASE 1: File Save Gameplay
        if (parsedData.savedState && parsedData.world && parsedData.player) {
          worldData = parsedData as WorldData;
        }
        // CASE 2: Legacy/Alternative Structure
        else if (parsedData.history && parsedData.world && parsedData.world.player) {
          worldData = {
            ...parsedData.world,
            savedState: {
              history: parsedData.history,
              turnCount: parsedData.turnCount || 0
            }
          };
        }
        // CASE 3: Setup File
        else if (parsedData.player && parsedData.world && parsedData.config && !parsedData.savedState) {
          // Setup files don't have savedState, we can still import them as "Manual Save" with 0 turns
          worldData = {
            ...parsedData,
            savedState: { history: [], turnCount: 0 }
          } as WorldData;
        }

        if (worldData) {
          const saveId = `manual-import-${Date.now()}-${i}`;
          await dbService.saveGameState({
            id: saveId,
            name: `[Nhập] ${file.name.replace('.json', '')}`,
            updatedAt: Date.now(),
            data: worldData
          });
          successCount++;
        }
      } catch (error) {
        console.error("Import error:", error);
      }
    }

    // Refresh list
    const saves = await dbService.getAllSaves();
    saves.sort((a, b) => b.updatedAt - a.updatedAt);
    setSaveList(saves);

    if (successCount > 0) {
      setToast({ show: true, message: `Đã nhập thành công ${successCount} tệp lưu!` });
    }
    
    event.target.value = '';
  };

  const handleBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setBgImage(base64);
      await dbService.saveAsset('ark_v2_custom_bg', base64);
      setToast({ show: true, message: "Đã cập nhật ảnh nền!" });
    };
    reader.readAsDataURL(file);
  };

  const resetBg = async () => {
    setBgImage("https://i.ibb.co/cS6YkxK1/f0c7caebe311a0c1e0e5e7a3ca5599e7.jpg");
    await dbService.deleteAsset('ark_v2_custom_bg');
    await dbService.deleteAsset('ark_v1_custom_bg');
    localStorage.removeItem('ark_v1_custom_bg'); // Clean up legacy if exists
    localStorage.removeItem('ark_v2_bg_blur');
    setToast({ show: true, message: "Đã khôi phục ảnh nền mặc định." });
  };

  const toggleBlur = () => {
    const newBlur = !bgBlur;
    setBgBlur(newBlur);
    localStorage.setItem('ark_v2_bg_blur', String(newBlur));
    setToast({ show: true, message: newBlur ? "Đã bật chế độ mờ." : "Đã bật chế độ rõ nét." });
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // --- Load Game Logic ---
  const handleOpenLoadGame = async () => {
      const saves = await dbService.getAllSaves();
      // Sort by updated time desc
      saves.sort((a, b) => b.updatedAt - a.updatedAt);
      setSaveList(saves);
      setShowLoadModal(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      // Directly delete without confirmation as per user request to remove all pop-up notifications
      await dbService.deleteSave(id);
      
      // Update UI List
      const newSaves = await dbService.getAllSaves();
      newSaves.sort((a, b) => b.updatedAt - a.updatedAt);
      setSaveList(newSaves);
      
      // Show Toast instead of Popup
      setToast({ show: true, message: "Đã xóa file save thành công!" });
  };

  const handleDownloadClick = (e: React.MouseEvent, save: SaveFile) => {
      e.stopPropagation();
      try {
          // Xuất toàn bộ dữ liệu WorldData (bao gồm savedState bên trong)
          const dataToExport = save.data; 
          
          // Tạo tên file theo định dạng yêu cầu: ARK_{tên_thế_giới}_{tên_nhân_vật_chính}_{timestamp}.json
          const worldName = save.data?.world?.worldName?.replace(/\s+/g, '_') || 'unknown_world';
          const playerName = save.data?.player?.name?.replace(/\s+/g, '_') || 'unknown_player';
          const timestamp = Date.now();
          const fileName = `ARK_${worldName}_${playerName}_${timestamp}.json`;
          
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
          const downloadAnchorNode = document.createElement('a');
          downloadAnchorNode.setAttribute("href", dataStr);
          downloadAnchorNode.setAttribute("download", fileName);
          document.body.appendChild(downloadAnchorNode);
          downloadAnchorNode.click();
          downloadAnchorNode.remove();

          setToast({ show: true, message: "Đã tải xuống file save!" });
      } catch (err) {
          console.error("Download error:", err);
      }
  };

  const handleResetDatabase = async () => {
    await dbService.clearAllSaves();
    setSaveList([]);
    setToast({ show: true, message: "Đã xóa toàn bộ dữ liệu!" });
  };

  const handleLoadSave = (save: SaveFile) => {
      if (!onGameStart) return;

      // save.data is fully compliant with WorldData structure including savedState
      const worldData = save.data as WorldData;
      
      // Safety check just in case savedState is missing in older saves (unlikely given new structure but safe)
      if (!worldData.savedState) {
          return;
      }

      // Track the loaded SaveFile's ID on worldData
      worldData.activeSaveId = save.id;

      onGameStart(worldData);
  };

  const handleContinue = async () => {
      const saves = await dbService.getAllSaves();
      if (saves.length > 0) {
          saves.sort((a, b) => b.updatedAt - a.updatedAt);
          handleLoadSave(saves[0]);
      }
  };

  const renderSaveItem = (save: SaveFile) => {
      const turnCount = save.data?.savedState?.turnCount || 0;
      const playerName = save.data?.player?.name;

      return (
        <div 
          key={save.id} 
          className="group flex flex-col md:flex-row md:justify-between md:items-center bg-stone-200 dark:bg-slate-800 border border-stone-400 dark:border-slate-700 p-4 rounded-xl hover:border-mystic-accent hover:bg-stone-300 dark:hover:bg-slate-800/80 transition-all gap-4"
        >
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <h4 className="font-bold text-stone-800 dark:text-slate-200 group-hover:text-mystic-accent transition-colors text-sm md:text-base">
                        {save.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] md:text-xs text-stone-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Clock size={12}/> {new Date(save.updatedAt).toLocaleString()}</span>
                        <span className="hidden md:inline opacity-30">|</span>
                        <span className="flex items-center gap-1"><RotateCcw size={12}/> Lượt: {turnCount}</span>
                    </div>
                    {playerName && (
                        <div className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
                            Người chơi: {playerName}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex gap-2 items-center w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-stone-400/30 dark:border-slate-700/50">
                <button 
                  onClick={() => handleLoadSave(save)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-mystic-accent text-mystic-900 rounded-lg hover:bg-mystic-accent/80 transition-all text-[11px] font-black uppercase tracking-widest shadow-lg shadow-mystic-accent/20"
                >
                    <Play size={14} />
                    LOAD
                </button>
                <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleDownloadClick(e, save)}
                      className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-mystic-accent hover:bg-mystic-accent/10 rounded-xl border border-stone-400/50 dark:border-slate-700 transition-colors"
                      title="Tải xuống"
                    >
                        <Download size={18} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(e, save.id)}
                      className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-900/10 rounded-xl border border-stone-400/50 dark:border-slate-700 transition-colors"
                      title="Xóa save"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
      );
  };

  const manualSaves = saveList.filter(s => !s.id.startsWith('autosave-'));
  const autoSaves = saveList.filter(s => s.id.startsWith('autosave-'));

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden">
      {/* Background Layer */}
      {bgImage && (
        <div 
          className="absolute inset-0 z-0 transition-all duration-700"
          style={{ 
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: `brightness(0.4) ${bgBlur ? 'blur(8px)' : 'blur(0px)'}`
          }}
        />
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        multiple
        className="hidden" 
      />

      <input 
        type="file" 
        ref={bgInputRef} 
        onChange={handleBgUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Background Controls */}
      <div className="absolute top-4 left-4 z-50 flex flex-wrap gap-2 max-w-[calc(100%-2rem)]">
          <button 
             onClick={() => bgInputRef.current?.click()}
             className="flex items-center gap-2 px-4 py-2.5 bg-slate-100/90 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 shadow-lg backdrop-blur-md border border-slate-300 dark:border-slate-700 transition-all active:scale-95 group"
             title="Thay đổi ảnh nền"
          >
              <ImageIcon size={16} className="text-mystic-accent" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Ảnh nền</span>
          </button>

          {isInstallable && (
            <button 
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-mystic-accent/20 hover:bg-mystic-accent/40 rounded-xl text-mystic-accent shadow-lg backdrop-blur-md border border-mystic-accent/50 transition-all active:scale-95 group"
              title="Cài đặt Ứng dụng"
            >
                <DownloadCloud size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Cài Đặt App</span>
            </button>
          )}

          {bgImage && (
            <div className="flex gap-1.5">
              <button 
                onClick={toggleBlur}
                className={`p-2.5 rounded-xl border backdrop-blur-md transition-all shadow-lg active:scale-95 ${bgBlur ? 'bg-mystic-accent/20 text-mystic-accent border-mystic-accent/40' : 'bg-slate-900/60 text-slate-400 border-slate-700'}`}
                title={bgBlur ? "Chuyển sang rõ nét" : "Chuyển sang mờ"}
              >
                  {bgBlur ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              
              <button 
                onClick={resetBg}
                className="p-2.5 bg-red-900/30 hover:bg-red-900/50 rounded-xl text-red-400 border border-red-900/40 backdrop-blur-md shadow-lg active:scale-95 transition-all"
                title="Xóa ảnh nền"
              >
                  <RotateCcw size={16} />
              </button>

              <button 
                onClick={() => setBgMusicEnabled(!bgMusicEnabled)}
                className={`p-2.5 rounded-xl border backdrop-blur-md shadow-lg active:scale-95 transition-all ${
                  bgMusicEnabled 
                    ? 'bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-400 border-emerald-900/50 shadow-emerald-500/15' 
                    : 'bg-red-900/30 hover:bg-red-900/50 text-red-400 border-red-900/40'
                }`}
                title={bgMusicEnabled ? "Tắt nhạc nền" : "Bật nhạc nền"}
              >
                  {bgMusicEnabled ? <Volume2 size={16} className="text-emerald-400" /> : <VolumeX size={16} className="text-red-400" />}
              </button>
            </div>
          )}
      </div>

      {/* Intro Loading Screen Overlay */}
      <AnimatePresence>
        {isIntroing && (
          <motion.div 
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] backdrop-blur-md"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 1.1, opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="flex flex-col items-center justify-center gap-8"
            >
              <motion.div layoutId="ark-main-logo" className="text-mystic-accent">
                <ArkLogo size={180} />
              </motion.div>
              
              <div className="flex flex-col items-center gap-3">
                <h1 className="font-serif text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 tracking-[0.3em]">
                  LOADING...
                </h1>
                <motion.div 
                  className="h-[2px] w-48 bg-slate-800 rounded-full overflow-hidden relative shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div 
                    className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-mystic-accent/50 via-mystic-accent to-mystic-accent/50 shadow-[0_0_15px_rgba(56,189,248,0.8)]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.2, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10">
        <AdaptiveUI 
          desktop={
            <div className={`min-h-full flex flex-col items-center justify-center p-4 py-12 md:p-8 z-10 w-full transition-opacity duration-1000 ${isIntroing ? 'opacity-0' : 'opacity-100'}`}>
              <motion.div 
                initial={isIntroing ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -30, filter: 'blur(10px)' }}
                animate={isIntroing ? { opacity: 0 } : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, ease: "easeOut", delay: isIntroing ? 0 : 0.2 }}
                className="mb-10 md:mb-16 text-center px-4 flex flex-col items-center"
              >
                <div className="flex items-center justify-center gap-5 mb-4 font-serif text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter">
                  {!isIntroing && (
                    <motion.div layoutId="ark-main-logo" className="text-mystic-accent">
                      <ArkLogo size={120} className="w-[64px] h-[64px] md:w-[120px] md:h-[120px]" />
                    </motion.div>
                  )}
                  <h1 className="text-transparent bg-clip-text bg-gradient-to-br from-slate-100 via-white to-slate-400 drop-shadow-2xl mt-2">
                    ARK V6
                  </h1>
                </div>
                <div className="h-[2px] w-24 mx-auto bg-gradient-to-r from-transparent via-mystic-accent to-transparent" />
              </motion.div>

              <motion.div 
                variants={containerVariants}
                initial={isIntroing ? "hidden" : "visible"}
                animate={isIntroing ? "hidden" : "visible"}
                className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-3xl px-2"
              >
                {/* Khởi Tạo - Nổi bật hơn */}
                <motion.button 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate(GameState.WORLD_CREATION)}
                  className="col-span-2 md:col-span-3 flex flex-row items-center justify-center p-6 md:p-8 rounded-2xl border border-mystic-accent/50 bg-mystic-accent/10 hover:bg-mystic-accent/20 hover:border-mystic-accent hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] backdrop-blur-md transition-all group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-mystic-accent/0 via-mystic-accent/10 to-mystic-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="p-4 bg-mystic-accent text-mystic-950 rounded-full group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                      <Play size={32} fill="currentColor" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-black text-2xl md:text-3xl tracking-widest uppercase text-mystic-accent drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                        Khởi Tạo
                      </h3>
                      <p className="text-xs md:text-sm text-mystic-accent/70 font-medium tracking-widest uppercase mt-1">Bắt đầu hành trình mới</p>
                    </div>
                  </div>
                </motion.button>

                {/* Tiếp Tục */}
                <motion.button 
                  variants={itemVariants}
                  whileHover={hasSaves ? { scale: 1.02, y: -2 } : {}}
                  whileTap={hasSaves ? { scale: 0.98 } : {}}
                  onClick={handleContinue}
                  disabled={!hasSaves}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border backdrop-blur-md transition-all group relative ${
                    hasSaves 
                    ? 'border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500' 
                    : 'opacity-40 cursor-not-allowed border-slate-800 bg-slate-900/40'
                  }`}
                >
                  <div className={`mb-3 p-3 text-slate-300 rounded-full transition-transform duration-500 ${hasSaves ? 'bg-slate-800 group-hover:bg-slate-700 group-hover:text-mystic-accent group-hover:-translate-y-1' : 'bg-slate-800/50'}`}>
                    <Clock size={28} />
                  </div>
                  <h3 className="font-bold text-base tracking-widest uppercase mb-1 text-slate-200">Tiếp Tục</h3>
                  <p className="text-[10px] text-slate-400 font-medium opacity-80 uppercase tracking-widest">Tiếp tục cuộc trò chơi</p>
                </motion.button>

                {/* Dữ Liệu */}
                <motion.button 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOpenLoadGame}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500 backdrop-blur-md transition-all group relative"
                >
                  <div className="mb-3 p-3 bg-slate-800 text-slate-300 rounded-full transition-transform duration-500 group-hover:bg-slate-700 group-hover:text-mystic-accent group-hover:-translate-y-1">
                    <Database size={28} />
                  </div>
                  <h3 className="font-bold text-base tracking-widest uppercase mb-1 text-slate-200">Dữ Liệu</h3>
                  <p className="text-[10px] text-slate-400 font-medium opacity-80 uppercase tracking-widest">Quản lý File Save</p>
                </motion.button>

                {/* Đồng Nhân */}
                <motion.button 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate(GameState.FANFIC)}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500 backdrop-blur-md transition-all group relative"
                >
                  <div className="mb-3 p-3 bg-slate-800 text-slate-300 rounded-full transition-transform duration-500 group-hover:bg-slate-700 group-hover:text-amber-400 group-hover:-translate-y-1">
                    <FileText size={28} />
                  </div>
                  <h3 className="font-bold text-base tracking-widest uppercase mb-1 text-slate-200">Đồng Nhân</h3>
                  <p className="text-[10px] text-slate-400 font-medium opacity-80 uppercase tracking-widest">Sáng tác truyện</p>
                </motion.button>

                {/* Train Knowledge */}
                <motion.button 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate(GameState.KNOWLEDGE_TRAIN)}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500 backdrop-blur-md transition-all group relative"
                >
                  <div className="mb-3 p-3 bg-slate-800 text-slate-300 rounded-full transition-transform duration-500 group-hover:bg-slate-700 group-hover:text-emerald-400 group-hover:-translate-y-1">
                    <Upload size={28} />
                  </div>
                  <h3 className="font-bold text-base tracking-widest uppercase mb-1 text-slate-200">Train Data</h3>
                  <p className="text-[10px] text-slate-400 font-medium opacity-80 uppercase tracking-widest">Nhập TXT & Knowledge</p>
                </motion.button>

                {/* Thư Viện Nhân Vật (SillyTavern) */}
                <motion.button 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCharacterLibrary(true)}
                  className="col-span-1 md:col-span-2 flex flex-row items-center justify-center gap-4 p-5 rounded-2xl border border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500 backdrop-blur-md transition-all group relative"
                >
                  <div className="p-3 bg-slate-800 text-slate-300 rounded-full transition-transform duration-500 group-hover:bg-slate-700 group-hover:text-indigo-400 group-hover:rotate-12">
                    <Users size={28} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-base tracking-widest uppercase text-slate-200">Thư Viện Nhân Vật</h3>
                    <p className="text-[10px] text-slate-400 font-medium opacity-80 uppercase tracking-widest">Nhân Vật SillyTavern</p>
                  </div>
                </motion.button>

                {/* Cấu Hình (Đồng bộ kiểu dáng với các nút khác nhờ span-1) */}
                <motion.button 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate(GameState.SETTINGS)}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500 backdrop-blur-md transition-all group relative"
                >
                  <div className="mb-3 p-3 bg-slate-800 text-slate-300 rounded-full transition-transform duration-500 group-hover:bg-slate-700 group-hover:text-amber-400 group-hover:rotate-90">
                    <Settings size={28} />
                  </div>
                  <h3 className="font-bold text-base tracking-widest uppercase mb-1 text-slate-200">Cấu Hình</h3>
                  <p className="text-[10px] text-slate-400 font-medium opacity-80 uppercase tracking-widest">Cấu hình hệ thống</p>
                </motion.button>

                {/* Thông Tin */}
                <motion.button 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowInfoModal(true)}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500 backdrop-blur-md transition-all group relative"
                >
                  <div className="mb-3 p-3 bg-slate-800 text-slate-300 rounded-full transition-transform duration-500 group-hover:bg-slate-700 group-hover:text-cyan-400 group-hover:scale-110">
                    <Info size={28} />
                  </div>
                  <h3 className="font-bold text-base tracking-widest uppercase mb-1 text-slate-200">Thông Tin</h3>
                  <p className="text-[10px] text-slate-400 font-medium opacity-80 uppercase tracking-widest">Thông tin bản dựng</p>
                </motion.button>

                {/* Discord */}
                <motion.a 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  href="https://discord.gg/sPq3Y37eR7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500 backdrop-blur-md transition-all group relative cursor-pointer"
                >
                  <div className="mb-3 p-3 bg-slate-800 text-slate-300 rounded-full transition-transform duration-500 group-hover:bg-slate-700 group-hover:text-[#5865F2] group-hover:scale-110">
                    <MessageCircle size={28} />
                  </div>
                  <h3 className="font-bold text-base tracking-widest uppercase mb-1 text-slate-200">Discord</h3>
                  <p className="text-[10px] text-slate-400 font-medium opacity-80 uppercase tracking-widest">Kênh cộng đồng</p>
                </motion.a>

                {/* Ủng Hộ (Donate) */}
                <motion.button 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDonateModal(true)}
                  className="col-span-2 md:col-span-3 flex flex-row items-center justify-center p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-slate-900/60 via-rose-955/20 to-slate-900/60 hover:bg-slate-800/80 hover:border-rose-450 backdrop-blur-md transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full group-hover:scale-110 transition-transform duration-500 animate-pulse">
                      <Heart size={24} fill="currentColor" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-base tracking-widest uppercase text-slate-200">Ủng Hộ Dự Án (Donate)</h3>
                      <p className="text-[10px] text-slate-400 font-medium opacity-80 uppercase tracking-widest">Tiếp lửa cho Bạch Phát Dược Thiên Tôn</p>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            </div>
          }
          mobile={
            <div className="flex flex-col h-full">
              <MobileMainMenu 
                onNavigate={onNavigate}
                onContinue={handleContinue}
                onLoadGame={handleOpenLoadGame}
                onShowCharacterLibrary={() => setShowCharacterLibrary(true)}
                onShowInfo={() => setShowInfoModal(true)}
                onShowDonate={() => setShowDonateModal(true)}
                hasSaves={hasSaves}
                isIntroing={isIntroing}
                isInstallable={isInstallable}
                onInstall={handleInstallClick}
              />
            </div>
          }
        />
      </div>

      {/* LOAD GAME MODAL */}
      <AnimatePresence>
          {showLoadModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-3 md:p-8">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-stone-200/90 dark:bg-mystic-950/90 border border-slate-200 dark:border-slate-800 w-[95vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
                  >
                      {/* Header */}
                      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-stone-300/60 dark:bg-mystic-900/40">
                          <div className="flex items-center gap-4">
                              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 uppercase tracking-widest">
                                  <Database size={20} className="text-mystic-accent" /> Dữ Liệu
                              </h2>
                              <div className="hidden md:flex gap-2">
                                <button 
                                  onClick={handleImportClick}
                                  className="flex items-center gap-2 px-4 py-2 bg-mystic-accent/10 hover:bg-mystic-accent/20 text-mystic-accent rounded-lg border border-mystic-accent/30 transition-all text-xs font-bold uppercase tracking-wider"
                                >
                                    <Upload size={14} />
                                    Nhập File
                                </button>
                                <button 
                                  onClick={handleResetDatabase}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-900/10 hover:bg-red-900/20 text-red-500 rounded-lg border border-red-900/30 transition-all text-xs font-bold uppercase tracking-wider"
                                >
                                    <RotateCcw size={14} />
                                    RESET
                                </button>
                              </div>
                          </div>
                          <button onClick={() => setShowLoadModal(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1">
                              <X size={24} />
                          </button>
                      </div>

                      {/* Mobile Actions */}
                      <div className="md:hidden p-2 bg-stone-300 dark:bg-mystic-900/30 border-b border-slate-200 dark:border-slate-800 flex gap-2">
                          <button 
                            onClick={handleImportClick}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-mystic-accent/10 text-mystic-accent rounded-lg border border-mystic-accent/30 text-[10px] font-black uppercase tracking-widest"
                          >
                              <Upload size={14} />
                              Nhập File
                          </button>
                          <button 
                            onClick={handleResetDatabase}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-900/10 text-red-500 rounded-lg border border-red-900/30 text-[10px] font-black uppercase tracking-widest"
                          >
                              <RotateCcw size={14} />
                              RESET
                          </button>
                      </div>

                      {/* Tab Navigation */}
                      <div className="flex bg-stone-300/40 dark:bg-slate-900/40 p-1 gap-1 border-b border-slate-200 dark:border-slate-800">
                          <button
                              onClick={() => setActiveSaveTab('manual')}
                              className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${
                                  activeSaveTab === 'manual' 
                                  ? 'bg-mystic-accent text-mystic-900 shadow-lg' 
                                  : 'text-stone-500 hover:bg-stone-400/20 dark:hover:bg-slate-800'
                              }`}
                          >
                              <FileText size={14} />
                              Lưu Thủ Công
                              <span className="ml-2 bg-black/10 px-1.5 py-0.5 rounded-full text-[8px]">{manualSaves.length}</span>
                          </button>
                          <button
                              onClick={() => setActiveSaveTab('autosave')}
                              className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${
                                  activeSaveTab === 'autosave' 
                                  ? 'bg-mystic-accent text-mystic-900 shadow-lg' 
                                  : 'text-stone-500 hover:bg-stone-400/20 dark:hover:bg-slate-800'
                              }`}
                          >
                              <Clock size={14} />
                              Lưu Tự Động
                              <span className="ml-2 bg-black/10 px-1.5 py-0.5 rounded-full text-[8px]">{autoSaves.length}</span>
                          </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 overflow-hidden bg-stone-300/40 dark:bg-mystic-950/40">
                          <div className="h-full overflow-y-auto p-4 space-y-3 custom-scrollbar">
                              {(activeSaveTab === 'manual' ? manualSaves : autoSaves).length === 0 ? (
                                  <div className="text-center text-slate-400 dark:text-slate-500 py-20 text-sm italic">
                                      Chưa có tệp lưu {activeSaveTab === 'manual' ? 'thủ công' : 'tự động'}.
                                  </div>
                              ) : (
                                  (activeSaveTab === 'manual' ? manualSaves : autoSaves).map((save) => renderSaveItem(save))
                              )}
                          </div>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      <AnimatePresence>
        
        {showCharacterLibrary && (
            <CharacterLibraryScreen 
                onClose={() => setShowCharacterLibrary(false)}
                onGameStart={onGameStart}
            />
        )}
      </AnimatePresence>

      {/* Success Toast Notification */}
      <AnimatePresence>
        {toast.show && (
            <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="fixed bottom-16 right-4 md:bottom-10 md:right-10 z-[100] bg-white dark:bg-mystic-800 border border-green-200 dark:border-green-500/50 text-green-600 dark:text-green-400 px-6 py-3 rounded-lg shadow-lg dark:shadow-[0_0_20px_rgba(34,197,94,0.2)] flex items-center gap-3 backdrop-blur-md"
            >
                <CheckCircle size={20} />
                <span className="font-bold text-sm">{toast.message}</span>
            </motion.div>
        )}
      </AnimatePresence>

      {/* INFO MODAL */}
      <AnimatePresence>
          {showInfoModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="bg-stone-200/90 dark:bg-mystic-950/90 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
                  >
                      {/* Header */}
                      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-stone-300/60 dark:bg-mystic-900/40">
                          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 uppercase tracking-widest">
                              <Info size={18} className="text-mystic-accent" /> Thông tin
                          </h2>
                          <button onClick={() => setShowInfoModal(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 transition-colors">
                              <X size={20} />
                          </button>
                      </div>

                      {/* Content */}
                      <div className="p-6 md:p-8 space-y-6 text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                          <div className="text-center pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
                              <h3 className="font-serif text-3xl font-black tracking-wider text-slate-900 dark:text-white drop-shadow-xl">
                                  ARK Rebuild
                              </h3>
                              <p className="text-xs text-mystic-accent uppercase tracking-widest font-bold mt-1">
                                  Phiên bản: v6.0
                              </p>
                          </div>

                          <div className="space-y-4">
                              <div className="flex justify-between items-start gap-4">
                                  <div>
                                      <h4 className="text-xs uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                                          Phát triển & Làm mới toàn diện bởi
                                      </h4>
                                      <p className="font-semibold text-slate-850 dark:text-slate-100 text-sm tracking-wide">
                                          Bạch Phát Dược Thiên Tôn
                                      </p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setShowInfoModal(false);
                                      setShowDonateModal(true);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg border border-rose-500/20 text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm"
                                  >
                                      <Heart size={10} fill="currentColor" className="animate-pulse" />
                                      Ủng Hộ
                                  </button>
                              </div>

                              <div>
                                  <h4 className="text-xs uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                                      Credits
                                  </h4>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                      Ứng dụng này là một bản rebuild. Dự án ARK Rebuild gốc vốn được kế thừa và phát triển từ ARK V2 (bởi tác giả Thích Ma Đạo).
                                  </p>
                              </div>
                          </div>
                      </div>

                      {/* Footer */}
                      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-stone-300/30 dark:bg-mystic-900/20 flex justify-end">
                          <button 
                            onClick={() => setShowInfoModal(false)}
                            className="px-5 py-2 bg-mystic-accent text-mystic-950 hover:bg-mystic-accent/90 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                          >
                            Đóng
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      {/* DONATE MODAL */}
      <AnimatePresence>
          {showDonateModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="bg-stone-200/95 dark:bg-mystic-950/95 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
                  >
                      {/* Header */}
                      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-stone-300/60 dark:bg-mystic-900/40">
                          <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 uppercase tracking-widest">
                              <Heart size={18} fill="currentColor" className="text-rose-500 animate-pulse" /> Ủng hộ dự án
                          </h2>
                          <button onClick={() => setShowDonateModal(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 transition-colors">
                              <X size={20} />
                          </button>
                      </div>

                      {/* Content */}
                      <div className="p-6 md:p-8 space-y-6 text-slate-700 dark:text-slate-300 font-sans leading-relaxed overflow-y-auto max-h-[70vh] custom-scrollbar">
                          <div className="text-center">
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-4">
                                  Để đồng hành và tiếp thêm động lực cho <strong className="text-slate-900 dark:text-white font-bold">Bạch Phát Dược Thiên Tôn</strong> nâng cấp dự án <strong className="text-mystic-accent font-bold">ARK V6</strong> ngày càng vượt trội!
                              </p>
                              
                              {/* QR Image Display */}
                              <div className="flex justify-center py-2">
                                  <div className="p-3 bg-white hover:scale-[1.02] active:scale-95 transition-all outline outline-offset-4 outline-1 outline-rose-500/25 rounded-2xl inline-block shadow-lg">
                                      <img 
                                          src="/zlp-1779461952269.jpg" 
                                          alt="Quét mã ZaloPay để Donate" 
                                          className="w-56 h-auto rounded-xl object-contain mx-auto block"
                                          referrerPolicy="no-referrer"
                                      />
                                  </div>
                              </div>
                              
                              <p className="text-[10px] text-rose-500 uppercase tracking-widest font-black mt-4 animate-pulse">
                                  Quét Mã ZaloPay Để Ủng Hộ
                              </p>
                          </div>

                          <div className="text-xs bg-slate-100 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 space-y-2">
                              <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Ứng dụng:</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">ZaloPay</span>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Tác giả:</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">Bạch Phát Dược Thiên Tôn</span>
                              </div>
                              <div className="text-slate-400 text-[10px] py-2 leading-normal border-t border-slate-200/50 dark:border-slate-800/50 mt-1">
                                  * Lưu ý: Mọi sự ủng hộ (donate) đều hoàn toàn tự nguyện nhằm duy trì chi phí phát triển và cập nhật ứng dụng. Xin chân thành cảm ơn!
                              </div>
                          </div>
                      </div>

                      {/* Footer */}
                      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-stone-300/30 dark:bg-mystic-900/20 flex justify-end">
                          <button 
                            onClick={() => setShowDonateModal(false)}
                            className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-[0_4px_12px_rgba(239,68,68,0.2)]"
                          >
                            Đóng
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default MainMenuScreen;
