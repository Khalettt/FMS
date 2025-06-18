const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Custom JSON serializer for BigInt (important for sending BigInts to frontend)
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Ku dar Beeralay
router.post('/', async (req, res) => {
  const { user_id, full_name, gender, phone, email, address } = req.body;

  // Validate required fields at the API level
  if (!user_id || !full_name || !gender) {
    return res.status(400).json({ message: "Required fields (user_id, full_name, gender) are missing." });
  }

  try {
    // HADDA WAXAA LAGA BEDDELAY findUnique LOO BEDDELAY findFirst
    // If email is provided, check for its uniqueness
    if (email) {
      const existingFarmer = await prisma.farmer.findFirst({ // WAXAA LAGA BEDDELAY HORE
        where: { email: email } // Waana inuu sidoo kale noqdo mid aan null ahayn si looga hortago in nulls isku dhacaan
      });

      if (existingFarmer) {
        return res.status(409).json({ message: "This email is already registered to another farmer." });
      }
    }

    // Convert user_id to BigInt.
    // Ensure that if phone/email/address are empty strings, they are stored as null in DB.
    const farmer = await prisma.farmer.create({
      data: {
        user_id: BigInt(user_id),
        full_name,
        gender,
        phone: phone || null,
        email: email || null, // Convert empty string to null if email is optional in schema
        address: address || null,
      },
    });
    res.status(201).json(farmer);
  } catch (err) {
    console.error("Error creating farmer:", err);

    // More specific error handling for common Prisma errors (optional but good practice)
    if (err.code === 'P2002') { // Unique constraint violation (e.g., if full_name also unique)
        return res.status(409).json({ message: `A farmer with this unique field already exists. Details: ${err.meta.target}` });
    }
    if (err.code === 'P2003') { // Foreign key constraint violation (e.g., user_id does not exist)
        return res.status(400).json({ message: `Invalid user ID provided. No user found with ID ${user_id}.` });
    }
    // Generic server error
    res.status(500).json({ message: "Server error occurred while adding farmer." });
  }
});


// Soo qaado Dhammaan Beeralayda
router.get('/', async (req, res) => {
  try {
    const farmers = await prisma.farmer.findMany({
      include: { user: true }, // Include user data if needed for display (e.g., username in table)
    });
    res.json(farmers);
  } catch (err) {
    console.error("Error fetching farmers:", err);
    res.status(500).json({ message: "Failed to retrieve farmers." });
  }
});

// Update Beeralay
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, full_name, gender, phone, email, address } = req.body;

  try {
    // Optional: Check if email is being changed to an existing one by another farmer
    if (email) {
      const existingFarmerWithEmail = await prisma.farmer.findFirst({ // WAXAA LAGA BEDDELAY HORE
        where: {
          email: email,
          NOT: { id: BigInt(id) }, // Exclude the current farmer being updated
        },
      });
      if (existingFarmerWithEmail) {
        return res.status(409).json({ message: "This email is already registered to another farmer." });
      }
    }

    const updated = await prisma.farmer.update({
      where: { id: BigInt(id) },
      data: {
        user_id: BigInt(user_id),
        full_name,
        gender,
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error("Error updating farmer:", err);
    // More specific error handling for update (similar to create)
    if (err.code === 'P2002') { // Unique constraint violation
        return res.status(409).json({ message: `A farmer with this unique field already exists. Details: ${err.meta.target}` });
    }
    if (err.code === 'P2003') { // Foreign key constraint violation (e.g., user_id does not exist)
        return res.status(400).json({ message: `Invalid user ID provided. No user found with ID ${user_id}.` });
    }
    res.status(500).json({ message: "Farmer update failed." });
  }
});

// Tirtir Beeralay
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.farmer.delete({ where: { id: BigInt(id) } }); // Convert string to BigInt
    res.json({ message: "Farmer deleted successfully." });
  } catch (err) {
    console.error("Error deleting farmer:", err);
    // Specific error if farmer not found
    if (err.code === 'P2025') {
        return res.status(404).json({ message: "Farmer not found for deletion." });
    }
    res.status(500).json({ message: "Farmer deletion failed." });
  }
});

module.exports = router;
