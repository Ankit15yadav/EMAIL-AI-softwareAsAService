'use client'

import React from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { ModeToggle } from '@/components/ui/mode-toggle'

const Navbar = () => {
    const { theme, setTheme } = useTheme()
    const { isSignedIn, user } = useUser()

    return (
        <nav className="max-w-screen-xl w-full mx-auto px-4 py-2">
            <div className="flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-2">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                        <Mail className="h-6 w-6" />
                    </motion.div>
                    <span className="text-lg font-bold">AI Email</span>
                </Link>

                <div className="flex items-center space-x-4">
                    {isSignedIn ? (
                        <NavigationMenu>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <Link href="/mail" legacyBehavior passHref>
                                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                            <Mail className="h-4 w-4 mr-2" />
                                            Mail
                                        </NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>

                                <div className="flex justify-center">
                                    <UserButton afterSignOutUrl="/" />
                                </div>
                            </NavigationMenuList>
                        </NavigationMenu>
                    ) : (
                        <>
                            <SignInButton mode="modal">
                                <Button variant="ghost">Log In</Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button>Sign Up</Button>
                            </SignUpButton>
                        </>
                    )}
                    <ModeToggle />
                </div>
            </div>
        </nav>
    )
}

export default Navbar
