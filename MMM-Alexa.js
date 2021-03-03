/** MMM-Alexa **/
/** @bugsounet 17/01/2021 **/

Module.register("MMM-Alexa", {
  defaults: {
    debug: false,
    verbose: false,
    avs: {
      ProductID: "Mirror",
      ClientID: "amzn1.application-oa2-client.XXX",
      ClientSecret: "XXX",
      InitialCode: "XXX",
      deviceSerialNumber: 1234,
      redirectUri: "http://alexa.bugsounet.fr/index.html"
    },
    micConfig: {
      sampleRate: "16000",
      channels: "1",
      exitOnSilence: 15,
      speechSampleDetect: 2000,
      device: "plughw:0"
    },
    snowboy: {
      useSnowboy: true,
      Sensitivity: null,
      audioGain: 2.0,
    },
    visualConfig: {
      useStatus: true,
      useGO: true
    },
    audioConfig: {
      useChime: true,
      useNative: false,
      playProgram: "mpg321"
    },
    NPMCheck: {
      useChecker: true,
      delay: 10 * 60 * 1000,
      useAlert: true
    },
    A2DServer: false
  },

  start: function(){
    this.init = false
    this.status = {
      "Alexa": {
        Initialized: false
      },
      "Google": {
        Detected: false,
        Initialized: false,
      }
    }
    this.config.snowboy.Model= "alexa"
    this.config.snowboy.Frontend = true
    if (!this.config.audioConfig.useNative) {
      this.audioChime = new Audio()
      this.audioChime.autoplay = true
      this.audioResponse = new Audio()
      this.audioResponse.autoplay = true
    }
  },

  getDom: function() {
    this.GADetect()
    var wrapper = document.createElement('div')
    wrapper.id = "ALEXA-WRAPPER"

    var statusDisplay = document.createElement('div')
    statusDisplay.id= "ALEXA_STATUS_DISPLAY"
    if (!this.config.visualConfig.useStatus) statusDisplay.className = "hidden"
    var status = document.createElement('div')
    status.id= "ALEXA_STATUS"
    status.className = "notInitialized"
    statusDisplay.appendChild(status)
    wrapper.appendChild(statusDisplay)

    var icons = document.createElement('div')
    icons.id= "ALEXA_ICONS"
    if (!this.config.visualConfig.useGO) icons.className = "hidden"

    var iconGoogle = document.createElement('div')
    iconGoogle.id= "ALEXA_ICONS_GOOGLE"
    if (!this.status.Google.Detected) iconGoogle.className= "hidden"
    else iconGoogle.className= "busy"
    icons.appendChild(iconGoogle)

    var iconAlexa = document.createElement('div')
    iconAlexa.id= "ALEXA_ICONS_ALEXA"
    iconAlexa.className= "busy"
    icons.appendChild(iconAlexa)

    wrapper.appendChild(icons)

    return wrapper
  },

  getStyles: function(){
    return [
      this.file('MMM-Alexa.css')
    ]
  },

  socketNotificationReceived: function(notification, payload) {
    var alexaStatus = document.getElementById("ALEXA_STATUS")
    var iconGoogle = document.getElementById("ALEXA_ICONS_GOOGLE")
    var iconAlexa = document.getElementById("ALEXA_ICONS_ALEXA")

    switch (notification) {
      case "ALEXA_ACTIVATE":
        this.playChime("resources/start.mp3")
        break
      case "ALEXA_TOKEN":
        alexaStatus.className = "Ready"
        iconAlexa.classList.remove("busy")
        this.status.Alexa.Initialized= true
        break
      case "ALEXA_START":
        alexaStatus.className = "Start"
        if (this.status.Google.Initialized) iconGoogle.className= "busy"
        break
      case "ALEXA_STOP":
        alexaStatus.className = "Stop"
        this.playChime("resources/end.mp3")
        break
      case "ALEXA_ERROR":
        alexaStatus.className = "Error"
        this.playChime("resources/alert.mp3")
        break
      case "ALEXA_SPEAK":
        if (payload) {
          alexaStatus.className = "Speak"
          this.playResponse(payload)
        } else {
          alexaStatus.className = "Ready"
          if (this.status.Google.Initialized) iconGoogle.classList.remove("busy")
          if (!this.config.snowboy.useSnowboy) this.sendNotification("SNOWBOY_START")
          else this.sendSocketNotification("SNOWBOY_START")
          if (this.config.A2DServer) this.A2DServer("ALEXA_STANDBY")
        }
        break
      case "ALEXA_BUSY":
        alexaStatus.className = "Busy"
        break
      case "ALEXA_ALERT":
        alexaStatus.className = "Error"
        this.playChime("resources/alert.mp3")
        console.log("[ALEXA] Alert:", payload, payload.indexOf("code"))
        this.sendNotification("SHOW_ALERT", {
          type: "notification" ,
          message: payload.indexOf("code") > 0 ? "Configuration needed, Please Open http://alexa.bugsounet.fr/" : payload,
          title: "MMM-Alexa",
          timer: 0
        })
        break
      case "NATIVE_AUDIO_RESPONSE_END":
        if (this.config.A2DServer) this.A2DServer("ALEXA_STANDBY")
        alexaStatus.className = "Ready"
        if (this.status.Google.Initialized) iconGoogle.classList.remove("busy")
        if (!this.config.snowboy.useSnowboy) this.sendNotification("SNOWBOY_START")
        else this.sendSocketNotification("SNOWBOY_START")
        break
      case "NPM_UPDATE":
        if (payload && payload.length > 0) {
          if (this.config.NPMCheck.useAlert) {
            payload.forEach(npm => {
              this.sendNotification("SHOW_ALERT", {
                type: "notification" ,
                message: "[NPM] " + npm.library + " v" + npm.installed +" -> v" + npm.latest,
                title: this.translate("UPDATE_NOTIFICATION_MODULE", { MODULE_NAME: npm.module }),
                timer: this.getUpdateTime(this.config.NPMCheck.delay) - 2000
              })
            })
          }
          this.sendNotification("NPM_UPDATE", payload)
        }
        break
    }
    if (notification.startsWith("ALEXA_") && this.config.A2DServer) this.A2DServer(notification)
  },

  notificationReceived: function(notification, payload) {
    switch (notification) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification('SET_CONFIG', this.config)
        break
      case "ALEXA_ACTIVATE":
        if (this.status.Alexa.Initialized && !this.config.snowboy.useSnowboy) {
          this.playChime("resources/start.mp3")
          if (this.config.A2DServer) this.A2DServer("ALEXA_ACTIVATE")
          this.sendSocketNotification('START_RECORDING')
        }
        break
      case "ASSISTANT_LISTEN":
        var alexaStatus = document.getElementById("ALEXA_STATUS")
        var iconAlexa = document.getElementById("ALEXA_ICONS_ALEXA")
        if (this.status.Alexa.Initialized) {
          iconAlexa.className= "busy"
          alexaStatus.className = "BusyByGoogle"
        }
        break
      case "ASSISTANT_STANDBY":
        var alexaStatus = document.getElementById("ALEXA_STATUS")
        var iconAlexa = document.getElementById("ALEXA_ICONS_ALEXA")
        if (this.status.Alexa.Initialized) {
          iconAlexa.classList.remove("busy")
          alexaStatus.classList = "Ready"
        }
        break
      case "ASSISTANT_READY":
        var iconGoogle = document.getElementById("ALEXA_ICONS_GOOGLE")
        iconGoogle.classList.remove("busy")
        this.status.Google.Initialized = true
        break
    }
  },
  GADetect: function() {
    config.modules.forEach(module => {
      if (module.module == "MMM-GoogleAssistant" && !module.disabled) this.status.Google.Detected = true
    })
  },

  playChime: function(file) {
    if (!this.config.audioConfig.useChime) return
    if (this.config.audioConfig.useNative) this.sendSocketNotification("PLAY_CHIME", file)
    else this.audioChime.src = this.file(file)
  },

  playResponse: function(file) {
    if (this.config.audioConfig.useNative) this.sendSocketNotification("PLAY_RESPONSE", file)
    else {
      this.audioResponse.src = this.file(file)+ "?seed=" + Date.now()
      this.audioCallback()
    }
  },

  audioCallback: function() {
    var status = document.getElementById("ALEXA_STATUS")
    var iconGoogle = document.getElementById("ALEXA_ICONS_GOOGLE")
    this.audioResponse.onended = ()=>{
      if (this.config.A2DServer) this.A2DServer("ALEXA_STANDBY")
      status.className = "Ready"
      if (this.status.Google.Initialized) iconGoogle.classList.remove("busy")
      if (!this.config.snowboy.useSnowboy) this.sendNotification("SNOWBOY_START")
      else this.sendSocketNotification("SNOWBOY_START")
    }
    this.audioResponse.onerror= (err)=>{
      // generaly when reponse is empty
      if (this.config.debug) console.log("[ALEXA] Warn: Empty File or Error", err)
      if (this.config.A2DServer) this.A2DServer("ALEXA_STANDBY")
      status.className = "Ready"
      if (this.status.Google.Initialized) iconGoogle.classList.remove("busy")
      if (!this.config.snowboy.useSnowboy) this.sendNotification("SNOWBOY_START")
      else this.sendSocketNotification("SNOWBOY_START")
    }
  },

  A2DServer: function(type) {
    switch (type) {
      case "ALEXA_ACTIVATE":
        this.sendNotification("ALEXA_LISTEN")
        this.sendNotification("A2D_ASSISTANT_BUSY")
        break
      case "ALEXA_TOKEN":
        this.sendNotification("ALEXA_READY")
        break
      case "ALEXA_SPEAK":
        this.sendNotification("ALEXA_SPEAK")
        break
      case "ALEXA_STANDBY":
        this.sendNotification("ALEXA_STANDBY")
        this.sendNotification("A2D_ASSISTANT_READY")
        break
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
