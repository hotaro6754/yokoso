'use client';

import React, { useState, useEffect } from 'react';
import { subscriptionService } from '@/services/company-admin-services/subscription.service';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  ShieldCheck, 
  Users,
  Zap,
  History,
  ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Script from 'next/script';


// --- Sub-Components ---

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    EXPIRED: 'bg-gray-100 text-gray-700 border-gray-200',
    CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    TRIAL: 'bg-blue-100 text-blue-700 border-blue-200',
    PAST_DUE: 'bg-orange-100 text-orange-700 border-orange-200'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status] || styles.EXPIRED}`}>
      {status}
    </span>
  );
};

const PlanFeatures = ({ features }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 h-full">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
      <Zap className="text-primary-500" size={20} />
      Plan Features
    </h3>
    <ul className="space-y-3">
      {features?.map((feature, idx) => (
        <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
          <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

const SubscriptionCard = ({ data }) => {
  if (!data) return null;

  const endDate = new Date(data.endDate);
  const now = new Date();
  const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="bg-transparent dark:bg-transparent rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 text-gray-900 dark:text-[#E0E2FE] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-32 bg-transparent opacity-0 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div>
          <p className="text-gray-500 dark:text-[#BBBDEC] text-sm font-medium mb-1">Current Plan</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-[#E0E2FE]">{data.planName}</h2>
        </div>
        <StatusBadge status={data.status} />
      </div>

      <div className="grid grid-cols-2 gap-6 relative z-10 mb-6">
        <div>
          <p className="text-gray-500 dark:text-[#BBBDEC] text-xs uppercase tracking-wider font-semibold mb-1">Billing Cycle</p>
          <p className="text-lg font-medium text-gray-900 dark:text-[#E0E2FE] capitalize">{data.billingCycle}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-[#BBBDEC] text-xs uppercase tracking-wider font-semibold mb-1">Renewal Price</p>
          <p className="text-lg font-medium text-gray-900 dark:text-[#E0E2FE]">
             {new Intl.NumberFormat('en-IN', { style: 'currency', currency: data.currency || 'INR' }).format(data.price || 0)}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-[#BBBDEC] text-xs uppercase tracking-wider font-semibold mb-1">Start Date</p>
          <p className="text-sm border-b border-gray-200 dark:border-[rgba(187,189,236,0.35)] pb-1 inline-block text-gray-900 dark:text-[#E0E2FE]">
            {new Date(data.startDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-[#BBBDEC] text-xs uppercase tracking-wider font-semibold mb-1">Renews On</p>
          <p className="text-sm border-b border-gray-200 dark:border-[rgba(187,189,236,0.35)] pb-1 inline-block text-gray-900 dark:text-[#E0E2FE]">
            {new Date(data.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-[rgba(187,189,236,0.08)] rounded-xl p-3 flex items-center justify-between relative z-10 border border-gray-100 dark:border-[rgba(187,189,236,0.18)]">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-gray-500 dark:text-[#BBBDEC]" />
          <span className="text-sm font-medium text-gray-700 dark:text-[#E0E2FE]">Time Remaining</span>
        </div>
        <span className="text-lg font-bold text-gray-900 dark:text-[#E0E2FE]">{daysRemaining} Days</span>
      </div>
    </div>
  );
};

import { useRouter } from 'next/navigation';

// ... (Sub-components) ...

const UsageStats = ({ data }) => {
  const router = useRouter();
  if (!data) return null;
  
  const percentage = Math.min(100, Math.round((data.currentUsers / data.maxUsers) * 100));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Users className="text-blue-500" size={20} />
          Usage Statistics
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Active Users</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {data.currentUsers} / {data.maxUsers}
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${percentage > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            {percentage > 90 && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertTriangle size={10} /> Approaching limit
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button 
          onClick={() => router.push('/company-admin/users')}
          className="w-full py-2 px-4 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Manage Users
        </button>
      </div>
    </div>
  );
};

const HistoryTable = ({ history }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mt-6">
    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <History size={18} className="text-gray-400" />
        Subscription History
      </h3>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left table-fixed">
        <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-900/50 uppercase border-b border-gray-100 dark:border-gray-700">
          <tr>
            <th className="px-6 py-3">Plan</th>
            <th className="px-6 py-3">Start Date</th>
            <th className="px-6 py-3">End Date</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {history?.map((item, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.planName}</td>
              <td className="px-6 py-4 text-gray-500">{new Date(item.startDate).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-gray-500">{new Date(item.endDate).toLocaleDateString()}</td>
              <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                 {new Intl.NumberFormat('en-IN', { style: 'currency', currency: item.currency || 'INR' }).format(item.amount || 0)}
              </td>
              <td className="px-6 py-4 text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm border
                  ${item.status === 'ACTIVE' || item.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
          {(!history || history.length === 0) && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                No history available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default function SubscriptionPage() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'plans'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const isSubscriptionActive = data?.status === 'ACTIVE' || data?.status === 'Active';

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      setSdkLoaded(true);
    }
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        setSdkLoaded(true);
        resolve(true);
        return;
      }
      
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          setSdkLoaded(true);
          resolve(true);
        });
        existingScript.addEventListener('error', () => resolve(false));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        setSdkLoaded(true);
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;

    if (typeof window.Razorpay === 'undefined') {
      toast.loading("Loading payment gateway...", { id: 'sdk-loading' });
      const isLoaded = await loadRazorpay();
      toast.dismiss('sdk-loading');
      
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load. Please check your connection or disable ad-blockers.");
        return;
      }
    }

    try {
      setCheckoutLoading(true);
      const order = await subscriptionService.createRazorpayOrder(selectedPlan.id);
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Zodeck",
        description: `Subscription for ${selectedPlan.name}`,
        order_id: order.orderId,
        handler: async function (response) {
          try {
            toast.loading("Verifying payment...", { id: 'verify-payment' });
             await subscriptionService.verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              planId: selectedPlan.id
            });
            
            toast.dismiss('verify-payment');
            toast.success("Subscription activated successfully!");
            setCheckoutSuccess(true);
            setSelectedPlan(null);
            
            // Refresh details
            try {
                const refreshedDetails = await subscriptionService.getSubscriptionDetails();
                const refreshedHistory = await subscriptionService.getSubscriptionHistory();
                setData(refreshedDetails);
                setHistory(refreshedHistory);
                setActiveTab('overview');
            } catch (fetchErr) {
                console.error("Failed to refresh after payment:", fetchErr);
            }
            
            setTimeout(() => setCheckoutSuccess(false), 5000);
          } catch (err) {
            toast.dismiss('verify-payment');
            toast.error(err.message || "Payment verification failed");
          } finally {
            setCheckoutLoading(false);
          }
        },
        prefill: {
          name: data?.ownerName || "",
          email: data?.ownerEmail || "",
          contact: data?.ownerPhone || "",
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: function() {
            setCheckoutLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
         toast.error(response.error.description || "Payment failed");
         setCheckoutLoading(false);
      });
      rzp.open();
      
    } catch (err) {
      toast.error(err.message || "Failed to initiate payment");
      setCheckoutLoading(false);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [details, historyData, plansData] = await Promise.all([
          subscriptionService.getSubscriptionDetails(),
          subscriptionService.getSubscriptionHistory(),
          subscriptionService.getAvailablePlans()
        ]);
        setData(details);
        setHistory(historyData);
        setAvailablePlans(plansData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-transparent p-6">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-2xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-transparent p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 text-red-600 p-3 rounded-full inline-block mb-3">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Failed to load subscription</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-transparent pb-20">
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        onLoad={() => setSdkLoaded(true)}
      />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription & Billing</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your plan, billing details and view invoices.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600 dark:text-primary-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'plans'
                ? 'border-primary-600 text-primary-600 dark:text-primary-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Available Plans
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            {!data || !data.planName ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                  <AlertTriangle size={32} className="text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You don't have any plan</h2>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  It looks like you haven't subscribed to any plan yet. Please select a plan to activate a subscription.
                </p>
                <button 
                  onClick={() => setActiveTab('plans')}
                  className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Explore Plans
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <SubscriptionCard data={data} />
                  </div>
                  <div className="lg:col-span-1">
                    <UsageStats data={data} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="col-span-1">
                    <HistoryTable history={history} />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-8">
            {checkoutSuccess && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 shadow-sm">
                Checkout successfully.
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePlans && availablePlans.length > 0 ? (
                availablePlans.map((plan) => {
                  const isCurrentPlan = isSubscriptionActive && data?.planName === plan.name;
                  
                  return (
                    <div 
                      key={plan.id} 
                      onClick={() => {
                          if (isCurrentPlan) return;
                          setSelectedPlan(plan);
                      }}
                      className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all shadow-sm p-6 flex flex-col ${
                        isCurrentPlan 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 cursor-default'
                          : selectedPlan?.id === plan.id 
                            ? 'border-primary-500 ring-2 ring-primary-500/20 cursor-pointer' 
                            : 'border-gray-100 dark:border-gray-700 hover:border-primary-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{plan.billingCycle} Billing</p>
                        </div>
                        {isCurrentPlan ? (
                          <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 text-xs font-bold rounded-full">
                            Current
                          </span>
                        ) : selectedPlan?.id === plan.id && (
                          <CheckCircle2 className="text-primary-500" size={24} />
                        )}
                      </div>
                    
                    <div className="mb-6">
                      <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: plan.currency || 'INR', minimumFractionDigits: 0 }).format(plan.price || 0)}
                      </span>
                      <span className="text-gray-500"> / {plan.billingCycle}</span>
                    </div>

                    <div className="flex-grow">
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span>Up to {plan.maxUsers || 'Unlimited'} Users</span>
                        </li>
                        {plan.features && (() => {
                          let parsedFeatures = [];
                          try {
                            parsedFeatures = typeof plan.features === 'string' 
                              ? (plan.features.startsWith('[') ? JSON.parse(plan.features) : plan.features.split('\n'))
                              : Array.isArray(plan.features) ? plan.features : [];
                          } catch(e) {}
                          
                          return parsedFeatures.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                              <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ));
                        })()}
                      </ul>
                    </div>

                    <button 
                      disabled={isCurrentPlan}
                      onClick={(e) => {
                          e.stopPropagation();
                          if (isCurrentPlan) return;
                          setSelectedPlan(plan);
                      }}
                      className={`w-full py-2 px-3 text-sm font-medium rounded-md border transition-colors ${
                        isCurrentPlan
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                          : selectedPlan?.id === plan.id
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {isCurrentPlan ? 'Current Plan' : selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                    </button>
                  </div>
                );
              })
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No plans are currently available. Please contact support.
                </div>
              )}
            </div>

            {/* Checkout Action Section */}
            {availablePlans && availablePlans.length > 0 && (
              <div className="mt-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                  <div className={`p-3 rounded-xl transition-colors ${selectedPlan ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedPlan ? `Plan: ${selectedPlan.name}` : 'Select a plan to continue'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {selectedPlan 
                        ? (isSubscriptionActive && data?.planName !== selectedPlan.name)
                          ? (selectedPlan.price - (data?.price || 0) <= 0)
                            ? 'Downgrading to a lower plan is not allowed online.'
                            : `Proceed to upgrade. You will only pay the difference: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: selectedPlan.currency || 'INR' }).format(selectedPlan.price - (data?.price || 0))}`
                          : `Proceed to activate your subscription for ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: selectedPlan.currency || 'INR' }).format(selectedPlan.price)}` 
                        : 'Choose the best plan for your organization needs.'}
                    </p>
                  </div>
                </div>
                
                <button
                  disabled={!selectedPlan || checkoutLoading || (isSubscriptionActive && data?.planName === selectedPlan?.name) || (isSubscriptionActive && (selectedPlan.price - (data?.price || 0) <= 0))}
                  onClick={handleCheckout}
                  className={`min-w-[170px] py-2.5 px-5 rounded-md font-semibold text-sm border transition-colors flex items-center justify-center gap-2 ${
                    !selectedPlan || checkoutLoading || (isSubscriptionActive && data?.planName === selectedPlan?.name) || (isSubscriptionActive && (selectedPlan.price - (data?.price || 0) <= 0))
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-600'
                      : 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {checkoutLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (isSubscriptionActive && selectedPlan && data?.planName === selectedPlan?.name) ? (
                    <>Current Plan Active</>
                  ) : (isSubscriptionActive && selectedPlan && (selectedPlan.price - (data?.price || 0) <= 0)) ? (
                    <>Cannot Downgrade</>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      {isSubscriptionActive ? 'Proceed to Upgrade' : 'Proceed to Checkout'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
