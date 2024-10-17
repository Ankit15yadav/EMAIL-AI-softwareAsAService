import dynamic from 'next/dynamic'
import React from 'react'
// import Mail from './mail'
const Mail = dynamic(() => {
    return import('./mail')
},
    {
        ssr: false
    })

const MailDashboard = () => {
    return (
        <div>
            <Mail
                defaultCollapse={false}
                defaultLayout={[20, 32, 48]}
                navCollapsedSize={4}
            />
        </div>
    )
}

export default MailDashboard
