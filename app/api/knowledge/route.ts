import { NextRequest, NextResponse } from "next/server";
import { KnowledgeService } from "@/lib/knowledge-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...params } = body;

    if (action === "save") {
      await KnowledgeService.save({
        content: params.content,
        sourceApp: params.sourceApp,
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        metadata: params.metadata,
      });
      return NextResponse.json({ success: true });
    } 
    
    if (action === "search") {
      const results = await KnowledgeService.search(
        params.query,
        params.limit,
        params.threshold
      );
      return NextResponse.json({ results });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Knowledge API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
