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
  pvpEnabledIn: Number,
  finalHealOccurs: Number,
  meetupOccursAt: Number,
  extraRules: Array,
  extraConfig: Object,
  scenarios: Array,
  hostCount: Number,
  displayName: String,
  serverIp: String,
  teamStyle: String,
  teamSize: Number,
  slots: Number,
  version: String,
  id: String,
  serverId: String,
  description: String,
  hostHidConfig: Boolean
})

export default mongoose.model('match', MatchSchema)