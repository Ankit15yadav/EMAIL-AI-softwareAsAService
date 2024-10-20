'use client'

import React from 'react'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import EmailEditor from './email-editor'


const ComposeButton = () => {

    const [toValues, setToValues] = React.useState<{ label: string, value: string }[]>([])
    const [ccValues, setccValues] = React.useState<{ label: string, value: string }[]>([])
    const [subject, setSubject] = React.useState('')

    const handleSend = async () => {
        console.log(toValues, ccValues, subject)
    }

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button>
                    <Pencil
                        className='size-4 mr-1'
                    />
                    Compose
                </Button>
            </DrawerTrigger>

            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Compose Email</DrawerTitle>
                </DrawerHeader>
                <EmailEditor
                    toValues={toValues}
                    setTovalues={setToValues}
                    ccValues={ccValues}
                    setCcValues={setccValues}
                    subject={subject}
                    setSubject={setSubject}
                    handleSend={handleSend}
                    isSending={false}
                    to={toValues.map(to => to.value)}
                    defaultToolbarExpand={true}
                />
            </DrawerContent>
        </Drawer>

    )
}

export default ComposeButton
