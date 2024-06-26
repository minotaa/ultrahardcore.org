import { Request, Response, NextFunction } from 'express'
import moment from 'moment'
import Session from '../schemas/Session'
import User from '../schemas/User'

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    let sessionToken: string | undefined
    if (req.get('Authorization')) sessionToken = req.get('Authorization')
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        errors: [
          'We could not find a session token in your request, please insert one and try again',
        ],
      })
    }
    if (!sessionToken.startsWith('Bearer ')) {
      return res.status(401).json({
          status: 401,
          success: false,
          message: 'Authentication required',
          errors: [
              'Not a valid session token.',
          ],
      })
    }
    let sess = await Session.findOne({
      sessionString: sessionToken
    }).exec()
    if (!sess) {
      return res.status(401).json({
        status: 401,
        success: false,
        message: 'Authentication required',
        errors: ['Invalid session'],
      })
    }
    let user = await User.findOne({
      _id: sess.userId
    }).exec()
    if (!user) {
      await sess.remove()
      return res.status(401).json({
        status: 401,
        success: false,
        message: 'Authentication required',
        errors: [
          'Something bad happened when parsing your session, contact an admin',
        ],
      })
    }
    let now = moment()
    if (sess.expiresAt && moment(sess.expiresAt).diff(now) < 0) {
      await sess.remove()
      return res.status(401).json({
        status: 401,
        success: false,
        message: 'Authentication required',
        errors: ['Your session has expired, please log in again'],
      })
    } // @ts-ignore
    return next()
}