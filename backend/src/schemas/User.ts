import mongoose, { Schema } from 'mongoose'

const UserSchema: Schema = new Schema({
  createdAt: Date,
  emailAddress: String,
  username: String,
  password: String,
  minecraftUuid: String,
  id: String,
  role: String,
  banned: Boolean,
  bannedBy: String,
  bannedAt: String,
  bannedUntil: Number,
  servers: Object,
  verificationToken: String,
  emailVerified: Boolean
})

export default mongoose.model('user', UserSchema)