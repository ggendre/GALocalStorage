GALocalstorage
==============

GALocalstorage is a Modified version or Google Analytics for Pokki without using pokki at all.

Original Work from the Pokki team 
 * see this repository : https://github.com/blakemachado/Pokki

I just commented out the Pokki stuff for now. help to make it cleaner is welcome.


Example usage:
==============

Place these lines with your values in the head of your index.html

    <script type="text/javascript" src="js/libs/GAPokki.js"></script>
    <script>
        var _gaq = _gaq || [];
        var GOOGLEACCOUNT='UA-37167369-1'
        ga_pokki._setAccount(GOOGLEACCOUNT);
        ga_pokki._setDomain('none');
        ga_pokki._trackPageview('/','startpage');
        
    </script>

Call these whenever you want to track a page view or a custom event
    ga_pokki._trackPageview('/index', 'optional title');
    ga_pokki._trackEvent('category', 'action', 'label', 'value');
    
