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
      device: "default"
    },
    useStatus: true,
    useChime: true,
    NPMCheck: {
      useChecker: true,
      delay: 10 * 60 * 1000,
      useAlert: true
    }
  },

  start: function(){
    this.init = false
    this.Initialized= false
    this.audioChime = new Audio()
    this.audioChime.autoplay = true
    this.audioResponse = new Audio()
    this.audioResponse.autoplay = true
  },

  getDom: function() {
    var wrapper = document.createElement('div')
    wrapper.id = "ALEXA-WRAPPER"

    var statusDisplay = document.createElement('div')
    statusDisplay.id= "ALEXA_STATUS_DISPLAY"
    if (!this.config.useStatus) statusDisplay.className = "hidden"
    var status = document.createElement('div')
    status.id= "ALEXA_STATUS"
    status.className = "notInitialized"
    statusDisplay.appendChild(status)
    wrapper.appendChild(statusDisplay)

    return wrapper
  },

  getStyles: function(){
    return [
      this.file('MMM-Alexa.css')
    ]
  },

  socketNotificationReceived: function(notification, payload) {
    var alexaStatus = document.getElementById("ALEXA_STATUS")

    switch (notification) {
      case "ALEXA_ACTIVATE":
        this.playChime("resources/start.mp3")
        break
      case "ALEXA_TOKEN":
        alexaStatus.className = "Ready"
        this.Initialized= true
        break
      case "ALEXA_START":
        alexaStatus.className = "Start"
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
          this.ended()
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
      case "ASSISTANT_LISTEN":
      case "ASSISTANT_THINK":
        alexaStatus.className = "BusyByGoogle"
        break
      case "ASSISTANT_STANDBY":
        alexaStatus.className = "Ready"
        break
      case "NATIVE_AUDIO_RESPONSE_END":
        alexaStatus.className = "Ready"
        this.ended()
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
  },

  notificationReceived: function(notification, payload) {
    switch (notification) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification('SET_CONFIG', this.config)
        break
      case "ALEXA_ACTIVATE":
        if (this.Initialized) {
          this.sendNotification("DETECTOR_STOP")
          this.playChime("resources/start.mp3")
          this.sendSocketNotification('START_RECORDING')
        }
        break
      case "ASSISTANT_THINK":
      case "ASSISTANT_LISTEN":
        var alexaStatus = document.getElementById("ALEXA_STATUS")
        if (this.Initialized) alexaStatus.className = "BusyByGoogle"
        break
      case "ASSISTANT_STANDBY":
        var alexaStatus = document.getElementById("ALEXA_STATUS")
        if (this.Initialized) alexaStatus.classList = "Ready"
        break
    }
  },

  playChime: function(file) {
    if (!this.config.useChime) return
    this.audioChime.src = this.file(file)
  },

  playResponse: function(file) {
    this.audioResponse.src = this.file(file)+ "?seed=" + Date.now()
    this.audioCallback()
  },

  audioCallback: function() {
    var status = document.getElementById("ALEXA_STATUS")
    this.audioResponse.onended = ()=>{
      status.className = "Ready"
      this.ended()
    }
    this.audioResponse.onerror= (err)=>{
      // generaly when reponse is empty
      if (this.config.debug) console.log("[ALEXA] Warn: Empty File or Error", err)
      status.className = "Ready"
      this.ended()
    }
  },

  ended: function (str) {
    this.sendNotification("DETECTOR_START")
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
