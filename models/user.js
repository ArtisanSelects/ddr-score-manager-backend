import mongoose from "mongoose";
const { Schema } = mongoose;
import bcrypt from "bcrypt";

const UserSchema = new Schema(
    {
        username: { type: String, required: true, unique: true, lowercase: true, minLength: 1, maxLength: 24 },
        password: { type: String, required: true, minLength: 8 },
        date: { type: Date, default: Date.now },
    }
);

UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.statics.login = async function(username, password) {
    const user = await this.findOne({ username });
    if (!user) {
        throw new Error('Username does not exist.');
    } else {
        const passwordTest = await bcrypt.compare(password, user.password);
        if (passwordTest) {
            return user;
        }
        throw new Error('Incorrect password.')
    }
}

export default mongoose.model('User', UserSchema);