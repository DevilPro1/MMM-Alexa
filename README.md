# MMM-Alexa

 * You want to have Alexa in your mirror !?
 * It will allow to have GoogleAssisant and Alexa in the Mirror ! (not possible actually)

![](https://raw.githubusercontent.com/bugsounet/coding/main/underconstruction.gif)

try with this config:

```js
    {
        disabled: false,
        module: 'MMM-Alexa',
        position: 'top_left',
        configDeepMerge: true,
        config: {
          A2DServer: true,
          avs: {
            DeviceId: 'Your device name',
            ClientId: 'amzn1.application-oa2-client.XXXX',
            ClientSecret: 'XXXXXXXXX',
            InitialCode: "XXXX",
          }
        }
    },
 ```
