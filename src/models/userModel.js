import mongoose, { Schema } from "mongoose";
/**
 * @openapi
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      required:
 *        - name
 *        - email
 *        - image
 *        - dob
 *        - gender
 *      properties:
 *        _id:
 *          type: string
 *          description: The user's id
 *          default: d0169a3a-b0ac-4bf4-b304-c728fba092af
 *          example: d0169a3a-b0ac-4bf4-b304-c728fba092af
 *          unique: true
 *          required: true
 *        name:
 *          type: string
 *          description: The user's name
 *          default: Pallab Roy Tushar
 *          example: Pallab Roy Tushar
 *          required: true
 *          minLength: 3
 *          maxLength: 50
 *          trim: true
 *        email:
 *          type: string
 *          description: The user's email
 *          default: pallab@gmail.com
 *          example: pallab@gmail.com
 *          required: true
 *          unique: true
 *          trim: true
 *          format: email
 *          pattern: ^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$
 *          errorMessage: Please provide a valid email address
 *        image:
 *          type: string
 *          description: The user's image
 *          default: https://www.google.com/image.jpg
 *          example: https://www.google.com/image.jpg
 *          required: true
 *          format: jpeg, png, jpg etc.
 *          errorMessage: Please provide an image
 *        dob:
 *          type: string
 *          description: The user's date of birth
 *          default: 1998-12-12
 *          example: 1998-12-12
 *          required: true
 *          format: date
 *          errorMessage: Please provide a valid date of birth
 *        gender:
 *          type: string
 *          description: The user's Gender
 *          required: true
 *          enum: [male, female, other]
 *        role:
 *          type: string
 *          description: The user's role
 *          default: user
 *          enum: [admin, user]
 *          example: user
 *          required: false
 *        createdAt:
 *          type: string
 *          description: The user's created date
 *          default: 2021-09-12T00:00:00.000Z
 *          example: 2021-09-12T00:00:00.000Z
 *        updatedAt:
 *          type: string
 *          description: The user's updated date
 *          default: 2021-09-12T00:00:00.000Z
 *          example: 2021-09-12T00:00:00.000Z
 *
 */
const userSchema = new Schema({
    _id: {
        type: String,
        required: [true, "Please provide an id"],
    },
    name: {
        type: String,
        minLength: [3, "Name must be at least 3 characters"],
        maxLength: [50, "Name must be at most 50 characters"],
        required: [true, "Please provide your name"],
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Please provide an email"],
        trim: true,
        lowercase: true,
        validate: {
            validator: (value) => {
                return /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(value);
            },
            message: (props) => `${props.value} is not a valid email address!`,
        },
    },
    image: {
        type: String,
        required: [true, "Please provide an image"],
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
    dob: {
        type: Date,
        required: [true, "Please provide a date of birth"],
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: [true, "Please Enter your gender"],
    },
}, {
    timestamps: true,
});
userSchema.virtual("age").get(function () {
    const today = new Date();
    const birthDate = new Date(this.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});
// userSchema.pre("save", function (next) {
// 	if (!this.isModified("role")) {
// 		this.role = "user";
// 	}
// 	next();
// });
export const UserModel = mongoose.model("User", userSchema);
