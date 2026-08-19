import React, { useState, useEffect } from 'react';
import {
  Play,
  FileCode,
  Layers,
  ArrowRight,
  Terminal,
  Settings2,
  RefreshCw,
  Save,
  Check,
  Cpu,
} from 'lucide-react';
import {
  Repository,
  ProjectDetection,
  WorkflowDefinition,
  WorkflowNode,
} from '../types/client.types.js';
import styles from './WorkflowStudioPage.module.css';

interface WorkflowStudioProps {
  initialRepoId?: string;
  onNavigate: (tab: string, contextId?: string) => void;
}

export const WorkflowStudioPage: React.FC<WorkflowStudioProps> = ({
  initialRepoId,
  onNavigate,
}) => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>(initialRepoId || '');
  const [detection, setDetection] = useState<ProjectDetection | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchRepos();
  }, []);

  useEffect(() => {
    if (selectedRepoId) {
      scanRepository(selectedRepoId);
    }
  }, [selectedRepoId]);

  const fetchRepos = async () => {
    try {
      const res = await fetch('/api/repos');
      const data = await res.json();
      setRepos(data);
      if (!selectedRepoId && data.length > 0) {
        setSelectedRepoId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch repos', err);
    }
  };

  const scanRepository = async (repoId: string) => {
    try {
      setIsScanning(true);
      const res = await fetch(`/api/repos/${repoId}/workflows/generate`, {
        method: 'POST',
      });
      const data = await res.json();
      setDetection(data.detection);
      setWorkflow(data.workflow);
      if (data.workflow?.nodes?.length > 0) {
        setSelectedNode(data.workflow.nodes[0]);
      }
    } catch (err) {
      console.error('Failed to scan repo', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCommandChange = (newCommand: string) => {
    if (!workflow || !selectedNode) return;
    const updatedNodes = workflow.nodes.map((n) =>
      n.id === selectedNode.id ? { ...n, command: newCommand } : n
    );
    const updatedWorkflow = { ...workflow, nodes: updatedNodes };
    setWorkflow(updatedWorkflow);
    setSelectedNode({ ...selectedNode, command: newCommand });
  };

  const handleSaveWorkflow = async () => {
    if (!workflow) return;
    try {
      setIsSaving(true);
      await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save workflow', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunPipeline = async () => {
    if (!workflow || !selectedRepoId) return;
    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: workflow.id,
          repoId: selectedRepoId,
          trigger: 'manual',
        }),
      });
      const run = await res.json();
      onNavigate('pipeline-runs', run.id);
    } catch (err) {
      console.error('Failed to trigger run', err);
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Action Bar */}
      <div className={styles.actionBar}>
        <div className={styles.selectorGroup}>
          <label htmlFor="repo-selector" className={styles.pickerLabel}>
            Target Repository:
          </label>
          <select
            id="repo-selector"
            className={styles.repoSelect}
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(e.target.value)}
          >
            {repos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.language})
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => scanRepository(selectedRepoId)}
            disabled={isScanning}
            aria-label="Re-scan repository manifests"
          >
            <RefreshCw size={13} className={isScanning ? styles.spin : ''} />
            <span>{isScanning ? 'Analyzing AST...' : 'Scan Repository'}</span>
          </button>
        </div>

        <div className={styles.actionButtons}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleSaveWorkflow}
            disabled={isSaving}
          >
            {saveSuccess ? <Check size={14} /> : <Save size={14} />}
            <span>{saveSuccess ? 'Saved' : 'Save Workflow'}</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleRunPipeline}
            disabled={!workflow}
          >
            <Play size={14} />
            <span>Run Pipeline</span>
          </button>
        </div>
      </div>

      {/* Detection Metadata Card */}
      {detection && (
        <div className={styles.evidenceCard}>
          <div className={styles.evidenceHeader}>
            <div className={styles.evidenceTitleWrap}>
              <Cpu size={15} />
              <h2 className={styles.evidenceTitle}>Inferred Toolchain & Target</h2>
            </div>
            <span className="status-pill neutral">
              {detection.framework} • {detection.buildTool}
            </span>
          </div>

          <div className={styles.detectionPills}>
            <div className={styles.pillItem}>
              <span className={styles.pillLabel}>Build Tool:</span>
              <span className={styles.pillValue}>{detection.buildTool}</span>
            </div>
            <div className={styles.pillItem}>
              <span className={styles.pillLabel}>Test Tool:</span>
              <span className={styles.pillValue}>{detection.testTool}</span>
            </div>
            <div className={styles.pillItem}>
              <span className={styles.pillLabel}>Package Format:</span>
              <span className={styles.pillValue}>
                {detection.packageFormat} ({detection.targetPlatform})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2-Column Studio Grid: Left DAG Canvas (1fr), Right Inspector (360px) */}
      <div className={styles.studioGrid}>
        {/* Left Column: DAG Node Canvas */}
        <div className={styles.dagCanvasCard}>
          <div className={styles.canvasHeader}>
            <div className={styles.canvasTitleWrap}>
              <Layers size={15} />
              <h2>Execution Flow (DAG)</h2>
            </div>
            <span className={styles.stageCountPill}>
              {workflow?.nodes?.length || 0} Stages Sequential
            </span>
          </div>

          <div className={styles.nodesTrack}>
            {workflow?.nodes.map((node, index) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <React.Fragment key={node.id}>
                  <div
                    className={`${styles.nodeCard} ${isSelected ? styles.nodeCardActive : ''}`}
                    onClick={() => setSelectedNode(node)}
                  >
                    <div className={styles.nodeTopRow}>
                      <div className={styles.nodeOrderBadge}>{index + 1}</div>
                      <div className={styles.nodeNameWrap}>
                        <span className={styles.nodeStageName}>{node.name}</span>
                        <span className={styles.nodeRunnerPill}>{node.runnerLabel}</span>
                      </div>
                    </div>

                    <div className={styles.nodeCmdPreview}>
                      <Terminal size={12} />
                      <code>{node.command}</code>
                    </div>

                    {node.evidenceCitation && (
                      <div className={styles.nodeCitationRow}>
                        <span className={styles.nodeCitationText}>{node.evidenceCitation}</span>
                      </div>
                    )}
                  </div>

                  {index < workflow.nodes.length - 1 && (
                    <div className={styles.nodeConnector}>
                      <div className={styles.connectorLine} />
                      <ArrowRight size={14} className={styles.connectorArrow} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right Column: Stage Parameters Inspector */}
        <div className={styles.inspectorCard}>
          <div className={styles.inspectorHeader}>
            <div className={styles.inspectorTitleWrap}>
              <Settings2 size={15} />
              <h2>Stage Parameters</h2>
            </div>
            {selectedNode && (
              <span className="status-pill neutral">{selectedNode.phase}</span>
            )}
          </div>

          {selectedNode ? (
            <div className={styles.inspectorBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Stage Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={selectedNode.name}
                  disabled
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Runner Pool</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={selectedNode.runnerLabel}
                  disabled
                />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.formLabelRow}>
                  <label className={styles.formLabel}>Execution Command</label>
                  <Terminal size={12} />
                </div>
                <textarea
                  className={styles.formTextarea}
                  value={selectedNode.command}
                  onChange={(e) => handleCommandChange(e.target.value)}
                  rows={4}
                  spellCheck={false}
                />
              </div>

              {selectedNode.evidenceCitation && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Manifest Grounding</label>
                  <div className={styles.citationBox}>
                    <FileCode size={12} />
                    <span className={styles.citationBoxText}>{selectedNode.evidenceCitation}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.emptyInspector}>
              <p>Select a node on the left to inspect parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
