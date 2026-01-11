import React, { useState, useEffect, useRef } from 'react';
import { Settings, Edit2, Check, Ghost, Info, AlertTriangle } from 'lucide-react';
import { maskName, maskEmail } from './utils/masking';
import { scheduleEmergencyEmail, cancelScheduledEmail } from './services/resendService';
import SettingsModal from './components/SettingsModal';
import { UserSettings, CheckInState } from './types';

const App: React.FC = () => {
  // State for User Input
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  
  // State for UI Modes
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // State for Check-in Logic
  const [lastCheckIn, setLastCheckIn] = useState<number | null>(null);
  const [scheduledEmailId, setScheduledEmailId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Refs for focusing inputs
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('alive_settings');
    const savedState = localStorage.getItem('alive_state');

    if (savedSettings) {
      const parsed: UserSettings = JSON.parse(savedSettings);
      setName(parsed.name);
      setEmail(parsed.email);
      setApiKey(parsed.resendApiKey);
    }

    if (savedState) {
      const parsed: CheckInState = JSON.parse(savedState);
      setLastCheckIn(parsed.lastCheckIn);
      setScheduledEmailId(parsed.scheduledEmailId);
    }
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    const settings: UserSettings = { name, email, resendApiKey: apiKey };
    localStorage.setItem('alive_settings', JSON.stringify(settings));
  }, [name, email, apiKey]);

  // Save state whenever it changes
  useEffect(() => {
    const state: CheckInState = { lastCheckIn, scheduledEmailId };
    localStorage.setItem('alive_state', JSON.stringify(state));
  }, [lastCheckIn, scheduledEmailId]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) nameInputRef.current.focus();
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingEmail && emailInputRef.current) emailInputRef.current.focus();
  }, [isEditingEmail]);

  const handleCheckIn = async () => {
    if (!name || !email) {
      setStatusMessage('请先填写姓名和邮箱');
      return;
    }
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    setStatusMessage('正在处理签到...');

    try {
      const now = Date.now();

      // 1. Cancel previous email if exists
      if (scheduledEmailId) {
        await cancelScheduledEmail(apiKey, scheduledEmailId);
      }

      // 2. Schedule new email
      const newEmailId = await scheduleEmergencyEmail(apiKey, email, name, now);

      // 3. Update State
      setLastCheckIn(now);
      setScheduledEmailId(newEmailId);
      setStatusMessage('签到成功！已重置 48 小时倒计时');

      // Clear success message after 3 seconds
      setTimeout(() => setStatusMessage(''), 3000);

    } catch (error: any) {
      console.error(error);
      setStatusMessage(`Error: ${error.message || '签到失败'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayStatus = () => {
    if (!lastCheckIn) return '从未签到';
    const now = Date.now();
    const diff = now - lastCheckIn;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) return '今日已签到';
    if (hours < 48) return '等待签到';
    return '已超时';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between py-8 px-6 relative font-sans text-gray-800">
      
      {/* Settings Button */}
      <button 
        onClick={() => setShowSettings(true)}
        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Settings size={24} />
      </button>

      {/* Top Section: Inputs */}
      <div className="w-full max-w-xs flex flex-col items-center space-y-8 mt-12">
        
        {/* Name Input */}
        <div className="relative w-full flex items-center justify-center group">
          {isEditingName ? (
            <div className="flex items-center border-b-2 border-emerald-500 pb-1 w-full">
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                className="w-full text-center text-xl text-gray-800 focus:outline-none bg-transparent"
                placeholder="你的名字"
              />
              <button onClick={() => setIsEditingName(false)} className="text-emerald-500 ml-2">
                <Check size={20} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => setIsEditingName(true)}
              className="flex items-center gap-2 text-xl text-gray-300 cursor-pointer hover:text-gray-400 transition-colors"
            >
              <span>{maskName(name)}</span>
              <Edit2 size={16} className="opacity-50" />
            </div>
          )}
        </div>

        {/* Email Input */}
        <div className="relative w-full flex items-center justify-center group">
          {isEditingEmail ? (
            <div className="flex items-center border-b-2 border-emerald-500 pb-1 w-full">
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setIsEditingEmail(false)}
                className="w-full text-center text-lg text-gray-800 focus:outline-none bg-transparent"
                placeholder="紧急联系人邮箱"
              />
              <button onClick={() => setIsEditingEmail(false)} className="text-emerald-500 ml-2">
                <Check size={20} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => setIsEditingEmail(true)}
              className="flex items-center gap-2 text-lg text-gray-300 cursor-pointer hover:text-gray-400 transition-colors"
            >
              <span>{maskEmail(email)}</span>
              <Edit2 size={16} className="opacity-50" />
            </div>
          )}
        </div>

      </div>

      {/* Middle Section: Big Button */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="relative">
            {/* Status Indicator text above button */}
            <div className="absolute -top-12 left-0 right-0 text-center">
                 {statusMessage && (
                    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-in fade-in slide-in-from-bottom-2">
                        {statusMessage}
                    </span>
                 )}
            </div>

            <button
            onClick={handleCheckIn}
            disabled={isLoading}
            className={`
                relative w-64 h-64 rounded-full flex flex-col items-center justify-center
                transition-all duration-500 transform
                ${isLoading ? 'scale-95 opacity-80 cursor-wait' : 'hover:scale-105 active:scale-95'}
                ${getDayStatus() === '已超时' ? 'bg-red-500 shadow-red-200' : 'bg-emerald-400 shadow-emerald-200'}
                shadow-2xl text-white btn-pulse
            `}
            >
            <div className="mb-2">
                {isLoading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                ) : getDayStatus() === '已超时' ? (
                     <AlertTriangle size={64} strokeWidth={1.5} />
                ) : (
                    <Ghost size={64} strokeWidth={1.5} />
                )}
            </div>
            <span className="text-2xl font-bold tracking-wide">
                {isLoading ? '处理中' : '今日签到'}
            </span>
            <span className="text-sm mt-2 opacity-90 font-light">
                {lastCheckIn ? new Date(lastCheckIn).toLocaleDateString() : '尚未开始'}
            </span>
            </button>
        </div>
      </div>

      {/* Bottom Section: Info Card */}
      <div className="w-full max-w-sm mb-12">
        <div className="bg-gray-50 rounded-2xl p-6 flex items-start gap-4 shadow-sm border border-gray-100">
          <div className="text-emerald-500 mt-1 flex-shrink-0">
            <Info size={24} />
          </div>
          <p className="text-sm text-gray-500 leading-relaxed text-justify">
            2 日未签到，系统将以你的名义，在次日邮件通知你的紧急联系人。请确保 API Key 设置正确。
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-6 text-xs text-gray-400 font-medium">
        <a href="#" className="hover:text-emerald-500 transition-colors">签到即同意</a>
        <span className="w-px h-4 bg-gray-200"></span>
        <a href="#" className="hover:text-emerald-500 transition-colors">隐私政策</a>
        <span className="w-px h-4 bg-gray-200"></span>
        <a href="#" className="hover:text-emerald-500 transition-colors">用户协议</a>
      </div>

      {/* Modals */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
    </div>
  );
};

export default App;