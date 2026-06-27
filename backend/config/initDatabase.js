import { createUsersTable } from "../models/User.js";
import { createMessagesTable } from "../models/Message.js";

/*
==========================================
Initialize Database
==========================================
*/

export async function initializeDatabase() {

    try {

        console.log("");

        console.log("======================================");
        console.log("Initializing ChatSphere Database...");
        console.log("======================================");

        await createUsersTable();

        await createMessagesTable();

        console.log("");

        console.log("======================================");
        console.log("✅ Database Initialized Successfully");
        console.log("======================================");

        console.log("");

    }

    catch(error){

        console.error("");

        console.error("======================================");
        console.error("❌ Database Initialization Failed");
        console.error(error);
        console.error("======================================");

        process.exit(1);

    }

}
