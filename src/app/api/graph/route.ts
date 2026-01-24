import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { BlobNotFoundError, head, put } from "@vercel/blob";

const DATA_DIR = path.join(process.cwd(), "data");
const SAVED_PATH = path.join(DATA_DIR, "graph_saved.json");
const DEFAULT_PATH = path.join(process.cwd(), "public", "data", "graph_full.json");
const SAVED_BLOB_PATH = "graph_saved.json";
const HAS_BLOB_TOKEN = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const readJsonFile = async (filePath: string) => {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
};

const readSavedBlob = async () => {
  const metadata = await head(SAVED_BLOB_PATH);
  const response = await fetch(metadata.url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Blob读取失败: ${response.status}`);
  }
  return response.json();
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (HAS_BLOB_TOKEN) {
      try {
        const saved = await readSavedBlob();
        return NextResponse.json(saved);
      } catch (error) {
        if (!(error instanceof BlobNotFoundError)) {
          throw error;
        }
      }
    } else {
      try {
        const saved = await fs.readFile(SAVED_PATH, "utf8");
        return NextResponse.json(JSON.parse(saved));
      } catch (error) {
        // ignore missing/invalid local data, fallback to default
      }
    }

    const fallback = await readJsonFile(DEFAULT_PATH);
    return NextResponse.json(fallback);
  } catch (error) {
    return NextResponse.json(
      { error: "读取图谱数据失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (HAS_BLOB_TOKEN) {
      await put(SAVED_BLOB_PATH, JSON.stringify(data, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      });
    } else {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(SAVED_PATH, JSON.stringify(data, null, 2), "utf8");
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "保存失败" },
      { status: 500 }
    );
  }
}
