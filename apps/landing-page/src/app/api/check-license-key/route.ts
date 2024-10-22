import { activateLicense, lemonSqueezySetup, validateLicense } from "@lemonsqueezy/lemonsqueezy.js";
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
  instanceId: z.string().nullish(),
});

export async function POST(request: NextRequest) {
  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    // Validate input
    const body = await request.json();
    let { licenseKey, instanceId } = inputSchema.parse(body);

    console.log("Request incoming", licenseKey, instanceId);

    if (!instanceId) {
      const { data: activationData } = await activateLicense(licenseKey, "focu");
      console.log("Activation data", activationData);
      instanceId = activationData?.instance?.id;
    }
    const { data: licenseData } = await validateLicense(licenseKey, instanceId);
    console.log("License data", licenseData);
    if (licenseData?.valid) {
      return new NextResponse(
        JSON.stringify({
          message: "Valid license key",
          instanceId,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } else {
      return new NextResponse(
        JSON.stringify({ error: "Invalid license key" }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    let errorMessage = "Internal server error";
    let statusCode = 500;

    if (error instanceof z.ZodError) {
      errorMessage = "Invalid input data";
      statusCode = 400;
    }

    return new NextResponse(
      JSON.stringify({ error: errorMessage, details: error instanceof z.ZodError ? error.errors : undefined }),
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
