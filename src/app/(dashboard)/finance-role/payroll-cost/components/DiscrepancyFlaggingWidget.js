"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, MessageSquare, Send, Loader2, X, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function DiscrepancyFlaggingWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState({
    category: '',
    description: '',
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchDiscrepancies = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiClient.get("/finance-role/payroll-cost/discrepancies");
        const payload = response.data?.data || null;
        setData(payload);
        setComments(payload?.comments || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load discrepancies");
      } finally {
        setLoading(false);
      }
    };

    fetchDiscrepancies();
  }, []);

  const handleAddComment = async () => {
    if (!newComment.category || !newComment.description.trim()) return;
    try {
      const response = await apiClient.post("/finance-role/payroll-cost/discrepancies", {
        category: newComment.category,
        description: newComment.description
      });
      const created = response.data?.data;
      if (created) {
        setComments((prev) => [created, ...prev]);
      }
      setNewComment({ category: '', description: '' });
      setShowForm(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit discrepancy");
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await apiClient.delete(`/finance-role/payroll-cost/discrepancies/${id}`);
      setComments((prev) => prev.filter((comment) => comment.id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete discrepancy");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 h-full flex items-center justify-center premium-shadow"
      >
        <div className="flex items-center gap-2 text-destructive text-sm font-semibold">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      </motion.div>
    );
  }

  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-2xl p-6 h-full premium-shadow flex items-center justify-center"
      >
        <p className="text-sm text-muted-foreground">No discrepancy data available</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6 premium-shadow relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-warning/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-warning/10"></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between mb-6 relative z-10"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 text-warning shadow-md border border-warning/10"
          >
            <AlertTriangle className="w-6 h-6" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Flag Discrepancies</h3>
            <p className="text-sm text-muted-foreground">Add comments for any issues found (comment only)</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-warning text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add Comment'}
        </motion.button>
      </motion.div>

      <div className="space-y-4 relative z-10">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-warning/10 border border-warning/20"
        >
          <div className="p-2 rounded-lg bg-warning/20 text-warning">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Flagged Discrepancies</p>
            <p className="text-xs text-muted-foreground">
              {comments.length} comment{comments.length !== 1 ? 's' : ''} added
            </p>
          </div>
          <div className="ml-auto">
            <motion.p
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="text-2xl font-extrabold text-warning"
            >
              {comments.length}
            </motion.p>
          </div>
        </motion.div>

        {/* Add Comment Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-muted/30 border border-border"
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Category
                </label>
                <select
                  value={newComment.category}
                  onChange={(e) => setNewComment({ ...newComment, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a category</option>
                  {(data.categories || []).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Description
                </label>
                <textarea
                  value={newComment.description}
                  onChange={(e) => setNewComment({ ...newComment, description: e.target.value })}
                  placeholder="Describe the discrepancy in detail..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddComment}
                disabled={!newComment.category || !newComment.description.trim()}
                className="w-full px-4 py-2 bg-warning text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Submit Comment
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3">Flagged Comments</h4>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors relative group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 rounded-full bg-warning/20 text-warning text-xs font-semibold">
                        {comment.category}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                        {comment.status}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mb-2">{comment.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(comment.timestamp)}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-8 text-muted-foreground"
          >
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No discrepancies flagged yet</p>
            <p className="text-xs mt-1">Click "Add Comment" to flag any issues</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
