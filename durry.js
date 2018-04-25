const mongoose = require('mongoose');

const durrySchema = new mongoose.Schema({
  lastDurry: {
    type: Date,
    default: Date.now()
  },
  daysWithout: {
    type: Number,
    defualt: 0
  },
  durryToday: {
    type: Boolean,
    defualt: false
  }
}, { timestamps: false });

// /**
//  * Create-or-update plugin for simple creation and updating with less code
// */
// durrySchema.plugin(createOrUpdate);

const Durry = mongoose.model('Durry', durrySchema);

module.exports = Durry;
