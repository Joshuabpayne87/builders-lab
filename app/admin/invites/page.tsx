"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Copy,
  Check,
  Trash2,
  Mail,
  Calendar,
  UserCheck,
  UserX,
} from "lucide-react";

interface Invite {
  id: string;
  code: string;
  email: string | null;
  used: boolean;
  created_at: string;
  expires_at: string | null;
  used_by: string | null;
}

export default function AdminInvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [email, setEmail] = useState("");
  const [count, setCount] = useState(1);
  const [expiryDays, setExpiryDays] = useState(30);
  const [copiedCode, setCopiedCode] = useState("");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAdminAndLoadInvites();
  }, []);

  const checkAdminAndLoadInvites = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Check if user is admin
    const isUserAdmin = user.user_metadata?.is_admin === true;
    setIsAdmin(isUserAdmin);

    if (!isUserAdmin) {
      router.push("/dashboard");
      return;
    }

    loadInvites();
  };

  const loadInvites = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bl_invites")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setInvites(data);
    }
    setLoading(false);
  };

  const generateInvites = async () => {
    setGenerating(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      const newInvites = [];
      for (let i = 0; i < count; i++) {
        const code = generateInviteCode();
        newInvites.push({
          code,
          email: email || null,
          expires_at: expiresAt.toISOString(),
          created_by: user.id,
        });
      }

      const { error } = await supabase.from("bl_invites").insert(newInvites);

      if (!error) {
        loadInvites();
        setEmail("");
        setCount(1);
      }
    } catch (err) {
      console.error("Failed to generate invites:", err);
    } finally {
      setGenerating(false);
    }
  };

  const generateInviteCode = () => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += "-";
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/auth/signup?invite=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const deleteInvite = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invite?")) return;

    await supabase.from("bl_invites").delete().eq("id", id);
    loadInvites();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Invite Management</h1>
          <div className="w-32" />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Generate Invites */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Generate New Invites
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Leave blank for general invite
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Number of Invites
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Expires In (Days)
              </label>
              <input
                type="number"
                value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value) || 30)}
                min="1"
                max="365"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            onClick={generateInvites}
            disabled={generating}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            {generating ? "Generating..." : `Generate ${count} Invite${count > 1 ? "s" : ""}`}
          </button>
        </div>

        {/* Invites List */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">All Invites</h2>
            <div className="text-sm text-slate-400">
              {invites.filter((i) => !i.used).length} unused /{" "}
              {invites.filter((i) => i.used).length} used
            </div>
          </div>

          <div className="space-y-3">
            {invites.map((invite) => {
              const isExpired =
                invite.expires_at && new Date(invite.expires_at) < new Date();

              return (
                <div
                  key={invite.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    invite.used
                      ? "bg-green-500/5 border-green-500/20"
                      : isExpired
                      ? "bg-red-500/5 border-red-500/20"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-white font-mono font-bold">
                        {invite.code}
                      </code>
                      {invite.used ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                          <UserCheck className="w-3 h-3" />
                          Used
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded">
                          <UserX className="w-3 h-3" />
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      {invite.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {invite.email}
                        </span>
                      )}
                      {invite.expires_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expires {new Date(invite.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!invite.used && !isExpired && (
                      <button
                        onClick={() => copyInviteLink(invite.code)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        {copiedCode === invite.code ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Link
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => deleteInvite(invite.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {invites.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                No invites yet. Generate some above!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
