import { create, insert, search, type AnyOrama } from "@orama/orama"
import { db } from "./server/db"
import { OramaClient } from "./lib/orama"


const orama = new OramaClient('72715')
await orama.intialize()



// const orama = await create({
//     schema: {
//         subject: 'string',
//         body: 'string',
//         rawBody: 'string',
//         from: 'string',
//         to: 'string[]',
//         sentAt: 'string',
//         threadId: 'string',
//     }
// })

// const emails = await db.email.findMany({
//     select: {
//         subject: true,
//         body: true,
//         from: true,
//         to: true,
//         sentAt: true,
//         threadId: true,
//     }
// })

// for (const email of emails) {
//     // console.log(email.subject)

//     await orama.insert({
//         subject: email.subject,
//         body: email.body ?? '',
//         from: email.from.address ?? '',
//         to: email.to.map(to => to.address) ?? [],
//         sentAt: email.sentAt.toLocaleString(),
//         threadId: email.threadId,
//     })
// }

const searchResult = await orama.search({
    term: 'fashion',
})

for (const hit of searchResult.hits) {
    console.log(hit.document.subject);
}


// console.log("my search result for this is ", searchResult)