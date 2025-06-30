// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt           from "bcryptjs";
import { prisma }       from "@/lib/prisma";

export async function POST (req: Request) {
  try {
    const { name, email, password, confirmPassword } = await req.json();

    if (!email || !password || password !== confirmPassword) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email }});
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name, email, password: hash }
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}