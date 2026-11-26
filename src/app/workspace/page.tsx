import { getCeoSession, isAuthConfigured } from "@/lib/auth";
import { listTasksWithLogs } from "@/lib/db";
import { isGeminiConfigured } from "@/lib/ai-orchestrator";
import { siteConfig } from "@/config/site";
import { WorkspaceDashboard } from "@/components/workspace/WorkspaceDashboard";
import { WorkspaceLoginForm } from "@/components/workspace/WorkspaceLoginForm";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const session = await getCeoSession();

  if (session) {
    const initialTasks = listTasksWithLogs();
    return (
      <WorkspaceDashboard
        mode="authenticated"
        ceoEmail={session.email}
        initialTasks={initialTasks}
        hasGeminiApiKey={isGeminiConfigured()}
      />
    );
  }

  return (
    <WorkspaceLoginForm
      isAuthConfigured={isAuthConfigured()}
      defaultEmail={siteConfig.business.email}
    />
  );
}
