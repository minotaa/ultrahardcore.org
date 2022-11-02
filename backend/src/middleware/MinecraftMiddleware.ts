import { Request, Response, NextFunction } from 'express'
import 'dotenv/config'

export async function mcMiddleware(req: Request, res: Response, next: NextFunction) {
    let mcToken: string | undefined
    if (req.query.key) mcToken = req.query.key as string
    if (!mcToken) {
      return res.status(400).json({
        success: false,
        message: 'Authentication required',
        errors: [
          'We could not find a Minecraft token in your request, please insert one and try again',
        ],
      })
    }
    if (process.env.MINECRAFT_KEY != mcToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication',
        errors: [
          'We could not find a valid Minecraft token in your request, try again',
        ],
      })
    }
    return next()
}