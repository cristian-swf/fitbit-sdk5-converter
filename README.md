# fitbit-sdk5-converter
SDK 4.2 to SDK 5.0 project converter
This little project will help you convert your Fitbit projects from SDK 4.2 to SDK 5.0.

**Alpha version, use it at your own risk! Always do a back-up of your project before using this tool !!!**

# How to use

Download the code, then run npm install -g to install it globally

### To convert a project, run:

**npx fitbit-sdk5-converter -p projectfoldername [-options]

**Additional options:**
-b (true/false) - do not create a backup of the old project - default false
-k (true/false) - remove kpay library files and add the new ones for SDK 5.0 (but you still need to add the kpay files from /app/ manually) - default false
-d (true/false) - debug mode - default false

**What it does:**
1. it will create a back-up of your old project
2. it will copy your project into a new folder, appending "sdk5" in it's name
3. it you modify package.json, remove old targets, add new targets, updating sdk versions and bump the version
4. it will delete Ionic content
5. if desired, will remove old kpay versiona and add files for the new one, except the /app/ folder from the kpay library, whick you will need to copy manually
6. will rename .gui to .view and .defs
7. will rename usages in .defs file
8. will try to center the previous centered elements
9. will resize all images from resources folder from 300x300 to 336x336
10. will copy all files from copyfiles directory to your new sdk5 project. Feel free to add your own translation or your needed files there.

**This is a work in progress!**
