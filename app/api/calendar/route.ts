import { NextRequest, NextResponse } from "next/server";
import { CalendarService } from "@/lib/calendar-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ...params } = body;

    switch (action) {
      case "create": {
        if (!params.title || !params.due_date) {
          return NextResponse.json(
            { error: "Missing required fields: title, due_date" },
            { status: 400 }
          );
        }

        const task = await CalendarService.create({
          title: params.title,
          description: params.description,
          due_date: params.due_date,
          status: params.status,
          platform: params.platform,
          content_type: params.content_type,
          linked_session_id: params.linked_session_id,
          app_needed: params.app_needed,
          reminder_date: params.reminder_date,
          metadata: params.metadata,
        });

        return NextResponse.json({ success: true, task });
      }

      case "list": {
        const tasks = await CalendarService.list(
          params.status,
          params.startDate,
          params.endDate,
          params.limit,
          params.offset
        );

        return NextResponse.json({ tasks });
      }

      case "get": {
        if (!params.id) {
          return NextResponse.json(
            { error: "Missing required field: id" },
            { status: 400 }
          );
        }

        const task = await CalendarService.get(params.id);
        return NextResponse.json({ task });
      }

      case "update": {
        if (!params.id) {
          return NextResponse.json(
            { error: "Missing required field: id" },
            { status: 400 }
          );
        }

        const { id, action: _, ...updateParams } = params;

        const updatedTask = await CalendarService.update(id, updateParams);
        return NextResponse.json({ success: true, task: updatedTask });
      }

      case "delete": {
        if (!params.id) {
          return NextResponse.json(
            { error: "Missing required field: id" },
            { status: 400 }
          );
        }

        await CalendarService.delete(params.id);
        return NextResponse.json({ success: true });
      }

      case "getUpcoming": {
        const tasks = await CalendarService.getUpcoming(params.hoursAhead || 24);
        return NextResponse.json({ tasks });
      }

      case "getIncomplete": {
        const tasks = await CalendarService.getIncomplete();
        return NextResponse.json({ tasks });
      }

      case "getStats": {
        const stats = await CalendarService.getStats();
        return NextResponse.json({ stats });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Calendar API error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
