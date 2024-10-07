import { db } from "./server/db";

await db.user.create({
    data: {
        emailAddress: 'test@gmail',
        firstName: "ankit",
        lastName: "yadav",


    }
})

console.log('done');