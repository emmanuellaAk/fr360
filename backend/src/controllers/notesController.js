import Note from "../models/Note.js"

export async function getAllNotes(_, res) {

    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        console.error("Error in getAllNotes contrller", error);
        res.status(500).json({ message: "Internal server error" });
    }

}

export async function getNoteById(_, res) {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.status(200).json({ message: "success", note });
    } catch (error) {
        console.error("Error in notes controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function createNote(req, res) {
    try {
        const { title, content } = req.body;
        const note = new Note({ title, content });

        const savedNote = await note.save();
        res.status(201).json({ message: "Notes created successfully", savedNote });

    } catch (error) {
        console.error("Error in create controller", error);
        res.status(500).json({ mesage: "Internal server error" })
    }
}

export async function updateNote(req, res) {
    try {
        const { title, content } = req.body;
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            { title, content },
            {
                new: true,
            }

        );
        if (!updatedNote) return res.status(404).json({ message: "Note not found" });
        res.status(200).json({ message: "Notes updated succcessfully", updatedNote });

    } catch (error) {
        console.error("Error in create controller", error);
        res.status(500).json({ mesage: "Internal server error" })
    }

}

export async function deleteNote(req, res) {
    try {
        const { title, content } = req.body;
        const deletedNote = await Note.findByIdAndDelete(
            req.params.id,
            { title, content },
            {
                new: true,
            }

        );
        if (!deletedNote) return res.status(404).json({ message: "Note not found" });
        res.status(200).json({ message: "Note deleted successfully", deletedNote });

    } catch (error) {
        console.error("Error in create controller", error);
        res.status(500).json({ mesage: "Internal server error" })
    }
}