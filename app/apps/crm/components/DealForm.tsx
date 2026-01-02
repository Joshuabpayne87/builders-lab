"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createDealAction, updateDealAction } from "../actions";
import { DEAL_STATUSES, DEAL_STAGES, DEFAULT_CURRENCY } from "../constants";
import type { Deal, DealFormData, Contact } from "../types";

interface DealFormProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  deal?: Deal;
  defaultContactId?: string;
  onSuccess?: () => void;
}

export function DealForm({
  isOpen,
  onClose,
  contacts,
  deal,
  defaultContactId,
  onSuccess,
}: DealFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<DealFormData>({
    contact_id: deal?.contact_id || defaultContactId || "",
    title: deal?.title || "",
    description: deal?.description || "",
    value: deal?.value || undefined,
    currency: deal?.currency || DEFAULT_CURRENCY,
    status: deal?.status || "OPEN",
    stage: deal?.stage || "QUALIFICATION",
    expected_close_date: deal?.expected_close_date || "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = deal
        ? await updateDealAction(deal.id, formData)
        : await createDealAction(formData);

      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(result.error || "Failed to save deal");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === "value") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0A0A] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {deal ? "Edit Deal" : "Add Deal"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Deal Information */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Deal Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  Contact <span className="text-red-400">*</span>
                </label>
                <select
                  name="contact_id"
                  value={formData.contact_id}
                  onChange={handleChange}
                  required
                  disabled={!!defaultContactId}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20 disabled:opacity-50"
                >
                  <option value="" className="bg-[#0A0A0A]">Select a contact</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id} className="bg-[#0A0A0A]">
                      {contact.name} {contact.company ? `(${contact.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  Deal Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20"
                  placeholder="e.g., Website Redesign Project"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20 resize-none"
                  placeholder="Describe the deal details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Deal Value</label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value || ""}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20"
                    placeholder="10000.00"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-2">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20"
                  >
                    <option value="USD" className="bg-[#0A0A0A]">USD ($)</option>
                    <option value="EUR" className="bg-[#0A0A0A]">EUR (€)</option>
                    <option value="GBP" className="bg-[#0A0A0A]">GBP (£)</option>
                    <option value="CAD" className="bg-[#0A0A0A]">CAD (C$)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Stage */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Status & Stage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  Status <span className="text-red-400">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20"
                >
                  {DEAL_STATUSES.map((status) => (
                    <option key={status.value} value={status.value} className="bg-[#0A0A0A]">
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  Stage <span className="text-red-400">*</span>
                </label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20"
                >
                  {DEAL_STAGES.map((stage) => (
                    <option key={stage.value} value={stage.value} className="bg-[#0A0A0A]">
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-2">Expected Close Date</label>
                <input
                  type="date"
                  name="expected_close_date"
                  value={formData.expected_close_date || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : deal ? "Update Deal" : "Add Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
