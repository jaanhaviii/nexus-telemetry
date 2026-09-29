import React, { useState, useEffect, useMemo } from 'react';

const API_BASE = "http://127.0.0.1:8000";

// --- Icons ---
const GridIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
  </svg>
);

const LayersIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 21 8 12 13 3 8Z" />
    <path d="M3 13l9 5 9-5" />
    <path d="M3 18l9 5 9-5" />
  </svg>
);

// --- Small trend line used on each server card ---
const Sparkline = ({ data = [], color }) => {
  const width = 100, height = 28;
  if (data.length < 2) return null;
  const points = data.map((val, i) => `${(i / (data.length - 1)) * width},${height - (val / 100) * height}`).join(' ');
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
};

// --- Multi-series area chart (used for the main resource panel and the server detail modal) ---
const ResourceChart = ({ series, height = 190 }) => {
  const width = 600;
  const max = 100;
  const points = series[0]?.data?.length || 0;
  if (points < 2) {
    return <div className="h-[190px] flex items-center justify-center text-[#5B5F6B] text-xs font-mono">Collecting data...</div>;
  }
  const stepX = width / (points - 1);
  const buildLine = (data) => data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX},${height - (v / max) * height}`).join(' ');
  const buildArea = (data) => `${buildLine(data)} L ${(points - 1) * stepX},${height} L 0,${height} Z`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        {series.map((s) => (
          <linearGradient key={s.label} id={`grad-${s.label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {gridLines.map((g) => (
        <line key={g} x1="0" x2={width} y1={height * g} y2={height * g} stroke="#1E2029" strokeWidth="1" />
      ))}
      {series.map((s) => <path key={`area-${s.label}`} d={buildArea(s.data)} fill={`url(#grad-${s.label})`} />)}
      {series.map((s) => <path key={`line-${s.label}`} d={buildLine(s.data)} fill="none" stroke={s.color} strokeWidth="2" />)}
      {series.map((s) => s.data.map((v, i) => (
        <circle key={`${s.label}-${i}`} cx={i * stepX} cy={height - (v / max) * height} r="3" fill="#0B0C14" stroke={s.color} strokeWidth="2" />
      )))}
    </svg>
  );
};

// --- Radial gauge for the overall health score ---
const Gauge = ({ score, size = 140 }) => {
  const track = '#20232C';
  const background = `conic-gradient(from -90deg, #FB923C 0%, #FBBF24 ${score / 2}%, #34D399 ${score}%, ${track} ${score}% 100%)`;
  return (
    <div className="relative rounded-full" style={{ width: size, height: size, background }}>
      <div className="absolute inset-[13%] rounded-full bg-[#14151F] flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#ECEAE6]">{score}%</span>
      </div>
    </div>
  );
};

// --- Donut chart with legend, built from real counts ---
const Donut = ({ segments, total, size = 128 }) => {
  let cumulative = 0;
  const stops = segments.map((seg) => {
    const pct = total > 0 ? (seg.value / total) * 100 : 0;
    const start = cumulative;
    cumulative += pct;
    return `${seg.color} ${start}% ${cumulative}%`;
  }).join(', ');
  const background = total > 0 ? `conic-gradient(${stops})` : '#20232C';

  return (
    <div className="flex items-center gap-6">
      <div className="relative rounded-full shrink-0" style={{ width: size, height: size, background }}>
        <div className="absolute inset-[15%] rounded-full bg-[#14151F] flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-[#ECEAE6]">{total}</span>
          <span className="text-[9px] text-[#5B5F6B] uppercase tracking-wide">Total</span>
        </div>
      </div>
      <div className="space-y-2 font-mono text-xs">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between gap-4 min-w-[120px]">
            <span className="flex items-center gap-2 text-[#9098A3]">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: seg.color }}></span>
              {seg.label}
            </span>
            <span className="text-[#ECEAE6] font-bold">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ToastNotification = ({ toasts, removeToast }) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
    {toasts.map((toast) => (
      <div key={toast.id} className={`p-4 rounded-xl border font-mono text-xs shadow-2xl transition-all duration-300 ${toast.type === 'Critical' ? 'bg-red-950/90 border-red-500 text-red-200' : 'bg-amber-950/90 border-amber-500 text-amber-200'}`}>
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold uppercase tracking-wider">{toast.type === 'Critical' ? 'Critical Alert' : 'Warning'}</span>
          <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-white ml-4">✕</button>
        </div>
        <p className="text-slate-300 font-sans">{toast.message}</p>
      </div>
    ))}
  </div>
);

const statusColor = (status) => status === 'Healthy' ? '#34D399' : status === 'Warning' ? '#FBBF24' : '#F87171';

export default function App() {
  // --- Auth state ---
  const [token, setToken] = useState(sessionStorage.getItem('nexus_token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // --- Core data state ---
  const [servers, setServers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isChaosMode, setIsChaosMode] = useState(false);
  const [activeTab, setActiveTab] = useState('metrics');
  const [logFilter, setLogFilter] = useState('ALL');
  const [activeRegion, setActiveRegion] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServer, setSelectedServer] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('--:--:--');
  const [toasts, setToasts] = useState([]);
  const [metricsHistory, setMetricsHistory] = useState({});

  // --- AI assistant / document upload state ---
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', msg: '' });

  // --- Auth flow: matches POST /auth/login (form-urlencoded username/password) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData
      });

      if (!res.ok) throw new Error("Invalid username or password.");
      const data = await res.json();

      sessionStorage.setItem('nexus_token', data.access_token);
      setToken(data.access_token);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('nexus_token');
    setToken('');
    setServers([]);
    setLogs([]);
  };

  // --- PDF upload: matches POST /upload-doc (multipart, Bearer token) ---
  const handleFileUpload = async (e) => {
    const targetFile = e.target.files[0];
    if (!targetFile) return;

    if (!targetFile.name.endsWith('.pdf')) {
      setUploadStatus({ type: 'error', msg: 'Only PDF files are supported.' });
      return;
    }

    setUploadingDoc(true);
    setUploadStatus({ type: 'info', msg: 'Uploading and indexing document...' });

    const uploadPayload = new FormData();
    uploadPayload.append('file', targetFile);

    try {
      const response = await fetch(`${API_BASE}/upload-doc`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: uploadPayload
      });

      const outcome = await response.json();
      if (!response.ok) throw new Error(outcome.detail || "Upload failed.");

      setUploadStatus({
        type: 'success',
        msg: `Successfully indexed: ${outcome.filename} (${outcome.chunks_indexed} chunks processed)`
      });
    } catch (err) {
      setUploadStatus({ type: 'error', msg: `Upload failed: ${err.message}` });
    } finally {
      setUploadingDoc(false);
    }
  };

  // --- Poll /servers and /logs every 2s (both require Bearer auth) ---
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const timestamp = new Date().toLocaleTimeString();
        setLastUpdated(timestamp);
        const headers = { "Authorization": `Bearer ${token}` };

        const serverRes = await fetch(`${API_BASE}/servers`, { headers });
        if (serverRes.status === 401) return handleLogout();

        let serverData = serverRes.status === 200 ? await serverRes.json() : [];
        if (!Array.isArray(serverData)) serverData = [];

        // Chaos mode is a client-side simulation only — no backend endpoint for it
        if (isChaosMode) {
          serverData = serverData.map(s => ({ ...s, cpu: Math.floor(Math.random() * 11) + 90, memory: Math.floor(Math.random() * 11) + 89, status: 'Critical' }));
        }
        setServers(serverData);

        setMetricsHistory(prev => {
          const updated = { ...prev };
          serverData.forEach(srv => {
            if (!updated[srv.id]) updated[srv.id] = [];
            updated[srv.id].push({ time: timestamp, cpu: srv.cpu, memory: srv.memory, network: srv.network, disk: srv.disk });
            if (updated[srv.id].length > 15) updated[srv.id].shift();
          });
          return updated;
        });

        serverData.forEach(srv => {
          if (srv.cpu >= 90) triggerToast(srv.id + '-cpu', 'Critical', `CPU spike alert: ${srv.name} at ${srv.cpu}%`);
          else if (srv.cpu >= 65) triggerToast(srv.id + '-warn', 'Warning', `${srv.name} approaching CPU threshold at ${srv.cpu}%`);
        });

        const logRes = await fetch(`${API_BASE}/logs`, { headers });
        if (logRes.status === 200) {
          const logData = await logRes.json();
          if (Array.isArray(logData)) setLogs(logData);
        }
      } catch (err) {
        console.error("Telemetry fetch failed:", err);
      }
    };

    fetchData();
    const loop = setInterval(fetchData, 2000);
    return () => clearInterval(loop);
  }, [token, isChaosMode]);

  const triggerToast = (id, type, message) => {
    setToasts(prev => prev.some(t => t.id === id) ? prev : [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 5000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // --- AI assistant: matches POST /chat (JSON {message}, Bearer token) ---
  const askAI = async () => {
    if (!question.trim()) return;
    setLoadingAI(true);
    setAnswer("");
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ message: question }),
      });
      const data = await res.json();
      setAnswer(data.reply);
    } catch {
      setAnswer("Unable to reach the assistant service. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  // --- Derived data ---

  // Regions are pulled live from whatever /servers actually returns (e.g. India, Singapore,
  // Virginia, Mumbai, London) instead of hardcoded AWS-style region codes that never matched.
  const availableRegions = useMemo(() => {
    const unique = [...new Set(servers.map(s => s.region))].filter(Boolean);
    return ['ALL', ...unique];
  }, [servers]);

  const filteredServers = useMemo(() => {
    return servers.filter(s => {
      const matchesRegion = activeRegion === 'ALL' || s.region === activeRegion;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.status.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [servers, activeRegion, searchQuery]);

  const filteredLogs = useMemo(() => {
    if (logFilter === 'ALL') return logs;
    return logs.filter(l => l.status === logFilter);
  }, [logs, logFilter]);

  // /logs only returns server_id, not a server name — join against /servers here
  const serverNameById = useMemo(() => {
    const map = {};
    servers.forEach(s => { map[s.id] = s.name; });
    return map;
  }, [servers]);

  const serverStatusCounts = useMemo(() => {
    const counts = { Healthy: 0, Warning: 0, Critical: 0 };
    servers.forEach((s) => { if (counts[s.status] !== undefined) counts[s.status]++; });
    return counts;
  }, [servers]);

  const logStatusCounts = useMemo(() => {
    const counts = { Healthy: 0, Warning: 0, Critical: 0 };
    logs.forEach((l) => { if (counts[l.status] !== undefined) counts[l.status]++; });
    return counts;
  }, [logs]);

  const aggregateScore = useMemo(() => {
    if (servers.length === 0) return 100;
    const avgCpu = servers.reduce((sum, s) => sum + (s.cpu || 0), 0) / servers.length;
    const avgMemory = servers.reduce((sum, s) => sum + (s.memory || 0), 0) / servers.length;
    const baseVariance = (avgCpu * 0.5) + (avgMemory * 0.5);
    return Math.max(1, Math.min(100, Math.round(100 - baseVariance)));
  }, [servers]);

  // --- Login screen ---
  if (!token) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0B0C14] text-[#ECEAE6]">
        <form onSubmit={handleLogin} className="w-full max-w-sm border border-[#1E2029] bg-[#14151F] p-9 rounded-2xl shadow-2xl">
          <div className="mb-7">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center font-semibold text-[#0B0C14] text-sm mb-4">N</div>
            <h1 className="text-lg font-semibold text-[#ECEAE6]">Sign in to Nexus</h1>
            <p className="text-sm text-[#5B5F6B] mt-1">Enter your credentials to access the platform</p>
          </div>
          {authError && <div className="p-3 mb-4 bg-red-950/40 border border-red-500/50 text-red-400 rounded-lg text-sm">{authError}</div>}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8A8D99]">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#0B0C14] border border-[#1E2029] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2DD4BF]/60 focus:ring-1 focus:ring-[#2DD4BF]/30 text-[#ECEAE6] transition-colors" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#8A8D99]">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#0B0C14] border border-[#1E2029] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#2DD4BF]/60 focus:ring-1 focus:ring-[#2DD4BF]/30 text-[#ECEAE6] transition-colors" required />
            </div>
          </div>
          <button type="submit" className="w-full bg-[#2DD4BF] hover:bg-[#4FE0CD] text-[#0B0C14] font-medium py-2.5 rounded-lg transition-colors text-sm mt-6">Sign In</button>
        </form>
      </div>
    );
  }

  // --- Main dashboard ---
  return (
    <div className="flex h-screen bg-[#0B0C14] text-[#ECEAE6] font-sans overflow-hidden select-none antialiased">

      {/* ICON RAIL */}
      <aside className="w-16 bg-[#0B0C14] border-r border-[#1C1E28] flex flex-col items-center justify-between py-5">
        <div className="flex flex-col items-center">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center font-bold text-[#0B0C14] text-sm mb-8">N</div>
          <nav className="flex flex-col items-center space-y-3">
            <button onClick={() => setActiveTab('metrics')} title="Dashboard" className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${activeTab === 'metrics' ? 'bg-emerald-500/15 text-emerald-400' : 'text-[#4B4F5C] hover:text-[#9098A3]'}`}>
              <GridIcon active={activeTab === 'metrics'} />
            </button>
            <button onClick={() => setActiveTab('architecture')} title="Architecture" className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${activeTab === 'architecture' ? 'bg-emerald-500/15 text-emerald-400' : 'text-[#4B4F5C] hover:text-[#9098A3]'}`}>
              <LayersIcon active={activeTab === 'architecture'} />
            </button>
          </nav>
        </div>
        <button onClick={handleLogout} title="Sign out" className="h-10 w-10 rounded-xl flex items-center justify-center text-[#4B4F5C] hover:text-red-400 transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </button>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-5">

            {/* HEADER */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl font-semibold text-[#ECEAE6]">Platform Monitoring</h1>
                <p className="text-[11px] text-[#5B5F6B] font-mono mt-0.5">Last updated: {lastUpdated}</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search servers..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-[#14151F] border border-[#1E2029] rounded-lg px-3 py-1.5 text-xs text-[#ECEAE6] outline-none focus:border-[#2DD4BF]/50 placeholder-[#5B5F6B] w-40"
                />
                <span className="flex items-center gap-2 text-[11px] font-mono text-[#8A8D99]">
                  <span className="relative flex h-2 w-2">
                    {isChaosMode && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F87171] opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isChaosMode ? 'bg-[#F87171]' : 'bg-[#34D399]'}`}></span>
                  </span>
                  {isChaosMode ? 'Fault active' : 'Operational'}
                </span>
                <button
                  onClick={() => setIsChaosMode(!isChaosMode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${isChaosMode ? 'bg-[#F87171]/10 border-[#F87171]/50 text-[#F87171]' : 'bg-transparent border-[#232634] text-[#8A8D99] hover:border-[#F87171]/40 hover:text-[#F87171]'}`}
                >
                  {isChaosMode ? 'Disable fault testing' : 'Inject load fault'}
                </button>
              </div>
            </div>

            {/* REGION TABS (built from real server regions) */}
            <div className="flex items-center gap-6 border-b border-[#1C1E28] overflow-x-auto">
              {availableRegions.map((region) => (
                <button
                  key={region}
                  onClick={() => setActiveRegion(region)}
                  className={`pb-3 text-sm font-mono transition-all border-b-2 -mb-px whitespace-nowrap ${activeRegion === region ? 'text-[#ECEAE6] border-[#2DD4BF]' : 'text-[#5B5F6B] border-transparent hover:text-[#9098A3]'}`}
                >
                  {region}
                </button>
              ))}
            </div>

            {activeTab === 'metrics' ? (
              <>
                {/* RESOURCE CHART + GAUGE (fleet-wide average) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-[#14151F] border border-[#1E2029] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-[#ECEAE6]">Resource utilization</span>
                      <div className="flex items-center gap-4 text-[11px] font-mono text-[#8A8D99]">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#2DD4BF]"></span>CPU</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#34D399]"></span>Memory</span>
                      </div>
                    </div>
                    <ResourceChart series={[
                      { label: 'CPU', color: '#2DD4BF', data: (metricsHistory[filteredServers[0]?.id] || []).map(h => h.cpu) },
                      { label: 'Memory', color: '#34D399', data: (metricsHistory[filteredServers[0]?.id] || []).map(h => h.memory) },
                    ]} />
                  </div>

                  <div className="bg-[#14151F] border border-[#1E2029] rounded-2xl p-5 flex flex-col items-center justify-center">
                    <span className="text-sm font-medium text-[#ECEAE6] self-start mb-4">Health score</span>
                    <Gauge score={aggregateScore} />
                  </div>
                </div>

                {/* DONUTS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-[#14151F] border border-[#1E2029] rounded-2xl p-5">
                    <span className="text-sm font-medium text-[#ECEAE6] block mb-4">Servers by status</span>
                    <Donut
                      total={servers.length}
                      segments={[
                        { label: 'Healthy', value: serverStatusCounts.Healthy, color: '#34D399' },
                        { label: 'Warning', value: serverStatusCounts.Warning, color: '#FBBF24' },
                        { label: 'Critical', value: serverStatusCounts.Critical, color: '#F87171' },
                      ]}
                    />
                  </div>
                  <div className="bg-[#14151F] border border-[#1E2029] rounded-2xl p-5">
                    <span className="text-sm font-medium text-[#ECEAE6] block mb-4">Log events by status</span>
                    <Donut
                      total={logs.length}
                      segments={[
                        { label: 'Healthy', value: logStatusCounts.Healthy, color: '#2DD4BF' },
                        { label: 'Warning', value: logStatusCounts.Warning, color: '#FBBF24' },
                        { label: 'Critical', value: logStatusCounts.Critical, color: '#F87171' },
                      ]}
                    />
                  </div>
                </div>

                {/* SERVER CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredServers.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedServer(srv)}
                      className="bg-[#14151F] border border-[#1E2029] rounded-2xl p-5 cursor-pointer hover:border-[#2DD4BF]/30 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-sm font-semibold text-[#ECEAE6]">{srv.name}</h2>
                          <p className="text-[#5B5F6B] text-xs font-mono mt-0.5">{srv.region}</p>
                        </div>
                        <Sparkline data={(metricsHistory[srv.id] || []).map(h => h.cpu)} color={statusColor(srv.status)} />
                      </div>

                      <div className="mt-4 space-y-1.5 text-xs font-mono text-[#9098A3] border-t border-[#1E2029] pt-3">
                        <p>CPU : <span className="text-[#ECEAE6] font-bold">{srv.cpu}%</span></p>
                        <p>Memory : <span className="text-[#ECEAE6] font-bold">{srv.memory}%</span></p>
                        <p>Disk : <span className="text-[#ECEAE6] font-bold">{srv.disk}%</span></p>
                        <p>Network : <span className="text-[#ECEAE6] font-bold">{srv.network} Mbps</span></p>
                        <p className="pt-1">
                          Status : <span className="ml-1 font-bold tracking-wide uppercase text-[10px]" style={{ color: statusColor(srv.status) }}>{srv.status}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* LOGS + AI ASSISTANT */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-[#14151F] rounded-2xl border border-[#1E2029] overflow-hidden flex flex-col h-[360px]">
                    <div className="px-5 py-3.5 border-b border-[#1E2029] flex items-center justify-between">
                      <span className="text-sm font-medium text-[#ECEAE6]">System logs</span>
                      <div className="flex items-center space-x-1 bg-[#0B0C14] p-1 rounded-lg border border-[#1E2029] font-mono">
                        {['ALL', 'Healthy', 'Warning', 'Critical'].map((f) => (
                          <button
                            key={f} onClick={() => setLogFilter(f)}
                            className={`px-2.5 py-1 rounded text-[9px] font-bold tracking-wide transition-all ${logFilter === f ? 'bg-[#2DD4BF]/15 text-[#2DD4BF]' : 'text-[#5B5F6B] hover:text-[#9098A3]'}`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-[#0B0C14] font-mono text-[11px] flex-1 overflow-y-auto">
                      {filteredLogs.length === 0 ? (
                        <div className="text-[#3A3D47] text-center py-16">No logs match the current filter.</div>
                      ) : (
                        filteredLogs.map((log) => (
                          <div key={log.id} className="flex justify-between items-center border-b border-[#1E2029] py-2.5 last:border-0">
                            <div>
                              <p className="text-[#ECEAE6] font-medium font-sans text-xs">{serverNameById[log.server_id] || `Server #${log.server_id}`}</p>
                              <p className="text-[#5B5F6B] text-[11px] mt-0.5">
                                CPU: <span className="text-[#9098A3] font-bold">{log.cpu}%</span> {' '}
                                <span className="font-bold uppercase" style={{ color: statusColor(log.status) }}>{log.status}</span>
                              </p>
                            </div>
                            <span className="text-[#5B5F6B] text-[10px] font-bold bg-[#14151F] border border-[#1E2029] px-2 py-0.5 rounded">{log.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-[#14151F] rounded-2xl border border-[#1E2029] overflow-hidden flex flex-col h-[360px]">
                    <div className="px-5 py-3.5 border-b border-[#1E2029] flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-[#A78BFA] mr-2.5"></div>
                        <span className="text-sm font-medium text-[#ECEAE6]">AI assistant</span>
                      </div>
                      <label className={`text-[10px] px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${uploadingDoc ? 'border-[#1E2029] text-[#5B5F6B]' : 'border-[#1E2029] text-[#8A8D99] hover:border-[#A78BFA]/40 hover:text-[#A78BFA]'}`}>
                        {uploadingDoc ? 'Uploading...' : 'Upload PDF'}
                        <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={uploadingDoc} />
                      </label>
                    </div>

                    {uploadStatus.msg && (
                      <div className={`mx-4 mt-3 p-2.5 text-[10px] font-mono rounded-lg border ${uploadStatus.type === 'success' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : uploadStatus.type === 'error' ? 'bg-red-950/30 border-red-500/30 text-red-400' : 'bg-[#0B0C14] border-[#1E2029] text-[#8A8D99]'}`}>
                        {uploadStatus.msg}
                      </div>
                    )}

                    <div className="p-5 bg-[#0B0C14] flex-1 overflow-y-auto text-sm text-[#9098A3] space-y-4 mt-2">
                      {!answer && !loadingAI ? (
                        <div className="text-[#5B5F6B] text-center py-16">
                          <p className="font-medium text-[#9098A3] mb-1">Ask a question to get started</p>
                          <p className="text-xs">Ask about cluster metrics, active issues, or an uploaded runbook.</p>
                        </div>
                      ) : loadingAI ? (
                        <div className="flex items-center space-x-2 text-[#A78BFA] animate-pulse text-xs font-mono">
                          <span>Analyzing...</span>
                        </div>
                      ) : (
                        <div className="bg-[#14151F] border border-[#1E2029] p-4 rounded-lg leading-relaxed text-[#ECEAE6] whitespace-pre-line selection:bg-[#A78BFA]/30">
                          {answer}
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-[#14151F] border-t border-[#1E2029] flex items-center space-x-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && askAI()}
                        placeholder="Ask about metrics, logs, or system health..."
                        className="flex-1 bg-[#0B0C14] border border-[#1E2029] rounded-lg px-3.5 py-2 text-sm text-[#ECEAE6] focus:outline-none focus:border-[#A78BFA]/60 placeholder-[#5B5F6B] transition-all"
                        disabled={loadingAI}
                      />
                      <button
                        onClick={askAI}
                        disabled={loadingAI || !question.trim()}
                        className="bg-[#A78BFA] hover:bg-[#B49CFB] disabled:bg-[#1A1C28] text-[#0B0C14] disabled:text-[#5B5F6B] font-medium text-sm px-4 py-2 rounded-lg transition-all shrink-0"
                      >
                        {loadingAI ? 'Processing...' : 'Ask'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-[#14151F] border border-[#1E2029] rounded-2xl p-8 space-y-6">
                <h2 className="text-lg font-semibold text-[#ECEAE6]">Technical architecture</h2>
                <hr className="border-[#1E2029]" />
                <p className="text-[#5B5F6B] text-sm">Architecture documentation coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SERVER DETAIL MODAL */}
      {selectedServer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedServer(null)}>
          <div className="bg-[#14151F] border border-[#1E2029] rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-[#ECEAE6]">{selectedServer.name}</h2>
              <button onClick={() => setSelectedServer(null)} className="text-[#5B5F6B] hover:text-[#ECEAE6] text-sm">Close</button>
            </div>
            <p className="text-[#5B5F6B] text-sm mb-5">{selectedServer.region} · Historical performance</p>
            <ResourceChart series={[
              { label: 'CPU', color: '#2DD4BF', data: (metricsHistory[selectedServer.id] || []).map(h => h.cpu) },
              { label: 'Memory', color: '#34D399', data: (metricsHistory[selectedServer.id] || []).map(h => h.memory) },
            ]} />
          </div>
        </div>
      )}

      <ToastNotification toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
