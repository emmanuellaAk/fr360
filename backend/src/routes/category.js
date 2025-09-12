import express from "express"
import Category from "../models/Category.js"
import { protect } from "../middleware/auth.js"

const router = express.Router();

router.post('/', protect, async (req, res) => {
    try {
        const { name, type } = req.body;

        if (!["income", "expense"].includes(type)) {
            return res.status(400).json({ message: "Invalid category type" });
        }
        const category = new Category({ name, type });

        const savedCategory = await category.save();
        res.status(201).json({ message: "Category created successfully", savedCategory });

    } catch (error) {
        console.error("Error in create controller", error);
        res.status(500).json({ mesage: "Internal server error" })
    }
})


router.get('/', protect, async (req, res) => {
    try {
        const filter = {};
        if (req.query.type) filter.type = req.query.type;
        const category = await Category.find(filter).sort({ createdAt: -1 });
        res.status(200).json(category);
    } catch (error) {
        console.error("Error in getAllcategory controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.get('/:id', protect, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "success", category });
    } catch (error) {
        console.error("Error in category controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }

})

router.put('/:id', protect, async (req, res) => {
    try {
        const { name, type } = req.body;
        if (type && !["income", "expense"].includes(type)) {
            return res.status(400).json({ message: "Invalid category type" });
        }
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, type },
            {
                new: true,
            }

        );
        if (!updatedCategory) return res.status(404).json({ message: "Category not found" });
        res.status(200).json({ message: "Categories updated succcessfully", updatedCategory });

    } catch (error) {
        console.error("Error in create controller", error);
        res.status(500).json({ mesage: "Internal server error" })
    }

})

// router.delete('/:id', protect, async (req, res) => {
//     try {
//         const { name } = req.body;
//         const deletedCategory = await Category.findByIdAndDelete(
//             req.params.id,
//             { name },
//             {
//                 new: true,
//             }

//         );
//         if (!deletedCategory) return res.status(404).json({ message: "Category not found" });
//         res.status(200).json({ message: "Category deleted successfully", deletedCategory });

//     } catch (error) {
//         console.error("Error in delete category controller", error);
//         res.status(500).json({ mesage: "Internal server error" })
//     }
// })
router.delete("/:id", protect, async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Category deleted successfully", deletedCategory });
  } catch (error) {
    console.error("Error in deleteCategory controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router