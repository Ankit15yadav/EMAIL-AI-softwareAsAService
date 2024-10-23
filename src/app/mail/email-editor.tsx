'use client'
import React, { useCallback, useState } from 'react'
import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Text } from "@tiptap/extension-text"
import { start } from 'repl'
import EditorMenuBar from './editor-menubar'
import Heading from '@tiptap/extension-heading'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { boolean } from 'zod'
import exp from 'constants'
import TagInput from './tag-input'
import { Input } from '@/components/ui/input'
import { Value } from '@prisma/client/runtime/library'
import AIComposeButton from './ai-compose-button'
import { generate } from './action'
import { readStreamableValue } from 'ai/rsc'

type Props = {
    subject: string
    setSubject: (value: string) => void

    toValues: { label: string, value: string }[]
    setTovalues: (value: { label: string, value: string }[]) => void

    ccValues: { label: string, value: string }[]
    setCcValues: (value: { label: string, value: string }[]) => void

    to: string[]

    handleSend: (value: string) => void
    isSending: boolean,

    defaultToolbarExpand: boolean,
}

const EmailEditor = ({ ccValues, defaultToolbarExpand, handleSend, isSending, setCcValues, setSubject, setTovalues, subject, to, toValues }: Props) => {
    const [value, setValue] = React.useState<string>('');
    const [expanded, setExpanded] = React.useState<boolean>(defaultToolbarExpand);
    const [token, setToken] = React.useState<string>('');

    const aiGenerate = async (value: string) => {
        const { output } = await generate(value)
        for await (const token of readStreamableValue(output)) {
            if (token) {
                setToken(token);
            }
        }
    }

    const CustomText = Text.extend({
        addKeyboardShortcuts() {
            return {
                'Mod-Alt-j': () => {
                    aiGenerate(this.editor.getText())
                    return true;
                }
            }
        }
    })

    const editor = useEditor({
        autofocus: false,
        extensions: [StarterKit, CustomText, Heading.configure({
            levels: [1, 2, 3, 4, 5, 6],
        }),],
        onUpdate: ({ editor }) => {
            setValue(editor.getHTML())
        }
    })




    React.useEffect(() => {
        editor?.commands?.insertContent(token);
    }, [token, editor]);


    // const onGenerate = (token: string) => {
    //     // console.log(token)
    //     editor?.commands.insertContent(token);
    // }

    const onGenerate = useCallback((content: string) => {
        const formattedContent = content.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join(' ')
        editor?.commands.insertContent(formattedContent, {
            parseOptions: { preserveWhitespace: 'full' },
        })
    }, [editor])

    if (!editor) return null;

    return (
        <div>
            <div className=' flex p-4 py-2 border-b'>
                <EditorMenuBar editor={editor} />

            </div>

            <div className='p-4 pb-0 space-y-2'>
                {
                    expanded && (
                        <>
                            <TagInput
                                // defaultValues={[]}
                                label='To'
                                onChange={setTovalues}
                                placeholder='Add Recepients'
                                value={toValues}
                            />
                            <TagInput
                                // defaultValues={[toValues]}
                                label='Cc'
                                onChange={setCcValues}
                                placeholder='Add Recepients'
                                value={ccValues}
                            />
                            <Input
                                id='subject'
                                placeholder='Subject'
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </>
                    )
                }
                <div className=' flex flex-col  justify-start gap-2'>
                    <div className='cursor-pointer flex items-center gap-2'
                        onClick={() => setExpanded(!expanded)}
                    >
                        <span className=' text-green-600 font-medium'>
                            Draft {" "}
                        </span>
                        <span>
                            to {to.join(',')}
                        </span>
                    </div>
                    <div className='flex justify-start'>
                        <AIComposeButton
                            isComposing={defaultToolbarExpand}
                            onGenerate={onGenerate}
                        />
                    </div>

                </div>
            </div>

            <div className='prose w-full py-4 px-4'>
                <EditorContent editor={editor} value={value} />
            </div>

            <Separator />
            <div className=' py-3 px-4 flex items-center justify-between'>
                <span className=' text-sm'>
                    Tip: Press {" "}
                    <kbd className=' px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg'>
                        Ctrl + Alt + j
                    </kbd> {" "}
                    for AI autocompletion
                </span>
                <Button
                    onClick={async () => {
                        editor?.commands?.clearContent()
                        await handleSend(value)
                    }}
                    disabled={isSending}
                >
                    Send
                </Button>
            </div>
        </div >
    )
}

export default EmailEditor
