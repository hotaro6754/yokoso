"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Download,
    ExternalLink,
    LogOut,
    UserCircle,
    Clock,
    Briefcase,
    ShieldCheck,
    CreditCard,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function AlumniDashboardPage() {
    const [activeCategory, setActiveCategory] = useState("FINANCIAL"); // FINANCIAL, CAREER
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('alumni_token');
        if (!token) {
            router.push('/alumni/login');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/alumni/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                } else {
                    toast.error(result.message || "Failed to fetch data");
                    if (response.status === 401) {
                        localStorage.removeItem('alumni_token');
                        router.push('/alumni/login');
                    }
                }
            } catch (error) {
                console.error("Fetch error:", error);
                toast.error("An error occurred while fetching dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('alumni_token');
        localStorage.removeItem('alumni_user');
        router.push('/alumni/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
            </div>
        );
    }

    if (!data) return null;

    const { profile, documents } = data;
    const filteredDocs = documents.filter(doc => doc.category === activeCategory);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-brand-500" />
                        <h1 className="text-xl font-bold tracking-tight">Portal</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <UserCircle className="w-5 h-5 text-gray-500" />
                            <span className="text-sm font-semibold">{profile.name}</span>
                        </div>
                        <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-[2rem] p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 space-y-2">
                        <h2 className="text-4xl font-black">Welcome Back, {profile.name.split(' ')[0]}!</h2>
                        <p className="text-brand-100 max-w-xl text-lg font-medium opacity-80">
                            {profile.type === 'CANDIDATE'
                                ? "We're excited to have you on board. Here are your onboarding documents."
                                : "Though you've moved to new horizons, your professional records at Zodeck are always within reach."
                            }
                        </p>
                        <div className="pt-6 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">Joined: {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'TBD'}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                                <Briefcase className="w-4 h-4" />
                                <span className="text-sm">{profile.jobTitle || profile.designation || 'Selected Candidate'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 opacity-10">
                        <UserCircle className="w-80 h-80" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    {/* Sidebar Controls */}
                    <div className="lg:col-span-1 space-y-2">
                        {[
                            { id: "FINANCIAL", label: "F&F & Payslips", icon: CreditCard, count: documents.filter(d => d.category === 'FINANCIAL').length },
                            { id: "REFERRAL", label: "Refer a Friend", icon: UserCircle, count: 0 },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`w-full flex justify-between items-center p-4 rounded-2xl transition-all ${activeCategory === cat.id ? "bg-white dark:bg-gray-800 shadow-xl shadow-brand-500/5 text-brand-500 ring-1 ring-gray-100 dark:ring-gray-700" : "hover:bg-gray-200/50 dark:hover:bg-gray-800/30 text-gray-500"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <cat.icon className="w-5 h-5" />
                                    <span className="font-bold">{cat.label}</span>
                                </div>
                                {cat.count > 0 && <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg text-xs font-bold">{cat.count}</span>}
                            </button>
                        ))}
                    </div>

                    {/* List area */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 italic">Available Documents</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeCategory === 'FINANCIAL' ? (
                                filteredDocs.length > 0 ? (
                                    filteredDocs.map((doc, i) => (
                                        <div key={i} className="group bg-white dark:bg-gray-900 p-6 rounded-3xl border dark:border-gray-800 hover:shadow-2xl hover:shadow-brand-500/5 transition-all flex flex-col justify-between">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl text-brand-600">
                                                    <CreditCard className="w-6 h-6" />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 border px-2 py-1 rounded-full uppercase tracking-tighter">{new Date(doc.date).toLocaleDateString()}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg mb-1">{doc.title}</h4>
                                                <p className="text-xs text-gray-400 mb-6">{doc.size} • PDF Document</p>
                                                <div className="flex gap-2">
                                                    <a
                                                        href={doc.url?.startsWith('http') ? doc.url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${doc.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-brand-500 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 hover:shadow-lg"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-20 text-center text-gray-400 italic">No financial records found.</div>
                                )
                            ) : (
                                <div className="col-span-2 bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border-2 border-dashed dark:border-gray-800 text-center space-y-4">
                                    <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/20 rounded-full flex items-center justify-center mx-auto text-brand-500">
                                        <UserCircle className="w-10 h-10" />
                                    </div>
                                    <h4 className="text-xl font-bold">Refer a Friend</h4>
                                    <p className="text-gray-500 text-sm max-w-sm mx-auto">Know someone who would be a great fit for Zodeck? Refer them and help us grow our amazing community!</p>
                                    <button className="px-8 py-3 bg-brand-500 text-white rounded-xl font-bold shadow-lg hover:bg-brand-600 transition-all">
                                        Submit Referral
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
