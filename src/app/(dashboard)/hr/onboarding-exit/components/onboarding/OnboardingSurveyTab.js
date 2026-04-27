"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Loader2, Save, Plus } from "lucide-react";
import { onboardingExitService } from "@/services/hr-services/onboarding-exit.service";
import { toast } from "react-hot-toast";
import DatePickerField from "@/components/form/input/DatePickerField";

export default function OnboardingSurveyTab({ employeeId }) {
  const [surveyData, setSurveyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [formData, setFormData] = useState({
    responses: {},
  });
  const isLockedToEmployee = Boolean(employeeId);
  const [questions, setQuestions] = useState([
    { id: "emergency_contact", label: "Emergency contact", type: "text" },
    { id: "tshirt_size", label: "T-shirt size", type: "dropdown", options: ["XS", "S", "M", "L", "XL"] },
    { id: "bank_details", label: "Bank details", type: "text" },
    { id: "current_address", label: "Current address", type: "text" },
  ]);
  const [newQuestion, setNewQuestion] = useState({
    label: "",
    type: "text",
    options: "",
  });

  useEffect(() => {
    if (isLockedToEmployee && employeeId) {
      setSelectedEmployeeId(employeeId);
      return;
    }
    if (selectedEmployeeId) {
      fetchSurvey();
    }
  }, [selectedEmployeeId, employeeId, isLockedToEmployee]);

  const fetchSurvey = async () => {
    if (!selectedEmployeeId) return;
    try {
      setLoading(true);
      const response = await onboardingExitService.getOnboardingSurvey(selectedEmployeeId);
      const data = response.success ? response.data : response;
      setSurveyData(data);
      if (data.responses) {
        setFormData({ responses: data.responses });
      }
    } catch (error) {
      console.error("Error fetching survey:", error);
      // Don't show error if survey doesn't exist yet
      setSurveyData(null);
      setFormData({ responses: {} });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      responses: {
        ...prev.responses,
        [key]: value,
      },
    }));
  };

  const handleAddQuestion = () => {
    if (!newQuestion.label.trim()) {
      toast.error("Please enter a question label");
      return;
    }
    const id = newQuestion.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    const options = newQuestion.type === "dropdown"
      ? newQuestion.options.split(",").map((opt) => opt.trim()).filter(Boolean)
      : [];
    setQuestions((prev) => [
      ...prev,
      {
        id: id || `question_${prev.length + 1}`,
        label: newQuestion.label.trim(),
        type: newQuestion.type,
        options,
      },
    ]);
    setNewQuestion({ label: "", type: "text", options: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      toast.error("Please select an employee");
      return;
    }
    try {
      setSubmitting(true);
      await onboardingExitService.submitOnboardingSurvey(selectedEmployeeId, formData);
      toast.success("Survey submitted successfully");
      fetchSurvey();
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast.error(error.message || "Failed to submit survey");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isLockedToEmployee && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
          Select an employee from the onboarding dashboard to manage the survey.
        </div>
      )}

      {/* Survey Form */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : selectedEmployeeId ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Onboarding Survey Form
            </h3>
            {surveyData?.submittedAt && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Submitted on: {new Date(surveyData.submittedAt).toLocaleString()}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg border border-dashed border-gray-200 p-4 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Survey Builder
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add custom questions for new joiners (text, dropdown, file, or date).
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                <input
                  type="text"
                  value={newQuestion.label}
                  onChange={(e) => setNewQuestion((prev) => ({ ...prev, label: e.target.value }))}
                  placeholder="Question label"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <select
                  value={newQuestion.type}
                  onChange={(e) => setNewQuestion((prev) => ({ ...prev, type: e.target.value }))}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="text">Text</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="file">File</option>
                  <option value="date">Date</option>
                </select>
                <input
                  type="text"
                  value={newQuestion.options}
                  onChange={(e) => setNewQuestion((prev) => ({ ...prev, options: e.target.value }))}
                  placeholder="Options (comma separated)"
                  disabled={newQuestion.type !== "dropdown"}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {question.label}
                  </label>
                  {question.type === "text" && (
                    <input
                      type="text"
                      value={formData.responses[question.id] || ""}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                    />
                  )}
                  {question.type === "dropdown" && (
                    <select
                      value={formData.responses[question.id] || ""}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select</option>
                      {question.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                  {question.type === "file" && (
                    <input
                      type="file"
                      onChange={(e) => handleInputChange(question.id, e.target.files?.[0]?.name || "")}
                      className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200 dark:text-gray-300 dark:file:bg-gray-700 dark:file:text-gray-200"
                    />
                  )}
                  {question.type === "date" && (
                    <DatePickerField
                      value={formData.responses[question.id] || ""}
                      onChange={(value) => handleInputChange(question.id, value)}
                      className="w-full px-3 py-2"
                      placeholder="Select date"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={submitting || surveyData?.submittedAt}
                className="px-4 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all shadow-sm hover:shadow-md font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {surveyData?.submittedAt ? "Already Submitted" : "Submit Survey"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isLockedToEmployee
              ? "Survey details are not available yet."
              : "Select an employee to view or submit their onboarding survey"}
          </p>
        </div>
      )}
    </div>
  );
}
