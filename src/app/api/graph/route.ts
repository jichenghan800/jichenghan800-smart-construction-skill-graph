import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { BlobNotFoundError, head, put } from "@vercel/blob";

const DEFAULT_PATH = path.join(process.cwd(), "public", "data", "graph_full.json");
const SAVED_BLOB_PATH = "graph_saved.json";

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
    try {
      const saved = await readSavedBlob();
      return NextResponse.json(saved);
    } catch (error) {
      if (!(error instanceof BlobNotFoundError)) {
        throw error;
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
    await put(SAVED_BLOB_PATH, JSON.stringify(data, null, 2), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "保存失败" },
      { status: 500 }
    );
  }
}
