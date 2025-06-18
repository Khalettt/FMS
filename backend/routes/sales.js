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

// ----------- CREATE SALE -------------
router.post('/', async (req, res) => {
    const { farm_id, product_type, product_name, quantity, unit, price_per_unit, sale_date, buyer_name } = req.body;

    if (!farm_id || !product_type) {
        return res.status(400).json({ message: "Required fields (farm_id, product_type) are missing." });
    }

    try {
        const newSale = await prisma.sale.create({
            data: {
                farm_id: BigInt(farm_id),
                product_type,
                product_name: product_name || null,
                quantity: quantity !== undefined ? parseFloat(quantity) : null,
                unit: unit || null,
                price_per_unit: price_per_unit !== undefined ? parseFloat(price_per_unit) : null,
                sale_date: sale_date ? new Date(sale_date) : null,
                buyer_name: buyer_name || null,
            },
        });
        res.status(201).json(newSale);
    } catch (err) {
        console.error("Error creating sale:", err);
        res.status(500).json({ message: "Failed to create sale." });
    }
});

// ----------- READ ALL SALES (with search & pagination) -------------
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    try {
        const whereCondition = search
            ? {
                  OR: [
                      { product_type: { contains: search, mode: 'insensitive' } },
                      { product_name: { contains: search, mode: 'insensitive' } },
                      { buyer_name: { contains: search, mode: 'insensitive' } },
                  ],
              }
            : {};

        const [sales, totalCount] = await prisma.$transaction([
            prisma.sale.findMany({
                skip,
                take: limit,
                where: whereCondition,
                orderBy: { id: 'asc' },
                // include: { farm: true }, // Optional
            }),
            prisma.sale.count({ where: whereCondition }),
        ]);

        res.json({ sales, totalCount, page, limit });
    } catch (err) {
        console.error("Error fetching sales:", err);
        res.status(500).json({ message: "Failed to retrieve sales." });
    }
});

// ----------- READ SALE BY ID -------------
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const sale = await prisma.sale.findUnique({
            where: { id: BigInt(id) },
            // include: { farm: true }, // Optional
        });

        if (!sale) {
            return res.status(404).json({ message: "Sale not found." });
        }

        res.json(sale);
    } catch (err) {
        console.error("Error fetching sale by ID:", err);
        res.status(500).json({ message: "Failed to retrieve sale." });
    }
});

// ----------- UPDATE SALE -------------
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { farm_id, product_type, product_name, quantity, unit, price_per_unit, sale_date, buyer_name } = req.body;

    try {
        const updatedData = {};
        if (farm_id !== undefined) updatedData.farm_id = BigInt(farm_id);
        if (product_type !== undefined) updatedData.product_type = product_type;
        if (product_name !== undefined) updatedData.product_name = product_name || null;
        if (quantity !== undefined) updatedData.quantity = quantity !== null ? parseFloat(quantity) : null;
        if (unit !== undefined) updatedData.unit = unit || null;
        if (price_per_unit !== undefined) updatedData.price_per_unit = price_per_unit !== null ? parseFloat(price_per_unit) : null;
        if (sale_date !== undefined) updatedData.sale_date = sale_date ? new Date(sale_date) : null;
        if (buyer_name !== undefined) updatedData.buyer_name = buyer_name || null;

        const updatedSale = await prisma.sale.update({
            where: { id: BigInt(id) },
            data: updatedData,
        });

        res.json(updatedSale);
    } catch (err) {
        console.error("Error updating sale:", err);
        res.status(500).json({ message: "Failed to update sale." });
    }
});

// ----------- DELETE SALE -------------
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.sale.delete({
            where: { id: BigInt(id) },
        });
        res.json({ message: "Sale deleted successfully." });
    } catch (err) {
        console.error("Error deleting sale:", err);
        res.status(500).json({ message: "Failed to delete sale." });
    }
});

module.exports = router;
