import { useState } from 'react';
import { Shell } from './components/layout/Shell.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { RepoDetailPage } from './pages/RepoDetailPage.js';
import { WorkflowStudioPage } from './pages/WorkflowStudioPage.js';
import { PipelineRunPage } from './pages/PipelineRunPage.js';
import { AppCatalogPage } from './pages/AppCatalogPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedRepoId, setSelectedRepoId] = useState<string | undefined>();
  const [selectedRunId, setSelectedRunId] = useState<string | undefined>();

  const handleNavigate = (tab: string, contextId?: string) => {
    setCurrentTab(tab);
    if (tab === 'repositories') {
      setSelectedRepoId(contextId);
    } else if (tab === 'workflow-studio') {
      if (contextId) setSelectedRepoId(contextId);
    } else if (tab === 'pipeline-runs') {
      setSelectedRunId(contextId);
    }
  };

  return (
    <Shell currentTab={currentTab} onTabChange={(tab) => handleNavigate(tab)}>
      {currentTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
      {currentTab === 'repositories' && (
        <RepoDetailPage repoId={selectedRepoId} onNavigate={handleNavigate} />
      )}
      {currentTab === 'workflow-studio' && (
        <WorkflowStudioPage initialRepoId={selectedRepoId} onNavigate={handleNavigate} />
      )}
      {currentTab === 'pipeline-runs' && (
        <PipelineRunPage runId={selectedRunId} onNavigate={handleNavigate} />
      )}
      {currentTab === 'app-catalog' && <AppCatalogPage onNavigate={handleNavigate} />}
      {currentTab === 'settings' && <SettingsPage />}
    </Shell>
  );
}

export default App;
