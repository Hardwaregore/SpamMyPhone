# SpamMyPhone
This script uses a SignalWire API to spam someone's phone number

# DISCLAIMER!!!!!!!!!
I AM NOT RESPONSIABLE FOR ANY SPAM CREATED WITH THIS SCRIPT!!!!!!!! PLEASE DO NOT REPORT MY GITHUB ACCOUNT!!!!!!! 

# How to use:

1. Download the node js package

2. Run: 
```
npm install --save @signalwire/realtime-api
```

3. Download this repo: `git clone https://github.com/Hardwaregore/SpamMyNumber`

4. Create files called `api.pem`, `pid.pem`, `fromnumber`, and `tonumber`

5. Go to https://signalwire.com and create an account

6. Go to the API tab and click add. 

7. Click create.

8. Copy the project ID and paste it into the `pid.pem` file

9. Click show and copy the api key. The, paste it into the `api.pem`

10. Regester a phone number with SignalWire and paste the number into `fromnumber`

11. Put the number you want to spam into the `tonumber` file.

12. Run:
```
node spam.js
```
