"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createActivityAction, updateActivityAction } from "../actions";
import { ACTIVITY_TYPES } from "../constants";
import type { Activity, ActivityFormData, Contact } from "../types";

interface ActivityFormProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  activity?: Activity;
  defaultContactId?: string;
  onSuccess?: () => void;
}

export function ActivityForm({
  isOpen,
  onClose,
  contacts,
  activity,
  defaultContactId,
  onSuccess,
}: ActivityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ActivityFormData>({
    contact_id: activity?.contact_id || defaultContactId || "",
    activity_type: activity?.activity_type || "NOTE",
    title: activity?.title || "",
    description: activity?.description || "",
    completed: activity?.completed || false,
    due_date: activity?.due_date || "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = activity
        ? await updateActivityAction(activity.id, formData)
        : await createActivityAction(formData);

      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(result.error || "Failed to save activity");
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

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
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
            {activity ? "Edit Activity" : "Add Activity"}
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

          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Activity Details</h3>
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
                  Activity Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="activity_type"
                  value={formData.activity_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20"
                >
                  {ACTIVITY_TYPES.map((type) => (
                    <option key={type.value} value={type.value} className="bg-[#0A0A0A]">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20"
                  placeholder="e.g., Follow-up call about proposal"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/20 resize-none"
                  placeholder="Add details about this activity..."
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  name="due_date"
                  value={formData.due_date ? formData.due_date.slice(0, 16) : ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="completed"
                  name="completed"
                  checked={formData.completed}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-white focus:ring-white/20"
                />
                <label htmlFor="completed" className="text-sm text-slate-400">
                  Mark as completed
                </label>
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
              {isSubmitting ? "Saving..." : activity ? "Update Activity" : "Add Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
