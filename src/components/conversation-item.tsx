// biome-ignore-all lint/a11y/useSemanticElements: Using role="button" for div with keyboard support is valid ARIA practice
import { Trash } from "@phosphor-icons/react";

interface ConversationItemProps {
  conversation: { id: string; title: string; lastUpdated: Date };
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: () => void;
  formatTime: (date: Date) => string;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  formatTime
}: ConversationItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(conversation.id);
    }
  };

  const handleDeleteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onDelete();
    }
  };

  return (
    <div
      className={`p-3 rounded-md cursor-pointer transition-colors group ${
        isActive
          ? "bg-blue-100 dark:bg-blue-900"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
      }`}
      onClick={() => onSelect(conversation.id)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Select conversation: ${conversation.title}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium truncate">{conversation.title}</p>
          <p className="text-xs text-muted-foreground">
            {formatTime(conversation.lastUpdated)}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onKeyDown={handleDeleteKeyDown}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
          aria-label={`Delete conversation: ${conversation.title}`}
          tabIndex={0}
          type="button"
        >
          <Trash size={14} />
        </button>
      </div>
    </div>
  );
}
