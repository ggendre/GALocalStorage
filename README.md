# GALocalstorage
GALocalstorage is a Modified version or Google Analytics for Pokki without using pokki at all.

It use localstorage instead of cookies to store session information so it works great for Phonegap apps.

Tested succesfully on :
- Android 2.2, 2.3, 4.0, 4.x
- ios 5, 6
- blackberry 10 webviews

I will test more os versions soon

Original Work from the Pokki team
- see this repository : [https://github.com/blakemachado/Pokki](https://github.com/blakemachado/Pokki)

I just commented out the Pokki stuff for now. help to make it cleaner is welcome.

# Install from bower
````
bower install ga-localstorage -S
```

# Example usage:
In short, just place these lines with your values in the head of your index.html

```js
<script type="text/javascript" src="js/libs/GALocalStorage.js"></script>
<script>
    ga_storage._setAccount('UA-37167XXX-1'); //Replace with your own
    ga_storage._trackPageview('/index.html');

</script>
```

And then call this whenever you want to track a page view

```js
ga_storage._trackPageview('/index', 'optional title');
```

You can also use custom events and use SSL, there is also a jQueryMobile ready snippet in the [How to use](https://github.com/ggendre/GALocalStorage/wiki/How-to-use) page

# Which Analytics type to choose?
In the Google Analytics settings, be sure to choose the "web site" type of account :

<img src="https://f.cloud.github.com/assets/2635194/81629/009eac9c-6349-11e2-9882-0a337be9053f.jpg"/>

You will then have the account identifier (looks like 'UA-37167XXX-1').

If you are having troubles, see the [How to set up your Google Analytics](https://github.com/ggendre/GALocalStorage/wiki/How-to-set-up-Google-Analytics) wiki page
