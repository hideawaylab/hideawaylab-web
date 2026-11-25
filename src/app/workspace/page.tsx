import { getCeoSession, isAuthConfigured } from "@/lib/auth";
import { siteConfig } from "@/config/site";
import { WorkspaceDashboard } from "@/components/workspace/WorkspaceDashboard";
import { WorkspaceLoginForm } from "@/components/workspace/WorkspaceLoginForm";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const session = await getCeoSession();

  if (session) {
    return (
      <WorkspaceDashboard mode="authenticated" ceoEmail={session.email} />
    );
  }

  return (
    <WorkspaceLoginForm
      isAuthConfigured={isAuthConfigured()}
      defaultEmail={siteConfig.business.email}
    />
  );
}
