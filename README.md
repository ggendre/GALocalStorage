GALocalstorage
==============

GALocalstorage is a Modified version or Google Analytics for Pokki without using pokki at all.

It use localstorage instead of cookies to store session information so it works great for Phonegap apps.

Tested succesfully on :
 * Android 2.2, 2.3, 4.0, 4.1
 * ios 5, 6

I will test more os versions soon


Original Work from the Pokki team 
 * see this repository : https://github.com/blakemachado/Pokki

I just commented out the Pokki stuff for now. help to make it cleaner is welcome.


Example usage:
==============

Place these lines with your values in the head of your index.html

    <script type="text/javascript" src="js/libs/GALocalStorage.js"></script>
    <script>
        ga_storage._setAccount('UA-37167XXX-1'); //Replace with your own
        ga_storage._setDomain('none');
        ga_storage._trackPageview('/index.html');
        
    </script>

Call these whenever you want to track a page view or a custom event

    ga_storage._trackPageview('/index', 'optional title');
    ga_storage._trackEvent('category', 'action', 'label', 'value');
    
If you are using jQuerymobile, add this to your initialisation to track pages views 

    //google analytics
    $('[data-role=page]').live('pageshow', function (event, ui) {
        console.log('google analytics pageshow')
        try {
    		page = location.href.replace(/.*\//,'/')
    		if (page && page.length > 1) {
    			console.log('google analytics pageshow url :'+page)
    			ga_storage._trackPageview(page);
    		} else {
    			console.log('google analytics pageshow default url')
    			ga_storage._trackPageview();
    		}
    	} catch(err){
    		console.log('error google analytics '+err)
    	}
    });
    
    
Which Analytics type to choose?

In the Google Analytics settings, be sure to choose the "web site" type of account :

<img src="https://f.cloud.github.com/assets/2635194/81629/009eac9c-6349-11e2-9882-0a337be9053f.jpg"/>

You will then have the account identifier (looks like 'UA-37167XXX-1').
