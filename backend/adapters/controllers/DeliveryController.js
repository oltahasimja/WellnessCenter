const nodemailer = require('nodemailer');
const DeliveryRepository = require("../../infrastructure/repository/DeliveryRepository");
const DeliveryPort = require("../../application/ports/DeliveryPort");
const DeliveryUseCase = require("../../application/use-cases/DeliveryUseCase");

const port = new DeliveryPort(DeliveryRepository);
const UseCase = new DeliveryUseCase(port);


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  
  }
});


const getAllDeliverys = async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    const result = await UseCase.getAll(filter);
    res.json(result);
  } catch (error) {
    console.error('Error getting deliveries:', error);
    res.status(500).json({
      message: error.message,
      details: error.stack
    });
  }
};

// Get delivery by ID
const getDeliveryById = async (req, res) => {
  try {
    const result = await UseCase.getById(req.params.id);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: "Delivery not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDelivery = async (req, res) => {
  try {
    const newResource = await UseCase.create(req.body);

    const { clientEmail, deliveryAddress } = req.body;

    
    if (clientEmail) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: clientEmail,
        subject: 'Your Order is Confirmed!',
        text: `Hi,

Your order is confirmed and is being prepared for delivery.

Delivery Address:
- Country: ${deliveryAddress?.country}
- City: ${deliveryAddress?.city}
- Street: ${deliveryAddress?.street}

We will notify you once it’s on the way.

Thank you for shopping with us!`
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Delivery confirmation email sent to:', clientEmail);
      } catch (emailError) {
        console.error('Error sending delivery email:', emailError);
      }
    }

    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateDelivery = async (req, res) => {
  try {
    const updatedResource = await UseCase.update(req.params.id, req.body);
    if (updatedResource) {
      res.json(updatedResource);
    } else {
      res.status(404).json({ message: "Delivery not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteDelivery = async (req, res) => {
  try {
    const deletedResource = await UseCase.delete(req.params.id);
    if (deletedResource) {
      res.json({ message: "Delivery deleted" });
    } else {
      res.status(404).json({ message: "Delivery not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllDeliverys,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  deleteDelivery
};
