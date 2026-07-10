import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDatabase, unlockWithStoredPassword } from "@/lib/db";
import { brands, packagingSizes } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    unlockWithStoredPassword();
    const db = getDatabase();

    const brandList = await db.select().from(brands).orderBy(brands.createdAt);
    const result = [];

    for (const brand of brandList) {
      const sizes = await db
        .select()
        .from(packagingSizes)
        .where(eq(packagingSizes.brandId, brand.id));
      result.push({
        ...brand,
        packagingSizes: sizes,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET brands error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    unlockWithStoredPassword();
    const db = getDatabase();

    const brandId = randomUUID();
    const now = new Date();

    await db.insert(brands).values({
      id: brandId,
      name: name.trim(),
      createdAt: now,
    });

    const newBrand = await db.select().from(brands).where(eq(brands.id, brandId)).limit(1);

    return NextResponse.json(
      {
        ...newBrand[0],
        packagingSizes: [],
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST brands error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
