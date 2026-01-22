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
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-blue-400/0 group-hover:from-purple-400/10 group-hover:to-blue-400/10 rounded-xl transition-all duration-500 blur-xl"></div>
      <div className="relative glass-card p-4 min-w-[100px] w-full hover:shadow-xl hover:scale-105 transition-all duration-300">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest">{label}</span>
        <div className="flex flex-col items-center gap-3 w-full">
            <div className="relative group/input">
              <input
                  value={gan}
                  onChange={(e) => onChange(pillarKey, 'gan', e.target.value)}
                  className="w-20 text-center text-3xl font-bold text-gray-800 dark:text-gray-700 serif bg-transparent border-b-2 border-transparent group-hover/input:border-purple-300 dark:group-hover/input:border-amber-400 focus:border-purple-500 dark:focus:border-amber-500 focus:outline-none transition-all duration-300 py-2"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 to-transparent blur-lg opacity-0 group-hover/input:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="relative group/input">
              <input
                  value={zhi}
                  onChange={(e) => onChange(pillarKey, 'zhi', e.target.value)}
                  className="w-20 text-center text-3xl font-bold text-gray-800 dark:text-gray-700 serif bg-transparent border-b-2 border-transparent group-hover/input:border-purple-300 dark:group-hover/input:border-amber-400 focus:border-purple-500 dark:focus:border-amber-500 focus:outline-none transition-all duration-300 py-2"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 to-transparent blur-lg opacity-0 group-hover/input:opacity-100 transition-opacity duration-300"></div>
            </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-indigo-500 dark:from-yellow-400 dark:to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <Edit2 className="w-3 h-3 text-white" />
            </div>
        </div>
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
    <div className="w-full max-w-2xl mx-auto glass-card-light p-8 md:p-10 animate-luxury-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-yellow-300/10 animate-gradient-shift"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
      
      <div className="relative">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
               <div className="relative">
                 <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg animate-luxury-glow">
                   <CheckCircle className="text-white w-8 h-8" />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl opacity-20 blur-xl animate-pulse"></div>
               </div>
          </div>
          <h2 className="text-3xl font-bold luxury-heading mb-3">{t.confirmTitle}</h2>
          <p className="text-gray-400 dark:text-gray-500 text-base">{t.confirmSubtitle}</p>
        </div>

        {/* Birth Info Summary */}
        <div className="glass-card p-6 mb-8 text-sm text-gray-700 dark:text-gray-800">
          <div className="col-span-2 font-bold flex items-center gap-3 text-indigo-600 dark:text-orange-600 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 dark:from-yellow-400 dark:to-orange-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              {t.birthInfo}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-amber-50 dark:to-yellow-50 rounded-xl border border-purple-100 dark:border-amber-200">
                <span className="text-gray-400 dark:text-gray-500 block text-xs mb-1">{t.birthDateLabel}:</span>
                <div className="font-semibold text-gray-800 dark:text-gray-700">{data.userInput.birthDate} <span className="text-gray-500 dark:text-gray-600">{data.userInput.birthTime}</span></div>
            </div>
            <div className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-amber-50 dark:to-yellow-50 rounded-xl border border-pink-100 dark:border-amber-200">
                 <span className="text-gray-400 dark:text-gray-500 block text-xs mb-1">{t.birthPlaceLabel}:</span>
                 <div className="font-semibold text-gray-800 dark:text-gray-700">{data.userInput.birthLocation}</div>
            </div>
            <div className="p-3 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-amber-50 dark:to-yellow-50 rounded-xl border border-cyan-100 dark:border-amber-200">
                 <span className="text-gray-400 dark:text-gray-500 block text-xs mb-1">{t.lunarDateLabel}:</span>
                 <div className="font-semibold text-gray-800 dark:text-gray-700">{data.lunarDate}</div>
            </div>
            <div className="p-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-amber-50 dark:to-yellow-50 rounded-xl border border-violet-100 dark:border-amber-200">
                 <span className="text-gray-400 dark:text-gray-500 block text-xs mb-1">{t.genderLabel}:</span>
                 <div className="font-semibold text-gray-800 dark:text-gray-700">{data.userInput.gender === 'Male' ? t.male : t.female}</div>
            </div>
          </div>
        </div>

        {/* Solar Time */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-100 dark:to-orange-100 border border-yellow-200 dark:border-yellow-300 rounded-2xl p-6 mb-8 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="text-white w-5 h-5" />
              </div>
              <div className="font-bold text-xl text-gray-800 dark:text-gray-700">{t.solarTime}</div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white dark:bg-white rounded-xl p-4 border border-yellow-200 dark:border-yellow-300 shadow-sm hover:shadow-md transition-shadow">
                 <div className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-medium">原始时间</div>
                 <div className="font-bold text-lg text-gray-800 dark:text-gray-700">{data.userInput.birthTime}</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl p-4 shadow-lg">
                 <div className="text-xs text-white/80 mb-2 font-medium">真太阳时</div>
                 <div className="font-bold text-lg text-white">{data.solarTime}</div>
              </div>
              {data.originalSolarTime && (
                 <>
                    <div className="bg-white dark:bg-white rounded-xl p-4 border border-yellow-200 dark:border-yellow-300 shadow-sm hover:shadow-md transition-shadow">
                       <div className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-medium">时辰</div>
                       <div className="font-bold text-lg text-gray-800 dark:text-gray-700">{data.originalSolarTime.solarHour}</div>
                    </div>
                    <div className="bg-white dark:bg-white rounded-xl p-4 border border-yellow-200 dark:border-yellow-300 shadow-sm hover:shadow-md transition-shadow">
                       <div className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-medium">经纬度</div>
                       <div className="font-bold text-sm text-gray-800 dark:text-gray-700">
                          {data.originalSolarTime.latitude.toFixed(2)}°N, {data.originalSolarTime.longitude.toFixed(2)}°E
                       </div>
                    </div>
                 </>
              )}
           </div>
           <div className="mt-4 p-3 bg-white dark:bg-white rounded-lg border border-yellow-200 dark:border-yellow-300 text-xs text-gray-700 dark:text-gray-700 flex items-start gap-2">
              <div className="text-lg">💡</div>
              <div>真太阳时已根据出生地经纬度校正，用于确定准确的时辰</div>
           </div>
        </div>

        {/* Pillars */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
               <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 dark:from-yellow-400 dark:to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                 <Edit2 size={16} className="text-white" />
               </div>
               <h3 className="font-bold text-xl text-gray-800 dark:text-gray-700">{t.baziTitle}</h3>
          </div>
          <div className="grid grid-cols-4 gap-4">
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
        <div className="glass-card p-6 mb-10">
          <div className="flex justify-between items-center mb-5 border-b border-gray-200 dark:border-amber-300 pb-4 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 dark:from-yellow-400 dark:to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                      <Edit2 size={14} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-700">{t.daYun}</h3>
              </div>
              <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-600 font-medium">{t.startAge}:</span>
                      <input
                          type="number"
                          value={editableStartAge}
                          onChange={(e) => setEditableStartAge(parseInt(e.target.value) || 0)}
                          className="w-16 px-3 py-2 text-center text-sm font-bold text-gray-800 dark:text-gray-700 bg-white dark:bg-white border-2 border-purple-200 dark:border-amber-300 rounded-xl hover:border-purple-400 dark:hover:border-amber-400 focus:border-purple-500 dark:focus:border-amber-500 focus:outline-none transition-all shadow-sm hover:shadow-md"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-600 font-medium">{t.virtualAge}</span>
                  </div>
                  <span className="text-gray-300 dark:text-gray-400">|</span>
                  <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-600 font-medium">{t.direction}:</span>
                      <select
                          value={editableDirection}
                          onChange={(e) => setEditableDirection(e.target.value)}
                          className="px-3 py-2 text-sm font-bold text-gray-800 dark:text-gray-700 bg-white dark:bg-white border-2 border-purple-200 dark:border-amber-300 rounded-xl hover:border-purple-400 dark:hover:border-amber-400 focus:border-purple-500 dark:focus:border-amber-500 focus:outline-none transition-all shadow-sm hover:shadow-md cursor-pointer"
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
                  <div key={idx} className="glass-card p-3 text-center w-[80px] shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 relative group">
                      <span className="block text-[10px] text-gray-400 dark:text-gray-500 mb-2 font-medium">{idx + 1}</span>
                      <div className="relative group/input">
                        <input
                            value={yun}
                            onChange={(e) => {
                                const newDaYun = [...editableDaYun];
                                newDaYun[idx] = e.target.value;
                                setEditableDaYun(newDaYun);
                            }}
                            className="w-full text-center text-xl font-bold text-gray-800 dark:text-gray-700 serif bg-transparent border-b-2 border-transparent group-hover/input:border-purple-300 dark:group-hover/input:border-amber-400 focus:border-purple-500 dark:focus:border-amber-500 focus:outline-none transition-all duration-300 py-2"
                        />
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Edit2 className="w-3 h-3 text-purple-400 dark:text-orange-400" />
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
              className="w-full py-4 rounded-xl border-2 border-gray-200 dark:border-amber-300 text-gray-600 dark:text-gray-700 font-bold hover:bg-gray-50 dark:hover:bg-amber-100 hover:border-purple-300 dark:hover:border-orange-400 transition-all flex justify-center items-center gap-2 hover:scale-105 hover:shadow-lg duration-300"
          >
              <RotateCcw size={20} />
              {t.reEnter}
          </button>
          <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full btn-luxury text-lg py-4 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex justify-center items-center gap-2"
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
                  <PlayCircle size={20} />
                  </>
              )}
          </button>
        </div>

        <div className="mt-6 p-4 glass-card text-xs text-gray-700 dark:text-gray-700 flex items-start gap-3">
           <div className="text-2xl">💡</div>
           <p className="leading-relaxed">{t.confirmTip}</p>
        </div>
      </div>
    </div>
  );
};

export default BaZiConfirmation;