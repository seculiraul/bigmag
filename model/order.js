const mongoose = require('mongoose');
const Product = require('./product');


const orderSchema = new mongoose.Schema({
    address: Object,
    phone: {
        type: String,
        required: true
    },
    items: {
       type: [
            {
                productId: { 
                    type: mongoose.Schema.ObjectId,
                    ref: 'Product'
                },
                quantity: {
                    type: Number,
                    default: 1
                }
            }
        ]
    },
    total: Number,
    transportCost: Number,
    status: {
        type: String,
        default: 'pending'
    }
});

orderSchema.pre('save', async function(next) {
    this.total = 0;
    for(let i =0; i< this.items.length; i++) {
        await this.populate(`items.${i}.productId`);

        this.total += this.items[i].productId.price * this.items[i].quantity;
    }
    this.transportCost = this.total > 10 ? 0 : 7
    this.total += this.transportCost;
    next();
});

module.exports = mongoose.model('Orders', orderSchema);