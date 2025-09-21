# 🛡️ Brave Browser Speech Recognition Fix

## Why Doesn't Speech Recognition Work in Brave?

**Brave browser blocks speech recognition APIs by default** as part of its privacy protection features. This includes:

- Web Speech API (what this app uses)
- Google's speech recognition services
- Other third-party speech services

## 🔧 **Solution 1: Enable Speech APIs in Brave (Recommended)**

### Step-by-Step Instructions:

1. **Open Brave Settings**

   - Type `brave://settings/` in the address bar
   - Or click the hamburger menu → Settings

2. **Navigate to Privacy Settings**

   - Go to `brave://settings/privacy`
   - Look for the "Web3" section

3. **Enable Google Services**

   - Find "Allow Google login for extensions"
   - Enable this setting
   - Also look for "Web3" or "Google services" options

4. **Alternative: Disable Shields for This Site**

   - Click the Brave shield icon in the address bar
   - Turn off "Block trackers & ads" for this site
   - Turn off "Block scripts" if enabled

5. **Refresh the Page**
   - Reload the application
   - Try the microphone button again

## 🚀 **Solution 2: Switch to Chrome (Easiest)**

**Chrome is the recommended browser for speech recognition:**

- ✅ Built-in Web Speech API support
- ✅ No additional configuration needed
- ✅ Most reliable performance
- ✅ Best compatibility

### Download Chrome:

- Visit: https://www.google.com/chrome/
- Install and set as default browser
- Import bookmarks from Brave if needed

## 🔍 **Solution 3: Try Brave's Experimental Features**

1. **Enable Experimental Web APIs**

   - Go to `brave://flags/`
   - Search for "Web Speech"
   - Enable experimental speech features
   - Restart Brave

2. **Check Site Permissions**
   - Click the lock icon in address bar
   - Ensure microphone is set to "Allow"
   - Check if any permissions are blocked

## ⚠️ **Why This Happens**

Brave prioritizes user privacy by:

- Blocking trackers and ads
- Disabling potentially invasive APIs
- Preventing data collection by third parties
- Protecting against fingerprinting

Speech recognition requires connecting to Google's servers, which Brave considers a privacy risk.

## 🎯 **Quick Test After Fixes**

1. Refresh the page
2. Click the microphone button 🎤
3. Allow microphone permissions if prompted
4. Speak clearly into your microphone
5. Check if text appears in the input box

## 📱 **Mobile Brave Users**

On mobile devices:

- Speech recognition may be even more limited
- Consider using Chrome mobile app
- Check mobile browser settings for speech permissions

---

**Bottom Line**: While Brave can be configured to work with speech recognition, **Chrome provides the most reliable experience** with zero configuration needed.
