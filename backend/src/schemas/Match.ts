import mongoose, { Schema } from 'mongoose'

const MatchSchema: Schema = new Schema({
  createdAt: Date,
  opensAt: Date,
  createdBy: String,
  removedBy: String,
  removedAt: Date,
  removedReason: String,
  removed: Boolean,
  mapSize: Number,
  pvpEnabledAt: Number,
  finalHealAt: Number,
  meetupAt: Number,
  extraRules: Array,
  extraConfig: Object,
  scenarios: Array,
  count: Number,
  displayName: String,
  serverIp: String
})

export default mongoose.model('user', MatchSchema)