// import validator from "validator";
import validator from "validator";

/*
==========================================
Validate Registration Data
==========================================
*/

export function validateRegister(req, res, next) {

    const { full_name, username, email, password } = req.body;

    if (!full_name || !username || !email || !password) {

        return res.status(400).json({

            success: false,
            message: "All fields are required."

        });

    }

    if (!email.includes("@")) {

        return res.status(400).json({

            success: false,
            message: "Invalid email format."

        });

    }

    if (password.length < 6) {

        return res.status(400).json({

            success: false,
            message: "Password must be at least 6 characters."

        });

    }

    next();

}

/*
==========================================
Validate Login Data
==========================================
*/

export function validateLogin(req, res, next) {

    const { email, password } = req.body;

    if (!email || !password) {

        return res.status(400).json({

            success: false,
            message: "Email and password are required."

        });

    }

    if (!validator.isEmail(email)) {

        return res.status(400).json({

            success: false,
            message: "Invalid email format."

        });

    }

    next();

}

/*
==========================================
Validate Message Data
==========================================
*/

export function validateMessage(req, res, next) {

    const { receiver_id, message, media_url } = req.body;

    if (!receiver_id) {

        return res.status(400).json({

            success: false,
            message: "Receiver is required."

        });

    }

    if (!message && !media_url) {

        return res.status(400).json({

            success: false,
            message: "Message cannot be empty."

        });

    }

    next();

}
