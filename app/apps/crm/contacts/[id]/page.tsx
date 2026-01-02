import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Mail, Phone, Building2, Globe, Linkedin, MapPin } from "lucide-react";
import { getContact, getActivities, getDeals } from "../../services/supabaseService";
import { ContactDetailClient } from "./ContactDetailClient";
import { getContactTypeColor, getContactStatusColor } from "../../constants";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Await params (Next.js 15+)
  const { id } = await params;

  // Fetch contact with relations
  const contact = await getContact(id);

  if (!contact) {
    redirect("/apps/crm");
  }

  // Fetch all activities and deals for this contact
  const activities = await getActivities({ contact_id: id });
  const deals = await getDeals({ contact_id: id });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_55%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F0F10]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/apps/crm"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to CRM</span>
          </Link>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white/80" />
            <h1 className="text-lg font-semibold tracking-tight">Contact Details</h1>
          </div>
          <div className="w-32" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
        {/* Contact Header */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between gap-6">
            {/* Left: Contact Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white/80" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-1">{contact.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs rounded-md ${getContactTypeColor(contact.contact_type)}`}>
                      {contact.contact_type}
                    </span>
                    <span className={`px-2.5 py-1 text-xs rounded-md ${getContactStatusColor(contact.status)}`}>
                      {contact.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <a href={`mailto:${contact.email}`} className="text-sm text-slate-300 hover:text-white transition-colors">
                      {contact.email}
                    </a>
                  </div>
                )}

                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <a href={`tel:${contact.phone}`} className="text-sm text-slate-300 hover:text-white transition-colors">
                      {contact.phone}
                    </a>
                  </div>
                )}

                {contact.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-300">{contact.company}</span>
                    {contact.title && <span className="text-sm text-slate-500">• {contact.title}</span>}
                  </div>
                )}

                {contact.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-slate-500" />
                    <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 hover:text-white transition-colors">
                      {contact.website}
                    </a>
                  </div>
                )}

                {contact.linkedin_url && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-4 h-4 text-slate-500" />
                    <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 hover:text-white transition-colors">
                      LinkedIn Profile
                    </a>
                  </div>
                )}

                {contact.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-300">{contact.address}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {contact.tags && contact.tags.length > 0 && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  {contact.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 text-xs bg-white/10 text-slate-400 rounded-md border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Notes */}
              {contact.notes && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-slate-500 mb-2">Notes</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{contact.notes}</p>
                </div>
              )}
            </div>

            {/* Right: Quick Stats */}
            <div className="flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 min-w-[140px]">
                <p className="text-xs text-slate-500 mb-1">Activities</p>
                <p className="text-2xl font-semibold text-white">{contact.activityCount || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 min-w-[140px]">
                <p className="text-xs text-slate-500 mb-1">Deals</p>
                <p className="text-2xl font-semibold text-white">{contact.dealCount || 0}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 min-w-[140px]">
                <p className="text-xs text-slate-500 mb-1">Total Value</p>
                <p className="text-2xl font-semibold text-white">${(contact.totalDealValue || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content - Client Component */}
        <ContactDetailClient contact={contact} activities={activities} deals={deals} />
      </div>
    </div>
  );
}
