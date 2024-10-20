'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import EmailEditor from './email-editor'
import { api, RouterOutputs } from '@/trpc/react'
import useThreads from '@/hooks/use-threads'
import { toast } from 'sonner'

const ReplyBox = () => {
    const { threadId, accountId } = useThreads()
    const { data: replyDetails, isLoading, error } = api.account.getReplyDetails.useQuery({
        threadId: threadId ?? "",
        accountId,
    })

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>
    if (!replyDetails) return null

    return <Component replyDetails={replyDetails} />
}

type ReplyDetails = NonNullable<RouterOutputs['account']['getReplyDetails']>

const Component = ({ replyDetails }: { replyDetails: ReplyDetails }) => {
    const { threadId, accountId } = useThreads()

    const [subject, setSubject] = useState(replyDetails.subject.startsWith("Re:") ? replyDetails.subject : `Re: ${replyDetails.subject}`)
    const [toValues, setTovalues] = useState<{ label: string, value: string }[]>(replyDetails.to.map(to => ({ label: to.address, value: to.address })))
    const [ccValues, setCcValues] = useState<{ label: string, value: string }[]>(replyDetails.cc.map(cc => ({ label: cc.address, value: cc.address })))

    useEffect(() => {
        if (!threadId || !replyDetails) return
        setSubject(prev => replyDetails.subject.startsWith("Re:") ? replyDetails.subject : `Re: ${replyDetails.subject}`)
        setTovalues(replyDetails.to.map(to => ({ label: to.address, value: to.address })))
        setCcValues(replyDetails.cc.map(cc => ({ label: cc.address, value: cc.address })))
    }, [replyDetails, threadId])

    const sendEmail = api.account.sendEmail.useMutation()

    const handleSend = useCallback(async (value: string) => {
        sendEmail.mutate({
            accountId,
            threadId: threadId ?? undefined,
            body: value,
            subject,
            from: replyDetails.from,
            to: replyDetails.to.map(to => ({ address: to.address, name: to.name ?? "" })),
            cc: replyDetails.cc.map(cc => ({ address: cc.address, name: cc.name ?? "" })),
            replyTo: replyDetails.from,
            inReplyTo: replyDetails.id,
        }, {
            onSuccess: () => toast.success("Email sent"),
            onError: (error) => toast.error(error.message)
        })
    }, [accountId, threadId, subject, replyDetails, sendEmail])

    const toAddresses = useMemo(() => replyDetails.to.map(to => to.address), [replyDetails.to])

    return (
        <EmailEditor
            subject={subject}
            setSubject={setSubject}
            toValues={toValues}
            setTovalues={setTovalues}
            ccValues={ccValues}
            setCcValues={setCcValues}
            to={toAddresses}
            isSending={sendEmail.isPending}
            handleSend={handleSend}
            defaultToolbarExpand={false}
        />
    )
}

export default ReplyBox