#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const docsDir = resolve(root, 'docs/help');

async function parseEnvFile(filePath) {
  try {
    const text = await readFile(filePath, 'utf8');
    const out = {};
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      const match = trimmed.match(/^([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!match) {
        continue;
      }
      out[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
    return out;
  } catch {
    return {};
  }
}

async function loadLocalEnv() {
  const candidates = [
    resolve(root, '../amcp-core/.env'),
    resolve(root, '.env'),
    resolve(root, 'apps/desktop-client/.env'),
    resolve(root, 'apps/web-client/amcp-web-client/.env'),
    resolve(root, 'apps/web-client/amcp-admin-client/.env'),
  ];
  const merged = {};
  for (const file of candidates) {
    Object.assign(merged, await parseEnvFile(file));
  }
  return merged;
}

const localEnv = await loadLocalEnv();
const getEnv = (name, fallback = '') => {
  const fromProcess = process.env[name];
  if (fromProcess != null && String(fromProcess).trim() !== '') {
    return String(fromProcess);
  }
  const fromFile = localEnv[name];
  if (fromFile != null && String(fromFile).trim() !== '') {
    return String(fromFile);
  }
  return fallback;
};

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = required.filter((name) => !getEnv(name).trim());
if (missing.length > 0) {
  console.error(`[docs-sync] missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const supabaseUrl = getEnv('SUPABASE_URL').replace(/\/+$/, '');
const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const bucket = getEnv('HELP_DOCS_SUPABASE_BUCKET', 'client-docs').replace(/^\/+|\/+$/g, '');
const prefix = getEnv('HELP_DOCS_SUPABASE_PREFIX', 'help').replace(/^\/+|\/+$/g, '');

async function ensurePrivateBucket(bucketName) {
  const endpoint = `${supabaseUrl}/storage/v1/bucket`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      id: bucketName,
      name: bucketName,
      public: false,
      file_size_limit: null,
      allowed_mime_types: null,
    }),
  });

  if (response.ok) {
    console.log(`[docs-sync] created bucket ${bucketName} (private)`);
    return;
  }

  const text = await response.text();
  if (response.status === 409 || text.includes('Duplicate') || text.includes('already exists')) {
    // Docs are served through the gateway API (/help-docs), so keep the bucket private.
    const update = await fetch(`${endpoint}/${bucketName}`, {
      method: 'PUT',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ public: false }),
    });
    if (!update.ok) {
      throw new Error(`Failed to make bucket ${bucketName} private: ${update.status} - ${await update.text()}`);
    }
    console.log(`[docs-sync] bucket ${bucketName} already exists (set private)`);
    return;
  }

  throw new Error(`Failed to create bucket ${bucketName}: ${response.status} ${response.statusText} - ${text}`);
}

const entries = await readdir(docsDir, { withFileTypes: true });
const files = entries
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => name.endsWith('.md') || name.endsWith('.json'));

if (files.length === 0) {
  console.error('[docs-sync] no .md or .json files found in docs/help');
  process.exit(1);
}

await ensurePrivateBucket(bucket);

async function uploadFile(fileName) {
  const fullPath = resolve(docsDir, fileName);
  const data = await readFile(fullPath);
  const objectPath = prefix.length > 0 ? `${prefix}/${fileName}` : fileName;
  const endpoint = `${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`;
  const contentType = fileName.endsWith('.md') ? 'text/markdown; charset=utf-8' : 'application/json; charset=utf-8';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'x-upsert': 'true',
      'content-type': contentType,
    },
    body: data,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Upload failed for ${fileName}: ${response.status} ${response.statusText} - ${body}`);
  }

  console.log(`[docs-sync] uploaded ${fileName} -> ${bucket}/${objectPath} (served via gateway /help-docs)`);
}

for (const fileName of files) {
  await uploadFile(fileName);
}

console.log(`[docs-sync] completed (${files.length} files) to bucket ${bucket} with prefix ${prefix}`);
