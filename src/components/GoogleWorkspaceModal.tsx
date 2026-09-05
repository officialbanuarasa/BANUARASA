import React, { useState, useEffect } from 'react';
import { getSavedGasUrl, saveGasUrl, testGasConnection } from '../services/googleWorkspaceSync';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const [gasUrl, setGasUrl] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGasUrl(getSavedGasUrl());
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveGasUrl(gasUrl);
    setStatusMessage({ type: 'success', text: 'URL Google Apps Script berhasil disimpan.' });
  };

  const handleTest = async () => {
    if (!gasUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Masukkan URL Google Apps Script terlebih dahulu.' });
      return;
    }

    saveGasUrl(gasUrl);
    setIsTesting(true);
    setStatusMessage({ type: 'info', text: 'Menguji komunikasi ke Google Apps Script...' });

    const result = await testGasConnection();
    setIsTesting(false);

    if (result.success) {
      setStatusMessage({ type: 'success', text: 'Terhubung! ' + (result.message || 'Koneksi ke spreadsheet berhasil.') });
    } else {
      setStatusMessage({ type: 'error', text: result.error || 'Gagal menghubungi endpoint Google Apps Script.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h2 className="text-lg font-bold text-slate-800">Integrasi Google Apps Script</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Hubungkan web Banuarasa ke Web App Google Apps Script untuk mencatat transaksi dan reservasi stand langsung ke Google Spreadsheet.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Web App URL (Deployment Akhiran <code>/exec</code>)
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={gasUrl}
              onChange={(e) => setGasUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-500 font-mono"
            />
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Panduan Deployment:</p>
            <p>1. Di Google Apps Script, pilih <strong>Deploy &gt; New deployment</strong>.</p>
            <p>2. Set <em>Execute as:</em> <strong>Me</strong> dan <em>Who has access:</em> <strong>Anyone</strong>.</p>
            <p>3. Salin URL Web App yang berakhiran <code>/exec</code> ke kolom di atas.</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-50"
          >
            {isTesting ? 'Menguji...' : 'Uji Koneksi'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs"
          >
            Simpan URL
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleWorkspaceModal;
