const fs = require('fs')
const open = require('open')
const app = require('express')()
const readline = require('readline')
const { google } = require('googleapis')

const uploader = client()

const scopes = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube'
]

const youtube = google.youtube({
  version: 'v3',
  auth: uploader.oauthClient
})

async function runSample (fileName) {
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
      // Use the `onUploadProgress` event from Axios to track the
      // number of bytes uploaded to this point.
      onUploadProgress: evt => {
        const progress = (evt.bytesRead / fileSize) * 100
        readline.clearLine(process.stdout, 0)
        readline.cursorTo(process.stdout, 0, null)
        process.stdout.write(`${Math.round(progress)}% complete`)
      }
    }
  )
  console.log('\n\n')
  console.log(res.data)
  return res.data
}

function client () {
  const CREDENTIALS = require('./credential.json')
  const oauthClient = new google.auth.OAuth2(
    CREDENTIALS.client_id,
    CREDENTIALS.client_secret,
    CREDENTIALS.redirect_uris[0]
  )

  return {
    authorizeUrl: '',
    oauthClient,
    server: null,
    authenticate: async function (scopes) {
      return new Promise((resolve, reject) => {
        this.authorizeUrl = this.oauthClient.generateAuthUrl({
          access_type: 'offline',
          scope: scopes.join(' ')
        })


        this.server = app.listen(5000, () => {
          open(this.authorizeUrl, { wait: false })
        })

        app.get('/oauth2callback', async (req, res) => {
          try {
            const { code } = req.query
            res.send('Authentication successful! Please return to the console.')
            this.server.close()

            const { tokens } = await this.oauthClient.getToken(code)
            this.oauthClient.credentials = tokens
            resolve(this.oauthClient)
          } catch (err) {
            reject(err)
          }
        })
      })
    }
  }
}

const fileName = process.argv[2]
uploader
  .authenticate(scopes)
  .then(() => runSample(fileName))
  .catch(console.error)
