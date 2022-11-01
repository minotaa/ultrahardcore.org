import mongoose from 'mongoose'
import 'dotenv/config'

export default class Database {
  constructor() {
    mongoose.connect(process.env.MONGODB_URI!!)
  }
}