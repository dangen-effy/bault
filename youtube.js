const fs = require('fs')
const open = require('open')
const readline = require('readline')
const { google } = require('googleapis')

function client () {
  const CREDENTIALS = require('./credential.json')
  const oauthClient = new google.auth.OAuth2(
    CREDENTIALS.client_id,
    CREDENTIALS.client_secret,
    CREDENTIALS.redirect_uris[0]
  )

  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube'
  ]

  return {
    authorizeUrl: '',

    oauthClient,

    server: null,

    upload: async function (fileName) {
      const youtube = google.youtube({
        version: 'v3',
        auth: this.oauthClient
      })

      const fileSize = fs.statSync(fileName).size
      const res = await youtube.videos.insert(
        {
          part: 'id,snippet,status',
          notifySubscribers: false,
          requestBody: {
            snippet: {
              title: 'Node.js YouTube Upload Test',
              description: 'Testing YouTube upload via Google APIs Node.js Client'
            },
            status: {
              privacyStatus: 'private'
            }
          },
          media: {
            body: fs.createReadStream(fileName)
          }
        },
        {
          onUploadProgress: evt => {
            const progress = (evt.bytesRead / fileSize) * 100
            readline.clearLine(process.stdout, 0)
            readline.cursorTo(process.stdout, 0, null)
            process.stdout.write(`${Math.round(progress)}% complete`)
          }
        }
      )

      return res.data
    },

    authenticate: async function () {
      this.authorizeUrl = this.oauthClient.generateAuthUrl({
        access_type: 'offline',
        scope: scopes.join(' ')
      })

      await open(this.authorizeUrl, { wait: false })
    }
  }
}

module.exports = { client }
