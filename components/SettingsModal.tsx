import React from 'react';
import { X, Github, Key, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKey, setApiKey }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">设置</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* API Key Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Key size={16} /> Resend API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="re_12345678..."
              className="w-full px-4 py-2 text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500">
              用于发送紧急邮件。Key 仅保存在本地浏览器中。
            </p>
          </div>

          {/* Project Info */}
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <h3 className="text-emerald-800 font-medium mb-2 flex items-center gap-2">
              <AlertCircle size={16} /> 关于 Alive
            </h3>
            <p className="text-sm text-emerald-700 leading-relaxed">
              这是一个"数字死人开关"。如果你在 48 小时内没有签到，系统会自动通过 Resend 向你的紧急联系人发送求助邮件。
            </p>
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com/Amery2010/alive"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full p-3 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all"
          >
            <Github size={18} />
            Check out on GitHub
          </a>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;