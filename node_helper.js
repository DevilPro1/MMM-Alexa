/** MMM-Alexa **/
/** @bugsounet 17/01/2021 **/

var NodeHelper = require("node_helper")
const Alexa = require("@bugsounet/alexa")
const npmCheck = require("@bugsounet/npmcheck")
const fs = require("fs")
const path = require("path")
const moment = require("moment")

let log = (...args) => { /* do nothing */ }

module.exports = NodeHelper.create({
  start: function() {
    this.config = null
    this.alexa= {}
    this.tokens= null
    this.alexa.init = false
  },

  socketNotificationReceived: function(notification, payload) {
    switch (notification) {
      case "SET_CONFIG":
        this.config = payload
        this.initAlexa()
        break
      case "START_RECORDING":
        if (this.alexa.init) this.alexa.avs.requestMic(__dirname+ "/tmp/request.wav")
       break
    }
  },

  initAlexa: async function () {
    console.log("[ALEXA] MMM-Alexa Version:", require('./package.json').version)
    if (this.config.debug) log = (...args) => { console.log("[ALEXA]", ...args) }
    if (this.config.NPMCheck.useChecker) {
      var cfg = {
        dirName: __dirname,
        moduleName: this.name,
        timer: this.getUpdateTime(this.config.NPMCheck.delay),
        debug: this.config.debug
      }
      this.Checker= new npmCheck(cfg, update => { this.sendSocketNotification("NPM_UPDATE", update)} )
    }
    this.alexa.config= this.config.avs
    this.alexa.micConfig= this.config.micConfig
    console.log("[ALEXA] Config:", this.alexa.config)
    await this.initialize()
    await this.login()
    console.log("[ALEXA] Initilized!")
    this.alexa.init = true
  },

  initialize: function(){
    this.alexa.avs = new Alexa({
      clientId: this.alexa.config['ClientID'],
      clientSecret: this.alexa.config['ClientSecret'],
      deviceId: this.alexa.config['ProductID'],
      deviceSerialNumber: this.alexa.config['deviceSerialNumber'],
      token: this.getTokens("Token"),
      redirectUri: this.alexa.config['redirectUri'],
      refreshToken: this.getTokens("RefreshToken"),
      debug: this.config.debug,
      verbose: this.config.verbose
    }, this.alexa.micConfig)

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
      var file = path.resolve(__dirname, "tokens.json")
      var firstToken = {
        Token: null,
        RefreshToken: null,
        InitialCode: null
      }
      fs.writeFileSync(file, JSON.stringify(firstToken))
      console.error("[ALEXA] Token File created:", file)
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
    log("Token expire at", moment(Date.now() + 1740000).format("LLLL"))
    fs.writeFileSync(file, JSON.stringify(this.tokens))
    log("Tokens is written...")
    setTimeout (() => {
      log("Token refreshing...")
      this.login()
    }, 1740000)
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
            console.error("[ALEXA] getTokenFromCode error !")
            setTimeout(() => this.login(), 10000)
          })
      } else {
        this.alexa.avs.refreshToken()
          .then (() => this.saveTokens())
          .then (() => resolve())
          .catch((error) => {
            this.sendSocketNotification("ALEXA_ALERT", error.toString())
            console.error("[ALEXA] refreshToken error !")
            setTimeout(() => this.login(), 10000)
          })
      }
    })
  },

  AlexaDetected: function() {
    if (this.alexa.init) {
      this.sendSocketNotification("ALEXA_ACTIVATE")
      this.alexa.avs.requestMic(__dirname+ "/tmp/request.wav")
    }
  },

  /** convert h m s to ms **/
  getUpdateTime: function(str) {
    let ms = 0, time, type, value
    let time_list = ('' + str).split(' ').filter(v => v != '' && /^(\d{1,}\.)?\d{1,}([wdhms])?$/i.test(v))

    for (let i = 0, len = time_list.length; i < len; i++) {
      time = time_list[i]
      type = time.match(/[wdhms]$/i)

      if (type) {
        value = Number(time.replace(type[0], ''))

        switch(type[0].toLowerCase()){
          case 'w':
            ms += value * 604800000
            break
          case 'd':
            ms += value * 86400000
            break
          case 'h':
            ms += value * 3600000
            break
          case 'm':
            ms += value * 60000
            break
          case 's':
            ms += value * 1000
          break
        }
      } else if(!isNaN(parseFloat(time)) && isFinite(time)){
        ms += parseFloat(time)
      }
    }
    return ms
  }
});
