import { useMemo, useState } from 'react';

type HarnessStageId = 'scope' | 'compose' | 'run' | 'review' | 'ship';
type HarnessView = 'matrix' | 'context' | 'packages';
type ProviderId = 'openai' | 'anthropic' | 'google' | 'local';
type ModeId = 'interactive' | 'print' | 'rpc' | 'sdk';
type InstallId = 'curl' | 'npm' | 'pnpm' | 'bun';

interface HarnessStage {
  id: HarnessStageId;
  step: string;
  title: string;
  gate: string;
  stance: 'single-agent' | 'optional helper' | 'recommended helper' | 'required helper';
  riskQuestion: string;
  skills: string[];
  extensions: string[];
  packageName: string;
  budget: string;
  baseRisk: number;
  evidence: string[];
  followUps: string[];
}

interface RiskSignal {
  id: string;
  label: string;
  weight: number;
  defaultFor: HarnessStageId[];
}

interface Provider {
  id: ProviderId;
  label: string;
  model: string;
  role: string;
}

interface ModeDefinition {
  id: ModeId;
  label: string;
  command: string;
  output: string;
}

const HARNESS_STAGES: HarnessStage[] = [
  {
    id: 'scope',
    step: '01',
    title: 'Scope',
    gate: 'Type 1 boundary',
    stance: 'single-agent',
    riskQuestion: 'Can this decision be reversed without rewriting ownership, data, or customer trust?',
    skills: ['grill-me', 'ideas-radar', 'todo-router-audit'],
    extensions: ['boundary-map', 'decision-log'],
    packageName: '@type1skills/pi-boundary',
    budget: 'economy',
    baseRisk: 16,
    evidence: ['owner named', 'non-goals written', 'rollback path known'],
    followUps: [
      'Narrow the boundary to files the agent may own.',
      'Name the first proof that would make a human comfortable.',
    ],
  },
  {
    id: 'compose',
    step: '02',
    title: 'Compose',
    gate: 'Prompt and context',
    stance: 'optional helper',
    riskQuestion: 'Will this context package steer the agent into a path that is hard to unwind?',
    skills: ['skill-regression-check', 'skills-radar', 'ontology'],
    extensions: ['prompt-pack', 'context-budget', 'theme-kit'],
    packageName: '@type1skills/pi-context',
    budget: 'standard',
    baseRisk: 24,
    evidence: ['instructions layered', 'compaction policy set', 'context source cited'],
    followUps: [
      'Remove context that would make the agent overconfident.',
      'Switch model before running if the risk lens changed.',
    ],
  },
  {
    id: 'run',
    step: '03',
    title: 'Run',
    gate: 'Steerable execution',
    stance: 'recommended helper',
    riskQuestion: 'Is the agent allowed to continue after new evidence changes the risk class?',
    skills: ['route-scaffolding', 'solve-next-project', 'systematic-debugging'],
    extensions: ['live-steer', 'branch-history', 'model-switch'],
    packageName: '@type1skills/pi-runner',
    budget: 'deep',
    baseRisk: 38,
    evidence: ['owned files locked', 'stop conditions armed', 'follow-up channel open'],
    followUps: [
      'Steer the run with a new constraint instead of restarting the session.',
      'Branch the conversation tree before trying a riskier path.',
    ],
  },
  {
    id: 'review',
    step: '04',
    title: 'Review',
    gate: 'Evidence bundle',
    stance: 'required helper',
    riskQuestion: 'Would a reviewer merge this without knowing the tests, residual risk, and rollback plan?',
    skills: ['verification-before-completion', 'security-review', 'test-it'],
    extensions: ['evidence-pack', 'risk-review', 'test-ledger'],
    packageName: '@type1skills/pi-review',
    budget: 'deep',
    baseRisk: 44,
    evidence: ['tests linked', 'residual risk explicit', 'reviewer questions answered'],
    followUps: [
      'Ask the agent to defend the weakest piece of evidence.',
      'Keep the pack editable so humans can correct the risk story.',
    ],
  },
  {
    id: 'ship',
    step: '05',
    title: 'Ship',
    gate: 'Release hold',
    stance: 'single-agent',
    riskQuestion: 'What would make this release irreversible after it leaves the local harness?',
    skills: ['workspace-preview', 'release-enforcer', 'git-it'],
    extensions: ['release-check', 'share-export'],
    packageName: '@type1skills/pi-release',
    budget: 'standard',
    baseRisk: 34,
    evidence: ['preview reachable', 'CI truth checked', 'export shared'],
    followUps: [
      'Hold release when auth, CI, PR, or deploy truth is uncertain.',
      'Export the conversation branch that explains the final decision.',
    ],
  },
];

const RISK_SIGNALS: RiskSignal[] = [
  {
    id: 'irreversible-data',
    label: 'Data shape or migration is hard to undo',
    weight: 24,
    defaultFor: ['scope', 'ship'],
  },
  {
    id: 'auth-billing',
    label: 'Auth, billing, entitlement, or permission boundary',
    weight: 26,
    defaultFor: ['scope', 'review'],
  },
  {
    id: 'agent-edits',
    label: 'Agent may edit production-owned files',
    weight: 18,
    defaultFor: ['run'],
  },
  {
    id: 'context-drift',
    label: 'Prompt, skill, or context drift changes behavior',
    weight: 16,
    defaultFor: ['compose'],
  },
  {
    id: 'no-rollback',
    label: 'Rollback or kill switch is not yet named',
    weight: 22,
    defaultFor: ['review', 'ship'],
  },
  {
    id: 'weak-evidence',
    label: 'Evidence is a summary instead of a reproducible proof',
    weight: 14,
    defaultFor: ['review'],
  },
];

const PROVIDERS: Provider[] = [
  { id: 'openai', label: 'OpenAI', model: 'gpt-5.5', role: 'deep reasoning lead' },
  { id: 'anthropic', label: 'Anthropic', model: 'claude-sonnet', role: 'review challenger' },
  { id: 'google', label: 'Google', model: 'gemini-pro', role: 'wide context pass' },
  { id: 'local', label: 'Local', model: 'qwen3-coder', role: 'private repo pass' },
];

const MODES: ModeDefinition[] = [
  {
    id: 'interactive',
    label: 'Interactive',
    command: 'type1skills run',
    output: 'branching chat with live steering',
  },
  {
    id: 'print',
    label: 'Print / JSON',
    command: 'type1skills print --json',
    output: 'structured evidence for CI or logs',
  },
  {
    id: 'rpc',
    label: 'RPC',
    command: 'type1skills rpc --port 4317',
    output: 'long-running harness service',
  },
  {
    id: 'sdk',
    label: 'SDK',
    command: 'import { createHarness } from "type1skills"',
    output: 'embedded agent control layer',
  },
];

const INSTALL_COMMANDS: Record<InstallId, string> = {
  curl: 'curl -fsSL https://type1skills.com/install.sh | sh',
  npm: 'npm install -g type1skills',
  pnpm: 'pnpm add -g type1skills',
  bun: 'bun add -g type1skills',
};

const EXTENSIBILITY = [
  ['Extensions', 'Add detectors, model adapters, export sinks, review gates, and release holds without widening core.'],
  ['Skills', 'Package reusable agent behaviors with stance, budget, evidence, and stop conditions.'],
  ['Prompt templates', 'Version prompt packs as context contracts instead of hidden chat folklore.'],
  ['Themes', 'Skin the harness for a team, workspace, or product without changing runtime behavior.'],
];

const NOT_BUILT = [
  'MCP in core',
  'Subagents as a mandatory primitive',
  'Plan mode ceremony',
  'Permission popups as product strategy',
  'Embedded to-do systems',
  'Provider lock-in',
];

function defaultSignalIds(stageId: HarnessStageId): string[] {
  return RISK_SIGNALS
    .filter((signal) => signal.defaultFor.includes(stageId))
    .map((signal) => signal.id);
}

function riskLabel(score: number): string {
  if (score >= 74) {
    return 'Type 1 hold';
  }
  if (score >= 48) {
    return 'Reviewer gate';
  }
  return 'Reversible';
}

function riskTone(score: number): string {
  if (score >= 74) {
    return 'hold';
  }
  if (score >= 48) {
    return 'gate';
  }
  return 'clear';
}

function AppLogo() {
  return (
    <div className="app-logo" aria-hidden="true">
      <span>T1</span>
    </div>
  );
}

export default function App() {
  const [activeStageId, setActiveStageId] = useState<HarnessStageId>('run');
  const [activeProviderId, setActiveProviderId] = useState<ProviderId>('openai');
  const [activeModeId, setActiveModeId] = useState<ModeId>('interactive');
  const [activeInstallId, setActiveInstallId] = useState<InstallId>('curl');
  const [activeView, setActiveView] = useState<HarnessView>('matrix');
  const [selectedSignalIds, setSelectedSignalIds] = useState<string[]>(() => defaultSignalIds('run'));

  const activeStage = HARNESS_STAGES.find((stage) => stage.id === activeStageId) ?? HARNESS_STAGES[0];
  const activeProvider = PROVIDERS.find((provider) => provider.id === activeProviderId) ?? PROVIDERS[0];
  const activeMode = MODES.find((mode) => mode.id === activeModeId) ?? MODES[0];

  const selectedSignals = useMemo(
    () => RISK_SIGNALS.filter((signal) => selectedSignalIds.includes(signal.id)),
    [selectedSignalIds],
  );

  const riskScore = Math.min(
    100,
    activeStage.baseRisk + selectedSignals.reduce((sum, signal) => sum + signal.weight, 0),
  );
  const tone = riskTone(riskScore);

  const harnessPreview = [
    `type1skills harness ${activeStage.id}`,
    `  --mode ${activeMode.id}`,
    `  --provider ${activeProvider.id}`,
    `  --model ${activeProvider.model}`,
    `  --package ${activeStage.packageName}`,
    `  --risk ${riskScore}`,
  ].join('\n');

  function switchStage(stageId: HarnessStageId) {
    setActiveStageId(stageId);
    setSelectedSignalIds(defaultSignalIds(stageId));
  }

  function toggleSignal(signalId: string) {
    setSelectedSignalIds((current) => {
      if (current.includes(signalId)) {
        return current.filter((id) => id !== signalId);
      }

      return [...current, signalId];
    });
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand-lockup" href="#top" aria-label="Type1Skills home">
          <AppLogo />
          <span>Type1Skills</span>
        </a>
        <nav className="topnav" aria-label="Primary navigation">
          <a href="#harness">Harness</a>
          <a href="#matrix">Matrix</a>
          <a href="#packages">Pi packages</a>
          <a href="#philosophy">Philosophy</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero-section" id="harness">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Type 1 risk harness for code agents</p>
              <h1>Adapt the coding agent to your workflow, not the other way around.</h1>
              <p className="hero-lede">
                Type1Skills is a code-agent harness built around Type 1 impact: decisions that become expensive,
                risky, or impossible to reverse once the agent acts.
              </p>
              <div className="install-panel" aria-label="Installation command">
                <div className="install-tabs" role="tablist" aria-label="Installer">
                  {(Object.keys(INSTALL_COMMANDS) as InstallId[]).map((installer) => (
                    <button
                      key={installer}
                      type="button"
                      role="tab"
                      aria-selected={activeInstallId === installer}
                      className={activeInstallId === installer ? 'is-active' : ''}
                      onClick={() => setActiveInstallId(installer)}
                    >
                      {installer}
                    </button>
                  ))}
                </div>
                <code>{INSTALL_COMMANDS[activeInstallId]}</code>
              </div>
              <div className="hero-actions" aria-label="Primary actions">
                <a className="button button-primary" href="mailto:pilots@type1skills.com?subject=Type1Skills%20harness%20pilot">
                  Pilot intake
                </a>
                <a className="button button-secondary" href="#matrix">
                  Open matrix
                </a>
              </div>
            </div>

            <div className="harness-console" aria-label="Type1Skills harness console">
              <div className="console-header">
                <div>
                  <p className="eyebrow">Live risk harness</p>
                  <h2>{activeStage.title}</h2>
                </div>
                <span className={`risk-pill risk-pill-${tone}`}>{riskLabel(riskScore)}</span>
              </div>

              <div className="stage-strip" aria-label="Harness stage selector">
                {HARNESS_STAGES.map((stage) => (
                  <button
                    key={stage.id}
                    type="button"
                    className={activeStage.id === stage.id ? 'is-active' : ''}
                    aria-pressed={activeStage.id === stage.id}
                    onClick={() => switchStage(stage.id)}
                  >
                    <span>{stage.step}</span>
                    <strong>{stage.title}</strong>
                  </button>
                ))}
              </div>

              <div className="score-layout">
                <div
                  className={`score-meter score-meter-${tone}`}
                  style={{ '--score': `${riskScore * 3.6}deg` } as React.CSSProperties}
                  aria-label={`Risk score ${riskScore} out of 100`}
                >
                  <span>{riskScore}</span>
                  <small>/100</small>
                </div>
                <div className="score-copy">
                  <strong>{activeStage.gate}</strong>
                  <p>{activeStage.riskQuestion}</p>
                  <div className="score-meta">
                    <span>{activeStage.stance}</span>
                    <span>{activeStage.budget}</span>
                  </div>
                </div>
              </div>

              <div className="session-tree" aria-label="Shareable conversation tree">
                <span>root</span>
                <span>scope</span>
                <span className="is-active">run</span>
                <span>review</span>
                <span>share</span>
              </div>

              <div className="signal-list" aria-label="Risk signals">
                {RISK_SIGNALS.map((signal) => {
                  const checked = selectedSignalIds.includes(signal.id);
                  return (
                    <label key={signal.id} className={checked ? 'signal-row is-selected' : 'signal-row'}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSignal(signal.id)}
                      />
                      <span>{signal.label}</span>
                      <strong>+{signal.weight}</strong>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="matrix-section" id="matrix">
          <div className="section-inner">
            <div className="section-heading">
              <p className="eyebrow">Merged with the Skill Matrix</p>
              <h2>The matrix becomes the product spine.</h2>
              <p>
                Stance, SOUL lens, runtime budget, graph evidence, and cost drift now read as one harness contract:
                what can run, which package owns it, what proof is required, and when humans steer.
              </p>
            </div>

            <div className="view-tabs" role="tablist" aria-label="Harness views">
              {([
                ['matrix', 'Matrix'],
                ['context', 'Context'],
                ['packages', 'Packages'],
              ] as const).map(([view, label]) => (
                <button
                  key={view}
                  type="button"
                  role="tab"
                  aria-selected={activeView === view}
                  className={activeView === view ? 'is-active' : ''}
                  onClick={() => setActiveView(view)}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeView === 'matrix' && (
              <div className="matrix-table-wrap">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th>Gate</th>
                      <th>Stance</th>
                      <th>Skills</th>
                      <th>Extensions</th>
                      <th>Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HARNESS_STAGES.map((stage) => (
                      <tr key={stage.id} className={stage.id === activeStage.id ? 'is-active' : ''}>
                        <td>
                          <button type="button" onClick={() => switchStage(stage.id)}>
                            <strong>{stage.step} {stage.title}</strong>
                            <span>{stage.gate}</span>
                          </button>
                        </td>
                        <td><span className={`stance-chip stance-${stage.stance.replace(' ', '-')}`}>{stage.stance}</span></td>
                        <td>{stage.skills.join(', ')}</td>
                        <td>{stage.extensions.join(', ')}</td>
                        <td>{stage.evidence.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeView === 'context' && (
              <div className="context-grid">
                <article>
                  <span>Instructions</span>
                  <strong>Layered, inspectable, replaceable</strong>
                  <p>System, repo, skill, package, and follow-up instructions stay separate so context can be tuned without rewriting the workflow.</p>
                </article>
                <article>
                  <span>Compaction</span>
                  <strong>Risk-aware memory budget</strong>
                  <p>Conversation history is compacted around irreversible choices, evidence, and open stop conditions.</p>
                </article>
                <article>
                  <span>Branching</span>
                  <strong>Tree history with export</strong>
                  <p>Risky paths fork into branches that can be shared as JSON, markdown, or a review pack.</p>
                </article>
                <article>
                  <span>Steering</span>
                  <strong>Follow-up while the agent runs</strong>
                  <p>New constraints can steer the active run before the agent crosses a Type 1 boundary.</p>
                </article>
              </div>
            )}

            {activeView === 'packages' && (
              <div className="package-grid">
                {HARNESS_STAGES.map((stage) => (
                  <article key={stage.packageName}>
                    <span>{stage.title}</span>
                    <strong>{stage.packageName}</strong>
                    <code>npm i {stage.packageName}</code>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="runtime-section">
          <div className="section-inner runtime-grid">
            <div className="runtime-panel">
              <div className="section-heading compact">
                <p className="eyebrow">Providers and models</p>
                <h2>Switch models mid-session when the risk lens changes.</h2>
              </div>
              <div className="provider-grid" aria-label="Provider selector">
                {PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    className={activeProvider.id === provider.id ? 'is-active' : ''}
                    aria-pressed={activeProvider.id === provider.id}
                    onClick={() => setActiveProviderId(provider.id)}
                  >
                    <strong>{provider.label}</strong>
                    <span>{provider.model}</span>
                    <small>{provider.role}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="runtime-panel">
              <div className="section-heading compact">
                <p className="eyebrow">Four modes</p>
                <h2>Interactive, JSON, RPC, or SDK.</h2>
              </div>
              <div className="mode-list" aria-label="Mode selector">
                {MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className={activeMode.id === mode.id ? 'is-active' : ''}
                    aria-pressed={activeMode.id === mode.id}
                    onClick={() => setActiveModeId(mode.id)}
                  >
                    <strong>{mode.label}</strong>
                    <code>{mode.command}</code>
                    <span>{mode.output}</span>
                  </button>
                ))}
              </div>
            </div>

            <pre className="command-preview" aria-label="Harness command preview">{harnessPreview}</pre>
          </div>
        </section>

        <section className="packages-section" id="packages">
          <div className="section-inner package-layout">
            <div>
              <p className="eyebrow">Extensible core</p>
              <h2>Small core, Pi packages around it.</h2>
              <p>
                Type1Skills keeps the harness small and expects teams to install the pieces that fit their workflow
                through npm, pnpm, bun, or git.
              </p>
            </div>
            <div className="extension-grid">
              {EXTENSIBILITY.map(([label, copy]) => (
                <article key={label}>
                  <strong>{label}</strong>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="philosophy-section" id="philosophy">
          <div className="section-inner philosophy-grid">
            <div>
              <p className="eyebrow">What we did not build</p>
              <h2>The core refuses to become a platform-shaped maze.</h2>
              <p>
                The harness ships with a spine: Type 1 risk, context engineering, execution steering, evidence, and
                packaging. Everything else is expected to prove itself as an extension.
              </p>
            </div>
            <ul className="not-built-list">
              {NOT_BUILT.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="brand-lockup">
          <AppLogo />
          <span>Type1Skills</span>
        </div>
        <p>Risk-aware harnessing for agentic software work.</p>
      </footer>
    </div>
  );
}
