// backend/routes/equipment.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add BigInt.prototype.toJSON to handle BigInt serialization for JSON responses
if (!('toJSON' in BigInt.prototype)) {
    Object.defineProperty(BigInt.prototype, 'toJSON', {
        get() {
            return String(this);
        },
    });
}

// --- CRUD Operations for Equipment ---

// Add new Equipment
router.post('/', async (req, res) => {
    const { farm_id, name, purchase_date, condition, is_operational } = req.body;

    if (!farm_id || !name) {
        return res.status(400).json({ message: "Required fields (farm_id, name) are missing for equipment creation." });
    }

    try {
        let parsedFarmId;
        try {
            parsedFarmId = BigInt(farm_id);
        } catch (parseError) {
            return res.status(400).json({ message: "Invalid Farm ID format." });
        }

        const newEquipment = await prisma.equipment.create({
            data: {
                farm_id: parsedFarmId,
                name,
                purchase_date: purchase_date ? new Date(purchase_date) : null,
                condition: condition || null, // Optional
                is_operational: is_operational !== undefined ? Boolean(is_operational) : true, // Default to true if not provided
            },
        });
        res.status(201).json(newEquipment);
    } catch (err) {
        console.error("Error creating equipment:", err);
        res.status(500).json({ message: "Server error: Failed to add equipment." });
    }
});

// Get All Equipment with Pagination and Search Filter
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    try {
        let whereCondition = {};
        if (search) {
            whereCondition = {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { condition: { contains: search, mode: 'insensitive' } },
                    // You might want to include farm name search here if you fetch joined data
                    // { farm: { name: { contains: search, mode: 'insensitive' } } },
                ],
            };
        }

        const [equipment, totalCount] = await prisma.$transaction([
            prisma.equipment.findMany({
                skip: skip,
                take: limit,
                where: whereCondition,
                // include: { farm: true }, // Uncomment if you want to include farm details
                orderBy: { id: 'asc' }
            }),
            prisma.equipment.count({
                where: whereCondition,
            }),
        ]);

        res.json({ equipment, totalCount, page, limit });
    } catch (err) {
        console.error("Error fetching equipment:", err);
        res.status(500).json({ message: "Failed to retrieve equipment." });
    }
});

// Get Equipment by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const equipmentItem = await prisma.equipment.findUnique({
            where: { id: BigInt(id) },
            // include: { farm: true }, // Uncomment if you want to include farm details
        });
        if (!equipmentItem) {
            return res.status(404).json({ message: "Equipment not found." });
        }
        res.json(equipmentItem);
    } catch (err) {
        console.error("Error fetching equipment by ID:", err);
        res.status(500).json({ message: "Failed to retrieve equipment." });
    }
});

// Update Equipment
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { farm_id, name, purchase_date, condition, is_operational } = req.body;

    try {
        const updatedData = {};

        if (farm_id !== undefined) {
            try {
                updatedData.farm_id = BigInt(farm_id);
            } catch (parseError) {
                return res.status(400).json({ message: "Invalid Farm ID format for update." });
            }
        }
        if (name !== undefined) updatedData.name = name;
        if (purchase_date !== undefined) updatedData.purchase_date = purchase_date ? new Date(purchase_date) : null;
        if (condition !== undefined) updatedData.condition = condition || null;
        if (is_operational !== undefined) updatedData.is_operational = Boolean(is_operational);


        const updatedEquipment = await prisma.equipment.update({
            where: { id: BigInt(id) },
            data: updatedData,
        });
        res.json(updatedEquipment);
    } catch (err) {
        console.error("Error updating equipment:", err);
        res.status(500).json({ message: "Equipment update failed." });
    }
});

// Delete Equipment
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.equipment.delete({ where: { id: BigInt(id) } });
        res.json({ message: "Equipment deleted successfully." });
    } catch (err) {
        console.error("Error deleting equipment:", err);
        res.status(500).json({ message: "Equipment deletion failed." });
    }
});

module.exports = router;