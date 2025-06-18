const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Handle BigInt JSON serialization
if (!('toJSON' in BigInt.prototype)) {
    Object.defineProperty(BigInt.prototype, 'toJSON', {
        get() {
            return function () {
                return this.toString();
            };
        },
    });
}

// ----------- CREATE FERTILIZATION -------------
// ----------- CREATE FERTILIZATION -------------
router.post('/', async (req, res) => {
    const { crop_id, date, type, quantity_kg } = req.body;

    if (!crop_id) {
        return res.status(400).json({ message: "Required field (crop_id) is missing." });
    }

    try {
        const newFertilization = await prisma.fertilization.create({
            data: {
                // Use cropId as the field name here because that's what's defined in your Prisma model
                // And connect it to the existing Crop record
                crop: {
                    connect: { id: BigInt(crop_id) }
                },
                date: date ? new Date(date) : null,
                type: type || null,
                // Ensure quantity_kg from request maps to quantityKg in Prisma model
                quantityKg: quantity_kg !== undefined ? parseFloat(quantity_kg) : null,
            },
        });

        res.status(201).json(newFertilization);
    } catch (err) {
        console.error("Error creating fertilization record:", err);
        res.status(500).json({ message: "Failed to create fertilization record." });
    }
});

// ----------- READ ALL FERTILIZATIONS (with search & pagination) -------------
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    try {
        const whereCondition = search
            ? {
                OR: [
                    { type: { contains: search, mode: 'insensitive' } },
                    // You might want to search by crop name if you include crop data
                    // { crop: { name: { contains: search, mode: 'insensitive' } } },
                ],
            }
            : {};

        const [fertilizations, totalCount] = await prisma.$transaction([
            prisma.fertilization.findMany({
                skip,
                take: limit,
                where: whereCondition,
                orderBy: { id: 'asc' },
                // include: { crop: true }, // Optional: If you want to include crop details
            }),
            prisma.fertilization.count({ where: whereCondition }),
        ]);

        res.json({ fertilizations, totalCount, page, limit });
    } catch (err) {
        console.error("Error fetching fertilization records:", err);
        res.status(500).json({ message: "Failed to retrieve fertilization records." });
    }
});

// ----------- READ FERTILIZATION BY ID -------------
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const fertilization = await prisma.fertilization.findUnique({
            where: { id: BigInt(id) },
            // include: { crop: true }, // Optional
        });

        if (!fertilization) {
            return res.status(404).json({ message: "Fertilization record not found." });
        }

        res.json(fertilization);
    } catch (err) {
        console.error("Error fetching fertilization record by ID:", err);
        res.status(500).json({ message: "Failed to retrieve fertilization record." });
    }
});

// ----------- UPDATE FERTILIZATION -------------
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { crop_id, date, type, quantity_kg } = req.body;

    try {
        const updatedData = {};
        if (crop_id !== undefined) updatedData.cropId = BigInt(crop_id); // Use cropId
        if (date !== undefined) updatedData.date = date ? new Date(date) : null;
        if (type !== undefined) updatedData.type = type || null;
        if (quantity_kg !== undefined) updatedData.quantityKg = quantity_kg !== null ? parseFloat(quantity_kg) : null; // Use quantityKg

        const updatedFertilization = await prisma.fertilization.update({
            where: { id: BigInt(id) },
            data: updatedData,
        });

        res.json(updatedFertilization);
    } catch (err) { // Added error handling for update
        console.error("Error updating fertilization record:", err);
        res.status(500).json({ message: "Failed to update fertilization record." });
    }
});

// ----------- DELETE FERTILIZATION -------------
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.fertilization.delete({
            where: { id: BigInt(id) },
        });
        res.status(204).send(); // No content to send back on successful deletion
    } catch (err) { // Added error handling for delete
        console.error("Error deleting fertilization record:", err);
        res.status(500).json({ message: "Failed to delete fertilization record." });
    }
});

module.exports = router;