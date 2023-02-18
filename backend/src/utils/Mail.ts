import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

const VERIFY_EMAIL_TEMPLATE = `Hey {name}! 
Your email has just been used to register on <a href="https://ultrahardcore.org">.
If you're that certain somebody, click (or tap) this link on the same device to continue: <a href="{link}">{link}</a>`

const VERIFY_EMAIL_SUCCESS_TEMPLATE = `Hey {username}!
Your account registration & verification was a success!
Login at <a href="https://ultrahardcore.org">ultrahardcore.org</a> and get started using your account.
`
const CREATE_SERVER_TEMPLATE = `Hey {username}! 
We have successfully created a server for you to host games on <a href="https://ultrahardcore.org">ultrahardcore.org</a>.
Unfortunately, you must be verified before you can post, please await verification or contact support for more information.
`

const APPROVED_SERVER_TEMPLATE = `Hey {username}!
Your server {serverName} has been successfully approved! Now you can post games under your server on <a href="https://ultrahardcore.org">ultrahardcore.org</a>.
`

const DENIED_SERVER_TEMPLATE = `Hey {username}!
Your server {serverName} has been unfortunately denied for approval. Please contact staff for more reasoning.
`

export async function sendMail(to: string, subject: string, html: string) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
  sgMail
  return sgMail.send({
    from: process.env.FROM_EMAIL!,
    to,
    subject,
    html: html.replace(/\n/gi, '<br/>'),
    text: html.replace(/<br\/?>/gi, '\n'),
  })
}

function replaceTemplate(templ: string, replacers: { [x: string]: string }) {
  let n = templ
  Object.keys(replacers).forEach((key) => {
    let regexp = new RegExp(`{${key}}`, 'gi')
    n = n.replace(regexp, replacers[key])
  })
  return n
}


export async function sendEmailVerification(
  to: string,
  username: string,
  link: string
) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
  return sgMail.send({
    from: process.env.FROM_EMAIL!!,
    to,
    templateId: 'd-ba9601faa90449f4ad187474b213b612',
    dynamicTemplateData: {
      username,
      text:
        'Someone signed up for ultrahardcore.org using your email address.',
      cta_pretext:
        'If this was you, press the link below to activate your account',
      cta_link: link,
      cta_text: 'Verify your Account'
    }, 
  })
}
 
export function verifyEmailTemplate(username: string, link: string) {
  return replaceTemplate(VERIFY_EMAIL_TEMPLATE, { username, link })
}

export function createServerTemplate(username: string) {
  return replaceTemplate(CREATE_SERVER_TEMPLATE, { username })
}

export function verifyEmailSuccessTemplate(username: string) {
  return replaceTemplate(VERIFY_EMAIL_SUCCESS_TEMPLATE, { username })
}

export function approvedServerTemplate(username: string, serverName: string) {
  return replaceTemplate(APPROVED_SERVER_TEMPLATE, { username, serverName })
}

export function deniedServerTemplate(username: string, serverName: string) {
  return replaceTemplate(DENIED_SERVER_TEMPLATE, { username, serverName })
}
