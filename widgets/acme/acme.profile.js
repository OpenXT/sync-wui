var profile = (function() {
    var copyOnly = function(filename, mid) {
        var list = {
            "acme/package.json":1,
            "acme/acme.profile":1
        };
        return (mid in list) || /(png|jpg|jpeg|gif|tiff)$/.test(filename);
    };

    return {
        resourceTags:{
            test: function(filename, mid) {
                return false;
            },
            copyOnly: function(filename, mid){
                return copyOnly(filename, mid);
            },
            amd: function(filename, mid) {
                return !copyOnly(filename, mid) && /\.js$/.test(filename);
            }
        },
        trees:[
            [".", ".", /(\/\.)|(~$)/]
        ]
    };
})();