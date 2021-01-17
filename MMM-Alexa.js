Module.register("MMM-Alexa",{
  defaults: {
    debug: false,
    verbose: false,
    avs: {
      DeviceId: "Mirror",
      ClientId: "amzn1.application-oa2-client.XXX",
      ClientSecret: "XXX",
      InitialCode: "XXX"
    }
  },

  start: function(){
    this.audioChime = new Audio()
    this.audioChime.autoplay = true
    this.audioResponse = new Audio()
    this.audioResponse.autoplay = true
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
      this.file('alexa.css')
    ]
  },

  socketNotificationReceived: function(notification, payload) {
    if(notification.startsWith('ALEXA_')){
      console.log(notification)
      var alexaColor = document.getElementById("alexa")
      if (notification == "ALEXA_TOKEN") alexaColor.className = "alexa-tokenSet"
      if (notification == "ALEXA_START") alexaColor.className = "alexa-recordStart"
      if (notification == "ALEXA_STOP") {
        alexaColor.className = "alexa-recordStop"
        this.audioChime.src = this.file("resources/end.wav")
      }
      if (notification == "ALEXA_ERROR") {
        this.audioChime.src = this.file("resources/alert.mp3")
      }
      if (notification == "ALEXA_SPEAK") {
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
      }
      if (notification == "ALEXA_BUSY") {
        alexaColor.className = "alexa-busy"
      }
      if (notification == "ALEXA_ALERT") {
        this.audioChime.src = this.file("resources/alert.mp3")
        console.log("[ALEXA] Alert:", payload, payload.indexOf("code"))
        this.sendNotification("SHOW_ALERT", {
          type: "notification" ,
          message: payload.indexOf("code") > 0 ? "Configuration needed, Please Open http://127.0.0.1:8080/MMM-Alexa" : payload,
          title: "MMM-Alexa",
          timer: 0
        })
      }
    }
  },

  notificationReceived: function(notification, payload, sender) {
    if(notification === 'DOM_OBJECTS_CREATED'){
        this.sendSocketNotification('SET_CONFIG', this.config)
    }

    if(notification === "ALEXA_START_RECORDING"){
      this.audioChime.src = this.file("resources/start.wav")
      this.sendSocketNotification('START_RECORDING')
    }
  }
});
