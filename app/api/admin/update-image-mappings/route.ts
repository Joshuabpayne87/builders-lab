import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const mappings = await request.json() as Record<string, string>;

    // Update dashboard page
    const dashboardPath = path.join(process.cwd(), "app/dashboard/page.tsx");
    let dashboardContent = await fs.readFile(dashboardPath, "utf-8");

    // Update apps page
    const appsPath = path.join(process.cwd(), "app/apps/page.tsx");
    let appsContent = await fs.readFile(appsPath, "utf-8");

    // Apply mappings to both files
    for (const [appName, imagePath] of Object.entries(mappings)) {
      const appNameFormatted = appName === "Banana Blitz" ? "Banana Blitz" : appName;

      // Update dashboard
      dashboardContent = dashboardContent.replace(
        new RegExp(`(name: "${appNameFormatted}",.*?image: ").*?(")`,"s"),
        `$1${imagePath}$2`
      );

      // Update apps
      appsContent = appsContent.replace(
        new RegExp(`(name: "${appNameFormatted}",.*?image: ").*?(")`,"s"),
        `$1${imagePath}$2`
      );
    }

    // Write updated files
    await fs.writeFile(dashboardPath, dashboardContent);
    await fs.writeFile(appsPath, appsContent);

    // Git commit and push
    await execAsync(`cd ${process.cwd()} && git add app/dashboard/page.tsx app/apps/page.tsx`);
    await execAsync(`cd ${process.cwd()} && git commit -m "Update app card image mappings via admin panel"`);
    await execAsync(`cd ${process.cwd()} && git push`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating image mappings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
