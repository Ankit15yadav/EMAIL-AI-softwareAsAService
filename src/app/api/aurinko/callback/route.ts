// api/aurinko/callback

import { exhangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
// import { url } from "inspector";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions"
import axios from "axios";

export const GET = async (req: NextRequest) => {
    const { userId } = await auth();

    if (!userId) return NextResponse.json({
        success: false,
        message: "unauthorized",
    }, { status: 401 })

    const params = req.nextUrl.searchParams;
    const status = params.get('status');
    if (status !== 'success') return NextResponse.json({ message: "Failed to link account" }, { status: 401 })


    //get the code to exchange for the access token
    const code = params.get('code');

    if (!code) return NextResponse.json({
        success: false,
        message: "token not present"
    }, { status: 401 })

    const token = await exhangeCodeForAccessToken({ code });
    

    if (!token) return NextResponse.json({
        message: "failed to exchange the token",
        success: false,
    },
        { status: 401 })


    const accountDetails = await getAccountDetails(token.accessToken);

    await db.account.upsert({
        where: {
            id: token.accountId.toString(),
        },
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

    })

    waitUntil(
        axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
            accountId: token.accountId.toString(),
            userId,

        }).then(response => {
            console.log('Intial sync triggered', response.data)
        }).catch(error => {
            console.error('Failed to trigger intial sync', error);
        })
    )


    return NextResponse.redirect(new URL('/mail', req.url));
}
