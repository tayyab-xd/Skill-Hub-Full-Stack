const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paid: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },

  conversation: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      message: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Order', orderSchema);
