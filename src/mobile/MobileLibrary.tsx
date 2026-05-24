import React from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Clock, 
  FileText, 
  Settings, 
  DownloadCloud, 
  Users, 
  Info, 
  MessageCircle, 
  Heart,
  Database,
  Upload
} from 'lucide-react';
import { GameState } from '../types';
import { ArkLogo } from '../components/ui/ArkLogo';

/**
 * MobileLibrary: Thư viện quản lý các thành phần giao diện dành riêng cho di động.
 * Đồng bộ hóa kiểu dáng, icon, và chú thích chuẩn hóa theo bản PC.
 */

interface MobileMenuProps {
  onNavigate: (state: GameState) => void;
  onContinue: () => void;
  onLoadGame: () => void;
  onShowCharacterLibrary: () => void;
  onShowInfo: () => void;
  onShowDonate?: () => void;
  hasSaves: boolean;
  isIntroing?: boolean;
  isInstallable?: boolean;
  onInstall?: () => void;
}

export const MobileMainMenu: React.FC<MobileMenuProps> = ({ 
  onNavigate, 
  onContinue, 
  onLoadGame, 
  onShowCharacterLibrary,
  onShowInfo,
  onShowDonate,
  hasSaves,
  isIntroing = false,
  isInstallable = false,
  onInstall
}) => {
  return (
    <div className={`flex flex-col items-center justify-center h-full px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar transition-opacity duration-1000 ${isIntroing ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Cài đặt App (Mobile) - Hiển thị phía trên */}
      {isInstallable && onInstall && !isIntroing && (
         <motion.button 
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           onClick={onInstall}
           className="w-full max-w-[360px] flex items-center justify-center gap-2 px-4 py-2.5 bg-mystic-accent/20 hover:bg-mystic-accent/30 rounded-xl text-mystic-accent shadow-lg backdrop-blur-md border border-mystic-accent/50 transition-all active:scale-95"
         >
           <DownloadCloud size={16} />
           <span className="text-[10px] font-bold uppercase tracking-wider">Cài Đặt App (PWA)</span>
         </motion.button>
      )}

      {/* Logo di động */}
      <motion.div 
        initial={isIntroing ? { opacity: 0 } : { opacity: 0, y: -20, filter: 'blur(10px)' }}
        animate={isIntroing ? { opacity: 0 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: "easeOut", delay: isIntroing ? 0 : 0.2 }}
        className="text-center flex flex-col items-center"
      >
        <div className="flex items-center justify-center gap-2 mb-1 font-serif text-4xl font-black tracking-tighter">
          {!isIntroing && (
            <motion.div layoutId="ark-main-logo" className="text-mystic-accent">
              <ArkLogo size={48} className="w-[48px] h-[48px]" />
            </motion.div>
          )}
          <h1 className="text-transparent bg-clip-text bg-gradient-to-br from-slate-100 via-white to-slate-400 drop-shadow-xl mt-1">
            ARK V6
          </h1>
        </div>
        <div className="h-[2px] w-10 mx-auto bg-gradient-to-r from-transparent via-mystic-accent to-transparent mt-2 mb-1" />
      </motion.div>

      {/* Danh sách các nút bấm dạng lưới đối xứng hoàn toàn đồng bộ theo PC layout */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-[420px]">
        
        {/* Khởi Tạo - Đồng bộ cực cao từ PC */}
        <motion.button 
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate(GameState.WORLD_CREATION)}
          className="col-span-3 flex flex-row items-center justify-center p-4 rounded-xl border border-mystic-accent/50 bg-mystic-accent/10 hover:bg-mystic-accent/20 hover:border-mystic-accent transition-all shadow-[0_0_20px_rgba(56,189,248,0.1)] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-mystic-accent/0 via-mystic-accent/5 to-mystic-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-2.5 bg-mystic-accent text-mystic-950 rounded-full group-hover:scale-105 transition-transform duration-300">
              <Play size={20} fill="currentColor" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-base tracking-widest uppercase text-mystic-accent">Khởi Tạo</h3>
              <p className="text-[9px] text-mystic-accent/70 font-medium tracking-wide uppercase mt-0.5">Bắt đầu hành trình mới</p>
            </div>
          </div>
        </motion.button>

        {/* Tiếp tục */}
        <motion.button 
          whileHover={hasSaves ? { scale: 1.02 } : {}}
          whileTap={hasSaves ? { scale: 0.98 } : {}}
          onClick={onContinue}
          disabled={!hasSaves}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center group ${
            hasSaves 
            ? 'border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500 text-slate-200' 
            : 'border-slate-800 bg-slate-900/40 opacity-40 cursor-not-allowed text-slate-500'
          }`}
        >
          <div className="mb-2 p-2 bg-slate-800 text-slate-300 rounded-full transition-transform group-hover:bg-slate-700 group-hover:text-mystic-accent">
            <Clock size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Tiếp Tục</span>
          <span className="text-[8px] text-slate-400 font-medium opacity-80 uppercase mt-0.5">Tiếp tục cuộc trò chơi</span>
        </motion.button>

        {/* Dữ liệu */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLoadGame}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500 text-slate-200 transition-all text-center group bg-slate-900/60"
        >
          <div className="mb-2 p-2 bg-slate-800 text-slate-300 rounded-full transition-transform group-hover:bg-slate-700 group-hover:text-mystic-accent">
            <Database size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Dữ Liệu</span>
          <span className="text-[8px] text-slate-400 font-medium opacity-80 uppercase mt-0.5">Quản lý File Save</span>
        </motion.button>

        {/* Đồng Nhân */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate(GameState.FANFIC)}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500 text-slate-200 transition-all text-center group"
        >
          <div className="mb-2 p-2 bg-slate-800 text-slate-300 rounded-full transition-transform group-hover:bg-slate-700 group-hover:text-amber-400">
            <FileText size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Đồng Nhân</span>
          <span className="text-[8px] text-slate-400 font-medium opacity-80 uppercase mt-0.5">Sáng tác truyện</span>
        </motion.button>

        {/* Train Data */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate(GameState.KNOWLEDGE_TRAIN)}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500 text-slate-200 transition-all text-center group"
        >
          <div className="mb-2 p-2 bg-slate-800 text-slate-300 rounded-full transition-transform group-hover:bg-slate-700 group-hover:text-emerald-400">
            <Upload size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Train Data</span>
          <span className="text-[8px] text-slate-400 font-medium opacity-80 uppercase mt-0.5">Nhập TXT & Knowledge</span>
        </motion.button>

        {/* Thư Viện ST */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShowCharacterLibrary}
          className="col-span-2 flex flex-row items-center justify-center gap-2.5 p-3 rounded-xl border border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500 text-slate-200 transition-all group"
        >
          <div className="p-2 bg-slate-800 text-slate-300 rounded-full transition-transform group-hover:text-indigo-400 group-hover:rotate-12">
            <Users size={20} />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">Thư Viện Nhân Vật</span>
            <span className="text-[8px] text-slate-400 font-medium opacity-80 uppercase">Nhân Vật SillyTavern</span>
          </div>
        </motion.button>

        {/* Cấu Hình */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate(GameState.SETTINGS)}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500 text-slate-200 transition-all text-center group"
        >
          <div className="mb-2 p-2 bg-slate-800 text-slate-300 rounded-full transition-transform group-hover:bg-slate-700 group-hover:text-amber-400 group-hover:rotate-90">
            <Settings size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Cấu Hình</span>
          <span className="text-[8px] text-slate-400 font-medium opacity-80 uppercase mt-0.5">Cấu hình hệ thống</span>
        </motion.button>

        {/* Thông Tin */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShowInfo}
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500 text-slate-200 transition-all text-center group"
        >
          <div className="mb-2 p-2 bg-slate-800 text-slate-300 rounded-full transition-transform group-hover:bg-slate-700 group-hover:text-cyan-400">
            <Info size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Thông Tin</span>
          <span className="text-[8px] text-slate-400 font-medium opacity-80 uppercase mt-0.5">Thông tin bản dựng</span>
        </motion.button>

        {/* Discord */}
        <motion.a 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="https://discord.gg/sPq3Y37eR7"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-500 text-slate-200 transition-all cursor-pointer group text-center"
        >
          <div className="mb-2 p-2 bg-slate-800 text-slate-300 rounded-full transition-transform group-hover:bg-slate-700 group-hover:text-[#5865F2]">
            <MessageCircle size={20} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Discord</span>
          <span className="text-[8px] text-slate-400 font-medium opacity-80 uppercase mt-0.5">Kênh cộng đồng</span>
        </motion.a>

        {/* Ủng Hộ (Donate) */}
        {onShowDonate && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onShowDonate}
            className="col-span-3 flex flex-row items-center justify-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-900/60 via-rose-950/20 to-slate-900/60 border border-rose-500/30 hover:border-rose-400 hover:bg-slate-800/80 backdrop-blur-md transition-all group overflow-hidden"
          >
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-full animate-pulse group-hover:scale-105">
              <Heart size={16} fill="currentColor" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">Ủng Hộ Dự Án (Donate)</span>
              <span className="text-[8px] text-slate-400 font-medium opacity-80 uppercase">Tiếp lửa cho Bạch Phát Dược Thiên Tôn</span>
            </div>
          </motion.button>
        )}
      </div>
    </div>
  );
};
