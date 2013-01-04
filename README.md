GALocalstorage
==============

GALocalstorage is a Modified version or Google Analytics for Pokki without using pokki at all.

It use localstorage instead of cookies to store session information so it works great for Phonegap apps.

Tested succesfully on :
 * Android 4.1, 
 * ios 6

Original Work from the Pokki team 
 * see this repository : https://github.com/blakemachado/Pokki

I just commented out the Pokki stuff for now. help to make it cleaner is welcome.


Example usage:
==============

Place these lines with your values in the head of your index.html

    <script type="text/javascript" src="js/libs/GAPokki.js"></script>
    <script>
        var GOOGLEACCOUNT='UA-37167369-1'
        ga_storage._setAccount(GOOGLEACCOUNT);
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
