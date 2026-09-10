import { getContent } from "@/lib/content";
import { AdminEditor } from "@/components/admin/AdminEditor";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const content = await getContent();
  return <AdminEditor initial={content} />;
}
