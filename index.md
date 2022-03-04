


<html>
  <head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="config.css" />
    <title>MMM-Alexa ~ Code generator for AVS Authentication</title>
    <script type="text/javascript">
      function getUri() {
        return window.location.href.split('?')[0];
      }

      function requestCode(){
        var clientId = document.getElementById('clientId').value;
        var deviceId = document.getElementById('deviceId').value;
        var deviceSerialNumber = document.getElementById('deviceSerialNumber').value;
        var redirectUri = getUri()

        var scopeData = {
            "alexa:all": {
                productID: deviceId,
                productInstanceAttributes: {
                    deviceSerialNumber: deviceSerialNumber
                }
            }
        }

        var authUrl = "https://www.amazon.com/ap/oa?client_id=" + clientId + "&scope=alexa%3Aall&scope_data=" + encodeURIComponent(JSON.stringify(scopeData))+ "&response_type=code&redirect_uri=" + encodeURI(redirectUri);
        window.location.href = authUrl;
      }

      function getParameterByName(name) {
          url = window.location.href;

          name = name.replace(/[\[\]]/g, "\\$&");
          var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
          var results = regex.exec(url);
          if (!results) return null;
          if (!results[2]) return '';
          return decodeURIComponent(results[2].replace(/\+/g, " "));
      }

      document.addEventListener("DOMContentLoaded", function(event) {
        var initialCode = getParameterByName('code');
        var request= document.getElementById('request')
        var requestedUri= document.getElementById('uri')
        if (initialCode){
          request.style.display = "none";
          document.getElementById('code').innerHTML= "Your InitialCode:<br>" + initialCode;
        }
      });
    </script>
  </head>  
  <body>
    <div class="text">
      <h1><img class="alexa_icon" src="alexa.gif">Code generator for AVS Authentication</h1>
      <div class="backgroundform" id= "request">
        <div id= "uri"></div>
        <div>
          <p>Welcome to the inital code generator for MMM-Alexa<br><br>
        <div class="page">
          <label class="field field_v2">
            <input class="field__input" id="clientId" placeholder="Enter your Client Id here">
            <span class="field__label-wrap">
              <span class="field__label">Client ID</span>
            </span>
          </label>
          <label class="field field_v2">
            <input class="field__input" id="deviceId" placeholder="Enter your Product ID here">
            <span class="field__label-wrap">
              <span class="field__label">Product ID</span>
            </span>
          </label>
          <label class="field field_v2">
            <input class="field__input" id="deviceSerialNumber" value="1234">
            <span class="field__label-wrap">
              <span class="field__label">Device serial number</span>
            </span>
          </label>
        </div>
        <div>
          <p><br>This generator will allow to link MMM-Alexa to your amazon account.<br>
        It will return the initial code for your module configuration (InitialCode).
          </p>
        </div>
        <div class="container">
          <a href="#" class="btn" type="button" id="request_code" value="Request your InitialCode" onClick="requestCode();"/>REQUEST YOUR INTIALCODE</a>
        </div>
        <div>
          <p>You can get support in <a class="link" href="http://forum.bugsounet.fr">4th Party modules</a></p>
      </div>
      <div class="returncode" id="code"></div>
      <div class="logo"><img src="Alexa-logos.png" width="400px" height="130px"/>
    </div>
    <footer class="footer">
      <p>Designed by @devilpro1 2021 ~</p>
    </footer>
