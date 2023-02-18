
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
  extraLinks: Array,
  configOptions: Array,
  customizableRules: Array
})

export default mongoose.model('server', ServerSchema)