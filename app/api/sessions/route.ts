import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/lib/session-service";

/**
 * Unified API endpoint for session management across all Builder's Lab apps.
 * Handles save, list, get, update, delete, and count operations.
 *
 * POST /api/sessions
 * Body: { action: string, ...params }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...params } = body;

    switch (action) {
      case "save": {
        // Validate required fields
        if (!params.appName || !params.sessionType || !params.title || !params.data) {
          return NextResponse.json(
            { error: "Missing required fields: appName, sessionType, title, data" },
            { status: 400 }
          );
        }

        const savedSession = await SessionService.save({
          appName: params.appName,
          sessionType: params.sessionType,
          title: params.title,
          data: params.data,
          metadata: params.metadata,
        });

        return NextResponse.json({ success: true, session: savedSession });
      }

      case "list": {
        if (!params.appName) {
          return NextResponse.json(
            { error: "Missing required field: appName" },
            { status: 400 }
          );
        }

        const sessions = await SessionService.list(
          params.appName,
          params.limit || 50,
          params.offset || 0
        );

        return NextResponse.json({ sessions });
      }

      case "listAll": {
        const sessions = await SessionService.listAll(
          params.limit || 10
        );
        return NextResponse.json({ sessions });
      }

      case "get": {
        if (!params.id) {
          return NextResponse.json(
            { error: "Missing required field: id" },
            { status: 400 }
          );
        }

        const session = await SessionService.get(params.id);

        if (!session) {
          return NextResponse.json(
            { error: "Session not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({ session });
      }

      case "update": {
        if (!params.id) {
          return NextResponse.json(
            { error: "Missing required field: id" },
            { status: 400 }
          );
        }

        const updatedSession = await SessionService.update(
          params.id,
          params.title,
          params.data,
          params.metadata
        );

        return NextResponse.json({ success: true, session: updatedSession });
      }

      case "delete": {
        if (!params.id) {
          return NextResponse.json(
            { error: "Missing required field: id" },
            { status: 400 }
          );
        }

        await SessionService.delete(params.id);

        return NextResponse.json({ success: true });
      }

      case "count": {
        if (!params.appName) {
          return NextResponse.json(
            { error: "Missing required field: appName" },
            { status: 400 }
          );
        }

        const count = await SessionService.count(params.appName);

        return NextResponse.json({ count });
      }

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}. Valid actions: save, list, get, update, delete, count` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Session API Error:", error);

    // Handle authentication errors
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
