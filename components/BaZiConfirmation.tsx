import React, { useState, useEffect } from 'react';
import { BaZiResult, Language, BaZiChart } from '../types';
import { getTexts } from '../locales';
import { CheckCircle, Clock, Calendar, Edit2, RotateCcw, PlayCircle } from 'lucide-react';

interface BaZiConfirmationProps {
  data: BaZiResult;
  onConfirm: (finalData: BaZiResult) => void;
  onRetry: () => void;
  lang: Language;
  isLoading: boolean;
}

// Extract EditablePillar outside to prevent re-mounting on every state change
// which breaks IME (Input Method Editor) for Chinese characters.
interface EditablePillarProps {
  label: string;
  pillarKey: keyof BaZiChart;
  gan: string;
  zhi: string;
  onChange: (key: keyof BaZiChart, field: 'gan' | 'zhi', value: string) => void;
}

const EditablePillar: React.FC<EditablePillarProps> = ({ label, pillarKey, gan, zhi, onChange }) => {
  return (
    <div className="flex flex-col items-center bg-purple-50 dark:bg-orange-100 rounded-xl p-3 border border-purple-100 dark:border-amber-300 min-w-[80px] w-full relative group hover:shadow-md transition-all">
      <span className="text-xs text-purple-600 dark:text-orange-700 font-medium mb-2 uppercase tracking-wide">{label}</span>
      <div className="flex flex-col items-center gap-2 w-full">
          <input
              value={gan}
              onChange={(e) => onChange(pillarKey, 'gan', e.target.value)}
              className="w-16 text-center text-2xl font-bold text-slate-800 dark:text-gray-800 serif bg-transparent border-b border-transparent hover:border-purple-300 dark:hover:border-amber-400 focus:border-purple-500 dark:focus:border-amber-500 focus:outline-none transition-colors"
          />
          <input
              value={zhi}
              onChange={(e) => onChange(pillarKey, 'zhi', e.target.value)}
              className="w-16 text-center text-2xl font-bold text-slate-800 dark:text-gray-800 serif bg-transparent border-b border-transparent hover:border-purple-300 dark:hover:border-amber-400 focus:border-purple-500 dark:focus:border-amber-500 focus:outline-none transition-colors"
          />
      </div>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 pointer-events-none">
          <Edit2 className="w-3 h-3 text-purple-300 dark:text-orange-400" />
      </div>
    </div>
  );
};

const BaZiConfirmation: React.FC<BaZiConfirmationProps> = ({ data, onConfirm, onRetry, lang, isLoading }) => {
  const t = getTexts(lang);
  const [editableBaZi, setEditableBaZi] = useState<BaZiChart>(data.bazi);
  const [editableDaYun, setEditableDaYun] = useState<string[]>(data.daYun);
  const [editableStartAge, setEditableStartAge] = useState<number>(data.startAge);
  const [editableDirection, setEditableDirection] = useState<string>(data.direction);

  // Sync state if data prop updates (e.g. re-calculation)
  useEffect(() => {
    setEditableBaZi(data.bazi);
    setEditableDaYun(data.daYun);
    setEditableStartAge(data.startAge);
    setEditableDirection(data.direction);
  }, [data]);

  const handlePillarChange = (key: keyof BaZiChart, field: 'gan' | 'zhi', value: string) => {
    setEditableBaZi(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const handleConfirm = () => {
    onConfirm({
        ...data,
        bazi: editableBaZi,
        daYun: editableDaYun,
        startAge: editableStartAge,
        direction: editableDirection
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-amber-50 rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-amber-200 animate-fade-in-up transition-colors">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
             <CheckCircle className="text-green-500 w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-800 mb-1 transition-colors">{t.confirmTitle}</h2>
        <p className="text-gray-500 dark:text-gray-600 text-sm transition-colors">{t.confirmSubtitle}</p>
      </div>

      {/* Birth Info Summary */}
      <div className="bg-gray-50 dark:bg-amber-100 rounded-2xl p-5 mb-6 text-sm text-gray-700 dark:text-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4 transition-colors">
        <div className="col-span-1 md:col-span-2 font-bold flex items-center gap-2 text-indigo-600 dark:text-orange-600">
            <Calendar className="w-4 h-4" />
            {t.birthInfo}
        </div>
        <div>
            <span className="text-gray-400 dark:text-gray-500 block text-xs">{t.birthDateLabel}:</span>
            {data.userInput.birthDate} {data.userInput.birthTime}
        </div>
        <div>
             <span className="text-gray-400 dark:text-gray-500 block text-xs">{t.birthPlaceLabel}:</span>
             {data.userInput.birthLocation}
        </div>
        <div>
             <span className="text-gray-400 dark:text-gray-500 block text-xs">{t.lunarDateLabel}:</span>
             {data.lunarDate}
        </div>
        <div>
             <span className="text-gray-400 dark:text-gray-500 block text-xs">{t.genderLabel}:</span>
             {data.userInput.gender === 'Male' ? t.male : t.female}
        </div>
      </div>

      {/* Solar Time */}
      <div className="bg-yellow-50 dark:bg-yellow-100 border border-yellow-100 dark:border-yellow-300 rounded-xl p-4 mb-6 flex items-center gap-3 transition-colors">
        <Clock className="text-yellow-600 dark:text-yellow-700 w-5 h-5" />
        <div>
            <span className="font-bold text-slate-800 dark:text-gray-800 mr-2">{t.solarTime}: {data.solarTime}</span>
            <span className="text-xs text-yellow-700 dark:text-yellow-800 opacity-80">(Used for Hour Pillar)</span>
        </div>
      </div>

      {/* Pillars */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
             <div className="p-1.5 bg-purple-100 dark:bg-orange-200 rounded-full text-purple-600 dark:text-orange-700">
                <Edit2 size={14} />
             </div>
             <h3 className="font-bold text-slate-800 dark:text-gray-800 transition-colors">{t.baziTitle}</h3>
        </div>
        <div className="grid grid-cols-4 gap-3 md:gap-4">
            <EditablePillar 
              label={t.year} 
              pillarKey="year" 
              gan={editableBaZi.year.gan} 
              zhi={editableBaZi.year.zhi} 
              onChange={handlePillarChange} 
            />
            <EditablePillar 
              label={t.month} 
              pillarKey="month" 
              gan={editableBaZi.month.gan} 
              zhi={editableBaZi.month.zhi} 
              onChange={handlePillarChange} 
            />
            <EditablePillar 
              label={t.day} 
              pillarKey="day" 
              gan={editableBaZi.day.gan} 
              zhi={editableBaZi.day.zhi} 
              onChange={handlePillarChange} 
            />
            <EditablePillar 
              label={t.hour} 
              pillarKey="hour" 
              gan={editableBaZi.hour.gan} 
              zhi={editableBaZi.hour.zhi} 
              onChange={handlePillarChange} 
            />
        </div>
      </div>

      {/* Da Yun (Big Luck) */}
      <div className="bg-gray-50 dark:bg-amber-100 rounded-2xl p-5 mb-8 transition-colors">
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-amber-300 pb-2 flex-wrap gap-4">
            <div className="flex items-center gap-2">
                <div className="p-1 bg-purple-100 dark:bg-orange-200 rounded-full text-purple-600 dark:text-orange-700">
                    <Edit2 size={12} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-gray-800 transition-colors">{t.daYun}</h3>
            </div>
            <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-600">{t.startAge}:</span>
                    <input
                        type="number"
                        value={editableStartAge}
                        onChange={(e) => setEditableStartAge(parseInt(e.target.value) || 0)}
                        className="w-12 px-2 py-1 text-center text-sm font-bold text-slate-800 dark:text-gray-800 bg-white dark:bg-white border border-purple-200 dark:border-amber-300 rounded hover:border-purple-400 dark:hover:border-amber-400 focus:border-purple-500 dark:focus:border-amber-500 focus:outline-none transition-colors"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-600">{t.virtualAge}</span>
                </div>
                <span className="text-gray-400 dark:text-gray-500">|</span>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-600">{t.direction}:</span>
                    <select
                        value={editableDirection}
                        onChange={(e) => setEditableDirection(e.target.value)}
                        className="px-2 py-1 text-sm font-bold text-slate-800 dark:text-gray-800 bg-white dark:bg-white border border-purple-200 dark:border-amber-300 rounded hover:border-purple-400 dark:hover:border-amber-400 focus:border-purple-500 dark:focus:border-amber-500 focus:outline-none transition-colors cursor-pointer"
                    >
                        <option value="Forward">{t.forward}</option>
                        <option value="Backward">{t.backward}</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Editable Da Yun Grid */}
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {editableDaYun.map((yun, idx) => (
                <div key={idx} className="bg-white dark:bg-white border border-gray-200 dark:border-amber-200 rounded-lg p-2 text-center w-[70px] shadow-sm relative group hover:shadow-md hover:border-purple-200 dark:hover:border-amber-400 transition-all">
                    <span className="block text-[10px] text-gray-400 dark:text-gray-500 mb-1">{idx + 1}</span>
                    <input
                        value={yun}
                        onChange={(e) => {
                            const newDaYun = [...editableDaYun];
                            newDaYun[idx] = e.target.value;
                            setEditableDaYun(newDaYun);
                        }}
                        className="w-full text-center text-lg font-bold text-slate-700 dark:text-gray-800 serif bg-transparent border-b border-transparent hover:border-purple-300 dark:hover:border-amber-400 focus:border-purple-500 dark:focus:border-amber-500 focus:outline-none transition-colors p-0"
                    />
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 pointer-events-none">
                        <Edit2 className="w-2.5 h-2.5 text-purple-300 dark:text-orange-400" />
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
            onClick={onRetry}
            disabled={isLoading}
            className="w-full py-4 rounded-xl border border-gray-200 dark:border-amber-300 text-gray-600 dark:text-gray-700 font-semibold hover:bg-gray-50 dark:hover:bg-amber-100 transition-all flex justify-center items-center gap-2"
        >
            <RotateCcw size={18} />
            {t.reEnter}
        </button>
        <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-orange-500 dark:to-amber-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transform transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
            {isLoading ? (
                <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t.analyzingDestiny}
                </>
            ) : (
                <>
                {t.confirmAnalyze}
                <PlayCircle size={18} />
                </>
            )}
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-amber-100 text-blue-800 dark:text-amber-800 text-xs rounded-lg flex items-start gap-2 transition-colors">
         <div className="mt-0.5">💡</div>
         <p>{t.confirmTip}</p>
      </div>
    </div>
  );
};

export default BaZiConfirmation;