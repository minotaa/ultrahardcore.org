import mongoose, { Schema } from 'mongoose'

const UserSchema: Schema = new Schema({
  createdAt: Date,
  emailAddress: String,
  username: String,
  password: String,
  id: String,
  role: String,
  banned: Boolean,
  bannedBy: String,
  bannedAt: String,
  bannedUntil: Number,
  servers: Array,
  verificationToken: String,
  emailVerified: Boolean
})

export interface UserServer {
  joinedAt: Date,
  role: String,
  memberId: String,
  serverId: String
}

export default mongoose.model('user', UserSchema)