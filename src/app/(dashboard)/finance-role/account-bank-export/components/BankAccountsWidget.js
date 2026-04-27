"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Building2, CheckCircle2, AlertCircle, Loader2, Plus } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function BankAccountsWidget({ refreshKey = 0, onAccountAdded }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountType: "SALARY",
    ifscCode: "",
    branchName: "",
    accountHolderName: "",
    balance: "",
    isDefault: false
  });

  const loadBankAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/finance-role/account-bank-export/bank-accounts");
      const payload = response.data?.data || response.data || {};
      setData({
        accounts: payload.accounts || [],
        totalAccounts: payload.totalAccounts ?? payload.accounts?.length ?? 0,
        activeAccounts: payload.activeAccounts ?? payload.accounts?.filter((acc) => acc.status === "active").length ?? 0
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load bank accounts");
      setData({ accounts: [], totalAccounts: 0, activeAccounts: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBankAccounts();
  }, [loadBankAccounts, refreshKey]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 h-full flex items-center justify-center premium-shadow"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </motion.div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const resetForm = () => {
    setFormData({
      bankName: "",
      accountNumber: "",
      accountType: "SALARY",
      ifscCode: "",
      branchName: "",
      accountHolderName: "",
      balance: "",
      isDefault: false
    });
    setFormError("");
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      setFormError("");
      await apiClient.post("/finance-role/account-bank-export/bank-accounts", {
        bankName: formData.bankName.trim(),
        accountNumber: formData.accountNumber.trim(),
        accountType: formData.accountType,
        ifscCode: formData.ifscCode.trim().toUpperCase(),
        branchName: formData.branchName.trim() || undefined,
        accountHolderName: formData.accountHolderName.trim(),
        balance: formData.balance === "" ? undefined : Number(formData.balance),
        isDefault: formData.isDefault
      });
      await loadBankAccounts();
      if (onAccountAdded) {
        onAccountAdded();
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to add bank account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const accounts = data?.accounts || [];
  const totalAccounts = data?.totalAccounts ?? accounts.length;
  const activeAccounts = data?.activeAccounts ?? accounts.filter((acc) => acc.status === "active").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="glass-card glass-card-hover rounded-2xl p-6 h-full premium-shadow premium-shadow-hover relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-primary/10"></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between mb-6 relative z-10"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-md border border-primary/10"
          >
            <Building2 className="w-6 h-6" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Bank Accounts</h3>
            <p className="text-sm text-muted-foreground">
              {activeAccounts} active of {totalAccounts} total
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          title="Add Account"
          onClick={handleOpenModal}
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3 relative z-10">
        {accounts.length === 0 && !error ? (
          <div className="rounded-xl border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
            No bank accounts added yet.
          </div>
        ) : (
          accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`p-4 rounded-xl border-2 transition-all ${account.isDefault
                ? "bg-primary/5 border-primary/30"
                : account.status === "active"
                  ? "bg-muted/30 border-border hover:bg-muted/50"
                  : "bg-muted/20 border-border opacity-60"
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-foreground">{account.bankName}</h4>
                    {account.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                        Default
                      </span>
                    )}
                    {account.status === "active" ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {account.accountType} • {account.accountNumberMasked || account.accountNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    IFSC: {account.ifscCode} • {account.branchName || "-"}
                  </p>
                </div>
              </div>
              {account.status === "active" && account.balance > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Add Bank Account</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Securely store bank details for exports.</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
              {formError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-900 dark:text-white">Bank Name</label>
                    <input
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-900 dark:text-white">Account Number</label>
                    <input
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-900 dark:text-white">Account Type</label>
                    <select
                      value={formData.accountType}
                      onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    >
                      <option value="SALARY">Salary</option>
                      <option value="SAVINGS">Savings</option>
                      <option value="CURRENT">Current</option>
                      <option value="NRE">NRE</option>
                      <option value="NRO">NRO</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-900 dark:text-white">IFSC Code</label>
                    <input
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase().replace(/\s+/g, "") })}
                      minLength={10}
                      maxLength={11}
                      placeholder="e.g. HDFC0123456"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm uppercase text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-900 dark:text-white">Account Holder</label>
                    <input
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-900 dark:text-white">Branch Name</label>
                    <input
                      value={formData.branchName}
                      onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-900 dark:text-white">Balance</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      id="isDefaultAccount"
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label htmlFor="isDefaultAccount" className="text-sm text-gray-700 dark:text-gray-300">
                      Set as default
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-60"
                  >
                    {isSubmitting ? "Saving..." : "Save Account"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </motion.div>
  );
}
