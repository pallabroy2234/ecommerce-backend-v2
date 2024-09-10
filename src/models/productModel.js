import mongoose, { Schema } from "mongoose";
const productSchema = new Schema({
    name: {
        type: String,
        minLength: [3, "Name must be at least 3 characters"],
        required: [true, "Please provide your name"],
        trim: true,
    },
    category: {
        type: String,
        minLength: [3, "Category must be at least 3 characters"],
        required: [true, "Please provide a category"],
        trim: true,
        lowercase: true,
    },
    image: {
        type: String,
        required: [true, "Image is required"],
    },
    price: {
        type: Number,
        validate: {
            validator: function (value) {
                if (typeof value !== "number" || isNaN(value)) {
                    return false;
                }
                if (value < 0) {
                    return false;
                }
                return true;
            },
            message: (props) => {
                if (typeof props.value !== "number" || isNaN(props.value)) {
                    return "Price must be a number";
                }
                if (props.value < 0) {
                    return "Price must be a positive number ";
                }
                return `${props.value} is not a valid price`;
            },
        },
        required: [true, "Price is required"],
    },
    stock: {
        type: Number,
        validate: {
            validator: function (value) {
                if (typeof value !== "number" || isNaN(value)) {
                    return false;
                }
                if (value < 0) {
                    return false;
                }
                return true;
            },
            message: (props) => {
                if (typeof props.value !== "number" || isNaN(props.value)) {
                    return "Stock must be a number";
                }
                if (props.value <= 0) {
                    return "Stock must be a positive number";
                }
                return `${props.value} is not a valid stock`;
            },
        },
        required: [true, "Stock is required"],
    },
}, {
    timestamps: true,
});
export const Product = mongoose.model("Product", productSchema);
