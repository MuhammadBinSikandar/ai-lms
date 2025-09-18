import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";
import { db } from '@/configs/db';
import { STUDY_TYPE_CONTENT_TABLE } from '@/configs/schema';

export async function POST(request) {
    const { chapters, courseId, type } = await request.json();

    const prompt = `Create 20 high-quality flashcards covering the most essential concepts, definitions, practical applications, and common pitfalls from these chapters: ${chapters}. 
Focus on ensuring that the flashcards build both recall and deep understanding of the material. 
Questions should test comprehension, not rote memorization. 
Keep answers clear, accurate, and enriched with examples where helpful.`;

    const result = await db.insert(STUDY_TYPE_CONTENT_TABLE).values({
        courseId: courseId,
        type: type,
    }).returning({
        id: STUDY_TYPE_CONTENT_TABLE.id
    });

    inngest.send({
        name: "studytype.content",
        data: {
            studyType: type,
            prompt: prompt,
            courseId: courseId,
            recordId: result[0].id
        }
    });

    return NextResponse.json(result[0].id);
}
