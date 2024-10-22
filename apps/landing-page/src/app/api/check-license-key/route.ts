import { lemonSqueezySetup, validateLicense } from "@lemonsqueezy/lemonsqueezy.js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

// Set up LemonSqueezy with the API key
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY,
});

// Define a schema for input validation
const inputSchema = z.object({
  licenseKey: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Validate input
    const body = await request.json();
    const { licenseKey } = inputSchema.parse(body);

    // Validate license key
    const { data: licenseData } = await validateLicense(licenseKey);

    if (licenseData?.valid) {
      return NextResponse.json(
        { message: "Valid license key" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid license key" },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
