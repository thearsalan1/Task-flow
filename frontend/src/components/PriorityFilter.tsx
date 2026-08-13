import { type Priority } from "../types/types";

interface Props {
  value: Priority | "ALL";
  onChange: (value: Priority | "ALL") => void;
}

export default function PriorityFilter({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Priority | "ALL")}
      className="border font-semibold px-3 py-1.5 text-sm bg-blue-950 text-white rounded-xl"
    >
      <option value="ALL">All priorities</option>
      <option value="HIGH">High</option>
      <option value="MEDIUM">Medium</option>
      <option value="LOW">Low</option>
    </select>
  );
}