import { Powerup } from "@/lib/powerup-service";
import { Edit, Trash2 } from "lucide-react";

interface PowerupListProps {
  powerups: Powerup[];
  onEdit: (powerup: Powerup) => void;
  onDelete: (id: string) => void;
}

export default function PowerupList({ powerups, onEdit, onDelete }: PowerupListProps) {
  if (powerups.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-white mb-2">No powerups found</h3>
        <p className="text-slate-400">Create your first powerup to get started</p>
      </div>
    );
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "SKILL":
        return "bg-blue-600";
      case "PERSONA":
        return "bg-purple-600";
      case "KNOWLEDGE":
        return "bg-pink-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {powerups.map((powerup) => (
        <div
          key={powerup.id}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all group"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{powerup.icon || "⚡"}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-white line-clamp-1">
                  {powerup.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`${getBadgeColor(powerup.powerup_type)} text-white text-xs px-2 py-0.5 rounded-full font-medium`}>
                    {powerup.powerup_type}
                  </span>
                  {powerup.category && (
                    <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">
                      {powerup.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-400 line-clamp-2 mb-4">
            {powerup.description || "No description"}
          </p>

          {/* Tags */}
          {powerup.tags && powerup.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {powerup.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-white/5 text-slate-400 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
              {powerup.tags.length > 3 && (
                <span className="text-xs text-slate-500 px-2 py-1">
                  +{powerup.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
            <span>Used {powerup.usage_count || 0} times</span>
            <span>{new Date(powerup.created_at).toLocaleDateString()}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(powerup)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => onDelete(powerup.id)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
