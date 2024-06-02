import mongoose from "mongoose";


interface IUser extends mongoose.Document {
    _id: string,
    name: string,
    email: string,
    image: string,
    role: "admin" | "user",
    dob: Date
    gender: "male" | "female"
}


const schema = new mongoose.Schema(
    {
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
            lowercase:true,
            validate: {
              validator : (value:string)=> {
              return /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(value)
              },
                message: (props: any) => `${props.value} is not a valid email address!`
            }
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
            enum: ["male", "female"],
            required: [true, "Please Enter your gender"],
            trim:true,
        },

    }, {
        timestamps: true,
    })


const User = mongoose.model<IUser>("User", schema);
