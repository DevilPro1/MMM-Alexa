var NodeHelper = require("node_helper")
const Alexa = require('@bugsounet/alexa')
const fs = require("fs")
const path = require("path")
const moment = require("moment")

let log = (...args) => { /* do nothing */ }

module.exports = NodeHelper.create({
  start: function() {
    this.config = null
    this.alexa= {}
    this.tokens= null
  },
  socketNotificationReceived: function(notification, payload) {
    if(notification === 'SET_CONFIG'){
      this.config = payload
      this.initAlexa()
    }
    if (notification == "START_RECORDING") {
      this.alexa.avs.requestMic(__dirname+ "/tmp/request.wav")
    }
  },

  initAlexa: async function () {
    console.log("[ALEXA] MMM-Alexa Version:", require('./package.json').version)
    if (this.config.debug) log = (...args) => { console.log("[ALEXA]", ...args) }
    this.alexa.config= this.config.avs
    console.log("[ALEXA] Config:", this.alexa.config)
    await this.initialize()
    await this.login()
    console.log("[ALEXA] Initilized!")
  },

  initialize: function(){
    this.alexa.avs = new Alexa({
      clientId: this.alexa.config['ClientId'],
      clientSecret: this.alexa.config['ClientSecret'],
      deviceId: this.alexa.config['DeviceId'],
      deviceSerialNumber: 1234,
      token: this.getTokens("Token"),
      redirectUri: 'http://127.0.0.1:8080/MMM-Alexa/',
      refreshToken: this.getTokens("RefreshToken"),
      debug: this.config.debug,
      verbose: this.config.verbose
    })

    /** AVS event **/
    this.alexa.avs
      .on("tokenSet", () => this.sendSocketNotification("ALEXA_TOKEN"))
      .on("recordStart", () => this.sendSocketNotification("ALEXA_START"))
      .on("recordStop", () => {
        this.sendSocketNotification("ALEXA_STOP")
        var readStream = fs.createReadStream(__dirname + "/tmp/request.wav")
        this.alexa.avs.sendAudio(readStream).then(file => this.sendSocketNotification("ALEXA_SPEAK", file))
      })
      .on("think", () => this.sendSocketNotification("ALEXA_BUSY"))
      .on("error", () => this.sendSocketNotification("ALEXA_ERROR"))
  },

  getTokens: function(token) {
    var file = path.resolve(__dirname, "tokens.json")
    if (fs.existsSync(file)) {
      this.tokens = require(file)
      return this.tokens[token] ? this.tokens[token] : null
    } else {
      console.error("[ALEXA:ERROR] Token not found!", file)
      return null
    }
  },

  saveTokens: async function(){
    await this.alexa.avs.getToken().then((token) => {
      this.tokens.Token = token
    })
    await this.alexa.avs.getRefreshToken().then((refreshToken) => {
      this.tokens.RefreshToken = refreshToken
    })
    this.tokens.InitialCode = this.alexa.config['InitialCode']
    var file = path.resolve(__dirname, "tokens.json")
    log("Token expire at", moment(Date.now() + 3540000).format("LLLL"))
    fs.writeFileSync(file, JSON.stringify(this.tokens))
    log("Tokens is written...")
    setTimeout (() => {
      log("Token refreshing...")
      this.saveTokens()
    }, 3540000)
  },

  login: async function(){
    return new Promise(resolve => {
      var useCode = this.tokens.InitialCode !== this.alexa.config['InitialCode']
      if (useCode) {
        this.alexa.avs.getTokenFromCode(this.alexa.config['InitialCode'])
          //.then(() => this.alexa.avs.refreshToken()) 
          .then(() => this.saveTokens())
          .then (() => resolve())
          .catch((error) => {
            this.sendSocketNotification("ALEXA_ALERT", error.toString())
            console.error("[ALEXA] " + error)
          })
      } else {
        this.alexa.avs.refreshToken()
          .then (() => this.saveTokens())
          .then (() => resolve())
          .catch((error) => {
            this.sendSocketNotification("ALEXA_ALERT", error.toString())
            console.error("[ALEXA] " + error)
          })
      }
    })
  }
});
