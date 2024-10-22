'use client'
import React, { useState } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { TooltipProvider } from '@/components/ui/tooltip'
import { promises } from 'dns'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AccountSwitcher from './account-switcher'
import Sidebar from './sidebar'
import ThreadList from './thread-list'
import ThreadDisplay from './thread-display'
import SearchBar from './search-bar'
// import { TabsTrigger } from '@radix-ui/react-tabs'

type Props = {
    defaultLayout: number[] | undefined
    navCollapsedSize: number
    defaultCollapse: boolean
}

const Mail = ({ defaultLayout = [20, 32, 48], navCollapsedSize, defaultCollapse }: Props) => {

    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div>
            <TooltipProvider delayDuration={0}>
                <ResizablePanelGroup direction='horizontal' onLayout={(sizes: number[]) => {
                    console.log(sizes);
                }}
                    className=' items-stretch h-full min-h-screen'
                >
                    <ResizablePanel defaultSize={defaultLayout[0]}
                        collapsedSize={navCollapsedSize}
                        collapsible={true}
                        minSize={15}
                        maxSize={40}
                        onCollapse={() => {
                            setIsCollapsed(true)
                        }}
                        onResize={() => {
                            setIsCollapsed(false)
                        }}
                        className={cn(isCollapsed && 'min-w-[50px] transition-all duration-300 ease-in-out')}
                    >

                        <div className=' flex flex-col h-full flex-1'>
                            <div className={cn('flex h-[52px] items-center justify-between ', isCollapsed ? 'h-[52px]' : 'px-2')}>
                                <AccountSwitcher isCollapsed={isCollapsed} />
                            </div>
                            <Separator />
                            <Sidebar isCollapsed={isCollapsed} />
                            <div className=' flex-1'>
                            </div>
                            ask ai
                        </div>

                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                        <Tabs defaultValue='inbox'>
                            <div className='flex items-center px-4 py-2'>
                                <h1 className=' text-xl font-bold'> This is inbox</h1>
                                <TabsList className=' ml-auto'>
                                    <TabsTrigger value='inbox' className='text-zinc-200 dark:text-zinc-200'>
                                        Inbox
                                    </TabsTrigger>
                                    <TabsTrigger value='done' className='text-zinc-200 dark:text-zinc-200'>
                                        Done
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                            <Separator />
                            {/* /search bar */}
                            <SearchBar />
                            <TabsContent value='inbox'>
                                <ThreadList />
                            </TabsContent>
                            <TabsContent value='done'>
                                <ThreadList />
                            </TabsContent>
                        </Tabs>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel
                        defaultSize={defaultLayout[2]}
                        minSize={30}
                    >
                        <ThreadDisplay />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </TooltipProvider>
        </div>
    )
}

export default Mail
