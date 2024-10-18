import { db } from "@/server/db";
import { EmailMessage, SyncResponse, SyncUpdatedResponse } from "@/types";
import axios from "axios";
import { deleteAppClientCache } from "next/dist/server/lib/render-server";
import { syncEmailsToDatabase } from "./sync-to-db";

export class Account {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private async startSync() {
        const response = await axios.post<SyncResponse>(`https://api.aurinko.io/v1/email/sync`, {}, {
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
            params: {
                daysWithin: 2,
                bodyType: 'html',
            }
        })
        return response.data;
    }

    async getUpdatedEmails({ deltaToken, pageToken }: {
        deltaToken?: string,
        pageToken?: string,
    }) {

        let params: Record<string, string> = {}
        if (deltaToken) params.deltaToken = deltaToken
        if (pageToken) params.pageToken = pageToken;

        const response = await axios.get<SyncUpdatedResponse>(`https://api.aurinko.io/v1/email/sync/updated`, {
            params,
            headers: {
                Authorization: `Bearer ${this.token}`,
            },

        })

        return response.data
    }

    // async performInitialSync() {
    //     try {
    //         let syncResponse = await this.startSync()
    //         while (!syncResponse.ready) {
    //             syncResponse = await this.startSync()
    //         }

    //         // got the delta token
    //         let storeDeltaToken: string = syncResponse.syncUpdatedToken;

    //         let updatedResponse = await this.getUpdatedEmails({ deltaToken: storeDeltaToken });

    //         if (updatedResponse.nextDeltaToken) {
    //             //sync has completed
    //             storeDeltaToken = updatedResponse.nextDeltaToken;
    //         }

    //         let allEmails: EmailMessage[] = updatedResponse.records

    //         //fetch all pages if there r more
    //         while (updatedResponse.nextPageToken) {
    //             updatedResponse = await this.getUpdatedEmails({ pageToken: updatedResponse.nextPageToken })
    //             allEmails = allEmails.concat(updatedResponse.records);

    //             if (updatedResponse.nextDeltaToken) {
    //                 storeDeltaToken = updatedResponse.nextDeltaToken
    //             }
    //         }

    //         console.log("inital sync completed , we have synced", allEmails.length, 'emails');

    //         //store latest delta token for future incremental sync
    //         await this.getUpdatedEmails({ deltaToken: storeDeltaToken });

    //         return {
    //             emails: allEmails,
    //             deltaToken: storeDeltaToken,
    //         }
    //     }
    //     catch (error) {
    //         console.log(error)
    //         if (axios.isAxiosError(error)) {
    //             console.log(`Error during sync`, JSON.stringify(error.response?.data, null, 2));
    //         }
    //     }
    // }

    async performInitialSync() {
        try {
            let syncResponse = await this.startSync();
            while (!syncResponse.ready) {
                syncResponse = await this.startSync();
            }

            let storeDeltaToken: string = syncResponse.syncUpdatedToken;
            let updatedResponse = await this.getUpdatedEmails({ deltaToken: storeDeltaToken });

            let allEmails: EmailMessage[] = updatedResponse.records;

            while (updatedResponse.nextPageToken) {
                updatedResponse = await this.getUpdatedEmails({ pageToken: updatedResponse.nextPageToken });
                allEmails = allEmails.concat(updatedResponse.records);
            }

            // Update the delta token after fetching all emails
            if (updatedResponse.nextDeltaToken) {
                storeDeltaToken = updatedResponse.nextDeltaToken;
            }

            console.log("Initial sync completed, synced", allEmails.length, "emails");

            // Persist the latest delta token (you can store it in a DB or localStorage)
            await this.getUpdatedEmails({ deltaToken: storeDeltaToken });

            return {
                emails: allEmails,
                deltaToken: storeDeltaToken,
            };
        } catch (error) {
            console.log(error);
            if (axios.isAxiosError(error)) {
                console.log(`Error during sync`, JSON.stringify(error.response?.data, null, 2));
            }
        }
    }

    async syncEmails() {
        const account = await db.account.findUnique({
            where: {
                accessToken: this.token
            }
        })
        if (!account) {
            throw new Error("account not found");
        }
        if (!account.nextDeltaToken) throw new Error('Account not ready for sync');
        let response = await this.getUpdatedEmails({
            deltaToken: account.nextDeltaToken
        })

        let storedDeltaToken = account.nextDeltaToken;

        let allEmails: EmailMessage[] = response.records;

        if (response.nextDeltaToken) {
            storedDeltaToken = response.nextDeltaToken;
        }

        while (response.nextPageToken) {
            response = await this.getUpdatedEmails({
                pageToken: response.nextPageToken
            })

            allEmails = allEmails.concat(response.records);
            if (response.nextDeltaToken) {
                storedDeltaToken = response.nextDeltaToken;
            }
        }

        try {

            syncEmailsToDatabase(allEmails, account.id);

        } catch (error) {
            console.log('Error during sync', error);
        }

        await db.account.update({
            where: {
                id: account.id,
            },
            data: {
                nextDeltaToken: storedDeltaToken,
            }
        })

        return {
            emails: allEmails,
            deltaToken: storedDeltaToken
        }
    }

}

