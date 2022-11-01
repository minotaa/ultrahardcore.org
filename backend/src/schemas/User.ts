import mongoose, { Schema } from 'mongoose'

const UserSchema: Schema = new Schema({
  createdAt: Number,
  emailAddress: String,
  minecraftUuid: String,
  id: Number,
  role: String,
  banned: Boolean,
  bannedBy: String,
  bannedAt: String,
  bannedUntil: Number,
  servers: Object,
})

export default mongoose.model('user', UserSchema)