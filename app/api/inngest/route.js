import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { GenerateNotes } from "@/inngest/functions";

// Create an API that serves the Inngest functions with proper error handling
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        GenerateNotes
    ],
    // Configure for development environment
    landingPage: process.env.NODE_ENV === 'development',
    // Only use signing in production
    signingKey: process.env.NODE_ENV === 'production' ? process.env.INNGEST_SIGNING_KEY : undefined,
});
