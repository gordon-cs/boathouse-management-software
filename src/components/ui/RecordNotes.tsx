import { Textarea } from "@/components/ui/textarea";

type RecordNotesProps = {
  notes: string | null;
};

function RecordNotes({ notes }: RecordNotesProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">Notes</span>
      <Textarea readOnly value={notes ?? ""} />
    </label>
  );
}

export default RecordNotes;
