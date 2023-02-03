const mongoose = require('mongoose')

const ProductShema = new mongoose.Schema({
    id:{
        type: Number,
        required : true,
        unique: true
    },
    name: {
        type:String,
        required : true,
        unique: true,
        maxLength: 15
    },
    inStock: {
        type:Number,
        default : 1
    }
})

ProductShema.index({item:1,user:1},{unique:true})


module.exports = mongoose.model('ProductArray',ProductShema)



