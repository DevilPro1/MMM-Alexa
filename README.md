MMM-Alexa v1.1.x

![](https://raw.githubusercontent.com/bugsounet/MMM-Alexa/master/resources/Alexa.png)

`MMM-Alexa` is an embedded Alexa echo on MagicMirror.

This v1 is only audio reponse.

I will work around visual and audio reponse soon (v2)

MMM-Alexa can be used with MMM-GoogleAssistant (Dual-Assistant) or in self using mode


# Require
MagicMirror v2.14.00 and more
[MMM-Detector](/MMM-Detector) module for activating

# Installation

```sh
cd ~/MagicMirror/modules
git clone https://github.com/bugsounet/MMM-Alexa
cd MMM-Alexa
npm install
```
# Amazon Account linking

See this [wiki](/MMM-Alexa/AmazonAccountLinking)

# Initial Code Generator

This generator will allow to link MMM-Alexa to your amazon account.
It will return the initial code for your module configuration (InitialCode).

This code is needed for get the token of AVS (Alexa Voice Service)

To make simple things I have code an HTML page (designed by @2hdlockness)
you can get this code [there](http://alexa.bugsounet.fr)

> Notes:
> `deviceSerialNumber` is set by default to `1234`, you can use this value, it's not really important
> When you have this code past it in the same document with CliendID, client Secret, ProductID !
{.is-info}


> You can't now past all value in config !
{.is-success}


# Minimal Configuration
```js
{
  module: "MMM-Alexa",
  position: "top_left",
  configDeepMerge: true,
  config: {
    avs: {
      ProductID: "Mirror",
      ClientID: "amzn1.application-oa2-client.XXX",
      ClientSecret: "XXX",
      InitialCode: "XXX",
      deviceSerialNumber: 1234
    }
  }
},
```
# Advanced Configuration

> This configuration is equal to the `minimal configuration` and reserved for tunning
{.is-info}


```js
{
  module: "MMM-Alexa",
  position: "top_left",
  configDeepMerge: true,
  config: {
    debug: false,
    useStatus: true,
    useChime: true,
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
    NPMCheck: {
      useChecker: true,
      delay: 10 * 60 * 1000,
      useAlert: true
    }
  }
},
```

# configDeepMerge Function
In a lot of my new modules you can see this in the module configuration
But what is it !?

Since MagicMirror v2.13.0 I have coded in main core of MagicMirror this function
It's allow to use internal module configuration and replace ONLY need part by your own.
So copy and past an advanced (complete) configuration is not a good choice ;)
Just modify your desired part!

## sample in `avs: {}`

when I register my developer account, in console and Initial Code Generator, i have set this value:
Product ID => Mirror
deviceSerialNumber => 1234
redirect url => http://alexa.bugsounet.fr/index.html
Client ID => amzn1.application-oa2-client.XXXYYYZZZ
Client Secret => XYYYRZZAXX
InitialCode => XAAZRTTXX

With compare only 3 things are different: `Client ID`, ` Client Secret` and `InitalCode`

so, you can just make this purpose in `AVS: {}`
```js
avs: {
      ClientID: "amzn1.application-oa2-client.XXXYYYZZZ",
      ClientSecret: "XYYYRZZAXX",
      InitialCode: "XAAZRTTXX"
},
```
configMergeDeep function will transform automaticaly `avs:{}` with:
```js
avs: {
      ProductID: "Mirror",
      ClientID: "amzn1.application-oa2-client.XXXYYYZZZ",
      ClientSecret: "XYYYRZZAXX",
      InitialCode: "XAAZRTTXX",
      deviceSerialNumber: 1234,
      redirectUri: "http://alexa.bugsounet.fr/index.html"
},
```
configMergeDeep is a magician !

## Another sample: I don't want the useChime feature

  * I assume you use only the `Minimal Configuration`
  * So just add the needed value to change like this (with the Minimal config).
  * And MagicMirror will merge your configuration to the internal default configuration :)

```js
{
  module: "MMM-Alexa",
  position: "top_left",
  configDeepMerge: true,
  config: {
    avs: {
      ProductID: "Mirror",
      ClientID: "amzn1.application-oa2-client.XXX",
      ClientSecret: "XXX",
      InitialCode: "XXX",
      deviceSerialNumber: 1234
    },
    audioConfig: {
      useChime: false,
    },
},
```

# Structure helping

## Field `debug`
> |field | type | default value
> |---|---|---
> |debug | BOOLEAN | false

When you set `debug` to `true`, detailed log will be recorded. When you don't want log, set it to `false`

## Field `useStatus`

> |field | type | default value
> |---|---|---
> |useStatus | BOOLEAN| true

- useStatus: Display Alexa icon status

## Field `useChime`
> |field | type | default value
> |---|---|---
> |useChime | BOOLEAN | true

- useChime : If you don't want the beeping on status changed, set this to `false`.

## Field `avs: {}`

> |field (- subFiled) | type | default value
> |---|---|---
> |avs |  OBJECT | { ... }
> |- ProductID |TEXT | "Mirror"
> |- CliendID |TEXT | "amzn1.application-oa2-client.XXX"
> |- ClientSecret|TEXT | "XXX"
> |- InitialCode|TEXT | "XXX"
> |- deviceSerialNumber |NUMBER | 1234
> |- redirectUri |TEXT | "http://alexa.bugsounet.fr/index.html"

- ProductID: The ProductID from Developer console of amazon developer 
- CliendID: The ClientID from Developer console of amazon developer
- ClientSecret: The Client Secret from Developer console of amazon developer
- InitialCode: The resulat code from Code Generator
- deviceSerialNumber: The deviceSerialNumber Set with Code Generator (1234 will be fine)
- redirectUri: The url of the Code Generator

## Field `micConfig: {}`

> |field (- subFiled) | type | default value
> |---|---|---
> |micConfig|  OBJECT | { ... }
> |- sampleRate| NUMBER| 16000,
> |- channels | NUMBER| 1
> |- exitOnSilence | NUMBER| 15
> |- speechSampleDetect| NUMBER| 2000
> |- device | STRING| default

- sampleRate: audio sample rate (you don't have to change this!)
- channels: number of channels (you don't have to change this!)
- exitOnSilence: number of frame checked as silence before exit
- speechSampleDetect: number of sample checked for detection of voice
- `device` : recording device(microphone) name of your environment. (e.g. `"default"` is better way with pulse audio)


> Generaly, you don't have to copy/past or modify this part
{.is-warning}


## Field `NPMCheck: {}`

> Generaly, you don't have to copy/past this part
{.is-info}


>|field (- subFiled) | type | default value
>|---|---|---
>|NPMCheck|  OBJECT | { ... }
>|- useChecker | BOOLEAN | true
>|- delay | NUMBER | 10 * 60 * 1000,
>|- useAlert | BOOLEAN | true

- useChecker: Allow to check any update of @bugsounet npm libraries
- delay: delay of check update in ms (default: 10 mins)
- useAlert: if true, i will use `alert` module; if false, it will use [MMM-UpdateNotification](https://github.com/bugsounet/MMM-UpdateNotification) module

# Updating

As all modules that use @bugsounet library

```sh
cd ~/MagicMirror/modules/MMM-Alexa
npm run update
```

# Note:

> MMM-Alexa (v1) will offer ONLY audio output.
> I will start soon new code MMM-Alexa v2 with audio and screen output
{.is-warning}


# Last Tested
MagicMirror : 2.14.0
RPI 4 / raspbian 10 (buster)
Linux debian 10

# Credits
Author : @bugsounet
License : MIT

#  Thanks:
@2hdlockness for design of alexa website.
