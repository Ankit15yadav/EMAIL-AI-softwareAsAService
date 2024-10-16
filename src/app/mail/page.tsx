import React from 'react'
import Mail from './mail'

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
