import React from 'react';
import { HelpCircle, Search, MessageSquare, Book, FileText, ExternalLink } from 'lucide-react';
import { useTheme } from '@/context/store-admin/ThemeContext';

const HelpCenter = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Hero Section */}
      <div className={`relative p-12 rounded-3xl overflow-hidden text-center ${
        isDark ? 'bg-[#2c3136] border border-slate-700' : 'bg-brand text-white shadow-xl shadow-brand-light'
      }`}>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold">How can we help you?</h2>
          <p className={`text-lg max-w-xl mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-blue-50'}`}>
            Search our knowledge base or get in touch with our team.
          </p>
          <div className="max-w-2xl mx-auto mt-8 relative">
            <input 
              type="text" 
              placeholder="Search for answers..." 
              className={`w-full py-4 pl-12 pr-6 rounded-2xl text-slate-800 shadow-xl outline-none focus:ring-4 focus:ring-white/20 transition-all ${
                isDark ? 'bg-[#212529] text-white border-slate-600' : 'bg-white'
              }`}
            />
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HelpCard icon={<Book size={24} />} title="Documentation" desc="Detailed guides on using the dashboard." isDark={isDark} />
        <HelpCard icon={<FileText size={24} />} title="API Reference" desc="Connect your systems via our API." isDark={isDark} />
        <HelpCard icon={<MessageSquare size={24} />} title="Community" desc="Join the community for tips and tricks." isDark={isDark} />
      </div>

      {/* FAQ Placeholder */}
      <div className={`p-8 rounded-2xl border ${isDark ? 'bg-[#212529] border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <h4 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Frequently Asked Questions</h4>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`p-4 rounded-xl border ${isDark ? 'border-slate-700' : 'border-slate-100 hover:bg-slate-50'} cursor-pointer group`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>How do I export my monthly revenue reports?</p>
                <ExternalLink size={16} className="text-slate-300 group-hover:text-brand transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HelpCard = ({ icon, title, desc, isDark }) => (
  <div className={`p-8 rounded-2xl border transition-all hover:-translate-y-1 ${
    isDark ? 'bg-[#2c3136] border-slate-700 hover:border-brand/50' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
  }`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-brand ${isDark ? 'bg-brand/10' : 'bg-brand-light'}`}>
      {icon}
    </div>
    <h5 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h5>
    <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
  </div>
);

export default HelpCenter;
