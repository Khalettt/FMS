const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware-ka oo loo isticmaalo in lagu maareeyo BigInt serialization jawaabaha
// Tani waa muhiim sababtoo ah JSON.stringify ma maareeyo BigInt si dabiici ah
// Waxaa laga yaabaa inaad ku darto tan guud ahaan faylkaaga app.js ama server.js
// Hadda, waxaa lagu soo bandhigay halkan si loo fahmo.
// Waxaan ka saaray xariiqdan maadaama aan si toos ah u maareynayno res.json()
/*
if (!('toJSON' in BigInt.prototype)) {
    Object.defineProperty(BigInt.prototype, 'toJSON', {
        get() {
            return String(this);
        },
    });
}
*/

// Soo qaado dhammaan isticmaalayaasha
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        // Waxaan hubinaynaa inaan isticmaaleyno 'fullname' maadaama schema.prisma uu sidaas yahay.
        fullname: true,
      }
    });

    // Halkan waxaan si toos ah u maareynaynaa serialization-ka BigInt
    // Waxaan isticmaaleynaa JSON.stringify oo leh replacer function si aan u beddelno BigInts
    // strings ka hor inta aan loo dirin client-ka.
    res.json(JSON.parse(JSON.stringify(users, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value
    )));

  } catch (error) {
    // Tani waa qaybta muhiimka ah: halkan ayaan ka daabacnaa qaladka buuxa.
    console.error("Khalad ku yimid soo qaadista isticmaalayaasha (faahfaahin dheeraad ah hoos):", error);
    res.status(500).json({ error: 'Wax baa qaldamay intii lagu jiray soo qaadista isticmaalayaasha.' });
  }
});

module.exports = router;
