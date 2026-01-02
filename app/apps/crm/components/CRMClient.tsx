"use client";

import { useState, useMemo } from "react";
import { Plus, Users, Briefcase, DollarSign, Activity } from "lucide-react";
import Link from "next/link";
import { ContactForm } from "./ContactForm";
import { FilterBar, type FilterState } from "./FilterBar";
import type { Contact, ContactType, ContactStatus } from "../types";
import { getContactTypeColor, getContactStatusColor } from "../constants";

interface CRMClientProps {
  contacts: Contact[];
  stats: {
    totalContacts: number;
    activeDeals: number;
    pipelineValue: number;
    contactsByType: Record<string, number>;
  };
}

export function CRMClient({ contacts, stats }: CRMClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    contactType: "ALL",
    status: "ALL",
    tags: [],
    sortBy: "created_at",
    sortOrder: "desc",
  });

  // Extract unique tags from all contacts
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    contacts.forEach((contact) => {
      contact.tags?.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [contacts]);

  // Filter and sort contacts
  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchLower) ||
          contact.email?.toLowerCase().includes(searchLower) ||
          contact.company?.toLowerCase().includes(searchLower)
      );
    }

    // Apply contact type filter
    if (filters.contactType !== "ALL") {
      result = result.filter((contact) => contact.contact_type === filters.contactType);
    }

    // Apply status filter
    if (filters.status !== "ALL") {
      result = result.filter((contact) => contact.status === filters.status);
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      result = result.filter((contact) =>
        filters.tags.some((tag) => contact.tags?.includes(tag))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case "last_contacted_at":
          aValue = a.last_contacted_at ? new Date(a.last_contacted_at).getTime() : 0;
          bValue = b.last_contacted_at ? new Date(b.last_contacted_at).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return result;
  }, [contacts, filters]);

  const handleAddContact = () => {
    setSelectedContact(undefined);
    setIsFormOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedContact(undefined);
  };

  const handleFormSuccess = () => {
    // Form will trigger revalidation via server action
    setIsFormOpen(false);
    setSelectedContact(undefined);
  };

  return (
    <>
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Client Relationship Manager
          </h2>
          <p className="text-sm text-slate-500">
            Manage your leads, prospects, collaborators, and partners
          </p>
        </div>
        <button
          onClick={handleAddContact}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-black hover:bg-white/90 rounded-lg font-medium transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
              Total Contacts
            </p>
            <Users className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
          </div>
          <p className="text-3xl font-semibold text-white">
            {stats.totalContacts}
          </p>
          <p className="text-xs text-slate-600 mt-2">Active contacts</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
              Active Deals
            </p>
            <Briefcase className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
          </div>
          <p className="text-3xl font-semibold text-white">
            {stats.activeDeals}
          </p>
          <p className="text-xs text-slate-600 mt-2">In pipeline</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
              Pipeline Value
            </p>
            <DollarSign className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
          </div>
          <p className="text-3xl font-semibold text-white">
            ${stats.pipelineValue.toLocaleString()}
          </p>
          <p className="text-xs text-slate-600 mt-2">Total deal value</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
              Contact Types
            </p>
            <Activity className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
          </div>
          <p className="text-3xl font-semibold text-white">
            {Object.keys(stats.contactsByType).length}
          </p>
          <p className="text-xs text-slate-600 mt-2">Unique types</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6">
        <FilterBar filters={filters} onChange={setFilters} availableTags={availableTags} />
      </div>

      {/* Contacts Section */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            Contacts
            {filteredContacts.length !== contacts.length && (
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({filteredContacts.length} of {contacts.length})
              </span>
            )}
          </h3>
        </div>

        {/* Contacts List */}
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-white mb-2">
              {contacts.length === 0 ? "No contacts yet" : "No contacts match filters"}
            </h4>
            <p className="text-sm text-slate-500 mb-6">
              {contacts.length === 0
                ? "Get started by adding your first contact"
                : "Try adjusting your search or filters"}
            </p>
            {contacts.length === 0 && (
              <button
                onClick={handleAddContact}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black hover:bg-white/90 rounded-lg font-medium transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Contact</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredContacts.map((contact) => (
              <Link
                key={contact.id}
                href={`/apps/crm/contacts/${contact.id}`}
                className="flex items-center justify-between p-4 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10 group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                    <Users
                      className="w-5 h-5 text-white/80"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {contact.name}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs rounded-md ${getContactTypeColor(contact.contact_type)}`}>
                        {contact.contact_type}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-md ${getContactStatusColor(contact.status)}`}>
                        {contact.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {contact.email && (
                        <span className="truncate">{contact.email}</span>
                      )}
                      {contact.company && (
                        <>
                          <span>•</span>
                          <span className="truncate">{contact.company}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-600">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleEditContact(contact);
                    }}
                    className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Edit
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Contact Type Distribution */}
      {Object.keys(stats.contactsByType).length > 0 && (
        <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Contact Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.contactsByType).map(([type, count]) => (
              <div
                key={type}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <p className="text-xs text-slate-500 mb-2">{type}</p>
                <p className="text-2xl font-semibold text-white">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      <ContactForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        contact={selectedContact}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}
