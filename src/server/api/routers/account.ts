import { z } from "zod"
import { createTRPCRouter, privateProcedure } from "../trpc"
import { db } from "@/server/db"
import { Prisma } from "@prisma/client"
import { Account } from "@/lib/accounts"
import { emailAddressSchema } from "@/types"
import { OramaClient } from "@/lib/orama"

// Authorize account access with better error handling
// Authorize account access with improved error handling and logging
export const authoriseAccountAccess = async (accountId: string, userId: string) => {
    // Check if user is authenticated
    if (!userId) {
        console.error("Authorization error: User is not authenticated");
        throw new Error("User is not authenticated");
    }

    // Try to fetch the account with the given accountId and userId
    const account = await db.account.findFirst({
        where: {
            id: accountId,
            userId,
        },
        select: {
            id: true,
            emailAddress: true,
            name: true,
            accessToken: true,
        }
    });

    // If the account is not found or unauthorized
    if (!account) {
        // Check if the account exists but belongs to a different user (unauthorized access)
        const accountExists = await db.account.findFirst({
            where: { id: accountId },
            select: { id: true },
        });

        if (!accountExists) {
            console.error(`Authorization error: Account with ID ${accountId} not found for user ${userId}`);
            throw new Error("Account not found");
        } else {
            console.error(`Authorization error: User ${userId} is not authorized to access account ${accountId}`);
            throw new Error("Unauthorized access");
        }
    }

    // Log successful authorization
    console.log(`Authorization successful: User ${userId} has access to account ${accountId}`);
    return account;
};


export const accountRouter = createTRPCRouter({

    // Fetch accounts linked to the current user
    getAccounts: privateProcedure.query(async ({ ctx }) => {
        try {
            return await ctx.db.account.findMany({
                where: {
                    userId: ctx.auth.userId,
                },
                select: {
                    id: true,
                    emailAddress: true,
                    name: true
                }
            });
        } catch (error) {
            console.error("Error fetching accounts", error);
            throw new Error("Failed to fetch accounts");
        }
    }),

    // Get number of threads in a specific account and tab
    getNumThreads: privateProcedure.input(z.object({
        accountId: z.string(),
        tab: z.string()
    })).query(async ({ ctx, input }) => {
        try {
            const account = await authoriseAccountAccess(input?.accountId, ctx.auth?.userId);

            let filter: Prisma.ThreadWhereInput = {
                accountId: account.id,  // Add accountId filter here
            };

            if (input.tab === 'inbox') {
                filter.inboxStatus = true;
            } else if (input.tab === 'draft') {
                filter.draftStatus = true;
            } else if (input.tab === 'sent') {
                filter.sentStatus = true;
            }

            return await ctx.db.thread.count({
                where: filter,
            });
        } catch (error) {
            console.error("Error fetching thread count", error);
            throw new Error("Failed to fetch thread count");
        }
    }),

    // Fetch threads from a specific account, tab, and completion status
    getThreads: privateProcedure.input(z.object({
        accountId: z.string(),
        tab: z.string(),
        done: z.boolean(),
    })).query(async ({ ctx, input }) => {
        try {
            const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId);
            const acc = new Account(account.accessToken);
            await acc.syncEmails().catch(console.error);

            let filter: Prisma.ThreadWhereInput = {
                accountId: account.id, // Add accountId filter here
                done: {
                    equals: input.done,
                }
            };

            if (input.tab === 'inbox') {
                filter.inboxStatus = true;
            } else if (input.tab === 'draft') {
                filter.draftStatus = true;
            } else if (input.tab === 'sent') {
                filter.sentStatus = true;
            }

            return await ctx.db.thread.findMany({
                where: filter,
                include: {
                    emails: {
                        orderBy: {
                            sentAt: 'asc',
                        },
                        select: {
                            from: true,
                            body: true,
                            bodySnippet: true,
                            emailLabel: true,
                            subject: true,
                            sysLabels: true,
                            id: true,
                            sentAt: true,
                        }
                    }
                },
                take: 15,
                orderBy: {
                    lastMessageDate: 'desc'
                }
            });
        } catch (error) {
            console.error("Error fetching threads", error);
            throw new Error("Failed to fetch threads");
        }
    }),

    getSuggestions: privateProcedure.input(z.object({
        accountId: z.string()
    })).query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        return await ctx.db.emailAddress.findMany({
            where: {
                accountId: account.id
            },
            select: {
                address: true,
                name: true
            }
        })
    }),

    getReplyDetails: privateProcedure.input(z.object({
        accountId: z.string(),
        threadId: z.string(),
    })).query(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        const thread = await ctx.db.thread.findFirst({
            where: {
                id: input.threadId,
            },
            include: {
                emails: {
                    orderBy: {
                        sentAt: 'asc',
                    },
                    select: {
                        from: true,
                        to: true,
                        cc: true,
                        bcc: true,
                        sentAt: true,
                        subject: true,
                        internetMessageId: true,
                    }
                }
            }
        })
        if (!thread || thread.emails.length === 0) {
            throw new Error("Thread not found")
        }

        const lastExternalEmail = thread.emails.reverse().find(email => email.from.address !== account.emailAddress)
        if (!lastExternalEmail) {
            throw new Error("No external email found")
        }

        return {
            subject: lastExternalEmail.subject,
            to: [lastExternalEmail.from, ...lastExternalEmail.to.filter(to => to.address !== account.emailAddress)],
            cc: lastExternalEmail.cc.filter(cc => cc.address !== account.emailAddress),
            from: { name: account.name, address: account.emailAddress },
            id: lastExternalEmail.internetMessageId,
        }
    }),

    sendEmail: privateProcedure.input(z.object({
        accountId: z.string(),
        body: z.string(),
        subject: z.string(),
        from: emailAddressSchema,
        cc: z.array(emailAddressSchema).optional(),
        bcc: z.array(emailAddressSchema).optional(),
        to: z.array(emailAddressSchema),

        replyTo: emailAddressSchema,
        inReplyTo: z.string().optional(),

        threadId: z.string().optional()
    })).mutation(async ({ ctx, input }) => {

        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        const acc = new Account(account.accessToken);
        await acc.sendEmail({
            body: input.body,
            subject: input.subject,
            from: input.from,
            cc: input.cc,
            bcc: input.bcc,
            to: input.to,
            replyTo: input.replyTo,
            inReplyTo: input.inReplyTo ?? '',
            threadId: input.threadId,
        })

    }),

    searchEmail: privateProcedure.input(z.object({
        accountId: z.string(),
        query: z.string(),
    })).mutation(async ({ ctx, input }) => {
        const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId)
        const orama = new OramaClient(account.id);
        await orama.intialize();
        const results = await orama.search({ term: input.query });
        return results;
    })
})
