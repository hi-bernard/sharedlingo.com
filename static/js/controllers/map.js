function MapController(app, socket){

    var map, clusterer, popup;
    var markers = {}, membersHash = {};

    init();

    function init(){
        socket.on('get coords', function(count){
            getCoordinates();
        });
        socket.on('member new coords', function(member){
            updateMemberOnMap(member);
        });
    }

    this.updateCoords = function(){
        getCoordinates();
    };

    this.open = function(){

        app.dialogs.create({
            id: 'map',
            width: 800,
            height: 500,
            title: t('membersMap'),
            content: tpl('mapDialogTemplate'),
            onResize: function(){
                google.maps.event.trigger(map, "resize");
            },
            onCreate: function(){
                initMap(this);
            },
            onClose: function(){

            }
        });

    };

    this.onMemberJoin = function(member){

        if (!app.dialogs.isDialogExists('map')) { return; }

        placeMemberOnMap(member);

    };

    this.onMemberLeave = function(id){

        if (!app.dialogs.isDialogExists('map')) { return; }

        removeMemberFromMap(id);

    };

    function updateMemberOnMap(member){

        app.getMember(member.id).coords = member.coords;

        if (!app.dialogs.isDialogExists('map')) { return; }

        removeMemberFromMap(member.id);
        placeMemberOnMap(member);

    };

    function initMap(dialog){

        membersHash = {};
        markers = {};

        var $mapCanvas = dialog.body().find('#mapCanvas');

        map = new google.maps.Map($mapCanvas.get(0), {
			center: {lat: 51, lng: 0},
			zoom: 2,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.LARGE,
				position: google.maps.ControlPosition.LEFT_CENTER
			},
			streetViewControl: false,
			panControl: false,
			overviewControl: false,
		});

        clusterer = new MarkerClusterer(map, [], {
			gridSize: 64,
			maxZoom: 12,
			minimumClusterSize: 2
		});

        popup = new google.maps.InfoWindow();

        placeMembersOnMap();

    }

    function placeMembersOnMap(){
        $.each(app.getMembers(), function(i, member){
            placeMemberOnMap(member);
        });
    }

    function placeMemberOnMap(member){

        if (!('coords' in member)) { return; }
        if (!('lat' in member.coords)) { return; }

        var lat = Number(member.coords.lat);
        var lng = Number(member.coords.lng);

        var coordsHash = lat.toFixed(4) + '-' + lng.toFixed(4);

        membersHash[member.id] = coordsHash;

        if (coordsHash in markers){
            var markerMembers = markers[coordsHash].members;
            markerMembers.push(member.id);
            var label = markerMembers.length > 9 ? "9" : markerMembers.length.toString();
            markers[coordsHash].marker.setLabel(label);
            return;
        }

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            label: "1",
        });

        markers[coordsHash] = {
            members: [member.id],
            marker: marker
        };

        google.maps.event.addListener(marker, 'click', function() {
            openMarker(coordsHash);
        });

        clusterer.addMarker(marker);

    }

    function removeMemberFromMap(memberId){

        if (!(memberId in membersHash)){ return; }

        var coordsHash = membersHash[memberId];
        var markerMembers = markers[coordsHash].members;
        var marker = markers[coordsHash].marker;
        var index = 0;

        $.each(markerMembers, function(i, member){
            if (member.id == memberId){
                index = i;
            }
        });

        markerMembers.splice(index, 1);

        if (markerMembers.length <= 0){
            clusterer.removeMarker(marker);
            delete markers[coordsHash];
        } else {
            var label = markerMembers.length > 9 ? "9" : markerMembers.length.toString();
            marker.setLabel(label);
        }

        delete membersHash[memberId];

    }

    function openMarker(coordsHash){

        var marker = markers[coordsHash].marker;
        var members = markers[coordsHash].members;

        var $content = $('<div/>').addClass('map-popup');
        var $list = $('<ul/>').appendTo($content);

        $.each(members, function(i, memberId){
            var member = app.getMember(memberId);
            var $item = $('<li/>');
            var $link = $('<a/>').attr('href', '#').html('<i class="fa fa-'+member.genderClass+'"></i> '+member.name.full).addClass('gender-'+member.genderClass).appendTo($item);
            if (member.name.color){
                $link.css({color: member.name.color});
            }
            $item.appendTo($list);
            $link.click(function(){
                app.openProfile(member.id, member.name.full);
            });
        });

        popup.setContent($content.get(0));

        popup.open(map, marker);

    }

    function getCoordinates(){

        var me = app.getMember(app.userId);

        getCoordinatesByAddress(me.location.full, function(result){

            if (result === false){
                getCoordinatesByAddress(me.location.country, function(result){
                    if (result){
                        saveCoordinates(result);
                    }
                });
                return;
            }

            saveCoordinates(result);

        });

    }

    function saveCoordinates(coords){
        socket.emit('set coords', coords);
    }

    function getCoordinatesByAddress(address, callback){

        var geocoder = new google.maps.Geocoder();

		geocoder.geocode( {address: address}, function(results, status) {

			if (status !== google.maps.GeocoderStatus.OK) {
				callback(false); return;
			}

			var lat = results[0].geometry.location.lat();
			var lng = results[0].geometry.location.lng();

            var result = {
                lat: lat,
                lng: lng
            };

			callback(result);

		});

    }

}

/* Google Maps Clusterer */

(function(){var d=null;function e(a){return function(b){this[a]=b}}function h(a){return function(){return this[a]}}var j;
function k(a,b,c){this.extend(k,google.maps.OverlayView);this.c=a;this.a=[];this.f=[];this.ca=[53,56,66,78,90];this.j=[];this.A=!1;c=c||{};this.g=c.gridSize||60;this.l=c.minimumClusterSize||2;this.J=c.maxZoom||d;this.j=c.styles||[];this.X=c.imagePath||this.Q;this.W=c.imageExtension||this.P;this.O=!0;if(c.zoomOnClick!=void 0)this.O=c.zoomOnClick;this.r=!1;if(c.averageCenter!=void 0)this.r=c.averageCenter;l(this);this.setMap(a);this.K=this.c.getZoom();var f=this;google.maps.event.addListener(this.c,
"zoom_changed",function(){var a=f.c.getZoom();if(f.K!=a)f.K=a,f.m()});google.maps.event.addListener(this.c,"idle",function(){f.i()});b&&b.length&&this.C(b,!1)}j=k.prototype;j.Q="https://raw.githubusercontent.com/googlemaps/js-marker-clusterer/gh-pages/images/m";j.P="png";j.extend=function(a,b){return function(a){for(var b in a.prototype)this.prototype[b]=a.prototype[b];return this}.apply(a,[b])};j.onAdd=function(){if(!this.A)this.A=!0,n(this)};j.draw=function(){};
function l(a){if(!a.j.length)for(var b=0,c;c=a.ca[b];b++)a.j.push({url:a.X+(b+1)+"."+a.W,height:c,width:c})}j.S=function(){for(var a=this.o(),b=new google.maps.LatLngBounds,c=0,f;f=a[c];c++)b.extend(f.getPosition());this.c.fitBounds(b)};j.z=h("j");j.o=h("a");j.V=function(){return this.a.length};j.ba=e("J");j.I=h("J");j.G=function(a,b){for(var c=0,f=a.length,g=f;g!==0;)g=parseInt(g/10,10),c++;c=Math.min(c,b);return{text:f,index:c}};j.$=e("G");j.H=h("G");
j.C=function(a,b){for(var c=0,f;f=a[c];c++)q(this,f);b||this.i()};function q(a,b){b.s=!1;b.draggable&&google.maps.event.addListener(b,"dragend",function(){b.s=!1;a.L()});a.a.push(b)}j.q=function(a,b){q(this,a);b||this.i()};function r(a,b){var c=-1;if(a.a.indexOf)c=a.a.indexOf(b);else for(var f=0,g;g=a.a[f];f++)if(g==b){c=f;break}if(c==-1)return!1;b.setMap(d);a.a.splice(c,1);return!0}j.Y=function(a,b){var c=r(this,a);return!b&&c?(this.m(),this.i(),!0):!1};
j.Z=function(a,b){for(var c=!1,f=0,g;g=a[f];f++)g=r(this,g),c=c||g;if(!b&&c)return this.m(),this.i(),!0};j.U=function(){return this.f.length};j.getMap=h("c");j.setMap=e("c");j.w=h("g");j.aa=e("g");
j.v=function(a){var b=this.getProjection(),c=new google.maps.LatLng(a.getNorthEast().lat(),a.getNorthEast().lng()),f=new google.maps.LatLng(a.getSouthWest().lat(),a.getSouthWest().lng()),c=b.fromLatLngToDivPixel(c);c.x+=this.g;c.y-=this.g;f=b.fromLatLngToDivPixel(f);f.x-=this.g;f.y+=this.g;c=b.fromDivPixelToLatLng(c);b=b.fromDivPixelToLatLng(f);a.extend(c);a.extend(b);return a};j.R=function(){this.m(!0);this.a=[]};
j.m=function(a){for(var b=0,c;c=this.f[b];b++)c.remove();for(b=0;c=this.a[b];b++)c.s=!1,a&&c.setMap(d);this.f=[]};j.L=function(){var a=this.f.slice();this.f.length=0;this.m();this.i();window.setTimeout(function(){for(var b=0,c;c=a[b];b++)c.remove()},0)};j.i=function(){n(this)};
function n(a){if(a.A)for(var b=a.v(new google.maps.LatLngBounds(a.c.getBounds().getSouthWest(),a.c.getBounds().getNorthEast())),c=0,f;f=a.a[c];c++)if(!f.s&&b.contains(f.getPosition())){for(var g=a,u=4E4,o=d,v=0,m=void 0;m=g.f[v];v++){var i=m.getCenter();if(i){var p=f.getPosition();if(!i||!p)i=0;else var w=(p.lat()-i.lat())*Math.PI/180,x=(p.lng()-i.lng())*Math.PI/180,i=Math.sin(w/2)*Math.sin(w/2)+Math.cos(i.lat()*Math.PI/180)*Math.cos(p.lat()*Math.PI/180)*Math.sin(x/2)*Math.sin(x/2),i=6371*2*Math.atan2(Math.sqrt(i),
Math.sqrt(1-i));i<u&&(u=i,o=m)}}o&&o.F.contains(f.getPosition())?o.q(f):(m=new s(g),m.q(f),g.f.push(m))}}function s(a){this.k=a;this.c=a.getMap();this.g=a.w();this.l=a.l;this.r=a.r;this.d=d;this.a=[];this.F=d;this.n=new t(this,a.z(),a.w())}j=s.prototype;
j.q=function(a){var b;a:if(this.a.indexOf)b=this.a.indexOf(a)!=-1;else{b=0;for(var c;c=this.a[b];b++)if(c==a){b=!0;break a}b=!1}if(b)return!1;if(this.d){if(this.r)c=this.a.length+1,b=(this.d.lat()*(c-1)+a.getPosition().lat())/c,c=(this.d.lng()*(c-1)+a.getPosition().lng())/c,this.d=new google.maps.LatLng(b,c),y(this)}else this.d=a.getPosition(),y(this);a.s=!0;this.a.push(a);b=this.a.length;b<this.l&&a.getMap()!=this.c&&a.setMap(this.c);if(b==this.l)for(c=0;c<b;c++)this.a[c].setMap(d);b>=this.l&&a.setMap(d);
a=this.c.getZoom();if((b=this.k.I())&&a>b)for(a=0;b=this.a[a];a++)b.setMap(this.c);else if(this.a.length<this.l)z(this.n);else{b=this.k.H()(this.a,this.k.z().length);this.n.setCenter(this.d);a=this.n;a.B=b;a.ga=b.text;a.ea=b.index;if(a.b)a.b.innerHTML=b.text;b=Math.max(0,a.B.index-1);b=Math.min(a.j.length-1,b);b=a.j[b];a.da=b.url;a.h=b.height;a.p=b.width;a.M=b.textColor;a.e=b.anchor;a.N=b.textSize;a.D=b.backgroundPosition;this.n.show()}return!0};
j.getBounds=function(){for(var a=new google.maps.LatLngBounds(this.d,this.d),b=this.o(),c=0,f;f=b[c];c++)a.extend(f.getPosition());return a};j.remove=function(){this.n.remove();this.a.length=0;delete this.a};j.T=function(){return this.a.length};j.o=h("a");j.getCenter=h("d");function y(a){a.F=a.k.v(new google.maps.LatLngBounds(a.d,a.d))}j.getMap=h("c");
function t(a,b,c){a.k.extend(t,google.maps.OverlayView);this.j=b;this.fa=c||0;this.u=a;this.d=d;this.c=a.getMap();this.B=this.b=d;this.t=!1;this.setMap(this.c)}j=t.prototype;
j.onAdd=function(){this.b=document.createElement("DIV");if(this.t)this.b.style.cssText=A(this,B(this,this.d)),this.b.innerHTML=this.B.text;this.getPanes().overlayMouseTarget.appendChild(this.b);var a=this;google.maps.event.addDomListener(this.b,"click",function(){var b=a.u.k;google.maps.event.trigger(b,"clusterclick",a.u);b.O&&a.c.fitBounds(a.u.getBounds())})};function B(a,b){var c=a.getProjection().fromLatLngToDivPixel(b);c.x-=parseInt(a.p/2,10);c.y-=parseInt(a.h/2,10);return c}
j.draw=function(){if(this.t){var a=B(this,this.d);this.b.style.top=a.y+"px";this.b.style.left=a.x+"px"}};function z(a){if(a.b)a.b.style.display="none";a.t=!1}j.show=function(){if(this.b)this.b.style.cssText=A(this,B(this,this.d)),this.b.style.display="";this.t=!0};j.remove=function(){this.setMap(d)};j.onRemove=function(){if(this.b&&this.b.parentNode)z(this),this.b.parentNode.removeChild(this.b),this.b=d};j.setCenter=e("d");
function A(a,b){var c=[];c.push("background-image:url("+a.da+");");c.push("background-position:"+(a.D?a.D:"0 0")+";");typeof a.e==="object"?(typeof a.e[0]==="number"&&a.e[0]>0&&a.e[0]<a.h?c.push("height:"+(a.h-a.e[0])+"px; padding-top:"+a.e[0]+"px;"):c.push("height:"+a.h+"px; line-height:"+a.h+"px;"),typeof a.e[1]==="number"&&a.e[1]>0&&a.e[1]<a.p?c.push("width:"+(a.p-a.e[1])+"px; padding-left:"+a.e[1]+"px;"):c.push("width:"+a.p+"px; text-align:center;")):c.push("height:"+a.h+"px; line-height:"+a.h+
"px; width:"+a.p+"px; text-align:center;");c.push("cursor:pointer; top:"+b.y+"px; left:"+b.x+"px; color:"+(a.M?a.M:"black")+"; position:absolute; font-size:"+(a.N?a.N:11)+"px; font-family:Arial,sans-serif; font-weight:bold");return c.join("")}window.MarkerClusterer=k;k.prototype.addMarker=k.prototype.q;k.prototype.addMarkers=k.prototype.C;k.prototype.clearMarkers=k.prototype.R;k.prototype.fitMapToMarkers=k.prototype.S;k.prototype.getCalculator=k.prototype.H;k.prototype.getGridSize=k.prototype.w;
k.prototype.getExtendedBounds=k.prototype.v;k.prototype.getMap=k.prototype.getMap;k.prototype.getMarkers=k.prototype.o;k.prototype.getMaxZoom=k.prototype.I;k.prototype.getStyles=k.prototype.z;k.prototype.getTotalClusters=k.prototype.U;k.prototype.getTotalMarkers=k.prototype.V;k.prototype.redraw=k.prototype.i;k.prototype.removeMarker=k.prototype.Y;k.prototype.removeMarkers=k.prototype.Z;k.prototype.resetViewport=k.prototype.m;k.prototype.repaint=k.prototype.L;k.prototype.setCalculator=k.prototype.$;
k.prototype.setGridSize=k.prototype.aa;k.prototype.setMaxZoom=k.prototype.ba;k.prototype.onAdd=k.prototype.onAdd;k.prototype.draw=k.prototype.draw;s.prototype.getCenter=s.prototype.getCenter;s.prototype.getSize=s.prototype.T;s.prototype.getMarkers=s.prototype.o;t.prototype.onAdd=t.prototype.onAdd;t.prototype.draw=t.prototype.draw;t.prototype.onRemove=t.prototype.onRemove;
})();
