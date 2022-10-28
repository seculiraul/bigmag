const Product = require('../model/product');
const catchAsync = require('../util/catchAsync');

const ApiError = require('../util/ApiError');
const ApiFeatures = require('../util/ApiFeatures');


exports.getAllProducts = catchAsync(async (req, res, next) => {

   /* // 1. filter
    const queryObj = {...req.query};
    const exclude = ['sort', 'page', 'limit'];
    exclude.forEach(el => delete queryObj[el]);

    // 2. advance filter
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Product.find(JSON.parse(queryStr));

    // 3. sort
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // 4. limit fields
    if(req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        query = query.select(fields)
    } else {
        query = query.select('-__v');
    }

    // 5. pagination
    const page = +req.query.page ?? 1;
    const limit = +req.query.limit ?? 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if(req.query.page) {
        const nrOfProducts = await Product.count();
        if(skip >= nrOfProducts) {
            return next('This page do not exists');
        }
    }*/
    //let filter = {}

    const features = new ApiFeatures(Product, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

    // QUERY EXECUTION
    const products = await features.query;

    res.status(200).json({
        status: 'Success',
        products: products.length,
        data: {
            products
        }
    });
});


exports.createProduct = catchAsync(async (req, res, next) => {
   const product =  await Product.create(req.body);

   res.status(201).json({
    status: 'Success',
    data:{
        product
    }
   })
});


exports.updateProduct = catchAsync( async(req, res, next) => {

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
         runValidators: true
      });

      if(!product) return next(new ApiError(`No product with id ${req.params.id} exists`, 404));

    res.status(200).json({
        status: "Success",
        data: {
            product
        }
    })
});

exports.deleteProduct = catchAsync( async(req, res, next) => {

    const product = await Product.findByIdAndDelete(req.params.id);

    if(!product) return next(new ApiError(`No product with id ${req.params.id} exists`, 404));

    res.status(204).json({
        message: 'Success',
        data: null
    });
});


exports.getProduct = catchAsync( async(req, res, next) => {

    const product = await Product.findById(req.params.id);

    if(!product) return next(new ApiError('No product found', 404));

    res.status(200).json({
        status: "Success",
        data: {
            product
        }
    })
});


exports.searchProducts = catchAsync(async(req, res, next) => {

    //const products = await
})