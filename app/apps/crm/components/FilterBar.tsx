"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { ContactType, ContactStatus } from "../types";
import { CONTACT_TYPES, CONTACT_STATUSES } from "../constants";

export interface FilterState {
  search: string;
  contactType: ContactType | "ALL";
  status: ContactStatus | "ALL";
  tags: string[];
  sortBy: "name" | "created_at" | "last_contacted_at";
  sortOrder: "asc" | "desc";
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableTags?: string[];
}

export function FilterBar({ filters, onChange, availableTags = [] }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    onChange({ ...filters, search: value });
  };

  const handleContactTypeChange = (value: ContactType | "ALL") => {
    onChange({ ...filters, contactType: value });
  };

  const handleStatusChange = (value: ContactStatus | "ALL") => {
    onChange({ ...filters, status: value });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags: newTags });
  };

  const handleSortChange = (sortBy: FilterState["sortBy"]) => {
    onChange({
      ...filters,
      sortBy,
      sortOrder: filters.sortBy === sortBy && filters.sortOrder === "asc" ? "desc" : "asc",
    });
  };

  const handleClearFilters = () => {
    onChange({
      search: "",
      contactType: "ALL",
      status: "ALL",
      tags: [],
      sortBy: "created_at",
      sortOrder: "desc",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.contactType !== "ALL" ||
    filters.status !== "ALL" ||
    filters.tags.length > 0;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search contacts by name, email, or company..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            showFilters || hasActiveFilters
              ? "bg-white text-black"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 bg-black/20 text-xs rounded">
              {[
                filters.contactType !== "ALL" ? 1 : 0,
                filters.status !== "ALL" ? 1 : 0,
                filters.tags.length,
              ].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-all"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="pt-4 border-t border-white/10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Contact Type Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Contact Type</label>
              <select
                value={filters.contactType}
                onChange={(e) => handleContactTypeChange(e.target.value as ContactType | "ALL")}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <option value="ALL">All Types</option>
                {CONTACT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleStatusChange(e.target.value as ContactStatus | "ALL")}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <option value="ALL">All Statuses</option>
                {CONTACT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value as FilterState["sortBy"])}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <option value="created_at">Date Created</option>
                <option value="name">Name</option>
                <option value="last_contacted_at">Last Contacted</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  onChange({ ...filters, sortOrder: e.target.value as "asc" | "desc" })
                }
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Filter by Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = filters.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        isSelected
                          ? "bg-white text-black"
                          : "bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white border border-white/10"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
