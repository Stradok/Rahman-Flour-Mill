import { OwnerGuard } from "@/components/OwnerGuard";
import { EntriesManager } from "@/components/dashboard/EntriesManager";

export default function EntriesPage() {
  return (
    <OwnerGuard>
      <EntriesManager />
    </OwnerGuard>
  );
}
