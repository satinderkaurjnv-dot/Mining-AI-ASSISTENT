import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = String(body.username || "");
    const password = String(body.password || "");

    const correctUsername =
      process.env.ADMIN_USERNAME || "miningAdmin";

    const correctPassword =
      process.env.ADMIN_PASSWORD || "Mining@123";

    if (
      username !== correctUsername ||
      password !== correctPassword
    ) {
      return NextResponse.json(
        {
          error: "Invalid username or password.",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set("admin_authenticated", "true", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        error: "Login failed.",
      },
      { status: 500 }
    );
  }
}