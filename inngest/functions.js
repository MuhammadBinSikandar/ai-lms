// // inngest/functions.js

import { inngest } from "./client";
import { db } from '@/configs/db';
import { eq } from 'drizzle-orm';
import { USER_TABLE } from '@/configs/schema';
import { generateNotes } from "@/configs/AiModel";
import { STUDY_MATERIAL_TABLE, CHAPTER_NOTES_TABLE } from "@/configs/schema";

export const GenerateNotes = inngest.createFunction(
    {
        id: "generate-course-notes",
        concurrency: {
            limit: 5 // Limit concurrent executions to avoid rate limits
        }
    },
    { event: 'notes.generate' },

    async ({ event, step }) => {
        const { course } = event.data;
        const chapters = course?.courseLayout?.chapters;

        if (!chapters || !Array.isArray(chapters)) {
            // Update course status to error
            await step.run("update-course-error", async () => {
                await db.update(STUDY_MATERIAL_TABLE)
                    .set({ status: 'Error' })
                    .where(eq(STUDY_MATERIAL_TABLE.courseId, course?.courseId));
            });
            throw new Error("Invalid course layout: chapters not found or not an array");
        }

        console.log(`Starting to generate notes for ${chapters.length} chapters for course: ${course?.courseId}`);

        // Update course status to generating
        await step.run("update-course-generating", async () => {
            await db.update(STUDY_MATERIAL_TABLE)
                .set({ status: 'Generating' })
                .where(eq(STUDY_MATERIAL_TABLE.courseId, course?.courseId));
        });

        // Process each chapter as a separate step for better reliability
        for (let index = 0; index < chapters.length; index++) {
            const chapter = chapters[index];
            const chapterTitle = chapter?.ChapterTitle || chapter?.chapter_title || `Chapter ${index + 1}`;

            await step.run(`generate-chapter-${index}`, async () => {
                console.log(`Processing chapter ${index + 1}/${chapters.length}: ${chapterTitle}`);

                const PROMPT = `Generate comprehensive exam material and detailed content for this chapter. 
                Make sure to cover all the topic points in the content. 
                Provide content in clean HTML format (Do not add HTML, Head, Body, Title tags).
                Make the content educational, detailed, and well-structured.
                
                Chapter: ${JSON.stringify(chapter)}`;

                const aiResponse = await generateNotes(PROMPT);

                // Insert chapter notes with retry logic
                let retryCount = 0;
                const maxRetries = 3;

                while (retryCount < maxRetries) {
                    try {
                        await db.insert(CHAPTER_NOTES_TABLE).values({
                            courseId: course?.courseId,
                            chapterId: index,
                            notes: aiResponse
                        });
                        console.log(`✅ Successfully saved notes for chapter ${index + 1}: ${chapterTitle}`);
                        break;
                    } catch (dbError) {
                        retryCount++;
                        console.error(`❌ Database error on attempt ${retryCount} for chapter ${index + 1}:`, dbError.message);

                        if (retryCount >= maxRetries) {
                            throw new Error(`Database insertion failed for chapter ${index + 1}: ${dbError.message}`);
                        }

                        // Exponential backoff
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                    }
                }
            });
        }

        // Update course status to ready
        await step.run("update-course-ready", async () => {
            await db.update(STUDY_MATERIAL_TABLE)
                .set({ status: 'Ready' })
                .where(eq(STUDY_MATERIAL_TABLE.courseId, course?.courseId));
            console.log(`✅ Course ${course?.courseId} notes generation completed successfully`);
        });

        return {
            success: true,
            courseId: course?.courseId,
            chaptersProcessed: chapters.length,
            message: 'All chapters processed successfully'
        };
    });