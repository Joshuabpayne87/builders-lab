"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Briefcase,
  Users,
  Activity,
  Search,
  Filter,
  Mail,
  Phone,
  Building,
  DollarSign,
  Calendar,
} from "lucide-react";

interface Contact {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  contact_type: string;
  status: string;
  created_at: string;
}

interface Deal {
  id: string;
  user_id: string;
  title: string;
  value: number;
  status: string;
  stage: string;
  created_at: string;
  contact?: Contact;
}

type CRMView = "contacts" | "deals" | "activities";

export default function CRMManager() {
  const supabase = createClient();
  const [currentView, setCurrentView] = useState<CRMView>("contacts");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (currentView === "contacts") {
      fetchContacts();
    } else if (currentView === "deals") {
      fetchDeals();
    }
  }, [currentView]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bl_crm_contacts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bl_crm_deals")
        .select(`
          *,
          contact:bl_crm_contacts(name, email, company)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDeals = deals.filter((deal) =>
    deal.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const views = [
    { id: "contacts", label: "Contacts", icon: Users, count: contacts.length },
    { id: "deals", label: "Deals", icon: Briefcase, count: deals.length },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="w-6 h-6" />
              CRM Manager
            </h2>
            <p className="text-slate-400 text-sm mt-1">View and manage all CRM data</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-6">
          {views.map((view) => {
            const Icon = view.icon;
            const isActive = currentView === view.id;
            return (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id as CRMView)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-white text-black"
                    : "bg-white/5 hover:bg-white/10 border border-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                {view.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  isActive ? "bg-black/10" : "bg-white/10"
                }`}>
                  {view.count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Contacts View */}
            {currentView === "contacts" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Phone</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold">
                                {contact.name?.[0]?.toUpperCase() || "U"}
                              </span>
                            </div>
                            <span className="font-medium">{contact.name || "No name"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Mail className="w-4 h-4 text-slate-500" />
                            {contact.email || "-"}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Phone className="w-4 h-4 text-slate-500" />
                            {contact.phone || "-"}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Building className="w-4 h-4 text-slate-500" />
                            {contact.company || "-"}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs font-semibold text-blue-300">
                            {contact.contact_type}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                            contact.status === "ACTIVE"
                              ? "bg-green-500/20 border border-green-500/30 text-green-300"
                              : "bg-slate-500/20 border border-slate-500/30 text-slate-300"
                          }`}>
                            {contact.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-400">
                          {new Date(contact.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredContacts.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No contacts found</p>
                  </div>
                )}
              </div>
            )}

            {/* Deals View */}
            {currentView === "deals" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Contact</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Value</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Stage</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeals.map((deal) => (
                      <tr key={deal.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 font-medium">{deal.title}</td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {(deal.contact as any)?.name || "No contact"}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
                            <DollarSign className="w-4 h-4" />
                            {deal.value?.toLocaleString() || "0"}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs font-semibold text-purple-300">
                            {deal.stage}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                            deal.status === "WON"
                              ? "bg-green-500/20 border border-green-500/30 text-green-300"
                              : deal.status === "LOST"
                              ? "bg-red-500/20 border border-red-500/30 text-red-300"
                              : "bg-blue-500/20 border border-blue-500/30 text-blue-300"
                          }`}>
                            {deal.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-400">
                          {new Date(deal.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredDeals.length === 0 && (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No deals found</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
