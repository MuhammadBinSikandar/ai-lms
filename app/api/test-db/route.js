import { NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { PARENT_CHILD_CONNECTIONS_TABLE, USER_TABLE } from '@/configs/schema';

export async function GET() {
    try {
        // Test database connection
        const users = await db.select().from(USER_TABLE).limit(5);
        const connections = await db.select().from(PARENT_CHILD_CONNECTIONS_TABLE).limit(10);

        return NextResponse.json({
            success: true,
            usersCount: users.length,
            connectionsCount: connections.length,
            sampleUsers: users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })),
            sampleConnections: connections.map(c => ({
                id: c.id,
                parentId: c.parentId,
                studentId: c.studentId,
                status: c.status,
                parentEmail: c.parentEmail,
                studentEmail: c.studentEmail
            }))
        });
    } catch (error) {
        console.error('Database test error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
