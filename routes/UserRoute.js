import express from 'express';
import jwt from 'jsonwebtoken';
// import User from '../models/User.js';
import User from '../models/user.js';
import { configDotenv } from 'dotenv';
import bcrypt from 'bcrypt';
import { authenticateToken, authorizeRole } from '../auth/jwt.js';
import { roles } from '../utils/roles.js';
configDotenv();

const { JWT_SECRET_KEY } = process.env;
console.log("JWT_SECRET_KEY", JWT_SECRET_KEY)
const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    if (password.length < 6) {
        return res.status(400).json({ message: "Password less than 6 characters" });
    }
    bcrypt.hash(password, 10).then(async (hash) => {
        await User.create({
            username,
            password: hash,
            email
        })
            .then((user) => {
                const maxAge = 24 * 60 * 60;
                const token = jwt.sign(
                    { id: user._id, username, email: user.email, role: user.role },
                    JWT_SECRET_KEY,
                    {
                        expiresIn: maxAge, // 24hrs
                    }
                );

                res.cookie("jwt", token, {
                    httpOnly: true,
                    SameSite: "Lax",
                    maxAge: maxAge * 1000
                });
                res.status(201).json({
                    message: "User successfully created",
                    user: user._id,
                    role: user.role,
                    email: user.email
                });
            })
            .catch((error) =>
                res.status(400).json({
                    message: "User not successful created",
                    error: error.message,
                })
            );
    });
});

router.post('/login', async (req, res, next) => {
    console.log(req.body);
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            message: "Username or Password not present",
        });
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            res.status(400).json({
                message: "Login not successful",
                error: "User not found",
            });
        } else {
            // comparing given password with hashed password
            bcrypt.compare(password, user.password).then(function (result) {
                if (result) {
                    const maxAge = 24 * 60 * 60;
                    const token = jwt.sign(
                        { id: user._id, username, role: user.role },
                        JWT_SECRET_KEY,
                        {
                            expiresIn: maxAge, // 24hrs in sec
                        }
                    );
                    res.cookie("jwt", token, {
                        httpOnly: true,
                        maxAge: maxAge * 1000, // 24hrs in ms
                    });
                    res.status(201).json({
                        message: "User successfully Logged in",
                        user: user._id,
                        role: user.role,
                        token: token
                    });
                } else {
                    res.status(400).json({ message: "Login not succesful" });
                }
            });
        }
    } catch (error) {
        res.status(400).json({
            message: "An error occurred",
            error: error.message,
        });
    }
});

//TODO: complete the signout process when user pressed logout button
router.post('/logout', (req, res) => {
    // Perform necessary logout actions
    // For example:
    // 1. Invalidate or revoke the user's session or token
    //    - Delete or invalidate the token stored on the server-side or in the user's session data
    //    - Clear any user-related data or state stored on the server-side or in the client's session

    // 2. Clear any user-related data or state
    //    - Example: req.session.destroy() to clear the session data if using session-based authentication

    // 3. Provide a logout response
    res.clearCookie('jwt'); // Clear the JWT cookie
    res.status(200).json({ message: 'Logged out successfully' });
});


router.get('/admin-only', authenticateToken, authorizeRole(roles.admin), (req, res) => {
    res.status(200).json({ message: 'Admin-only route accessed successfully' });
});


// Route to fetch users with pagination
router.post("/fetchUsers", authenticateToken, authorizeRole(roles.admin), async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            select: "-password",
        };

        const users = await User.paginate({}, options);
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});


//Update username or email etc.
router.put("/updateUser", authenticateToken, authorizeRole(roles.admin), async (req, res) => {
    try {

        if (!req.body.data) {
            res.status(400).send('data is missing');
        }

        const { username, email, role } = req.body.data.editedUser;
        const result = await User.updateOne({ _id: req.body.data.userId }, { username, email, role });

        if (result) {

            res.status(200).send(`User ${username} been updated.`);
        } else {
            res.status(400).send(`Can't update the user ${username}.`);
        }

    } catch (err) {
        console.log(err);
        res.status(500).send(err.toString());
    }
})


export default router;
