function t(phraseId, data){
    var text = app.phrases[phraseId] ? app.phrases[phraseId] : phraseId;
    if (typeof(data) === 'undefined'){ return text; }
    for (var key in data){ text = text.replace(new RegExp('\{\{'+key+'\}\}', 'g'), data[key]); }
    return text;
}

function tpl(id, data){

    var template = $('#'+id).html();
    if (typeof(data) === 'undefined'){ return template; }

    function tplReplace(data, template, parentKey){
        $.each(data, function(key, value){
            var currentKey = parentKey ? parentKey + '.' + key : key;
            if (typeof(data[key]) === 'object') {
                template = tplReplace(data[key], template, currentKey);
                return template;
            }
            template = template.replace(new RegExp('\{\{'+currentKey+'\}\}', 'g'), value);
        });
        return template;
    }

    return tplReplace(data, template);

}

function parseMsg(message){
    return urls(emotions(name(message)));
}

function name(string){
    var name = app.getMember(app.userId).name.first;
    string = string.replace(new RegExp(name, 'g'), '<span class="my">' + name + '</span>');
    return string;
}

function emotions(string){
    string = string.replace(/:\)/g, '*smile*');
    string = string.replace(/=\)/g, '*waii*');
    string = string.replace(/;\)/g, '*wink*');
    string = string.replace(/:D/g, '*exciting*');
    string = string.replace(/=D/g, '*exciting*');
    string = string.replace(/:\(/g, '*unhappy*');
    var emRE = new RegExp('(\\*)([a-z]+)\\*', 'g');
    var ems = string.match(emRE);
    if (!ems){ return string; }
    $.each(ems, function(id, tag){
        tag = tag.replace(/\*/g, '');
        if (emoticons.indexOf(tag) >= 0) {
            string = string.replace(new RegExp('\\*'+tag+'\\*', 'g'), '<i class="em em-'+tag+'"></i>');
        }
    });
    return string;
}

function urls(string){
    string = urls_yt(string);
    var urlRE = new RegExp('(?:(?:https?|ftp)://)?(?:[0-9a-z][\\-0-9a-z]*[0-9a-z]\\.)+[a-z]{2,6}(?::\\d{1,5})?(?:/[?!$.():=\'+\\-;&~#@,%*\\wА-Яа-я]+)*/?', 'g');
    var urls = string.match(urlRE);
    if (!urls) { return string; }
    $.each(urls, function(id, url){
        var link = url;
        if (!url.startsWith('http:') && !url.startsWith('https:')){
            url = 'http://' + url;
        }
        string = string.replace(link, '<a href="'+url+'" target="_blank">'+link+'</a>');
    });
    return string;
}

function urls_yt(string){

    var urlsRE = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?/g;
    var urls = string.match(urlsRE);
    if (!urls) { return string; }
    var idRE = /(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?\s]*)/;
    $.each(urls, function(id, url){
        var match = url.match(idRE);
        if (match && match[2].length == 11){
            var ytId = match[2];
            string = string.replace(url, '<a href="#" onclick="return youtube(\''+ytId+'\')"><i class="fa fa-fw fa-youtube-play"></i>YouTube</a>');
        }
    });
    return string;

}

function youtube(id){
    app.dialogs.create({
        id: 'yotube-' + id,
        title: 'YouTube',
        titleIcon: 'youtube-play',
        content: '<div class="youtube-player"><iframe width="100%" height="100%" src="//www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe></div>',
        width:656,
        height:424,
    });
    return false;
}
