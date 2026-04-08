import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY is missing. AI features will not work until it is set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface ItineraryRequest {
  destination: string;
  startDate?: string;
  endDate?: string;
  days: string;
  budget: string;
  interests: string;
  travelStyle?: "Solo" | "Group" | "Family";
  groupInterests?: string[];
  features?: {
    reasoning?: boolean;
    safety?: boolean;
    gamification?: boolean;
    packingList?: boolean;
    offlineMode?: boolean;
  };
}

export interface AdaptationRequest {
  existingItinerary: string;
  weatherData: string;
  trafficInfo: string;
  delays?: string;
}

export async function generateItinerary(request: ItineraryRequest) {
  let prompt = `Act as an intelligent travel planner. Create a detailed travel itinerary for:

Destination: ${request.destination}
${request.startDate ? `Start Date: ${request.startDate}` : ""}
${request.endDate ? `End Date: ${request.endDate}` : ""}
Duration: ${request.days} days
Budget: ${request.budget.toLowerCase().includes("rs") ? request.budget : `Rs. ${request.budget}`}
Interests: ${request.interests}
Travel Style: ${request.travelStyle || "Not specified"}

Requirements:
- Create a day-wise itinerary
- Include morning, afternoon, evening plans
- Suggest places, food, and transport
- Keep travel time realistic and optimized
- Stay within budget

Format:
Day 1:
Morning:
Afternoon:
Evening:

Also include:
- Estimated daily cost
- Travel tips`;

  if (request.features?.reasoning) {
    prompt += `\n\nHUMAN-LIKE REASONING MODE:
For each activity:
- Add a short reason why it is included
- Consider user interests, time, and location proximity
Format:
Activity: ...
Reason: ...`;
  }

  if (request.groupInterests && request.groupInterests.length > 0) {
    prompt += `\n\nGROUP CONFLICT RESOLVER MODE:
Users and preferences:
${request.groupInterests.map((int, i) => `User ${i + 1}: ${int}`).join("\n")}
Task:
- Create a balanced itinerary
- Ensure each person's preferences are fairly included
- Mention which user's preference is satisfied in each activity (e.g., Satisfies: User X)`;
  }

  if (request.features?.safety) {
    prompt += `\n\nEMERGENCY-AWARE LAYER:
Enhance it by adding a "Safety Info" section after each day including:
- Nearby hospitals
- Police stations
- Emergency contact tips
- Safe travel routes
- Precautions based on destination`;
  }

  if (request.features?.gamification) {
    prompt += `\n\nGAMIFICATION MODE:
Add:
- Points for each activity
- Challenges (e.g., try 3 local foods)
- Rewards (badges, achievements)`;
  }

  if (request.features?.offlineMode) {
    prompt += `\n\nOFFLINE-FIRST MODE:
- All essential info must be available offline
- Include clear directions (text-based)
- Avoid reliance on live data
- Add an "SMS Summary" at the very end (very concise)`;
  }

  if (request.features?.packingList) {
    prompt += `\n\nSMART PACKING GENERATOR:
Add a comprehensive packing checklist at the end of the itinerary based on the destination and activities.
Format:
Category:
- Item 1
- Item 2`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error: any) {
    console.error("Detailed Gemini Error:", error);
    
    // Extract a more helpful error message
    let errorMessage = "An unknown error occurred with the AI service.";
    if (error?.message) errorMessage = error.message;
    if (error?.status) errorMessage = `[${error.status}] ${errorMessage}`;
    
    if (errorMessage.includes("403") || errorMessage.includes("PERMISSION_DENIED")) {
      errorMessage = "Permission Denied (403). Please ensure 'Generative AI API' is enabled in Google Cloud and your API key has NO website restrictions.";
    } else if (errorMessage.includes("API_KEY_INVALID") || !apiKey) {
      errorMessage = "Invalid or missing API Key. Please check your environment variables.";
    }

    const timestamp = new Date().toLocaleTimeString();
    throw new Error(`AI Error (${timestamp}) [Model: gemini-3-flash-preview]: ${errorMessage}`);
  }
}

export async function adaptItinerary(request: AdaptationRequest) {
  const prompt = `CONTEXT-AWARE (Weather + Traffic Adaptation)
You are a smart travel assistant that adapts plans dynamically.

Given this itinerary:
${request.existingItinerary}

And real-time conditions:
Weather: ${request.weatherData}
Traffic: ${request.trafficInfo}
Delays: ${request.delays || "None"}

Modify the itinerary by:
- Replacing unsuitable activities (e.g., outdoor in rain)
- Reordering places to reduce travel time
- Suggesting better alternatives

Keep structure same (day-wise).
Explain briefly what changes were made and why.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error: any) {
    console.error("Detailed Adaptation Error:", error);
    const errorMessage = error?.message || "Failed to adapt itinerary.";
    throw new Error(`Adaptation Error [Model: gemini-3-flash-preview]: ${errorMessage}`);
  }
}
