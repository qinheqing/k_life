import React, { useState } from 'react';
import { UserInput, Gender, Language } from '../types';
import { Calendar, Clock, MapPin, User, AlertCircle, CheckCircle, Sparkles, Crown } from 'lucide-react';
import { getTexts } from '../locales';

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
  lang: Language;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, lang }) => {
  const t = getTexts(lang);
  const [formData, setFormData] = useState<UserInput>({
    name: '',
    gender: Gender.MALE,
    birthDate: '1990-01-01',
    birthTime: '00:00',
    birthLocation: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = (field: string, value: any): string => {
    if (field === 'birthDate' && !value) {
      return lang === 'zh' ? '请选择出生日期' : 'Please select birth date';
    }
    if (field === 'birthDate' && value) {
      const birthDate = new Date(value);
      const now = new Date();
      if (birthDate > now) {
        return lang === 'zh' ? '出生日期不能是未来日期' : 'Birth date cannot be in the future';
      }
    }
    if (field === 'birthTime' && !value) {
      return lang === 'zh' ? '请选择出生时间' : 'Please select birth time';
    }
    if (field === 'birthLocation' && !value.trim()) {
      return lang === 'zh' ? '请输入出生地点' : 'Please enter birthplace';
    }
    return '';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, (formData as any)[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-lg mx-auto relative">
      {/* Background Decorations */}
      <div className="absolute -top-6 -left-6 animate-float" style={{animationDelay: '1s'}}>
        <div className="glass-card p-3">
          <Sparkles className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
        </div>
      </div>
      <div className="absolute -top-6 -right-6 animate-float" style={{animationDelay: '2s'}}>
        <div className="glass-card p-3">
          <Crown className="w-6 h-6" style={{color: 'var(--accent-emphasis)'}} />
        </div>
      </div>

      {/* Main Form Card */}
      <div className="glass-card-light p-10 relative overflow-hidden animate-luxury-scale-in">
        {/* Background Gradient */}
        <div className="absolute inset-0 animate-gradient-shift" style={{
          background: `linear-gradient(145deg, var(--accent-glow), transparent, var(--accent-glow))`,
          backgroundSize: '200% 100%'
        }}></div>

        {/* Top Border Glow */}
        <div className="absolute top-0 left-0 w-full h-1" style={{
          background: `linear-gradient(to right, transparent, var(--accent-primary), transparent)`
        }}></div>

        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                  background: `linear-gradient(135deg, var(--accent-primary), var(--accent-emphasis))`
                }}>
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 rounded-2xl opacity-20 blur-lg animate-pulse" style={{
                  background: `linear-gradient(135deg, var(--accent-primary), var(--accent-emphasis))`
                }}></div>
              </div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: 'var(--accent-primary)'}}></div>
            </div>
            <h2 className="text-4xl font-bold luxury-heading mb-3">{t.inputTitle}</h2>
            <p className="text-lg leading-relaxed" style={{color: 'var(--text-secondary)'}}>{t.inputSubtitle}</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm" style={{color: 'var(--text-muted)'}}>
              <div className="w-1 h-1 rounded-full animate-pulse" style={{backgroundColor: 'var(--accent-primary)'}}></div>
              <span>{lang === 'zh' ? '3分钟完成 • AI智能分析' : '3 Minutes • AI Smart Analysis'}</span>
              <div className="w-1 h-1 rounded-full animate-pulse" style={{animationDelay: '0.5s', backgroundColor: 'var(--accent-primary)'}}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name Field */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold uppercase tracking-wider" style={{color: 'var(--text-secondary)'}}>
                {t.nameLabel}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 transition-colors" style={{
                    color: 'var(--text-muted)'
                  }} />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-luxury pl-12 ${errors.name ? 'border-red-500 focus:border-red-500 focus:shadow-red-500/20' : ''}`}
                  placeholder={lang === 'zh' ? "您的姓名" : "Your Name"}
                />
                {formData.name && !errors.name && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {errors.name && (
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </div>
              )}
            </div>

            {/* Gender Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold uppercase tracking-wider" style={{color: 'var(--text-secondary)'}}>
                {t.genderLabel}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: Gender.MALE })}
                  className={`group relative py-4 px-6 rounded-2xl border-2 font-semibold transition-all duration-300 ${
                    formData.gender === Gender.MALE
                      ? 'shadow-lg'
                      : 'hover:bg-blue-400/10'
                  }`}
                  style={{
                    borderColor: formData.gender === Gender.MALE ? '#60A5FA' : 'var(--border-subtle)',
                    backgroundColor: formData.gender === Gender.MALE ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
                    color: formData.gender === Gender.MALE ? '#60A5FA' : 'var(--text-secondary)'
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className={`w-3 h-3 rounded-full transition-colors`} style={{
                      backgroundColor: formData.gender === Gender.MALE ? '#60A5FA' : 'var(--border-medium)'
                    }}></div>
                    <span>{t.male}</span>
                  </div>
                  {formData.gender === Gender.MALE && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent rounded-2xl animate-pulse"></div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: Gender.FEMALE })}
                  className={`group relative py-4 px-6 rounded-2xl border-2 font-semibold transition-all duration-300 ${
                    formData.gender === Gender.FEMALE
                      ? 'shadow-lg'
                      : 'hover:bg-pink-400/10'
                  }`}
                  style={{
                    borderColor: formData.gender === Gender.FEMALE ? '#F472B6' : 'var(--border-subtle)',
                    backgroundColor: formData.gender === Gender.FEMALE ? 'rgba(244, 114, 182, 0.15)' : 'transparent',
                    color: formData.gender === Gender.FEMALE ? '#F472B6' : 'var(--text-secondary)'
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className={`w-3 h-3 rounded-full transition-colors`} style={{
                      backgroundColor: formData.gender === Gender.FEMALE ? '#F472B6' : 'var(--border-medium)'
                    }}></div>
                    <span>{t.female}</span>
                  </div>
                  {formData.gender === Gender.FEMALE && (
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-transparent rounded-2xl animate-pulse"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Birth Date */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                {t.birthDateLabel}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
                </div>
                <input
                  type="date"
                  name="birthDate"
                  required
                  value={formData.birthDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-luxury pl-12 ${errors.birthDate ? 'border-red-500 focus:border-red-500 focus:shadow-red-500/20' : ''}`}
                />
                {formData.birthDate && !errors.birthDate && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {errors.birthDate && (
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  {errors.birthDate}
                </div>
              )}
            </div>

            {/* Birth Time */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                {t.birthTimeLabel}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
                </div>
                <input
                  type="time"
                  name="birthTime"
                  required
                  value={formData.birthTime}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-luxury pl-12 ${errors.birthTime ? 'border-red-500 focus:border-red-500 focus:shadow-red-500/20' : ''}`}
                />
                {formData.birthTime && !errors.birthTime && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {errors.birthTime && (
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  {errors.birthTime}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                {t.birthPlaceLabel}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-yellow-400 transition-colors" />
                </div>
                <input
                  type="text"
                  name="birthLocation"
                  required
                  value={formData.birthLocation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={t.birthPlacePlaceholder}
                  className={`input-luxury pl-12 ${errors.birthLocation ? 'border-red-500 focus:border-red-500 focus:shadow-red-500/20' : ''}`}
                />
                {formData.birthLocation && !errors.birthLocation && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {errors.birthLocation && (
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  {errors.birthLocation}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-luxury w-full text-lg py-4 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="font-semibold">{t.loading}</span>
                    </div>
                    {/* Loading Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-3">
                      <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                      <span className="font-bold text-lg">✨ {t.submitButton}</span>
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                    </div>
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </>
                )}
              </button>
            </div>

            {/* Tip Box */}
            <div className="glass-card p-4 border rounded-xl" style={{
              borderColor: 'var(--border-accent)',
              background: 'var(--accent-glow)'
            }}>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--accent-glow)'}}>
                    <span className="text-sm" style={{color: 'var(--accent-primary)'}}>💡</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-sm" style={{color: 'var(--accent-primary)'}}>
                    {lang === 'zh' ? '小贴士' : 'Pro Tip'}
                  </h4>
                  <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>{t.tip}</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InputForm;