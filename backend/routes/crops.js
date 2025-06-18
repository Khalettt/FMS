// In your backend, create a new file like 'src/routes/crops.js'
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add BigInt.prototype.toJSON to handle BigInt serialization
if (!('toJSON' in BigInt.prototype)) {
    Object.defineProperty(BigInt.prototype, 'toJSON', {
        get() {
            return String(this);
        },
    });
}

// Add Crop
router.post('/', async (req, res) => {
  const { farm_id, name, variety, planting_date, expected_harvest_date, status } = req.body;

  if (!farm_id || !name || !status) {
    return res.status(400).json({ message: "Required fields (farm_id, name, status) are missing for crop creation." });
  }

  try {
    let parsedFarmId;
    try {
      parsedFarmId = BigInt(farm_id);
    } catch (parseError) {
      return res.status(400).json({ message: "Invalid Farm ID format." });
    }

    const crop = await prisma.crop.create({ // Ensure 'crop' model exists in Prisma schema
      data: {
        farm_id: parsedFarmId,
        name,
        variety: variety || null,
        planting_date: planting_date ? new Date(planting_date) : null,
        expected_harvest_date: expected_harvest_date ? new Date(expected_harvest_date) : null,
        status: status,
      },
    });
    res.status(201).json(crop);
  } catch (err) {
    console.error("Error creating crop:", err);
    res.status(500).json({ message: "Server error: Failed to add crop." });
  }
});

// Get All Crops with Pagination and Search Filter
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
          { variety: { contains: search, mode: 'insensitive' } },
          // You might want to include farm name search here if you fetch joined data
          // { farm: { name: { contains: search, mode: 'insensitive' } } },
        ],
      };
    }

    const [crops, totalCount] = await prisma.$transaction([
      prisma.crop.findMany({
        skip: skip,
        take: limit,
        where: whereCondition,
        // include: { farm: true }, // Uncomment if you want to include farm details with each crop
        orderBy: { id: 'asc' } // Good practice to order results
      }),
      prisma.crop.count({
        where: whereCondition,
      }),
    ]);

    res.json({ crops, totalCount, page, limit });
  } catch (err) {
    console.error("Error fetching crops:", err);
    res.status(500).json({ message: "Failed to retrieve crops" });
  }
});

// Update Crop
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { farm_id, name, variety, planting_date, expected_harvest_date, status } = req.body;

  try {
    let parsedFarmId;
    if (farm_id !== undefined) {
        try {
            parsedFarmId = BigInt(farm_id);
        } catch (parseError) {
            return res.status(400).json({ message: "Invalid Farm ID format for update." });
        }
    }

    const updatedData = {
        name,
        variety: variety || null,
        planting_date: planting_date ? new Date(planting_date) : null,
        expected_harvest_date: expected_harvest_date ? new Date(expected_harvest_date) : null,
        status,
    };

    if (parsedFarmId !== undefined) {
        updatedData.farm_id = parsedFarmId;
    }

    const updated = await prisma.crop.update({
      where: { id: BigInt(id) },
      data: updatedData,
    });
    res.json(updated);
  } catch (err) {
    console.error("Error updating crop:", err);
    res.status(500).json({ message: "Crop update failed" });
  }
});

// Delete Crop
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.crop.delete({ where: { id: BigInt(id) } });
    res.json({ message: "Crop deleted successfully" });
  } catch (err) {
    console.error("Error deleting crop:", err);
    res.status(500).json({ message: "Crop deletion failed" });
  }
});

module.exports = router;