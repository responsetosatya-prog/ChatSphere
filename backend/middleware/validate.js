export function validateRegister(req, res, next) {

    const { username, email, password } = req.body;

    // Check missing fields
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    // Username validation (basic)
    if (username.length < 3) {
        return res.status(400).json({
            success: false,
            message: "Username must be at least 3 characters"
        });
    }

    // Email validation (simple regex)
    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    // Password validation
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters"
        });
    }

    next();
}


/*
==========================================
LOGIN VALIDATION
==========================================
*/
export function validateLogin(req, res, next) {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    next();
}
