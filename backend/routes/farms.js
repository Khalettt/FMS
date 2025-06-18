const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Custom JSON serializer for BigInt (important for sending BigInts to frontend)
// This prototype modification ensures that BigInts are correctly converted to strings when
// JSON.stringify is called on objects containing BigInts, which happens when sending data
// from the backend (Node.js) to the frontend.
if (!('toJSON' in BigInt.prototype)) {
    Object.defineProperty(BigInt.prototype, 'toJSON', {
        get() {
            return String(this);
        },
    });
}

// POST /farms - Create a new farm record
router.post('/', async (req, res) => {
  try {
    const {
      farmer_id,       // Comes as a string from the frontend after serialization fix
      name,
      location,
      size_acres,
      irrigation,
      gps_coordinates,
    } = req.body;

    // Convert farmer_id to BigInt for Prisma.
    // Ensure that if it's not a valid number string, it throws an error.
    const newFarm = await prisma.farm.create({
      data: {
        farmer_id: BigInt(farmer_id), // FIX: Convert to BigInt here
        name,
        location,
        size_acres: parseFloat(size_acres), // Convert to float if it's a string from frontend
        // Ensure boolean conversion is robust (e.g., from "true"/"false" strings or actual booleans)
        irrigation: irrigation === true || irrigation === "true",
        gps_coordinates: gps_coordinates || null, // Store as null if empty string
      },
    });

    res.status(201).json(newFarm);
  } catch (error) {
    console.error("Failed to add farm:", error);
    // Add more specific error handling for Prisma errors (e.g., P2003 for foreign key violations)
    if (error.code === 'P2003') { // Foreign key constraint violation (farmer_id does not exist)
        return res.status(400).json({ message: `Invalid Farmer ID provided. No farmer found with ID ${req.body.farmer_id}.` });
    }
    if (error.code === 'P2002') { // Unique constraint violation (e.g., farm name already exists)
        return res.status(409).json({ message: `A farm with this name already exists.` });
    }
    res.status(500).json({ message: "Server error: Failed to add farm." });
  }
});

// GET /farms - Get all farms with pagination and search filter
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
          { location: { contains: search, mode: 'insensitive' } },
          // Include farmer relation for searching by farmer name
          { farmer: { full_name: { contains: search, mode: 'insensitive' } } },
        ],
      };
    }

    const [farms, totalCount] = await prisma.$transaction([
      prisma.farm.findMany({
        skip: skip,
        take: limit,
        where: whereCondition,
        include: { farmer: true }, // Ensure farmer data is included for the frontend table and search
      }),
      prisma.farm.count({
        where: whereCondition,
      }),
    ]);

    res.json({ farms, totalCount, page, limit });
  } catch (err) {
    console.error("Error fetching farms:", err);
    res.status(500).json({ message: "Failed to retrieve farms" });
  }
});

// PUT /farms/:id - Update a farm record
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { farmer_id, name, location, size_acres, irrigation, gps_coordinates } = req.body;

  try {
    let parsedFarmerId;
    if (farmer_id !== undefined) {
        try {
            parsedFarmerId = BigInt(farmer_id); // FIX: Convert to BigInt here
        } catch (parseError) {
            return res.status(400).json({ message: "Invalid Farmer ID format for update." });
        }
    }

    const updatedData = {
        name,
        location,
        size_acres: parseFloat(size_acres),
        irrigation: Boolean(irrigation), // Ensure it's a boolean
        gps_coordinates: gps_coordinates || null,
    };

    if (parsedFarmerId !== undefined) {
        updatedData.farmer_id = parsedFarmerId;
    }

    const updated = await prisma.farm.update({
      where: { id: BigInt(id) }, // id from params is string, convert to BigInt
      data: updatedData,
    });
    res.json(updated);
  } catch (err) {
    console.error("Error updating farm:", err);
    if (err.code === 'P2003') { // Foreign key constraint violation (farmer_id does not exist)
        return res.status(400).json({ message: `Invalid Farmer ID provided. No farmer found with ID ${req.body.farmer_id}.` });
    }
    if (err.code === 'P2002') { // Unique constraint violation (e.g., farm name already exists)
        return res.status(409).json({ message: `A farm with this name already exists.` });
    }
    res.status(500).json({ message: "Farm update failed" });
  }
});

// DELETE /farms/:id - Delete a farm record
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.farm.delete({ where: { id: BigInt(id) } });
    res.json({ message: "Farm deleted successfully" });
  } catch (err) {
    console.error("Error deleting farm:", err);
    if (err.code === 'P2025') { // Record to delete does not exist
        return res.status(404).json({ message: "Farm not found for deletion." });
    }
    res.status(500).json({ message: "Farm deletion failed" });
  }
});

module.exports = router;
