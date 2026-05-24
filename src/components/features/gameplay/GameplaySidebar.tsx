import React, { useState, useEffect } from 'react';
import { User, Globe, History, ImageIcon, Terminal, Zap, ToggleRight, ToggleLeft, Database, Settings, Save, LogOut, Maximize2, Minimize2, ChevronLeft, ChevronRight, ChevronsUp, ChevronsDown, RefreshCw, Bug, Edit2, ChevronUp, ChevronDown, Sparkles, Heart, Compass, Shield, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorldData, AppSettings, ChatMessage } from '../../../types';
import Button from '../../ui/Button';
import TawaPresetManager from './components/TawaPresetManager';
import WorldInfoSidebar from './components/WorldInfoSidebar';
import StoryBibleSidebar from './components/StoryBibleSidebar';
import { dbService } from '../../../services/db/indexedDB';

interface GameplaySidebarProps {
    activeWorld: WorldData;
    history: ChatMessage[];
    MESSAGES_PER_PAGE: number;
    setShowCharModal: (v: boolean) => void;
    setShowGlobalModal: (v: boolean) => void;
    setShowHistoryModal: (v: boolean) => void;
    setShowImageLibrary: (v: boolean) => void;
    setShowLogConsole: (v: boolean) => void;
    setShowContextModal: (v: boolean) => void;
    setShowRegexModal: (v: boolean) => void;
    setShowStoryDebugModal: (v: boolean) => void;
    isInputCollapsed: boolean;
    setIsInputCollapsed: (v: boolean) => void;
    currentPage: number;
    setCurrentPage: (v: number) => void;
    scrollToTop: () => void;
    scrollToBottom: () => void;
    settings: AppSettings | null;
    toggleStreamResponse: () => void;
    onUpdateWorld?: (updates: Partial<WorldData>) => void;
    handleTawaConfigChange: (config: any) => void;
    isLoading: boolean;
    handleRegenerate: (idx: number) => void;
    handleGoToSettings: () => void;
    handleManualSave: () => void;
    isSaving: boolean;
    handleExit: () => void;
    AIMonitor: React.FC;
}

export const GameplaySidebar: React.FC<GameplaySidebarProps> = ({
    activeWorld, history, MESSAGES_PER_PAGE, setShowCharModal, setShowGlobalModal, setShowHistoryModal, setShowImageLibrary, setShowLogConsole, setShowContextModal, setShowRegexModal, setShowStoryDebugModal,
    isInputCollapsed, setIsInputCollapsed, currentPage, setCurrentPage, scrollToTop, scrollToBottom, settings, toggleStreamResponse, onUpdateWorld, handleTawaConfigChange,
    isLoading, handleRegenerate, handleGoToSettings, handleManualSave, isSaving, handleExit, AIMonitor
}) => {
    const totalPages = history.length <= 11 ? 1 : 1 + Math.ceil((history.length - 11) / MESSAGES_PER_PAGE);
    
    // Character Profile interactive states
    const [isCardExpanded, setIsCardExpanded] = useState(false);
    const [sidebarCardTab, setSidebarCardTab] = useState<'status' | 'traits' | 'story'>('status');
    const [isQuickEditing, setIsQuickEditing] = useState(false);
    const [editName, setEditName] = useState(activeWorld.player.name);
    const [editAge, setEditAge] = useState(activeWorld.player.age);
    const [editGender, setEditGender] = useState(activeWorld.player.gender);
    const [editMood, setEditMood] = useState(activeWorld.player.currentMood || '');
    const [editGoal, setEditGoal] = useState(activeWorld.player.goal || '');

    useEffect(() => {
        setEditName(activeWorld.player.name);
        setEditAge(activeWorld.player.age);
        setEditGender(activeWorld.player.gender);
        setEditMood(activeWorld.player.currentMood || '');
        setEditGoal(activeWorld.player.goal || '');
    }, [activeWorld.player]);

    
    return (
        <div className="h-full flex flex-col bg-stone-300 dark:bg-mystic-900 shadow-xl">
            <div className="p-2.5 border-b border-stone-400 dark:border-slate-800 bg-stone-400/30 dark:bg-mystic-800/40 shrink-0 space-y-2">
                {/* Interactive Premium Character Card */}
                <div className="bg-stone-200 dark:bg-slate-900/90 border border-stone-400/70 dark:border-slate-800 rounded-2xl p-3.5 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden backdrop-blur-md group-card-hud">
                    {/* Glowing effect inside card */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-mystic-accent/15 to-transparent rounded-full blur-2xl pointer-events-none" />
                    
                    {!isQuickEditing ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                {/* Avatar Frame with glowing gradient */}
                                <div className="relative group shrink-0">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-mystic-accent to-indigo-500 rounded-full blur opacity-30 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
                                    <button 
                                        onClick={() => setShowCharModal(true)}
                                        className="relative w-14 h-14 rounded-full bg-stone-300 dark:bg-slate-950 border-2 border-white dark:border-slate-800 overflow-hidden flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-md"
                                        title="Xem hồ sơ chi tiết"
                                    >
                                        {activeWorld.player.avatar ? (
                                            <img src={activeWorld.player.avatar} alt={activeWorld.player.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                            <User className="text-mystic-accent" size={24}/>
                                        )}
                                    </button>
                                    <div className="absolute -bottom-0.5 -right-0.5 bg-mystic-accent text-[8px] font-bold border-2 border-stone-100 dark:border-slate-900 px-1 py-0.5 rounded-full flex items-center justify-center text-white scale-90 shadow-md">
                                        PC
                                    </div>
                                </div>

                                {/* Name & Quick Stats */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                        <h4 
                                            className="font-bold text-stone-900 dark:text-slate-100 text-sm leading-tight truncate hover:text-mystic-accent transition-colors cursor-pointer flex items-center gap-1" 
                                            onClick={() => setShowCharModal(true)}
                                        >
                                            {activeWorld.player.name}
                                            <Sparkles size={11} className="text-mystic-accent shrink-0 animate-pulse" />
                                        </h4>
                                        <button 
                                            onClick={() => setIsQuickEditing(true)} 
                                            className="p-1 rounded-md text-stone-500 hover:text-mystic-accent hover:bg-stone-300/70 dark:hover:bg-slate-800/80 transition-colors"
                                            title="Sửa nhanh thông tin"
                                        >
                                            <Edit2 size={11} />
                                        </button>
                                    </div>
                                    
                                    {/* Badges */}
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        <span className="text-[8px] font-bold uppercase py-0.5 px-2 bg-mystic-accent/10 text-mystic-accent border border-mystic-accent/20 rounded-md">
                                            {activeWorld.player.gender || "Chưa rõ"}
                                        </span>
                                        <span className="text-[8px] font-mono py-0.5 px-2 bg-stone-300/80 dark:bg-slate-800/80 text-stone-600 dark:text-slate-300 border border-stone-400/20 dark:border-slate-700/50 rounded-md">
                                            {activeWorld.player.age ? `${activeWorld.player.age} tuổi` : "- tuổi"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Tabbed Hub within Card */}
                            <div className="mt-2 text-slate-400 border-b border-stone-300 dark:border-slate-800 flex gap-0.5 p-0.5 bg-stone-300/30 dark:bg-slate-950/40 rounded-lg">
                                {[
                                    { id: 'status', label: 'Chỉ số', icon: Heart },
                                    { id: 'traits', label: 'Tính chất', icon: Brain },
                                    { id: 'story', label: 'Cốt chuyện', icon: Compass }
                                ].map((tb) => {
                                    const Icon = tb.icon;
                                    const isActive = sidebarCardTab === tb.id;
                                    return (
                                        <button
                                            key={tb.id}
                                            onClick={() => {
                                                setSidebarCardTab(tb.id as any);
                                                setIsCardExpanded(true); // Automatically expand when exploring tabs
                                            }}
                                            className={`flex-1 flex items-center justify-center gap-1 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all ${
                                                isActive 
                                                    ? 'bg-white dark:bg-slate-800 text-mystic-accent shadow-sm border border-stone-400/20 dark:border-slate-700/50' 
                                                    : 'text-stone-500 dark:text-slate-500 hover:text-stone-800 dark:hover:text-slate-300 hover:bg-white/10'
                                            }`}
                                        >
                                            <Icon size={9} />
                                            <span>{tb.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Brief View / Content Switch */}
                            <div className="space-y-2">
                                {sidebarCardTab === 'status' && (
                                    <div className="space-y-2.5 pt-1">
                                        {/* Mental health / Mood Bar */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-stone-500 dark:text-slate-400 font-extrabold flex items-center gap-1">
                                                    <Heart size={10} className="text-red-500 animate-pulse" /> Trạng thái tâm lý
                                                </span>
                                                <span className="text-stone-800 dark:text-slate-200 font-mono italic font-bold">
                                                    {activeWorld.player.currentMood || "Bình thường"}
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-stone-300 dark:bg-slate-950 rounded-full overflow-hidden border border-stone-400/10 dark:border-slate-800">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-emerald-500 via-mystic-accent to-pink-500 transition-all duration-500"
                                                    style={{ 
                                                        width: activeWorld.player.currentMood ? '75%' : '90%' 
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Sức mạnh ý chí (生存意志) */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-stone-500 dark:text-slate-400 font-extrabold flex items-center gap-1">
                                                    <Shield size={10} className="text-sky-400" /> Ý chí sinh tồn
                                                </span>
                                                <span className="text-stone-800 dark:text-slate-200 font-mono font-bold">
                                                    95%
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-stone-300 dark:bg-slate-950 rounded-full overflow-hidden border border-stone-400/10 dark:border-slate-800">
                                                <div className="h-full bg-sky-500 transition-all duration-300 w-[95%]" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {sidebarCardTab === 'traits' && (
                                    <div className="space-y-2 text-[10.5px]">
                                        <div className="bg-stone-300/30 dark:bg-slate-950/40 p-2 rounded-xl border border-stone-400/15 dark:border-slate-800/50">
                                            <span className="text-[9px] font-bold text-mystic-accent uppercase block mb-1">Ngoại hình đặc trưng</span>
                                            <p className="text-stone-700 dark:text-slate-300 leading-normal truncate font-sans">
                                                {activeWorld.player.appearance || "Chưa thiết lập ngoại hình cụ thể."}
                                            </p>
                                        </div>
                                        <div className="bg-stone-300/30 dark:bg-slate-950/40 p-2 rounded-xl border border-stone-400/15 dark:border-slate-800/50">
                                            <span className="text-[9px] font-bold text-pink-400 uppercase block mb-1">Cá tính đặc trưng</span>
                                            <p className="text-stone-700 dark:text-slate-300 leading-normal truncate font-sans">
                                                {activeWorld.player.personality || "Chưa thiết lập cá tính cụ thể."}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {sidebarCardTab === 'story' && (
                                    <div className="space-y-2 text-[10.5px] pt-1">
                                        <div className="flex items-start gap-1 p-1">
                                            <span className="font-extrabold text-stone-500 dark:text-slate-400 shrink-0 w-14">Mục tiêu:</span>
                                            <span className="text-stone-700 dark:text-slate-200 truncate flex-1 font-medium italic" title={activeWorld.player.goal}>
                                                {activeWorld.player.goal || "Chưa xác định"}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-1 p-1">
                                            <span className="font-extrabold text-stone-500 dark:text-slate-400 shrink-0 w-14">Vai trò:</span>
                                            <span className="text-stone-700 dark:text-slate-200 truncate flex-1 font-mono uppercase tracking-wider text-[9.5px] text-indigo-400">
                                                {activeWorld.player.narrativeRole || "Protagonist (Nhân vật Chính)"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Details Expand Window */}
                            <AnimatePresence>
                                {isCardExpanded && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden space-y-2 pt-2 border-t border-stone-400/40 dark:border-slate-800/60 max-h-48 overflow-y-auto custom-scrollbar"
                                    >
                                        {sidebarCardTab === 'status' && (
                                            <div className="space-y-2">
                                                {activeWorld.player.skills && (
                                                    <div className="space-y-0.5">
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Kỹ năng đặc biệt</span>
                                                        <p className="text-[10px] text-stone-600 dark:text-slate-400 bg-stone-300/40 dark:bg-slate-950/40 p-2 rounded-xl border border-stone-400/10 dark:border-slate-800/60 leading-normal whitespace-pre-wrap font-sans">
                                                            {activeWorld.player.skills}
                                                        </p>
                                                    </div>
                                                )}
                                                {activeWorld.player.voiceAndTone && (
                                                    <div className="space-y-0.5">
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-teal-400">Giọng điệu / Văn phong</span>
                                                        <p className="text-[10px] text-stone-600 dark:text-slate-400 bg-stone-300/40 dark:bg-slate-950/40 p-2 rounded-xl border border-stone-400/10 dark:border-slate-800/60 leading-normal whitespace-pre-wrap font-sans">
                                                            {activeWorld.player.voiceAndTone}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {sidebarCardTab === 'traits' && (
                                            <div className="space-y-2">
                                                <div className="space-y-0.5">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-mystic-accent">Chi tiết ngoại hình</span>
                                                    <p className="text-[10px] text-stone-600 dark:text-slate-400 bg-stone-300/40 dark:bg-slate-950/40 p-2 rounded-xl border border-stone-400/10 dark:border-slate-800/60 leading-normal whitespace-pre-wrap font-sans">
                                                        {activeWorld.player.appearance || "Trống."}
                                                    </p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-pink-400">Chi tiết tính cách</span>
                                                    <p className="text-[10px] text-stone-600 dark:text-slate-400 bg-stone-300/40 dark:bg-slate-950/40 p-2 rounded-xl border border-stone-400/10 dark:border-slate-800/60 leading-normal whitespace-pre-wrap font-sans">
                                                        {activeWorld.player.personality || "Trống."}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {sidebarCardTab === 'story' && (
                                            <div className="space-y-2">
                                                <div className="space-y-0.5">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">Mục tiêu cốt lõi</span>
                                                    <p className="text-[10px] text-stone-600 dark:text-slate-400 bg-stone-300/40 dark:bg-slate-950/40 p-2 rounded-xl border border-stone-400/10 dark:border-slate-800/60 leading-normal whitespace-pre-wrap font-sans">
                                                        {activeWorld.player.goal || "Chưa xác định mục tiêu."}
                                                    </p>
                                                </div>
                                                {activeWorld.player.background && (
                                                    <div className="space-y-0.5">
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">Lý lịch / Background</span>
                                                        <p className="text-[10px] text-stone-600 dark:text-slate-400 bg-stone-300/40 dark:bg-slate-950/40 p-2 rounded-xl border border-stone-400/10 dark:border-slate-800/60 leading-normal whitespace-pre-wrap font-sans">
                                                            {activeWorld.player.background}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Details Toggle Button */}
                            <div className="pt-1 flex justify-center">
                                <button 
                                    onClick={() => setIsCardExpanded(!isCardExpanded)}
                                    className="w-full flex items-center justify-center gap-1 py-1 text-[9px] font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider bg-stone-300/40 dark:bg-slate-950/50 hover:bg-stone-300/80 dark:hover:bg-slate-800/80 rounded-lg border border-stone-400/30 dark:border-slate-800/50 transition-all font-mono shadow-sm"
                                >
                                    {isCardExpanded ? (
                                        <>Thu gọn <ChevronUp size={10} /></>
                                    ) : (
                                        <>Mở rộng Chi tiết <ChevronDown size={10} /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Sửa Nhanh Panel */
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-stone-400/40 dark:border-slate-800/60 pb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-mystic-accent flex items-center gap-1 font-mono">
                                    <Edit2 size={10} /> Sửa nhanh nhân vật
                                </span>
                                <button 
                                    onClick={() => setIsQuickEditing(false)}
                                    className="text-[10px] font-bold text-stone-500 hover:text-stone-800 dark:hover:text-slate-200"
                                >
                                    Đóng
                                </button>
                            </div>

                            <div className="space-y-2.5">
                                <div>
                                    <label className="text-[8.5px] uppercase tracking-wider text-stone-500 dark:text-slate-500 block mb-1">Họ và Tên</label>
                                    <input 
                                        type="text" 
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full text-xs p-2 bg-stone-300/50 dark:bg-slate-950 border border-stone-405 dark:border-slate-800 rounded-xl text-stone-800 dark:text-slate-200 focus:outline-none focus:border-mystic-accent font-sans"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[8.5px] uppercase tracking-wider text-stone-500 dark:text-slate-500 block mb-1">Giới tính</label>
                                        <input 
                                            type="text" 
                                            value={editGender}
                                            onChange={(e) => setEditGender(e.target.value)}
                                            className="w-full text-xs p-2 bg-stone-300/50 dark:bg-slate-950 border border-stone-405 dark:border-slate-800 rounded-xl text-stone-800 dark:text-slate-200 focus:outline-none focus:border-mystic-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8.5px] uppercase tracking-wider text-stone-500 dark:text-slate-500 block mb-1">Tuổi</label>
                                        <input 
                                            type="text" 
                                            value={editAge}
                                            onChange={(e) => setEditAge(e.target.value)}
                                            className="w-full text-xs p-2 bg-stone-300/50 dark:bg-slate-950 border border-stone-405 dark:border-slate-800 rounded-xl text-stone-800 dark:text-slate-200 focus:outline-none focus:border-mystic-accent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[8.5px] uppercase tracking-wider text-stone-500 block mb-1">Tâm trạng</label>
                                    <input 
                                        type="text" 
                                        value={editMood}
                                        onChange={(e) => setEditMood(e.target.value)}
                                        placeholder="Bình thường, mệt mỏi..."
                                        className="w-full text-xs p-2 bg-stone-300/50 dark:bg-slate-950 border border-stone-405 dark:border-slate-800 rounded-xl text-stone-800 dark:text-slate-200 focus:outline-none focus:border-mystic-accent"
                                    />
                                </div>

                                <div>
                                    <label className="text-[8.5px] uppercase tracking-wider text-stone-500 block mb-1">Mục tiêu cốt truyện</label>
                                    <textarea 
                                        value={editGoal}
                                        onChange={(e) => setEditGoal(e.target.value)}
                                        placeholder="Mục tiêu hiện tại..."
                                        rows={2}
                                        className="w-full text-xs p-2 bg-stone-300/50 dark:bg-slate-950 border border-stone-405 dark:border-slate-800 rounded-xl text-stone-800 dark:text-slate-200 focus:outline-none focus:border-mystic-accent resize-none custom-scrollbar font-sans"
                                    />
                                </div>
                            </div>

                            <div className="pt-1.5 flex gap-2">
                                <Button 
                                    className="flex-1 py-2 text-xs bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold border-none" 
                                    onClick={() => {
                                        if (onUpdateWorld) {
                                            onUpdateWorld({
                                                player: {
                                                    ...activeWorld.player,
                                                    name: editName,
                                                    age: editAge,
                                                    gender: editGender,
                                                    currentMood: editMood,
                                                    goal: editGoal
                                                }
                                            });
                                        }
                                        setIsQuickEditing(false);
                                    }}
                                >
                                    Lưu Lại
                                </Button>
                                <Button 
                                    variant="ghost"
                                    className="flex-1 py-2 text-xs border border-stone-400 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 rounded-xl" 
                                    onClick={() => setIsQuickEditing(false)}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                    <button onClick={() => setShowGlobalModal(true)} className="flex items-center gap-1.5 p-1 px-2 text-[10.5px] font-semibold text-stone-700 dark:text-slate-300 bg-stone-200 dark:bg-slate-800/40 hover:bg-stone-300/70 dark:hover:bg-slate-800/80 border border-stone-400/70 dark:border-slate-750 rounded-lg transition-all group shrink-0">
                        <div className="w-5 h-5 rounded-full bg-stone-300 dark:bg-slate-900 border border-stone-400 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:border-green-400"><Globe className="text-green-600 dark:text-green-400" size={10}/></div>
                        <span className="truncate">Thế giới</span>
                    </button>
                    <button onClick={() => setShowHistoryModal(true)} className="flex items-center gap-1.5 p-1 px-2 text-[10.5px] font-semibold text-stone-700 dark:text-slate-300 bg-stone-200 dark:bg-slate-800/40 hover:bg-stone-300/70 dark:hover:bg-slate-800/80 border border-stone-400/70 dark:border-slate-750 rounded-lg transition-all group shrink-0">
                        <div className="w-5 h-5 rounded-full bg-stone-300 dark:bg-slate-900 border border-stone-400 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:border-blue-400"><History className="text-blue-600 dark:text-blue-400" size={10}/></div>
                        <span className="truncate">Load Save</span>
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <button onClick={() => setShowImageLibrary(true)} className="flex flex-col items-center justify-center p-1 py-1.5 gap-1 text-[9px] font-bold text-stone-600 dark:text-slate-300 bg-stone-200 dark:bg-slate-800/40 hover:bg-stone-300 dark:hover:bg-slate-800/80 border border-stone-400/70 dark:border-slate-750 rounded-lg transition-all group">
                        <ImageIcon className="text-mystic-accent" size={12}/>
                        <span className="truncate">Ảnh</span>
                    </button>
                    <button onClick={() => setShowLogConsole(true)} className="flex flex-col items-center justify-center p-1 py-1.5 gap-1 text-[9px] font-bold text-stone-600 dark:text-slate-300 bg-stone-200 dark:bg-slate-800/40 hover:bg-stone-300 dark:hover:bg-slate-800/80 border border-stone-400/70 dark:border-slate-750 rounded-lg transition-all group">
                        <Terminal className="text-mystic-accent" size={12}/>
                        <span className="truncate">Console</span>
                    </button>
                    <button onClick={() => setShowRegexModal(true)} className="flex flex-col items-center justify-center p-1 py-1.5 gap-1 text-[9px] font-bold text-stone-600 dark:text-slate-300 bg-stone-200 dark:bg-slate-800/40 hover:bg-stone-300 dark:hover:bg-slate-800/80 border border-stone-400/70 dark:border-slate-750 rounded-lg transition-all group">
                        <Settings className="text-indigo-600 dark:text-indigo-400" size={12}/>
                        <span className="truncate">Regex</span>
                    </button>
                </div>
                <button onClick={() => setShowStoryDebugModal(true)} className="w-full h-8 flex items-center justify-center gap-1.5 p-1 bg-gradient-to-r from-cyan-950/20 to-stone-200 dark:from-sky-950/25 dark:to-slate-800/40 hover:from-cyan-950/30 dark:hover:from-sky-950/35 hover:bg-stone-450 dark:hover:bg-slate-750 border border-stone-400 dark:border-slate-700/80 rounded-lg transition-all group text-[10.5px] font-bold">
                    <Bug className="text-cyan-600 dark:text-cyan-400 animate-pulse" size={12}/>
                    <span className="text-cyan-700 dark:text-cyan-400">AI Gỡ Lỗi Chính Văn</span>
                </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-1 space-y-2">
                {/* Mobile Controls Section */}
                <div className="md:hidden p-2 space-y-3 bg-stone-400/20 dark:bg-slate-800/20 rounded-lg border border-stone-400/50 dark:border-slate-700/50 mb-2">
                    <div className="text-[10px] font-bold text-stone-500 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                        <Zap size={12} /> Điều khiển nhanh
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {/* Thử Lại Button */}
                        <Button 
                            variant="ghost" 
                            onClick={() => {
                                const lastModelIdx = [...history].reverse().findIndex(m => m.role === 'model');
                                if (lastModelIdx !== -1) {
                                    const actualIdx = history.length - 1 - lastModelIdx;
                                    handleRegenerate(actualIdx);
                                }
                            }} 
                            disabled={isLoading || !history.some(m => m.role === 'model')} 
                            className="h-10 text-[10px] font-bold uppercase tracking-tighter border border-stone-400 dark:border-slate-700 hover:border-mystic-accent/50 flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                            Thử Lại
                        </Button>

                        {/* Toggle Input Button */}
                        <button 
                            onClick={() => setIsInputCollapsed(!isInputCollapsed)}
                            className={`h-10 rounded border transition-all flex items-center justify-center gap-2 shadow-sm ${
                                isInputCollapsed 
                                ? 'bg-mystic-accent/10 border-mystic-accent/30 text-mystic-accent' 
                                : 'bg-stone-200 dark:bg-slate-800 border-stone-400 dark:border-slate-700 text-stone-500'
                            }`}
                        >
                            {isInputCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                            <span className="text-[10px] font-bold uppercase">
                                {isInputCollapsed ? 'Mở Rộng' : 'Thu Gọn'}
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        {/* Pagination Group */}
                        <div className="flex items-center h-10 bg-stone-200 dark:bg-slate-800 border border-stone-400 dark:border-slate-700 rounded overflow-hidden flex-1">
                            <button 
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="h-full px-3 text-stone-500 hover:text-mystic-accent disabled:opacity-30 transition-colors border-r border-stone-400 dark:border-slate-700"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold text-stone-600 dark:text-slate-400 leading-none">
                                    {currentPage}/{totalPages}
                                </span>
                                <span className="text-[7px] uppercase opacity-50 font-bold">Trang</span>
                            </div>
                            <button 
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="h-full px-3 text-stone-500 hover:text-mystic-accent disabled:opacity-30 transition-colors border-l border-stone-400 dark:border-slate-700"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Scroll Controls */}
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={scrollToTop}
                                className="h-10 w-10 flex items-center justify-center rounded bg-stone-200 dark:bg-slate-800 border border-stone-400 dark:border-slate-700 text-stone-500 hover:text-mystic-accent transition-all"
                            >
                                <ChevronsUp size={18} />
                            </button>
                            <button 
                                onClick={scrollToBottom}
                                className="h-10 w-10 flex items-center justify-center rounded bg-stone-200 dark:bg-slate-800 border border-stone-400 dark:border-slate-700 text-stone-500 hover:text-mystic-accent transition-all"
                            >
                                <ChevronsDown size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stream Toggle */}
                <button 
                    onClick={toggleStreamResponse}
                    className="w-full p-2 flex justify-between items-center text-left hover:bg-stone-400 dark:hover:bg-slate-700/50 transition-colors bg-stone-200 dark:bg-slate-800/30 rounded border border-stone-400 dark:border-slate-700 mb-2"
                >
                    <div className="flex items-center gap-2 text-[10px] font-bold text-stone-700 dark:text-slate-300">
                         <Zap size={14} className={settings?.streamResponse ? "text-yellow-500 dark:text-yellow-400" : "text-stone-400 dark:text-slate-500"} />
                         Streaming
                    </div>
                    <div className={settings?.streamResponse ? "text-green-600 dark:text-green-400" : "text-stone-300 dark:text-slate-600"}>
                         {settings?.streamResponse ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}
                    </div>
                </button>

                <WorldInfoSidebar 
                   lorebook={activeWorld.lorebook} 
                   onUpdateLorebook={(l) => onUpdateWorld && onUpdateWorld({ lorebook: l })} 
                />
                <StoryBibleSidebar worldData={activeWorld} />
                
                <button 
                  onClick={() => setShowContextModal(true)}
                  className="w-full p-2 flex justify-between items-center text-left hover:bg-mystic-accent/10 dark:hover:bg-mystic-accent/5 transition-all bg-stone-200 dark:bg-slate-800/30 rounded border border-stone-400 dark:border-slate-700 group"
                >
                  <div className="flex items-center gap-2 text-[10px] font-bold text-mystic-accent uppercase">
                    <Database size={14} className="group-hover:scale-110 transition-transform" />
                    Cửa sổ Ngữ cảnh
                  </div>
                  <div className="text-[8px] bg-mystic-accent/20 px-1.5 py-0.5 rounded text-mystic-accent font-bold">Config</div>
                </button>

                <TawaPresetManager 
                  onConfigChange={handleTawaConfigChange} 
                  initialPreset={activeWorld?.config?.tawaPreset}
                  playerName={activeWorld.player?.name || "User"}
                  charName={activeWorld.entities?.[0]?.name || "Character"}
                />
                <AIMonitor />
            </div>
            <div className="p-1 border-t border-stone-400 dark:border-slate-800 bg-stone-200 dark:bg-mystic-900/95 flex flex-row gap-1 mt-auto shrink-0">
                <Button variant="ghost" className="flex-1 text-[12px] h-9 px-1 justify-center border border-stone-400 dark:border-slate-700 hover:bg-stone-400 dark:hover:bg-slate-800 font-mono font-bold leading-[20px]" icon={<Settings size={12}/>} onClick={handleGoToSettings} title="Cài đặt hệ thống">Cài đặt</Button>
                <Button variant="outline" className="flex-1 text-[12px] h-9 px-1 justify-center border border-stone-400 dark:border-slate-700 font-mono font-bold" icon={<Save size={12}/>} onClick={handleManualSave} isLoading={isSaving} disabled={isLoading} title="Lưu thủ công và tải file (.json)">Lưu</Button>
                <Button variant="danger" className="flex-1 text-[12px] h-9 px-1 justify-center border-red-900/30 font-mono font-bold" icon={<LogOut size={12}/>} onClick={handleExit} title="Thoát ra Menu chính">Thoát</Button>
            </div>
        </div>
    );
};
