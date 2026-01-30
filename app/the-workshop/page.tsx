"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Plus,
  Users,
  Loader2,
  X,
  Tag,
  Send,
  Ghost,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

type IdeaType = "partnership" | "question" | "offer";
type IdeaStatus = "open" | "matched" | "paused" | "closed";
type HandIntent = "interested" | "can_help" | "partner";

interface HandCounts {
  interested: number;
  can_help: number;
  partner: number;
  total: number;
  accepted: number;
}

interface WorkshopIdea {
  id: string;
  user_id: string;
  title: string;
  idea_type: IdeaType;
  problem: string;
  target_audience: string;
  current_assets?: string | null;
  desired_outcome: string;
  needs: string;
  ideal_partner: string;
  timeline: string;
  commitment: string;
  tags?: string[] | null;
  status: IdeaStatus;
  author_name?: string | null;
  author_avatar_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_owner: boolean;
  hand_counts?: HandCounts;
  my_hand_intent?: HandIntent | null;
  my_hand_accepted?: boolean;
}

interface WorkshopHand {
  id: string;
  idea_id: string;
  user_id: string;
  intent: HandIntent;
  message?: string | null;
  contact?: string | null;
  user_name?: string | null;
  accepted_at?: string | null;
  accepted_by?: string | null;
  created_at?: string | null;
}

interface WorkshopQuestion {
  id: string;
  idea_id: string;
  user_id: string;
  body: string;
  author_name?: string | null;
  author_avatar_url?: string | null;
  created_at?: string | null;
}

interface WorkshopThreadMessageSummary {
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface WorkshopThread {
  id: string;
  idea_id: string;
  owner_id: string;
  participant_id: string;
  created_at?: string | null;
  bl_workshop_ideas?: {
    title?: string | null;
    idea_type?: IdeaType | null;
    status?: IdeaStatus | null;
  } | null;
  last_message?: WorkshopThreadMessageSummary | null;
}

interface WorkshopThreadMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at?: string | null;
}

interface WorkshopNotification {
  id: string;
  type: "hands" | "accepted" | "message";
  title: string;
  body: string;
  ideaId?: string;
  threadId?: string;
  created_at?: string | null;
}

interface IdeaForm {
  title: string;
  idea_type: IdeaType;
  problem: string;
  target_audience: string;
  current_assets: string;
  desired_outcome: string;
  needs: string;
  ideal_partner: string;
  timeline: string;
  commitment: string;
  tags: string;
}

const typeLabels: Record<IdeaType, string> = {
  partnership: "Partnership",
  question: "Question",
  offer: "Offer",
};

const statusLabels: Record<IdeaStatus, string> = {
  open: "Open",
  matched: "Matched",
  paused: "Paused",
  closed: "Closed",
};

const intentLabels: Record<HandIntent, string> = {
  interested: "Interested",
  can_help: "Can help",
  partner: "Partner",
};

const typeBadgeClasses: Record<IdeaType, string> = {
  partnership: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  question: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  offer: "bg-amber-500/10 text-amber-300 border-amber-500/30",
};

const statusBadgeClasses: Record<IdeaStatus, string> = {
  open: "bg-white/10 text-slate-200 border-white/10",
  matched: "bg-green-500/10 text-green-300 border-green-500/30",
  paused: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
  closed: "bg-slate-500/10 text-slate-400 border-slate-500/30",
};

const intentBadgeClasses: Record<HandIntent, string> = {
  interested: "bg-white/5 text-slate-300 border-white/10",
  can_help: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  partner: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

const initialIdeaForm: IdeaForm = {
  title: "",
  idea_type: "partnership",
  problem: "",
  target_audience: "",
  current_assets: "",
  desired_outcome: "",
  needs: "",
  ideal_partner: "",
  timeline: "",
  commitment: "",
  tags: "",
};

const filterOptions: Array<{ value: "all" | IdeaType; label: string }> = [
  { value: "all", label: "All" },
  { value: "partnership", label: "Partnerships" },
  { value: "question", label: "Questions" },
  { value: "offer", label: "Offers" },
];

function formatDate(value?: string | null) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name?: string | null) {
  if (!name) return "BL";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function normalizeTags(input?: string[] | string | null) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((tag) => String(tag).trim()).filter(Boolean);
  }
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function TheWorkshopClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [ideas, setIdeas] = useState<WorkshopIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeType, setActiveType] = useState<"all" | IdeaType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<IdeaForm>(initialIdeaForm);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [selectedIdea, setSelectedIdea] = useState<WorkshopIdea | null>(null);
  const [hands, setHands] = useState<WorkshopHand[]>([]);
  const [handsLoading, setHandsLoading] = useState(false);

  const [handIntent, setHandIntent] = useState<HandIntent>("interested");
  const [handMessage, setHandMessage] = useState("");
  const [handContact, setHandContact] = useState("");
  const [handError, setHandError] = useState<string | null>(null);
  const [handSaving, setHandSaving] = useState(false);

  const [questions, setQuestions] = useState<WorkshopQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionBody, setQuestionBody] = useState("");
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [questionSaving, setQuestionSaving] = useState(false);

  const [threads, setThreads] = useState<WorkshopThread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [allThreads, setAllThreads] = useState<WorkshopThread[]>([]);
  const [activeThread, setActiveThread] = useState<WorkshopThread | null>(null);
  const [threadMessages, setThreadMessages] = useState<WorkshopThreadMessage[]>([]);
  const [threadMessagesLoading, setThreadMessagesLoading] = useState(false);
  const [threadMessageBody, setThreadMessageBody] = useState("");
  const [threadMessageError, setThreadMessageError] = useState<string | null>(null);
  const [threadMessageSaving, setThreadMessageSaving] = useState(false);
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [ideaDeleting, setIdeaDeleting] = useState(false);
  const [threadDeleting, setThreadDeleting] = useState(false);
  const [handRemoving, setHandRemoving] = useState(false);

  const ideaIdParam = searchParams.get("ideaId");
  const threadIdParam = searchParams.get("threadId");

  const loadIdeas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/the-workshop/ideas");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load ideas.");
        setIdeas([]);
        return;
      }
      const ideasList = data.ideas || [];
      setIdeas(ideasList);
      setSelectedIdea((prev) => {
        if (!prev) return prev;
        return ideasList.find((idea: WorkshopIdea) => idea.id === prev.id) || prev;
      });
    } catch (err) {
      console.error("Workshop ideas load error:", err);
      setError("Failed to load ideas.");
      setIdeas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHands = async (ideaId: string) => {
    try {
      setHandsLoading(true);
      const res = await fetch(`/api/the-workshop/interest?ideaId=${ideaId}`);
      const data = await res.json();
      if (!res.ok) {
        setHands([]);
        return;
      }
      setHands(data.hands || []);
    } catch (err) {
      console.error("Workshop hands load error:", err);
      setHands([]);
    } finally {
      setHandsLoading(false);
    }
  };

  const loadQuestions = async (ideaId: string) => {
    try {
      setQuestionsLoading(true);
      setQuestionError(null);
      const res = await fetch(`/api/the-workshop/questions?ideaId=${ideaId}`);
      const data = await res.json();
      if (!res.ok) {
        setQuestionError(data.error || "Failed to load questions.");
        setQuestions([]);
        return;
      }
      setQuestions(data.questions || []);
    } catch (err) {
      console.error("Workshop questions load error:", err);
      setQuestionError("Failed to load questions.");
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const loadThreadsForIdea = async (ideaId: string) => {
    try {
      setThreadsLoading(true);
      const res = await fetch(`/api/the-workshop/threads?ideaId=${ideaId}`);
      const data = await res.json();
      if (!res.ok) {
        setThreads([]);
        return;
      }
      setThreads(data.threads || []);
    } catch (err) {
      console.error("Workshop threads load error:", err);
      setThreads([]);
    } finally {
      setThreadsLoading(false);
    }
  };

  const loadAllThreads = async () => {
    try {
      const res = await fetch("/api/the-workshop/threads");
      const data = await res.json();
      if (!res.ok) {
        setAllThreads([]);
        return;
      }
      setAllThreads(data.threads || []);
    } catch (err) {
      console.error("Workshop threads overview error:", err);
      setAllThreads([]);
    }
  };

  const openThread = async (threadId: string | undefined | null) => {
    if (!threadId || threadId === "undefined") {
      setThreadMessageError("Chat isn't ready yet. Please try again.");
      return;
    }
    try {
      setThreadMessagesLoading(true);
      setThreadMessageError(null);
      const res = await fetch(`/api/the-workshop/threads/${threadId}`);
      const data = await res.json();
      if (!res.ok) {
        setThreadMessageError(data.error || "Failed to load messages.");
        return;
      }
      setActiveThread(data.thread || null);
      setThreadMessages(data.messages || []);
    } catch (err) {
      console.error("Workshop thread open error:", err);
      setThreadMessageError("Failed to load messages.");
    } finally {
      setThreadMessagesLoading(false);
    }
  };

  const sendThreadMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeThread || !threadMessageBody.trim()) return;

    setThreadMessageSaving(true);
    setThreadMessageError(null);

    try {
      const res = await fetch(`/api/the-workshop/threads/${activeThread.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: threadMessageBody.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setThreadMessageError(data.error || "Failed to send message.");
        return;
      }
      setThreadMessages((prev) => [...prev, data.message]);
      setThreadMessageBody("");
      await loadAllThreads();
    } catch (err) {
      console.error("Workshop thread send error:", err);
      setThreadMessageError("Failed to send message.");
    } finally {
      setThreadMessageSaving(false);
    }
  };

  const postQuestion = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedIdea || !questionBody.trim()) return;

    setQuestionSaving(true);
    setQuestionError(null);

    try {
      const res = await fetch("/api/the-workshop/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_id: selectedIdea.id,
          body: questionBody.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setQuestionError(data.error || "Failed to post.");
        return;
      }
      setQuestions((prev) => [...prev, data.question]);
      setQuestionBody("");
    } catch (err) {
      console.error("Workshop question create error:", err);
      setQuestionError("Failed to post.");
    } finally {
      setQuestionSaving(false);
    }
  };

  const updateIdeaStatus = async (nextStatus: IdeaStatus) => {
    if (!selectedIdea) return;
    setStatusSaving(true);
    try {
      const res = await fetch("/api/the-workshop/ideas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedIdea.id, status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        return;
      }
      setSelectedIdea((prev) => (prev ? { ...prev, status: nextStatus } : prev));
      await loadIdeas();
    } catch (err) {
      console.error("Workshop status update error:", err);
    } finally {
      setStatusSaving(false);
    }
  };

  const handleDeleteIdea = async () => {
    if (!selectedIdea) return;
    if (!window.confirm("Delete this idea? This cannot be undone.")) return;

    setIdeaDeleting(true);
    try {
      const res = await fetch(`/api/the-workshop/ideas?id=${selectedIdea.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to delete idea.");
        return;
      }

      setIdeas((prev) => prev.filter((idea) => idea.id !== selectedIdea.id));
      setSelectedIdea(null);
      await loadAllThreads();
    } catch (err) {
      console.error("Workshop idea delete error:", err);
      setError("Failed to delete idea.");
    } finally {
      setIdeaDeleting(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/auth/login");
        return;
      }
      setUser(data.user);
      setAuthLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  useEffect(() => {
    if (user) {
      loadIdeas();
      loadAllThreads();
    }
  }, [user]);

  useEffect(() => {
    if (!selectedIdea) return;
    setHandIntent(selectedIdea.my_hand_intent || "interested");
    setHandMessage("");
    setHandContact("");
    setHandError(null);
    setHands([]);
    setQuestions([]);
    setQuestionError(null);
    setQuestionBody("");
    setThreads([]);
    setActiveThread(null);
    setThreadMessages([]);
    setThreadMessageBody("");
    setThreadMessageError(null);

    if (selectedIdea.is_owner) {
      loadHands(selectedIdea.id);
    }

    loadQuestions(selectedIdea.id);
    loadThreadsForIdea(selectedIdea.id);
  }, [selectedIdea]);

  useEffect(() => {
    if (!pendingThreadId || threads.length === 0) return;
    const thread = threads.find((item) => item.id === pendingThreadId);
    if (thread) {
      openThread(thread.id);
      setPendingThreadId(null);
    }
  }, [pendingThreadId, threads]);

  useEffect(() => {
    if (!selectedIdea || selectedIdea.is_owner) return;
    if (!selectedIdea.my_hand_accepted || threads.length === 0) return;
    if (activeThread) return;
    openThread(threads[0].id);
  }, [selectedIdea, threads, activeThread]);

  const filteredIdeas = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    return ideas.filter((idea) => {
      if (activeType !== "all" && idea.idea_type !== activeType) {
        return false;
      }

      if (!trimmedQuery) {
        return true;
      }

      const tags = normalizeTags(idea.tags).join(" ").toLowerCase();
      const haystack = [
        idea.title,
        idea.problem,
        idea.target_audience,
        idea.needs,
        idea.author_name || "",
        tags,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(trimmedQuery);
    });
  }, [ideas, activeType, searchQuery]);

  const openIdea = (ideaId: string, threadId?: string) => {
    const idea = ideas.find((item) => item.id === ideaId);
    if (idea) {
      setSelectedIdea(idea);
      if (threadId) {
        setPendingThreadId(threadId);
      }
    }
  };

  const findThreadForIdea = (ideaId: string) => {
    if (!user) return null;
    const thread = allThreads.find(
      (item) =>
        item.idea_id === ideaId &&
        (item.participant_id === user.id || item.owner_id === user.id)
    );
    return thread?.id || null;
  };

  useEffect(() => {
    if (!ideaIdParam) return;
    if (selectedIdea?.id === ideaIdParam) return;
    openIdea(ideaIdParam);
  }, [ideaIdParam, ideas, selectedIdea]);

  useEffect(() => {
    if (!threadIdParam || allThreads.length === 0) return;
    const thread = allThreads.find((item) => item.id === threadIdParam);
    if (thread) {
      openIdea(thread.idea_id, thread.id);
    }
  }, [threadIdParam, allThreads, ideas]);

  const openCreateModal = () => {
    setCreateForm(initialIdeaForm);
    setCreateError(null);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateError(null);
  };

  const handleCreateIdea = async (event: FormEvent) => {
    event.preventDefault();
    setIsCreating(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/the-workshop/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          tags: createForm.tags,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || "Failed to post idea.");
        return;
      }

      const newIdea: WorkshopIdea = {
        ...data.idea,
        is_owner: true,
        hand_counts: {
          interested: 0,
          can_help: 0,
          partner: 0,
          total: 0,
          accepted: 0,
        },
        my_hand_intent: null,
        my_hand_accepted: false,
      };

      setIdeas((prev) => [newIdea, ...prev]);
      setShowCreateModal(false);
      setCreateForm(initialIdeaForm);
    } catch (err) {
      console.error("Workshop idea create error:", err);
      setCreateError("Failed to post idea.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRaiseHand = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedIdea) return;

    setHandSaving(true);
    setHandError(null);

    try {
      const res = await fetch("/api/the-workshop/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_id: selectedIdea.id,
          intent: handIntent,
          message: handMessage || null,
          contact: handContact || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setHandError(data.error || "Failed to raise hand.");
        return;
      }
      setHandMessage("");
      setHandContact("");
      await loadIdeas();
    } catch (err) {
      console.error("Workshop hand raise error:", err);
      setHandError("Failed to raise hand.");
    } finally {
      setHandSaving(false);
    }
  };

  const handleUpdateHand = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedIdea) return;

    setHandSaving(true);
    setHandError(null);

    try {
      const res = await fetch("/api/the-workshop/interest", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_id: selectedIdea.id,
          intent: handIntent,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setHandError(data.error || "Failed to update hand.");
        return;
      }

      await loadIdeas();
    } catch (err) {
      console.error("Workshop hand update error:", err);
      setHandError("Failed to update hand.");
    } finally {
      setHandSaving(false);
    }
  };

  const handleRemoveHand = async () => {
    if (!selectedIdea) return;

    setHandSaving(true);
    setHandError(null);

    try {
      const res = await fetch(`/api/the-workshop/interest?ideaId=${selectedIdea.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setHandError(data.error || "Failed to remove hand.");
        return;
      }

      await loadIdeas();
      setActiveThread(null);
      setThreadMessages([]);
    } catch (err) {
      console.error("Workshop hand delete error:", err);
      setHandError("Failed to remove hand.");
    } finally {
      setHandSaving(false);
    }
  };

  const handleRemoveHandAsOwner = async (hand: WorkshopHand) => {
    if (!selectedIdea) return;
    if (!window.confirm("Remove this hand?")) return;

    setHandRemoving(true);
    try {
      const res = await fetch(
        `/api/the-workshop/interest?ideaId=${selectedIdea.id}&userId=${hand.user_id}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (!res.ok) {
        console.error("Workshop hand delete error:", data.error);
        return;
      }

      await loadHands(selectedIdea.id);
      await loadThreadsForIdea(selectedIdea.id);
      await loadAllThreads();
      await loadIdeas();
    } catch (err) {
      console.error("Workshop hand delete error:", err);
    } finally {
      setHandRemoving(false);
    }
  };

  const handleAcceptHand = async (hand: WorkshopHand) => {
    if (!selectedIdea) return;

    try {
      const res = await fetch("/api/the-workshop/interest", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept",
          idea_id: selectedIdea.id,
          user_id: hand.user_id,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Accept hand error:", data.error);
        return;
      }

      const acceptedThread = data.thread as WorkshopThread | undefined;
      if (acceptedThread?.id) {
        const threadWithIdea: WorkshopThread = {
          ...acceptedThread,
          bl_workshop_ideas: {
            title: selectedIdea.title,
            idea_type: selectedIdea.idea_type,
            status: selectedIdea.status,
          },
          last_message: null,
        };
        setThreads((prev) =>
          prev.some((item) => item.id === threadWithIdea.id)
            ? prev
            : [threadWithIdea, ...prev]
        );
        setAllThreads((prev) =>
          prev.some((item) => item.id === threadWithIdea.id)
            ? prev
            : [threadWithIdea, ...prev]
        );
        openThread(threadWithIdea.id);
      }

      await loadHands(selectedIdea.id);
      await loadThreadsForIdea(selectedIdea.id);
      await loadAllThreads();
      await loadIdeas();
    } catch (err) {
      console.error("Workshop hand accept error:", err);
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!window.confirm("Delete this chat?")) return;
    setThreadDeleting(true);
    setThreadMessageError(null);

    try {
      const res = await fetch(`/api/the-workshop/threads/${threadId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setThreadMessageError(data.error || "Failed to delete chat.");
        return;
      }

      setThreads((prev) => prev.filter((thread) => thread.id !== threadId));
      setAllThreads((prev) => prev.filter((thread) => thread.id !== threadId));
      if (activeThread?.id === threadId) {
        setActiveThread(null);
        setThreadMessages([]);
      }
    } catch (err) {
      console.error("Workshop thread delete error:", err);
      setThreadMessageError("Failed to delete chat.");
    } finally {
      setThreadDeleting(false);
    }
  };

  const detailItems = selectedIdea
    ? [
        { label: "Problem", value: selectedIdea.problem, full: true },
        { label: "Target Audience", value: selectedIdea.target_audience },
        ...(selectedIdea.current_assets
          ? [{ label: "Current Assets", value: selectedIdea.current_assets, full: true }]
          : []),
        { label: "Desired Outcome", value: selectedIdea.desired_outcome, full: true },
        { label: "Needs", value: selectedIdea.needs, full: true },
        { label: "Ideal Partner", value: selectedIdea.ideal_partner },
        { label: "Timeline", value: selectedIdea.timeline },
        { label: "Commitment", value: selectedIdea.commitment },
      ]
    : [];

  const notificationItems = useMemo<WorkshopNotification[]>(() => {
    if (!user) return [];
    const items: WorkshopNotification[] = [];

    ideas.forEach((idea) => {
      if (!idea.is_owner) return;
      const counts = idea.hand_counts || {
        interested: 0,
        can_help: 0,
        partner: 0,
        total: 0,
        accepted: 0,
      };
      if (counts.total === 0) return;
      items.push({
        id: `hands-${idea.id}`,
        type: "hands",
        ideaId: idea.id,
        title: idea.title,
        body: `${counts.interested} interested • ${counts.can_help} can help • ${counts.partner} partner`,
        created_at: idea.updated_at || idea.created_at || null,
      });
    });

    ideas.forEach((idea) => {
      if (idea.is_owner || !idea.my_hand_accepted) return;
      items.push({
        id: `accepted-${idea.id}`,
        type: "accepted",
        ideaId: idea.id,
        title: "You're accepted",
        body: `${idea.title} is ready for collaboration.`,
        created_at: idea.updated_at || idea.created_at || null,
      });
    });

    allThreads.forEach((thread) => {
      if (!thread.last_message || thread.last_message.sender_id === user.id) return;
      items.push({
        id: `message-${thread.id}`,
        type: "message",
        threadId: thread.id,
        ideaId: thread.idea_id,
        title: thread.bl_workshop_ideas?.title || "New message",
        body: thread.last_message.body,
        created_at: thread.last_message.created_at,
      });
    });

    return items.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
  }, [ideas, allThreads, user]);

  const notificationCount = notificationItems.length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F0F10]" />
      </div>

      <nav className="relative z-10 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-6xl">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white/70" />
            <span className="text-lg font-semibold tracking-tight">The Workshop</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className="relative p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Ghost className="w-5 h-5 text-white/70" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-black text-[10px] font-semibold flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Notifications</p>
                  </div>
                  {notificationItems.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                      No updates yet.
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {notificationItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setNotificationsOpen(false);
                            if (item.threadId && item.ideaId) {
                              openIdea(item.ideaId, item.threadId);
                              return;
                            }
                            if (item.ideaId) {
                              openIdea(item.ideaId);
                            }
                          }}
                          className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {item.type === "message" ? (
                              <MessageSquare className="w-4 h-4 text-indigo-300" />
                            ) : item.type === "accepted" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                            ) : (
                              <Users className="w-4 h-4 text-amber-300" />
                            )}
                            <span className="text-sm font-semibold text-white truncate">
                              {item.title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2">{item.body}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Post an Idea
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-6 py-10 max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Member collaboration space
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold">The Workshop</h1>
            <p className="text-slate-400 max-w-2xl">
              Share partnership ideas, ask for help, and connect with builders who can move
              your project forward.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-full border border-white/10">
              <span className="text-white">{ideas.length}</span>
              <span>active ideas</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-full border border-white/10">
              <span className="text-white">3</span>
              <span>ways to connect</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-white/70" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Share your build</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Post the partnership, question, or offer you want to explore.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-4">
              <Tag className="w-5 h-5 text-white/70" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Tag your strengths</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use tags to signal skills, markets, or assets you want to share.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-4">
              <Send className="w-5 h-5 text-white/70" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-2">Raise your hand</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Let owners know if you can help, are interested, or want to partner.
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveType(option.value)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors border ${
                  activeType === option.value
                    ? "bg-white text-black border-white"
                    : "bg-white/5 text-slate-400 border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="w-full md:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search ideas, tags, or owners"
              className="w-full md:w-64 px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                Idea Board
              </h2>
              <p className="text-xs text-slate-500">
                {filteredIdeas.length} idea{filteredIdeas.length === 1 ? "" : "s"} showing
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <Loader2 className="w-6 h-6 text-white animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading ideas...</p>
            </div>
          ) : error ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <p className="text-sm text-red-400 mb-3">{error}</p>
              <button
                onClick={loadIdeas}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          ) : filteredIdeas.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center">
              <p className="text-sm text-slate-400 mb-4">
                {activeType === "all" && !searchQuery.trim()
                  ? "No ideas yet. Post the first one."
                  : "No ideas match your filters yet."}
              </p>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg text-sm font-semibold"
              >
                Post an Idea
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredIdeas.map((idea) => {
                const tags = normalizeTags(idea.tags);
                const counts = idea.hand_counts || {
                  interested: 0,
                  can_help: 0,
                  partner: 0,
                  total: 0,
                  accepted: 0,
                };
                const threadId = idea.my_hand_accepted ? findThreadForIdea(idea.id) : null;
                return (
                  <div
                    key={idea.id}
                    onClick={() => setSelectedIdea(idea)}
                    className="group bg-white/5 border border-white/10 hover:border-white/20 rounded-xl p-6 transition-all cursor-pointer"
                  >
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full border ${typeBadgeClasses[idea.idea_type]}`}
                      >
                        {typeLabels[idea.idea_type]}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusBadgeClasses[idea.status]}`}
                      >
                        {statusLabels[idea.status]}
                      </span>
                      {idea.is_owner && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full border border-white/10 text-slate-200 bg-white/10">
                          Your idea
                        </span>
                      )}
                      {idea.my_hand_intent && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full border ${intentBadgeClasses[idea.my_hand_intent]}`}
                        >
                          Your hand: {intentLabels[idea.my_hand_intent]}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white/90">
                      {idea.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {idea.problem}
                    </p>
                    <p className="text-xs text-slate-500 mt-3">
                      Target: {idea.target_audience}
                    </p>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-slate-400"
                          >
                            {tag}
                          </span>
                        ))}
                        {tags.length > 4 && (
                          <span className="text-xs text-slate-500">
                            +{tags.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400/80" />
                        <span>Interested</span>
                        <span className="text-white">{counts.interested}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400/80" />
                        <span>Can help</span>
                        <span className="text-white">{counts.can_help}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-400/80" />
                        <span>Partner</span>
                        <span className="text-white">{counts.partner}</span>
                      </div>
                    </div>

                    {(idea.my_hand_accepted || (idea.is_owner && counts.accepted > 0)) && (
                      <div className="mt-4 flex items-center gap-2">
                        {idea.my_hand_accepted && threadId && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              openIdea(idea.id, threadId);
                            }}
                            className="px-3 py-1.5 bg-white text-black hover:bg-white/90 rounded-lg text-xs font-semibold"
                          >
                            Open Chat
                          </button>
                        )}
                        {idea.is_owner && counts.accepted > 0 && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              openIdea(idea.id);
                            }}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold"
                          >
                            View Chats
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-5 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        {idea.author_avatar_url ? (
                          <img
                            src={idea.author_avatar_url}
                            alt={idea.author_name || "Member"}
                            className="w-7 h-7 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-semibold text-slate-200">
                            {getInitials(idea.author_name)}
                          </div>
                        )}
                        <span>{idea.author_name || "Member"}</span>
                      </div>
                      <span>{formatDate(idea.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showCreateModal && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              onClick={closeCreateModal}
            />
            <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl z-50 bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Post a Workshop Idea</h3>
                <button
                  onClick={closeCreateModal}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form
                onSubmit={handleCreateIdea}
                className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.title}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, title: event.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-white/30"
                      placeholder="Name the idea or opportunity"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={createForm.idea_type}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          idea_type: event.target.value as IdeaType,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                    >
                      <option value="partnership">Partnership</option>
                      <option value="question">Question</option>
                      <option value="offer">Offer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Target Audience <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.target_audience}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, target_audience: event.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-white/30"
                      placeholder="Who this is for"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Problem <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={createForm.problem}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, problem: event.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-white/30 resize-none"
                      placeholder="What is the problem you want to solve?"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Current Assets
                    </label>
                    <textarea
                      value={createForm.current_assets}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, current_assets: event.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-white/30 resize-none"
                      placeholder="Optional: What you already have or can contribute"
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Desired Outcome <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={createForm.desired_outcome}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, desired_outcome: event.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-white/30 resize-none"
                      placeholder="What does success look like?"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Needs <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={createForm.needs}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, needs: event.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-white/30 resize-none"
                      placeholder="What help, skill, or resource do you need?"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Ideal Partner <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.ideal_partner}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, ideal_partner: event.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-white/30"
                      placeholder="Who is the best fit?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Timeline <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.timeline}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, timeline: event.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-white/30"
                      placeholder="Example: 2 to 4 weeks"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Commitment <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.commitment}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, commitment: event.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-white/30"
                      placeholder="Example: 3 hours per week"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={createForm.tags}
                      onChange={(event) =>
                        setCreateForm((prev) => ({ ...prev, tags: event.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-white/30"
                      placeholder="growth, design, automation (comma separated)"
                    />
                  </div>
                </div>

                {createError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                    {createError}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-500">
                    Posting as {user?.user_metadata?.full_name || user?.email || "Member"}
                  </p>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-6 py-2.5 bg-white text-black hover:bg-white/90 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {isCreating ? "Posting..." : "Post Idea"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {selectedIdea && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedIdea(null)}
            />
            <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden flex flex-col">
              <div className="flex items-start gap-4 p-6 border-b border-white/10">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full border ${typeBadgeClasses[selectedIdea.idea_type]}`}
                    >
                      {typeLabels[selectedIdea.idea_type]}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusBadgeClasses[selectedIdea.status]}`}
                    >
                      {statusLabels[selectedIdea.status]}
                    </span>
                    {selectedIdea.my_hand_intent && (
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full border ${intentBadgeClasses[selectedIdea.my_hand_intent]}`}
                      >
                        Your hand: {intentLabels[selectedIdea.my_hand_intent]}
                      </span>
                    )}
                    {selectedIdea.my_hand_accepted && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                        Accepted
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    {selectedIdea.title}
                  </h2>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>Posted {formatDate(selectedIdea.created_at)}</span>
                    <span className="text-slate-600">|</span>
                    <span>{selectedIdea.author_name || "Member"}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIdea(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
                  <div className="space-y-6">
                    {detailItems.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {detailItems.map((item) => (
                          <div
                            key={item.label}
                            className={`bg-white/5 border border-white/10 rounded-xl p-4 ${
                              item.full ? "md:col-span-2" : ""
                            }`}
                          >
                            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                              {item.label}
                            </p>
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {normalizeTags(selectedIdea.tags).length > 0 && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 mb-3">
                          <Tag className="w-4 h-4" />
                          Tags
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {normalizeTags(selectedIdea.tags).map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 mb-3">
                        <MessageSquare className="w-4 h-4" />
                        Community Q&A
                      </div>
                      {questionsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        </div>
                      ) : questions.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          Ask a question or share insight to get the discussion started.
                        </p>
                      ) : (
                        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                          {questions.map((question) => (
                            <div key={question.id} className="bg-black/40 border border-white/10 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                {question.author_avatar_url ? (
                                  <img
                                    src={question.author_avatar_url}
                                    alt={question.author_name || "Member"}
                                    className="w-6 h-6 rounded-full object-cover border border-white/10"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-semibold text-slate-200">
                                    {getInitials(question.author_name)}
                                  </div>
                                )}
                                <span className="text-xs text-white font-semibold">
                                  {question.author_name || "Member"}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {formatDate(question.created_at)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {question.body}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      <form onSubmit={postQuestion} className="mt-4 space-y-2">
                        <textarea
                          value={questionBody}
                          onChange={(event) => setQuestionBody(event.target.value)}
                          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 resize-none"
                          rows={3}
                          placeholder="Ask a question or share an answer..."
                        />
                        {questionError && (
                          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                            {questionError}
                          </div>
                        )}
                        <button
                          type="submit"
                          disabled={questionSaving || !questionBody.trim()}
                          className="w-full py-2 bg-white text-black hover:bg-white/90 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {questionSaving ? "Posting..." : "Post to Q&A"}
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">
                      Posted by
                    </p>
                      <div className="flex items-center gap-3">
                        {selectedIdea.author_avatar_url ? (
                          <img
                            src={selectedIdea.author_avatar_url}
                            alt={selectedIdea.author_name || "Member"}
                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm font-semibold text-slate-200">
                            {getInitials(selectedIdea.author_name)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {selectedIdea.author_name || "Member"}
                          </p>
                          <p className="text-xs text-slate-500">
                            Posted {formatDate(selectedIdea.created_at)}
                          </p>
                    </div>
                  </div>

                  {selectedIdea.is_owner && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">
                        Status
                      </p>
                      <select
                        value={selectedIdea.status}
                        onChange={(event) =>
                          updateIdeaStatus(event.target.value as IdeaStatus)
                        }
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30"
                        disabled={statusSaving}
                      >
                        <option value="open">Open</option>
                        <option value="paused">Paused</option>
                        <option value="matched">Matched</option>
                        <option value="closed">Closed</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-2">
                        Mark as matched when you finalize partners.
                      </p>
                      <button
                        onClick={handleDeleteIdea}
                        disabled={ideaDeleting}
                        className="w-full mt-4 px-3 py-2 rounded-lg text-xs font-semibold text-red-300 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {ideaDeleting ? "Deleting..." : "Delete Idea"}
                      </button>
                    </div>
                  )}
                    </div>

                    {selectedIdea.is_owner ? (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">
                          Hands raised
                        </p>
                        {handsLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          </div>
                        ) : hands.length === 0 ? (
                          <p className="text-sm text-slate-400">
                            No one has raised a hand yet.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {hands.map((hand) => {
                              const thread = threads.find(
                                (item) => item.participant_id === hand.user_id
                              );
                              return (
                                <div
                                  key={hand.id}
                                  className="bg-black/40 border border-white/10 rounded-lg p-3"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-white">
                                      {hand.user_name || "Member"}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-xs font-semibold px-2 py-1 rounded-full border ${intentBadgeClasses[hand.intent]}`}
                                      >
                                        {intentLabels[hand.intent]}
                                      </span>
                                      {hand.accepted_at && (
                                        <span className="text-xs font-semibold px-2 py-1 rounded-full border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                                          Accepted
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {hand.message && (
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                      {hand.message}
                                    </p>
                                  )}
                                  {hand.contact && (
                                    <p className="text-xs text-slate-500 mt-2">
                                      Contact: {hand.contact}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-3">
                                    {hand.accepted_at ? (
                                      thread ? (
                                        <button
                                          onClick={() => openThread(thread.id)}
                                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg"
                                        >
                                          Open Chat
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleAcceptHand(hand)}
                                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg"
                                        >
                                          Create Chat
                                        </button>
                                      )
                                    ) : (
                                      <button
                                        onClick={() => handleAcceptHand(hand)}
                                        className="px-3 py-1.5 bg-white text-black hover:bg-white/90 text-xs font-semibold rounded-lg"
                                      >
                                        Accept
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleRemoveHandAsOwner(hand)}
                                      disabled={handRemoving}
                                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-lg disabled:opacity-50"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">
                          Raise your hand
                        </p>
                        {selectedIdea.my_hand_intent ? (
                          <form onSubmit={handleUpdateHand} className="space-y-3">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span>Current intent:</span>
                              <span className="text-white">
                                {intentLabels[selectedIdea.my_hand_intent]}
                              </span>
                              {selectedIdea.my_hand_accepted && (
                                <span className="text-emerald-300 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Accepted
                                </span>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs text-slate-400 mb-2">
                                Update intent
                              </label>
                              <select
                                value={handIntent}
                                onChange={(event) =>
                                  setHandIntent(event.target.value as HandIntent)
                                }
                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30"
                              >
                                <option value="interested">Interested</option>
                                <option value="can_help">Can help</option>
                                <option value="partner">Partner</option>
                              </select>
                            </div>
                            {handError && (
                              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                                {handError}
                              </div>
                            )}
                            <div className="flex flex-col gap-2">
                              <button
                                type="submit"
                                disabled={handSaving}
                                className="w-full py-2.5 bg-white text-black hover:bg-white/90 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                              >
                                {handSaving ? "Updating..." : "Update Intent"}
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveHand}
                                disabled={handSaving}
                                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                              >
                                Put Hand Down
                              </button>
                            </div>
                          </form>
                        ) : (
                          <form onSubmit={handleRaiseHand} className="space-y-3">
                            <div>
                              <label className="block text-xs text-slate-400 mb-2">
                                Intent
                              </label>
                              <select
                                value={handIntent}
                                onChange={(event) =>
                                  setHandIntent(event.target.value as HandIntent)
                                }
                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30"
                              >
                                <option value="interested">Interested</option>
                                <option value="can_help">Can help</option>
                                <option value="partner">Partner</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs text-slate-400 mb-2">
                                Message
                              </label>
                              <textarea
                                value={handMessage}
                                onChange={(event) => setHandMessage(event.target.value)}
                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30 resize-none"
                                rows={3}
                                placeholder="Share how you can help"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-slate-400 mb-2">
                                Contact
                              </label>
                              <input
                                type="text"
                                value={handContact}
                                onChange={(event) => setHandContact(event.target.value)}
                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30"
                                placeholder="Email, Twitter, or preferred contact"
                              />
                            </div>

                            {handError && (
                              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                                {handError}
                              </div>
                            )}

                            <button
                              type="submit"
                              disabled={handSaving}
                              className="w-full py-2.5 bg-white text-black hover:bg-white/90 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                              {handSaving ? "Sending..." : "Raise Hand"}
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    {(selectedIdea.is_owner || selectedIdea.my_hand_accepted) && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs uppercase tracking-wider text-slate-500">
                            Private Messages
                          </p>
                          {activeThread && (
                            <button
                              onClick={() => handleDeleteThread(activeThread.id)}
                              disabled={threadDeleting}
                              className="text-[11px] font-semibold text-red-300 hover:text-red-200 disabled:opacity-50"
                            >
                              {threadDeleting ? "Deleting..." : "Delete Chat"}
                            </button>
                          )}
                        </div>
                        {threadsLoading && !activeThread && (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          </div>
                        )}
                        {!threadsLoading && threads.length === 0 ? (
                          <p className="text-xs text-slate-500">
                            {selectedIdea.is_owner
                              ? "No chats yet. Accept a hand to start."
                              : selectedIdea.my_hand_accepted
                                ? "You're accepted, but the chat isn't ready yet. Ask the owner to retry."
                                : "Messages unlock once a hand is accepted."}
                          </p>
                        ) : activeThread ? (
                          <div className="space-y-3">
                            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                              {threadMessages.map((message) => {
                                const isMine = message.sender_id === user?.id;
                                return (
                                  <div
                                    key={message.id}
                                    className={`text-xs rounded-lg px-3 py-2 ${
                                      isMine
                                        ? "bg-white text-black ml-auto"
                                        : "bg-white/10 text-slate-200"
                                    }`}
                                  >
                                    {message.body}
                                  </div>
                                );
                              })}
                              {!threadMessagesLoading && threadMessages.length === 0 && (
                                <p className="text-xs text-slate-500">No messages yet.</p>
                              )}
                              {threadMessagesLoading && (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                                </div>
                              )}
                            </div>
                            {threadMessageError && (
                              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                                {threadMessageError}
                              </div>
                            )}
                            <form onSubmit={sendThreadMessage} className="flex gap-2">
                              <input
                                type="text"
                                value={threadMessageBody}
                                onChange={(event) => setThreadMessageBody(event.target.value)}
                                className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white/30"
                                placeholder="Send a message..."
                              />
                              <button
                                type="submit"
                                disabled={threadMessageSaving || !threadMessageBody.trim()}
                                className="px-3 py-2 bg-white text-black hover:bg-white/90 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                              >
                                Send
                              </button>
                            </form>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-500">
                              Select a partner to start chatting.
                            </p>
                            {threadMessageError && (
                              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                                {threadMessageError}
                              </div>
                            )}
                            <div className="space-y-2">
                              {threads.map((thread) => {
                                const partner = selectedIdea.is_owner
                                  ? hands.find((hand) => hand.user_id === thread.participant_id)
                                  : null;
                                const partnerName = selectedIdea.is_owner
                                  ? partner?.user_name || "Member"
                                  : selectedIdea.author_name || "Idea owner";
                                return (
                                  <button
                                    key={thread.id}
                                    onClick={() => openThread(thread.id)}
                                    className="w-full flex items-center justify-between px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white"
                                  >
                                    <span>{partnerName}</span>
                                    <span className="text-slate-400">Open</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TheWorkshopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
      <TheWorkshopClient />
    </Suspense>
  );
}
