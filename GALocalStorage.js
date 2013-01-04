/**
 * Google Analytics for Pokki
 * For all details and documentation:
 * https://github.com/blakemachado/Pokki
 *
 * @version     1.6
 * @license     MIT License
 * @author      Blake Machado <blake@sweetlabs.com>, SweetLabs, Inc.
 *              Fontaine Shu <fontaine@sweetlabs.com>, SweetLabs, Inc.
 * @copyright   (c) 2011-2012, Authors
 *
 * Example usage:
 * - If you want to track the platform version and pokki version in a custom var, 
 *   include this line above the _setAccount and _setDomain:
 *   ga_pokki._initPlatformCustomVar(--SLOT_NUMBER_DEFAULTS_TO_1--);
 * 
 * - Place these two lines with your values at the bottom of popup.html
 *   ga_pokki._setAccount('--GA-ACCOUNT-ID--');
 *   ga_pokki._setDomain('--YOUR-DOMAIN--');
 *
 * - Call these whenever you want to track a page view or a custom event
 *   ga_pokki._trackPageview('/index', 'optional title');
 *   ga_pokki._trackEvent('category', 'action', 'label', 'value');
 */
 
(function() {
    var VERSION = '1.6';
    var IS_DEBUG = false;
    
    var LocalStorage = function(key, initial_value) {
        if (window.localStorage.getItem(key) == null && initial_value != null) {
            window.localStorage.setItem(key, initial_value);
        }
        
        this._get = function() {
            return window.localStorage.getItem(key);
        };
        
        this._set = function(value) {
            return window.localStorage.setItem(key, value);
        };
        
        this._remove = function() {
            return window.localStorage.removeItem(key);
        };
        
        this.toString = function() {
            return this._get();
        };
    };
    
    ga_pokki = new function() {
        var that = this;
        var initialized = false;
        
        var tracking_code_url = 'http://www.google-analytics.com/ga.js';
        var beacon_url = 'http://www.google-analytics.com/__utm.gif';
        var last_url = '/'; // used to keep track of last page view logged to pass forward to subsequent events tracked
        var last_nav_url = '/'; // used to keep track of last page actually visited by the user (not popup_hidden or popup_blurred!)
        var last_page_title = '-'; // used to keep track of last page view logged to pass forward to subsequent events tracked
        var timer; // used for blur/focus state changes
        
        var utmac = false; // set by calling _setAccount
        var utmhn = false; // set by calling _setDomain
        var utmwv = '4.3'; // tracking api version
        var utmcs = 'UTF-8'; // charset
        var utmul = 'en-us'; // language
        var utmdt = '-'; // page title
        var utmn = 0; // random number
        var utmt = 'event'; // analytics type
        var utmhid = 0; // unique id per session
        
        var event_map = {
  		hidden: {
				path: '/popup_hidden',
				event: 'PopupHidden'
			},
			blurred: {
				path: '/popup_blurred',
				event: 'PopupBlurred'
			},
			focused: {
				path: '{last_nav_url}',
				event: 'PopupFocused'
			}
        };
        
        var uid         = new LocalStorage('ga_pokki_uid');
        var uid_rand    = new LocalStorage('ga_pokki_uid_rand');
        var session_cnt = new LocalStorage('ga_pokki_session_cnt');
        var f_session   = new LocalStorage('ga_pokki_f_session');
        var l_session   = new LocalStorage('ga_pokki_l_session');
        var first_run   = new LocalStorage('ga_pokki_first_run');
        var visitor_custom_vars = new LocalStorage('ga_pokki_visitor_custom_vars');
        
        var c_session = 0;
        var custom_vars = visitor_custom_vars._get() ? JSON.parse(visitor_custom_vars._get()) : ['dummy'];
        
        var request_cnt = 0;
        
        function rand(min, max) {
            return min + Math.floor(Math.random() * (max - min));
        }
        
        function get_random() {
            return rand(100000000,999999999);
        }
        
        function return_cookies(source, medium, campaign) {
            source = source || '(direct)';
            medium = medium || '(none)';
            campaign = campaign || '(direct)';
        
            // utma represents user, should exist for lifetime: [user_id].[random #].[first session timestamp].[last session timestamp].[start of this session timestamp].[total # of sessions]
            // utmb is a session, [user_id].[requests_per_session?].[??].[start of session timestamp]
            // utmc is a session, [user_id]
            // utmz is a referrer cookie
            var cookie = uid._get();
            var ret = '__utma=' + cookie + '.' + uid_rand._get() + '.' + f_session._get() + '.' + l_session._get() + '.' + c_session + '.' + session_cnt._get() + ';';
            ret += '+__utmz=' + cookie + '.' + c_session + '.1.1.utmcsr=' + source + '|utmccn=' + campaign + '|utmcmd=' + medium + ';';
            ret += '+__utmc=' + cookie + ';';
            ret += '+__utmb=' + cookie + '.' + request_cnt + '.10.' + c_session + ';';
            return ret;
        }
        
        function generate_query_string(params) {
            var qa = [];
            for (var key in params) {
                qa.push(key + '=' + encodeURIComponent(params[key]));
            }
            return '?' + qa.join('&');
        }
        
		function reset_session(c_session) {
            if(IS_DEBUG) console.log('resetting session');
            
            l_session._set(c_session);
            request_cnt = 0;
            utmhid = get_random();
		}
      
        function gainit() {
            c_session = (new Date()).getTime();
            if(IS_DEBUG) console.log('gainit', c_session);
            
            request_cnt = 0;
            utmhid = get_random();
            
            if (uid._get() == null) {
                uid._set(rand(10000000,99999999));
                uid_rand._set(rand(1000000000,2147483647));
            }
            
            if (session_cnt._get() == null) {
                session_cnt._set(1);
            }
            else {
                session_cnt._set(parseInt(session_cnt._get()) + 1);
            }
            
            if (f_session._get() == null) {
                f_session._set(c_session);
            }
            if (l_session._get() == null) {
                l_session._set(c_session);
            }
            
            // initialize session when popup opens
            pokki.addEventListener('showing', function() {
                // don't run the first time
                if(initialized) {
                    c_session = (new Date()).getTime();
                    session_cnt._set(parseInt(session_cnt._get()) + 1);
                    
                    if(IS_DEBUG) console.log('new current session time', c_session);
                }
                else {
                    initialized = true;
                }
            });
            
            
			var state = 'hidden';
			var latestState = '';

			var handleState = function() {
			
				if(!utmac || !utmhn) return;

				if(IS_DEBUG) console.log('current state:', state, 'latest state:', latestState);

				switch(state) {

					case 'shown':
						if (latestState=='hidden') {
							that._trackPageview(last_nav_url);
						}
	                    that._trackEvent('User', 'IconClick');
	                    // track first run
	                    if(first_run._get() == null) {
	                        that._trackEvent('User', 'FirstRun');
	                        first_run._set(1);
	                    }
						break;

					case 'hidden':
						that._trackPageview(event_map.hidden.path);
						that._trackEvent('User', event_map.hidden.event);
						//reset session when popup closes
						reset_session(c_session);
						break;

					case 'focused':
						that._trackPageview(last_nav_url);
						break;

					case 'blurred':
						that._trackPageview(event_map.blurred.path);
						break;
				
				}

				latestState = state;
			
			};

            pokki.addEventListener('hidden', function() {
            	state = 'hidden';
            	clearTimeout(timer);
            	timer = setTimeout(handleState,200);
			});

            pokki.addEventListener('shown', function() {
            	state = 'shown';
            	clearTimeout(timer);
            	timer = setTimeout(handleState,200);
			});
			
			// The following window events are only fired IF this ga_pokki library is included in the popup window.
			// If it's in the background, the window will have to manually make pokki.rpc calls to log the focus and blur events.
			window.addEventListener('focus',function() {
				state = 'focused';
            	clearTimeout(timer);
            	timer = setTimeout(handleState,200);
			});

			window.addEventListener('blur',function() {
				state = 'blurred';
            	clearTimeout(timer);
            	timer = setTimeout(handleState,200);
			});
        }
        
        // public
        this._initPlatformCustomVar = function(customVarSlot) {
            customVarSlot = customVarSlot || 1; // defaults to 1 unless need to specify which
            
            try {
                var pfv = 'pfv'+pokki.getPlatformVersion();
                var pov = '_pov'+pokki.getManifestVersion();
                var src = '_src'+pokki.getInstallSource();
                var cpn = '_cpn'+pokki.getInstallCampaign();
                var value = pfv + pov + src + cpn;
            
                that._setCustomVar(customVarSlot, 'version-campaign', value);
            }
            catch(e) {
                that._setCustomVar(customVarSlot, 'version-campaign', 'pfv_pov_src_cpn');
            }
        };
        
        // public
        this._setAccount = function(account_id) {
            if(IS_DEBUG) console.log(account_id);
            utmac = account_id;
            gainit();
        };
        // public
        this._setDomain = function(domain) {
            if(IS_DEBUG) console.log(domain);
            utmhn = domain;
        };
        // public
        this._setLocale = function(lng,country) {
            lng = (typeof lng === 'string' && lng.match(/^[a-z][a-z]$/i)) ? lng.toLowerCase() : 'en';
            country = (typeof country === 'string' && country.match(/^[a-z][a-z]$/i)) ? country.toLowerCase() : 'us';
            utmul = lng + '-' + country;
            if(IS_DEBUG) console.log(utmul);
        };
        
        // public
        this._setCustomVar = function(index, name, value, opt_scope) {
            if(index < 1 || index > 5) return false;
            
            var params = {
                name: name,
                value: value,
                scope: opt_scope
            };
            
            custom_vars[index] = params;
            
            // store if custom var is visitor-level (1)
            if(opt_scope === 1) {
                var vcv = visitor_custom_vars._get() ? JSON.parse(visitor_custom_vars._get()) : ['dummy'];
                vcv[index] = params;
                visitor_custom_vars._set(JSON.stringify(vcv));
            }
            
            if(IS_DEBUG) {
                console.log(custom_vars);
            }
            
            return true;
        };
        
        // public
        this._trackPageview = function(path, title, source, medium, campaign) {
            if(IS_DEBUG) {
                console.log('Track Page View', arguments);
            }
            
            clearTimeout(timer);
            
            request_cnt++;
            if (!path) {
                path = '/';
            }
            if(!title) {
                title = utmdt;
            }
            
            // custom vars
            var event = '';
            
            if(custom_vars.length > 1) {
                var names = '';
                var values = '';
                var scopes = '';
                
                for(var i = 1; i < custom_vars.length; i++) {
                    names += custom_vars[i].name;
                    values += custom_vars[i].value;
                    scopes += (custom_vars[i].scope == null ? 3 : custom_vars[i].scope);
                    
                    if(i+1 < custom_vars.length) {
                        names += '*';
                        values += '*';
                        scopes += '*';
                    }
                }
                
                event += '8(' + names + ')';
                event += '9(' + values + ')';
                event += '11(' + scopes + ')';
            }
            
            // remember page path and title for event tracking
            last_url = path;
            last_page_title = title;
            if ([event_map.hidden.path,event_map.blurred.path].indexOf(path) < 0) {
            	last_nav_url = path;
            }
            
            var params = {
                utmwv: utmwv,
                utmn: get_random(),
                utmhn: utmhn,
                utmcs: utmcs,
                utmul: utmul,
                utmdt: title,
                utmhid: utmhid,
                utmp: path,
                utmac: utmac,
                utmcc: return_cookies(source, medium, campaign)
            };
            if(event != '') {
                params.utme = event;
            }
            
            var url = beacon_url + generate_query_string(params);
            var img = new Image();
            img.src = url;
        };
        
        // public
        this._trackEvent = function(category, action, label, value, source, medium, campaign) {
            if(IS_DEBUG) {
                console.log('Track Event', arguments);
                //console.trace();
            }
            
            request_cnt++;
            var event = '5(' + category + '*' + action;
            if (label) {
                event += '*' + label + ')';
            }
            else {
                event += ')';
            }
            if (value) {
                event += '(' + value + ')'
            }
            
            // custom vars
            if(custom_vars.length > 1) {
                var names = '';
                var values = '';
                var scopes = '';
                
                for(var i = 1; i < custom_vars.length; i++) {
                    names += custom_vars[i].name;
                    values += custom_vars[i].value;
                    scopes += (custom_vars[i].scope == null ? 3 : custom_vars[i].scope);
                    
                    if(i+1 < custom_vars.length) {
                        names += '*';
                        values += '*';
                        scopes += '*';
                    }
                }
                
                event += '8(' + names + ')';
                event += '9(' + values + ')';
                event += '11(' + scopes + ')';
            }
            
            var params = {
                utmwv: utmwv,
                utmn: get_random(),
                utmhn: utmhn,
                utmcs: utmcs,
                utmul: utmul,
                utmt: utmt,
                utme: event,
                utmhid: utmhid,
                utmdt: last_page_title,
                utmp: last_url,
                utmac: utmac,
                utmcc: return_cookies(source, medium, campaign)
            };
            var url = beacon_url + generate_query_string(params);
            var img = new Image();
            img.src = url;
        };
		
		// public - manually call when ga_pokki is included in the background instead of the window/popup because the
		// window DOM events on the popup won't be heard by the background
		this._trackBlur = function() {
            var e;
            if(document.createEvent) {
                e = document.createEvent('HTMLEvents');
                e.initEvent('blur', true, true);
            } 
            else {
                e = document.createEventObject();
                e.eventType = 'blur';
            }
            
            if(document.createEvent) {
                window.dispatchEvent(e);
            }
            else {
                window.fireEvent('on', + e.eventType, e);
            }
		};
		// public - manually call when ga_pokki is included in the background instead of the window/popup because the
		// window DOM events on the popup won't be heard by the background
		this._trackFocus = function() {
            var e;
            if(document.createEvent) {
                e = document.createEvent('HTMLEvents');
                e.initEvent('focus', true, true);
            } 
            else {
                e = document.createEventObject();
                e.eventType = 'focus';
            }
            
            if(document.createEvent) {
                window.dispatchEvent(e);
            }
            else {
                window.fireEvent('on', + e.eventType, e);
            }
		};
    };
})();

