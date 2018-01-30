# GALocalstorage
GALocalstorage was a Modified version or Google Analytics for Pokki without using pokki at all. It used localstorage instead of cookies to store session information so it worked great for Phonegap or other hybrid apps.

# DEPRECATION WARNING

**Google Analytics now have an [options explained here](https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#automatic_cookie_domain_configuration) to use LocalStorage instead of cookies and there is also a hack to make it work in webviews (`file://` urls). So instead of using this repository you can just use Google Analytics with a few options described below.**

### 1) add google anlytics

Add a script tag that point to https://www.google-analytics.com/analytics.js and add it to your `head` tag.

```html
<script async src='https://www.google-analytics.com/analytics.js'></script>
```
For offline apps, download the script file instead and add it to your project

Alternatively you can use their debug script to have information in the Javascript console

```html
<script async src='https://www.google-analytics.com/analytics_debug.js'></script>
```

### 2) configure your Google Analytics for localstorage and file:// urls

Put this in your `head` just after the previous line.

```html
<script>
// THIS IS FOR LOCALSTORAGE
var GA_LOCAL_STORAGE_KEY = 'ga:clientId';
ga('create', 'UA-XXXXX-Y', {
  'storage': 'none',
  'clientId': localStorage.getItem(GA_LOCAL_STORAGE_KEY)
});
ga(function(tracker) {
  localStorage.setItem(GA_LOCAL_STORAGE_KEY, tracker.get('clientId'));
});

// THIS IS FOR FILE URL SUPPORT
ga('set', 'checkProtocolTask', function(){ /* noop */});
</script>
```

change `UA-XXXXX-Y` with your ID.


### 3) then, use the google script as usual on page changes

```js
ga('send', 'pageview');
```

You can read more about google analytics on [their pages](https://developers.google.com/analytics/devguides/collection/analyticsjs/).
