// api/aurinko/callback

import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import axios from "axios";

export const GET = async (req: NextRequest) => {
    // Authenticate the user
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized",
        }, { status: 401 });
    }

    // Get query parameters
    const params = req.nextUrl.searchParams;
    const status = params.get('status');
    if (status !== 'success') {
        return NextResponse.json({
            success: false,
            message: "Failed to link account"
        }, { status: 401 });
    }

    // Get the authorization code to exchange for an access token
    const code = params.get('code');
    if (!code) {
        return NextResponse.json({
            success: false,
            message: "Token not present"
        }, { status: 401 });
    }

    // Exchange the code for an access token
    let token;
    try {
        token = await exchangeCodeForAccessToken({ code });
        if (!token || !token.accessToken || !token.accountId) {
            throw new Error("Invalid token response");
        }
    } catch (error) {
        console.error("Error exchanging code for access token:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to exchange the token"
        }, { status: 401 });
    }

    // Fetch account details using the access token
    let accountDetails;
    try {
        accountDetails = await getAccountDetails(token.accessToken);
    } catch (error) {
        console.error("Error fetching account details:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch account details"
        }, { status: 500 });
    }

    // Upsert account information in the database
    try {
        await db.account.upsert({
            where: { id: token.accountId.toString() },
            update: {
                accessToken: token.accessToken,
            },
            create: {
                id: token.accountId.toString(),
                userId,
                emailAddress: accountDetails.email,
                name: accountDetails.name,
                accessToken: token.accessToken,
                provider: "aurinko",
            }
        });
    } catch (error) {
        console.error("Database upsert error:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to save account information"
        }, { status: 500 });
    }

    // Trigger initial sync
    waitUntil((async () => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
                accountId: token.accountId,
                userId,
            });
            console.log('Initial sync triggered', response.data);
        } catch (error) {
            console.error('Failed to trigger initial sync', error);
        }
    })());

    // Redirect to the mail page
    return NextResponse.redirect(new URL('/mail', req.url));
};
