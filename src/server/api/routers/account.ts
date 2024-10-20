import { z } from "zod"
import { createTRPCRouter, privateProcedure } from "../trpc"
import { db } from "@/server/db"
import { Prisma } from "@prisma/client"
import { Account } from "@/lib/accounts"
import { add } from "date-fns"

// Authorize account access with better error handling
export const authoriseAccountAccess = async (accountId: string, userId: string) => {
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

    if (!account) {
        throw new Error("Account not found or unauthorized"); // More specific error message
    }

    return account;
}

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
            const account = await authoriseAccountAccess(input.accountId, ctx.auth.userId);

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
    })
})
