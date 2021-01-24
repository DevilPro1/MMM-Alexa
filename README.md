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
          debug: true,
          avs: {
            DeviceId: 'Mirroir',
            ClientId: 'amzn1.application-oa2-client.00ac2c7b836e4815bd4131eae87f425f',
            ClientSecret: '3e8a7f43434a7fbf86f5a9d4244503b873f08c021c477ac9832326a35b371cc5',
            InitialCode: "ANrZvqnXwDXrqeEeujAm", //"ANijyQUQUEbPrTNAOWyr"
          },
          snowboy: {
            useSnowboy: false
          }
        }
    },
 ```
