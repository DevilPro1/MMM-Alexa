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
  },

  getDom: function() {
    var wrapper = document.createElement('div')
    if(this.config['hideStatusIndicator']){
      wrapper.className = 'alexa-hidden'
    }else{
      wrapper.className = 'alexa-notInitialized'
    }
    wrapper.id = 'alexa'
    return wrapper
  },

  getStyles: function(){
    return [
      this.file('MMM-Alexa.css')
    ]
  },

  socketNotificationReceived: function(notification, payload) {
    var alexaColor = document.getElementById("alexa")
    switch (notification) {
      case "ALEXA_TOKEN":
        alexaColor.className = "alexa-tokenSet"
        this.init = true
        break
      case "ALEXA_START":
        alexaColor.className = "alexa-recordStart"
        break
      case "ALEXA_STOP":
        alexaColor.className = "alexa-recordStop"
        this.audioChime.src = this.file("resources/end.wav")
        break
      case "ALEXA_ERROR":
        this.audioChime.src = this.file("resources/alert.mp3")
        break
      case "ALEXA_SPEAK":
        if (payload) {
          alexaColor.className = "alexa-speak"
          this.audioResponse.src = this.file(payload)+ "?seed=" + Date.now()
          this.audioResponse.addEventListener("ended", ()=>{
            log("audio end")
            alexaColor.className = "alexa-recordStop"
            this.sendNotification("SNOWBOY_START")
          })
        } else {
          alexaColor.className = "alexa-recordStop"
          this.sendNotification("SNOWBOY_START")
        }
        break
      case "ALEXA_BUSY":
        alexaColor.className = "alexa-busy"
        break
      case "ALEXA_ALERT":
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
        if (this.init) {
          this.audioChime.src = this.file("resources/start.wav")
          this.sendSocketNotification('START_RECORDING')
        }
        break
    }
  }
});
