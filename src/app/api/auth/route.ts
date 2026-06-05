import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UserRole = "hr_admin" | "manager" | "employee" | "recruiter" | "applicant";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  designation?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginSuccessResponse {
  success: true;
  user: AuthUser;
}

interface LoginFailureResponse {
  success: false;
  error: string;
}

interface SessionResponse {
  authenticated: boolean;
  user?: AuthUser;
}

// ---------------------------------------------------------------------------
// Demo user store (mirrors the Zustand store in @/lib/store)
// ---------------------------------------------------------------------------

const roleConfig: Record<UserRole, Omit<AuthUser, "id">> = {
  hr_admin: {
    name: "Priya Sharma",
    email: "priya@kamglobal.io",
    role: "hr_admin",
    department: "Human Resources",
    designation: "HR Director",
  },
  manager: {
    name: "Rajesh Kumar",
    email: "rajesh@kamglobal.io",
    role: "manager",
    department: "Engineering",
    designation: "Engineering Manager",
  },
  employee: {
    name: "Anita Deshmukh",
    email: "anita@kamglobal.io",
    role: "employee",
    department: "Engineering",
    designation: "Software Engineer",
  },
  recruiter: {
    name: "Kavitha Reddy",
    email: "kavitha@kamglobal.io",
    role: "recruiter",
    department: "Human Resources",
    designation: "Senior Recruiter",
  },
  applicant: {
    name: "Arun Venkatesh",
    email: "arun@gmail.com",
    role: "applicant",
    designation: "Frontend Developer",
  },
};

const demoUsers: Record<
  string,
  { password: string; role: UserRole }
> = {
  "priya@kamglobal.io": { password: "admin123", role: "hr_admin" },
  "rajesh@kamglobal.io": { password: "manager123", role: "manager" },
  "anita@kamglobal.io": { password: "employee123", role: "employee" },
  "kavitha@kamglobal.io": { password: "recruiter123", role: "recruiter" },
  "arun@gmail.com": { password: "applicant123", role: "applicant" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildUser(role: UserRole, email: string): AuthUser {
  const config = roleConfig[role];
  return {
    id: `user_${role}`,
    name: config.name,
    email,
    role: config.role,
    ...(config.department && { department: config.department }),
    ...(config.designation && { designation: config.designation }),
  };
}

// ---------------------------------------------------------------------------
// POST /api/auth  — Login
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<LoginFailureResponse>(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const demoUser = demoUsers[normalizedEmail];

    if (!demoUser || demoUser.password !== password) {
      return NextResponse.json<LoginFailureResponse>(
        { success: false, error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const user = buildUser(demoUser.role, normalizedEmail);

    return NextResponse.json<LoginSuccessResponse>({
      success: true,
      user,
    });
  } catch {
    return NextResponse.json<LoginFailureResponse>(
      { success: false, error: "Invalid request body" },
      { status: 400 },
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/auth  — Session check
// ---------------------------------------------------------------------------

export async function GET() {
  // In production this would validate a session token / JWT.
  // For the demo prototype we return an unauthenticated state;
  // the client-side Zustand store is the source of truth.
  const response: SessionResponse = { authenticated: false };
  return NextResponse.json(response);
}

// ---------------------------------------------------------------------------
// DELETE /api/auth  — Logout
// ---------------------------------------------------------------------------

export async function DELETE() {
  // In production this would invalidate the session / clear cookies.
  return NextResponse.json({ success: true });
}
