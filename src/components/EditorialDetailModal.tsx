import React, { useEffect } from 'react';
import { EditorialTopic } from '../data/editorialTopics';
import {
  X,
  Store,
  Utensils,
  BookMarked,
  Users,
  Compass,
  Star,
  MapPin,
  Clock,
  Cloud,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  HelpCircle,
  ArrowRight,
  Smile,
  Coffee,
} from 'lucide-react';

interface EditorialDetailModalProps {
  topic: EditorialTopic | null;
  onClose: () => void;
  onAction?: (actionType?: string) => void;
}

export const EditorialDetailModal: React.FC<EditorialDetailModalProps> = ({
  topic,
  onClose,
  onAction,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (topic) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [topic, onClose]);

  if (!topic) return null;

  const renderIcon = (iconName: string, className: string = 'w-7 h-7') => {
    switch (iconName) {
      case 'Store':
        return <Store className={className} />;
      case 'Utensils':
        return <Utensils className={className} />;
      case 'BookMarked':
        return <BookMarked className={className} />;
      case 'Users':
        return <Users className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      case 'Star':
        return <Star className={className} />;
      case 'MapPin':
        return <MapPin className={className} />;
      case 'Clock':
        return <Clock className={className} />;
      case 'Cloud':
        return <Cloud className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'ShoppingBag':
        return <ShoppingBag className={className} />;
      case 'HelpCircle':
        return <HelpCircle className={className} />;
      case 'Smile':
        return <Smile className={className} />;
      case 'Coffee':
        return <Coffee className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  const getThemeStyles = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 shadow-emerald-500/30',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 shadow-amber-500/30',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          btnBg: 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/30',
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-500 text-white ring-4 ring-rose-500/20 shadow-rose-500/30',
          badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30',
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-600 text-white ring-4 ring-purple-600/20 shadow-purple-600/30',
          badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
          btnBg: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30',
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-600 text-white ring-4 ring-blue-600/20 shadow-blue-600/30',
          badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
          btnBg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30',
        };
      case 'teal':
        return {
          iconBg: 'bg-teal-500 text-slate-950 ring-4 ring-teal-500/20 shadow-teal-500/30',
          badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
          btnBg: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30',
        };
      case 'indigo':
        return {
          iconBg: 'bg-indigo-600 text-white ring-4 ring-indigo-600/20 shadow-indigo-600/30',
          badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          btnBg: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30',
        };
      case 'orange':
      default:
        return {
          iconBg: 'bg-orange-500 text-white ring-4 ring-orange-500/20 shadow-orange-500/30',
          badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
          btnBg: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/30',
        };
    }
  };

  const theme = getThemeStyles(topic.themeColor);

  return (
    <div
      id="modal-editorial-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="modal-editorial-detail-card"
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header with Circular Icon & Close Button */}
        <div className="p-6 sm:p-7 border-b border-slate-100 flex items-start justify-between gap-4 bg-gradient-to-b from-slate-50 to-white">
          <div className="flex items-center gap-4">
            {/* Dominant Circular Icon */}
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg shrink-0 ${theme.iconBg}`}>
              {renderIcon(topic.iconName, 'w-7 h-7 sm:w-8 sm:h-8')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}>
                  {topic.badge}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {topic.shortTitle}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1 leading-snug">
                {topic.fullTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            title="Tutup Redaksi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Redaksi Panjang Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-slate-700">
          {topic.content}
        </div>

        {/* Footer with Action & Close Buttons */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Banuarasa Weekend Market • Wisata Gastronomi Kabupaten Berau
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer text-center"
            >
              Tutup
            </button>
            {topic.actionLabel && topic.actionType && topic.actionType !== 'NONE' && (
              <button
                onClick={() => {
                  if (onAction) {
                    onAction(topic.actionType);
                  }
                  onClose();
                }}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${theme.btnBg}`}
              >
                <span>{topic.actionLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
