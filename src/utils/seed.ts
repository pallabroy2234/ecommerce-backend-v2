import {faker} from "@faker-js/faker";
import {Product} from "../models/productModel.js";
// * Function to seed products
const seedProducts = async (count: number = 10) => {
	const products = [];
	for (let i = 0; i < count; i++) {
		const product = {
			name: faker.commerce.productName(),
			image: "public\\\\uploads\\\\cb69ca8f-156c-4d87-af24-a8191ccd72a9.png",
			price: faker.commerce.price({min: 1500, max: 50000, dec: 0}),
			stock: faker.commerce.price({min: 0, max: 200, dec: 0}),
			category: faker.commerce.department(),
		};
		products.push(product);
	}
	await Product.create(products);
	// console.log("Products seeded successfully");
};

// seedProducts(100);

// * Function to delete products
export const deleteProducts = async (count: number = 1) => {
	const products = await Product.find({}).sort({createdAt: -1}).limit(count);
	await Product.deleteMany({
		_id: {$in: products.map((product) => product._id)},
	});
	console.log("Products deleted successfully");
};
