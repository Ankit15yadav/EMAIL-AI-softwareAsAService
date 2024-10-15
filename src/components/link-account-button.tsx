'use client'

import React from 'react'
import { Button } from './ui/button'
import { getAruinkoAuthUrl } from '@/lib/aurinko'

const LinkAccountButton = () => {
    return (
        <Button
            onClick={async () => {
                const authUrl = await getAruinkoAuthUrl('Google');
                window.location.href = authUrl;
                console.log(authUrl);
            }}

        >
            Link Account;
        </Button>
    )
}

export default LinkAccountButton
