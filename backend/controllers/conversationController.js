import {
    findConversation,
    createConversation,
    getUserConversations
} from "../models/Conversation.js";

/*
==========================================
Get All Conversations
GET /api/conversations
==========================================
*/

export async function getConversations(req, res) {

    try {

        const userId = req.user.id;

        const conversations =
            await getUserConversations(userId);

        res.json({

            success: true,

            conversations

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to fetch conversations."

        });

    }

}

/*
==========================================
Create Conversation
POST /api/conversations
==========================================
*/

export async function startConversation(req, res) {

    try {

        const userOne = req.user.id;

        const { userId } = req.body;

        if (!userId) {

            return res.status(400).json({

                success: false,

                message: "User ID is required."

            });

        }

        let conversation = await findConversation(
            userOne,
            userId
        );

        if (!conversation) {

            conversation = await createConversation(
                userOne,
                userId
            );

        }

        res.status(201).json({

            success: true,

            conversation

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to create conversation."

        });

    }

}
