"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const APPS = [
  { name: "Unravel", currentImage: "/app-cards/unravel.png" },
  { name: "Serendipity", currentImage: "/app-cards/serendipity.png" },
  { name: "PromptStash", currentImage: "/app-cards/promptstash.png" },
  { name: "InsightLens", currentImage: "/app-cards/insightlens.png" },
  { name: "Banana Blitz", currentImage: "/app-cards/banana-blitz.png" },
  { name: "ComponentStudio", currentImage: "/app-cards/component-studio.png" },
];

const IMAGE_FILES = [
  "/app-cards/unravel.png",
  "/app-cards/serendipity.png",
  "/app-cards/promptstash.png",
  "/app-cards/insightlens.png",
  "/app-cards/banana-blitz.png",
  "/app-cards/component-studio.png",
];

export default function ReorderImagesPage() {
  const [mappings, setMappings] = useState(
    APPS.reduce((acc, app) => ({ ...acc, [app.name]: app.currentImage }), {} as Record<string, string>)
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = (appName: string, newImage: string) => {
    setMappings({ ...mappings, [appName]: newImage });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      // Copy mappings to clipboard
      const mappingsText = JSON.stringify(mappings, null, 2);
      await navigator.clipboard.writeText(mappingsText);
      setMessage("✓ Mappings copied to clipboard! Paste them in chat with Claude and he'll apply them.");
    } catch (error) {
      setMessage("✗ Failed to copy to clipboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>

        <h1 className="text-3xl font-bold mb-2">Reorder App Card Images</h1>
        <p className="text-slate-400 mb-8">
          Assign the correct image file to each app
        </p>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes("✓") ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
            {message}
          </div>
        )}

        <div className="space-y-6 mb-8">
          {APPS.map((app) => (
            <div
              key={app.name}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: App Name & Current Image */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">{app.name}</h3>
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-white/10">
                    <Image
                      src={mappings[app.name]}
                      alt={`${app.name} preview`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Right: Image Selector */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Select correct image file:
                  </label>
                  <select
                    value={mappings[app.name]}
                    onChange={(e) => handleImageChange(app.name, e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    {IMAGE_FILES.map((file) => (
                      <option key={file} value={file} className="bg-black">
                        {file.replace("/app-cards/", "")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-6 py-4 bg-white text-black hover:bg-white/90 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Image Mappings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
