module.exports = {

    dbName: 'sharedlingo',

    port: 3000,

    lastMessagesCount: 30,

    ssl: {
        keyFile: '/var/www/ssl/sharedlingo.com.key',
        crtFile: '/var/www/ssl/sharedlingo.com.crt',
    },

    peer: {
        port: 9000,
        path: '/peer'
    }

};
