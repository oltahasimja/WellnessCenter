const express = require("express");
const Stripe = require("stripe");
const router = express.Router();
const { UserProgramsMongo, TrainingApplicationMongo } = require("../domain/database/models/indexMongo"); // Adjust the path as necessary
const { UserPrograms, TrainingApplication} = require("../domain/database/models/index"); // Adjust the path as necessary

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


router.post("/create-payment-intent", async (req, res) => {
  const { amount, metadata } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      metadata,
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/userprograms/:id/pay", async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Update MongoDB
    const mongoUpdate = await UserProgramsMongo.findByIdAndUpdate(id, {
      payment: "paid",
    });

    let sqlUpdate = null;
    if (mongoUpdate?.mysqlId) {
      sqlUpdate = await UserPrograms.update(
        { payment: "paid" },
        { where: { id: parseInt(mongoUpdate.mysqlId) } }
      );
    }

    res.send({
      success: true,
      mongo: !!mongoUpdate,
      mysql: !!sqlUpdate,
    });
  } catch (error) {
    console.error("Payment update error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/trainingapplication/:id/pay", async (req, res) => {
  const { id } = req.params;

  try {
    const mongoUpdate = await TrainingApplicationMongo.findByIdAndUpdate(id, {
      payment: "paid",
    });

    let sqlUpdate = null;
    if (mongoUpdate?.mysqlId) {
      sqlUpdate = await TrainingApplication.update(
        { payment: "paid" },
        { where: { id: parseInt(mongoUpdate.mysqlId) } }
      );
    }

    res.send({
      success: true,
      mongo: !!mongoUpdate,
      mysql: !!sqlUpdate,
    });
  } catch (error) {
    console.error("Payment update error for training application:", error);
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;