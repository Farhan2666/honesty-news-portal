const TOKEN = process.env.SUPABASE_MGMT_TOKEN;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;

function getCredentials() {
  if (!TOKEN || !PROJECT_REF) {
    throw new Error("SUPABASE_MGMT_TOKEN and SUPABASE_PROJECT_REF must be set in .env");
  }
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

function escape(val: unknown): string {
  if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
  if (typeof val === "number") return String(val);
  return "NULL";
}

export function buildWhereClause(conditions: Record<string, unknown>): { clause: string; params: unknown[] } {
  const params: unknown[] = [];
  const clauses: string[] = [];

  for (const [key, val] of Object.entries(conditions)) {
    if (val === undefined || val === null) continue;
    const col = `"${key.replace(/([A-Z])/g, "_$1").toLowerCase()}"`;
    if (typeof val === "string") {
      clauses.push(`${col} = '${val.replace(/'/g, "''")}'`);
    } else if (typeof val === "number" || typeof val === "boolean") {
      clauses.push(`${col} = ${val}`);
    } else {
      clauses.push(`${col} = '${String(val)}'`);
    }
  }
  return { clause: clauses.length ? clauses.join(" AND ") : "1=1", params };
}
