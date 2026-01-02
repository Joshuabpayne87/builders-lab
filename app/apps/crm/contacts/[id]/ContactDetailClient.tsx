"use client";

import { useState } from "react";
import { Plus, Calendar, Briefcase, Sparkles, FileText } from "lucide-react";
import { ActivityTimeline } from "../../components/ActivityTimeline";
import { ActivityForm } from "../../components/ActivityForm";
import { DealForm } from "../../components/DealForm";
import { AIInsightsPanel } from "../../components/AIInsightsPanel";
import { ContactEnrichment } from "../../components/ContactEnrichment";
import type { Contact, Activity, Deal, ContactScore } from "../../types";
import {
  generateContactSummaryAction,
  suggestNextActionsAction,
  draftEmailAction,
} from "../../actions/aiActions";

interface ContactDetailClientProps {
  contact: Contact;
  activities: Activity[];
  deals: Deal[];
}

type Tab = "overview" | "activities" | "deals" | "ai-insights";

export function ContactDetailClient({ contact, activities, deals }: ContactDetailClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [isDealFormOpen, setIsDealFormOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>();
  const [selectedDeal, setSelectedDeal] = useState<Deal | undefined>();

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: FileText },
    { id: "activities" as Tab, label: "Activities", icon: Calendar, count: activities.length },
    { id: "deals" as Tab, label: "Deals", icon: Briefcase, count: deals.length },
    { id: "ai-insights" as Tab, label: "AI Insights", icon: Sparkles },
  ];

  const handleAddActivity = () => {
    setSelectedActivity(undefined);
    setIsActivityFormOpen(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsActivityFormOpen(true);
  };

  const handleAddDeal = () => {
    setSelectedDeal(undefined);
    setIsDealFormOpen(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDealFormOpen(true);
  };

  // AI automation handlers
  const handleGenerateSummary = async () => {
    const result = await generateContactSummaryAction(contact.id);
    return result.summary || null;
  };

  const handleGenerateActions = async () => {
    const result = await suggestNextActionsAction(contact.id);
    return result.actions || [];
  };

  const handleDraftEmail = async (purpose: string) => {
    const result = await draftEmailAction(contact.id, purpose);
    return result.draft || null;
  };

  return (
    <>
      {/* Tabs */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center border-b border-white/10 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-white bg-white/5 border-b-2 border-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-2 py-0.5 bg-white/10 text-slate-400 rounded-md text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Recent Activities */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Activities</h3>
                  <button
                    onClick={handleAddActivity}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Activity
                  </button>
                </div>
                {activities.length > 0 ? (
                  <ActivityTimeline activities={activities.slice(0, 5)} onEdit={handleEditActivity} />
                ) : (
                  <p className="text-sm text-slate-500 text-center py-8">No activities yet</p>
                )}
              </div>

              {/* Active Deals */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Active Deals</h3>
                  <button
                    onClick={handleAddDeal}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Deal
                  </button>
                </div>
                {deals.length > 0 ? (
                  <div className="space-y-2">
                    {deals.filter((d) => d.status === "OPEN").slice(0, 3).map((deal) => (
                      <div
                        key={deal.id}
                        onClick={() => handleEditDeal(deal)}
                        className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-white">{deal.title}</h4>
                          <span className="text-sm text-green-400 font-medium">
                            ${deal.value?.toLocaleString() || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                            {deal.stage}
                          </span>
                          {deal.expected_close_date && (
                            <span className="text-xs text-slate-500">
                              Close: {new Date(deal.expected_close_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-8">No deals yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "activities" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">All Activities</h3>
                <button
                  onClick={handleAddActivity}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg font-medium transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Activity
                </button>
              </div>
              <ActivityTimeline activities={activities} onEdit={handleEditActivity} />
            </div>
          )}

          {activeTab === "deals" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">All Deals</h3>
                <button
                  onClick={handleAddDeal}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg font-medium transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Deal
                </button>
              </div>
              {deals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      onClick={() => handleEditDeal(deal)}
                      className="p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-base font-semibold text-white flex-1">{deal.title}</h4>
                        <span className={`px-2 py-0.5 text-xs rounded-md ${
                          deal.status === "OPEN" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          deal.status === "WON" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                          "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {deal.status}
                        </span>
                      </div>
                      {deal.description && (
                        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{deal.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md">
                          {deal.stage}
                        </span>
                        {deal.value !== null && (
                          <span className="text-sm text-green-400 font-medium">
                            ${deal.value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-12">No deals yet</p>
              )}
            </div>
          )}

          {activeTab === "ai-insights" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Insights - 2 columns */}
              <div className="lg:col-span-2">
                <AIInsightsPanel
                  contact={contact}
                  activities={activities}
                  deals={deals}
                  onGenerateSummary={handleGenerateSummary}
                  onGenerateActions={handleGenerateActions}
                  onDraftEmail={handleDraftEmail}
                />
              </div>

              {/* Contact Enrichment - 1 column */}
              <div className="lg:col-span-1">
                <ContactEnrichment contact={contact} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forms */}
      <ActivityForm
        isOpen={isActivityFormOpen}
        onClose={() => {
          setIsActivityFormOpen(false);
          setSelectedActivity(undefined);
        }}
        contacts={[contact]}
        activity={selectedActivity}
        defaultContactId={contact.id}
        onSuccess={() => {
          setIsActivityFormOpen(false);
          setSelectedActivity(undefined);
        }}
      />

      <DealForm
        isOpen={isDealFormOpen}
        onClose={() => {
          setIsDealFormOpen(false);
          setSelectedDeal(undefined);
        }}
        contacts={[contact]}
        deal={selectedDeal}
        defaultContactId={contact.id}
        onSuccess={() => {
          setIsDealFormOpen(false);
          setSelectedDeal(undefined);
        }}
      />
    </>
  );
}
