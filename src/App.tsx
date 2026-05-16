import { useMemo, useState } from 'react';

type InstallId = 'curl' | 'npm' | 'pnpm' | 'bun';
type ThemeMode = 'auto' | 'light' | 'dark';
type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mistral'
  | 'xai'
  | 'deepseek';
type ModeId = 'interactive' | 'json' | 'rpc' | 'sdk';
type SkillStage = 'Full pipeline' | 'IDEAS' | 'INCUBATING' | 'APPROVING' | 'TODO' | 'DOING' | 'DONE';

interface InstallCommand {
  id: InstallId;
  label: string;
  command: string;
}

interface Provider {
  id: ProviderId;
  name: string;
  models: string;
  command: string;
  shortcut: string;
}

interface Mode {
  id: ModeId;
  label: string;
  headline: string;
  command: string;
  detail: string;
}

interface SkillMatrixItem {
  stage: SkillStage;
  name: string;
  description: string;
  command: string;
  featured?: boolean;
}

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Docs', href: '#docs' },
  { label: 'Skills', href: '#skills' },
  { label: 'News', href: '#news' },
  { label: 'Packages', href: '#packages' },
  { label: 'Models', href: '#models' },
];

const installCommands: InstallCommand[] = [
  {
    id: 'curl',
    label: 'curl',
    command: 'curl -fsSL https://www.type1skills.com/install.sh | sh',
  },
  {
    id: 'npm',
    label: 'npm',
    command: 'npm install -g https://github.com/vibelibs/type1skills/archive/refs/heads/main.tar.gz',
  },
  {
    id: 'pnpm',
    label: 'pnpm',
    command: 'pnpm add -g https://github.com/vibelibs/type1skills/archive/refs/heads/main.tar.gz',
  },
  {
    id: 'bun',
    label: 'bun',
    command: 'bun add -g https://github.com/vibelibs/type1skills/archive/refs/heads/main.tar.gz',
  },
];

const themeModes: Array<{ id: ThemeMode; label: string }> = [
  { id: 'auto', label: 'Auto' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

const providerNames = [
  'OpenAI',
  'Anthropic',
  'Google',
  'Mistral',
  'Meta',
  'Cohere',
  'Groq',
  'xAI',
  'Perplexity',
  'DeepSeek',
  'Together',
  'Cerebras',
  'Fireworks',
  'AWS Bedrock',
  'Azure AI',
  'Ollama',
];

const providers: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: 'GPT-5.5, GPT-5.4, o-series',
    command: 'model openai/gpt-5.5',
    shortcut: 'Ctrl+M then 1',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: 'Claude Sonnet, Claude Opus',
    command: 'model anthropic/claude-sonnet',
    shortcut: 'Ctrl+M then 2',
  },
  {
    id: 'google',
    name: 'Google',
    models: 'Gemini Pro, Gemini Flash',
    command: 'model google/gemini-pro',
    shortcut: 'Ctrl+M then 3',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    models: 'Large, Small, Codestral',
    command: 'model mistral/codestral',
    shortcut: 'Ctrl+M then 4',
  },
  {
    id: 'xai',
    name: 'xAI',
    models: 'Grok code and reasoning models',
    command: 'model xai/grok-code',
    shortcut: 'Ctrl+M then 5',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    models: 'Reasoner, coder, chat',
    command: 'model deepseek/deepseek-reasoner',
    shortcut: 'Ctrl+M then 6',
  },
];

const historyCommands = [
  {
    command: 'tree',
    title: 'Branch-aware navigation',
    text: 'Walk the session tree, fork a safer attempt, and keep the Type 1 decision path visible.',
  },
  {
    command: 'export',
    title: 'HTML session archive',
    text: 'Turn a conversation into a durable HTML artifact for reviews, retros, or handoff.',
  },
  {
    command: 'share',
    title: 'Gist or URL handoff',
    text: 'Share a branch without flattening the choices that led to it.',
  },
];

const contextItems = [
  {
    title: 'AGENTS.md',
    text: 'Project instructions live beside the code and travel with the repo.',
  },
  {
    title: 'SYSTEM.md',
    text: 'Overwrite or extend the system prompt without rebuilding the harness.',
  },
  {
    title: 'Automatic compaction',
    text: 'Context compresses near the limit while preserving the decision spine.',
  },
  {
    title: 'On-demand skills',
    text: 'Skills load only when the task calls for them.',
  },
  {
    title: 'Prompt templates',
    text: 'Reusable prompts make routine work consistent without hard-coding the core.',
  },
  {
    title: 'Dynamic context',
    text: 'Extensions can inject, filter, retrieve with RAG, or attach long memory.',
  },
];

const skillMatrix: SkillMatrixItem[] = [
  {
    stage: 'Full pipeline',
    name: 'spark-to-ship',
    description: 'Install the full operating lane: ideation, debate, approval, implementation, closeout, review, and release.',
    command: 'type1skills install @type1skills/spark',
    featured: true,
  },
  {
    stage: 'IDEAS',
    name: 'new-ideas',
    description: 'Turn rough market signals into ranked product bets with Type 1 risk notes attached.',
    command: 'type1skills install @type1skills/ideas',
  },
  {
    stage: 'INCUBATING',
    name: 'cook-idea',
    description: 'Run an optimistic versus cautious debate before a shiny idea starts consuming roadmap.',
    command: 'type1skills install @type1skills/incubator',
  },
  {
    stage: 'APPROVING',
    name: 'approve-incubating',
    description: 'Promote a proven idea into acceptance criteria, owner-ready TODOs, and a reversible first step.',
    command: 'type1skills install @type1skills/approval',
  },
  {
    stage: 'TODO',
    name: 'solve-next-todo',
    description: 'Pick the next meaningful task, ship the smallest credible slice, and prove it with focused tests.',
    command: 'type1skills install @type1skills/todo',
  },
  {
    stage: 'DOING',
    name: 'closeout-enforcer',
    description: 'Force the last mile: verification evidence, docs impact, graph sync, and handoff clarity.',
    command: 'type1skills install @type1skills/closeout',
  },
  {
    stage: 'DONE',
    name: 'review',
    description: 'Put a reviewer in the loop that hunts regressions, missing tests, and irreversible mistakes first.',
    command: 'type1skills install @type1skills/review',
  },
  {
    stage: 'DONE',
    name: 'release-enforcer',
    description: 'Turn verified work into a release path: source control, CI gates, deploy handoff, and rollback notes.',
    command: 'type1skills install @type1skills/release',
  },
];

const pipelineStages: SkillStage[] = ['IDEAS', 'INCUBATING', 'APPROVING', 'TODO', 'DOING', 'DONE'];

const sparkSkill = skillMatrix.find((item) => item.name === 'spark-to-ship') ?? skillMatrix[0];
const stagedSkills = skillMatrix.filter((item) => !item.featured);

const modes: Mode[] = [
  {
    id: 'interactive',
    label: 'Interactive',
    headline: 'TUI for live work',
    command: 'type1skills',
    detail: 'A complete terminal interface for steering, branching, themes, and live model changes.',
  },
  {
    id: 'json',
    label: 'Print/JSON',
    headline: 'Script-friendly output',
    command: 'type1skills print --json "review this diff"',
    detail: 'Use Type1Skills in CI, shell scripts, and event-stream consumers.',
  },
  {
    id: 'rpc',
    label: 'RPC',
    headline: 'stdin/stdout protocol',
    command: 'type1skills rpc',
    detail: 'Drive the harness from another process while keeping the protocol small.',
  },
  {
    id: 'sdk',
    label: 'SDK',
    headline: 'Embed in apps',
    command: 'import { createHarness } from "type1skills/sdk"',
    detail: 'Ship Type1Skills inside your own product, editor, or internal platform.',
  },
];

const primitiveFeatures = [
  'Sub-agents',
  'Plan mode',
  'Permission gates',
  'Path protection',
  'SSH execution',
  'Sandboxing',
  'MCP integration through an extension',
  'Custom editors',
  'Status bars',
  'Overlays',
];

const notBuilt = [
  'No MCP.',
  'No sub-agents.',
  'No permission popups.',
  'No plan mode.',
  'No built-in to-dos.',
  'No background bash.',
];

const communityLinks = [
  { label: 'GitHub', href: 'https://github.com/vibelibs/type1skills' },
  { label: 'npm', href: 'https://www.npmjs.com/package/type1skills' },
  { label: 'Discord', href: 'https://discord.gg/type1skills' },
];

function App() {
  const [activeInstall, setActiveInstall] = useState<InstallId>('curl');
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [activeProvider, setActiveProvider] = useState<ProviderId>('openai');
  const [activeMode, setActiveMode] = useState<ModeId>('interactive');

  const install = useMemo(
    () => installCommands.find((item) => item.id === activeInstall) ?? installCommands[0],
    [activeInstall],
  );

  const provider = useMemo(
    () => providers.find((item) => item.id === activeProvider) ?? providers[0],
    [activeProvider],
  );

  const mode = useMemo(() => modes.find((item) => item.id === activeMode) ?? modes[0], [activeMode]);

  return (
    <div className={`site-shell theme-${themeMode}`}>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Type1Skills home">
          <span className="brand-mark">T1</span>
          <span>Type1Skills</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="theme-switcher" aria-label="Theme">
          {themeModes.map((item) => (
            <button
              key={item.id}
              className={themeMode === item.id ? 'is-active' : ''}
              type="button"
              onClick={() => setThemeMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <main>
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Type 1 risk coding harness</p>
            <h1 id="hero-title">There are many agent harnesses, but this one is yours.</h1>
            <p className="hero-lede">
              Type1Skills adapts around your workflow and treats irreversible engineering choices as
              the spine of agent reasoning.
            </p>
            <div className="hero-actions" aria-label="Community links">
              {communityLinks.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="install-panel" aria-label="Install Type1Skills">
            <div className="install-head">
              <span>Install Type1Skills</span>
              <span>shell, npm, pnpm, bun</span>
            </div>
            <div className="install-tabs" role="tablist" aria-label="Install commands">
              {installCommands.map((item) => (
                <button
                  key={item.id}
                  className={activeInstall === item.id ? 'is-active' : ''}
                  type="button"
                  role="tab"
                  aria-selected={activeInstall === item.id}
                  onClick={() => setActiveInstall(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <pre>
              <code>{install.command}</code>
            </pre>
          </div>
        </section>

        <section className="section intro-grid" id="docs" aria-labelledby="why-title">
          <div>
            <p className="eyebrow">Why Type1?</p>
            <h2 id="why-title">Why Type1?</h2>
          </div>
          <div className="intro-copy">
            <p>
              Jeff Bezos described Type 1 decisions as consequential and hard to reverse. Type1Skills
              brings that idea inside the agent harness: every branch, model switch, context choice,
              and package install can be evaluated against its blast radius.
            </p>
            <p>
              The <a href="#skills">skill matrix</a> becomes the operating surface for deciding
              when to move fast, when to ask for stronger evidence, and when to preserve a
              reversible path.
            </p>
          </div>
        </section>

        <section className="section skills-section" id="skills" aria-labelledby="skills-heading">
          <div className="section-heading">
            <p className="eyebrow">DevOps workflow</p>
            <h2 id="skills-heading">The skill matrix.</h2>
            <p>
              Install the harness once. Then activate the exact pack each repo needs, from a single
              reviewer skill to the complete spark-to-ship operating lane.
            </p>
          </div>
          <article className="skill-cta" aria-label="Full pipeline skill">
            <div>
              <span>{sparkSkill.stage}</span>
              <h3>{sparkSkill.name}</h3>
              <p>{sparkSkill.description}</p>
            </div>
            <code>{sparkSkill.command}</code>
          </article>
          <ol className="pipeline-rail" aria-label="Pipeline stages">
            {pipelineStages.map((stage) => (
              <li key={stage}>{stage}</li>
            ))}
          </ol>
          <div className="skill-matrix-grid">
            {stagedSkills.map((item) => (
              <article key={item.name} className="skill-card">
                <span>{item.stage}</span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <code>{item.command}</code>
              </article>
            ))}
          </div>
        </section>

        <section className="section" aria-labelledby="workflow-title">
          <div className="section-heading">
            <p className="eyebrow">Your rules stay yours</p>
            <h2 id="workflow-title">Change the harness, not your workflow.</h2>
          </div>
          <div className="feature-grid">
            <article>
              <h3>Extensions</h3>
              <p>Add behavior without asking the core to own every possible workflow.</p>
            </article>
            <article>
              <h3>Skills</h3>
              <p>Load task-specific operating knowledge only when it is needed.</p>
            </article>
            <article>
              <h3>Prompt templates</h3>
              <p>Reuse proven prompts for reviews, migrations, launches, and incident drills.</p>
            </article>
            <article>
              <h3>Themes</h3>
              <p>Choose Auto, Light, or Dark and ship your own interface themes as packages.</p>
            </article>
          </div>
          <div className="command-strip">
            <span>Self-customize during a session</span>
            <code>reload</code>
            <span>refreshes extensions, skills, prompts, and themes without restarting.</span>
          </div>
        </section>

        <section className="section models" id="models" aria-labelledby="models-title">
          <div className="section-heading">
            <p className="eyebrow">Providers and switching</p>
            <h2 id="models-title">15+ providers, hundreds of models.</h2>
          </div>
          <div className="provider-cloud" aria-label="Supported providers">
            {providerNames.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
          <div className="model-workbench">
            <div className="provider-grid" role="tablist" aria-label="Model providers">
              {providers.map((item) => (
                <button
                  key={item.id}
                  className={activeProvider === item.id ? 'is-active' : ''}
                  type="button"
                  role="tab"
                  aria-selected={activeProvider === item.id}
                  onClick={() => setActiveProvider(item.id)}
                >
                  <strong>{item.name}</strong>
                  <span>{item.models}</span>
                </button>
              ))}
            </div>
            <aside className="console-card" aria-label="Model switch preview">
              <p>Switch model mid-session</p>
              <pre>
                <code>
                  {`type1skills> ${provider.command}
provider: ${provider.name}
shortcut: ${provider.shortcut}
session: preserved`}
                </code>
              </pre>
            </aside>
          </div>
        </section>

        <section className="section history" aria-labelledby="history-title">
          <div className="section-heading">
            <p className="eyebrow">Conversations do not have to be linear</p>
            <h2 id="history-title">Tree-structured, shareable history.</h2>
          </div>
          <div className="history-layout">
            <div className="session-tree" aria-label="Session tree preview">
              <div className="tree-row is-active">run/main</div>
              <div className="tree-row">run/main/risk-review</div>
              <div className="tree-row">run/main/risk-review/provider-swap</div>
              <div className="tree-row">run/main/risk-review/rollback-plan</div>
            </div>
            <div className="history-cards">
              {historyCommands.map((item) => (
                <article key={item.command}>
                  <code>{item.command}</code>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="context-title">
          <div className="section-heading">
            <p className="eyebrow">Prompt, memory, and compression control</p>
            <h2 id="context-title">Context engineering.</h2>
          </div>
          <div className="feature-grid context-grid">
            {contextItems.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section steer" aria-labelledby="steer-title">
          <div>
            <p className="eyebrow">Live steering</p>
            <h2 id="steer-title">Steer or follow up.</h2>
            <p>
              Interrupt gently while the agent is running or queue the next instruction after it
              completes. Long work stays conversational.
            </p>
          </div>
          <div className="key-grid" aria-label="Steering controls">
            <article>
              <kbd>Enter</kbd>
              <h3>Message of steering</h3>
              <p>Add course correction while the agent is still executing.</p>
            </article>
            <article>
              <kbd>Alt+Enter</kbd>
              <h3>Follow-up after completion</h3>
              <p>Queue the next move without breaking the current run.</p>
            </article>
          </div>
        </section>

        <section className="section modes" aria-labelledby="modes-title">
          <div className="section-heading">
            <p className="eyebrow">Use it where the work happens</p>
            <h2 id="modes-title">Four modes.</h2>
          </div>
          <div className="mode-list" role="tablist" aria-label="Runtime modes">
            {modes.map((item) => (
              <button
                key={item.id}
                className={activeMode === item.id ? 'is-active' : ''}
                type="button"
                role="tab"
                aria-selected={activeMode === item.id}
                onClick={() => setActiveMode(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mode-preview">
            <div>
              <h3>{mode.headline}</h3>
              <p>{mode.detail}</p>
            </div>
            <pre>
              <code>{mode.command}</code>
            </pre>
          </div>
        </section>

        <section className="section packages" id="packages" aria-labelledby="primitives-title">
          <div className="section-heading">
            <p className="eyebrow">Extensible by design</p>
            <h2 id="primitives-title">Primitives, not features.</h2>
          </div>
          <div className="primitive-layout">
            <div>
              <p>
                Extensions are the primitives for advanced behavior. Package them as Type1Skills skill
                packs, share them through npm or git, then install them with the Type1Skills CLI.
                No separate package manager or runtime is required.
              </p>
              <div className="package-command">
                <code>type1skills install @type1skills/spark</code>
                <code>type1skills install git+https://github.com/your-org/custom-gates.git</code>
              </div>
            </div>
            <ul className="primitive-list">
              {primitiveFeatures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section not-built" aria-labelledby="not-built-title">
          <div className="section-heading">
            <p className="eyebrow">Small core, large ecosystem</p>
            <h2 id="not-built-title">What we didn't build.</h2>
          </div>
          <div className="not-built-grid">
            {notBuilt.map((item) => (
              <article key={item}>
                <span>{item}</span>
                <p>Available through extensions or packages when your workflow needs it.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section get-involved" id="news" aria-labelledby="involved-title">
          <div>
            <p className="eyebrow">Docs, news, packages, models</p>
            <h2 id="involved-title">Get involved with Type1.</h2>
            <p>
              Follow releases, publish packages, propose model adapters, and help shape the public
              harness contract before the first stable release.
            </p>
          </div>
          <div className="involved-links">
            {communityLinks.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
            <a href="#docs">Docs</a>
            <a href="#packages">Packages</a>
            <a href="#models">Models</a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a href="https://github.com/vibelibs/type1skills/graphs/contributors">List of Contributors</a>
        <a href="/press-kit">Press Kit</a>
        <a href="https://github.com/vibelibs/type1skills/blob/main/LICENSE">MIT License</a>
      </footer>
    </div>
  );
}

export default App;
