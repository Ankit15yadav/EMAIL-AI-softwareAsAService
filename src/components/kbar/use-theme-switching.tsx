import { Action, useRegisterActions } from 'kbar';
import { useTheme } from 'next-themes'
import React from 'react'

const useThemeSwitching = () => {

    const { theme, setTheme } = useTheme();
    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }

    const themeActions: Action[] = [
        {
            id: 'toggleTheme',
            name: 'Toogle Theme',
            shortcut: ['t', 't'],
            section: 'Theme',
            perform: toggleTheme,
        },
        {
            id: 'setLightTheme',
            name: "Set Light Theme",
            section: "Theme",
            perform: () => setTheme('light')
        },
        {
            id: 'setDarkTheme',
            name: "Set Dark Theme",
            section: "Theme",
            perform: () => setTheme('dark')
        }
    ]

    useRegisterActions(themeActions, [theme]);
}

export default useThemeSwitching
