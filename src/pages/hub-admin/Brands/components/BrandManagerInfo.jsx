import React from 'react';
import { User, Mail, Phone, BadgeCheck } from 'lucide-react';

const BrandManagerInfo = ({ manager, brandName = '' }) => {
    // Dynamically update email based on brand name for a 'particular' feel
    const dynamicEmail = brandName 
        ? `rajesh.kumar@${brandName.toLowerCase().replace(/\s+/g, '')}.com` 
        : manager.email;

    return (
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-2 mb-6">
                <User size={16} className="text-slate-400" />
                <h6 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Brand Manager Details
                </h6>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Manager</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{manager.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                        <Mail size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Email</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{dynamicEmail}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500">
                        <Phone size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Phone</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{manager.phone}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandManagerInfo;
