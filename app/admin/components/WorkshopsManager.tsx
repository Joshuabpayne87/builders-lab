"use client";

import { useState, useEffect, useRef } from "react";
import {
  Video,
  Plus,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
  X,
  Upload,
  Loader2,
  Calendar,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import {
  listWorkshops,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  archiveWorkshop,
  restoreWorkshop,
} from "@/lib/workshops-client";
import { uploadFile } from "@/lib/supabase/storage";
import type { Workshop } from "@/lib/workshops-service";

interface WorkshopFormData {
  title: string;
  description: string;
  scheduled_at: string;
  cover_image_url: string;
  meeting_link: string;
}

const initialFormData: WorkshopFormData = {
  title: "",
  description: "",
  scheduled_at: "",
  cover_image_url: "",
  meeting_link: "",
};

export function WorkshopsManager() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [formData, setFormData] = useState<WorkshopFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadWorkshops();
  }, []);

  const loadWorkshops = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await listWorkshops({ includeArchived: true });
      setWorkshops(data);
    } catch (err) {
      console.error("Failed to load workshops:", err);
      setError("Failed to load workshops");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingWorkshop(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      title: workshop.title,
      description: workshop.description || "",
      scheduled_at: formatDateTimeLocal(workshop.scheduled_at),
      cover_image_url: workshop.cover_image_url || "",
      meeting_link: workshop.meeting_link,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWorkshop(null);
    setFormData(initialFormData);
  };

  const formatDateTimeLocal = (isoString: string) => {
    const date = new Date(isoString);
    return date.toISOString().slice(0, 16);
  };

  const formatDisplayDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const result = await uploadFile({
        file,
        bucket: "user-images",
        folder: "workshops",
      });

      if (result.success && result.url) {
        setFormData((prev) => ({ ...prev, cover_image_url: result.url! }));
      } else {
        alert(result.error || "Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.scheduled_at || !formData.meeting_link) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsSaving(true);

      const workshopData = {
        title: formData.title,
        description: formData.description || undefined,
        scheduled_at: new Date(formData.scheduled_at).toISOString(),
        cover_image_url: formData.cover_image_url || undefined,
        meeting_link: formData.meeting_link,
      };

      if (editingWorkshop) {
        await updateWorkshop(editingWorkshop.id, workshopData);
      } else {
        await createWorkshop(workshopData);
      }

      closeModal();
      await loadWorkshops();
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save workshop");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async (workshop: Workshop) => {
    if (!confirm(`Archive "${workshop.title}"?`)) return;

    try {
      await archiveWorkshop(workshop.id);
      await loadWorkshops();
    } catch (err) {
      console.error("Archive error:", err);
      alert("Failed to archive workshop");
    }
  };

  const handleRestore = async (workshop: Workshop) => {
    try {
      await restoreWorkshop(workshop.id);
      await loadWorkshops();
    } catch (err) {
      console.error("Restore error:", err);
      alert("Failed to restore workshop");
    }
  };

  const handleDelete = async (workshop: Workshop) => {
    if (!confirm(`Permanently delete "${workshop.title}"? This cannot be undone.`)) return;

    try {
      await deleteWorkshop(workshop.id);
      await loadWorkshops();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete workshop");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
        <button
          onClick={loadWorkshops}
          className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5 text-white/80" />
          <h2 className="text-lg font-semibold text-white">Workshops</h2>
          <span className="text-sm text-slate-500">({workshops.length})</span>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Workshop
        </button>
      </div>

      {/* Workshops List */}
      {workshops.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <Video className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No workshops yet</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm"
          >
            Create your first workshop
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {workshops.map((workshop) => (
            <div
              key={workshop.id}
              className={`flex items-center gap-4 p-4 bg-white/5 rounded-xl border transition-all ${
                workshop.status === "archived"
                  ? "border-white/5 opacity-60"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Thumbnail */}
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                {workshop.cover_image_url ? (
                  <img
                    src={workshop.cover_image_url}
                    alt={workshop.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-slate-600" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-white truncate">
                    {workshop.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      workshop.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-slate-500/20 text-slate-400"
                    }`}
                  >
                    {workshop.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDisplayDate(workshop.scheduled_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(workshop)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" />
                </button>

                {workshop.status === "active" ? (
                  <button
                    onClick={() => handleArchive(workshop)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4 text-slate-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleRestore(workshop)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Restore"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-400" />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(workshop)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50 bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">
                {editingWorkshop ? "Edit Workshop" : "New Workshop"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-white/30"
                  placeholder="Workshop title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-white/30 resize-none"
                  placeholder="Brief description (optional)"
                  rows={3}
                />
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date & Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, scheduled_at: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                  required
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  Cover Image
                </label>

                {formData.cover_image_url ? (
                  <div className="relative">
                    <img
                      src={formData.cover_image_url}
                      alt="Cover preview"
                      className="w-full h-40 object-cover rounded-lg border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, cover_image_url: "" }))
                      }
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full h-32 border-2 border-dashed border-white/10 hover:border-white/20 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors"
                  >
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-400" />
                        <span className="text-sm text-slate-400">
                          Click to upload cover image
                        </span>
                      </>
                    )}
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Meeting Link */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  Meeting Link <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={formData.meeting_link}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, meeting_link: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-white/30"
                  placeholder="https://zoom.us/j/..."
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-white text-black hover:bg-white/90 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingWorkshop ? (
                    "Update Workshop"
                  ) : (
                    "Create Workshop"
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
