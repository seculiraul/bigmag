const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Every product must have a name']
    },
    brand: {
        type: String,
        required: [true, 'Every product mush have a brand'],
        default: 'Unknown'
    },
    price: {
        type: Number,
        required: [true, 'Every product mush have a price'],
    },
    quantity: {
        type: Number,
        required: [true, 'Please specify the stoc for the product']
    },
    category: String,
    description: String,
    discount: {
        type: Number,
        default: 10
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    newProduct: Boolean
});


module.exports = mongoose.model('Product', productSchema);