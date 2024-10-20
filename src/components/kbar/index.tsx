'use client'
import { Action, KBarAnimator, KBarPortal, KBarPositioner, KBarProvider, KBarSearch } from "kbar"
import RenderResults from "./render-results";
import { useLocalStorage } from "usehooks-ts";
import useThemeSwitching from "./use-theme-switching";
import useAccountSwitching from "./use-account-switching";

export default function KBar({ children }: { children: React.ReactNode }) {

    const [tab, setTab] = useLocalStorage('email-tab', 'inbox');
    const [done, setDone] = useLocalStorage('email-done', false);

    const actions: Action[] = [
        {
            id: 'inbox',
            name: 'Inbox',
            shortcut: ['g', 'i'],
            keywords: 'inbox',
            section: 'Navigation',
            subtitle: 'View your inbox',
            perform: () => {
                setTab('inbox');
            }
        },
        {
            id: 'draftsAction',
            name: 'Drafts',
            shortcut: ['g', 'd'],
            keywords: 'drafts',
            section: 'Navigation',
            subtitle: 'View your drafts',
            perform: () => {
                setTab('drafts');
            }
        },
        {
            id: 'sentAction',
            name: 'Sent',
            shortcut: ['g', 's'],
            section: 'Navigation',
            keywords: 'sent',
            subtitle: 'View the sent',
            perform: () => {
                setTab('sent');
            }
        },
        {
            id: 'pendingAction',
            name: 'see done',
            shortcut: ['g', 'f'],
            section: 'Navigation',
            subtitle: 'View the done emails',
            perform: () => {
                setDone(true);
            }
        },
        {
            id: 'doneAction',
            name: 'see Pending',
            shortcut: ['g', 'p'],
            keywords: 'pending , undone , not done',
            section: 'Navigation',
            subtitle: 'View the pending emails',
            perform: () => {
                setDone(false);
            }
        },

    ]


    return <KBarProvider actions={actions}>
        <ActualComponent>
            {children}
        </ActualComponent>
    </KBarProvider>
}

const ActualComponent = ({ children }: { children: React.ReactNode }) => {
    useThemeSwitching();
    useAccountSwitching();

    return <>
        <KBarPortal>
            <KBarPositioner className=" fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm scrollbar0hide !p-0 z-[999]">
                <KBarAnimator className="max-w-[600px] !mt-64 w-full bg-white dark:bg-gray-800 text-foreground dark:text-gray-200 shadow-lg border dark:border-gray-700 overflow-hidden rounded-lg relative !-translate-y-12">
                    <div className=" bg-white dark:bg-gray-800">
                        <div className="border-x-0 border-b-2 dark:border-gray-700">
                            <KBarSearch className=" py-4 px-6 text-lg w-full bg-white dark:bg-gray-800 outline-none border-none focus:outline-none focus:ring-0 focus:ring-offset-0" />

                        </div>
                        <RenderResults />
                    </div>
                </KBarAnimator>
            </KBarPositioner>
        </KBarPortal>
        {children}
    </>
}