/** MMM-Alexa **/
/** @bugsounet 17/01/2021 **/

Module.register("MMM-Alexa", {
  defaults: {
    debug: false,
    verbose: false,
    avs: {
      DeviceId: "Mirror",
      ClientId: "amzn1.application-oa2-client.XXX",
      ClientSecret: "XXX",
      InitialCode: "XXX"
    },
    micConfig: {
      sampleRate: "16000",
      channels: "1",
      exitOnSilence: 15,
      speechSampleDetect: 2000,
      device: "plughw:0"
    }
  },

  start: function(){
    this.audioChime = new Audio()
    this.audioChime.autoplay = true
    this.audioResponse = new Audio()
    this.audioResponse.autoplay = true
    this.init = false
    this.status = {
      "Alexa": {
        Initialized: false,
      },
      "Google": {
        Detected: false,
        Initialized: false,
      }
    }
  },

  getDom: function() {
    this.GADetect()
    var wrapper = document.createElement('div')
    wrapper.id = "ALEXA-WRAPPER"
    if (this.config['hideStatusIndicator']) wrapper.className = 'hidden'

    var status = document.createElement('div')
    status.id= "ALEXA_STATUS"
    status.className = "notInitialized"
    wrapper.appendChild(status)

    var icons = document.createElement('div')
    icons.id= "ALEXA_ICONS"

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
        this.audioChime.src = this.file("resources/end.wav")
        break
      case "ALEXA_ERROR":
        alexaStatus.className = "Error"
        this.audioChime.src = this.file("resources/alert.mp3")
        break
      case "ALEXA_SPEAK":
        if (payload) {
          alexaStatus.className = "Speak"
          this.audioResponse.src = this.file(payload)+ "?seed=" + Date.now()
          this.audioResponse.addEventListener("ended", ()=>{
            console.log("audio end")
            alexaStatus.className = "Ready"
            if (this.status.Google.Initialized) iconGoogle.classList.remove("busy")
            this.sendNotification("SNOWBOY_START")
          })
        } else {
          alexaStatus.className = "Ready"
          if (this.status.Google.Initialized) iconGoogle.classList.remove("busy")
          this.sendNotification("SNOWBOY_START")
        }
        break
      case "ALEXA_BUSY":
        alexaStatus.className = "Busy"
        break
      case "ALEXA_ALERT":
        alexaStatus.className = "Error"
        this.audioChime.src = this.file("resources/alert.mp3")
        console.log("[ALEXA] Alert:", payload, payload.indexOf("code"))
        this.sendNotification("SHOW_ALERT", {
          type: "notification" ,
          message: payload.indexOf("code") > 0 ? "Configuration needed, Please Open http://127.0.0.1:8080/MMM-Alexa" : payload,
          title: "MMM-Alexa",
          timer: 0
        })
        break
    }
  },

  notificationReceived: function(notification, payload) {
    switch (notification) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification('SET_CONFIG', this.config)
        break
      case "ALEXA_ACTIVATE":
        if (this.status.Alexa.Initialized) {
          this.audioChime.src = this.file("resources/start.wav")
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
  }
});
