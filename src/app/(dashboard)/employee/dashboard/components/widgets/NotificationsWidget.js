"use client";
import { Bell, CheckCircle, Info } from 'lucide-react';

export default function NotificationsWidget({ data }) {
    if (!data) return <div className="animate-pulse h-full bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-primary-100/50 dark:border-gray-700 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl">
                    <Bell size={18} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2.5">
                {data.length > 0 ? (
                    data.map((notif, idx) => (
                        <div key={idx} className="flex gap-3 p-3 bg-primary-50/30 dark:bg-primary-500/5 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-all duration-200 border border-primary-100/50 dark:border-primary-500/20">
                            <div className="mt-0.5 flex-shrink-0">
                                {notif.type === 'announcement' ? (
                                    <div className="p-1.5 bg-primary-100 dark:bg-primary-500/20 rounded-lg">
                                        <Info size={14} className="text-primary-600 dark:text-primary-400" />
                                    </div>
                                ) : (
                                    <div className="p-1.5 bg-primary-100 dark:bg-primary-500/20 rounded-lg">
                                        <CheckCircle size={14} className="text-primary-600 dark:text-primary-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">{notif.title}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{notif.message}</p>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 block">{notif.time}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
                        <Bell size={32} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p>No new notifications</p>
                    </div>
                )}
            </div>
        </div>
    );
}
