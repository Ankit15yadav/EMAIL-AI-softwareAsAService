import { EmailMessage, SyncResponse, SyncUpdatedResponse } from "@/types";
import axios from "axios";
import { deleteAppClientCache } from "next/dist/server/lib/render-server";

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
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
            params: params

        })

        return response.data
    }

    async performInitialSync() {
        try {
            let syncResponse = await this.startSync()
            while (!syncResponse.ready) {
                syncResponse = await this.startSync()
            }

            // got the delta token
            let storeDeltaToken: string = syncResponse.syncUpdatedToken;

            let updatedResponse = await this.getUpdatedEmails({ deltaToken: storeDeltaToken });

            if (updatedResponse.nextDeltaToken) {
                //sync has completed
                storeDeltaToken = updatedResponse.nextDeltaToken;
            }

            let allEmails: EmailMessage[] = updatedResponse.records

            //fetch all pages if there r more
            while (updatedResponse.nextPageToken) {
                updatedResponse = await this.getUpdatedEmails({ pageToken: updatedResponse.nextPageToken })
                allEmails = allEmails.concat(updatedResponse.records);

                if (updatedResponse.nextDeltaToken) {
                    storeDeltaToken = updatedResponse.nextDeltaToken
                }
            }

            console.log("inital sync completed , we have synced", allEmails.length, 'emails');

            //store latest delta token for future incremental sync
            await this.getUpdatedEmails({ deltaToken: storeDeltaToken });

            return {
                emails: allEmails,
                deltaToken: storeDeltaToken,
            }
        }
        catch (error) {
            console.log(error)
            if (axios.isAxiosError(error)) {
                console.log(`Error during sync`, JSON.stringify(error.response?.data, null, 2));
            }
        }
    }
}

