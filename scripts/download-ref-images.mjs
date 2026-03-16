#!/usr/bin/env node
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const REF_FILE = path.join(ROOT, "ref2d.js");
const OUT_DIR = path.join(ROOT, "IMG", "remote-originals");
const REPORT_DIR = path.join(ROOT, "reports", "image-downloads");
const CONCURRENCY = 6;
const REQUEST_TIMEOUT_MS = 45000;

function extractUniqueRemoteSrcs(source) {
  const urls = [];
  const re = /src:\s*"([^"]+)"/g;
  let match;
  while ((match = re.exec(source)) !== null) {
    const url = match[1].trim();
    if (!/^https?:\/\//i.test(url)) continue;
    urls.push(url);
  }
  return [...new Set(urls)];
}

function safeBaseName(url, index) {
  let filename = "";
  try {
    const u = new URL(url);
    filename = decodeURIComponent(path.basename(u.pathname));
  } catch {
    filename = `image_${index + 1}.bin`;
  }
  if (!filename || filename === "/" || filename === ".") {
    filename = `image_${index + 1}.bin`;
  }
  filename = filename.replace(/[^A-Za-z0-9._-]+/g, "_");
  return `${String(index + 1).padStart(3, "0")}_${filename}`;
}

function toCsv(rows) {
  const header = ["index", "status", "bytes", "file", "url", "error"];
  const lines = [header.join(",")];
  for (const row of rows) {
    const values = header.map((key) => {
      const raw = String(row[key] ?? "");
      const escaped = raw.replace(/"/g, "\"\"");
      return `"${escaped}"`;
    });
    lines.push(values.join(","));
  }
  return `${lines.join("\n")}\n`;
}

async function fileSizeIfExists(filePath) {
  try {
    const info = await stat(filePath);
    return info.size;
  } catch {
    return null;
  }
}

async function downloadOne(item) {
  const existingSize = await fileSizeIfExists(item.filePath);
  if (existingSize !== null) {
    return { ...item, status: "cached", bytes: existingSize };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(item.url, { signal: controller.signal });
    if (!res.ok) {
      return { ...item, status: "error", bytes: 0, error: `HTTP ${res.status}` };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(item.filePath, buf);
    return { ...item, status: "downloaded", bytes: buf.length };
  } catch (err) {
    return {
      ...item,
      status: "error",
      bytes: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function runPool(items, worker, size) {
  const out = new Array(items.length);
  let cursor = 0;
  async function runWorker() {
    while (true) {
      const i = cursor++;
      if (i >= items.length) break;
      out[i] = await worker(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, size) }, runWorker));
  return out;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(REPORT_DIR, { recursive: true });

  const text = await readFile(REF_FILE, "utf8");
  const urls = extractUniqueRemoteSrcs(text);
  const jobs = urls.map((url, i) => {
    const file = safeBaseName(url, i);
    return {
      index: i + 1,
      url,
      file,
      filePath: path.join(OUT_DIR, file),
    };
  });

  console.log(`Images found: ${jobs.length}`);
  console.log(`Downloading to: ${OUT_DIR}`);

  const results = await runPool(jobs, downloadOne, CONCURRENCY);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = path.join(REPORT_DIR, `download-${stamp}.json`);
  const csvPath = path.join(REPORT_DIR, `download-${stamp}.csv`);
  const latestJsonPath = path.join(REPORT_DIR, "latest.json");
  const latestCsvPath = path.join(REPORT_DIR, "latest.csv");

  const summary = {
    total: results.length,
    downloaded: results.filter((r) => r.status === "downloaded").length,
    cached: results.filter((r) => r.status === "cached").length,
    errors: results.filter((r) => r.status === "error").length,
    bytes: results.reduce((acc, r) => acc + (Number.isFinite(r.bytes) ? r.bytes : 0), 0),
  };

  const rows = results.map((r) => ({
    index: r.index,
    status: r.status,
    bytes: r.bytes ?? 0,
    file: r.file,
    url: r.url,
    error: r.error ?? "",
  }));

  const payload = { generated_at: new Date().toISOString(), summary, items: rows };
  await writeFile(jsonPath, JSON.stringify(payload, null, 2), "utf8");
  await writeFile(latestJsonPath, JSON.stringify(payload, null, 2), "utf8");
  const csv = toCsv(rows);
  await writeFile(csvPath, csv, "utf8");
  await writeFile(latestCsvPath, csv, "utf8");

  console.log("\nSummary:");
  console.log(`- downloaded: ${summary.downloaded}`);
  console.log(`- cached: ${summary.cached}`);
  console.log(`- errors: ${summary.errors}`);
  console.log(`- bytes: ${summary.bytes}`);
  console.log(`\nReports:\n- ${jsonPath}\n- ${csvPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
