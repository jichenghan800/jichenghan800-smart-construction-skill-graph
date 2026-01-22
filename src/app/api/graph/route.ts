import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const SAVED_PATH = path.join(DATA_DIR, "graph_saved.json");
const DEFAULT_PATH = path.join(process.cwd(), "public", "data", "graph_full.json");

const readJsonFile = async (filePath: string) => {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
};

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    try {
      const saved = await fs.readFile(SAVED_PATH, "utf8");
      return NextResponse.json(JSON.parse(saved));
    } catch (error) {
      // ignore missing/invalid saved data, fallback to default
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
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(SAVED_PATH, JSON.stringify(data, null, 2), "utf8");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "保存失败" },
      { status: 500 }
    );
  }
}
