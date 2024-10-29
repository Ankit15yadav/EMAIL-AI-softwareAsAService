'use server'

import { auth } from "@clerk/nextjs/server"
import axios from "axios";
import { error } from "console";

export const getAruinkoAuthUrl = async (serviceType: 'Google' | 'Office360') => {

    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    const params = new URLSearchParams({
        clientId: process.env.AURINKO_CLIENT_ID as string,
        serviceType,
        scopes: 'Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All',
        responseType: 'code',

        returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`

    })

    return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`
}


export const exhangeCodeForAccessToken = async ({ code }: { code: string }) => {
    try {

        const response = await axios.post(`https://api.aurinko.io/v1/auth/token/${code}`, {}, {
            auth: {
                username: process.env.AURINKO_CLIENT_ID as string,
                password: process.env.AURINKO_CLIENT_SECRET as string,
            },

        })

        return response.data as {
            accountId: number,
            accessToken: string,
            userId: string,
            userSession: string,
        }

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.response?.data)
        }

        console.log(error);
    }
}

export const getAccountDetails = async (accessToken: string) => {
    try {

        const response = await axios.get('https://api.aurinko.io/v1/account', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return response.data as {
            email: string,
            name: string,
        }

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.response?.data)
        }

        else {
            console.log(error);
            console.log("first deploy krne k lie daala hai")
        };
    }
    throw error;
}

