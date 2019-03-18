# CW-Logger

Logger and Time Logger based on AWS CloudWatch

## Usage

```javascript
import {Logger} from 'cw-logger'

Logger.configure({
    awsAccessKeyId: 'MY_KEY', // required
    awsSecretKey: 'MY_SECRET', // required
    awsRegion: 'eu-west-3', // optional, default to eu-west-3
    logLevel: 'info', // optional, default to 'debug'
    facility: 'MY_APP_NAME' // optional, default to 'app'
})

Logger.getInstance().info('Test log', {myPayload: 'ok'})
```