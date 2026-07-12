import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dbPassword } = body;

    if (!dbPassword) {
      return NextResponse.json({ error: "Database password is required" }, { status: 400 });
    }

    let dbPath = process.env.DB_PATH;

    // If DB_PATH not set, use default locations
    if (!dbPath) {
      if (process.platform === "win32" && process.env.APPDATA) {
        dbPath = path.join(process.env.APPDATA, "FlourMill");
      } else {
        // Development: use ./data folder, Production: use home directory
        dbPath = path.join(process.cwd(), "data");
      }
    }

    const dbFile = path.join(dbPath, "flour-mill.db");
    const keyFile = path.join(dbPath, ".key");

    console.log("Attempting to reset database at:", dbPath);

    // Verify password matches stored key
    if (fs.existsSync(keyFile)) {
      const storedPassword = fs.readFileSync(keyFile, "utf-8");
      if (dbPassword !== storedPassword) {
        return NextResponse.json(
          { error: "Incorrect database password" },
          { status: 401 }
        );
      }
    }

    // Delete database file
    if (fs.existsSync(dbFile)) {
      fs.unlinkSync(dbFile);
      console.log("Database file deleted");
    }

    // Delete encryption key file
    if (fs.existsSync(keyFile)) {
      fs.unlinkSync(keyFile);
      console.log("Key file deleted");
    }

    return NextResponse.json({
      success: true,
      message: "Database reset successfully",
      dbPath
    });
  } catch (error) {
    console.error("Recovery error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to reset database";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
