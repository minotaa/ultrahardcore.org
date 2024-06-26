
import mongoose, { Schema } from 'mongoose'
import User from './User'

const ServerSchema: Schema = new Schema({ 
  name: String,
  ip: String,
  location: String,
  region: String,
  scenarioDescriptions: String,
  members: Array,
  createdAt: Date,
  owner: String,
  id: String,
  invited: Array,
  verified: Boolean,
  discordUrl: String,
  twitterUrl: String,
  websiteUrl: String,
  storeUrl: String,
  extraLinks: Array,
  optionalConfiguration: Boolean,
  configOptions: Array,
  customizableRules: Array,
  extraServers: Array,
  banned: Boolean,
  bannedBy: String,
  bannedAt: String,
  bannedUntil: Number
})

export default mongoose.model('server', ServerSchema)