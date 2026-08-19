import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
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
      {/* Precision Action Bar */}
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
            {saveSuccess ? <Check size={14} color="#22C55E" /> : <Save size={14} />}
            <span>{saveSuccess ? 'Saved' : 'Save Workflow'}</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleRunPipeline}
            disabled={!workflow}
          >
            <Play size={14} />
            <span>Run Delivery Pipeline</span>
          </button>
        </div>
      </div>

      {/* Grounded Evidence Box */}
      {detection && (
        <div className={styles.evidenceCard}>
          <div className={styles.evidenceHeader}>
            <div className={styles.evidenceTitleWrap}>
              <Cpu size={15} color="var(--color-primary)" />
              <h2 className={styles.evidenceTitle}>Inferred Toolchain & Target</h2>
            </div>
            <div className="status-pill success">
              <CheckCircle2 size={12} />
              <span>Deterministic Detection (High Confidence)</span>
            </div>
          </div>

          <div className={styles.detectionPills}>
            <div className={styles.pillItem}>
              <span className={styles.pillLabel}>Framework:</span>
              <span className={styles.pillValue}>{detection.framework}</span>
            </div>
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

          <div className={styles.citationList}>
            <span className={styles.citationSectionTitle}>Evidence Grounding Citations:</span>
            {detection.evidence.map((ev, i) => (
              <div key={i} className={styles.citationItem}>
                <FileCode size={13} color="var(--color-text-muted)" />
                <code className={styles.citationFile}>{ev.file}</code>
                <span className={styles.citationReason}>— {ev.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Studio Grid: DAG + Inspector */}
      <div className={styles.studioLayout}>
        {/* Left: Visual Workflow DAG */}
        <div className={styles.dagContainer}>
          <div className={styles.dagHeader}>
            <div className={styles.dagTitleWrap}>
              <Layers size={15} color="var(--color-text-muted)" />
              <h2>Delivery Stages (DAG)</h2>
            </div>
            <span className={styles.dagStepCount}>{workflow?.nodes.length || 0} Stages</span>
          </div>

          <div className={styles.nodeList}>
            {workflow?.nodes.map((node, index) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <React.Fragment key={node.id}>
                  <button
                    type="button"
                    className={`${styles.nodeCard} ${isSelected ? styles.nodeCardSelected : ''}`}
                    onClick={() => setSelectedNode(node)}
                    aria-label={`Inspect Stage ${index + 1}: ${node.name}`}
                  >
                    <div className={styles.nodeTop}>
                      <span className={styles.nodeIndex}>0{index + 1}</span>
                      <div className="status-pill neutral">{node.phase}</div>
                      <span className={styles.nodeRunner}>{node.runnerLabel}</span>
                    </div>

                    <div className={styles.nodeName}>{node.name}</div>

                    <div className={styles.nodeCmdWrap}>
                      <Terminal size={11} />
                      <code className={styles.nodeCmd}>{node.command}</code>
                    </div>
                  </button>

                  {index < workflow.nodes.length - 1 && (
                    <div className={styles.nodeConnector}>
                      <div className={styles.connectorLine} />
                      <ArrowRight size={12} className={styles.connectorArrow} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right: Step Inspector Drawer */}
        <div className={styles.inspectorDrawer}>
          <div className={styles.inspectorHeader}>
            <div className={styles.inspectorTitleWrap}>
              <Settings2 size={15} />
              <h2>Stage Configuration</h2>
            </div>
          </div>

          {selectedNode ? (
            <div className={styles.inspectorBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Stage Identifier</label>
                <input
                  type="text"
                  className={styles.textInput}
                  value={selectedNode.id}
                  disabled
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Stage Name</label>
                <input
                  type="text"
                  className={styles.textInput}
                  value={selectedNode.name}
                  disabled
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Lifecycle Phase</label>
                <div>
                  <span className="status-pill info">{selectedNode.phase}</span>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Assigned Runner Label</label>
                <input
                  type="text"
                  className={styles.textInput}
                  value={selectedNode.runnerLabel}
                  disabled
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Command (Override Allowed)</label>
                <textarea
                  className={styles.cmdTextArea}
                  rows={4}
                  value={selectedNode.command}
                  onChange={(e) => handleCommandChange(e.target.value)}
                />
                <span className={styles.fieldHint}>
                  Executes in isolated local process sandbox with network egress policy.
                </span>
              </div>

              {selectedNode.evidenceCitation && (
                <div className={styles.citationBox}>
                  <div className={styles.citationBoxTitle}>Grounding Citation:</div>
                  <p className={styles.citationBoxText}>{selectedNode.evidenceCitation}</p>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.noSelection}>Select a stage to inspect parameters</div>
          )}
        </div>
      </div>
    </div>
  );
};
