'use client';

import { useState, useEffect } from 'react';
import { 
  Megaphone, Save, Eye, EyeOff, Phone, Mail, 
  Share2, Palette, Check, RefreshCw, AlertCircle, Sparkles 
} from 'lucide-react';

interface AnnouncementSettings {
  id?: number;
  isVisible: boolean;
  message: string;
  showPhone: boolean;
  phoneNumber: string;
  phoneLink: string;
  showEmail: boolean;
  emailAddress: string;
  emailLink: string;
  showSocialIcons: boolean;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  fontSize: 'xs' | 'sm' | 'base';
}

const defaultSettings: AnnouncementSettings = {
  isVisible: true,
  message: 'FREE DELIVERY ON ORDERS ABOVE PKR 5,000',
  showPhone: true,
  phoneNumber: '0333-2265461',
  phoneLink: 'tel:03332265461',
  showEmail: true,
  emailAddress: 'gulscollection@gmail.com',
  emailLink: 'mailto:gulscollection@gmail.com',
  showSocialIcons: true,
  instagramUrl: 'https://instagram.com',
  facebookUrl: 'https://facebook.com',
  tiktokUrl: 'https://tiktok.com',
  youtubeUrl: 'https://youtube.com',
  bgColor: '#0b0f0e',
  textColor: '#F5F5F0',
  accentColor: '#C9A66B',
  fontSize: 'sm',
};

export default function AnnouncementAdminPage() {
  const [settings, setSettings] = useState<AnnouncementSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/announcement');
        if (res.ok) {
          const data = await res.json();
          if (data && data.message !== undefined) {
            setSettings({
              ...defaultSettings,
              ...data,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/announcement', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        const updated = await res.json();
        setSettings((prev) => ({ ...prev, ...updated }));
        setFeedback({ type: 'success', message: 'Announcement bar settings updated successfully!' });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', message: err.error || 'Failed to save changes.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error while saving settings.' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof AnnouncementSettings>(key: K, value: AnnouncementSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const getFontSizeClass = (size: string) => {
    switch (size) {
      case 'xs': return 'text-[11px]';
      case 'base': return 'text-[14px] md:text-[15px]';
      case 'sm':
      default: return 'text-xs md:text-sm';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin text-[#C9A66B] mb-3" />
        <p className="text-sm font-medium">Loading Announcement Bar configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Megaphone className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold font-serif text-gray-900">Announcement Bar Settings</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Control the top ribbon message, contact details, social links, colors, and visibility.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-black text-[#F3E9D7] hover:bg-[#11261d] active:scale-95 text-xs font-semibold rounded-md shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#C9A66B]" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#C9A66B]" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 transition-all ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-sm font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Live Preview Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3.5 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
            <Eye className="w-4 h-4 text-gray-400" />
            <span>Live Storefront Preview</span>
          </div>
          {!settings.isVisible && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
              <EyeOff className="w-3.5 h-3.5" />
              Hidden on store
            </span>
          )}
        </div>

        <div className="p-6 bg-gray-100/60">
          <div className="relative rounded-lg overflow-hidden shadow-md border border-gray-300">
            {settings.isVisible ? (
              <div 
                style={{ 
                  backgroundColor: settings.bgColor, 
                  color: settings.textColor,
                }}
                className={`w-full px-5 py-3 transition-colors ${getFontSizeClass(settings.fontSize)}`}
              >
                <div className="w-full flex items-center justify-between gap-4">
                  {/* Left: Contact */}
                  <div className="hidden md:flex items-center space-x-6 shrink-0">
                    {settings.showPhone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} style={{ color: settings.accentColor }} />
                        <span>{settings.phoneNumber || '0333-2265461'}</span>
                      </div>
                    )}
                    {settings.showEmail && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} style={{ color: settings.accentColor }} />
                        <span>{settings.emailAddress || 'gulscollection@gmail.com'}</span>
                      </div>
                    )}
                    {!settings.showPhone && !settings.showEmail && (
                      <span className="text-xs opacity-40 italic">Contact items hidden</span>
                    )}
                  </div>

                  {/* Center Message */}
                  <div className="w-full md:w-auto text-center font-semibold tracking-[1.5px] uppercase">
                    {settings.message || 'Announcement message goes here'}
                  </div>

                  {/* Right: Socials */}
                  <div className="hidden md:flex items-center space-x-4 shrink-0">
                    {settings.showSocialIcons ? (
                      <>
                        <span className="opacity-70 text-xs">Follow Us:</span>
                        <div className="flex items-center space-x-3" style={{ color: settings.accentColor }}>
                          <span className="text-xs font-bold hover:underline cursor-pointer">IG</span>
                          <span className="text-xs font-bold hover:underline cursor-pointer">FB</span>
                          <span className="text-xs font-bold hover:underline cursor-pointer">TT</span>
                          <span className="text-xs font-bold hover:underline cursor-pointer">YT</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs opacity-40 italic">Socials hidden</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 bg-gray-200/80 text-gray-500 text-center text-sm font-medium">
                The announcement bar is currently toggled <strong>OFF</strong>. It will not appear on the storefront.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Master Visibility & Main Message */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-semibold text-gray-900">Announcement Bar Visibility</h2>
            </div>
            
            {/* Master Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isVisible}
                onChange={(e) => updateSetting('isVisible', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Center Announcement Message
              </label>
              <textarea
                value={settings.message}
                onChange={(e) => updateSetting('message', e.target.value)}
                placeholder="e.g. FREE DELIVERY ON ORDERS ABOVE PKR 5,000"
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A66B] focus:border-[#C9A66B] outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Display seasonal promotions, discounts, or special announcements.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Styling & Appearance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
            <Palette className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-semibold text-gray-900">Styling & Colors</h2>
          </div>

          <div className="space-y-4">
            {/* Background & Text Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.bgColor}
                    onChange={(e) => updateSetting('bgColor', e.target.value)}
                    className="w-9 h-9 p-0.5 rounded border border-gray-300 cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={settings.bgColor}
                    onChange={(e) => updateSetting('bgColor', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-gray-300 rounded-md uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Text Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.textColor}
                    onChange={(e) => updateSetting('textColor', e.target.value)}
                    className="w-9 h-9 p-0.5 rounded border border-gray-300 cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={settings.textColor}
                    onChange={(e) => updateSetting('textColor', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-gray-300 rounded-md uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Accent / Icons
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => updateSetting('accentColor', e.target.value)}
                    className="w-9 h-9 p-0.5 rounded border border-gray-300 cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={settings.accentColor}
                    onChange={(e) => updateSetting('accentColor', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-gray-300 rounded-md uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Font Size Buttons */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Font Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'xs', label: 'Extra Small' },
                  { id: 'sm', label: 'Standard (Small)' },
                  { id: 'base', label: 'Medium' },
                ].map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => updateSetting('fontSize', size.id as 'xs' | 'sm' | 'base')}
                    className={`py-2 px-3 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                      settings.fontSize === size.id
                        ? 'bg-black text-white border-black'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Phone & Email Contact Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
            <Phone className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-semibold text-gray-900">Phone & Email Contact</h2>
          </div>

          {/* Phone Settings */}
          <div className="space-y-3 p-4 bg-gray-50/70 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                <Phone size={14} className="text-gray-500" />
                Phone Number
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showPhone}
                  onChange={(e) => updateSetting('showPhone', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            {settings.showPhone && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Display Label</label>
                  <input
                    type="text"
                    value={settings.phoneNumber}
                    onChange={(e) => updateSetting('phoneNumber', e.target.value)}
                    placeholder="0333-2265461"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Link Target (tel:)</label>
                  <input
                    type="text"
                    value={settings.phoneLink}
                    onChange={(e) => updateSetting('phoneLink', e.target.value)}
                    placeholder="tel:03332265461"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Email Settings */}
          <div className="space-y-3 p-4 bg-gray-50/70 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                <Mail size={14} className="text-gray-500" />
                Email Address
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showEmail}
                  onChange={(e) => updateSetting('showEmail', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            {settings.showEmail && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Display Label</label>
                  <input
                    type="text"
                    value={settings.emailAddress}
                    onChange={(e) => updateSetting('emailAddress', e.target.value)}
                    placeholder="gulscollection@gmail.com"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Link Target (mailto:)</label>
                  <input
                    type="text"
                    value={settings.emailLink}
                    onChange={(e) => updateSetting('emailLink', e.target.value)}
                    placeholder="mailto:gulscollection@gmail.com"
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Social Links */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Share2 className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-semibold text-gray-900">Social Media Links</h2>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showSocialIcons}
                onChange={(e) => updateSetting('showSocialIcons', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>

          {settings.showSocialIcons ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={settings.instagramUrl}
                  onChange={(e) => updateSetting('instagramUrl', e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Facebook URL</label>
                <input
                  type="text"
                  value={settings.facebookUrl}
                  onChange={(e) => updateSetting('facebookUrl', e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">TikTok URL</label>
                <input
                  type="text"
                  value={settings.tiktokUrl}
                  onChange={(e) => updateSetting('tiktokUrl', e.target.value)}
                  placeholder="https://tiktok.com/@..."
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">YouTube URL</label>
                <input
                  type="text"
                  value={settings.youtubeUrl}
                  onChange={(e) => updateSetting('youtubeUrl', e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md"
                />
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-gray-400 bg-gray-50 rounded-lg">
              Social icons are hidden on the announcement bar.
            </div>
          )}
        </div>

      </div>

      {/* Bottom Save Action Bar */}
      <div className="sticky bottom-6 p-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 flex items-center justify-between">
        <span className="text-xs text-gray-500 hidden sm:inline">
          Remember to save changes to publish updates to the live storefront.
        </span>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => setSettings(defaultSettings)}
            type="button"
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-black text-[#F3E9D7] hover:bg-[#11261d] active:scale-95 text-xs font-semibold rounded-md shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C9A66B]" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-[#C9A66B]" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

