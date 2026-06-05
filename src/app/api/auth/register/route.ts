import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface RegisterSuccessResponse {
  success: true;
  user: {
    id: string;
    name: string;
    email: string;
    role: "applicant";
    designation?: string;
  };
  message: string;
}

interface RegisterFailureResponse {
  success: false;
  error: string;
}

// ---------------------------------------------------------------------------
// POST /api/auth/register  — Applicant self-registration
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, email, password, phone } = body;

    // --- Validation ---
    if (!name || !email || !password) {
      return NextResponse.json<RegisterFailureResponse>(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json<RegisterFailureResponse>(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json<RegisterFailureResponse>(
        { success: false, error: "Please provide a valid email address" },
        { status: 400 },
      );
    }

    // In production this would:
    // 1. Check for duplicate emails in the database
    // 2. Hash the password with bcrypt/argon2
    // 3. Create a User record via Prisma
    // 4. Send a verification email
    //
    // For the demo we simply return a success response with the applicant role.

    const user: RegisterSuccessResponse["user"] = {
      id: `user_applicant_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      role: "applicant",
    };

    // Attach phone if provided (stored in production, acknowledged here)
    void phone;

    return NextResponse.json<RegisterSuccessResponse>(
      {
        success: true,
        user,
        message:
          "Registration successful. You can now log in with your credentials.",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json<RegisterFailureResponse>(
      { success: false, error: "Invalid request body" },
      { status: 400 },
    );
  }
}
