
// @TODO : A SUPPRIMER

var trimString = function (value) {
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    return value.replace (rtrim, '');
} // trimString ();

// - - - - - - - - -

var CookiesWrapper = (function () {
    return {
        set: function (key, value, days) {
            if (days === undefined || (days !== undefined 
                    && typeof days !== 'number' && parseInt (days) > 0)) {
               days = 1;
            }
            var date = new Date ();
            date.setTime (date.getTime () + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString ();
            document.cookie = key + "=" + value + expires + '; path=/';
        }, // set ();
        
        get: function (key) {
            key = key + '=';
            var ca = document.cookie.split (';');
            for (var i = 0; i < ca.length; ++i) {
                var c = ca[i];
                while (c.charAt (0) === ' ') {
                    c = c.substring (1, c.length);
                }
                if (c.indexOf (key) === 0) {
                    return c.substring (key.length, c.length);
                }
            }
            return null;
        }, // get ();
        
        remove: function (key) {
            this.set (key, "", -1);
        } // remove ();
    };
})();

var UserToken = (function () {
    var UserTokenInstance = function () {
        var tokenKey = 'webapptoken';
        
        var tokenValue = null;
        
        return {
            getToken: function () {
                if (tokenValue === null) {
                    tokenValue = CookiesWrapper.get (tokenKey);
                }
                return tokenValue;
            }, // getToken ();
            
            setToken: function (token) {
                if (typeof token === 'string' && trimString (token) !== '') {
                    tokenValue = token;
                    CookiesWrapper.set (tokenKey, tokenValue);
                }
                return this;
            }, // setToken ();
            
            removeToken: function () {
                if (this.hasToken ()) {
                    tokenValue = null;
                    CookiesWrapper.remove (tokenKey);
                }
                return this;
            }, // removeToken ();
            
            hasToken: function () {
                return this.getToken () !== null;
            } // hasToken ();
        };
    }; // UserTokenInstance;
    
    var instance = null;
    
    return {
        getInstance: function () {
            if (instance === null) {
                instance = new UserTokenInstance ();
            }
            return instance;
        } // getInstance ();
    };
})();

var storeObject = new Vuex.Store ({
    state: {
        loggedin: false,
        token: null
    }, // state;
    
    mutations: {
        login: function (state, payload) {
            if (typeof payload === 'object'
                    && payload.token !== undefined
                    && typeof payload.token === 'string') {
                state.loggedin = true;
                state.token = payload.token;
                console.log (payload.token);
            }
        }, // login ();
        
        logout: function (state) {
            state.loggedin = false;
            state.token = null;
        } // logout ();
    }, // mutations;
    
    getters: {
        isLoggedin: function (state) {
            return state.loggedin === true;
        } // isLoggedin ();
    }, // getters;
    
    actions: {
        login: function (context, payload) {
            context.commit ('login', payload);
        }, // login ();
        
        logout: function (context) {
            context.commit ('logout');
        } // logout ();
    } // actions;
});

var authMixin = {
    methods: {
        isLoggedin: function () {
            return this.$store.getters.isLoggedin;
        } // isLoggedin ();
    } // methods ();
}; // authMixin;

Vue.component ('menu-comp', Vue.extend ({
    template: '#menu-comp',
    mixins: [authMixin]
}));

Vue.component ('login-comp', Vue.extend ({
    template: '#login-comp',
    mixins: [authMixin],
    methods: {
        login: function () {
            var ref = this;
            setTimeout (function () {
                var token = 'a3f4g4ds56hg74jn4yh4';
                UserToken.getInstance ().setToken (token);
                ref.$store.dispatch ('login', {token: token});
            }, 1000);
        }, // login ();
        logout: function () {
            var ref = this;
            setTimeout (function () {
                UserToken.getInstance ().removeToken ();
                ref.$store.dispatch ('logout');
            }, 1000);
        } // logout ();
    } // methods;
}));

var userTokenInstance = UserToken.getInstance ();
if (userTokenInstance.hasToken ()) {
    storeObject.commit ('login', {token: userTokenInstance.getToken ()});
}

var app = new Vue ({el: '#app', store: storeObject});
