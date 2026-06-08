const TOKEN = process.env.SUPABASE_MGMT_TOKEN;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;

function getCredentials() {
  if (!TOKEN || !PROJECT_REF) {
    throw new Error("SUPABASE_MGMT_TOKEN environment variable not set");
  }
  return { token: TOKEN, ref: PROJECT_REF };
}

function getCredentials() {
  return { token: TOKEN, ref: PROJECT_REF };
}

export async function query<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  const { token, ref } = getCredentials();
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("DB query error:", res.status, text);
    throw new Error(`DB query failed (${res.status})`);
  }
  return res.json();
}


