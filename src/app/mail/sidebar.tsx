'use client'
import React from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { Nav } from './nav'
import { File, Inbox, Send } from 'lucide-react'

type Props = {

    isCollapsed: boolean
}

const Sidebar = ({ isCollapsed }: Props) => {

    const [accountId] = useLocalStorage('accountId', '');
    const [tab] = useLocalStorage('email-tab', 'inbox');

    return (
        <Nav
            isCollapsed={isCollapsed}
            links={[
                {
                    title: 'Inbox',
                    label: '1',
                    icon: Inbox,
                    variant: tab === 'inbox' ? 'default' : 'ghost'
                },
                {
                    title: 'Drafts',
                    label: '4',
                    icon: File,
                    variant: tab === 'drafts' ? 'default' : 'ghost'
                },
                {
                    title: 'Sent',
                    label: '6',
                    icon: Send,
                    variant: tab === 'sent' ? 'default' : 'ghost'
                }
            ]}
        />
    )
}

export default Sidebar
