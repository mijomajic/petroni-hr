let input = '';
for await (const chunk of process.stdin) input += chunk;
const counts = new Map();

function addEvent(event) {
  if (event.event !== 'public_404' || typeof event.path !== 'string') return;
  const key = `${event.method ?? 'GET'} ${event.path}`;
  const item = counts.get(key) ?? { count: 0, lastSeen: '', referrers: new Set() };
  item.count += 1;
  if (event.timestamp && event.timestamp > item.lastSeen) item.lastSeen = event.timestamp;
  if (event.referrer) item.referrers.add(event.referrer);
  counts.set(key, item);
}

function parseEmbedded(value) {
  if (typeof value !== 'string' || !value.includes('public_404')) return;
  const start = value.indexOf('{');
  if (start < 0) return;
  try {
    addEvent(JSON.parse(value.slice(start)));
  } catch {
    // Ignore non-JSON provider framing.
  }
}

for (const line of input.split(/\r?\n/)) {
  const jsonStart = line.indexOf('{');
  if (jsonStart < 0) continue;
  try {
    const record = JSON.parse(line.slice(jsonStart));
    if (record.event === 'public_404') {
      addEvent(record);
      continue;
    }
    if (Number(record.responseStatusCode) === 404 && typeof record.requestPath === 'string') {
      addEvent({
        event: 'public_404',
        timestamp: Number.isFinite(Number(record.timestamp))
          ? new Date(Number(record.timestamp)).toISOString()
          : '',
        method: record.requestMethod,
        path: record.requestPath
      });
      continue;
    }
    parseEmbedded(record.message);
    for (const entry of Array.isArray(record.logs) ? record.logs : []) {
      parseEmbedded(entry?.message ?? entry?.text ?? entry);
    }
  } catch {
    // Ignore non-JSON log framing and unrelated lines.
  }
}

const rows = [...counts.entries()]
  .map(([request, item]) => ({
    request,
    count: item.count,
    last_seen: item.lastSeen,
    referrers: [...item.referrers].sort().join(' | ')
  }))
  .sort((left, right) => right.count - left.count || left.request.localeCompare(right.request));

console.log(['request,count,last_seen,referrers', ...rows.map((row) =>
  [row.request, row.count, row.last_seen, row.referrers]
    .map((value) => `"${String(value).replaceAll('"', '""')}"`)
    .join(',')
)].join('\n'));
