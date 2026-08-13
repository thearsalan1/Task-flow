import { useState } from "react";
import { type Task, type Priority } from "../types/types";

interface Props {
  mode: "create" | "edit";
  initialData?: Task;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    priority?: Priority;
  }) => void;
  submitting: boolean;
  error: string | null;
}

export default function TaskModal({
  mode,
  initialData,
  onClose,
  onSubmit,
  submitting,
  error,
}: Props) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [priority, setPriority] = useState<Priority>(
    initialData?.priority ?? "MEDIUM",
  );
  const [titleError, setTitleError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }
    setTitleError(null);
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-5 w-full max-w-sm shadow-lg">
        <h2 className="text-base font-semibold mb-4 text-blue-950 font-semibold">
          {mode === "create" ? "New Task" : "Edit Task"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              autoFocus
            />
            {titleError && (
              <p className="text-xs text-red-600 mt-1">{titleError}</p>
            )}
          </div>

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1.5 text-sm bg-blue-950 text-white rounded hover:cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
