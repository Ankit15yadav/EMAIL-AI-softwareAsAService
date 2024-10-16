import { Account } from "@/lib/accounts";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";
import { EmailLinkErrorCode } from "node_modules/@clerk/nextjs/dist/types/client-boundary/hooks";
import { json } from "stream/consumers";

export const POST = async (req: NextRequest) => {
    const { accountId, userId } = await req.json();

    if (!accountId || !userId) {
        return NextResponse.json('missing accountId and and userId', { status: 400 })
    }

    const dbAccount = await db.account.findUnique({
        where: {
            id: accountId,
            userId,
        }
    })

    if (!dbAccount) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // perform initial sync
    const account = new Account(dbAccount.accessToken);
    const response = await account.performInitialSync()

    if (!response) {
        return NextResponse.json({ error: 'failed to perform intial sync' }, { status: 500 })
    }

    const { emails, deltaToken } = response

    console.log('emails', emails);

    // await db.account.update({
    //     where: {
    //         id: accountId,
    //     },
    //     data: {
    //         nextDeltaToken: deltaToken,
    //     }
    // })

    // await syncEmailsToDatabase(emails)

    return NextResponse.json({ success: true }, { status: 200 })
}