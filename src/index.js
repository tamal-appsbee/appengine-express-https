'use strict';

module.exports = function (options) {
    options = options ? options : {};
    let maxAge = options.maxAge ? options.maxAge : 86400;
    let includeSubDomains = options.includeSubDomains !== undefined ? options.includeSubdomains : true;

    return function yes(req, res, next) {
        let NODE_ENV = process.env.NODE_ENV || '';
        let ignoreRequest = ( NODE_ENV !== 'production' );
        if(req.url.indexOf('/_ah/health') > -1){
            ignoreRequest = true;
        }
        
        let secure = req.connection.encrypted || (req.get('X-Forwarded-Proto') === "https");

        if (!ignoreRequest) {
            if (!secure) {
                res.writeHead(301, {
                    Location: 'https://' + req.get('host') + req.url
                });
                res.end();
            } else {
                let header = 'max-age=' + maxAge;
                if (includeSubDomains) header += '; includeSubDomains'
                if (options.preload) header += '; preload'
                res.setHeader('Strict-Transport-Security', header);
                next();
            }
        } else {
            next();
        }
    }
}