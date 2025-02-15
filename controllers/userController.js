const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../models/user');

const createUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        const existingUser = await User.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            username,
            email,
            password_hash: hashedPassword,
            role: role || 'user', // Default role is 'user'
            created_at: new Date(),
        };

        const newUser = await User.createUser(userData);
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};



// const getAllUsers = async (req, res) => {
//     try {
//         const users = await User.getAllUsers();
//         res.status(200).json({ message: 'Users retrieved successfully', users });
//     } catch (error) {
//         console.error('Error retrieving users:', error);
//         res.status(500).json({ message: 'Error retrieving users', error: error.message });
//     }
// };

const getAllUsers = async (req, res) => {
    try {
        // If the user is an admin, return all users
        if (req.user.role === "admin") {
            const users = await User.getAllUsers();
            return res.status(200).json({ message: "Users retrieved successfully", users });
        } 
        
        // If the user is not an admin, return only their own credentials
        const user = await User.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User retrieved successfully", user });
    } catch (error) {
        console.error("Error retrieving users:", error);
        res.status(500).json({ message: "Error retrieving users", error: error.message });
    }
};


const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.getUserById(Number(id));
        if (user) {
            res.status(200).json({ message: 'User retrieved successfully', user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving user by ID:', error);
        res.status(500).json({ message: 'Error retrieving user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        await User.updateUser(Number(id), updatedData);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.deleteUser(Number(id));
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};
  
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.getUserByEmail(email);
        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).send("Invalid credentials");
        }

        // Generate JWT token with role
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role }, // Include role
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log(token);
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Error logging in user", error: error.message });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    // searchUsers,
    // getUsersWithRecipe,
    loginUser,
};