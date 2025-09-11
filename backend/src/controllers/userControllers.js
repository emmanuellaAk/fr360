import User from "../models/User.js"

export async function getAllUsers(_, res) {
    try {
        const user = await User.find().sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        console.error("Error in getAllUsers controller", error);
        res.status(500).json({ message: "Internal server error" });
    }

}
