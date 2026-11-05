import { Textarea } from "@/components/ui/textarea";

type RecordNotesProps = {
  notes: string | null;
};

function RecordNotes({ notes }: RecordNotesProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">Notes</span>
      <Textarea defaultValue={notes ?? ""} />
      <span className="block text-sm text-muted-foreground">
        Changes are not saved yet.
      </span>
    </label>
  );
}

export default RecordNotes;
