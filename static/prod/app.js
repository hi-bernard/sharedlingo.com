!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t()
else if("function"==typeof define&&define.amd)define([],t)
else{var e
"undefined"!=typeof window?e=window:"undefined"!=typeof global?e=global:"undefined"!=typeof self&&(e=self),e.io=t()}}(function(){var t
return function e(t,n,r){function o(s,a){if(!n[s]){if(!t[s]){var c="function"==typeof require&&require
if(!a&&c)return c(s,!0)
if(i)return i(s,!0)
throw new Error("Cannot find module '"+s+"'")}var p=n[s]={exports:{}}
t[s][0].call(p.exports,function(e){var n=t[s][1][e]
return o(n?n:e)},p,p.exports,e,t,n,r)}return n[s].exports}for(var i="function"==typeof require&&require,s=0;s<r.length;s++)o(r[s])
return o}({1:[function(t,e,n){e.exports=t("./lib/")},{"./lib/":2}],2:[function(t,e,n){function r(t,e){"object"==typeof t&&(e=t,t=void 0),e=e||{}
var n,r=o(t),i=r.source,p=r.id
return e.forceNew||e["force new connection"]||!1===e.multiplex?(a("ignoring socket cache for %s",i),n=s(i,e)):(c[p]||(a("new io instance for %s",i),c[p]=s(i,e)),n=c[p]),n.socket(r.path)}var o=t("./url"),i=t("socket.io-parser"),s=t("./manager"),a=t("debug")("socket.io-client")
e.exports=n=r
var c=n.managers={}
n.protocol=i.protocol,n.connect=r,n.Manager=t("./manager"),n.Socket=t("./socket")},{"./manager":3,"./socket":5,"./url":6,debug:10,"socket.io-parser":44}],3:[function(t,e,n){function r(t,e){return this instanceof r?(t&&"object"==typeof t&&(e=t,t=void 0),e=e||{},e.path=e.path||"/socket.io",this.nsps={},this.subs=[],this.opts=e,this.reconnection(e.reconnection!==!1),this.reconnectionAttempts(e.reconnectionAttempts||1/0),this.reconnectionDelay(e.reconnectionDelay||1e3),this.reconnectionDelayMax(e.reconnectionDelayMax||5e3),this.randomizationFactor(e.randomizationFactor||.5),this.backoff=new h({min:this.reconnectionDelay(),max:this.reconnectionDelayMax(),jitter:this.randomizationFactor()}),this.timeout(null==e.timeout?2e4:e.timeout),this.readyState="closed",this.uri=t,this.connected=[],this.encoding=!1,this.packetBuffer=[],this.encoder=new a.Encoder,this.decoder=new a.Decoder,this.autoConnect=e.autoConnect!==!1,void(this.autoConnect&&this.open())):new r(t,e)}var o=(t("./url"),t("engine.io-client")),i=t("./socket"),s=t("component-emitter"),a=t("socket.io-parser"),c=t("./on"),p=t("component-bind"),u=(t("object-component"),t("debug")("socket.io-client:manager")),f=t("indexof"),h=t("backo2")
e.exports=r,r.prototype.emitAll=function(){this.emit.apply(this,arguments)
for(var t in this.nsps)this.nsps[t].emit.apply(this.nsps[t],arguments)},r.prototype.updateSocketIds=function(){for(var t in this.nsps)this.nsps[t].id=this.engine.id},s(r.prototype),r.prototype.reconnection=function(t){return arguments.length?(this._reconnection=!!t,this):this._reconnection},r.prototype.reconnectionAttempts=function(t){return arguments.length?(this._reconnectionAttempts=t,this):this._reconnectionAttempts},r.prototype.reconnectionDelay=function(t){return arguments.length?(this._reconnectionDelay=t,this.backoff&&this.backoff.setMin(t),this):this._reconnectionDelay},r.prototype.randomizationFactor=function(t){return arguments.length?(this._randomizationFactor=t,this.backoff&&this.backoff.setJitter(t),this):this._randomizationFactor},r.prototype.reconnectionDelayMax=function(t){return arguments.length?(this._reconnectionDelayMax=t,this.backoff&&this.backoff.setMax(t),this):this._reconnectionDelayMax},r.prototype.timeout=function(t){return arguments.length?(this._timeout=t,this):this._timeout},r.prototype.maybeReconnectOnOpen=function(){!this.reconnecting&&this._reconnection&&0===this.backoff.attempts&&this.reconnect()},r.prototype.open=r.prototype.connect=function(t){if(u("readyState %s",this.readyState),~this.readyState.indexOf("open"))return this
u("opening %s",this.uri),this.engine=o(this.uri,this.opts)
var e=this.engine,n=this
this.readyState="opening",this.skipReconnect=!1
var r=c(e,"open",function(){n.onopen(),t&&t()}),i=c(e,"error",function(e){if(u("connect_error"),n.cleanup(),n.readyState="closed",n.emitAll("connect_error",e),t){var r=new Error("Connection error")
r.data=e,t(r)}else n.maybeReconnectOnOpen()})
if(!1!==this._timeout){var s=this._timeout
u("connect attempt will timeout after %d",s)
var a=setTimeout(function(){u("connect attempt timed out after %d",s),r.destroy(),e.close(),e.emit("error","timeout"),n.emitAll("connect_timeout",s)},s)
this.subs.push({destroy:function(){clearTimeout(a)}})}return this.subs.push(r),this.subs.push(i),this},r.prototype.onopen=function(){u("open"),this.cleanup(),this.readyState="open",this.emit("open")
var t=this.engine
this.subs.push(c(t,"data",p(this,"ondata"))),this.subs.push(c(this.decoder,"decoded",p(this,"ondecoded"))),this.subs.push(c(t,"error",p(this,"onerror"))),this.subs.push(c(t,"close",p(this,"onclose")))},r.prototype.ondata=function(t){this.decoder.add(t)},r.prototype.ondecoded=function(t){this.emit("packet",t)},r.prototype.onerror=function(t){u("error",t),this.emitAll("error",t)},r.prototype.socket=function(t){var e=this.nsps[t]
if(!e){e=new i(this,t),this.nsps[t]=e
var n=this
e.on("connect",function(){e.id=n.engine.id,~f(n.connected,e)||n.connected.push(e)})}return e},r.prototype.destroy=function(t){var e=f(this.connected,t)
~e&&this.connected.splice(e,1),this.connected.length||this.close()},r.prototype.packet=function(t){u("writing packet %j",t)
var e=this
e.encoding?e.packetBuffer.push(t):(e.encoding=!0,this.encoder.encode(t,function(t){for(var n=0;n<t.length;n++)e.engine.write(t[n])
e.encoding=!1,e.processPacketQueue()}))},r.prototype.processPacketQueue=function(){if(this.packetBuffer.length>0&&!this.encoding){var t=this.packetBuffer.shift()
this.packet(t)}},r.prototype.cleanup=function(){for(var t;t=this.subs.shift();)t.destroy()
this.packetBuffer=[],this.encoding=!1,this.decoder.destroy()},r.prototype.close=r.prototype.disconnect=function(){this.skipReconnect=!0,this.backoff.reset(),this.readyState="closed",this.engine&&this.engine.close()},r.prototype.onclose=function(t){u("close"),this.cleanup(),this.backoff.reset(),this.readyState="closed",this.emit("close",t),this._reconnection&&!this.skipReconnect&&this.reconnect()},r.prototype.reconnect=function(){if(this.reconnecting||this.skipReconnect)return this
var t=this
if(this.backoff.attempts>=this._reconnectionAttempts)u("reconnect failed"),this.backoff.reset(),this.emitAll("reconnect_failed"),this.reconnecting=!1
else{var e=this.backoff.duration()
u("will wait %dms before reconnect attempt",e),this.reconnecting=!0
var n=setTimeout(function(){t.skipReconnect||(u("attempting reconnect"),t.emitAll("reconnect_attempt",t.backoff.attempts),t.emitAll("reconnecting",t.backoff.attempts),t.skipReconnect||t.open(function(e){e?(u("reconnect attempt error"),t.reconnecting=!1,t.reconnect(),t.emitAll("reconnect_error",e.data)):(u("reconnect success"),t.onreconnect())}))},e)
this.subs.push({destroy:function(){clearTimeout(n)}})}},r.prototype.onreconnect=function(){var t=this.backoff.attempts
this.reconnecting=!1,this.backoff.reset(),this.updateSocketIds(),this.emitAll("reconnect",t)}},{"./on":4,"./socket":5,"./url":6,backo2:7,"component-bind":8,"component-emitter":9,debug:10,"engine.io-client":11,indexof:40,"object-component":41,"socket.io-parser":44}],4:[function(t,e,n){function r(t,e,n){return t.on(e,n),{destroy:function(){t.removeListener(e,n)}}}e.exports=r},{}],5:[function(t,e,n){function r(t,e){this.io=t,this.nsp=e,this.json=this,this.ids=0,this.acks={},this.io.autoConnect&&this.open(),this.receiveBuffer=[],this.sendBuffer=[],this.connected=!1,this.disconnected=!0}var o=t("socket.io-parser"),i=t("component-emitter"),s=t("to-array"),a=t("./on"),c=t("component-bind"),p=t("debug")("socket.io-client:socket"),u=t("has-binary")
e.exports=n=r
var f={connect:1,connect_error:1,connect_timeout:1,disconnect:1,error:1,reconnect:1,reconnect_attempt:1,reconnect_failed:1,reconnect_error:1,reconnecting:1},h=i.prototype.emit
i(r.prototype),r.prototype.subEvents=function(){if(!this.subs){var t=this.io
this.subs=[a(t,"open",c(this,"onopen")),a(t,"packet",c(this,"onpacket")),a(t,"close",c(this,"onclose"))]}},r.prototype.open=r.prototype.connect=function(){return this.connected?this:(this.subEvents(),this.io.open(),"open"==this.io.readyState&&this.onopen(),this)},r.prototype.send=function(){var t=s(arguments)
return t.unshift("message"),this.emit.apply(this,t),this},r.prototype.emit=function(t){if(f.hasOwnProperty(t))return h.apply(this,arguments),this
var e=s(arguments),n=o.EVENT
u(e)&&(n=o.BINARY_EVENT)
var r={type:n,data:e}
return"function"==typeof e[e.length-1]&&(p("emitting packet with ack id %d",this.ids),this.acks[this.ids]=e.pop(),r.id=this.ids++),this.connected?this.packet(r):this.sendBuffer.push(r),this},r.prototype.packet=function(t){t.nsp=this.nsp,this.io.packet(t)},r.prototype.onopen=function(){p("transport is open - connecting"),"/"!=this.nsp&&this.packet({type:o.CONNECT})},r.prototype.onclose=function(t){p("close (%s)",t),this.connected=!1,this.disconnected=!0,delete this.id,this.emit("disconnect",t)},r.prototype.onpacket=function(t){if(t.nsp==this.nsp)switch(t.type){case o.CONNECT:this.onconnect()
break
case o.EVENT:this.onevent(t)
break
case o.BINARY_EVENT:this.onevent(t)
break
case o.ACK:this.onack(t)
break
case o.BINARY_ACK:this.onack(t)
break
case o.DISCONNECT:this.ondisconnect()
break
case o.ERROR:this.emit("error",t.data)}},r.prototype.onevent=function(t){var e=t.data||[]
p("emitting event %j",e),null!=t.id&&(p("attaching ack callback to event"),e.push(this.ack(t.id))),this.connected?h.apply(this,e):this.receiveBuffer.push(e)},r.prototype.ack=function(t){var e=this,n=!1
return function(){if(!n){n=!0
var r=s(arguments)
p("sending ack %j",r)
var i=u(r)?o.BINARY_ACK:o.ACK
e.packet({type:i,id:t,data:r})}}},r.prototype.onack=function(t){p("calling ack %s with %j",t.id,t.data)
var e=this.acks[t.id]
e.apply(this,t.data),delete this.acks[t.id]},r.prototype.onconnect=function(){this.connected=!0,this.disconnected=!1,this.emit("connect"),this.emitBuffered()},r.prototype.emitBuffered=function(){var t
for(t=0;t<this.receiveBuffer.length;t++)h.apply(this,this.receiveBuffer[t])
for(this.receiveBuffer=[],t=0;t<this.sendBuffer.length;t++)this.packet(this.sendBuffer[t])
this.sendBuffer=[]},r.prototype.ondisconnect=function(){p("server disconnect (%s)",this.nsp),this.destroy(),this.onclose("io server disconnect")},r.prototype.destroy=function(){if(this.subs){for(var t=0;t<this.subs.length;t++)this.subs[t].destroy()
this.subs=null}this.io.destroy(this)},r.prototype.close=r.prototype.disconnect=function(){return this.connected&&(p("performing disconnect (%s)",this.nsp),this.packet({type:o.DISCONNECT})),this.destroy(),this.connected&&this.onclose("io client disconnect"),this}},{"./on":4,"component-bind":8,"component-emitter":9,debug:10,"has-binary":36,"socket.io-parser":44,"to-array":48}],6:[function(t,e,n){(function(n){function r(t,e){var r=t,e=e||n.location
return null==t&&(t=e.protocol+"//"+e.host),"string"==typeof t&&("/"==t.charAt(0)&&(t="/"==t.charAt(1)?e.protocol+t:e.hostname+t),/^(https?|wss?):\/\//.test(t)||(i("protocol-less url %s",t),t="undefined"!=typeof e?e.protocol+"//"+t:"https://"+t),i("parse %s",t),r=o(t)),r.port||(/^(http|ws)$/.test(r.protocol)?r.port="80":/^(http|ws)s$/.test(r.protocol)&&(r.port="443")),r.path=r.path||"/",r.id=r.protocol+"://"+r.host+":"+r.port,r.href=r.protocol+"://"+r.host+(e&&e.port==r.port?"":":"+r.port),r}var o=t("parseuri"),i=t("debug")("socket.io-client:url")
e.exports=r}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{debug:10,parseuri:42}],7:[function(t,e,n){function r(t){t=t||{},this.ms=t.min||100,this.max=t.max||1e4,this.factor=t.factor||2,this.jitter=t.jitter>0&&t.jitter<=1?t.jitter:0,this.attempts=0}e.exports=r,r.prototype.duration=function(){var t=this.ms*Math.pow(this.factor,this.attempts++)
if(this.jitter){var e=Math.random(),n=Math.floor(e*this.jitter*t)
t=0==(1&Math.floor(10*e))?t-n:t+n}return 0|Math.min(t,this.max)},r.prototype.reset=function(){this.attempts=0},r.prototype.setMin=function(t){this.ms=t},r.prototype.setMax=function(t){this.max=t},r.prototype.setJitter=function(t){this.jitter=t}},{}],8:[function(t,e,n){var r=[].slice
e.exports=function(t,e){if("string"==typeof e&&(e=t[e]),"function"!=typeof e)throw new Error("bind() requires a function")
var n=r.call(arguments,2)
return function(){return e.apply(t,n.concat(r.call(arguments)))}}},{}],9:[function(t,e,n){function r(t){return t?o(t):void 0}function o(t){for(var e in r.prototype)t[e]=r.prototype[e]
return t}e.exports=r,r.prototype.on=r.prototype.addEventListener=function(t,e){return this._callbacks=this._callbacks||{},(this._callbacks[t]=this._callbacks[t]||[]).push(e),this},r.prototype.once=function(t,e){function n(){r.off(t,n),e.apply(this,arguments)}var r=this
return this._callbacks=this._callbacks||{},n.fn=e,this.on(t,n),this},r.prototype.off=r.prototype.removeListener=r.prototype.removeAllListeners=r.prototype.removeEventListener=function(t,e){if(this._callbacks=this._callbacks||{},0==arguments.length)return this._callbacks={},this
var n=this._callbacks[t]
if(!n)return this
if(1==arguments.length)return delete this._callbacks[t],this
for(var r,o=0;o<n.length;o++)if(r=n[o],r===e||r.fn===e){n.splice(o,1)
break}return this},r.prototype.emit=function(t){this._callbacks=this._callbacks||{}
var e=[].slice.call(arguments,1),n=this._callbacks[t]
if(n){n=n.slice(0)
for(var r=0,o=n.length;o>r;++r)n[r].apply(this,e)}return this},r.prototype.listeners=function(t){return this._callbacks=this._callbacks||{},this._callbacks[t]||[]},r.prototype.hasListeners=function(t){return!!this.listeners(t).length}},{}],10:[function(t,e,n){function r(t){return r.enabled(t)?function(e){e=o(e)
var n=new Date,i=n-(r[t]||n)
r[t]=n,e=t+" "+e+" +"+r.humanize(i),window.console&&console.log&&Function.prototype.apply.call(console.log,console,arguments)}:function(){}}function o(t){return t instanceof Error?t.stack||t.message:t}e.exports=r,r.names=[],r.skips=[],r.enable=function(t){try{localStorage.debug=t}catch(e){}for(var n=(t||"").split(/[\s,]+/),o=n.length,i=0;o>i;i++)t=n[i].replace("*",".*?"),"-"===t[0]?r.skips.push(new RegExp("^"+t.substr(1)+"$")):r.names.push(new RegExp("^"+t+"$"))},r.disable=function(){r.enable("")},r.humanize=function(t){var e=1e3,n=6e4,r=60*n
return t>=r?(t/r).toFixed(1)+"h":t>=n?(t/n).toFixed(1)+"m":t>=e?(t/e|0)+"s":t+"ms"},r.enabled=function(t){for(var e=0,n=r.skips.length;n>e;e++)if(r.skips[e].test(t))return!1
for(var e=0,n=r.names.length;n>e;e++)if(r.names[e].test(t))return!0
return!1}
try{window.localStorage&&r.enable(localStorage.debug)}catch(i){}},{}],11:[function(t,e,n){e.exports=t("./lib/")},{"./lib/":12}],12:[function(t,e,n){e.exports=t("./socket"),e.exports.parser=t("engine.io-parser")},{"./socket":13,"engine.io-parser":25}],13:[function(t,e,n){(function(n){function r(t,e){if(!(this instanceof r))return new r(t,e)
if(e=e||{},t&&"object"==typeof t&&(e=t,t=null),t&&(t=u(t),e.host=t.host,e.secure="https"==t.protocol||"wss"==t.protocol,e.port=t.port,t.query&&(e.query=t.query)),this.secure=null!=e.secure?e.secure:n.location&&"https:"==location.protocol,e.host){var o=e.host.split(":")
e.hostname=o.shift(),o.length?e.port=o.pop():e.port||(e.port=this.secure?"443":"80")}this.agent=e.agent||!1,this.hostname=e.hostname||(n.location?location.hostname:"localhost"),this.port=e.port||(n.location&&location.port?location.port:this.secure?443:80),this.query=e.query||{},"string"==typeof this.query&&(this.query=h.decode(this.query)),this.upgrade=!1!==e.upgrade,this.path=(e.path||"/engine.io").replace(/\/$/,"")+"/",this.forceJSONP=!!e.forceJSONP,this.jsonp=!1!==e.jsonp,this.forceBase64=!!e.forceBase64,this.enablesXDR=!!e.enablesXDR,this.timestampParam=e.timestampParam||"t",this.timestampRequests=e.timestampRequests,this.transports=e.transports||["polling","websocket"],this.readyState="",this.writeBuffer=[],this.callbackBuffer=[],this.policyPort=e.policyPort||843,this.rememberUpgrade=e.rememberUpgrade||!1,this.binaryType=null,this.onlyBinaryUpgrades=e.onlyBinaryUpgrades,this.pfx=e.pfx||null,this.key=e.key||null,this.passphrase=e.passphrase||null,this.cert=e.cert||null,this.ca=e.ca||null,this.ciphers=e.ciphers||null,this.rejectUnauthorized=e.rejectUnauthorized||null,this.open()}function o(t){var e={}
for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])
return e}var i=t("./transports"),s=t("component-emitter"),a=t("debug")("engine.io-client:socket"),c=t("indexof"),p=t("engine.io-parser"),u=t("parseuri"),f=t("parsejson"),h=t("parseqs")
e.exports=r,r.priorWebsocketSuccess=!1,s(r.prototype),r.protocol=p.protocol,r.Socket=r,r.Transport=t("./transport"),r.transports=t("./transports"),r.parser=t("engine.io-parser"),r.prototype.createTransport=function(t){a('creating transport "%s"',t)
var e=o(this.query)
e.EIO=p.protocol,e.transport=t,this.id&&(e.sid=this.id)
var n=new i[t]({agent:this.agent,hostname:this.hostname,port:this.port,secure:this.secure,path:this.path,query:e,forceJSONP:this.forceJSONP,jsonp:this.jsonp,forceBase64:this.forceBase64,enablesXDR:this.enablesXDR,timestampRequests:this.timestampRequests,timestampParam:this.timestampParam,policyPort:this.policyPort,socket:this,pfx:this.pfx,key:this.key,passphrase:this.passphrase,cert:this.cert,ca:this.ca,ciphers:this.ciphers,rejectUnauthorized:this.rejectUnauthorized})
return n},r.prototype.open=function(){var t
if(this.rememberUpgrade&&r.priorWebsocketSuccess&&-1!=this.transports.indexOf("websocket"))t="websocket"
else{if(0==this.transports.length){var e=this
return void setTimeout(function(){e.emit("error","No transports available")},0)}t=this.transports[0]}this.readyState="opening"
var t
try{t=this.createTransport(t)}catch(n){return this.transports.shift(),void this.open()}t.open(),this.setTransport(t)},r.prototype.setTransport=function(t){a("setting transport %s",t.name)
var e=this
this.transport&&(a("clearing existing transport %s",this.transport.name),this.transport.removeAllListeners()),this.transport=t,t.on("drain",function(){e.onDrain()}).on("packet",function(t){e.onPacket(t)}).on("error",function(t){e.onError(t)}).on("close",function(){e.onClose("transport close")})},r.prototype.probe=function(t){function e(){if(h.onlyBinaryUpgrades){var e=!this.supportsBinary&&h.transport.supportsBinary
f=f||e}f||(a('probe transport "%s" opened',t),u.send([{type:"ping",data:"probe"}]),u.once("packet",function(e){if(!f)if("pong"==e.type&&"probe"==e.data){if(a('probe transport "%s" pong',t),h.upgrading=!0,h.emit("upgrading",u),!u)return
r.priorWebsocketSuccess="websocket"==u.name,a('pausing current transport "%s"',h.transport.name),h.transport.pause(function(){f||"closed"!=h.readyState&&(a("changing transport and sending upgrade packet"),p(),h.setTransport(u),u.send([{type:"upgrade"}]),h.emit("upgrade",u),u=null,h.upgrading=!1,h.flush())})}else{a('probe transport "%s" failed',t)
var n=new Error("probe error")
n.transport=u.name,h.emit("upgradeError",n)}}))}function n(){f||(f=!0,p(),u.close(),u=null)}function o(e){var r=new Error("probe error: "+e)
r.transport=u.name,n(),a('probe transport "%s" failed because of error: %s',t,e),h.emit("upgradeError",r)}function i(){o("transport closed")}function s(){o("socket closed")}function c(t){u&&t.name!=u.name&&(a('"%s" works - aborting "%s"',t.name,u.name),n())}function p(){u.removeListener("open",e),u.removeListener("error",o),u.removeListener("close",i),h.removeListener("close",s),h.removeListener("upgrading",c)}a('probing transport "%s"',t)
var u=this.createTransport(t,{probe:1}),f=!1,h=this
r.priorWebsocketSuccess=!1,u.once("open",e),u.once("error",o),u.once("close",i),this.once("close",s),this.once("upgrading",c),u.open()},r.prototype.onOpen=function(){if(a("socket open"),this.readyState="open",r.priorWebsocketSuccess="websocket"==this.transport.name,this.emit("open"),this.flush(),"open"==this.readyState&&this.upgrade&&this.transport.pause){a("starting upgrade probes")
for(var t=0,e=this.upgrades.length;e>t;t++)this.probe(this.upgrades[t])}},r.prototype.onPacket=function(t){if("opening"==this.readyState||"open"==this.readyState)switch(a('socket receive: type "%s", data "%s"',t.type,t.data),this.emit("packet",t),this.emit("heartbeat"),t.type){case"open":this.onHandshake(f(t.data))
break
case"pong":this.setPing()
break
case"error":var e=new Error("server error")
e.code=t.data,this.emit("error",e)
break
case"message":this.emit("data",t.data),this.emit("message",t.data)}else a('packet received with socket readyState "%s"',this.readyState)},r.prototype.onHandshake=function(t){this.emit("handshake",t),this.id=t.sid,this.transport.query.sid=t.sid,this.upgrades=this.filterUpgrades(t.upgrades),this.pingInterval=t.pingInterval,this.pingTimeout=t.pingTimeout,this.onOpen(),"closed"!=this.readyState&&(this.setPing(),this.removeListener("heartbeat",this.onHeartbeat),this.on("heartbeat",this.onHeartbeat))},r.prototype.onHeartbeat=function(t){clearTimeout(this.pingTimeoutTimer)
var e=this
e.pingTimeoutTimer=setTimeout(function(){"closed"!=e.readyState&&e.onClose("ping timeout")},t||e.pingInterval+e.pingTimeout)},r.prototype.setPing=function(){var t=this
clearTimeout(t.pingIntervalTimer),t.pingIntervalTimer=setTimeout(function(){a("writing ping packet - expecting pong within %sms",t.pingTimeout),t.ping(),t.onHeartbeat(t.pingTimeout)},t.pingInterval)},r.prototype.ping=function(){this.sendPacket("ping")},r.prototype.onDrain=function(){for(var t=0;t<this.prevBufferLen;t++)this.callbackBuffer[t]&&this.callbackBuffer[t]()
this.writeBuffer.splice(0,this.prevBufferLen),this.callbackBuffer.splice(0,this.prevBufferLen),this.prevBufferLen=0,0==this.writeBuffer.length?this.emit("drain"):this.flush()},r.prototype.flush=function(){"closed"!=this.readyState&&this.transport.writable&&!this.upgrading&&this.writeBuffer.length&&(a("flushing %d packets in socket",this.writeBuffer.length),this.transport.send(this.writeBuffer),this.prevBufferLen=this.writeBuffer.length,this.emit("flush"))},r.prototype.write=r.prototype.send=function(t,e){return this.sendPacket("message",t,e),this},r.prototype.sendPacket=function(t,e,n){if("closing"!=this.readyState&&"closed"!=this.readyState){var r={type:t,data:e}
this.emit("packetCreate",r),this.writeBuffer.push(r),this.callbackBuffer.push(n),this.flush()}},r.prototype.close=function(){function t(){r.onClose("forced close"),a("socket closing - telling transport to close"),r.transport.close()}function e(){r.removeListener("upgrade",e),r.removeListener("upgradeError",e),t()}function n(){r.once("upgrade",e),r.once("upgradeError",e)}if("opening"==this.readyState||"open"==this.readyState){this.readyState="closing"
var r=this
this.writeBuffer.length?this.once("drain",function(){this.upgrading?n():t()}):this.upgrading?n():t()}return this},r.prototype.onError=function(t){a("socket error %j",t),r.priorWebsocketSuccess=!1,this.emit("error",t),this.onClose("transport error",t)},r.prototype.onClose=function(t,e){if("opening"==this.readyState||"open"==this.readyState||"closing"==this.readyState){a('socket close with reason: "%s"',t)
var n=this
clearTimeout(this.pingIntervalTimer),clearTimeout(this.pingTimeoutTimer),setTimeout(function(){n.writeBuffer=[],n.callbackBuffer=[],n.prevBufferLen=0},0),this.transport.removeAllListeners("close"),this.transport.close(),this.transport.removeAllListeners(),this.readyState="closed",this.id=null,this.emit("close",t,e)}},r.prototype.filterUpgrades=function(t){for(var e=[],n=0,r=t.length;r>n;n++)~c(this.transports,t[n])&&e.push(t[n])
return e}}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./transport":14,"./transports":15,"component-emitter":9,debug:22,"engine.io-parser":25,indexof:40,parsejson:32,parseqs:33,parseuri:34}],14:[function(t,e,n){function r(t){this.path=t.path,this.hostname=t.hostname,this.port=t.port,this.secure=t.secure,this.query=t.query,this.timestampParam=t.timestampParam,this.timestampRequests=t.timestampRequests,this.readyState="",this.agent=t.agent||!1,this.socket=t.socket,this.enablesXDR=t.enablesXDR,this.pfx=t.pfx,this.key=t.key,this.passphrase=t.passphrase,this.cert=t.cert,this.ca=t.ca,this.ciphers=t.ciphers,this.rejectUnauthorized=t.rejectUnauthorized}var o=t("engine.io-parser"),i=t("component-emitter")
e.exports=r,i(r.prototype),r.timestamps=0,r.prototype.onError=function(t,e){var n=new Error(t)
return n.type="TransportError",n.description=e,this.emit("error",n),this},r.prototype.open=function(){return"closed"!=this.readyState&&""!=this.readyState||(this.readyState="opening",this.doOpen()),this},r.prototype.close=function(){return"opening"!=this.readyState&&"open"!=this.readyState||(this.doClose(),this.onClose()),this},r.prototype.send=function(t){if("open"!=this.readyState)throw new Error("Transport not open")
this.write(t)},r.prototype.onOpen=function(){this.readyState="open",this.writable=!0,this.emit("open")},r.prototype.onData=function(t){var e=o.decodePacket(t,this.socket.binaryType)
this.onPacket(e)},r.prototype.onPacket=function(t){this.emit("packet",t)},r.prototype.onClose=function(){this.readyState="closed",this.emit("close")}},{"component-emitter":9,"engine.io-parser":25}],15:[function(t,e,n){(function(e){function r(t){var n,r=!1,a=!1,c=!1!==t.jsonp
if(e.location){var p="https:"==location.protocol,u=location.port
u||(u=p?443:80),r=t.hostname!=location.hostname||u!=t.port,a=t.secure!=p}if(t.xdomain=r,t.xscheme=a,n=new o(t),"open"in n&&!t.forceJSONP)return new i(t)
if(!c)throw new Error("JSONP disabled")
return new s(t)}var o=t("xmlhttprequest"),i=t("./polling-xhr"),s=t("./polling-jsonp"),a=t("./websocket")
n.polling=r,n.websocket=a}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./polling-jsonp":16,"./polling-xhr":17,"./websocket":19,xmlhttprequest:20}],16:[function(t,e,n){(function(n){function r(){}function o(t){i.call(this,t),this.query=this.query||{},a||(n.___eio||(n.___eio=[]),a=n.___eio),this.index=a.length
var e=this
a.push(function(t){e.onData(t)}),this.query.j=this.index,n.document&&n.addEventListener&&n.addEventListener("beforeunload",function(){e.script&&(e.script.onerror=r)},!1)}var i=t("./polling"),s=t("component-inherit")
e.exports=o
var a,c=/\n/g,p=/\\n/g
s(o,i),o.prototype.supportsBinary=!1,o.prototype.doClose=function(){this.script&&(this.script.parentNode.removeChild(this.script),this.script=null),this.form&&(this.form.parentNode.removeChild(this.form),this.form=null,this.iframe=null),i.prototype.doClose.call(this)},o.prototype.doPoll=function(){var t=this,e=document.createElement("script")
this.script&&(this.script.parentNode.removeChild(this.script),this.script=null),e.async=!0,e.src=this.uri(),e.onerror=function(e){t.onError("jsonp poll error",e)}
var n=document.getElementsByTagName("script")[0]
n.parentNode.insertBefore(e,n),this.script=e
var r="undefined"!=typeof navigator&&/gecko/i.test(navigator.userAgent)
r&&setTimeout(function(){var t=document.createElement("iframe")
document.body.appendChild(t),document.body.removeChild(t)},100)},o.prototype.doWrite=function(t,e){function n(){r(),e()}function r(){if(o.iframe)try{o.form.removeChild(o.iframe)}catch(t){o.onError("jsonp polling iframe removal error",t)}try{var e='<iframe src="javascript:0" name="'+o.iframeId+'">'
i=document.createElement(e)}catch(t){i=document.createElement("iframe"),i.name=o.iframeId,i.src="javascript:0"}i.id=o.iframeId,o.form.appendChild(i),o.iframe=i}var o=this
if(!this.form){var i,s=document.createElement("form"),a=document.createElement("textarea"),u=this.iframeId="eio_iframe_"+this.index
s.className="socketio",s.style.position="absolute",s.style.top="-1000px",s.style.left="-1000px",s.target=u,s.method="POST",s.setAttribute("accept-charset","utf-8"),a.name="d",s.appendChild(a),document.body.appendChild(s),this.form=s,this.area=a}this.form.action=this.uri(),r(),t=t.replace(p,"\\\n"),this.area.value=t.replace(c,"\\n")
try{this.form.submit()}catch(f){}this.iframe.attachEvent?this.iframe.onreadystatechange=function(){"complete"==o.iframe.readyState&&n()}:this.iframe.onload=n}}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./polling":18,"component-inherit":21}],17:[function(t,e,n){(function(n){function r(){}function o(t){if(c.call(this,t),n.location){var e="https:"==location.protocol,r=location.port
r||(r=e?443:80),this.xd=t.hostname!=n.location.hostname||r!=t.port,this.xs=t.secure!=e}}function i(t){this.method=t.method||"GET",this.uri=t.uri,this.xd=!!t.xd,this.xs=!!t.xs,this.async=!1!==t.async,this.data=void 0!=t.data?t.data:null,this.agent=t.agent,this.isBinary=t.isBinary,this.supportsBinary=t.supportsBinary,this.enablesXDR=t.enablesXDR,this.pfx=t.pfx,this.key=t.key,this.passphrase=t.passphrase,this.cert=t.cert,this.ca=t.ca,this.ciphers=t.ciphers,this.rejectUnauthorized=t.rejectUnauthorized,this.create()}function s(){for(var t in i.requests)i.requests.hasOwnProperty(t)&&i.requests[t].abort()}var a=t("xmlhttprequest"),c=t("./polling"),p=t("component-emitter"),u=t("component-inherit"),f=t("debug")("engine.io-client:polling-xhr")
e.exports=o,e.exports.Request=i,u(o,c),o.prototype.supportsBinary=!0,o.prototype.request=function(t){return t=t||{},t.uri=this.uri(),t.xd=this.xd,t.xs=this.xs,t.agent=this.agent||!1,t.supportsBinary=this.supportsBinary,t.enablesXDR=this.enablesXDR,t.pfx=this.pfx,t.key=this.key,t.passphrase=this.passphrase,t.cert=this.cert,t.ca=this.ca,t.ciphers=this.ciphers,t.rejectUnauthorized=this.rejectUnauthorized,new i(t)},o.prototype.doWrite=function(t,e){var n="string"!=typeof t&&void 0!==t,r=this.request({method:"POST",data:t,isBinary:n}),o=this
r.on("success",e),r.on("error",function(t){o.onError("xhr post error",t)}),this.sendXhr=r},o.prototype.doPoll=function(){f("xhr poll")
var t=this.request(),e=this
t.on("data",function(t){e.onData(t)}),t.on("error",function(t){e.onError("xhr poll error",t)}),this.pollXhr=t},p(i.prototype),i.prototype.create=function(){var t={agent:this.agent,xdomain:this.xd,xscheme:this.xs,enablesXDR:this.enablesXDR}
t.pfx=this.pfx,t.key=this.key,t.passphrase=this.passphrase,t.cert=this.cert,t.ca=this.ca,t.ciphers=this.ciphers,t.rejectUnauthorized=this.rejectUnauthorized
var e=this.xhr=new a(t),r=this
try{if(f("xhr open %s: %s",this.method,this.uri),e.open(this.method,this.uri,this.async),this.supportsBinary&&(e.responseType="arraybuffer"),"POST"==this.method)try{this.isBinary?e.setRequestHeader("Content-type","application/octet-stream"):e.setRequestHeader("Content-type","text/plain;charset=UTF-8")}catch(o){}"withCredentials"in e&&(e.withCredentials=!0),this.hasXDR()?(e.onload=function(){r.onLoad()},e.onerror=function(){r.onError(e.responseText)}):e.onreadystatechange=function(){4==e.readyState&&(200==e.status||1223==e.status?r.onLoad():setTimeout(function(){r.onError(e.status)},0))},f("xhr data %s",this.data),e.send(this.data)}catch(o){return void setTimeout(function(){r.onError(o)},0)}n.document&&(this.index=i.requestsCount++,i.requests[this.index]=this)},i.prototype.onSuccess=function(){this.emit("success"),this.cleanup()},i.prototype.onData=function(t){this.emit("data",t),this.onSuccess()},i.prototype.onError=function(t){this.emit("error",t),this.cleanup(!0)},i.prototype.cleanup=function(t){if("undefined"!=typeof this.xhr&&null!==this.xhr){if(this.hasXDR()?this.xhr.onload=this.xhr.onerror=r:this.xhr.onreadystatechange=r,t)try{this.xhr.abort()}catch(e){}n.document&&delete i.requests[this.index],this.xhr=null}},i.prototype.onLoad=function(){var t
try{var e
try{e=this.xhr.getResponseHeader("Content-Type").split(";")[0]}catch(n){}t="application/octet-stream"===e?this.xhr.response:this.supportsBinary?"ok":this.xhr.responseText}catch(n){this.onError(n)}null!=t&&this.onData(t)},i.prototype.hasXDR=function(){return"undefined"!=typeof n.XDomainRequest&&!this.xs&&this.enablesXDR},i.prototype.abort=function(){this.cleanup()},n.document&&(i.requestsCount=0,i.requests={},n.attachEvent?n.attachEvent("onunload",s):n.addEventListener&&n.addEventListener("beforeunload",s,!1))}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./polling":18,"component-emitter":9,"component-inherit":21,debug:22,xmlhttprequest:20}],18:[function(t,e,n){function r(t){var e=t&&t.forceBase64
p&&!e||(this.supportsBinary=!1),o.call(this,t)}var o=t("../transport"),i=t("parseqs"),s=t("engine.io-parser"),a=t("component-inherit"),c=t("debug")("engine.io-client:polling")
e.exports=r
var p=function(){var e=t("xmlhttprequest"),n=new e({xdomain:!1})
return null!=n.responseType}()
a(r,o),r.prototype.name="polling",r.prototype.doOpen=function(){this.poll()},r.prototype.pause=function(t){function e(){c("paused"),n.readyState="paused",t()}var n=this
if(this.readyState="pausing",this.polling||!this.writable){var r=0
this.polling&&(c("we are currently polling - waiting to pause"),r++,this.once("pollComplete",function(){c("pre-pause polling complete"),--r||e()})),this.writable||(c("we are currently writing - waiting to pause"),r++,this.once("drain",function(){c("pre-pause writing complete"),--r||e()}))}else e()},r.prototype.poll=function(){c("polling"),this.polling=!0,this.doPoll(),this.emit("poll")},r.prototype.onData=function(t){var e=this
c("polling got data %s",t)
var n=function(t,n,r){return"opening"==e.readyState&&e.onOpen(),"close"==t.type?(e.onClose(),!1):void e.onPacket(t)}
s.decodePayload(t,this.socket.binaryType,n),"closed"!=this.readyState&&(this.polling=!1,this.emit("pollComplete"),"open"==this.readyState?this.poll():c('ignoring poll - transport state "%s"',this.readyState))},r.prototype.doClose=function(){function t(){c("writing close packet"),e.write([{type:"close"}])}var e=this
"open"==this.readyState?(c("transport open - closing"),t()):(c("transport not open - deferring close"),this.once("open",t))},r.prototype.write=function(t){var e=this
this.writable=!1
var n=function(){e.writable=!0,e.emit("drain")},e=this
s.encodePayload(t,this.supportsBinary,function(t){e.doWrite(t,n)})},r.prototype.uri=function(){var t=this.query||{},e=this.secure?"https":"http",n=""
return!1!==this.timestampRequests&&(t[this.timestampParam]=+new Date+"-"+o.timestamps++),this.supportsBinary||t.sid||(t.b64=1),t=i.encode(t),this.port&&("https"==e&&443!=this.port||"http"==e&&80!=this.port)&&(n=":"+this.port),t.length&&(t="?"+t),e+"://"+this.hostname+n+this.path+t}},{"../transport":14,"component-inherit":21,debug:22,"engine.io-parser":25,parseqs:33,xmlhttprequest:20}],19:[function(t,e,n){function r(t){var e=t&&t.forceBase64
e&&(this.supportsBinary=!1),o.call(this,t)}var o=t("../transport"),i=t("engine.io-parser"),s=t("parseqs"),a=t("component-inherit"),c=t("debug")("engine.io-client:websocket"),p=t("ws")
e.exports=r,a(r,o),r.prototype.name="websocket",r.prototype.supportsBinary=!0,r.prototype.doOpen=function(){if(this.check()){var t=this.uri(),e=void 0,n={agent:this.agent}
n.pfx=this.pfx,n.key=this.key,n.passphrase=this.passphrase,n.cert=this.cert,n.ca=this.ca,n.ciphers=this.ciphers,n.rejectUnauthorized=this.rejectUnauthorized,this.ws=new p(t,e,n),void 0===this.ws.binaryType&&(this.supportsBinary=!1),this.ws.binaryType="arraybuffer",this.addEventListeners()}},r.prototype.addEventListeners=function(){var t=this
this.ws.onopen=function(){t.onOpen()},this.ws.onclose=function(){t.onClose()},this.ws.onmessage=function(e){t.onData(e.data)},this.ws.onerror=function(e){t.onError("websocket error",e)}},"undefined"!=typeof navigator&&/iPad|iPhone|iPod/i.test(navigator.userAgent)&&(r.prototype.onData=function(t){var e=this
setTimeout(function(){o.prototype.onData.call(e,t)},0)}),r.prototype.write=function(t){function e(){n.writable=!0,n.emit("drain")}var n=this
this.writable=!1
for(var r=0,o=t.length;o>r;r++)i.encodePacket(t[r],this.supportsBinary,function(t){try{n.ws.send(t)}catch(e){c("websocket closed before onclose event")}})
setTimeout(e,0)},r.prototype.onClose=function(){o.prototype.onClose.call(this)},r.prototype.doClose=function(){"undefined"!=typeof this.ws&&this.ws.close()},r.prototype.uri=function(){var t=this.query||{},e=this.secure?"wss":"ws",n=""
return this.port&&("wss"==e&&443!=this.port||"ws"==e&&80!=this.port)&&(n=":"+this.port),this.timestampRequests&&(t[this.timestampParam]=+new Date),this.supportsBinary||(t.b64=1),t=s.encode(t),t.length&&(t="?"+t),e+"://"+this.hostname+n+this.path+t},r.prototype.check=function(){return!(!p||"__initialize"in p&&this.name===r.prototype.name)}},{"../transport":14,"component-inherit":21,debug:22,"engine.io-parser":25,parseqs:33,ws:35}],20:[function(t,e,n){var r=t("has-cors")
e.exports=function(t){var e=t.xdomain,n=t.xscheme,o=t.enablesXDR
try{if("undefined"!=typeof XMLHttpRequest&&(!e||r))return new XMLHttpRequest}catch(i){}try{if("undefined"!=typeof XDomainRequest&&!n&&o)return new XDomainRequest}catch(i){}if(!e)try{return new ActiveXObject("Microsoft.XMLHTTP")}catch(i){}}},{"has-cors":38}],21:[function(t,e,n){e.exports=function(t,e){var n=function(){}
n.prototype=e.prototype,t.prototype=new n,t.prototype.constructor=t}},{}],22:[function(t,e,n){function r(){return"WebkitAppearance"in document.documentElement.style||window.console&&(console.firebug||console.exception&&console.table)||navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&parseInt(RegExp.$1,10)>=31}function o(){var t=arguments,e=this.useColors
if(t[0]=(e?"%c":"")+this.namespace+(e?" %c":" ")+t[0]+(e?"%c ":" ")+"+"+n.humanize(this.diff),!e)return t
var r="color: "+this.color
t=[t[0],r,"color: inherit"].concat(Array.prototype.slice.call(t,1))
var o=0,i=0
return t[0].replace(/%[a-z%]/g,function(t){"%%"!==t&&(o++,"%c"===t&&(i=o))}),t.splice(i,0,r),t}function i(){return"object"==typeof console&&"function"==typeof console.log&&Function.prototype.apply.call(console.log,console,arguments)}function s(t){try{null==t?localStorage.removeItem("debug"):localStorage.debug=t}catch(e){}}function a(){var t
try{t=localStorage.debug}catch(e){}return t}n=e.exports=t("./debug"),n.log=i,n.formatArgs=o,n.save=s,n.load=a,n.useColors=r,n.colors=["lightseagreen","forestgreen","goldenrod","dodgerblue","darkorchid","crimson"],n.formatters.j=function(t){return JSON.stringify(t)},n.enable(a())},{"./debug":23}],23:[function(t,e,n){function r(){return n.colors[u++%n.colors.length]}function o(t){function e(){}function o(){var t=o,e=+new Date,i=e-(p||e)
t.diff=i,t.prev=p,t.curr=e,p=e,null==t.useColors&&(t.useColors=n.useColors()),null==t.color&&t.useColors&&(t.color=r())
var s=Array.prototype.slice.call(arguments)
s[0]=n.coerce(s[0]),"string"!=typeof s[0]&&(s=["%o"].concat(s))
var a=0
s[0]=s[0].replace(/%([a-z%])/g,function(e,r){if("%%"===e)return e
a++
var o=n.formatters[r]
if("function"==typeof o){var i=s[a]
e=o.call(t,i),s.splice(a,1),a--}return e}),"function"==typeof n.formatArgs&&(s=n.formatArgs.apply(t,s))
var c=o.log||n.log||console.log.bind(console)
c.apply(t,s)}e.enabled=!1,o.enabled=!0
var i=n.enabled(t)?o:e
return i.namespace=t,i}function i(t){n.save(t)
for(var e=(t||"").split(/[\s,]+/),r=e.length,o=0;r>o;o++)e[o]&&(t=e[o].replace(/\*/g,".*?"),"-"===t[0]?n.skips.push(new RegExp("^"+t.substr(1)+"$")):n.names.push(new RegExp("^"+t+"$")))}function s(){n.enable("")}function a(t){var e,r
for(e=0,r=n.skips.length;r>e;e++)if(n.skips[e].test(t))return!1
for(e=0,r=n.names.length;r>e;e++)if(n.names[e].test(t))return!0
return!1}function c(t){return t instanceof Error?t.stack||t.message:t}n=e.exports=o,n.coerce=c,n.disable=s,n.enable=i,n.enabled=a,n.humanize=t("ms"),n.names=[],n.skips=[],n.formatters={}
var p,u=0},{ms:24}],24:[function(t,e,n){function r(t){var e=/^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(t)
if(e){var n=parseFloat(e[1]),r=(e[2]||"ms").toLowerCase()
switch(r){case"years":case"year":case"y":return n*f
case"days":case"day":case"d":return n*u
case"hours":case"hour":case"h":return n*p
case"minutes":case"minute":case"m":return n*c
case"seconds":case"second":case"s":return n*a
case"ms":return n}}}function o(t){return t>=u?Math.round(t/u)+"d":t>=p?Math.round(t/p)+"h":t>=c?Math.round(t/c)+"m":t>=a?Math.round(t/a)+"s":t+"ms"}function i(t){return s(t,u,"day")||s(t,p,"hour")||s(t,c,"minute")||s(t,a,"second")||t+" ms"}function s(t,e,n){return e>t?void 0:1.5*e>t?Math.floor(t/e)+" "+n:Math.ceil(t/e)+" "+n+"s"}var a=1e3,c=60*a,p=60*c,u=24*p,f=365.25*u
e.exports=function(t,e){return e=e||{},"string"==typeof t?r(t):e["long"]?i(t):o(t)}},{}],25:[function(t,e,n){(function(e){function r(t,e){var r="b"+n.packets[t.type]+t.data.data
return e(r)}function o(t,e,r){if(!e)return n.encodeBase64Packet(t,r)
var o=t.data,i=new Uint8Array(o),s=new Uint8Array(1+o.byteLength)
s[0]=m[t.type]
for(var a=0;a<i.length;a++)s[a+1]=i[a]
return r(s.buffer)}function i(t,e,r){if(!e)return n.encodeBase64Packet(t,r)
var o=new FileReader
return o.onload=function(){t.data=o.result,n.encodePacket(t,e,!0,r)},o.readAsArrayBuffer(t.data)}function s(t,e,r){if(!e)return n.encodeBase64Packet(t,r)
if(g)return i(t,e,r)
var o=new Uint8Array(1)
o[0]=m[t.type]
var s=new w([o.buffer,t.data])
return r(s)}function a(t,e,n){for(var r=new Array(t.length),o=h(t.length,n),i=function(t,n,o){e(n,function(e,n){r[t]=n,o(e,r)})},s=0;s<t.length;s++)i(s,t[s],o)}var c=t("./keys"),p=t("has-binary"),u=t("arraybuffer.slice"),f=t("base64-arraybuffer"),h=t("after"),l=t("utf8"),d=navigator.userAgent.match(/Android/i),y=/PhantomJS/i.test(navigator.userAgent),g=d||y
n.protocol=3
var m=n.packets={open:0,close:1,ping:2,pong:3,message:4,upgrade:5,noop:6},v=c(m),b={type:"error",data:"parser error"},w=t("blob")
n.encodePacket=function(t,n,i,a){"function"==typeof n&&(a=n,n=!1),"function"==typeof i&&(a=i,i=null)
var c=void 0===t.data?void 0:t.data.buffer||t.data
if(e.ArrayBuffer&&c instanceof ArrayBuffer)return o(t,n,a)
if(w&&c instanceof e.Blob)return s(t,n,a)
if(c&&c.base64)return r(t,a)
var p=m[t.type]
return void 0!==t.data&&(p+=i?l.encode(String(t.data)):String(t.data)),a(""+p)},n.encodeBase64Packet=function(t,r){var o="b"+n.packets[t.type]
if(w&&t.data instanceof w){var i=new FileReader
return i.onload=function(){var t=i.result.split(",")[1]
r(o+t)},i.readAsDataURL(t.data)}var s
try{s=String.fromCharCode.apply(null,new Uint8Array(t.data))}catch(a){for(var c=new Uint8Array(t.data),p=new Array(c.length),u=0;u<c.length;u++)p[u]=c[u]
s=String.fromCharCode.apply(null,p)}return o+=e.btoa(s),r(o)},n.decodePacket=function(t,e,r){if("string"==typeof t||void 0===t){if("b"==t.charAt(0))return n.decodeBase64Packet(t.substr(1),e)
if(r)try{t=l.decode(t)}catch(o){return b}var i=t.charAt(0)
return Number(i)==i&&v[i]?t.length>1?{type:v[i],data:t.substring(1)}:{type:v[i]}:b}var s=new Uint8Array(t),i=s[0],a=u(t,1)
return w&&"blob"===e&&(a=new w([a])),{type:v[i],data:a}},n.decodeBase64Packet=function(t,n){var r=v[t.charAt(0)]
if(!e.ArrayBuffer)return{type:r,data:{base64:!0,data:t.substr(1)}}
var o=f.decode(t.substr(1))
return"blob"===n&&w&&(o=new w([o])),{type:r,data:o}},n.encodePayload=function(t,e,r){function o(t){return t.length+":"+t}function i(t,r){n.encodePacket(t,s?e:!1,!0,function(t){r(null,o(t))})}"function"==typeof e&&(r=e,e=null)
var s=p(t)
return e&&s?w&&!g?n.encodePayloadAsBlob(t,r):n.encodePayloadAsArrayBuffer(t,r):t.length?void a(t,i,function(t,e){return r(e.join(""))}):r("0:")},n.decodePayload=function(t,e,r){if("string"!=typeof t)return n.decodePayloadAsBinary(t,e,r)
"function"==typeof e&&(r=e,e=null)
var o
if(""==t)return r(b,0,1)
for(var i,s,a="",c=0,p=t.length;p>c;c++){var u=t.charAt(c)
if(":"!=u)a+=u
else{if(""==a||a!=(i=Number(a)))return r(b,0,1)
if(s=t.substr(c+1,i),a!=s.length)return r(b,0,1)
if(s.length){if(o=n.decodePacket(s,e,!0),b.type==o.type&&b.data==o.data)return r(b,0,1)
var f=r(o,c+i,p)
if(!1===f)return}c+=i,a=""}}return""!=a?r(b,0,1):void 0},n.encodePayloadAsArrayBuffer=function(t,e){function r(t,e){n.encodePacket(t,!0,!0,function(t){return e(null,t)})}return t.length?void a(t,r,function(t,n){var r=n.reduce(function(t,e){var n
return n="string"==typeof e?e.length:e.byteLength,t+n.toString().length+n+2},0),o=new Uint8Array(r),i=0
return n.forEach(function(t){var e="string"==typeof t,n=t
if(e){for(var r=new Uint8Array(t.length),s=0;s<t.length;s++)r[s]=t.charCodeAt(s)
n=r.buffer}e?o[i++]=0:o[i++]=1
for(var a=n.byteLength.toString(),s=0;s<a.length;s++)o[i++]=parseInt(a[s])
o[i++]=255
for(var r=new Uint8Array(n),s=0;s<r.length;s++)o[i++]=r[s]}),e(o.buffer)}):e(new ArrayBuffer(0))},n.encodePayloadAsBlob=function(t,e){function r(t,e){n.encodePacket(t,!0,!0,function(t){var n=new Uint8Array(1)
if(n[0]=1,"string"==typeof t){for(var r=new Uint8Array(t.length),o=0;o<t.length;o++)r[o]=t.charCodeAt(o)
t=r.buffer,n[0]=0}for(var i=t instanceof ArrayBuffer?t.byteLength:t.size,s=i.toString(),a=new Uint8Array(s.length+1),o=0;o<s.length;o++)a[o]=parseInt(s[o])
if(a[s.length]=255,w){var c=new w([n.buffer,a.buffer,t])
e(null,c)}})}a(t,r,function(t,n){return e(new w(n))})},n.decodePayloadAsBinary=function(t,e,r){"function"==typeof e&&(r=e,e=null)
for(var o=t,i=[],s=!1;o.byteLength>0;){for(var a=new Uint8Array(o),c=0===a[0],p="",f=1;255!=a[f];f++){if(p.length>310){s=!0
break}p+=a[f]}if(s)return r(b,0,1)
o=u(o,2+p.length),p=parseInt(p)
var h=u(o,0,p)
if(c)try{h=String.fromCharCode.apply(null,new Uint8Array(h))}catch(l){var d=new Uint8Array(h)
h=""
for(var f=0;f<d.length;f++)h+=String.fromCharCode(d[f])}i.push(h),o=u(o,p)}var y=i.length
i.forEach(function(t,o){r(n.decodePacket(t,e,!0),o,y)})}}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./keys":26,after:27,"arraybuffer.slice":28,"base64-arraybuffer":29,blob:30,"has-binary":36,utf8:31}],26:[function(t,e,n){e.exports=Object.keys||function(t){var e=[],n=Object.prototype.hasOwnProperty
for(var r in t)n.call(t,r)&&e.push(r)
return e}},{}],27:[function(t,e,n){function r(t,e,n){function r(t,o){if(r.count<=0)throw new Error("after called too many times");--r.count,t?(i=!0,e(t),e=n):0!==r.count||i||e(null,o)}var i=!1
return n=n||o,r.count=t,0===t?e():r}function o(){}e.exports=r},{}],28:[function(t,e,n){e.exports=function(t,e,n){var r=t.byteLength
if(e=e||0,n=n||r,t.slice)return t.slice(e,n)
if(0>e&&(e+=r),0>n&&(n+=r),n>r&&(n=r),e>=r||e>=n||0===r)return new ArrayBuffer(0)
for(var o=new Uint8Array(t),i=new Uint8Array(n-e),s=e,a=0;n>s;s++,a++)i[a]=o[s]
return i.buffer}},{}],29:[function(t,e,n){!function(t){"use strict"
n.encode=function(e){var n,r=new Uint8Array(e),o=r.length,i=""
for(n=0;o>n;n+=3)i+=t[r[n]>>2],i+=t[(3&r[n])<<4|r[n+1]>>4],i+=t[(15&r[n+1])<<2|r[n+2]>>6],i+=t[63&r[n+2]]
return o%3===2?i=i.substring(0,i.length-1)+"=":o%3===1&&(i=i.substring(0,i.length-2)+"=="),i},n.decode=function(e){var n,r,o,i,s,a=.75*e.length,c=e.length,p=0
"="===e[e.length-1]&&(a--,"="===e[e.length-2]&&a--)
var u=new ArrayBuffer(a),f=new Uint8Array(u)
for(n=0;c>n;n+=4)r=t.indexOf(e[n]),o=t.indexOf(e[n+1]),i=t.indexOf(e[n+2]),s=t.indexOf(e[n+3]),f[p++]=r<<2|o>>4,f[p++]=(15&o)<<4|i>>2,f[p++]=(3&i)<<6|63&s
return u}}("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")},{}],30:[function(t,e,n){(function(t){function n(t){for(var e=0;e<t.length;e++){var n=t[e]
if(n.buffer instanceof ArrayBuffer){var r=n.buffer
if(n.byteLength!==r.byteLength){var o=new Uint8Array(n.byteLength)
o.set(new Uint8Array(r,n.byteOffset,n.byteLength)),r=o.buffer}t[e]=r}}}function r(t,e){e=e||{}
var r=new i
n(t)
for(var o=0;o<t.length;o++)r.append(t[o])
return e.type?r.getBlob(e.type):r.getBlob()}function o(t,e){return n(t),new Blob(t,e||{})}var i=t.BlobBuilder||t.WebKitBlobBuilder||t.MSBlobBuilder||t.MozBlobBuilder,s=function(){try{var t=new Blob(["hi"])
return 2===t.size}catch(e){return!1}}(),a=s&&function(){try{var t=new Blob([new Uint8Array([1,2])])
return 2===t.size}catch(e){return!1}}(),c=i&&i.prototype.append&&i.prototype.getBlob
e.exports=function(){return s?a?t.Blob:o:c?r:void 0}()}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],31:[function(e,n,r){(function(e){!function(o){function i(t){for(var e,n,r=[],o=0,i=t.length;i>o;)e=t.charCodeAt(o++),e>=55296&&56319>=e&&i>o?(n=t.charCodeAt(o++),56320==(64512&n)?r.push(((1023&e)<<10)+(1023&n)+65536):(r.push(e),o--)):r.push(e)
return r}function s(t){for(var e,n=t.length,r=-1,o="";++r<n;)e=t[r],e>65535&&(e-=65536,o+=w(e>>>10&1023|55296),e=56320|1023&e),o+=w(e)
return o}function a(t){if(t>=55296&&57343>=t)throw Error("Lone surrogate U+"+t.toString(16).toUpperCase()+" is not a scalar value")}function c(t,e){return w(t>>e&63|128)}function p(t){if(0==(4294967168&t))return w(t)
var e=""
return 0==(4294965248&t)?e=w(t>>6&31|192):0==(4294901760&t)?(a(t),e=w(t>>12&15|224),e+=c(t,6)):0==(4292870144&t)&&(e=w(t>>18&7|240),e+=c(t,12),e+=c(t,6)),e+=w(63&t|128)}function u(t){for(var e,n=i(t),r=n.length,o=-1,s="";++o<r;)e=n[o],s+=p(e)
return s}function f(){if(b>=v)throw Error("Invalid byte index")
var t=255&m[b]
if(b++,128==(192&t))return 63&t
throw Error("Invalid continuation byte")}function h(){var t,e,n,r,o
if(b>v)throw Error("Invalid byte index")
if(b==v)return!1
if(t=255&m[b],b++,0==(128&t))return t
if(192==(224&t)){var e=f()
if(o=(31&t)<<6|e,o>=128)return o
throw Error("Invalid continuation byte")}if(224==(240&t)){if(e=f(),n=f(),o=(15&t)<<12|e<<6|n,o>=2048)return a(o),o
throw Error("Invalid continuation byte")}if(240==(248&t)&&(e=f(),n=f(),r=f(),o=(15&t)<<18|e<<12|n<<6|r,o>=65536&&1114111>=o))return o
throw Error("Invalid UTF-8 detected")}function l(t){m=i(t),v=m.length,b=0
for(var e,n=[];(e=h())!==!1;)n.push(e)
return s(n)}var d="object"==typeof r&&r,y="object"==typeof n&&n&&n.exports==d&&n,g="object"==typeof e&&e
g.global!==g&&g.window!==g||(o=g)
var m,v,b,w=String.fromCharCode,k={version:"2.0.0",encode:u,decode:l}
if("function"==typeof t&&"object"==typeof t.amd&&t.amd)t(function(){return k})
else if(d&&!d.nodeType)if(y)y.exports=k
else{var x={},A=x.hasOwnProperty
for(var B in k)A.call(k,B)&&(d[B]=k[B])}else o.utf8=k}(this)}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],32:[function(t,e,n){(function(t){var n=/^[\],:{}\s]*$/,r=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,o=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,i=/(?:^|:|,)(?:\s*\[)+/g,s=/^\s+/,a=/\s+$/
e.exports=function(e){return"string"==typeof e&&e?(e=e.replace(s,"").replace(a,""),t.JSON&&JSON.parse?JSON.parse(e):n.test(e.replace(r,"@").replace(o,"]").replace(i,""))?new Function("return "+e)():void 0):null}}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],33:[function(t,e,n){n.encode=function(t){var e=""
for(var n in t)t.hasOwnProperty(n)&&(e.length&&(e+="&"),e+=encodeURIComponent(n)+"="+encodeURIComponent(t[n]))
return e},n.decode=function(t){for(var e={},n=t.split("&"),r=0,o=n.length;o>r;r++){var i=n[r].split("=")
e[decodeURIComponent(i[0])]=decodeURIComponent(i[1])}return e}},{}],34:[function(t,e,n){var r=/^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,o=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"]
e.exports=function(t){var e=t,n=t.indexOf("["),i=t.indexOf("]");-1!=n&&-1!=i&&(t=t.substring(0,n)+t.substring(n,i).replace(/:/g,";")+t.substring(i,t.length))
for(var s=r.exec(t||""),a={},c=14;c--;)a[o[c]]=s[c]||""
return-1!=n&&-1!=i&&(a.source=e,a.host=a.host.substring(1,a.host.length-1).replace(/;/g,":"),a.authority=a.authority.replace("[","").replace("]","").replace(/;/g,":"),a.ipv6uri=!0),a}},{}],35:[function(t,e,n){function r(t,e,n){var r
return r=e?new i(t,e):new i(t)}var o=function(){return this}(),i=o.WebSocket||o.MozWebSocket
e.exports=i?r:null,i&&(r.prototype=i.prototype)},{}],36:[function(t,e,n){(function(n){function r(t){function e(t){if(!t)return!1
if(n.Buffer&&n.Buffer.isBuffer(t)||n.ArrayBuffer&&t instanceof ArrayBuffer||n.Blob&&t instanceof Blob||n.File&&t instanceof File)return!0
if(o(t)){for(var r=0;r<t.length;r++)if(e(t[r]))return!0}else if(t&&"object"==typeof t){t.toJSON&&(t=t.toJSON())
for(var i in t)if(Object.prototype.hasOwnProperty.call(t,i)&&e(t[i]))return!0}return!1}return e(t)}var o=t("isarray")
e.exports=r}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{isarray:37}],37:[function(t,e,n){e.exports=Array.isArray||function(t){return"[object Array]"==Object.prototype.toString.call(t)}},{}],38:[function(t,e,n){var r=t("global")
try{e.exports="XMLHttpRequest"in r&&"withCredentials"in new r.XMLHttpRequest}catch(o){e.exports=!1}},{global:39}],39:[function(t,e,n){e.exports=function(){return this}()},{}],40:[function(t,e,n){var r=[].indexOf
e.exports=function(t,e){if(r)return t.indexOf(e)
for(var n=0;n<t.length;++n)if(t[n]===e)return n
return-1}},{}],41:[function(t,e,n){var r=Object.prototype.hasOwnProperty
n.keys=Object.keys||function(t){var e=[]
for(var n in t)r.call(t,n)&&e.push(n)
return e},n.values=function(t){var e=[]
for(var n in t)r.call(t,n)&&e.push(t[n])
return e},n.merge=function(t,e){for(var n in e)r.call(e,n)&&(t[n]=e[n])
return t},n.length=function(t){return n.keys(t).length},n.isEmpty=function(t){return 0==n.length(t)}},{}],42:[function(t,e,n){var r=/^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,o=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"]
e.exports=function(t){for(var e=r.exec(t||""),n={},i=14;i--;)n[o[i]]=e[i]||""
return n}},{}],43:[function(t,e,n){(function(e){var r=t("isarray"),o=t("./is-buffer")
n.deconstructPacket=function(t){function e(t){if(!t)return t
if(o(t)){var i={_placeholder:!0,num:n.length}
return n.push(t),i}if(r(t)){for(var s=new Array(t.length),a=0;a<t.length;a++)s[a]=e(t[a])
return s}if("object"==typeof t&&!(t instanceof Date)){var s={}
for(var c in t)s[c]=e(t[c])
return s}return t}var n=[],i=t.data,s=t
return s.data=e(i),s.attachments=n.length,{packet:s,buffers:n}},n.reconstructPacket=function(t,e){function n(t){if(t&&t._placeholder){var o=e[t.num]
return o}if(r(t)){for(var i=0;i<t.length;i++)t[i]=n(t[i])
return t}if(t&&"object"==typeof t){for(var s in t)t[s]=n(t[s])
return t}return t}return t.data=n(t.data),t.attachments=void 0,t},n.removeBlobs=function(t,n){function i(t,c,p){if(!t)return t
if(e.Blob&&t instanceof Blob||e.File&&t instanceof File){s++
var u=new FileReader
u.onload=function(){p?p[c]=this.result:a=this.result,--s||n(a)},u.readAsArrayBuffer(t)}else if(r(t))for(var f=0;f<t.length;f++)i(t[f],f,t)
else if(t&&"object"==typeof t&&!o(t))for(var h in t)i(t[h],h,t)}var s=0,a=t
i(a),s||n(a)}}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./is-buffer":45,isarray:46}],44:[function(t,e,n){function r(){}function o(t){var e="",r=!1
return e+=t.type,n.BINARY_EVENT!=t.type&&n.BINARY_ACK!=t.type||(e+=t.attachments,e+="-"),t.nsp&&"/"!=t.nsp&&(r=!0,e+=t.nsp),null!=t.id&&(r&&(e+=",",r=!1),e+=t.id),null!=t.data&&(r&&(e+=","),e+=f.stringify(t.data)),u("encoded %j as %s",t,e),e}function i(t,e){function n(t){var n=l.deconstructPacket(t),r=o(n.packet),i=n.buffers
i.unshift(r),e(i)}l.removeBlobs(t,n)}function s(){this.reconstructor=null}function a(t){var e={},r=0
if(e.type=Number(t.charAt(0)),null==n.types[e.type])return p()
if(n.BINARY_EVENT==e.type||n.BINARY_ACK==e.type){for(var o="";"-"!=t.charAt(++r)&&(o+=t.charAt(r),r!=t.length););if(o!=Number(o)||"-"!=t.charAt(r))throw new Error("Illegal attachments")
e.attachments=Number(o)}if("/"==t.charAt(r+1))for(e.nsp="";++r;){var i=t.charAt(r)
if(","==i)break
if(e.nsp+=i,r==t.length)break}else e.nsp="/"
var s=t.charAt(r+1)
if(""!==s&&Number(s)==s){for(e.id="";++r;){var i=t.charAt(r)
if(null==i||Number(i)!=i){--r
break}if(e.id+=t.charAt(r),r==t.length)break}e.id=Number(e.id)}if(t.charAt(++r))try{e.data=f.parse(t.substr(r))}catch(a){return p()}return u("decoded %s as %j",t,e),e}function c(t){this.reconPack=t,this.buffers=[]}function p(t){return{type:n.ERROR,data:"parser error"}}var u=t("debug")("socket.io-parser"),f=t("json3"),h=(t("isarray"),t("component-emitter")),l=t("./binary"),d=t("./is-buffer")
n.protocol=4,n.types=["CONNECT","DISCONNECT","EVENT","BINARY_EVENT","ACK","BINARY_ACK","ERROR"],n.CONNECT=0,n.DISCONNECT=1,n.EVENT=2,n.ACK=3,n.ERROR=4,n.BINARY_EVENT=5,n.BINARY_ACK=6,n.Encoder=r,n.Decoder=s,r.prototype.encode=function(t,e){if(u("encoding packet %j",t),n.BINARY_EVENT==t.type||n.BINARY_ACK==t.type)i(t,e)
else{var r=o(t)
e([r])}},h(s.prototype),s.prototype.add=function(t){var e
if("string"==typeof t)e=a(t),n.BINARY_EVENT==e.type||n.BINARY_ACK==e.type?(this.reconstructor=new c(e),0===this.reconstructor.reconPack.attachments&&this.emit("decoded",e)):this.emit("decoded",e)
else{if(!d(t)&&!t.base64)throw new Error("Unknown type: "+t)
if(!this.reconstructor)throw new Error("got binary data when not reconstructing a packet")
e=this.reconstructor.takeBinaryData(t),e&&(this.reconstructor=null,this.emit("decoded",e))}},s.prototype.destroy=function(){this.reconstructor&&this.reconstructor.finishedReconstruction()},c.prototype.takeBinaryData=function(t){if(this.buffers.push(t),this.buffers.length==this.reconPack.attachments){var e=l.reconstructPacket(this.reconPack,this.buffers)
return this.finishedReconstruction(),e}return null},c.prototype.finishedReconstruction=function(){this.reconPack=null,this.buffers=[]}},{"./binary":43,"./is-buffer":45,"component-emitter":9,debug:10,isarray:46,json3:47}],45:[function(t,e,n){(function(t){function n(e){return t.Buffer&&t.Buffer.isBuffer(e)||t.ArrayBuffer&&e instanceof ArrayBuffer}e.exports=n}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],46:[function(t,e,n){e.exports=t(37)},{}],47:[function(e,n,r){!function(e){function n(t){if(n[t]!==s)return n[t]
var e
if("bug-string-char-index"==t)e="a"!="a"[0]
else if("json"==t)e=n("json-stringify")&&n("json-parse")
else{var r,o='{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}'
if("json-stringify"==t){var i=u.stringify,c="function"==typeof i&&f
if(c){(r=function(){return 1}).toJSON=r
try{c="0"===i(0)&&"0"===i(new Number)&&'""'==i(new String)&&i(a)===s&&i(s)===s&&i()===s&&"1"===i(r)&&"[1]"==i([r])&&"[null]"==i([s])&&"null"==i(null)&&"[null,null,null]"==i([s,a,null])&&i({a:[r,!0,!1,null,"\x00\b\n\f\r	"]})==o&&"1"===i(null,r)&&"[\n 1,\n 2\n]"==i([1,2],null,1)&&'"-271821-04-20T00:00:00.000Z"'==i(new Date(-864e13))&&'"+275760-09-13T00:00:00.000Z"'==i(new Date(864e13))&&'"-000001-01-01T00:00:00.000Z"'==i(new Date(-621987552e5))&&'"1969-12-31T23:59:59.999Z"'==i(new Date(-1))}catch(p){c=!1}}e=c}if("json-parse"==t){var h=u.parse
if("function"==typeof h)try{if(0===h("0")&&!h(!1)){r=h(o)
var l=5==r.a.length&&1===r.a[0]
if(l){try{l=!h('"	"')}catch(p){}if(l)try{l=1!==h("01")}catch(p){}if(l)try{l=1!==h("1.")}catch(p){}}}}catch(p){l=!1}e=l}}return n[t]=!!e}var o,i,s,a={}.toString,c="function"==typeof t&&t.amd,p="object"==typeof JSON&&JSON,u="object"==typeof r&&r&&!r.nodeType&&r
u&&p?(u.stringify=p.stringify,u.parse=p.parse):u=e.JSON=p||{}
var f=new Date(-0xc782b5b800cec)
try{f=-109252==f.getUTCFullYear()&&0===f.getUTCMonth()&&1===f.getUTCDate()&&10==f.getUTCHours()&&37==f.getUTCMinutes()&&6==f.getUTCSeconds()&&708==f.getUTCMilliseconds()}catch(h){}if(!n("json")){var l="[object Function]",d="[object Date]",y="[object Number]",g="[object String]",m="[object Array]",v="[object Boolean]",b=n("bug-string-char-index")
if(!f)var w=Math.floor,k=[0,31,59,90,120,151,181,212,243,273,304,334],x=function(t,e){return k[e]+365*(t-1970)+w((t-1969+(e=+(e>1)))/4)-w((t-1901+e)/100)+w((t-1601+e)/400)};(o={}.hasOwnProperty)||(o=function(t){var e,n={}
return(n.__proto__=null,n.__proto__={toString:1},n).toString!=a?o=function(t){var e=this.__proto__,n=t in(this.__proto__=null,this)
return this.__proto__=e,n}:(e=n.constructor,o=function(t){var n=(this.constructor||e).prototype
return t in this&&!(t in n&&this[t]===n[t])}),n=null,o.call(this,t)})
var A={"boolean":1,number:1,string:1,undefined:1},B=function(t,e){var n=typeof t[e]
return"object"==n?!!t[e]:!A[n]}
if(i=function(t,e){var n,r,s,c=0;(n=function(){this.valueOf=0}).prototype.valueOf=0,r=new n
for(s in r)o.call(r,s)&&c++
return n=r=null,c?i=2==c?function(t,e){var n,r={},i=a.call(t)==l
for(n in t)i&&"prototype"==n||o.call(r,n)||!(r[n]=1)||!o.call(t,n)||e(n)}:function(t,e){var n,r,i=a.call(t)==l
for(n in t)i&&"prototype"==n||!o.call(t,n)||(r="constructor"===n)||e(n);(r||o.call(t,n="constructor"))&&e(n)}:(r=["valueOf","toString","toLocaleString","propertyIsEnumerable","isPrototypeOf","hasOwnProperty","constructor"],i=function(t,e){var n,i,s=a.call(t)==l,c=!s&&"function"!=typeof t.constructor&&B(t,"hasOwnProperty")?t.hasOwnProperty:o
for(n in t)s&&"prototype"==n||!c.call(t,n)||e(n)
for(i=r.length;n=r[--i];c.call(t,n)&&e(n));}),i(t,e)},!n("json-stringify")){var C={92:"\\\\",34:'\\"',8:"\\b",12:"\\f",10:"\\n",13:"\\r",9:"\\t"},S="000000",E=function(t,e){return(S+(e||0)).slice(-t)},T="\\u00",j=function(t){var e,n='"',r=0,o=t.length,i=o>10&&b
for(i&&(e=t.split(""));o>r;r++){var s=t.charCodeAt(r)
switch(s){case 8:case 9:case 10:case 12:case 13:case 34:case 92:n+=C[s]
break
default:if(32>s){n+=T+E(2,s.toString(16))
break}n+=i?e[r]:b?t.charAt(r):t[r]}}return n+'"'},_=function(t,e,n,r,c,p,u){var f,h,l,b,k,A,B,C,S,T,P,R,N,O,U,q
try{f=e[t]}catch(D){}if("object"==typeof f&&f)if(h=a.call(f),h!=d||o.call(f,"toJSON"))"function"==typeof f.toJSON&&(h!=y&&h!=g&&h!=m||o.call(f,"toJSON"))&&(f=f.toJSON(t))
else if(f>-1/0&&1/0>f){if(x){for(k=w(f/864e5),l=w(k/365.2425)+1970-1;x(l+1,0)<=k;l++);for(b=w((k-x(l,0))/30.42);x(l,b+1)<=k;b++);k=1+k-x(l,b),A=(f%864e5+864e5)%864e5,B=w(A/36e5)%24,C=w(A/6e4)%60,S=w(A/1e3)%60,T=A%1e3}else l=f.getUTCFullYear(),b=f.getUTCMonth(),k=f.getUTCDate(),B=f.getUTCHours(),C=f.getUTCMinutes(),S=f.getUTCSeconds(),T=f.getUTCMilliseconds()
f=(0>=l||l>=1e4?(0>l?"-":"+")+E(6,0>l?-l:l):E(4,l))+"-"+E(2,b+1)+"-"+E(2,k)+"T"+E(2,B)+":"+E(2,C)+":"+E(2,S)+"."+E(3,T)+"Z"}else f=null
if(n&&(f=n.call(e,t,f)),null===f)return"null"
if(h=a.call(f),h==v)return""+f
if(h==y)return f>-1/0&&1/0>f?""+f:"null"
if(h==g)return j(""+f)
if("object"==typeof f){for(O=u.length;O--;)if(u[O]===f)throw TypeError()
if(u.push(f),P=[],U=p,p+=c,h==m){for(N=0,O=f.length;O>N;N++)R=_(N,f,n,r,c,p,u),P.push(R===s?"null":R)
q=P.length?c?"[\n"+p+P.join(",\n"+p)+"\n"+U+"]":"["+P.join(",")+"]":"[]"}else i(r||f,function(t){var e=_(t,f,n,r,c,p,u)
e!==s&&P.push(j(t)+":"+(c?" ":"")+e)}),q=P.length?c?"{\n"+p+P.join(",\n"+p)+"\n"+U+"}":"{"+P.join(",")+"}":"{}"
return u.pop(),q}}
u.stringify=function(t,e,n){var r,o,i,s
if("function"==typeof e||"object"==typeof e&&e)if((s=a.call(e))==l)o=e
else if(s==m){i={}
for(var c,p=0,u=e.length;u>p;c=e[p++],s=a.call(c),(s==g||s==y)&&(i[c]=1));}if(n)if((s=a.call(n))==y){if((n-=n%1)>0)for(r="",n>10&&(n=10);r.length<n;r+=" ");}else s==g&&(r=n.length<=10?n:n.slice(0,10))
return _("",(c={},c[""]=t,c),o,i,r,"",[])}}if(!n("json-parse")){var P,R,N=String.fromCharCode,O={92:"\\",34:'"',47:"/",98:"\b",116:"	",110:"\n",102:"\f",114:"\r"},U=function(){throw P=R=null,SyntaxError()},q=function(){for(var t,e,n,r,o,i=R,s=i.length;s>P;)switch(o=i.charCodeAt(P)){case 9:case 10:case 13:case 32:P++
break
case 123:case 125:case 91:case 93:case 58:case 44:return t=b?i.charAt(P):i[P],P++,t
case 34:for(t="@",P++;s>P;)if(o=i.charCodeAt(P),32>o)U()
else if(92==o)switch(o=i.charCodeAt(++P)){case 92:case 34:case 47:case 98:case 116:case 110:case 102:case 114:t+=O[o],P++
break
case 117:for(e=++P,n=P+4;n>P;P++)o=i.charCodeAt(P),o>=48&&57>=o||o>=97&&102>=o||o>=65&&70>=o||U()
t+=N("0x"+i.slice(e,P))
break
default:U()}else{if(34==o)break
for(o=i.charCodeAt(P),e=P;o>=32&&92!=o&&34!=o;)o=i.charCodeAt(++P)
t+=i.slice(e,P)}if(34==i.charCodeAt(P))return P++,t
U()
default:if(e=P,45==o&&(r=!0,o=i.charCodeAt(++P)),o>=48&&57>=o){for(48==o&&(o=i.charCodeAt(P+1),o>=48&&57>=o)&&U(),r=!1;s>P&&(o=i.charCodeAt(P),o>=48&&57>=o);P++);if(46==i.charCodeAt(P)){for(n=++P;s>n&&(o=i.charCodeAt(n),o>=48&&57>=o);n++);n==P&&U(),P=n}if(o=i.charCodeAt(P),101==o||69==o){for(o=i.charCodeAt(++P),43!=o&&45!=o||P++,n=P;s>n&&(o=i.charCodeAt(n),o>=48&&57>=o);n++);n==P&&U(),P=n}return+i.slice(e,P)}if(r&&U(),"true"==i.slice(P,P+4))return P+=4,!0
if("false"==i.slice(P,P+5))return P+=5,!1
if("null"==i.slice(P,P+4))return P+=4,null
U()}return"$"},D=function(t){var e,n
if("$"==t&&U(),"string"==typeof t){if("@"==(b?t.charAt(0):t[0]))return t.slice(1)
if("["==t){for(e=[];t=q(),"]"!=t;n||(n=!0))n&&(","==t?(t=q(),"]"==t&&U()):U()),","==t&&U(),e.push(D(t))
return e}if("{"==t){for(e={};t=q(),"}"!=t;n||(n=!0))n&&(","==t?(t=q(),"}"==t&&U()):U()),","!=t&&"string"==typeof t&&"@"==(b?t.charAt(0):t[0])&&":"==q()||U(),e[t.slice(1)]=D(q())
return e}U()}return t},I=function(t,e,n){var r=L(t,e,n)
r===s?delete t[e]:t[e]=r},L=function(t,e,n){var r,o=t[e]
if("object"==typeof o&&o)if(a.call(o)==m)for(r=o.length;r--;)I(o,r,n)
else i(o,function(t){I(o,t,n)})
return n.call(t,e,o)}
u.parse=function(t,e){var n,r
return P=0,R=""+t,n=D(q()),"$"!=q()&&U(),P=R=null,e&&a.call(e)==l?L((r={},r[""]=n,r),"",e):n}}}c&&t(function(){return u})}(this)},{}],48:[function(t,e,n){function r(t,e){var n=[]
e=e||0
for(var r=e||0;r<t.length;r++)n[r-e]=t[r]
return n}e.exports=r},{}]},{},[1])(1)})

/*! TableSorter (FORK) v2.24.6 */
!function(e){"use strict"
var t=e.tablesorter={version:"2.24.6",parsers:[],widgets:[],defaults:{theme:"default",widthFixed:!1,showProcessing:!1,headerTemplate:"{content}",onRenderTemplate:null,onRenderHeader:null,cancelSelection:!0,tabIndex:!0,dateFormat:"mmddyyyy",sortMultiSortKey:"shiftKey",sortResetKey:"ctrlKey",usNumberFormat:!0,delayInit:!1,serverSideSorting:!1,resort:!0,headers:{},ignoreCase:!0,sortForce:null,sortList:[],sortAppend:null,sortStable:!1,sortInitialOrder:"asc",sortLocaleCompare:!1,sortReset:!1,sortRestart:!1,emptyTo:"bottom",stringTo:"max",textExtraction:"basic",textAttribute:"data-text",textSorter:null,numberSorter:null,widgets:[],widgetOptions:{zebra:["even","odd"]},initWidgets:!0,widgetClass:"widget-{name}",initialized:null,tableClass:"",cssAsc:"",cssDesc:"",cssNone:"",cssHeader:"",cssHeaderRow:"",cssProcessing:"",cssChildRow:"tablesorter-childRow",cssInfoBlock:"tablesorter-infoOnly",cssNoSort:"tablesorter-noSort",cssIgnoreRow:"tablesorter-ignoreRow",cssIcon:"tablesorter-icon",cssIconNone:"",cssIconAsc:"",cssIconDesc:"",pointerClick:"click",pointerDown:"mousedown",pointerUp:"mouseup",selectorHeaders:"> thead th, > thead td",selectorSort:"th, td",selectorRemove:".remove-me",debug:!1,headerList:[],empties:{},strings:{},parsers:[]},css:{table:"tablesorter",cssHasChild:"tablesorter-hasChildRow",childRow:"tablesorter-childRow",colgroup:"tablesorter-colgroup",header:"tablesorter-header",headerRow:"tablesorter-headerRow",headerIn:"tablesorter-header-inner",icon:"tablesorter-icon",processing:"tablesorter-processing",sortAsc:"tablesorter-headerAsc",sortDesc:"tablesorter-headerDesc",sortNone:"tablesorter-headerUnSorted"},language:{sortAsc:"Ascending sort applied, ",sortDesc:"Descending sort applied, ",sortNone:"No sort applied, ",sortDisabled:"sorting is disabled",nextAsc:"activate to apply an ascending sort",nextDesc:"activate to apply a descending sort",nextNone:"activate to remove the sort"},regex:{templateContent:/\{content\}/g,templateIcon:/\{icon\}/g,templateName:/\{name\}/i,spaces:/\s+/g,nonWord:/\W/g,formElements:/(input|select|button|textarea)/i,chunk:/(^([+\-]?(?:\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?)?$|^0x[0-9a-f]+$|\d+)/gi,chunks:/(^\\0|\\0$)/,hex:/^0x[0-9a-f]+$/i,comma:/,/g,digitNonUS:/[\s|\.]/g,digitNegativeTest:/^\s*\([.\d]+\)/,digitNegativeReplace:/^\s*\(([.\d]+)\)/,digitTest:/^[\-+(]?\d+[)]?$/,digitReplace:/[,.'"\s]/g},string:{max:1,min:-1,emptymin:1,emptymax:-1,zero:0,none:0,"null":0,top:!0,bottom:!1},dates:{},instanceMethods:{},setup:function(r,s){if(!r||!r.tHead||0===r.tBodies.length||r.hasInitialized===!0)return void(s.debug&&(r.hasInitialized?console.warn("Stopping initialization. Tablesorter has already been initialized"):console.error("Stopping initialization! No table, thead or tbody")))
var a="",o=e(r),n=e.metadata
r.hasInitialized=!1,r.isProcessing=!0,r.config=s,e.data(r,"tablesorter",s),s.debug&&(console[console.group?"group":"log"]("Initializing tablesorter"),e.data(r,"startoveralltimer",new Date)),s.supportsDataObject=function(e){return e[0]=parseInt(e[0],10),e[0]>1||1===e[0]&&parseInt(e[1],10)>=4}(e.fn.jquery.split(".")),s.emptyTo=s.emptyTo.toLowerCase(),s.stringTo=s.stringTo.toLowerCase(),s.last={sortList:[],clickedIndex:-1},/tablesorter\-/.test(o.attr("class"))||(a=""!==s.theme?" tablesorter-"+s.theme:""),s.table=r,s.$table=o.addClass(t.css.table+" "+s.tableClass+a).attr("role","grid"),s.$headers=o.find(s.selectorHeaders),s.namespace?s.namespace="."+s.namespace.replace(t.regex.nonWord,""):s.namespace=".tablesorter"+Math.random().toString(16).slice(2),s.$table.children().children("tr").attr("role","row"),s.$tbodies=o.children("tbody:not(."+s.cssInfoBlock+")").attr({"aria-live":"polite","aria-relevant":"all"}),s.$table.children("caption").length&&(a=s.$table.children("caption")[0],a.id||(a.id=s.namespace.slice(1)+"caption"),s.$table.attr("aria-labelledby",a.id)),s.widgetInit={},s.textExtraction=s.$table.attr("data-text-extraction")||s.textExtraction||"basic",t.buildHeaders(s),t.fixColumnWidth(r),t.addWidgetFromClass(r),t.applyWidgetOptions(r),t.setupParsers(s),s.totalRows=0,s.delayInit||t.buildCache(s),t.bindEvents(r,s.$headers,!0),t.bindMethods(s),s.supportsDataObject&&"undefined"!=typeof o.data().sortlist?s.sortList=o.data().sortlist:n&&o.metadata()&&o.metadata().sortlist&&(s.sortList=o.metadata().sortlist),t.applyWidget(r,!0),s.sortList.length>0?t.sortOn(s,s.sortList,{},!s.initWidgets):(t.setHeadersCss(s),s.initWidgets&&t.applyWidget(r,!1)),s.showProcessing&&o.unbind("sortBegin"+s.namespace+" sortEnd"+s.namespace).bind("sortBegin"+s.namespace+" sortEnd"+s.namespace,function(e){clearTimeout(s.timerProcessing),t.isProcessing(r),"sortBegin"===e.type&&(s.timerProcessing=setTimeout(function(){t.isProcessing(r,!0)},500))}),r.hasInitialized=!0,r.isProcessing=!1,s.debug&&(console.log("Overall initialization time: "+t.benchmark(e.data(r,"startoveralltimer"))),s.debug&&console.groupEnd&&console.groupEnd()),o.trigger("tablesorter-initialized",r),"function"==typeof s.initialized&&s.initialized(r)},bindMethods:function(r){var s=r.$table,a=r.namespace,o="sortReset update updateRows updateAll updateHeaders addRows updateCell updateComplete sorton appendCache updateCache applyWidgetId applyWidgets refreshWidgets destroy mouseup mouseleave ".split(" ").join(a+" ")
s.unbind(o.replace(t.regex.spaces," ")).bind("sortReset"+a,function(e,r){e.stopPropagation(),t.sortReset(this.config,r)}).bind("updateAll"+a,function(e,r,s){e.stopPropagation(),t.updateAll(this.config,r,s)}).bind("update"+a+" updateRows"+a,function(e,r,s){e.stopPropagation(),t.update(this.config,r,s)}).bind("updateHeaders"+a,function(e,r){e.stopPropagation(),t.updateHeaders(this.config,r)}).bind("updateCell"+a,function(e,r,s,a){e.stopPropagation(),t.updateCell(this.config,r,s,a)}).bind("addRows"+a,function(e,r,s,a){e.stopPropagation(),t.addRows(this.config,r,s,a)}).bind("updateComplete"+a,function(){this.isUpdating=!1}).bind("sorton"+a,function(e,r,s,a){e.stopPropagation(),t.sortOn(this.config,r,s,a)}).bind("appendCache"+a,function(r,s,a){r.stopPropagation(),t.appendCache(this.config,a),e.isFunction(s)&&s(this)}).bind("updateCache"+a,function(e,r,s){e.stopPropagation(),t.updateCache(this.config,r,s)}).bind("applyWidgetId"+a,function(e,r){e.stopPropagation(),t.getWidgetById(r).format(this,this.config,this.config.widgetOptions)}).bind("applyWidgets"+a,function(e,r){e.stopPropagation(),t.applyWidget(this,r)}).bind("refreshWidgets"+a,function(e,r,s){e.stopPropagation(),t.refreshWidgets(this,r,s)}).bind("destroy"+a,function(e,r,s){e.stopPropagation(),t.destroy(this,r,s)}).bind("resetToLoadState"+a,function(s){s.stopPropagation(),t.removeWidget(this,!0,!1),r=e.extend(!0,t.defaults,r.originalSettings),this.hasInitialized=!1,t.setup(this,r)})},bindEvents:function(r,s,a){r=e(r)[0]
var o,n=r.config,i=n.namespace,d=null
a!==!0&&(s.addClass(i.slice(1)+"_extra_headers"),o=e.fn.closest?s.closest("table")[0]:s.parents("table")[0],o&&"TABLE"===o.nodeName&&o!==r&&e(o).addClass(i.slice(1)+"_extra_table")),o=(n.pointerDown+" "+n.pointerUp+" "+n.pointerClick+" sort keyup ").replace(t.regex.spaces," ").split(" ").join(i+" "),s.find(n.selectorSort).add(s.filter(n.selectorSort)).unbind(o).bind(o,function(r,a){var o,i,l,c=e(r.target),g=" "+r.type+" "
if(!(1!==(r.which||r.button)&&!g.match(" "+n.pointerClick+" | sort | keyup ")||" keyup "===g&&13!==r.which||g.match(" "+n.pointerClick+" ")&&"undefined"!=typeof r.which||g.match(" "+n.pointerUp+" ")&&d!==r.target&&a!==!0)){if(g.match(" "+n.pointerDown+" "))return d=r.target,l=c.jquery.split("."),void("1"===l[0]&&l[1]<4&&r.preventDefault())
if(d=null,t.regex.formElements.test(r.target.nodeName)||c.hasClass(n.cssNoSort)||c.parents("."+n.cssNoSort).length>0||c.parents("button").length>0)return!n.cancelSelection
n.delayInit&&t.isEmptyObject(n.cache)&&t.buildCache(n),o=e.fn.closest?e(this).closest("th, td"):/TH|TD/.test(this.nodeName)?e(this):e(this).parents("th, td"),l=s.index(o),n.last.clickedIndex=0>l?o.attr("data-column"):l,i=n.$headers[n.last.clickedIndex],i&&!i.sortDisabled&&t.initSort(n,i,r)}}),n.cancelSelection&&s.attr("unselectable","on").bind("selectstart",!1).css({"user-select":"none",MozUserSelect:"none"})},buildHeaders:function(r){var s,a,o,n
for(r.headerList=[],r.headerContent=[],r.sortVars=[],r.debug&&(o=new Date),r.columns=t.computeColumnIndex(r.$table.children("thead, tfoot").children("tr")),a=r.cssIcon?'<i class="'+(r.cssIcon===t.css.icon?t.css.icon:r.cssIcon+" "+t.css.icon)+'"></i>':"",r.$headers=e(e.map(r.$table.find(r.selectorHeaders),function(s,o){var n,i,d,l,c,g=e(s)
if(!g.parent().hasClass(r.cssIgnoreRow))return n=t.getColumnData(r.table,r.headers,o,!0),r.headerContent[o]=g.html(),""===r.headerTemplate||g.find("."+t.css.headerIn).length||(l=r.headerTemplate.replace(t.regex.templateContent,g.html()).replace(t.regex.templateIcon,g.find("."+t.css.icon).length?"":a),r.onRenderTemplate&&(i=r.onRenderTemplate.apply(g,[o,l]),i&&"string"==typeof i&&(l=i)),g.html('<div class="'+t.css.headerIn+'">'+l+"</div>")),r.onRenderHeader&&r.onRenderHeader.apply(g,[o,r,r.$table]),d=parseInt(g.attr("data-column"),10),s.column=d,c=t.getData(g,n,"sortInitialOrder")||r.sortInitialOrder,r.sortVars[d]={count:-1,order:t.formatSortingOrder(c)?[1,0,2]:[0,1,2],lockedOrder:!1},c=t.getData(g,n,"lockedOrder")||!1,"undefined"!=typeof c&&c!==!1&&(r.sortVars[d].lockedOrder=!0,r.sortVars[d].order=t.formatSortingOrder(c)?[1,1,1]:[0,0,0]),r.headerList[o]=s,g.addClass(t.css.header+" "+r.cssHeader).parent().addClass(t.css.headerRow+" "+r.cssHeaderRow).attr("role","row"),r.tabIndex&&g.attr("tabindex",0),s})),r.$headerIndexed=[],n=0;n<r.columns;n++)t.isEmptyObject(r.sortVars[n])&&(r.sortVars[n]={}),s=r.$headers.filter('[data-column="'+n+'"]'),r.$headerIndexed[n]=s.length?s.not(".sorter-false").length?s.not(".sorter-false").filter(":last"):s.filter(":last"):e()
r.$table.find(r.selectorHeaders).attr({scope:"col",role:"columnheader"}),t.updateHeader(r),r.debug&&(console.log("Built headers:"+t.benchmark(o)),console.log(r.$headers))},addInstanceMethods:function(r){e.extend(t.instanceMethods,r)},setupParsers:function(e,r){var s,a,o,n,i,d,l,c,g,p,u,f,h,m,b=e.table,y=0,x={}
if(e.$tbodies=e.$table.children("tbody:not(."+e.cssInfoBlock+")"),h="undefined"==typeof r?e.$tbodies:r,m=h.length,0===m)return e.debug?console.warn("Warning: *Empty table!* Not building a parser cache"):""
for(e.debug&&(f=new Date,console[console.group?"group":"log"]("Detecting parsers for each column")),a={extractors:[],parsers:[]};m>y;){if(s=h[y].rows,s.length)for(i=0,n=e.columns,d=0;n>d;d++)l=e.$headerIndexed[i],l&&l.length&&(c=t.getColumnData(b,e.headers,i),u=t.getParserById(t.getData(l,c,"extractor")),p=t.getParserById(t.getData(l,c,"sorter")),g="false"===t.getData(l,c,"parser"),e.empties[i]=(t.getData(l,c,"empty")||e.emptyTo||(e.emptyToBottom?"bottom":"top")).toLowerCase(),e.strings[i]=(t.getData(l,c,"string")||e.stringTo||"max").toLowerCase(),g&&(p=t.getParserById("no-parser")),u||(u=!1),p||(p=t.detectParserForColumn(e,s,-1,i)),e.debug&&(x["("+i+") "+l.text()]={parser:p.id,extractor:u?u.id:"none",string:e.strings[i],empty:e.empties[i]}),a.parsers[i]=p,a.extractors[i]=u,o=l[0].colSpan-1,o>0&&(i+=o,n+=o)),i++
y+=a.parsers.length?m:1}e.debug&&(t.isEmptyObject(x)?console.warn("  No parsers detected!"):console[console.table?"table":"log"](x),console.log("Completed detecting parsers"+t.benchmark(f)),console.groupEnd&&console.groupEnd()),e.parsers=a.parsers,e.extractors=a.extractors},addParser:function(e){var r,s=t.parsers.length,a=!0
for(r=0;s>r;r++)t.parsers[r].id.toLowerCase()===e.id.toLowerCase()&&(a=!1)
a&&t.parsers.push(e)},getParserById:function(e){if("false"==e)return!1
var r,s=t.parsers.length
for(r=0;s>r;r++)if(t.parsers[r].id.toLowerCase()===e.toString().toLowerCase())return t.parsers[r]
return!1},detectParserForColumn:function(r,s,a,o){for(var n,i,d,l=t.parsers.length,c=!1,g="",p=!0;""===g&&p;)a++,d=s[a],d&&50>a?d.className.indexOf(t.cssIgnoreRow)<0&&(c=s[a].cells[o],g=t.getElementText(r,c,o),i=e(c),r.debug&&console.log("Checking if value was empty on row "+a+", column: "+o+': "'+g+'"')):p=!1
for(;--l>=0;)if(n=t.parsers[l],n&&"text"!==n.id&&n.is&&n.is(g,r.table,c,i))return n
return t.getParserById("text")},getElementText:function(r,s,a){if(!s)return""
var o,n=r.textExtraction||"",i=s.jquery?s:e(s)
return"string"==typeof n?"basic"===n&&"undefined"!=typeof(o=i.attr(r.textAttribute))?e.trim(o):e.trim(s.textContent||i.text()):"function"==typeof n?e.trim(n(i[0],r.table,a)):"function"==typeof(o=t.getColumnData(r.table,n,a))?e.trim(o(i[0],r.table,a)):e.trim(i[0].textContent||i.text())},getParsedText:function(e,r,s,a){"undefined"==typeof a&&(a=t.getElementText(e,r,s))
var o=""+a,n=e.parsers[s],i=e.extractors[s]
return n&&(i&&"function"==typeof i.format&&(a=i.format(a,e.table,r,s)),o="no-parser"===n.id?"":n.format(""+a,e.table,r,s),e.ignoreCase&&"string"==typeof o&&(o=o.toLowerCase())),o},buildCache:function(r,s,a){var o,n,i,d,l,c,g,p,u,f,h,m,b,y,x,w,C,v,$,I,D=r.table,R=r.parsers
if(r.$tbodies=r.$table.children("tbody:not(."+r.cssInfoBlock+")"),g="undefined"==typeof a?r.$tbodies:a,r.cache={},r.totalRows=0,!R)return r.debug?console.warn("Warning: *Empty table!* Not building a cache"):""
for(r.debug&&(m=new Date),r.showProcessing&&t.isProcessing(D,!0),c=0;c<g.length;c++){for(w=[],o=r.cache[c]={normalized:[]},b=g[c]&&g[c].rows.length||0,d=0;b>d;++d)if(y={child:[],raw:[]},p=e(g[c].rows[d]),u=[],p.hasClass(r.cssChildRow)&&0!==d)for(I=o.normalized.length-1,x=o.normalized[I][r.columns],x.$row=x.$row.add(p),p.prev().hasClass(r.cssChildRow)||p.prev().addClass(t.css.cssHasChild),f=p.children("th, td"),I=x.child.length,x.child[I]=[],v=0,$=r.columns,l=0;$>l;l++)h=f[l],h&&(x.child[I][l]=t.getParsedText(r,h,l),C=f[l].colSpan-1,C>0&&(v+=C,$+=C)),v++
else{for(y.$row=p,y.order=d,v=0,$=r.columns,l=0;$>l;++l)h=p[0].cells[l],"undefined"==typeof R[v]?r.debug&&console.warn("No parser found for column "+l+"; cell:",h,"does it have a header?"):h&&(n=t.getElementText(r,h,v),y.raw[v]=n,i=t.getParsedText(r,h,v,n),u[v]=i,"numeric"===(R[v].type||"").toLowerCase()&&(w[v]=Math.max(Math.abs(i)||0,w[v]||0)),C=h.colSpan-1,C>0&&(v+=C,$+=C)),v++
u[r.columns]=y,o.normalized.push(u)}o.colMax=w,r.totalRows+=o.normalized.length}r.showProcessing&&t.isProcessing(D),r.debug&&console.log("Building cache for "+b+" rows"+t.benchmark(m)),e.isFunction(s)&&s(D)},getColumnText:function(r,s,a,o){r=e(r)[0]
var n,i,d,l,c,g,p,u,f,h,m="function"==typeof a,b="all"===s,y={raw:[],parsed:[],$cell:[]},x=r.config
if(!t.isEmptyObject(x)){for(c=x.$tbodies.length,n=0;c>n;n++)for(d=x.cache[n].normalized,g=d.length,i=0;g>i;i++)l=d[i],o&&!l[x.columns].$row.is(o)||(h=!0,u=b?l.slice(0,x.columns):l[s],l=l[x.columns],p=b?l.raw:l.raw[s],f=b?l.$row.children():l.$row.children().eq(s),m&&(h=a({tbodyIndex:n,rowIndex:i,parsed:u,raw:p,$row:l.$row,$cell:f})),h!==!1&&(y.parsed.push(u),y.raw.push(p),y.$cell.push(f)))
return y}x.debug&&console.warn("No cache found - aborting getColumnText function!")},setHeadersCss:function(r){var s,a,o,n=r.sortList,i=n.length,d=t.css.sortNone+" "+r.cssNone,l=[t.css.sortAsc+" "+r.cssAsc,t.css.sortDesc+" "+r.cssDesc],c=[r.cssIconAsc,r.cssIconDesc,r.cssIconNone],g=["ascending","descending"],p=r.$table.find("tfoot tr").children().add(e(r.namespace+"_extra_headers")).removeClass(l.join(" "))
for(r.$headers.removeClass(l.join(" ")).addClass(d).attr("aria-sort","none").find("."+t.css.icon).removeClass(c.join(" ")).addClass(c[2]),a=0;i>a;a++)if(2!==n[a][1]&&(s=r.$headers.filter(function(e){for(var s=!0,a=r.$headers.eq(e),o=parseInt(a.attr("data-column"),10),n=o+r.$headers[e].colSpan;n>o;o++)s=s?t.isValueInArray(o,r.sortList)>-1:!1
return s}),s=s.not(".sorter-false").filter('[data-column="'+n[a][0]+'"]'+(1===i?":last":"")),s.length)){for(o=0;o<s.length;o++)s[o].sortDisabled||s.eq(o).removeClass(d).addClass(l[n[a][1]]).attr("aria-sort",g[n[a][1]]).find("."+t.css.icon).removeClass(c[2]).addClass(c[n[a][1]])
p.length&&p.filter('[data-column="'+n[a][0]+'"]').removeClass(d).addClass(l[n[a][1]])}for(i=r.$headers.length,a=0;i>a;a++)t.setColumnAriaLabel(r,r.$headers.eq(a))},setColumnAriaLabel:function(r,s,a){if(s.length){var o=parseInt(s.attr("data-column"),10),n=s.hasClass(t.css.sortAsc)?"sortAsc":s.hasClass(t.css.sortDesc)?"sortDesc":"sortNone",i=e.trim(s.text())+": "+t.language[n]
s.hasClass("sorter-false")||a===!1?i+=t.language.sortDisabled:(a=r.sortVars[o].order[(r.sortVars[o].count+1)%(r.sortReset?3:2)],i+=t.language[0===a?"nextAsc":1===a?"nextDesc":"nextNone"]),s.attr("aria-label",i)}},updateHeader:function(e){var r,s,a,o,n=e.table,i=e.$headers.length
for(r=0;i>r;r++)a=e.$headers.eq(r),o=t.getColumnData(n,e.headers,r,!0),s="false"===t.getData(a,o,"sorter")||"false"===t.getData(a,o,"parser"),t.setColumnSort(e,a,s)},setColumnSort:function(e,t,r){var s=e.table.id
t[0].sortDisabled=r,t[r?"addClass":"removeClass"]("sorter-false").attr("aria-disabled",""+r),e.tabIndex&&(r?t.removeAttr("tabindex"):t.attr("tabindex","0")),s&&(r?t.removeAttr("aria-controls"):t.attr("aria-controls",s))},updateHeaderSortCount:function(t,r){var s,a,o,n,i,d,l,c,g=r||t.sortList,p=g.length
for(t.sortList=[],n=0;p>n;n++)if(l=g[n],s=parseInt(l[0],10),s<t.columns){switch(c=t.sortVars[s].order,a=(""+l[1]).match(/^(1|d|s|o|n)/),a=a?a[0]:""){case"1":case"d":a=1
break
case"s":a=i||0
break
case"o":d=c[(i||0)%(t.sortReset?3:2)],a=0===d?1:1===d?0:2
break
case"n":a=c[++t.sortVars[s].count%(t.sortReset?3:2)]
break
default:a=0}i=0===n?a:i,o=[s,parseInt(a,10)||0],t.sortList.push(o),a=e.inArray(o[1],c),t.sortVars[s].count=a>=0?a:o[1]%(t.sortReset?3:2)}},updateAll:function(e,r,s){var a=e.table
a.isUpdating=!0,t.refreshWidgets(a,!0,!0),t.buildHeaders(e),t.bindEvents(a,e.$headers,!0),t.bindMethods(e),t.commonUpdate(e,r,s)},update:function(e,r,s){var a=e.table
a.isUpdating=!0,t.updateHeader(e),t.commonUpdate(e,r,s)},updateHeaders:function(e,r){e.table.isUpdating=!0,t.buildHeaders(e),t.bindEvents(e.table,e.$headers,!0),t.resortComplete(e,r)},updateCell:function(r,s,a,o){r.table.isUpdating=!0,r.$table.find(r.selectorRemove).remove()
var n,i,d,l,c,g,p=r.$tbodies,u=e(s),f=p.index(e.fn.closest?u.closest("tbody"):u.parents("tbody").filter(":first")),h=r.cache[f],m=e.fn.closest?u.closest("tr"):u.parents("tr").filter(":first")
if(s=u[0],p.length&&f>=0){if(d=p.eq(f).find("tr").index(m),c=h.normalized[d],g=m[0].cells.length,g!==r.columns)for(l=0,n=!1,i=0;g>i;i++)n||m[0].cells[i]===s?n=!0:l+=m[0].cells[i].colSpan
else l=u.index()
n=t.getElementText(r,s,l),c[r.columns].raw[l]=n,n=t.getParsedText(r,s,l,n),c[l]=n,c[r.columns].$row=m,"numeric"===(r.parsers[l].type||"").toLowerCase()&&(h.colMax[l]=Math.max(Math.abs(n)||0,h.colMax[l]||0)),n="undefined"!==a?a:r.resort,n!==!1?t.checkResort(r,n,o):t.resortComplete(r,o)}},addRows:function(r,s,a,o){var n,i,d,l,c,g,p,u,f,h,m,b,y="string"==typeof s&&1===r.$tbodies.length&&/<tr/.test(s||""),x=r.table
if(y)s=e(s),r.$tbodies.append(s)
else if(!(s&&s instanceof jQuery&&(e.fn.closest?s.closest("table")[0]:s.parents("table")[0])===r.table))return r.debug&&console.error("addRows method requires (1) a jQuery selector reference to rows that have already been added to the table, or (2) row HTML string to be added to a table with only one tbody"),!1
if(x.isUpdating=!0,t.isEmptyObject(r.cache))t.updateHeader(r),t.commonUpdate(r,a,o)
else{for(c=s.filter("tr").attr("role","row").length,d=r.$tbodies.index(s.parents("tbody").filter(":first")),r.parsers&&r.parsers.length||t.setupParsers(r),l=0;c>l;l++){for(u=0,p=s[l].cells.length,h=[],f={child:[],raw:[],$row:s.eq(l),order:r.cache[d].normalized.length},g=0;p>g;g++)m=s[l].cells[g],n=t.getElementText(r,m,u),f.raw[u]=n,i=t.getParsedText(r,m,u,n),h[u]=i,"numeric"===(r.parsers[u].type||"").toLowerCase()&&(r.cache[d].colMax[u]=Math.max(Math.abs(i)||0,r.cache[d].colMax[u]||0)),b=m.colSpan-1,b>0&&(u+=b),u++
h[r.columns]=f,r.cache[d].normalized.push(h)}t.checkResort(r,a,o)}},updateCache:function(e,r,s){e.parsers&&e.parsers.length||t.setupParsers(e,s),t.buildCache(e,r,s)},appendCache:function(e,r){var s,a,o,n,i,d,l,c=e.table,g=e.widgetOptions,p=e.$tbodies,u=[],f=e.cache
if(t.isEmptyObject(f))return e.appender?e.appender(c,u):c.isUpdating?e.$table.trigger("updateComplete",c):""
for(e.debug&&(l=new Date),d=0;d<p.length;d++)if(o=p.eq(d),o.length){for(n=t.processTbody(c,o,!0),s=f[d].normalized,a=s.length,i=0;a>i;i++)u.push(s[i][e.columns].$row),e.appender&&(!e.pager||e.pager.removeRows&&g.pager_removeRows||e.pager.ajax)||n.append(s[i][e.columns].$row)
t.processTbody(c,n,!1)}e.appender&&e.appender(c,u),e.debug&&console.log("Rebuilt table"+t.benchmark(l)),r||e.appender||t.applyWidget(c),c.isUpdating&&e.$table.trigger("updateComplete",c)},commonUpdate:function(e,r,s){e.$table.find(e.selectorRemove).remove(),t.setupParsers(e),t.buildCache(e),t.checkResort(e,r,s)},initSort:function(r,s,a){if(r.table.isUpdating)return setTimeout(function(){t.initSort(r,s,a)},50)
var o,n,i,d,l,c,g,p=!a[r.sortMultiSortKey],u=r.table,f=r.$headers.length,h=parseInt(e(s).attr("data-column"),10),m=r.sortVars[h].order
if(r.$table.trigger("sortStart",u),r.sortVars[h].count=a[r.sortResetKey]?2:(r.sortVars[h].count+1)%(r.sortReset?3:2),r.sortRestart)for(i=0;f>i;i++)g=r.$headers.eq(i),c=parseInt(g.attr("data-column"),10),h!==c&&(p||g.hasClass(t.css.sortNone))&&(r.sortVars[c].count=-1)
if(p){if(r.sortList=[],r.last.sortList=[],null!==r.sortForce)for(o=r.sortForce,n=0;n<o.length;n++)o[n][0]!==h&&r.sortList.push(o[n])
if(d=m[r.sortVars[h].count],2>d&&(r.sortList.push([h,d]),s.colSpan>1))for(n=1;n<s.colSpan;n++)r.sortList.push([h+n,d]),r.sortVars[h+n].count=e.inArray(d,m)}else if(r.sortList=e.extend([],r.last.sortList),t.isValueInArray(h,r.sortList)>=0)for(n=0;n<r.sortList.length;n++)c=r.sortList[n],c[0]===h&&(c[1]=m[r.sortVars[h].count],2===c[1]&&(r.sortList.splice(n,1),r.sortVars[h].count=-1))
else if(d=m[r.sortVars[h].count],2>d&&(r.sortList.push([h,d]),s.colSpan>1))for(n=1;n<s.colSpan;n++)r.sortList.push([h+n,d]),r.sortVars[h+n].count=e.inArray(d,m)
if(r.last.sortList=e.extend([],r.sortList),r.sortList.length&&r.sortAppend&&(o=e.isArray(r.sortAppend)?r.sortAppend:r.sortAppend[r.sortList[0][0]],!t.isEmptyObject(o)))for(n=0;n<o.length;n++)if(o[n][0]!==h&&t.isValueInArray(o[n][0],r.sortList)<0){if(d=o[n][1],l=(""+d).match(/^(a|d|s|o|n)/))switch(c=r.sortList[0][1],l[0]){case"d":d=1
break
case"s":d=c
break
case"o":d=0===c?1:0
break
case"n":d=(c+1)%(r.sortReset?3:2)
break
default:d=0}r.sortList.push([o[n][0],d])}r.$table.trigger("sortBegin",u),setTimeout(function(){t.setHeadersCss(r),t.multisort(r),t.appendCache(r),r.$table.trigger("sortEnd",u)},1)},multisort:function(e){var r,s,a,o,n=e.table,i=0,d=e.textSorter||"",l=e.sortList,c=l.length,g=e.$tbodies.length
if(!e.serverSideSorting&&!t.isEmptyObject(e.cache)){for(e.debug&&(s=new Date),r=0;g>r;r++)a=e.cache[r].colMax,o=e.cache[r].normalized,o.sort(function(r,s){var o,g,p,u,f,h,m
for(o=0;c>o;o++){if(p=l[o][0],u=l[o][1],i=0===u,e.sortStable&&r[p]===s[p]&&1===c)return r[e.columns].order-s[e.columns].order
if(g=/n/i.test(t.getSortType(e.parsers,p)),g&&e.strings[p]?(g="boolean"==typeof t.string[e.strings[p]]?(i?1:-1)*(t.string[e.strings[p]]?-1:1):e.strings[p]?t.string[e.strings[p]]||0:0,f=e.numberSorter?e.numberSorter(r[p],s[p],i,a[p],n):t["sortNumeric"+(i?"Asc":"Desc")](r[p],s[p],g,a[p],p,e)):(h=i?r:s,m=i?s:r,f="function"==typeof d?d(h[p],m[p],i,p,n):"object"==typeof d&&d.hasOwnProperty(p)?d[p](h[p],m[p],i,p,n):t["sortNatural"+(i?"Asc":"Desc")](r[p],s[p],p,e)),f)return f}return r[e.columns].order-s[e.columns].order})
e.debug&&console.log("Applying sort "+l.toString()+t.benchmark(s))}},resortComplete:function(t,r){t.table.isUpdating&&t.$table.trigger("updateComplete",t.table),e.isFunction(r)&&r(t.table)},checkResort:function(r,s,a){var o=e.isArray(s)?s:r.sortList,n="undefined"==typeof s?r.resort:s
n===!1||r.serverSideSorting||r.table.isProcessing?(t.resortComplete(r,a),t.applyWidget(r.table,!1)):o.length?t.sortOn(r,o,function(){t.resortComplete(r,a)},!0):t.sortReset(r,function(){t.resortComplete(r,a),t.applyWidget(r.table,!1)})},sortOn:function(r,s,a,o){var n=r.table
r.$table.trigger("sortStart",n),t.updateHeaderSortCount(r,s),t.setHeadersCss(r),r.delayInit&&t.isEmptyObject(r.cache)&&t.buildCache(r),r.$table.trigger("sortBegin",n),t.multisort(r),t.appendCache(r,o),r.$table.trigger("sortEnd",n),t.applyWidget(n),e.isFunction(a)&&a(n)},sortReset:function(r,s){r.sortList=[],t.setHeadersCss(r),t.multisort(r),t.appendCache(r),e.isFunction(s)&&s(r.table)},getSortType:function(e,t){return e&&e[t]?e[t].type||"":""},formatSortingOrder:function(e){return/^d/i.test(e)||1===e},sortNatural:function(e,r){if(e===r)return 0
var s,a,o,n,i,d,l=t.regex
if(l.hex.test(r)){if(s=parseInt(e.match(l.hex),16),a=parseInt(r.match(l.hex),16),a>s)return-1
if(s>a)return 1}for(s=e.replace(l.chunk,"\\0$1\\0").replace(l.chunks,"").split("\\0"),a=r.replace(l.chunk,"\\0$1\\0").replace(l.chunks,"").split("\\0"),d=Math.max(s.length,a.length),i=0;d>i;i++){if(o=isNaN(s[i])?s[i]||0:parseFloat(s[i])||0,n=isNaN(a[i])?a[i]||0:parseFloat(a[i])||0,isNaN(o)!==isNaN(n))return isNaN(o)?1:-1
if(typeof o!=typeof n&&(o+="",n+=""),n>o)return-1
if(o>n)return 1}return 0},sortNaturalAsc:function(e,r,s,a){if(e===r)return 0
var o=t.string[a.empties[s]||a.emptyTo]
return""===e&&0!==o?"boolean"==typeof o?o?-1:1:-o||-1:""===r&&0!==o?"boolean"==typeof o?o?1:-1:o||1:t.sortNatural(e,r)},sortNaturalDesc:function(e,r,s,a){if(e===r)return 0
var o=t.string[a.empties[s]||a.emptyTo]
return""===e&&0!==o?"boolean"==typeof o?o?-1:1:o||1:""===r&&0!==o?"boolean"==typeof o?o?1:-1:-o||-1:t.sortNatural(r,e)},sortText:function(e,t){return e>t?1:t>e?-1:0},getTextValue:function(e,t,r){if(r){var s,a=e?e.length:0,o=r+t
for(s=0;a>s;s++)o+=e.charCodeAt(s)
return t*o}return 0},sortNumericAsc:function(e,r,s,a,o,n){if(e===r)return 0
var i=t.string[n.empties[o]||n.emptyTo]
return""===e&&0!==i?"boolean"==typeof i?i?-1:1:-i||-1:""===r&&0!==i?"boolean"==typeof i?i?1:-1:i||1:(isNaN(e)&&(e=t.getTextValue(e,s,a)),isNaN(r)&&(r=t.getTextValue(r,s,a)),e-r)},sortNumericDesc:function(e,r,s,a,o,n){if(e===r)return 0
var i=t.string[n.empties[o]||n.emptyTo]
return""===e&&0!==i?"boolean"==typeof i?i?-1:1:i||1:""===r&&0!==i?"boolean"==typeof i?i?1:-1:-i||-1:(isNaN(e)&&(e=t.getTextValue(e,s,a)),isNaN(r)&&(r=t.getTextValue(r,s,a)),r-e)},sortNumeric:function(e,t){return e-t},addWidget:function(e){t.widgets.push(e)},hasWidget:function(t,r){return t=e(t),t.length&&t[0].config&&t[0].config.widgetInit[r]||!1},getWidgetById:function(e){var r,s,a=t.widgets.length
for(r=0;a>r;r++)if(s=t.widgets[r],s&&s.id&&s.id.toLowerCase()===e.toLowerCase())return s},applyWidgetOptions:function(r){var s,a,o=r.config,n=o.widgets.length
if(n)for(s=0;n>s;s++)a=t.getWidgetById(o.widgets[s]),a&&a.options&&(o.widgetOptions=e.extend(!0,{},a.options,o.widgetOptions))},addWidgetFromClass:function(e){var r,s,a=e.config,o="\\s"+a.widgetClass.replace(t.regex.templateName,"([\\w-]+)")+"\\s",n=new RegExp(o,"g"),i=(" "+a.table.className+" ").match(n)
if(i)for(r=i.length,s=0;r>s;s++)a.widgets.push(i[s].replace(n,"$1"))},applyWidget:function(r,s,a){r=e(r)[0]
var o,n,i,d,l,c,g,p,u=r.config,f=[]
if(s===!1||!r.hasInitialized||!r.isApplyingWidgets&&!r.isUpdating){if(u.debug&&(g=new Date),t.addWidgetFromClass(r),clearTimeout(u.timerReady),u.widgets.length){for(r.isApplyingWidgets=!0,u.widgets=e.grep(u.widgets,function(t,r){return e.inArray(t,u.widgets)===r}),i=u.widgets||[],n=i.length,o=0;n>o;o++)d=t.getWidgetById(i[o]),d&&d.id&&(d.priority||(d.priority=10),f[o]=d)
for(f.sort(function(e,t){return e.priority<t.priority?-1:e.priority===t.priority?0:1}),n=f.length,u.debug&&console[console.group?"group":"log"]("Start "+(s?"initializing":"applying")+" widgets"),o=0;n>o;o++)d=f[o],d&&(l=d.id,c=!1,u.debug&&(p=new Date),!s&&u.widgetInit[l]||(u.widgetInit[l]=!0,r.hasInitialized&&t.applyWidgetOptions(r),"function"==typeof d.init&&(c=!0,u.debug&&console[console.group?"group":"log"]("Initializing "+l+" widget"),d.init(r,d,r.config,r.config.widgetOptions))),s||"function"!=typeof d.format||(c=!0,u.debug&&console[console.group?"group":"log"]("Updating "+l+" widget"),d.format(r,r.config,r.config.widgetOptions,!1)),u.debug&&c&&(console.log("Completed "+(s?"initializing ":"applying ")+l+" widget"+t.benchmark(p)),console.groupEnd&&console.groupEnd()))
u.debug&&console.groupEnd&&console.groupEnd(),s||"function"!=typeof a||a(r)}u.timerReady=setTimeout(function(){r.isApplyingWidgets=!1,e.data(r,"lastWidgetApplication",new Date),u.$table.trigger("tablesorter-ready")},10),u.debug&&(d=u.widgets.length,console.log("Completed "+(s===!0?"initializing ":"applying ")+d+" widget"+(1!==d?"s":"")+t.benchmark(g)))}},removeWidget:function(r,s,a){r=e(r)[0]
var o,n,i,d,l=r.config
if(s===!0)for(s=[],d=t.widgets.length,i=0;d>i;i++)n=t.widgets[i],n&&n.id&&s.push(n.id)
else s=(e.isArray(s)?s.join(","):s||"").toLowerCase().split(/[\s,]+/)
for(d=s.length,o=0;d>o;o++)n=t.getWidgetById(s[o]),i=e.inArray(s[o],l.widgets),n&&n.remove&&(l.debug&&console.log((a?"Refreshing":"Removing")+' "'+s[o]+'" widget'),n.remove(r,l,l.widgetOptions,a),l.widgetInit[s[o]]=!1),i>=0&&a!==!0&&l.widgets.splice(i,1)},refreshWidgets:function(r,s,a){r=e(r)[0]
var o,n,i=r.config,d=i.widgets,l=t.widgets,c=l.length,g=[],p=function(t){e(t).trigger("refreshComplete")}
for(o=0;c>o;o++)n=l[o],n&&n.id&&(s||e.inArray(n.id,d)<0)&&g.push(n.id)
t.removeWidget(r,g.join(","),!0),a!==!0?(t.applyWidget(r,s||!1,p),s&&t.applyWidget(r,!1,p)):p(r)},benchmark:function(e){return" ( "+((new Date).getTime()-e.getTime())+"ms )"},log:function(){console.log(arguments)},isEmptyObject:function(e){for(var t in e)return!1
return!0},isValueInArray:function(e,t){var r,s=t&&t.length||0
for(r=0;s>r;r++)if(t[r][0]===e)return r
return-1},formatFloat:function(r,s){if("string"!=typeof r||""===r)return r
var a,o=s&&s.config?s.config.usNumberFormat!==!1:"undefined"!=typeof s?s:!0
return r=o?r.replace(t.regex.comma,""):r.replace(t.regex.digitNonUS,"").replace(t.regex.comma,"."),t.regex.digitNegativeTest.test(r)&&(r=r.replace(t.regex.digitNegativeReplace,"-$1")),a=parseFloat(r),isNaN(a)?e.trim(r):a},isDigit:function(e){return isNaN(e)?t.regex.digitTest.test(e.toString().replace(t.regex.digitReplace,"")):""!==e},computeColumnIndex:function(t){var r,s,a,o,n,i,d,l,c,g,p,u,f=[],h=[]
for(r=0;r<t.length;r++)for(d=t[r].cells,s=0;s<d.length;s++){for(i=d[s],n=e(i),l=i.parentNode.rowIndex,c=l+"-"+n.index(),g=i.rowSpan||1,p=i.colSpan||1,"undefined"==typeof f[l]&&(f[l]=[]),a=0;a<f[l].length+1;a++)if("undefined"==typeof f[l][a]){u=a
break}for(i.setAttribute?i.setAttribute("data-column",u):n.attr("data-column",u),a=l;l+g>a;a++)for("undefined"==typeof f[a]&&(f[a]=[]),h=f[a],o=u;u+p>o;o++)h[o]="x"}return h.length},fixColumnWidth:function(r){r=e(r)[0]
var s,a,o,n,i,d=r.config,l=d.$table.children("colgroup")
if(l.length&&l.hasClass(t.css.colgroup)&&l.remove(),d.widthFixed&&0===d.$table.children("colgroup").length){for(l=e('<colgroup class="'+t.css.colgroup+'">'),s=d.$table.width(),o=d.$tbodies.find("tr:first").children(":visible"),n=o.length,i=0;n>i;i++)a=parseInt(o.eq(i).width()/s*1e3,10)/10+"%",l.append(e("<col>").css("width",a))
d.$table.prepend(l)}},getData:function(t,r,s){var a,o,n="",i=e(t)
return i.length?(a=e.metadata?i.metadata():!1,o=" "+(i.attr("class")||""),"undefined"!=typeof i.data(s)||"undefined"!=typeof i.data(s.toLowerCase())?n+=i.data(s)||i.data(s.toLowerCase()):a&&"undefined"!=typeof a[s]?n+=a[s]:r&&"undefined"!=typeof r[s]?n+=r[s]:" "!==o&&o.match(" "+s+"-")&&(n=o.match(new RegExp("\\s"+s+"-([\\w-]+)"))[1]||""),e.trim(n)):""},getColumnData:function(t,r,s,a,o){if("undefined"!=typeof r&&null!==r){t=e(t)[0]
var n,i,d=t.config,l=o||d.$headers,c=d.$headerIndexed&&d.$headerIndexed[s]||l.filter('[data-column="'+s+'"]:last')
if(r[s])return a?r[s]:r[l.index(c)]
for(i in r)if("string"==typeof i&&(n=c.filter(i).add(c.find(i)),n.length))return r[i]}},isProcessing:function(r,s,a){r=e(r)
var o=r[0].config,n=a||r.find("."+t.css.header)
s?("undefined"!=typeof a&&o.sortList.length>0&&(n=n.filter(function(){return this.sortDisabled?!1:t.isValueInArray(parseFloat(e(this).attr("data-column")),o.sortList)>=0})),r.add(n).addClass(t.css.processing+" "+o.cssProcessing)):r.add(n).removeClass(t.css.processing+" "+o.cssProcessing)},processTbody:function(t,r,s){if(t=e(t)[0],s)return t.isProcessing=!0,r.before('<colgroup class="tablesorter-savemyplace"/>'),e.fn.detach?r.detach():r.remove()
var a=e(t).find("colgroup.tablesorter-savemyplace")
r.insertAfter(a),a.remove(),t.isProcessing=!1},clearTableBody:function(t){e(t)[0].config.$tbodies.children().detach()},characterEquivalents:{a:"áàâãäąå",A:"ÁÀÂÃÄĄÅ",c:"çćč",C:"ÇĆČ",e:"éèêëěę",E:"ÉÈÊËĚĘ",i:"íìİîïı",I:"ÍÌİÎÏ",o:"óòôõöō",O:"ÓÒÔÕÖŌ",ss:"ß",SS:"ẞ",u:"úùûüů",U:"ÚÙÛÜŮ"},replaceAccents:function(e){var r,s="[",a=t.characterEquivalents
if(!t.characterRegex){t.characterRegexArray={}
for(r in a)"string"==typeof r&&(s+=a[r],t.characterRegexArray[r]=new RegExp("["+a[r]+"]","g"))
t.characterRegex=new RegExp(s+"]")}if(t.characterRegex.test(e))for(r in a)"string"==typeof r&&(e=e.replace(t.characterRegexArray[r],r))
return e},restoreHeaders:function(r){var s,a,o=e(r)[0].config,n=o.$table.find(o.selectorHeaders),i=n.length
for(s=0;i>s;s++)a=n.eq(s),a.find("."+t.css.headerIn).length&&a.html(o.headerContent[s])},destroy:function(r,s,a){if(r=e(r)[0],r.hasInitialized){t.removeWidget(r,!0,!1)
var o,n=e(r),i=r.config,d=i.debug,l=n.find("thead:first"),c=l.find("tr."+t.css.headerRow).removeClass(t.css.headerRow+" "+i.cssHeaderRow),g=n.find("tfoot:first > tr").children("th, td")
s===!1&&e.inArray("uitheme",i.widgets)>=0&&(n.trigger("applyWidgetId",["uitheme"]),n.trigger("applyWidgetId",["zebra"])),l.find("tr").not(c).remove(),o="sortReset update updateRows updateAll updateHeaders updateCell addRows updateComplete sorton appendCache updateCache applyWidgetId applyWidgets refreshWidgets destroy mouseup mouseleave keypress "+"sortBegin sortEnd resetToLoadState ".split(" ").join(i.namespace+" "),n.removeData("tablesorter").unbind(o.replace(t.regex.spaces," ")),i.$headers.add(g).removeClass([t.css.header,i.cssHeader,i.cssAsc,i.cssDesc,t.css.sortAsc,t.css.sortDesc,t.css.sortNone].join(" ")).removeAttr("data-column").removeAttr("aria-label").attr("aria-disabled","true"),c.find(i.selectorSort).unbind("mousedown mouseup keypress ".split(" ").join(i.namespace+" ").replace(t.regex.spaces," ")),t.restoreHeaders(r),n.toggleClass(t.css.table+" "+i.tableClass+" tablesorter-"+i.theme,s===!1),r.hasInitialized=!1,delete r.config.cache,"function"==typeof a&&a(r),d&&console.log("tablesorter has been removed")}}}
e.fn.tablesorter=function(r){return this.each(function(){var s=this,a=e.extend(!0,{},t.defaults,r,t.instanceMethods)
a.originalSettings=r,!s.hasInitialized&&t.buildTable&&"TABLE"!==this.nodeName?t.buildTable(s,a):t.setup(s,a)})},window.console&&window.console.log||(t.logs=[],console={},console.log=console.warn=console.error=console.table=function(){var e=arguments.length>1?arguments:arguments[0]
t.logs.push({date:Date.now(),log:e})}),t.addParser({id:"no-parser",is:function(){return!1},format:function(){return""},type:"text"}),t.addParser({id:"text",is:function(){return!0},format:function(r,s){var a=s.config
return r&&(r=e.trim(a.ignoreCase?r.toLocaleLowerCase():r),r=a.sortLocaleCompare?t.replaceAccents(r):r),r},type:"text"}),t.regex.nondigit=/[^\w,. \-()]/g,t.addParser({id:"digit",is:function(e){return t.isDigit(e)},format:function(r,s){var a=t.formatFloat((r||"").replace(t.regex.nondigit,""),s)
return r&&"number"==typeof a?a:r?e.trim(r&&s.config.ignoreCase?r.toLocaleLowerCase():r):r},type:"numeric"}),t.regex.currencyReplace=/[+\-,. ]/g,t.regex.currencyTest=/^\(?\d+[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]|[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]\d+\)?$/,t.addParser({id:"currency",is:function(e){return e=(e||"").replace(t.regex.currencyReplace,""),t.regex.currencyTest.test(e)},format:function(r,s){var a=t.formatFloat((r||"").replace(t.regex.nondigit,""),s)
return r&&"number"==typeof a?a:r?e.trim(r&&s.config.ignoreCase?r.toLocaleLowerCase():r):r},type:"numeric"}),t.regex.urlProtocolTest=/^(https?|ftp|file):\/\//,t.regex.urlProtocolReplace=/(https?|ftp|file):\/\//,t.addParser({id:"url",is:function(e){return t.regex.urlProtocolTest.test(e)},format:function(r){return r?e.trim(r.replace(t.regex.urlProtocolReplace,"")):r},parsed:!0,type:"text"}),t.regex.dash=/-/g,t.regex.isoDate=/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/,t.addParser({id:"isoDate",is:function(e){return t.regex.isoDate.test(e)},format:function(e,r){var s=e?new Date(e.replace(t.regex.dash,"/")):e
return s instanceof Date&&isFinite(s)?s.getTime():e},type:"numeric"}),t.regex.percent=/%/g,t.regex.percentTest=/(\d\s*?%|%\s*?\d)/,t.addParser({id:"percent",is:function(e){return t.regex.percentTest.test(e)&&e.length<15},format:function(e,r){return e?t.formatFloat(e.replace(t.regex.percent,""),r):e},type:"numeric"}),t.addParser({id:"image",is:function(e,t,r,s){return s.find("img").length>0},format:function(t,r,s){return e(s).find("img").attr(r.config.imgAttr||"alt")||t},parsed:!0,type:"text"}),t.regex.dateReplace=/(\S)([AP]M)$/i,t.regex.usLongDateTest1=/^[A-Z]{3,10}\.?\s+\d{1,2},?\s+(\d{4})(\s+\d{1,2}:\d{2}(:\d{2})?(\s+[AP]M)?)?$/i,t.regex.usLongDateTest2=/^\d{1,2}\s+[A-Z]{3,10}\s+\d{4}/i,t.addParser({id:"usLongDate",is:function(e){return t.regex.usLongDateTest1.test(e)||t.regex.usLongDateTest2.test(e)},format:function(e,r){var s=e?new Date(e.replace(t.regex.dateReplace,"$1 $2")):e
return s instanceof Date&&isFinite(s)?s.getTime():e},type:"numeric"}),t.regex.shortDateTest=/(^\d{1,2}[\/\s]\d{1,2}[\/\s]\d{4})|(^\d{4}[\/\s]\d{1,2}[\/\s]\d{1,2})/,t.regex.shortDateReplace=/[\-.,]/g,t.regex.shortDateXXY=/(\d{1,2})[\/\s](\d{1,2})[\/\s](\d{4})/,t.regex.shortDateYMD=/(\d{4})[\/\s](\d{1,2})[\/\s](\d{1,2})/,t.convertFormat=function(e,r){e=(e||"").replace(t.regex.spaces," ").replace(t.regex.shortDateReplace,"/"),"mmddyyyy"===r?e=e.replace(t.regex.shortDateXXY,"$3/$1/$2"):"ddmmyyyy"===r?e=e.replace(t.regex.shortDateXXY,"$3/$2/$1"):"yyyymmdd"===r&&(e=e.replace(t.regex.shortDateYMD,"$1/$2/$3"))
var s=new Date(e)
return s instanceof Date&&isFinite(s)?s.getTime():""},t.addParser({id:"shortDate",is:function(e){return e=(e||"").replace(t.regex.spaces," ").replace(t.regex.shortDateReplace,"/"),t.regex.shortDateTest.test(e)},format:function(e,r,s,a){if(e){var o=r.config,n=o.$headerIndexed[a],i=n.length&&n.data("dateFormat")||t.getData(n,t.getColumnData(r,o.headers,a),"dateFormat")||o.dateFormat
return n.length&&n.data("dateFormat",i),t.convertFormat(e,i)||e}return e},type:"numeric"}),t.regex.timeTest=/^([1-9]|1[0-2]):([0-5]\d)(\s[AP]M)|((?:[01]\d|[2][0-4]):[0-5]\d)$/i,t.regex.timeMatch=/([1-9]|1[0-2]):([0-5]\d)(\s[AP]M)|((?:[01]\d|[2][0-4]):[0-5]\d)/i,t.addParser({id:"time",is:function(e){return t.regex.timeTest.test(e)},format:function(e,r){var s,a=(e||"").match(t.regex.timeMatch),o=new Date(e),n=e&&(null!==a?a[0]:"00:00 AM"),i=n?new Date("2000/01/01 "+n.replace(t.regex.dateReplace,"$1 $2")):n
return i instanceof Date&&isFinite(i)?(s=o instanceof Date&&isFinite(o)?o.getTime():0,s?parseFloat(i.getTime()+"."+o.getTime()):i.getTime()):e},type:"numeric"}),t.addParser({id:"metadata",is:function(){return!1},format:function(t,r,s){var a=r.config,o=a.parserMetadataName?a.parserMetadataName:"sortValue"
return e(s).metadata()[o]},type:"numeric"}),t.addWidget({id:"zebra",priority:90,format:function(t,r,s){var a,o,n,i,d,l,c,g=new RegExp(r.cssChildRow,"i"),p=r.$tbodies.add(e(r.namespace+"_extra_table").children("tbody:not(."+r.cssInfoBlock+")"))
for(d=0;d<p.length;d++)for(n=0,a=p.eq(d).children("tr:visible").not(r.selectorRemove),c=a.length,l=0;c>l;l++)o=a.eq(l),g.test(o[0].className)||n++,i=n%2===0,o.removeClass(s.zebra[i?1:0]).addClass(s.zebra[i?0:1])},remove:function(e,r,s,a){if(!a){var o,n,i=r.$tbodies,d=(s.zebra||["even","odd"]).join(" ")
for(o=0;o<i.length;o++)n=t.processTbody(e,i.eq(o),!0),n.children().removeClass(d),t.processTbody(e,n,!1)}}})}(jQuery)

/*! Widget: stickyHeaders - updated 10/31/2015 (v2.24.0) */
!function(e,s){"use strict"
var t=e.tablesorter||{}
e.extend(t.css,{sticky:"tablesorter-stickyHeader",stickyVis:"tablesorter-sticky-visible",stickyHide:"tablesorter-sticky-hidden",stickyWrap:"tablesorter-sticky-wrapper"}),t.addHeaderResizeEvent=function(s,t,i){if(s=e(s)[0],s.config){var r={timer:250},a=e.extend({},r,i),d=s.config,l=d.widgetOptions,c=function(e){var s,t,i,r,a,c,n=d.$headers.length
for(l.resize_flag=!0,t=[],s=0;n>s;s++)i=d.$headers.eq(s),r=i.data("savedSizes")||[0,0],a=i[0].offsetWidth,c=i[0].offsetHeight,a===r[0]&&c===r[1]||(i.data("savedSizes",[a,c]),t.push(i[0]))
t.length&&e!==!1&&d.$table.trigger("resize",[t]),l.resize_flag=!1}
return c(!1),clearInterval(l.resize_timer),t?(l.resize_flag=!1,!1):void(l.resize_timer=setInterval(function(){l.resize_flag||c()},a.timer))}},t.addWidget({id:"stickyHeaders",priority:60,options:{stickyHeaders:"",stickyHeaders_attachTo:null,stickyHeaders_xScroll:null,stickyHeaders_yScroll:null,stickyHeaders_offset:0,stickyHeaders_filteredToTop:!0,stickyHeaders_cloneId:"-sticky",stickyHeaders_addResizeEvent:!0,stickyHeaders_includeCaption:!0,stickyHeaders_zIndex:2},format:function(i,r,a){if(!(r.$table.hasClass("hasStickyHeaders")||e.inArray("filter",r.widgets)>=0&&!r.$table.hasClass("hasFilters"))){var d,l,c,n,o=r.$table,f=e(a.stickyHeaders_attachTo),h=r.namespace+"stickyheaders ",p=e(a.stickyHeaders_yScroll||a.stickyHeaders_attachTo||s),y=e(a.stickyHeaders_xScroll||a.stickyHeaders_attachTo||s),k=o.children("thead:first"),g=k.children("tr").not(".sticky-false").children(),H=o.children("tfoot"),b=isNaN(a.stickyHeaders_offset)?e(a.stickyHeaders_offset):"",v=b.length?b.height()||0:parseInt(a.stickyHeaders_offset,10)||0,u=o.parent().closest("."+t.css.table).hasClass("hasStickyHeaders")?o.parent().closest("table.tablesorter")[0].config.widgetOptions.$sticky.parent():[],_=u.length?u.height():0,m=a.$sticky=o.clone().addClass("containsStickyHeaders "+t.css.sticky+" "+a.stickyHeaders+" "+r.namespace.slice(1)+"_extra_table").wrap('<div class="'+t.css.stickyWrap+'">'),z=m.parent().addClass(t.css.stickyHide).css({position:f.length?"absolute":"fixed",padding:parseInt(m.parent().parent().css("padding-left"),10),top:v+_,left:0,visibility:"hidden",zIndex:a.stickyHeaders_zIndex||2}),w=m.children("thead:first"),C="",S=0,x=function(e,t){var i,r,a,d,l,c=e.filter(":visible"),n=c.length
for(i=0;n>i;i++)d=t.filter(":visible").eq(i),l=c.eq(i),"border-box"===l.css("box-sizing")?r=l.outerWidth():"collapse"===d.css("border-collapse")?s.getComputedStyle?r=parseFloat(s.getComputedStyle(l[0],null).width):(a=parseFloat(l.css("border-width")),r=l.outerWidth()-parseFloat(l.css("padding-left"))-parseFloat(l.css("padding-right"))-a):r=l.width(),d.css({width:r,"min-width":r,"max-width":r})},$=function(){v=b.length?b.height()||0:parseInt(a.stickyHeaders_offset,10)||0,S=0,z.css({left:f.length?parseInt(f.css("padding-left"),10)||0:o.offset().left-parseInt(o.css("margin-left"),10)-y.scrollLeft()-S,width:o.outerWidth()}),x(o,m),x(g,n)},I=function(s){if(o.is(":visible")){_=u.length?u.offset().top-p.scrollTop()+u.height():0
var i=o.offset(),r=e.isWindow(p[0]),a=e.isWindow(y[0]),d=(f.length?r?p.scrollTop():p.offset().top:p.scrollTop())+v+_,l=o.height()-(z.height()+(H.height()||0)),c=d>i.top&&d<i.top+l?"visible":"hidden",n={visibility:c}
f.length&&(n.top=r?d-f.offset().top:f.scrollTop()),a&&(n.left=o.offset().left-parseInt(o.css("margin-left"),10)-y.scrollLeft()-S),u.length&&(n.top=(n.top||0)+v+_),z.removeClass(t.css.stickyVis+" "+t.css.stickyHide).addClass("visible"===c?t.css.stickyVis:t.css.stickyHide).css(n),(c!==C||s)&&($(),C=c)}}
if(f.length&&!f.css("position")&&f.css("position","relative"),m.attr("id")&&(m[0].id+=a.stickyHeaders_cloneId),m.find("thead:gt(0), tr.sticky-false").hide(),m.find("tbody, tfoot").remove(),m.find("caption").toggle(a.stickyHeaders_includeCaption),n=w.children().children(),m.css({height:0,width:0,margin:0}),n.find("."+t.css.resizer).remove(),o.addClass("hasStickyHeaders").bind("pagerComplete"+h,function(){$()}),t.bindEvents(i,w.children().children("."+t.css.header)),o.after(z),r.onRenderHeader)for(c=w.children("tr").children(),l=c.length,d=0;l>d;d++)r.onRenderHeader.apply(c.eq(d),[d,r,m])
y.add(p).unbind("scroll resize ".split(" ").join(h).replace(/\s+/g," ")).bind("scroll resize ".split(" ").join(h),function(e){I("resize"===e.type)}),r.$table.unbind("stickyHeadersUpdate"+h).bind("stickyHeadersUpdate"+h,function(){I(!0)}),a.stickyHeaders_addResizeEvent&&t.addHeaderResizeEvent(i),o.hasClass("hasFilters")&&a.filter_columnFilters&&(o.bind("filterEnd"+h,function(){var i=e(document.activeElement).closest("td"),d=i.parent().children().index(i)
z.hasClass(t.css.stickyVis)&&a.stickyHeaders_filteredToTop&&(s.scrollTo(0,o.position().top),d>=0&&r.$filters&&r.$filters.eq(d).find("a, select, input").filter(":visible").focus())}),t.filter.bindSearch(o,n.find("."+t.css.filter)),a.filter_hideFilters&&t.filter.hideFilters(r,m)),o.trigger("stickyHeadersInit")}},remove:function(i,r,a){var d=r.namespace+"stickyheaders "
r.$table.removeClass("hasStickyHeaders").unbind("pagerComplete filterEnd stickyHeadersUpdate ".split(" ").join(d).replace(/\s+/g," ")).next("."+t.css.stickyWrap).remove(),a.$sticky&&a.$sticky.length&&a.$sticky.remove(),e(s).add(a.stickyHeaders_xScroll).add(a.stickyHeaders_yScroll).add(a.stickyHeaders_attachTo).unbind("scroll resize ".split(" ").join(d).replace(/\s+/g," ")),t.addHeaderResizeEvent(i,!1)}})}(jQuery,window)

/**
 * @license MIT
 * @fileOverview Favico animations
 * @author Miroslav Magda, http://blog.ejci.net
 * @version 0.3.10
 */
!function(){var e=function(e){"use strict"
function t(e){if(e.paused||e.ended||g)return!1
try{f.clearRect(0,0,s,l),f.drawImage(e,0,0,s,l)}catch(o){}p=setTimeout(function(){t(e)},S.duration),O.setIcon(h)}function o(e){var t=/^#?([a-f\d])([a-f\d])([a-f\d])$/i
e=e.replace(t,function(e,t,o,n){return t+t+o+o+n+n})
var o=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e)
return o?{r:parseInt(o[1],16),g:parseInt(o[2],16),b:parseInt(o[3],16)}:!1}function n(e,t){var o,n={}
for(o in e)n[o]=e[o]
for(o in t)n[o]=t[o]
return n}function r(){return b.hidden||b.msHidden||b.webkitHidden||b.mozHidden}e=e?e:{}
var i,a,l,s,h,f,c,d,u,y,w,g,x,m,p,b,v={bgColor:"#d00",textColor:"#fff",fontFamily:"sans-serif",fontStyle:"bold",type:"circle",position:"down",animation:"slide",elementId:!1,dataUrl:!1,win:window}
x={},x.ff="undefined"!=typeof InstallTrigger,x.chrome=!!window.chrome,x.opera=!!window.opera||navigator.userAgent.indexOf("Opera")>=0,x.ie=!1,x.safari=Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor")>0,x.supported=x.chrome||x.ff||x.opera
var C=[]
w=function(){},d=g=!1
var E=function(){i=n(v,e),i.bgColor=o(i.bgColor),i.textColor=o(i.textColor),i.position=i.position.toLowerCase(),i.animation=S.types[""+i.animation]?i.animation:v.animation,b=i.win.document
var t=i.position.indexOf("up")>-1,r=i.position.indexOf("left")>-1
if(t||r)for(var d=0;d<S.types[""+i.animation].length;d++){var u=S.types[""+i.animation][d]
t&&(u.y=u.y<.6?u.y-.4:u.y-2*u.y+(1-u.w)),r&&(u.x=u.x<.6?u.x-.4:u.x-2*u.x+(1-u.h)),S.types[""+i.animation][d]=u}i.type=A[""+i.type]?i.type:v.type,a=O.getIcon(),h=document.createElement("canvas"),c=document.createElement("img"),a.hasAttribute("href")?(c.setAttribute("crossOrigin","anonymous"),c.onload=function(){l=c.height>0?c.height:32,s=c.width>0?c.width:32,h.height=l,h.width=s,f=h.getContext("2d"),M.ready()},c.setAttribute("src",a.getAttribute("href"))):(c.onload=function(){l=32,s=32,c.height=l,c.width=s,h.height=l,h.width=s,f=h.getContext("2d"),M.ready()},c.setAttribute("src",""))},M={}
M.ready=function(){d=!0,M.reset(),w()},M.reset=function(){d&&(C=[],u=!1,y=!1,f.clearRect(0,0,s,l),f.drawImage(c,0,0,s,l),O.setIcon(h),window.clearTimeout(m),window.clearTimeout(p))},M.start=function(){if(d&&!y){var e=function(){u=C[0],y=!1,C.length>0&&(C.shift(),M.start())}
if(C.length>0){y=!0
var t=function(){["type","animation","bgColor","textColor","fontFamily","fontStyle"].forEach(function(e){e in C[0].options&&(i[e]=C[0].options[e])}),S.run(C[0].options,function(){e()},!1)}
u?S.run(u.options,function(){t()},!0):t()}}}
var A={},I=function(e){return e.n="number"==typeof e.n?Math.abs(0|e.n):e.n,e.x=s*e.x,e.y=l*e.y,e.w=s*e.w,e.h=l*e.h,e.len=(""+e.n).length,e}
A.circle=function(e){e=I(e)
var t=!1
2===e.len?(e.x=e.x-.4*e.w,e.w=1.4*e.w,t=!0):e.len>=3&&(e.x=e.x-.65*e.w,e.w=1.65*e.w,t=!0),f.clearRect(0,0,s,l),f.drawImage(c,0,0,s,l),f.beginPath(),f.font=i.fontStyle+" "+Math.floor(e.h*(e.n>99?.85:1))+"px "+i.fontFamily,f.textAlign="center",t?(f.moveTo(e.x+e.w/2,e.y),f.lineTo(e.x+e.w-e.h/2,e.y),f.quadraticCurveTo(e.x+e.w,e.y,e.x+e.w,e.y+e.h/2),f.lineTo(e.x+e.w,e.y+e.h-e.h/2),f.quadraticCurveTo(e.x+e.w,e.y+e.h,e.x+e.w-e.h/2,e.y+e.h),f.lineTo(e.x+e.h/2,e.y+e.h),f.quadraticCurveTo(e.x,e.y+e.h,e.x,e.y+e.h-e.h/2),f.lineTo(e.x,e.y+e.h/2),f.quadraticCurveTo(e.x,e.y,e.x+e.h/2,e.y)):f.arc(e.x+e.w/2,e.y+e.h/2,e.h/2,0,2*Math.PI),f.fillStyle="rgba("+i.bgColor.r+","+i.bgColor.g+","+i.bgColor.b+","+e.o+")",f.fill(),f.closePath(),f.beginPath(),f.stroke(),f.fillStyle="rgba("+i.textColor.r+","+i.textColor.g+","+i.textColor.b+","+e.o+")","number"==typeof e.n&&e.n>999?f.fillText((e.n>9999?9:Math.floor(e.n/1e3))+"k+",Math.floor(e.x+e.w/2),Math.floor(e.y+e.h-.2*e.h)):f.fillText(e.n,Math.floor(e.x+e.w/2),Math.floor(e.y+e.h-.15*e.h)),f.closePath()},A.rectangle=function(e){e=I(e)
var t=!1
2===e.len?(e.x=e.x-.4*e.w,e.w=1.4*e.w,t=!0):e.len>=3&&(e.x=e.x-.65*e.w,e.w=1.65*e.w,t=!0),f.clearRect(0,0,s,l),f.drawImage(c,0,0,s,l),f.beginPath(),f.font=i.fontStyle+" "+Math.floor(e.h*(e.n>99?.9:1))+"px "+i.fontFamily,f.textAlign="center",f.fillStyle="rgba("+i.bgColor.r+","+i.bgColor.g+","+i.bgColor.b+","+e.o+")",f.fillRect(e.x,e.y,e.w,e.h),f.fillStyle="rgba("+i.textColor.r+","+i.textColor.g+","+i.textColor.b+","+e.o+")","number"==typeof e.n&&e.n>999?f.fillText((e.n>9999?9:Math.floor(e.n/1e3))+"k+",Math.floor(e.x+e.w/2),Math.floor(e.y+e.h-.2*e.h)):f.fillText(e.n,Math.floor(e.x+e.w/2),Math.floor(e.y+e.h-.15*e.h)),f.closePath()}
var T=function(e,t){t=("string"==typeof t?{animation:t}:t)||{},w=function(){try{if("number"==typeof e?e>0:""!==e){var n={type:"badge",options:{n:e}}
if("animation"in t&&S.types[""+t.animation]&&(n.options.animation=""+t.animation),"type"in t&&A[""+t.type]&&(n.options.type=""+t.type),["bgColor","textColor"].forEach(function(e){e in t&&(n.options[e]=o(t[e]))}),["fontStyle","fontFamily"].forEach(function(e){e in t&&(n.options[e]=t[e])}),C.push(n),C.length>100)throw new Error("Too many badges requests in queue.")
M.start()}else M.reset()}catch(r){throw new Error("Error setting badge. Message: "+r.message)}},d&&w()},U=function(e){w=function(){try{var t=e.width,o=e.height,n=document.createElement("img"),r=o/l>t/s?t/s:o/l
n.setAttribute("crossOrigin","anonymous"),n.onload=function(){f.clearRect(0,0,s,l),f.drawImage(n,0,0,s,l),O.setIcon(h)},n.setAttribute("src",e.getAttribute("src")),n.height=o/r,n.width=t/r}catch(i){throw new Error("Error setting image. Message: "+i.message)}},d&&w()},R=function(e){w=function(){try{if("stop"===e)return g=!0,M.reset(),void(g=!1)
e.addEventListener("play",function(){t(this)},!1)}catch(o){throw new Error("Error setting video. Message: "+o.message)}},d&&w()},L=function(e){if(window.URL&&window.URL.createObjectURL||(window.URL=window.URL||{},window.URL.createObjectURL=function(e){return e}),x.supported){var o=!1
navigator.getUserMedia=navigator.getUserMedia||navigator.oGetUserMedia||navigator.msGetUserMedia||navigator.mozGetUserMedia||navigator.webkitGetUserMedia,w=function(){try{if("stop"===e)return g=!0,M.reset(),void(g=!1)
o=document.createElement("video"),o.width=s,o.height=l,navigator.getUserMedia({video:!0,audio:!1},function(e){o.src=URL.createObjectURL(e),o.play(),t(o)},function(){})}catch(n){throw new Error("Error setting webcam. Message: "+n.message)}},d&&w()}},O={}
O.getIcon=function(){var e=!1,t=function(){for(var e=b.getElementsByTagName("head")[0].getElementsByTagName("link"),t=e.length,o=t-1;o>=0;o--)if(/(^|\s)icon(\s|$)/i.test(e[o].getAttribute("rel")))return e[o]
return!1}
return i.element?e=i.element:i.elementId?(e=b.getElementById(i.elementId),e.setAttribute("href",e.getAttribute("src"))):(e=t(),e===!1&&(e=b.createElement("link"),e.setAttribute("rel","icon"),b.getElementsByTagName("head")[0].appendChild(e))),e.setAttribute("type","image/png"),e},O.setIcon=function(e){var t=e.toDataURL("image/png")
if(i.dataUrl&&i.dataUrl(t),i.element)i.element.setAttribute("href",t),i.element.setAttribute("src",t)
else if(i.elementId){var o=b.getElementById(i.elementId)
o.setAttribute("href",t),o.setAttribute("src",t)}else if(x.ff||x.opera){var n=a
a=b.createElement("link"),x.opera&&a.setAttribute("rel","icon"),a.setAttribute("rel","icon"),a.setAttribute("type","image/png"),b.getElementsByTagName("head")[0].appendChild(a),a.setAttribute("href",t),n.parentNode&&n.parentNode.removeChild(n)}else a.setAttribute("href",t)}
var S={}
return S.duration=40,S.types={},S.types.fade=[{x:.4,y:.4,w:.6,h:.6,o:0},{x:.4,y:.4,w:.6,h:.6,o:.1},{x:.4,y:.4,w:.6,h:.6,o:.2},{x:.4,y:.4,w:.6,h:.6,o:.3},{x:.4,y:.4,w:.6,h:.6,o:.4},{x:.4,y:.4,w:.6,h:.6,o:.5},{x:.4,y:.4,w:.6,h:.6,o:.6},{x:.4,y:.4,w:.6,h:.6,o:.7},{x:.4,y:.4,w:.6,h:.6,o:.8},{x:.4,y:.4,w:.6,h:.6,o:.9},{x:.4,y:.4,w:.6,h:.6,o:1}],S.types.none=[{x:.4,y:.4,w:.6,h:.6,o:1}],S.types.pop=[{x:1,y:1,w:0,h:0,o:1},{x:.9,y:.9,w:.1,h:.1,o:1},{x:.8,y:.8,w:.2,h:.2,o:1},{x:.7,y:.7,w:.3,h:.3,o:1},{x:.6,y:.6,w:.4,h:.4,o:1},{x:.5,y:.5,w:.5,h:.5,o:1},{x:.4,y:.4,w:.6,h:.6,o:1}],S.types.popFade=[{x:.75,y:.75,w:0,h:0,o:0},{x:.65,y:.65,w:.1,h:.1,o:.2},{x:.6,y:.6,w:.2,h:.2,o:.4},{x:.55,y:.55,w:.3,h:.3,o:.6},{x:.5,y:.5,w:.4,h:.4,o:.8},{x:.45,y:.45,w:.5,h:.5,o:.9},{x:.4,y:.4,w:.6,h:.6,o:1}],S.types.slide=[{x:.4,y:1,w:.6,h:.6,o:1},{x:.4,y:.9,w:.6,h:.6,o:1},{x:.4,y:.9,w:.6,h:.6,o:1},{x:.4,y:.8,w:.6,h:.6,o:1},{x:.4,y:.7,w:.6,h:.6,o:1},{x:.4,y:.6,w:.6,h:.6,o:1},{x:.4,y:.5,w:.6,h:.6,o:1},{x:.4,y:.4,w:.6,h:.6,o:1}],S.run=function(e,t,o,a){var l=S.types[r()?"none":i.animation]
return a=o===!0?"undefined"!=typeof a?a:l.length-1:"undefined"!=typeof a?a:0,t=t?t:function(){},a<l.length&&a>=0?(A[i.type](n(e,l[a])),m=setTimeout(function(){o?a-=1:a+=1,S.run(e,t,o,a)},S.duration),void O.setIcon(h)):void t()},E(),{badge:T,video:R,image:U,webcam:L,reset:M.reset,browser:{supported:x.supported}}}
"undefined"!=typeof define&&define.amd?define([],function(){return e}):"undefined"!=typeof module&&module.exports?module.exports=e:this.Favico=e}()

!function(){"use strict"
function e(){var e,i,r,n=(o.appVersion,o.userAgent),t=o.appName,s=""+parseFloat(o.appVersion),d=parseInt(o.appVersion,10)
return-1!==(i=n.indexOf("Opera"))?(t="Opera",s=n.substring(i+6),-1!==(i=n.indexOf("Version"))&&(s=n.substring(i+8))):-1!==(i=n.indexOf("MSIE"))?(t="IE",s=n.substring(i+5)):-1!==(i=n.indexOf("Chrome"))?(t="Chrome",s=n.substring(i+7)):-1!==(i=n.indexOf("Safari"))?(t="Safari",s=n.substring(i+7),-1!==(i=n.indexOf("Version"))&&(s=n.substring(i+8))):-1!==(i=n.indexOf("Firefox"))?(t="Firefox",s=n.substring(i+8)):(e=n.lastIndexOf(" ")+1)<(i=n.lastIndexOf("/"))&&(t=n.substring(e,i),s=n.substring(i+1),t.toLowerCase()===t.toUpperCase()&&(t=o.appName)),a&&(t="Edge",s=parseInt(o.userAgent.match(/Edge\/(\d+).(\d+)$/)[2],10)),-1!==(r=s.indexOf(";"))&&(s=s.substring(0,r)),-1!==(r=s.indexOf(" "))&&(s=s.substring(0,r)),d=parseInt(""+s,10),isNaN(d)&&(s=""+parseFloat(o.appVersion),d=parseInt(o.appVersion,10)),{fullVersion:s,version:d,name:t}}function i(e){r(function(i){e(i.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)?"Local: "+i:"Public: "+i)})}function r(e){function i(i){var n=/([0-9]{1,3}(\.[0-9]{1,3}){3})/,o=n.exec(i)[1]
void 0===r[o]&&e(o),r[o]=!0}var r={},n=window.RTCPeerConnection||window.mozRTCPeerConnection||window.webkitRTCPeerConnection,o=!!window.webkitRTCPeerConnection
if(!n){var t=document.getElementById("iframe")
if(!t)throw"NOTE: you need to have an iframe in the page right above the script tag."
var a=t.contentWindow
n=a.RTCPeerConnection||a.mozRTCPeerConnection||a.webkitRTCPeerConnection,o=!!a.webkitRTCPeerConnection}var s,d={optional:[{RtpDataChannels:!0}]}
o&&(s={iceServers:[{urls:"stun:stun.services.mozilla.com"}]},"undefined"!=typeof S&&S.browser.isFirefox&&S.browser.version<=38&&(s[0]={url:s[0].urls}))
var c=new n(s,d)
c.onicecandidate=function(e){e.candidate&&i(e.candidate.candidate)},c.createDataChannel(""),c.createOffer(function(e){c.setLocalDescription(e,function(){},function(){})},function(){}),setTimeout(function(){var e=c.localDescription.sdp.split("\n")
e.forEach(function(e){0===e.indexOf("a=candidate:")&&i(e)})},1e3)}function n(e){return!o.enumerateDevices&&window.MediaStreamTrack&&window.MediaStreamTrack.getSources&&(o.enumerateDevices=window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack)),!o.enumerateDevices&&o.enumerateDevices&&(o.enumerateDevices=o.enumerateDevices.bind(o)),o.enumerateDevices?(p=[],void o.enumerateDevices(function(i){i.forEach(function(e){var i={}
for(var r in e)i[r]=e[r]
"audio"===i.kind&&(i.kind="audioinput"),"video"===i.kind&&(i.kind="videoinput")
var n
p.forEach(function(e){e.id===i.id&&e.kind===i.kind&&(n=!0)}),n||(i.deviceId||(i.deviceId=i.id),i.id||(i.id=i.deviceId),i.label||(i.label="Please invoke getUserMedia once.",b||(i.label="HTTPs is required to get label of this "+i.kind+" device.")),"audioinput"===i.kind&&(w=!0),"audiooutput"===i.kind&&(v=!0),"videoinput"===i.kind&&(m=!0),p.push(i))}),"undefined"!=typeof S&&(S.MediaDevices=p,S.hasMicrophone=w,S.hasSpeakers=v,S.hasWebcam=m),e&&e()})):void(e&&e())}var o=window.navigator
o.mediaDevices&&o.mediaDevices.enumerateDevices&&(o.enumerateDevices=function(e){o.mediaDevices.enumerateDevices().then(e)}),"undefined"!=typeof o?("undefined"!=typeof o.webkitGetUserMedia&&(o.getUserMedia=o.webkitGetUserMedia),"undefined"!=typeof o.mozGetUserMedia&&(o.getUserMedia=o.mozGetUserMedia)):o={getUserMedia:function(){}}
var t=!!o.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i),a=!(-1===o.userAgent.indexOf("Edge")||!o.msSaveOrOpenBlob&&!o.msSaveBlob),s={Android:function(){return o.userAgent.match(/Android/i)},BlackBerry:function(){return o.userAgent.match(/BlackBerry/i)},iOS:function(){return o.userAgent.match(/iPhone|iPad|iPod/i)},Opera:function(){return o.userAgent.match(/Opera Mini/i)},Windows:function(){return o.userAgent.match(/IEMobile/i)},any:function(){return s.Android()||s.BlackBerry()||s.iOS()||s.Opera()||s.Windows()},getOsName:function(){var e="Unknown OS"
return s.Android()&&(e="Android"),s.BlackBerry()&&(e="BlackBerry"),s.iOS()&&(e="iOS"),s.Opera()&&(e="Opera Mini"),s.Windows()&&(e="Windows"),e}},d="Unknown OS"
s.any()?d=s.getOsName():(-1!==o.appVersion.indexOf("Win")&&(d="Windows"),-1!==o.appVersion.indexOf("Mac")&&(d="MacOS"),-1!==o.appVersion.indexOf("X11")&&(d="UNIX"),-1!==o.appVersion.indexOf("Linux")&&(d="Linux"))
var c=!1,u=!1;["captureStream","mozCaptureStream","webkitCaptureStream"].forEach(function(e){e in document.createElement("canvas")&&(c=!0),e in document.createElement("video")&&(u=!0)})
var p=[],f=!1
"undefined"!=typeof MediaStreamTrack&&"getSources"in MediaStreamTrack?f=!0:o.mediaDevices&&o.mediaDevices.enumerateDevices&&(f=!0)
var w=f,v=f,m=f
n()
var S={}
S.browser=e(),S.browser["is"+S.browser.name]=!0
var b="https:"===location.protocol,l=(!!(window.process&&"object"==typeof window.process&&window.process.versions&&window.process.versions["node-webkit"]),!1);["webkitRTCPeerConnection","mozRTCPeerConnection","RTCIceGatherer"].forEach(function(e){e in window&&(l=!0)}),S.isWebRTCSupported=l,S.isORTCSupported="undefined"!=typeof RTCIceGatherer
var C=!1
S.browser.isChrome&&S.browser.version>=35?C=!0:S.browser.isFirefox&&S.browser.version>=34&&(C=!0),b||(C=!1),S.isScreenCapturingSupported=C
var k={};["AudioContext","webkitAudioContext","mozAudioContext","msAudioContext"].forEach(function(e){e in window&&(k.isSupported=!0,"createMediaStreamSource"in window[e].prototype&&(k.isCreateMediaStreamSourceSupported=!0))}),S.isAudioContextSupported=k.isSupported,S.isCreateMediaStreamSourceSupported=k.isCreateMediaStreamSourceSupported
var g=!1
S.browser.isChrome&&S.browser.version>31&&(g=!0),S.isRtpDataChannelsSupported=g
var h=!1
if(S.browser.isFirefox&&S.browser.version>28?h=!0:S.browser.isChrome&&S.browser.version>25?h=!0:S.browser.isOpera&&S.browser.version>=11&&(h=!0),S.isSctpDataChannelsSupported=h,S.isMobileDevice=t,S.isWebSocketsSupported="WebSocket"in window&&2===window.WebSocket.CLOSING,S.isWebSocketsBlocked="Checking",S.isWebSocketsSupported){var O=new WebSocket("wss://echo.websocket.org:443/")
O.onopen=function(){S.isWebSocketsBlocked=!1,S.loadCallback&&S.loadCallback()},O.onerror=function(){S.isWebSocketsBlocked=!0,S.loadCallback&&S.loadCallback()}}var M=!1
o.getUserMedia?M=!0:o.mediaDevices&&o.mediaDevices.getUserMedia&&(M=!0),S.browser.isChrome&&S.browser.version>=47&&!b&&(S.isGetUserMediaSupported="Requires HTTPs"),S.isGetUserMediaSupported=M,S.osName=d,S.isCanvasSupportsStreamCapturing=c,S.isVideoSupportsStreamCapturing=u,S.DetectLocalIPAddress=i,S.load=function(e){this.loadCallback=e,n(e)},S.MediaDevices=p,S.hasMicrophone=w,S.hasSpeakers=v,S.hasWebcam=m
var x=!1
"setSinkId"in document.createElement("video")&&(x=!0),S.isSetSinkIdSupported=x
var T=!1
S.browser.isFirefox?"getSenders"in mozRTCPeerConnection.prototype&&(T=!0):S.browser.isChrome&&"getSenders"in webkitRTCPeerConnection.prototype&&(T=!0),S.isRTPSenderReplaceTracksSupported=T
var D=!1
S.browser.isFirefox&&S.browser.version>38&&(D=!0),S.isRemoteStreamProcessingSupported=D
var y=!1
"undefined"!=typeof MediaStreamTrack&&"applyConstraints"in MediaStreamTrack.prototype&&(y=!0),S.isApplyConstraintsSupported=y
var P=!1
S.browser.isFirefox&&S.browser.version>=43&&(P=!0),S.isMultiMonitorScreenCapturingSupported=P,window.DetectRTC=S}()

/*! peerjs build:0.3.13, production. Copyright(c) 2013 Michelle Bu <michelle@michellebu.com> */
!function e(t,n,i){function r(s,a){if(!n[s]){if(!t[s]){var c="function"==typeof require&&require
if(!a&&c)return c(s,!0)
if(o)return o(s,!0)
var u=new Error("Cannot find module '"+s+"'")
throw u.code="MODULE_NOT_FOUND",u}var p=n[s]={exports:{}}
t[s][0].call(p.exports,function(e){var n=t[s][1][e]
return r(n?n:e)},p,p.exports,e,t,n,i)}return n[s].exports}for(var o="function"==typeof require&&require,s=0;s<i.length;s++)r(i[s])
return r}({1:[function(e,t){t.exports.RTCSessionDescription=window.RTCSessionDescription||window.mozRTCSessionDescription,t.exports.RTCPeerConnection=window.RTCPeerConnection||window.mozRTCPeerConnection||window.webkitRTCPeerConnection,t.exports.RTCIceCandidate=window.RTCIceCandidate||window.mozRTCIceCandidate},{}],2:[function(e,t){function n(e,t,s){return this instanceof n?(r.call(this),this.options=i.extend({serialization:"binary",reliable:!1},s),this.open=!1,this.type="data",this.peer=e,this.provider=t,this.id=this.options.connectionId||n._idPrefix+i.randomToken(),this.label=this.options.label||this.id,this.metadata=this.options.metadata,this.serialization=this.options.serialization,this.reliable=this.options.reliable,this._buffer=[],this._buffering=!1,this.bufferSize=0,this._chunkedData={},this.options._payload&&(this._peerBrowser=this.options._payload.browser),void o.startConnection(this,this.options._payload||{originator:!0})):new n(e,t,s)}var i=e("./util"),r=e("eventemitter3"),o=e("./negotiator"),s=e("reliable")
i.inherits(n,r),n._idPrefix="dc_",n.prototype.initialize=function(e){this._dc=this.dataChannel=e,this._configureDataChannel()},n.prototype._configureDataChannel=function(){var e=this
i.supports.sctp&&(this._dc.binaryType="arraybuffer"),this._dc.onopen=function(){i.log("Data channel connection success"),e.open=!0,e.emit("open")},!i.supports.sctp&&this.reliable&&(this._reliable=new s(this._dc,i.debug)),this._reliable?this._reliable.onmessage=function(t){e.emit("data",t)}:this._dc.onmessage=function(t){e._handleDataMessage(t)},this._dc.onclose=function(){i.log("DataChannel closed for:",e.peer),e.close()}},n.prototype._handleDataMessage=function(e){var t=this,n=e.data,r=n.constructor
if("binary"===this.serialization||"binary-utf8"===this.serialization){if(r===Blob)return void i.blobToArrayBuffer(n,function(e){n=i.unpack(e),t.emit("data",n)})
if(r===ArrayBuffer)n=i.unpack(n)
else if(r===String){var o=i.binaryStringToArrayBuffer(n)
n=i.unpack(o)}}else"json"===this.serialization&&(n=JSON.parse(n))
if(n.__peerData){var s=n.__peerData,a=this._chunkedData[s]||{data:[],count:0,total:n.total}
return a.data[n.n]=n.data,a.count+=1,a.total===a.count&&(delete this._chunkedData[s],n=new Blob(a.data),this._handleDataMessage({data:n})),void(this._chunkedData[s]=a)}this.emit("data",n)},n.prototype.close=function(){this.open&&(this.open=!1,o.cleanup(this),this.emit("close"))},n.prototype.send=function(e,t){if(!this.open)return void this.emit("error",new Error("Connection is not open. You should listen for the `open` event before sending messages."))
if(this._reliable)return void this._reliable.send(e)
var n=this
if("json"===this.serialization)this._bufferedSend(JSON.stringify(e))
else if("binary"===this.serialization||"binary-utf8"===this.serialization){var r=i.pack(e),o=i.chunkedBrowsers[this._peerBrowser]||i.chunkedBrowsers[i.browser]
if(o&&!t&&r.size>i.chunkedMTU)return void this._sendChunks(r)
i.supports.sctp?i.supports.binaryBlob?this._bufferedSend(r):i.blobToArrayBuffer(r,function(e){n._bufferedSend(e)}):i.blobToBinaryString(r,function(e){n._bufferedSend(e)})}else this._bufferedSend(e)},n.prototype._bufferedSend=function(e){(this._buffering||!this._trySend(e))&&(this._buffer.push(e),this.bufferSize=this._buffer.length)},n.prototype._trySend=function(e){try{this._dc.send(e)}catch(t){this._buffering=!0
var n=this
return setTimeout(function(){n._buffering=!1,n._tryBuffer()},100),!1}return!0},n.prototype._tryBuffer=function(){if(0!==this._buffer.length){var e=this._buffer[0]
this._trySend(e)&&(this._buffer.shift(),this.bufferSize=this._buffer.length,this._tryBuffer())}},n.prototype._sendChunks=function(e){for(var t=i.chunk(e),n=0,r=t.length;r>n;n+=1){var e=t[n]
this.send(e,!0)}},n.prototype.handleMessage=function(e){var t=e.payload
switch(e.type){case"ANSWER":this._peerBrowser=t.browser,o.handleSDP(e.type,this,t.sdp)
break
case"CANDIDATE":o.handleCandidate(this,t.candidate)
break
default:i.warn("Unrecognized message type:",e.type,"from peer:",this.peer)}},t.exports=n},{"./negotiator":5,"./util":8,eventemitter3:9,reliable:12}],3:[function(e){window.Socket=e("./socket"),window.MediaConnection=e("./mediaconnection"),window.DataConnection=e("./dataconnection"),window.Peer=e("./peer"),window.RTCPeerConnection=e("./adapter").RTCPeerConnection,window.RTCSessionDescription=e("./adapter").RTCSessionDescription,window.RTCIceCandidate=e("./adapter").RTCIceCandidate,window.Negotiator=e("./negotiator"),window.util=e("./util"),window.BinaryPack=e("js-binarypack")},{"./adapter":1,"./dataconnection":2,"./mediaconnection":4,"./negotiator":5,"./peer":6,"./socket":7,"./util":8,"js-binarypack":10}],4:[function(e,t){function n(e,t,s){return this instanceof n?(r.call(this),this.options=i.extend({},s),this.open=!1,this.type="media",this.peer=e,this.provider=t,this.metadata=this.options.metadata,this.localStream=this.options._stream,this.id=this.options.connectionId||n._idPrefix+i.randomToken(),void(this.localStream&&o.startConnection(this,{_stream:this.localStream,originator:!0}))):new n(e,t,s)}var i=e("./util"),r=e("eventemitter3"),o=e("./negotiator")
i.inherits(n,r),n._idPrefix="mc_",n.prototype.addStream=function(e){i.log("Receiving stream",e),this.remoteStream=e,this.emit("stream",e)},n.prototype.handleMessage=function(e){var t=e.payload
switch(e.type){case"ANSWER":o.handleSDP(e.type,this,t.sdp),this.open=!0
break
case"CANDIDATE":o.handleCandidate(this,t.candidate)
break
default:i.warn("Unrecognized message type:",e.type,"from peer:",this.peer)}},n.prototype.answer=function(e){if(this.localStream)return void i.warn("Local stream already exists on this MediaConnection. Are you answering a call twice?")
this.options._payload._stream=e,this.localStream=e,o.startConnection(this,this.options._payload)
for(var t=this.provider._getMessages(this.id),n=0,r=t.length;r>n;n+=1)this.handleMessage(t[n])
this.open=!0},n.prototype.close=function(){this.open&&(this.open=!1,o.cleanup(this),this.emit("close"))},t.exports=n},{"./negotiator":5,"./util":8,eventemitter3:9}],5:[function(e,t){var n=e("./util"),i=e("./adapter").RTCPeerConnection,r=e("./adapter").RTCSessionDescription,o=e("./adapter").RTCIceCandidate,s={pcs:{data:{},media:{}},queue:[]}
s._idPrefix="pc_",s.startConnection=function(e,t){var i=s._getPeerConnection(e,t)
if("media"===e.type&&t._stream&&i.addStream(t._stream),e.pc=e.peerConnection=i,t.originator){if("data"===e.type){var r={}
n.supports.sctp||(r={reliable:t.reliable})
var o=i.createDataChannel(e.label,r)
e.initialize(o)}n.supports.onnegotiationneeded||s._makeOffer(e)}else s.handleSDP("OFFER",e,t.sdp)},s._getPeerConnection=function(e,t){s.pcs[e.type]||n.error(e.type+" is not a valid connection type. Maybe you overrode the `type` property somewhere."),s.pcs[e.type][e.peer]||(s.pcs[e.type][e.peer]={})
var i
return s.pcs[e.type][e.peer],t.pc&&(i=s.pcs[e.type][e.peer][t.pc]),i&&"stable"===i.signalingState||(i=s._startPeerConnection(e)),i},s._startPeerConnection=function(e){n.log("Creating RTCPeerConnection.")
var t=s._idPrefix+n.randomToken(),r={}
"data"!==e.type||n.supports.sctp?"media"===e.type&&(r={optional:[{DtlsSrtpKeyAgreement:!0}]}):r={optional:[{RtpDataChannels:!0}]}
var o=new i(e.provider.options.config,r)
return s.pcs[e.type][e.peer][t]=o,s._setupListeners(e,o,t),o},s._setupListeners=function(e,t){var i=e.peer,r=e.id,o=e.provider
n.log("Listening for ICE candidates."),t.onicecandidate=function(t){t.candidate&&(n.log("Received ICE candidates for:",e.peer),o.socket.send({type:"CANDIDATE",payload:{candidate:t.candidate,type:e.type,connectionId:e.id},dst:i}))},t.oniceconnectionstatechange=function(){switch(t.iceConnectionState){case"disconnected":case"failed":n.log("iceConnectionState is disconnected, closing connections to "+i),e.close()
break
case"completed":t.onicecandidate=n.noop}},t.onicechange=t.oniceconnectionstatechange,n.log("Listening for `negotiationneeded`"),t.onnegotiationneeded=function(){n.log("`negotiationneeded` triggered"),"stable"==t.signalingState?s._makeOffer(e):n.log("onnegotiationneeded triggered when not stable. Is another connection being established?")},n.log("Listening for data channel"),t.ondatachannel=function(e){n.log("Received data channel")
var t=e.channel,s=o.getConnection(i,r)
s.initialize(t)},n.log("Listening for remote stream"),t.onaddstream=function(e){n.log("Received remote stream")
var t=e.stream,s=o.getConnection(i,r)
"media"===s.type&&s.addStream(t)}},s.cleanup=function(e){n.log("Cleaning up PeerConnection to "+e.peer)
var t=e.pc
!t||"closed"===t.readyState&&"closed"===t.signalingState||(t.close(),e.pc=null)},s._makeOffer=function(e){var t=e.pc
t.createOffer(function(i){n.log("Created offer."),!n.supports.sctp&&"data"===e.type&&e.reliable&&(i.sdp=Reliable.higherBandwidthSDP(i.sdp)),t.setLocalDescription(i,function(){n.log("Set localDescription: offer","for:",e.peer),e.provider.socket.send({type:"OFFER",payload:{sdp:i,type:e.type,label:e.label,connectionId:e.id,reliable:e.reliable,serialization:e.serialization,metadata:e.metadata,browser:n.browser},dst:e.peer})},function(t){e.provider.emitError("webrtc",t),n.log("Failed to setLocalDescription, ",t)})},function(t){e.provider.emitError("webrtc",t),n.log("Failed to createOffer, ",t)},e.options.constraints)},s._makeAnswer=function(e){var t=e.pc
t.createAnswer(function(i){n.log("Created answer."),!n.supports.sctp&&"data"===e.type&&e.reliable&&(i.sdp=Reliable.higherBandwidthSDP(i.sdp)),t.setLocalDescription(i,function(){n.log("Set localDescription: answer","for:",e.peer),e.provider.socket.send({type:"ANSWER",payload:{sdp:i,type:e.type,connectionId:e.id,browser:n.browser},dst:e.peer})},function(t){e.provider.emitError("webrtc",t),n.log("Failed to setLocalDescription, ",t)})},function(t){e.provider.emitError("webrtc",t),n.log("Failed to create answer, ",t)})},s.handleSDP=function(e,t,i){i=new r(i)
var o=t.pc
n.log("Setting remote description",i),o.setRemoteDescription(i,function(){n.log("Set remoteDescription:",e,"for:",t.peer),"OFFER"===e&&s._makeAnswer(t)},function(e){t.provider.emitError("webrtc",e),n.log("Failed to setRemoteDescription, ",e)})},s.handleCandidate=function(e,t){var i=t.candidate,r=t.sdpMLineIndex
e.pc.addIceCandidate(new o({sdpMLineIndex:r,candidate:i})),n.log("Added ICE candidate for:",e.peer)},t.exports=s},{"./adapter":1,"./util":8}],6:[function(e,t){function n(e,t){return this instanceof n?(r.call(this),e&&e.constructor==Object?(t=e,e=void 0):e&&(e=e.toString()),t=i.extend({debug:0,host:i.CLOUD_HOST,port:i.CLOUD_PORT,key:"peerjs",path:"/",token:i.randomToken(),config:i.defaultConfig},t),this.options=t,"/"===t.host&&(t.host=window.location.hostname),"/"!==t.path[0]&&(t.path="/"+t.path),"/"!==t.path[t.path.length-1]&&(t.path+="/"),void 0===t.secure&&t.host!==i.CLOUD_HOST&&(t.secure=i.isSecure()),t.logFunction&&i.setLogFunction(t.logFunction),i.setLogLevel(t.debug),i.supports.audioVideo||i.supports.data?i.validateId(e)?i.validateKey(t.key)?t.secure&&"0.peerjs.com"===t.host?void this._delayedAbort("ssl-unavailable","The cloud server currently does not support HTTPS. Please run your own PeerServer to use HTTPS."):(this.destroyed=!1,this.disconnected=!1,this.open=!1,this.connections={},this._lostMessages={},this._initializeServerConnection(),void(e?this._initialize(e):this._retrieveId())):void this._delayedAbort("invalid-key",'API KEY "'+t.key+'" is invalid'):void this._delayedAbort("invalid-id",'ID "'+e+'" is invalid'):void this._delayedAbort("browser-incompatible","The current browser does not support WebRTC")):new n(e,t)}var i=e("./util"),r=e("eventemitter3"),o=e("./socket"),s=e("./mediaconnection"),a=e("./dataconnection")
i.inherits(n,r),n.prototype._initializeServerConnection=function(){var e=this
this.socket=new o(this.options.secure,this.options.host,this.options.port,this.options.path,this.options.key),this.socket.on("message",function(t){e._handleMessage(t)}),this.socket.on("error",function(t){e._abort("socket-error",t)}),this.socket.on("disconnected",function(){e.disconnected||(e.emitError("network","Lost connection to server."),e.disconnect())}),this.socket.on("close",function(){e.disconnected||e._abort("socket-closed","Underlying socket is already closed.")})},n.prototype._retrieveId=function(){var e=this,t=new XMLHttpRequest,n=this.options.secure?"https://":"http://",r=n+this.options.host+":"+this.options.port+this.options.path+this.options.key+"/id",o="?ts="+(new Date).getTime()+Math.random()
r+=o,t.open("get",r,!0),t.onerror=function(t){i.error("Error retrieving ID",t)
var n=""
"/"===e.options.path&&e.options.host!==i.CLOUD_HOST&&(n=" If you passed in a `path` to your self-hosted PeerServer, you'll also need to pass in that same path when creating a new Peer."),e._abort("server-error","Could not get an ID from the server."+n)},t.onreadystatechange=function(){return 4===t.readyState?200!==t.status?void t.onerror():void e._initialize(t.responseText):void 0},t.send(null)},n.prototype._initialize=function(e){this.id=e,this.socket.start(this.id,this.options.token)},n.prototype._handleMessage=function(e){var t,n=e.type,r=e.payload,o=e.src
switch(n){case"OPEN":this.emit("open",this.id),this.open=!0
break
case"ERROR":this._abort("server-error",r.msg)
break
case"ID-TAKEN":this._abort("unavailable-id","ID `"+this.id+"` is taken")
break
case"INVALID-KEY":this._abort("invalid-key",'API KEY "'+this.options.key+'" is invalid')
break
case"LEAVE":i.log("Received leave message from",o),this._cleanupPeer(o)
break
case"EXPIRE":this.emitError("peer-unavailable","Could not connect to peer "+o)
break
case"OFFER":var c=r.connectionId
if(t=this.getConnection(o,c))i.warn("Offer received for existing Connection ID:",c)
else{if("media"===r.type)t=new s(o,this,{connectionId:c,_payload:r,metadata:r.metadata}),this._addConnection(o,t),this.emit("call",t)
else{if("data"!==r.type)return void i.warn("Received malformed connection type:",r.type)
t=new a(o,this,{connectionId:c,_payload:r,metadata:r.metadata,label:r.label,serialization:r.serialization,reliable:r.reliable}),this._addConnection(o,t),this.emit("connection",t)}for(var u=this._getMessages(c),p=0,h=u.length;h>p;p+=1)t.handleMessage(u[p])}break
default:if(!r)return void i.warn("You received a malformed message from "+o+" of type "+n)
var d=r.connectionId
t=this.getConnection(o,d),t&&t.pc?t.handleMessage(e):d?this._storeMessage(d,e):i.warn("You received an unrecognized message:",e)}},n.prototype._storeMessage=function(e,t){this._lostMessages[e]||(this._lostMessages[e]=[]),this._lostMessages[e].push(t)},n.prototype._getMessages=function(e){var t=this._lostMessages[e]
return t?(delete this._lostMessages[e],t):[]},n.prototype.connect=function(e,t){if(this.disconnected)return i.warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect, or call reconnect on this peer if you believe its ID to still be available."),void this.emitError("disconnected","Cannot connect to new Peer after disconnecting from server.")
var n=new a(e,this,t)
return this._addConnection(e,n),n},n.prototype.call=function(e,t,n){if(this.disconnected)return i.warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect."),void this.emitError("disconnected","Cannot connect to new Peer after disconnecting from server.")
if(!t)return void i.error("To call a peer, you must provide a stream from your browser's `getUserMedia`.")
n=n||{},n._stream=t
var r=new s(e,this,n)
return this._addConnection(e,r),r},n.prototype._addConnection=function(e,t){this.connections[e]||(this.connections[e]=[]),this.connections[e].push(t)},n.prototype.getConnection=function(e,t){var n=this.connections[e]
if(!n)return null
for(var i=0,r=n.length;r>i;i++)if(n[i].id===t)return n[i]
return null},n.prototype._delayedAbort=function(e,t){var n=this
i.setZeroTimeout(function(){n._abort(e,t)})},n.prototype._abort=function(e,t){i.error("Aborting!"),this._lastServerId?this.disconnect():this.destroy(),this.emitError(e,t)},n.prototype.emitError=function(e,t){i.error("Error:",t),"string"==typeof t&&(t=new Error(t)),t.type=e,this.emit("error",t)},n.prototype.destroy=function(){this.destroyed||(this._cleanup(),this.disconnect(),this.destroyed=!0)},n.prototype._cleanup=function(){if(this.connections)for(var e=Object.keys(this.connections),t=0,n=e.length;n>t;t++)this._cleanupPeer(e[t])
this.emit("close")},n.prototype._cleanupPeer=function(e){for(var t=this.connections[e],n=0,i=t.length;i>n;n+=1)t[n].close()},n.prototype.disconnect=function(){var e=this
i.setZeroTimeout(function(){e.disconnected||(e.disconnected=!0,e.open=!1,e.socket&&e.socket.close(),e.emit("disconnected",e.id),e._lastServerId=e.id,e.id=null)})},n.prototype.reconnect=function(){if(this.disconnected&&!this.destroyed)i.log("Attempting reconnection to server with ID "+this._lastServerId),this.disconnected=!1,this._initializeServerConnection(),this._initialize(this._lastServerId)
else{if(this.destroyed)throw new Error("This peer cannot reconnect to the server. It has already been destroyed.")
if(this.disconnected||this.open)throw new Error("Peer "+this.id+" cannot reconnect because it is not disconnected from the server!")
i.error("In a hurry? We're still trying to make the initial connection!")}},n.prototype.listAllPeers=function(e){e=e||function(){}
var t=this,n=new XMLHttpRequest,r=this.options.secure?"https://":"http://",o=r+this.options.host+":"+this.options.port+this.options.path+this.options.key+"/peers",s="?ts="+(new Date).getTime()+Math.random()
o+=s,n.open("get",o,!0),n.onerror=function(){t._abort("server-error","Could not get peers from the server."),e([])},n.onreadystatechange=function(){if(4===n.readyState){if(401===n.status){var r=""
throw r=t.options.host!==i.CLOUD_HOST?"It looks like you're using the cloud server. You can email team@peerjs.com to enable peer listing for your API key.":"You need to enable `allow_discovery` on your self-hosted PeerServer to use this feature.",e([]),new Error("It doesn't look like you have permission to list peers IDs. "+r)}e(200!==n.status?[]:JSON.parse(n.responseText))}},n.send(null)},t.exports=n},{"./dataconnection":2,"./mediaconnection":4,"./socket":7,"./util":8,eventemitter3:9}],7:[function(e,t){function n(e,t,i,o,s){if(!(this instanceof n))return new n(e,t,i,o,s)
r.call(this),this.disconnected=!1,this._queue=[]
var a=e?"https://":"http://",c=e?"wss://":"ws://"
this._httpUrl=a+t+":"+i+o+s,this._wsUrl=c+t+":"+i+o+"peerjs?key="+s}var i=e("./util"),r=e("eventemitter3")
i.inherits(n,r),n.prototype.start=function(e,t){this.id=e,this._httpUrl+="/"+e+"/"+t,this._wsUrl+="&id="+e+"&token="+t,this._startXhrStream(),this._startWebSocket()},n.prototype._startWebSocket=function(){var e=this
this._socket||(this._socket=new WebSocket(this._wsUrl),this._socket.onmessage=function(t){try{var n=JSON.parse(t.data)}catch(r){return void i.log("Invalid server message",t.data)}e.emit("message",n)},this._socket.onclose=function(){i.log("Socket closed."),e.disconnected=!0,e.emit("disconnected")},this._socket.onopen=function(){e._timeout&&(clearTimeout(e._timeout),setTimeout(function(){e._http.abort(),e._http=null},5e3)),e._sendQueuedMessages(),i.log("Socket open")})},n.prototype._startXhrStream=function(e){try{var t=this
this._http=new XMLHttpRequest,this._http._index=1,this._http._streamIndex=e||0,this._http.open("post",this._httpUrl+"/id?i="+this._http._streamIndex,!0),this._http.onerror=function(){clearTimeout(t._timeout),t.emit("disconnected")},this._http.onreadystatechange=function(){2==this.readyState&&this.old?(this.old.abort(),delete this.old):this.readyState>2&&200===this.status&&this.responseText&&t._handleStream(this)},this._http.send(null),this._setHTTPTimeout()}catch(n){i.log("XMLHttpRequest not available; defaulting to WebSockets")}},n.prototype._handleStream=function(e){var t=e.responseText.split("\n")
if(e._buffer)for(;e._buffer.length>0;){var n=e._buffer.shift(),r=t[n]
try{r=JSON.parse(r)}catch(o){e._buffer.shift(n)
break}this.emit("message",r)}var s=t[e._index]
if(s)if(e._index+=1,e._index===t.length)e._buffer||(e._buffer=[]),e._buffer.push(e._index-1)
else{try{s=JSON.parse(s)}catch(o){return void i.log("Invalid server message",s)}this.emit("message",s)}},n.prototype._setHTTPTimeout=function(){var e=this
this._timeout=setTimeout(function(){var t=e._http
e._wsOpen()?t.abort():(e._startXhrStream(t._streamIndex+1),e._http.old=t)},25e3)},n.prototype._wsOpen=function(){return this._socket&&1==this._socket.readyState},n.prototype._sendQueuedMessages=function(){for(var e=0,t=this._queue.length;t>e;e+=1)this.send(this._queue[e])},n.prototype.send=function(e){if(!this.disconnected){if(!this.id)return void this._queue.push(e)
if(!e.type)return void this.emit("error","Invalid message")
var t=JSON.stringify(e)
if(this._wsOpen())this._socket.send(t)
else{var n=new XMLHttpRequest,i=this._httpUrl+"/"+e.type.toLowerCase()
n.open("post",i,!0),n.setRequestHeader("Content-Type","application/json"),n.send(t)}}},n.prototype.close=function(){!this.disconnected&&this._wsOpen()&&(this._socket.close(),this.disconnected=!0)},t.exports=n},{"./util":8,eventemitter3:9}],8:[function(e,t){var n={iceServers:[{url:"stun:stun.l.google.com:19302"}]},i=1,r=e("js-binarypack"),o=e("./adapter").RTCPeerConnection,s={noop:function(){},CLOUD_HOST:"0.peerjs.com",CLOUD_PORT:9e3,chunkedBrowsers:{Chrome:1},chunkedMTU:16300,logLevel:0,setLogLevel:function(e){var t=parseInt(e,10)
s.logLevel=isNaN(parseInt(e,10))?e?3:0:t,s.log=s.warn=s.error=s.noop,s.logLevel>0&&(s.error=s._printWith("ERROR")),s.logLevel>1&&(s.warn=s._printWith("WARNING")),s.logLevel>2&&(s.log=s._print)},setLogFunction:function(e){e.constructor!==Function?s.warn("The log function you passed in is not a function. Defaulting to regular logs."):s._print=e},_printWith:function(e){return function(){var t=Array.prototype.slice.call(arguments)
t.unshift(e),s._print.apply(s,t)}},_print:function(){var e=!1,t=Array.prototype.slice.call(arguments)
t.unshift("PeerJS: ")
for(var n=0,i=t.length;i>n;n++)t[n]instanceof Error&&(t[n]="("+t[n].name+") "+t[n].message,e=!0)
e?console.error.apply(console,t):console.log.apply(console,t)},defaultConfig:n,browser:function(){return window.mozRTCPeerConnection?"Firefox":window.webkitRTCPeerConnection?"Chrome":window.RTCPeerConnection?"Supported":"Unsupported"}(),supports:function(){if("undefined"==typeof o)return{}
var e,t,i=!0,r=!0,a=!1,c=!1,u=!!window.webkitRTCPeerConnection
try{e=new o(n,{optional:[{RtpDataChannels:!0}]})}catch(p){i=!1,r=!1}if(i)try{t=e.createDataChannel("_PEERJSTEST")}catch(p){i=!1}if(i){try{t.binaryType="blob",a=!0}catch(p){}var h=new o(n,{})
try{var d=h.createDataChannel("_PEERJSRELIABLETEST",{})
c=d.reliable}catch(p){}h.close()}if(r&&(r=!!e.addStream),!u&&i){var l=new o(n,{optional:[{RtpDataChannels:!0}]})
l.onnegotiationneeded=function(){u=!0,s&&s.supports&&(s.supports.onnegotiationneeded=!0)},l.createDataChannel("_PEERJSNEGOTIATIONTEST"),setTimeout(function(){l.close()},1e3)}return e&&e.close(),{audioVideo:r,data:i,binaryBlob:a,binary:c,reliable:c,sctp:c,onnegotiationneeded:u}}(),validateId:function(e){return!e||/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.exec(e)},validateKey:function(e){return!e||/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.exec(e)},debug:!1,inherits:function(e,t){e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}})},extend:function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])
return e},pack:r.pack,unpack:r.unpack,log:function(){if(s.debug){var e=!1,t=Array.prototype.slice.call(arguments)
t.unshift("PeerJS: ")
for(var n=0,i=t.length;i>n;n++)t[n]instanceof Error&&(t[n]="("+t[n].name+") "+t[n].message,e=!0)
e?console.error.apply(console,t):console.log.apply(console,t)}},setZeroTimeout:function(e){function t(t){i.push(t),e.postMessage(r,"*")}function n(t){t.source==e&&t.data==r&&(t.stopPropagation&&t.stopPropagation(),i.length&&i.shift()())}var i=[],r="zero-timeout-message"
return e.addEventListener?e.addEventListener("message",n,!0):e.attachEvent&&e.attachEvent("onmessage",n),t}(window),chunk:function(e){for(var t=[],n=e.size,r=index=0,o=Math.ceil(n/s.chunkedMTU);n>r;){var a=Math.min(n,r+s.chunkedMTU),c=e.slice(r,a),u={__peerData:i,n:index,data:c,total:o}
t.push(u),r=a,index+=1}return i+=1,t},blobToArrayBuffer:function(e,t){var n=new FileReader
n.onload=function(e){t(e.target.result)},n.readAsArrayBuffer(e)},blobToBinaryString:function(e,t){var n=new FileReader
n.onload=function(e){t(e.target.result)},n.readAsBinaryString(e)},binaryStringToArrayBuffer:function(e){for(var t=new Uint8Array(e.length),n=0;n<e.length;n++)t[n]=255&e.charCodeAt(n)
return t.buffer},randomToken:function(){return Math.random().toString(36).substr(2)},isSecure:function(){return"https:"===location.protocol}}
t.exports=s},{"./adapter":1,"js-binarypack":10}],9:[function(e,t){"use strict"
function n(e,t,n){this.fn=e,this.context=t,this.once=n||!1}function i(){}i.prototype._events=void 0,i.prototype.listeners=function(e){if(!this._events||!this._events[e])return[]
for(var t=0,n=this._events[e].length,i=[];n>t;t++)i.push(this._events[e][t].fn)
return i},i.prototype.emit=function(e,t,n,i,r,o){if(!this._events||!this._events[e])return!1
var s,a,c,u=this._events[e],p=u.length,h=arguments.length,d=u[0]
if(1===p){switch(d.once&&this.removeListener(e,d.fn,!0),h){case 1:return d.fn.call(d.context),!0
case 2:return d.fn.call(d.context,t),!0
case 3:return d.fn.call(d.context,t,n),!0
case 4:return d.fn.call(d.context,t,n,i),!0
case 5:return d.fn.call(d.context,t,n,i,r),!0
case 6:return d.fn.call(d.context,t,n,i,r,o),!0}for(a=1,s=new Array(h-1);h>a;a++)s[a-1]=arguments[a]
d.fn.apply(d.context,s)}else for(a=0;p>a;a++)switch(u[a].once&&this.removeListener(e,u[a].fn,!0),h){case 1:u[a].fn.call(u[a].context)
break
case 2:u[a].fn.call(u[a].context,t)
break
case 3:u[a].fn.call(u[a].context,t,n)
break
default:if(!s)for(c=1,s=new Array(h-1);h>c;c++)s[c-1]=arguments[c]
u[a].fn.apply(u[a].context,s)}return!0},i.prototype.on=function(e,t,i){return this._events||(this._events={}),this._events[e]||(this._events[e]=[]),this._events[e].push(new n(t,i||this)),this},i.prototype.once=function(e,t,i){return this._events||(this._events={}),this._events[e]||(this._events[e]=[]),this._events[e].push(new n(t,i||this,!0)),this},i.prototype.removeListener=function(e,t,n){if(!this._events||!this._events[e])return this
var i=this._events[e],r=[]
if(t)for(var o=0,s=i.length;s>o;o++)i[o].fn!==t&&i[o].once!==n&&r.push(i[o])
return this._events[e]=r.length?r:null,this},i.prototype.removeAllListeners=function(e){return this._events?(e?this._events[e]=null:this._events={},this):this},i.prototype.off=i.prototype.removeListener,i.prototype.addListener=i.prototype.on,i.prototype.setMaxListeners=function(){return this},i.EventEmitter=i,i.EventEmitter2=i,i.EventEmitter3=i,"object"==typeof t&&t.exports&&(t.exports=i)},{}],10:[function(e,t){function n(e){this.index=0,this.dataBuffer=e,this.dataView=new Uint8Array(this.dataBuffer),this.length=this.dataBuffer.byteLength}function i(){this.bufferBuilder=new s}function r(e){var t=e.charCodeAt(0)
return 2047>=t?"00":65535>=t?"000":2097151>=t?"0000":67108863>=t?"00000":"000000"}function o(e){return e.length>600?new Blob([e]).size:e.replace(/[^\u0000-\u007F]/g,r).length}var s=e("./bufferbuilder").BufferBuilder,a=e("./bufferbuilder").binaryFeatures,c={unpack:function(e){var t=new n(e)
return t.unpack()},pack:function(e){var t=new i
t.pack(e)
var n=t.getBuffer()
return n}}
t.exports=c,n.prototype.unpack=function(){var e=this.unpack_uint8()
if(128>e){var t=e
return t}if(32>(224^e)){var n=(224^e)-32
return n}var i
if((i=160^e)<=15)return this.unpack_raw(i)
if((i=176^e)<=15)return this.unpack_string(i)
if((i=144^e)<=15)return this.unpack_array(i)
if((i=128^e)<=15)return this.unpack_map(i)
switch(e){case 192:return null
case 193:return
case 194:return!1
case 195:return!0
case 202:return this.unpack_float()
case 203:return this.unpack_double()
case 204:return this.unpack_uint8()
case 205:return this.unpack_uint16()
case 206:return this.unpack_uint32()
case 207:return this.unpack_uint64()
case 208:return this.unpack_int8()
case 209:return this.unpack_int16()
case 210:return this.unpack_int32()
case 211:return this.unpack_int64()
case 212:return
case 213:return
case 214:return
case 215:return
case 216:return i=this.unpack_uint16(),this.unpack_string(i)
case 217:return i=this.unpack_uint32(),this.unpack_string(i)
case 218:return i=this.unpack_uint16(),this.unpack_raw(i)
case 219:return i=this.unpack_uint32(),this.unpack_raw(i)
case 220:return i=this.unpack_uint16(),this.unpack_array(i)
case 221:return i=this.unpack_uint32(),this.unpack_array(i)
case 222:return i=this.unpack_uint16(),this.unpack_map(i)
case 223:return i=this.unpack_uint32(),this.unpack_map(i)}},n.prototype.unpack_uint8=function(){var e=255&this.dataView[this.index]
return this.index++,e},n.prototype.unpack_uint16=function(){var e=this.read(2),t=256*(255&e[0])+(255&e[1])
return this.index+=2,t},n.prototype.unpack_uint32=function(){var e=this.read(4),t=256*(256*(256*e[0]+e[1])+e[2])+e[3]
return this.index+=4,t},n.prototype.unpack_uint64=function(){var e=this.read(8),t=256*(256*(256*(256*(256*(256*(256*e[0]+e[1])+e[2])+e[3])+e[4])+e[5])+e[6])+e[7]
return this.index+=8,t},n.prototype.unpack_int8=function(){var e=this.unpack_uint8()
return 128>e?e:e-256},n.prototype.unpack_int16=function(){var e=this.unpack_uint16()
return 32768>e?e:e-65536},n.prototype.unpack_int32=function(){var e=this.unpack_uint32()
return e<Math.pow(2,31)?e:e-Math.pow(2,32)},n.prototype.unpack_int64=function(){var e=this.unpack_uint64()
return e<Math.pow(2,63)?e:e-Math.pow(2,64)},n.prototype.unpack_raw=function(e){if(this.length<this.index+e)throw new Error("BinaryPackFailure: index is out of range "+this.index+" "+e+" "+this.length)
var t=this.dataBuffer.slice(this.index,this.index+e)
return this.index+=e,t},n.prototype.unpack_string=function(e){for(var t,n,i=this.read(e),r=0,o="";e>r;)t=i[r],128>t?(o+=String.fromCharCode(t),r++):32>(192^t)?(n=(192^t)<<6|63&i[r+1],o+=String.fromCharCode(n),r+=2):(n=(15&t)<<12|(63&i[r+1])<<6|63&i[r+2],o+=String.fromCharCode(n),r+=3)
return this.index+=e,o},n.prototype.unpack_array=function(e){for(var t=new Array(e),n=0;e>n;n++)t[n]=this.unpack()
return t},n.prototype.unpack_map=function(e){for(var t={},n=0;e>n;n++){var i=this.unpack(),r=this.unpack()
t[i]=r}return t},n.prototype.unpack_float=function(){var e=this.unpack_uint32(),t=e>>31,n=(e>>23&255)-127,i=8388607&e|8388608
return(0==t?1:-1)*i*Math.pow(2,n-23)},n.prototype.unpack_double=function(){var e=this.unpack_uint32(),t=this.unpack_uint32(),n=e>>31,i=(e>>20&2047)-1023,r=1048575&e|1048576,o=r*Math.pow(2,i-20)+t*Math.pow(2,i-52)
return(0==n?1:-1)*o},n.prototype.read=function(e){var t=this.index
if(t+e<=this.length)return this.dataView.subarray(t,t+e)
throw new Error("BinaryPackFailure: read index out of range")},i.prototype.getBuffer=function(){return this.bufferBuilder.getBuffer()},i.prototype.pack=function(e){var t=typeof e
if("string"==t)this.pack_string(e)
else if("number"==t)Math.floor(e)===e?this.pack_integer(e):this.pack_double(e)
else if("boolean"==t)e===!0?this.bufferBuilder.append(195):e===!1&&this.bufferBuilder.append(194)
else if("undefined"==t)this.bufferBuilder.append(192)
else{if("object"!=t)throw new Error('Type "'+t+'" not yet supported')
if(null===e)this.bufferBuilder.append(192)
else{var n=e.constructor
if(n==Array)this.pack_array(e)
else if(n==Blob||n==File)this.pack_bin(e)
else if(n==ArrayBuffer)this.pack_bin(a.useArrayBufferView?new Uint8Array(e):e)
else if("BYTES_PER_ELEMENT"in e)this.pack_bin(a.useArrayBufferView?new Uint8Array(e.buffer):e.buffer)
else if(n==Object)this.pack_object(e)
else if(n==Date)this.pack_string(e.toString())
else{if("function"!=typeof e.toBinaryPack)throw new Error('Type "'+n.toString()+'" not yet supported')
this.bufferBuilder.append(e.toBinaryPack())}}}this.bufferBuilder.flush()},i.prototype.pack_bin=function(e){var t=e.length||e.byteLength||e.size
if(15>=t)this.pack_uint8(160+t)
else if(65535>=t)this.bufferBuilder.append(218),this.pack_uint16(t)
else{if(!(4294967295>=t))throw new Error("Invalid length")
this.bufferBuilder.append(219),this.pack_uint32(t)}this.bufferBuilder.append(e)},i.prototype.pack_string=function(e){var t=o(e)
if(15>=t)this.pack_uint8(176+t)
else if(65535>=t)this.bufferBuilder.append(216),this.pack_uint16(t)
else{if(!(4294967295>=t))throw new Error("Invalid length")
this.bufferBuilder.append(217),this.pack_uint32(t)}this.bufferBuilder.append(e)},i.prototype.pack_array=function(e){var t=e.length
if(15>=t)this.pack_uint8(144+t)
else if(65535>=t)this.bufferBuilder.append(220),this.pack_uint16(t)
else{if(!(4294967295>=t))throw new Error("Invalid length")
this.bufferBuilder.append(221),this.pack_uint32(t)}for(var n=0;t>n;n++)this.pack(e[n])},i.prototype.pack_integer=function(e){if(e>=-32&&127>=e)this.bufferBuilder.append(255&e)
else if(e>=0&&255>=e)this.bufferBuilder.append(204),this.pack_uint8(e)
else if(e>=-128&&127>=e)this.bufferBuilder.append(208),this.pack_int8(e)
else if(e>=0&&65535>=e)this.bufferBuilder.append(205),this.pack_uint16(e)
else if(e>=-32768&&32767>=e)this.bufferBuilder.append(209),this.pack_int16(e)
else if(e>=0&&4294967295>=e)this.bufferBuilder.append(206),this.pack_uint32(e)
else if(e>=-2147483648&&2147483647>=e)this.bufferBuilder.append(210),this.pack_int32(e)
else if(e>=-0x8000000000000000&&0x8000000000000000>=e)this.bufferBuilder.append(211),this.pack_int64(e)
else{if(!(e>=0&&0x10000000000000000>=e))throw new Error("Invalid integer")
this.bufferBuilder.append(207),this.pack_uint64(e)}},i.prototype.pack_double=function(e){var t=0
0>e&&(t=1,e=-e)
var n=Math.floor(Math.log(e)/Math.LN2),i=e/Math.pow(2,n)-1,r=Math.floor(i*Math.pow(2,52)),o=Math.pow(2,32),s=t<<31|n+1023<<20|r/o&1048575,a=r%o
this.bufferBuilder.append(203),this.pack_int32(s),this.pack_int32(a)},i.prototype.pack_object=function(e){var t=Object.keys(e),n=t.length
if(15>=n)this.pack_uint8(128+n)
else if(65535>=n)this.bufferBuilder.append(222),this.pack_uint16(n)
else{if(!(4294967295>=n))throw new Error("Invalid length")
this.bufferBuilder.append(223),this.pack_uint32(n)}for(var i in e)e.hasOwnProperty(i)&&(this.pack(i),this.pack(e[i]))},i.prototype.pack_uint8=function(e){this.bufferBuilder.append(e)},i.prototype.pack_uint16=function(e){this.bufferBuilder.append(e>>8),this.bufferBuilder.append(255&e)},i.prototype.pack_uint32=function(e){var t=4294967295&e
this.bufferBuilder.append((4278190080&t)>>>24),this.bufferBuilder.append((16711680&t)>>>16),this.bufferBuilder.append((65280&t)>>>8),this.bufferBuilder.append(255&t)},i.prototype.pack_uint64=function(e){var t=e/Math.pow(2,32),n=e%Math.pow(2,32)
this.bufferBuilder.append((4278190080&t)>>>24),this.bufferBuilder.append((16711680&t)>>>16),this.bufferBuilder.append((65280&t)>>>8),this.bufferBuilder.append(255&t),this.bufferBuilder.append((4278190080&n)>>>24),this.bufferBuilder.append((16711680&n)>>>16),this.bufferBuilder.append((65280&n)>>>8),this.bufferBuilder.append(255&n)},i.prototype.pack_int8=function(e){this.bufferBuilder.append(255&e)},i.prototype.pack_int16=function(e){this.bufferBuilder.append((65280&e)>>8),this.bufferBuilder.append(255&e)},i.prototype.pack_int32=function(e){this.bufferBuilder.append(e>>>24&255),this.bufferBuilder.append((16711680&e)>>>16),this.bufferBuilder.append((65280&e)>>>8),this.bufferBuilder.append(255&e)},i.prototype.pack_int64=function(e){var t=Math.floor(e/Math.pow(2,32)),n=e%Math.pow(2,32)
this.bufferBuilder.append((4278190080&t)>>>24),this.bufferBuilder.append((16711680&t)>>>16),this.bufferBuilder.append((65280&t)>>>8),this.bufferBuilder.append(255&t),this.bufferBuilder.append((4278190080&n)>>>24),this.bufferBuilder.append((16711680&n)>>>16),this.bufferBuilder.append((65280&n)>>>8),this.bufferBuilder.append(255&n)}},{"./bufferbuilder":11}],11:[function(e,t){function n(){this._pieces=[],this._parts=[]}var i={}
i.useBlobBuilder=function(){try{return new Blob([]),!1}catch(e){return!0}}(),i.useArrayBufferView=!i.useBlobBuilder&&function(){try{return 0===new Blob([new Uint8Array([])]).size}catch(e){return!0}}(),t.exports.binaryFeatures=i
var r=t.exports.BlobBuilder
"undefined"!=typeof window&&(r=t.exports.BlobBuilder=window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder||window.BlobBuilder),n.prototype.append=function(e){"number"==typeof e?this._pieces.push(e):(this.flush(),this._parts.push(e))},n.prototype.flush=function(){if(this._pieces.length>0){var e=new Uint8Array(this._pieces)
i.useArrayBufferView||(e=e.buffer),this._parts.push(e),this._pieces=[]}},n.prototype.getBuffer=function(){if(this.flush(),i.useBlobBuilder){for(var e=new r,t=0,n=this._parts.length;n>t;t++)e.append(this._parts[t])
return e.getBlob()}return new Blob(this._parts)},t.exports.BufferBuilder=n},{}],12:[function(e,t){function n(e,t){return this instanceof n?(this._dc=e,i.debug=t,this._outgoing={},this._incoming={},this._received={},this._window=1e3,this._mtu=500,this._interval=0,this._count=0,this._queue=[],void this._setupDC()):new n(e)}var i=e("./util")
n.prototype.send=function(e){var t=i.pack(e)
return t.size<this._mtu?void this._handleSend(["no",t]):(this._outgoing[this._count]={ack:0,chunks:this._chunk(t)},i.debug&&(this._outgoing[this._count].timer=new Date),this._sendWindowedChunks(this._count),void(this._count+=1))},n.prototype._setupInterval=function(){var e=this
this._timeout=setInterval(function(){var t=e._queue.shift()
if(t._multiple)for(var n=0,i=t.length;i>n;n+=1)e._intervalSend(t[n])
else e._intervalSend(t)},this._interval)},n.prototype._intervalSend=function(e){var t=this
e=i.pack(e),i.blobToBinaryString(e,function(e){t._dc.send(e)}),0===t._queue.length&&(clearTimeout(t._timeout),t._timeout=null)},n.prototype._processAcks=function(){for(var e in this._outgoing)this._outgoing.hasOwnProperty(e)&&this._sendWindowedChunks(e)},n.prototype._handleSend=function(e){for(var t=!0,n=0,i=this._queue.length;i>n;n+=1){var r=this._queue[n]
r===e?t=!1:r._multiple&&-1!==r.indexOf(e)&&(t=!1)}t&&(this._queue.push(e),this._timeout||this._setupInterval())},n.prototype._setupDC=function(){var e=this
this._dc.onmessage=function(t){var n=t.data,r=n.constructor
if(r===String){var o=i.binaryStringToArrayBuffer(n)
n=i.unpack(o),e._handleMessage(n)}}},n.prototype._handleMessage=function(e){var t,n=e[1],r=this._incoming[n],o=this._outgoing[n]
switch(e[0]){case"no":var s=n
s&&this.onmessage(i.unpack(s))
break
case"end":if(t=r,this._received[n]=e[2],!t)break
this._ack(n)
break
case"ack":if(t=o){var a=e[2]
t.ack=Math.max(a,t.ack),t.ack>=t.chunks.length?(i.log("Time: ",new Date-t.timer),delete this._outgoing[n]):this._processAcks()}break
case"chunk":if(t=r,!t){var c=this._received[n]
if(c===!0)break
t={ack:["ack",n,0],chunks:[]},this._incoming[n]=t}var u=e[2],p=e[3]
t.chunks[u]=new Uint8Array(p),u===t.ack[2]&&this._calculateNextAck(n),this._ack(n)
break
default:this._handleSend(e)}},n.prototype._chunk=function(e){for(var t=[],n=e.size,r=0;n>r;){var o=Math.min(n,r+this._mtu),s=e.slice(r,o),a={payload:s}
t.push(a),r=o}return i.log("Created",t.length,"chunks."),t},n.prototype._ack=function(e){var t=this._incoming[e].ack
this._received[e]===t[2]&&(this._complete(e),this._received[e]=!0),this._handleSend(t)},n.prototype._calculateNextAck=function(e){for(var t=this._incoming[e],n=t.chunks,i=0,r=n.length;r>i;i+=1)if(void 0===n[i])return void(t.ack[2]=i)
t.ack[2]=n.length},n.prototype._sendWindowedChunks=function(e){i.log("sendWindowedChunks for: ",e)
for(var t=this._outgoing[e],n=t.chunks,r=[],o=Math.min(t.ack+this._window,n.length),s=t.ack;o>s;s+=1)n[s].sent&&s!==t.ack||(n[s].sent=!0,r.push(["chunk",e,s,n[s].payload]))
t.ack+this._window>=n.length&&r.push(["end",e,n.length]),r._multiple=!0,this._handleSend(r)},n.prototype._complete=function(e){i.log("Completed called for",e)
var t=this,n=this._incoming[e].chunks,r=new Blob(n)
i.blobToArrayBuffer(r,function(e){t.onmessage(i.unpack(e))}),delete this._incoming[e]},n.higherBandwidthSDP=function(e){var t=navigator.appVersion.match(/Chrome\/(.*?) /)
if(t&&(t=parseInt(t[1].split(".").shift()),31>t)){var n=e.split("b=AS:30"),i="b=AS:102400"
if(n.length>1)return n[0]+i+n[1]}return e},n.prototype.onmessage=function(){},t.exports.Reliable=n},{"./util":13}],13:[function(e,t){var n=e("js-binarypack"),i={debug:!1,inherits:function(e,t){e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}})},extend:function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])
return e},pack:n.pack,unpack:n.unpack,log:function(){if(i.debug){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t]
e.unshift("Reliable: "),console.log.apply(console,e)}},setZeroTimeout:function(e){function t(t){i.push(t),e.postMessage(r,"*")}function n(t){t.source==e&&t.data==r&&(t.stopPropagation&&t.stopPropagation(),i.length&&i.shift()())}var i=[],r="zero-timeout-message"
return e.addEventListener?e.addEventListener("message",n,!0):e.attachEvent&&e.attachEvent("onmessage",n),t}(this),blobToArrayBuffer:function(e,t){var n=new FileReader
n.onload=function(e){t(e.target.result)},n.readAsArrayBuffer(e)},blobToBinaryString:function(e,t){var n=new FileReader
n.onload=function(e){t(e.target.result)},n.readAsBinaryString(e)},binaryStringToArrayBuffer:function(e){for(var t=new Uint8Array(e.length),n=0;n<e.length;n++)t[n]=255&e.charCodeAt(n)
return t.buffer},randomToken:function(){return Math.random().toString(36).substr(2)}}
t.exports=i},{"js-binarypack":10}]},{},[3])

function Taskbar(){function t(){if(app.mobile){var t=$("#appTaskbar .badge")
t.text(n?n:"")}}var e=$("#appTaskbar ul"),n=0
this.createButton=function(t,n){var o=$("<li/>"),a=$("<a/>").attr("href","#").addClass("active").appendTo(o)
return a.$title=$("<span/>").addClass("title").html(t).appendTo(a),a.click(function(t){t.preventDefault(),n($(this))}),o.appendTo(e),a},this.setButtonTitle=function(t,e){t.$title.html(e)},this.setButtonCounter=function(e,o){return e.$counter&&(n-=Number(e.$counter.text())),o===!1?(e.$counter&&(e.$counter.remove(),delete e.$counter),void t()):(e.$counter||(e.$counter=$("<span/>").addClass("counter").appendTo(e)),e.$counter.text(o),n+=o,void t())},this.setButtonIcon=function(t,e){return e===!1?void(t.$icon&&(t.$icon.remove(),delete t.$icon)):(t.$icon||(t.$icon=$("<span/>").addClass("icon").prependTo(t)),void t.$icon.html('<i class="fa fa-fw fa-'+e+'"></i>'))},this.removeButton=function(t){t.parent().remove()}}
function DialogsManager(i){var o={}
this.taskbar=new Taskbar,this.create=function(t){var i=t.id
if(this.isDialogExists(i))return void this.getDialog(i).bringToFront()
var e=new Dialog(this,t)
return o[i]=e,e},this.message=function(i,o){return this.create({id:"message-"+(new Date).getTime(),title:t("messageDialog"),content:tpl("messageDialogTemplate",{message:i}),modal:o,buttons:[{id:"ok","class":"btn-default",title:t("ok"),click:function(){this.remove()}}]})},this.confirm=function(i,o,e){return this.create({id:"confirm-"+(new Date).getTime(),title:t("confirmDialog"),content:tpl("messageDialogTemplate",{message:i}),buttons:[{id:"yes","class":"btn-success",title:t("yes"),click:function(){o&&o(),this.remove()}},{id:"no","class":"btn-danger",title:t("no"),click:function(){e&&e(),this.remove()}}]})},this.prompt=function(i){var o=$.extend({type:"string",title:"",text:"",checkbox:!1,onResult:!1,onCancel:!1,modal:!1},i),e=$("<div/>").addClass("dialog-prompt")
if($("<div/>").addClass("prompt-text").html(o.text).appendTo(e),"string"===o.type&&$("<input/>").addClass("form-control").attr("type","text").appendTo(e),"text"===o.type&&$("<textarea/>").addClass("form-control").appendTo(e),o.checkbox){var n=$("<div/>").addClass("checkbox").appendTo(e),s=$("<label/>").html(o.checkbox).appendTo(n)
$("<input/>").attr("type","checkbox").prependTo(s)}return this.create({id:"prompt-"+(new Date).getTime(),title:o.title,content:e.get(0).outerHTML,width:400,modal:o.modal,buttons:[{id:"ok","class":"btn-primary",title:t("ok"),click:function(){if(o.onResult){var t=this.body().find(".form-control").val(),i=o.checkbox?this.body().find("input:checkbox").prop("checked"):!1
o.onResult(t,i)}this.remove()}},{id:"cancel","class":"btn-default",title:t("cancel"),click:function(){o.onCancel&&o.onCancel(),this.remove()}}],onCreate:function(){var t=this
setTimeout(function(){t.body().find(".form-control").focus()},100)}})},this.isDialogExists=function(t){return t in o},this.getDialog=function(t){return this.isDialogExists(t)?o[t]:null},this.each=function(t){$.each(o,function(i,o){t(i,o)})},this.unfocusOther=function(t){this.each(function(i,o){i!==t&&o.setFocus(!1)})},this.unfocusAll=function(){this.each(function(t,i){i.setFocus(!1)})},this.remove=function(t){delete o[t]},this.body=function(){return i.body()}}function Dialog(i,o){var e,n,s,a,l,c,u=this,d=$.extend({id:"",modal:!1,title:"",titleCount:!1,titleIcon:!1,content:"",width:!1,height:!1,isCloseable:!0,isHideBottomBar:!1,buttons:!1,titleButtons:!1,onCreate:!1,onClose:!1,onResize:!1,onShow:!1,onFocus:!1,onBlur:!1},o),r=!1,h="object"==typeof d.content,f={}
this.init=function(){this.addToTaskbar(),this.build(),this.resizeAndCenter(),this.bringToFront(),this.resizeBody()},this.build=function(){if(d.modal&&!app.mobile&&(n=$("<div/>").addClass("dialog-modal-overlay").appendTo(i.body()).show()),s=$(tpl("dialogTemplate")).attr("id",d.id).hide(),a=$(".title",s),l=$(".body",s),c=s.find(".buttons"),this.buildTitleButtons(),d.modal&&!app.mobile&&s.addClass("dialog-modal"),h||(this.buildButtons(),l.html(d.content)),h){var t=$("<div/>").addClass("loading").html('<i class="fa fa-spin fa-gear"></i>')
t.appendTo(l)
var o=d.content.url,e=d.content.data||{},r=d.content.type||"html"
$.post(o,e,function(t){d.width||(s.css({width:"auto"}),l.css({width:"auto"})),d.height||(s.css({height:"auto"}),l.css({height:"auto"})),l.html("html"==r?t:t.html),h=!1,d.buttons&&u.buildButtons(),"function"==typeof d.content.onLoad&&d.content.onLoad(u,t),u.resizeAndCenter(),u.resizeBody()},r)}d.titleIcon!==!1&&(a.$icon=$("<span/>").addClass("icon").appendTo(a),this.setTitleIcon(d.titleIcon)),$("<span/>").addClass("text").html(d.title).appendTo(a),d.titleCount!==!1&&(a.$counter=$("<span/>").addClass("counter").appendTo(a),this.setTitleCounter(d.titleCount)),app.mobile||(s.draggable({handle:".title-drag"}),s.resizable({minHeight:50,minWidth:50,resize:function(){u.resizeBody()}})),s.mousedown(function(){u.bringToFront()}),s.appendTo(i.body()),d.onCreate&&d.onCreate.call(u)},this.buildTitleButtons=function(){var o=d.titleButtons||[]
d.isCloseable&&o.push({icon:"times",title:t("close"),click:function(){return d.closeConfirm?void i.confirm(d.closeConfirm,function(){u.close()}):void u.close()}}),d.modal||app.mobile||o.push({icon:"caret-down",title:t("minimize"),click:function(){u.toggle()}}),o&&$.each(o,function(t,i){var o=$("<button/>").addClass("title-button").html('<i class="fa fa-'+i.icon+'"></i>'+(i.text?" "+i.text:"")).attr("title",i.title).appendTo(a)
o.click(function(t){t.preventDefault(),i.click&&i.click.call(u)})})},this.buildButtons=function(){c.empty(),d.buttons?($.each(d.buttons,function(t,i){var o=[]
i.icon&&o.push('<i class="fa fa-'+i.icon+'"></i>'),i.title&&o.push(i.title)
var e=$("<button/>").addClass("btn").addClass(i["class"]).html(o.join(" ")).appendTo(c)
i.hint&&e.attr("title",i.hint),"function"==typeof i.click&&e.click(function(){i.click.call(u)}),f[i.id]=e}),c.show()):(d.isHideBottomBar||app.mobile)&&(c.remove(),c=!1)},this.resizeAndCenter=function(){if(!app.mobile){h&&!d.height&&s.css({height:"150px"}),h&&!d.width&&s.css({width:"250px"}),d.width&&s.css({width:d.width+"px"}),d.height&&s.css({height:d.height+"px"})
var t=100,i=$(window).width(),o=window.innerHeight,e=s.outerWidth(),n=s.outerHeight()
e>i-t&&(s.css({width:i-t+"px"}),e=i-t),n>o-t&&(s.css({height:o-t+"px"}),n=o-t)
var a=Math.round(i/2-e/2),l=Math.round(o/2-n/2)
s.css({left:a+"px",top:l+"px"}).show()}},this.addToTaskbar=function(){e=i.taskbar.createButton(d.title,function(){u.toggle(),"function"==typeof d.onShow&&u.isVisible()&&d.onShow.call(u)})},this.setFocus=function(t){t!==r&&(r=t,s.toggleClass("inactive",!t),t&&"function"==typeof d.onFocus&&d.onFocus.call(u),t||"function"!=typeof d.onBlur||d.onBlur.call(u))},this.setOption=function(t,i){d[t]=i,"buttons"==t&&this.buildButtons()},this.loadContent=function(t){var i=t.url,o=t.data||{}
l.empty()
var e=$("<div/>").addClass("loading").html('<i class="fa fa-spin fa-gear"></i>')
e.appendTo(l),$.post(i,o,function(i){l.html(i),"function"==typeof t.onLoad&&t.onLoad(u)},"html")},this.isFocused=function(){return r},this.body=function(){return l},this.window=function(){return s},this.setTitle=function(t){$(".text",a).html(t),i.taskbar.setButtonTitle(e,t)},this.setTitleCounter=function(t){a.$counter&&(a.$counter.html(t),a.$counter.toggle(0!=t),i.taskbar.setButtonCounter(e,t?t:!1))},this.setTitleIcon=function(t){a.$icon.html('<i class="fa fa-'+t+'"></i>'),i.taskbar.setButtonIcon(e,t?t:!1)},this.getButton=function(t){return f[t]},this.getButtons=function(){return f},this.bringToFront=function(){d.modal&&!app.mobile||(s.show(),$(".dialog:visible:not(.dialog-modal)",i.body()).css("z-index",100),i.unfocusOther(d.id),s.css("z-index",101),this.isFocused()||this.setFocus(!0),e.addClass("active"))},this.hide=function(){s.hide(),u.setFocus(!1),e.removeClass("active")},this.toggle=function(){return app.mobile?void u.bringToFront():(n&&n.toggle(),void(u.isVisible()?u.hide():u.bringToFront()))},this.isVisible=function(){return s.is(":visible")},this.remove=function(){n&&n.remove(),s.remove(),i.taskbar.removeButton(e),i.remove(d.id)},this.close=function(){this.remove(),"function"==typeof d.onClose&&d.onClose.call(u)},this.resizeBody=function(){var t=app.mobile?app.height:s.outerHeight(!0),i=t-a.outerHeight(!0)-(c?c.outerHeight(!0):0)
l.css({height:i+"px"}),"function"==typeof d.onResize&&d.onResize.call(u,l)},this.init()}
function ContextMenuManager(){var t=this
this.activeMenus=[],$("body *").click(function(e){0!==t.activeMenus.length&&(t.activeMenus=[],$(".contextmenu:visible").hide())}),this.createMenu=function(t){return new ContextMenu(t)},this.show=function(t){-1===this.activeMenus.indexOf(t)&&this.activeMenus.push(t)},this.hide=function(t){this.activeMenus.splice(this.activeMenus.indexOf(t),1)}}function ContextMenu(t){var e=this,i=$.extend({id:"",items:[]},t)
this.id=i.id,this.data={}
var n=$("<div/>").attr("id",i.id).addClass("contextmenu").addClass("dropdown").addClass("clearfix"),s=$("<ul/>").addClass("dropdown-menu").appendTo(n),a=$("<li/>").addClass("dropdown-header").hide().appendTo(s)
this.addItem=function(t){var a=$("<li/>").appendTo(s),d=$("<a/>").appendTo(a)
$("<span/>").html(t.title).appendTo(d),t.icon&&d.prepend('<i class="fa fa-fw fa-'+t.icon+'"></i> '),t.dom=a,d.click(function(){app.contextMenuManager.hide(i.id),n.hide(),t.click&&t.click(e.data)})},$.each(i.items,function(t,i){e.addItem(i)}),n.appendTo(app.body()),this.set=function(t){return this.data=$.extend(this.data,t),this},this.show=function(t,e){if("undefined"!=typeof e?a.html(e).show():a.hide(),!app.mobile){var i=t.pageX-5,s=t.pageY-5
n.css({left:i+"px",top:s+"px"})}n.show(),t.stopPropagation(),app.contextMenuManager.show(this.id)},this.setItemTitle=function(t,e){i.items[t].dom.find("span").html(e)},this.hideItem=function(t){i.items[t].dom.hide()},this.showItem=function(t){i.items[t].dom.show()},this.toggleItem=function(t,e){e?this.showItem(t):this.hideItem(t)},this.enableItem=function(t){i.items[t].dom.removeClass("disabled")},this.disableItem=function(t){i.items[t].dom.addClass("disabled")},this.toggleEnabledItem=function(t,e){e?this.enableItem(t):this.disableItem(t)}}
function TextLobbyController(e,o){function i(){s=e.dialogs.create({id:"text-lobby",width:1500,height:600,title:t("membersList",{count:0}),content:tpl("textLobbyTemplate"),isCloseable:!1})
var o={request:{title:t("sendChatRequest"),icon:"comment",click:function(t){e.controllers.textChat.sendRequest(t.userId,t.userName)}},profile:{title:t("viewProfile"),icon:"search",click:function(t){e.openProfile(t.userId,t.userName)}}}
e.admin&&(o.log={title:t("viewLog"),icon:"history",click:function(t){e.moderator.showMessagesLog(t.userId,t.userName)}}),r=e.contextMenuManager.createMenu({id:"textChatLobbyContextMenu",items:o}),e.mobile&&r.addItem({title:t("cancel"),icon:"times"}),a=s.body().find("#textLobbyMembersList"),e.mobile||(s.$membersPane=s.body().find(".members-scroll"),n(s,s.body().height()),s.setOption("onResize",function(e){n(this,e.height())}),a.tablesorter({widgets:["stickyHeaders"],widgetOptions:{stickyHeaders_attachTo:"#text-lobby .members-scroll"}})),l=a.find(".list-body"),l.on("click",".item",function(t){var o=$(this),i=o.attr("id"),n=$(".name span",o).html()
i!==e.userId&&r.set({userId:i,userName:n}).show(t,n)}),s.body().find(".toolbar .room-link").click(function(t){t.preventDefault()
var o=$(this),i=o.data("id")
return 1==t.button&&e.admin?void e.admin.spectatePublicRoom(i):void e.controllers.textRooms.joinPublicRoom(i)}),s.body().find(".toolbar .all-rooms").click(function(t){t.preventDefault(),e.controllers.textRooms.openRoomsList()})}function n(e,t){e.$membersPane.css({height:t-60-$(".hl-notice").height()+"px"})}var s,r,a,l,c=this
i(),this.onMemberJoin=function(o){var i=$(tpl("textLobbyMemberTemplate",o))
o.name.color&&i.find(".name").css({color:o.name.color}),i.appendTo(l),e.mobile||a.trigger("update"),s.setTitle(t("membersList",{count:e.getMembersCount()}))},this.onMemberLeave=function(o){$(".item#"+o,l).remove(),a.trigger("update"),s.setTitle(t("membersList",{count:e.getMembersCount()}))},this.onMemberUpdate=function(e){c.onMemberLeave(e.id),c.onMemberJoin(e)},this.onUpdatePublicCounts=function(e){s.body().find(".toolbar .room-link").each(function(t,o){var i=$(o),n=i.data("id"),s=n in e?"("+e[n]+")":""
i.find("span").text(s).toggle(""!=s)})}}
function TextChatController(e,i){function n(){o()}function o(){i.on("request received",function(e){"textchat"===e.type&&c(e.senderId)}),i.on("request canceled",function(e){if("textchat"===e.type&&e.fromId in s){var t=s[e.fromId]
t.remove(),delete s[e.fromId]}}),i.on("request declined",function(i){if("textchat"===i.type&&i.fromId in r){var n=r[i.fromId]
n.dialog&&n.dialog.remove(),e.dialogs.message(t("requestDeclined",{name:n.name})),delete r[i.fromId]}}),i.on("request accepted",function(e){if("textchat"===e.type&&e.fromId in r){var t=r[e.fromId]
t.dialog.remove(),delete r[e.fromId]}})}function c(i){if(!(i in s)){i in u?u[i]+=1:u[i]=1
var n=u[i]
e.playSound("notifySound")
var o=e.getMember(i),c=[]
c.push({id:"accept","class":"btn-success",title:t("accept"),click:function(){a(o.id),this.remove()}}),c.push({id:"profile","class":"btn-default",title:t("viewProfile"),click:function(){e.openProfile(o.id,o.name.full)}}),n>2&&c.push({id:"block","class":"btn-danger",title:t("ignore"),click:function(){var i=this
e.dialogs.confirm(t("ignoreConfirm",{name:o.name.full}),function(){e.addToBlackList(o.id),d(o.id),i.remove()})}}),c.push({id:"cancel","class":"btn-danger",title:t("decline"),click:function(){d(o.id),this.remove()}}),s[o.id]=e.dialogs.create({id:"request-"+o.id,title:t("pendingRequest"),content:tpl("chatRequestTemplate",o),buttons:c,onClose:function(){d(o.id)}})}}function a(e){i.emit("request accept",{type:"textchat",toId:e}),delete s[e]}function d(e){i.emit("request decline",{type:"textchat",toId:e}),delete s[e]}function l(e){i.emit("request cancel",{type:"textchat",toId:e})}var s={},r={},u={}
n(),this.sendRequest=function(n,o){if(n!==e.userId){if(n in s){var c="request-"+n
return void(e.dialogs.isDialogExists(c)&&e.dialogs.getDialog(c).bringToFront())}i.emit("request send",{type:"textchat",toId:n}),r[n]={name:o,dialog:e.dialogs.create({id:"invite-"+n,title:t("pendingInvitation"),content:tpl("messageDialogTemplate",{message:t("pendingInvitationInfo",{name:o})}),buttons:[{id:"cancel","class":"btn-danger",title:t("cancel"),click:function(){l(n),this.remove()}}],onClose:function(){l(n)}})}}}}
function TextRoomsController(e,o){function i(){w=e.contextMenuManager.createMenu({id:"roomMembersContextMenu",items:[{title:t("viewProfile"),click:function(t){e.openProfile(t.userId,t.userName)}}]}),n()}function n(){o.on("room open",function(e){if("textchat"===e.room.type){var t=e.room.id,o=e.room
if(t in S){var i=C(t)
return r(o,i),void i.bringToFront()}var n=e.log?e.log:[],a=!!e.spectate
s(o,n,a)}}),o.on("room message",function(e){"textchat"===e.type&&d(e.id,e.sender,e.msg)}),o.on("room suggest",function(e){"textchat"===e.type&&d(e.id,e.sender,e.msg)}),o.on("room joined",function(e){b(e.id,e.member)}),o.on("room leaved",function(e){"textchat"===e.type&&y(e.id,e.userId)}),o.on("start type",function(e){var t=C(e.id).$membersList,o=t.find("#member-"+e.sender)
$("i.gender",o).hide(),$("i.typing",o).css("display","inline-block")}),o.on("end type",function(e){var t=C(e.id).$membersList,o=t.find("#member-"+e.sender)
$("i.gender",o).show(),$("i.typing",o).hide()}),o.on("room suggest cooldown",function(e){"textchat"===e.type&&h(e.id,e.delay)})}function s(i,n,s){if(!(i.id in S)){var d="",f=e.dialogs.create({id:"room-"+i.id,title:"",titleCount:0,titleIcon:"comment-o",content:tpl("chatRoomTemplate"),width:600,height:450,isHideBottomBar:!0,onClose:function(){g(i.id)},onFocus:function(){u(i.id),c(this)},onBlur:function(){m(this)}})
if(i["public"]||(f.body().find(".chat-room").addClass("private"),f.$suggestBtn=f.body().find(".suggest-hint .btn"),f.$suggestBtn.click(function(n){n.preventDefault(),e.dialogs.confirm(t("suggestConfirm"),function(){o.emit("room suggest",i.id)})})),f.$messagesCell=f.body().find(".messages"),f.$membersCell=f.body().find(".members"),a(f,f.body().height()),f.setOption("onResize",function(e){a(this,e.height())}),S[i.id]={dialog:f,id:i.id,members:i.members,"public":i["public"],unreadCount:0,fontSize:z,isTyping:!1,typingInterval:null,autoScroll:!0},f.$membersList=f.body().find(".members ul"),f.$emoticonsPane=f.body().find(".emoticons-pane"),e.mobile?f.$zoomPane=f.body().find(".zoom-pane"):f.$zoomPane=f.body().find(".opt-zoom"),e.mobile||(f.$settingsPane=f.body().find(".settings-pane"),f.$settingsPane.find("input:radio").click(function(){$(this).is(":checked")&&e.setUserOption("send_key",$(this).val())}),f.body().find(".settings-toggle").click(function(t){var o=e.getUserOption("send_key",M)
f.$settingsPane.find(".opt-send-key input[value="+o+"]").prop("checked",!0),f.$settingsPane.toggle()}),f.body().find(".translate").click(function(o){o.preventDefault()
var i=window.getSelection(),n=i.toString().trim()
return n?void window.open("https://translate.google.com/?q="+encodeURIComponent(n)):void e.dialogs.message(t("translateNone"))})),d=r(i,f),f.setTitle(d),n){for(var p=$(".messages ul",f.body()),b=n.length-1;b>=0;b--){var y=n[b],h=$(tpl("roomMessageTemplate",{name:y.sender.name,message:parseMsg(y.text)}))
y.sender.id===e.userId&&h.addClass("my"),h.appendTo(p)}m(f),$(".messages .scroll",f.body()).scrollTop(1e9)}if(e.mobile||($("input.message",f.body()).focus(),f.$tooltip=f.body().find(".tooltip")),e.mobile&&(f.$membersCount=f.body().find(".members .count"),f.$membersCount.text(Object.keys(i.members).length),f.body().find(".members .shortcut").click(function(e){e.preventDefault(),e.stopPropagation(),$(this).parent().toggleClass("visible")}),f.body().find(".members").click(function(e){e.stopPropagation(),$(this).toggleClass("visible")})),s)return void f.body().find(".controls > div").remove()
var v=f.body().find("input.message")
v.keydown(function(t){x(S[i.id])
var o=e.getUserOption("send_key",M)
if((t.ctrlKey||t.metaKey||o!=D)&&13===t.which){v=$(this)
var n=v.val().trim()
if(!n)return
T(S[i.id]),l(i.id,n),v.val("").attr("placeholder",""),e.mobile&&v.blur()}}),e.mobile&&f.body().find(".zoom-toggle").click(function(e){f.$zoomPane.toggle()}),f.$zoomPane.find(".zoom-out").click(function(e){e.preventDefault(),S[i.id].fontSize!=z&&(S[i.id].fontSize-=4,f.$messagesCell.css({fontSize:S[i.id].fontSize+"px"}))}),f.$zoomPane.find(".zoom-in").click(function(e){e.preventDefault(),S[i.id].fontSize>=48||(S[i.id].fontSize+=4,f.$messagesCell.css({fontSize:S[i.id].fontSize+"px"}))}),f.body().find(".emoticons-toggle").click(function(e){f.$emoticonsPane.toggle()}),f.$emoticonsPane.click(function(e){e.preventDefault()
var t=$(this),o=Math.floor((e.pageX-t.offset().left)/24),i=Math.floor((e.pageY-t.offset().top)/24),n=8*i+o,s=v.val().trim()
v.val(s+"*"+emoticons[n]+"* ").focus(),t.hide()}),f.body().find(".messages .scroll").scroll(function(e){var t=$(this),o=t.scrollTop(),n=t.get(0).scrollHeight,s=t.height()
s+20>=n-o?S[i.id].autoScroll=!0:S[i.id].autoScroll=!1})}}function a(e,t){e.$messagesCell.css({height:t-55+"px"}),e.$membersCell.css({height:t-55+"px"})}function r(o,i){i.$membersList.empty()
var n=o["public"]?e.langs[o.id]:""
return o["public"]&&"team"==o.id&&(n=t("teamRoom")),$.each(o.members,function(t,i){i=$.extend(e.getMember(t),i),f(o.id,i),o["public"]||t===e.userId||(n=i.name.full)}),n}function l(e,t){o.emit("room send",{roomId:e,msg:t})}function d(o,i,n){if(o in S&&!e.isInBlackList(i.id)){var s,a=S[o],r=a.dialog
"system"===i.id?s=$(tpl("roomSystemMessageTemplate",{icon:i.icon,"class":i["class"]?i["class"]:"",message:n})):"topic-bot"===i.id?(s=$(tpl("roomMessageTemplate",{name:t("topicBotName"),color:"#000",message:t("topicBotSuggestion",{question:n})})),s.addClass("topic-bot")):(s=$(tpl("roomMessageTemplate",{name:i.name,color:i.color,message:parseMsg(n)})),i.id===e.userId&&s.addClass("my")),s.appendTo($(".messages ul",r.body())),a.autoScroll&&$(".messages .scroll",r.body()).scrollTop(1e9),r.isFocused()||(a.unreadCount++,r.setTitleCounter(a.unreadCount)),e.isActive()||e.counter.increment()}}function m(e){$(".messages ul .divider",e.body()).remove()
var t=$("<li/>").addClass("divider")
t.appendTo($(".messages ul",e.body()))}function c(e){$(".messages ul .divider:last-child",e.body()).remove()}function u(e){if(e in S){var t=S[e]
t.unreadCount>0&&(t.unreadCount=0,t.dialog.setTitleCounter(0))}}function g(e){e in S&&(delete S[e],o.emit("room leave",e))}function f(t,o){p(t,o.id)
var i=C(t).$membersList,n=$("<li/>").attr("id","member-"+o.id).appendTo(i),s="nameInRoom"in o?o.nameInRoom:o.name.first,a=$("<a/>").attr("href","#").addClass("gender-"+o.genderClass).html('<i class="fa fa-fw fa-pencil typing"></i> <i class="fa fa-fw fa-'+o.genderClass+' gender"></i> '+s).appendTo(n)
o.name.color&&a.css({color:o.name.color}),a.click(function(t){t.preventDefault(),t.stopPropagation(),o.id!=e.userId&&e.openProfile(o.id,o.name.full)}),e.mobile||a.hover(function(e){var n=S[t].dialog.$tooltip
n.find(".content").html(tpl("roomTooltipTemplate",o))
var s=$(e.target).position(),a=i.position()
n.css({right:a.left+i.width()-s.left+18+"px",top:s.top-4+"px"}).show()},function(e){var o=S[t].dialog.$tooltip
o.hide()})}function p(e,t){var o=C(e).$membersList
$("#member-"+t,o).remove()}function b(t,o){var i=S[t]
o=$.extend(e.getMember(o.id),o),i.members[o.id]=o,f(t,o),i.dialog.$membersCount&&i.dialog.$membersCount.text(Object.keys(i.members).length)}function y(o,i){if(o in S){var n=S[o]
if(i in n.members){if(p(o,i),!n["public"]){var s=e.getMember(i).name.first
d(o,{id:"system",icon:"sign-out"},t("memberLeftRoom",{name:s}))}delete n.members[i],n.dialog.$membersCount&&n.dialog.$membersCount.text(Object.keys(n.members).length)}}}function h(e,t){if(e in S){var o=S[e]
if(o.dialog.$suggestBtn){var i=o.dialog.$suggestBtn
i.data("title",i.text()).prop("disabled",!0).text(t),o.suggestDelay=t,setTimeout(function(){v(e,i)},1e3)}}}function v(e,t){if(e in S){var o=S[e]
return o.suggestDelay--,o.suggestDelay>0?(t.text(o.suggestDelay),void setTimeout(function(){v(e,t)},1e3)):void t.text(t.data("title")).data("title","").prop("disabled",!1)}}function C(e){return e in S?S[e].dialog:!1}function x(e){e.isTyping&&clearTimeout(e.typingInterval),e.isTyping||(e.isTyping=!0,o.emit("start type",e.id)),e.typingInterval=setTimeout(function(){T(e)},1500)}function T(e){e.isTyping&&(e.isTyping=!1,clearTimeout(e.typingInterval),o.emit("end type",e.id))}function k(e,t){e.$roomsList.css({height:t-42+"px"})}var w,z=13,P=this,S={},I={},M=1,D=2
i(),this.onMemberUpdate=function(e){$.each(S,function(t,o){e.id in o.members&&f(t,e)})},this.joinPublicRoom=function(t){o.emit("text join public room",t),e.dialogs.isDialogExists("rooms-list")&&e.dialogs.getDialog("rooms-list").remove()},this.openRoomsList=function(){var o=e.dialogs.create({id:"rooms-list",title:t("publicRoomsList"),titleIcon:"comments-o",content:{url:"/rooms/list",onLoad:function(){o.$roomsList=o.body().find(".rooms-list"),k(o,o.body().height()),o.setOption("onResize",function(e){k(this,e.height())}),o.isHideEmpty=!1,P.onUpdatePublicCounts(I),o.body().find("#hide-empty").change(function(){o.isHideEmpty=!o.isHideEmpty,o.$roomsList.find(".empty").toggleClass("hide"),o.$roomsList.find(".divider").toggle()})}},width:350,height:600})},this.onUpdatePublicCounts=function(t){I=t
var o=e.dialogs.getDialog("rooms-list")
o&&o.body().find(".room-link").each(function(e,i){var n=$(i),s=n.data("id"),a=s in t?t[s].toString():""
n.toggleClass("empty",""===a).toggleClass("hide",""===a&&o.isHideEmpty),n.find("span").text(a).toggle(""!==a)})}}function join(e,t){return e.preventDefault(),1==e.button&&app.admin?void app.admin.spectatePublicRoom(t):void app.controllers.textRooms.joinPublicRoom(t)}function insert(e){$span=$(e)
var t=$span.text().replace(/:+$/,""),o=$span.parents(".dialog").find(".message")
if(o){var i=o.val()
o.val(i?i.trim()+" "+t:t+", ").focus()}}var emoticons=["smile","confuse","wink","waii","guesswho","exciting","grin","lol","unhappy","snooty","amazing","waaaht","yuush","sad","crazy","mad","what","angel","love","kiss","baby","dead","beaten","cool","tongue","shame","cry","doubt","daddy","detective","nerd","horror","whew","reading","doze","sleep","silent","shocked","sick","devil","heart","cup","food","eye","flower","globe","crown","warn"]

function VoiceChatController(e,o){function i(){return U?void U.bringToFront():(U=e.dialogs.create({id:"voice-lobby",width:800,height:500,title:t("voiceChatLobby",{count:0}),content:tpl("voiceLobbyTemplate"),onClose:function(){k()}}),e.mobile||(U.$membersPane=U.body().find(".members-scroll"),a(U,U.body().height()),U.setOption("onResize",function(e){a(this,e.height())}),P=U.body().find("#voiceLobbyMembersList"),x=U.body().find(".toolbar"),P.tablesorter({widgets:["stickyHeaders"],widgetOptions:{stickyHeaders_attachTo:"#voice-lobby .members-scroll"}})),j=P.find(".list-body"),j.on("click","tr",function(o){var i=$(this),n=i.attr("id"),a=$(".name span",i).html()
n!==e.userId&&(D[n].busy?(q.setItemTitle("call",t("voiceChatCallBusy")),q.disableItem("call")):(q.setItemTitle("call",t("voiceChatCall")),q.enableItem("call")),q.set({userId:n,userName:a}).show(o,a))}),void U.body().find("#hide-busy").change(function(){P.toggleClass("hide-busy")}))}function n(){o.on("voice members list",function(e){$.each(e,function(e,o){T(o)})}),o.on("voice member in",function(e){T(e)}),o.on("voice member out",function(e){L(e)}),o.on("voice member updated",function(e){R(e)}),o.on("request received",function(e){"voicechat"===e.type&&l(e.senderId)}),o.on("request canceled",function(o){"voicechat"===o.type&&V.from==o.fromId&&(e.stopSound("ringSound"),V.dialog.remove(),N=!1)}),o.on("request declined",function(o){"voicechat"===o.type&&F.to==o.fromId&&(F.dialog.remove(),e.dialogs.message(t("callDeclined",{name:F.name})))}),o.on("room open",function(o){if("voicechat"===o.room.type){var t
$.each(o.room.members,function(o,i){o!=e.userId&&(t=i)}),o.owner==e.userId?m(o.room,t):f(o.room,t)}}),o.on("room message",function(e){"voicechat"===e.type&&b(e.id,e.sender,e.msg)}),o.on("room leaved",function(e){"voicechat"===e.type&&M()}),o.on("voice peer ready",function(){F.peerReady=!0,z&&(B=z.call(F.to,O),B.on("stream",C))}),o.on("voice status",function(e){$.each(e,function(e,o){S(e,o)})})}function a(e,o){e.$membersPane.css({height:o-42+"px"})}function s(){return navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia,DetectRTC.isWebRTCSupported&&navigator.getUserMedia?void navigator.getUserMedia({audio:!0,video:!1},function(e){O=e,n(),o.emit("voice join"),H=!0,P.show(),U.body().find(".toolbar").show(),U.body().find(".list-overlay").hide()},function(){U.body().find(".list-overlay").hide(),U.body().find(".no-perms").show()}):(U.body().find(".list-overlay").hide(),void U.body().find(".not-supported").show())}function c(i,n){i in D&&(D[i].busy||(o.emit("request send",{type:"voicechat",toId:i}),F={to:i,name:n,peerReady:!1,dialog:e.dialogs.create({id:"call-"+i,title:t("pendingCall"),modal:!0,content:tpl("messageDialogTemplate",{message:t("pendingCallInfo",{name:n})}),buttons:[{id:"cancel","class":"btn-danger",title:t("cancel"),click:function(){u(),this.remove()}}],onClose:function(){u()}})}))}function l(o){if(!N){e.playSound("ringSound")
var i=e.getMember(o)
V={from:i.id,dialog:e.dialogs.create({id:"call-from-"+i.id,title:t("incomingCall"),content:tpl("chatRequestTemplate",i),titleIcon:"phone",modal:!0,buttons:[{id:"accept","class":"btn-success",title:t("answer"),click:function(){d(),this.remove()}},{id:"cancel","class":"btn-danger",title:t("decline"),click:function(){r(),this.remove()}}],onClose:function(){r()}})},N=!0}}function d(){e.stopSound("ringSound"),o.emit("request accept",{type:"voicechat",toId:V.from})}function r(){e.stopSound("ringSound"),o.emit("request decline",{type:"voicechat",toId:V.from}),V={},N=!1}function u(){o.emit("request cancel",{type:"voicechat",toId:F.to}),F={},N=!1}function m(e,o){F.dialog.remove(),g(e.id,o),h(function(){F.peerReady&&!B&&(B=z.call(F.to,O),B.on("stream",C))})}function f(e,t){g(e.id,t),h(function(){o.emit("voice peer ready",V.from)})}function g(o,i){i=e.getMember(i.id),W={id:o,partner:i,time:0,timerInverval:null,dialog:e.dialogs.create({id:o,title:t("voiceChatRoom"),titleIcon:"microphone",content:tpl("voiceChatRoomTemplate",i),width:400,height:400,isHideBottomBar:!0,modal:!0,isCloseable:!1})},W.audio=W.dialog.body().find("audio")[0],W.$timer=W.dialog.body().find(".timer"),W.dialog.$messagesCell=W.dialog.body().find(".messages"),W.dialog.setOption("onResize",function(e){v(this,e.height())}),W.dialog.body().find(".btn-disconnect").click(function(){M(!0)}),$("input.message",W.dialog.body()).keyup(function(e){if(13===e.which){$input=$(this)
var o=$input.val().trim()
if(!o)return
p(W.id,o),$input.val("").attr("placeholder","")}}),b(W.id,{id:"system",icon:"spin fa-spinner"},t("voiceChatConnecting"))}function v(e,o){e.$messagesCell.css({height:o-105+"px"})}function p(e,t){o.emit("room send",{roomId:e,msg:t})}function b(o,t,i){if(W.id&&W.id==o){var n
"system"===t.id?n=$(tpl("roomSystemMessageTemplate",{icon:t.icon,"class":t["class"]?t["class"]:"",message:i})):(n=$(tpl("roomMessageTemplate",{name:t.name,color:t.color,message:urls(emotions(i))})),t.id===e.userId&&n.addClass("my")),n.appendTo($(".messages ul",W.dialog.body())),$(".messages .scroll",W.dialog.body()).scrollTop(1e10)}}function h(o){return z?void(o&&o()):void $.post("/app/servers",{},function(t){z=new Peer(e.userId,{host:e.host,port:9e3,path:"/peer",secure:!0,config:t}),z.on("call",y),o&&o()},"json")}function y(e){e.answer(O),e.on("stream",C),B=e}function C(e){W.audio.volume=1,W.audio.src=window.URL.createObjectURL(e),W.audio.onloadedmetadata=function(e){W.audio.play(),I()}}function I(){$(".messages ul",W.dialog.body()).empty(),b(W.id,{id:"system",icon:"plug"},t("voiceChatConneced")),W.timerInverval=setInterval(w,1e3)}function w(){W.time++
var e=Math.floor(W.time/60),o=W.time-60*e
e=e>=10?e:"0"+e,o=o>=10?o:"0"+o,W.$timer.html(e+":"+o)}function M(i){clearInterval(W.timerInverval),B&&(B.close(),B=null),i&&o.emit("room leave",W.id),W.dialog.remove(),N=!1,F={},V={},i||e.dialogs.message(t("voiceChatPartnerLeft",{name:W.partner.name.full})),W={}}function T(o){o=$.extend(e.getMember(o.id),o),o.status=o.busy?"busy":"idle",D[o.id]=o,G++
var i=$(tpl("voiceLobbyMemberTemplate",o))
o.name.color&&i.find(".name").css({color:o.name.color}),i.appendTo(j),P.trigger("update"),U.setTitle(t("voiceChatLobby",{count:G}))}function L(e){e in D&&($("tr#"+e,j).remove(),delete D[e],G--,P.trigger("update"),U.setTitle(t("voiceChatLobby",{count:G})))}function R(e){e.id in D&&(L(e.id),T(e))}function k(){o.emit("voice leave"),U=null}function S(e,o){D[e].busy=o
var t=$("tr#"+e,j),i=t.find(".status")
t.toggleClass("status-busy",o).toggleClass("status-idle",!o),i.toggleClass("status-busy",o).toggleClass("status-idle",!o)}var U,q,P,x,j,O,z,B,D={},G=0,H=!1,N=!1,F={},V={},W={}
this.openLobby=function(){return D={},G=0,B=null,i(),H?void(O&&(P.show(),x.show(),o.emit("voice join"))):(q=e.contextMenuManager.createMenu({id:"voiceChatLobbyContextMenu",items:{call:{title:t("voiceChatCall"),icon:"phone",click:function(e){c(e.userId,e.userName)}},profile:{title:t("viewProfile"),icon:"search",click:function(o){e.openProfile(o.userId,o.userName)}}}}),U.body().find(".wait-perms").show(),void s())}}
function InboxController(e,n,i){function o(){i.setOption("onClose",function(){i=null}),n.on("mail unread",function(){i&&h()}),d(),i.setOption("onResize",function(e){s(this,e.height())}),k=x.find(".message").length,w=v.data("ts")}function s(e,n){e.$messagesPane.css({height:n-51+"px"})}function a(e){if(e!=R){k=0,w=0,R=e
var n=$("#inboxMoreButton",v),i=n.siblings(".loading")
n.hide(),i.show(),x.empty(),$.post("/mail/more",{skip:k,mode:R},function(e){return i.hide(),n.show(),e?void u(e):(x.find(".message").length||v.find(".no-messages").show(),void n.hide())})}}function d(){v=i.body().find(".mail-inbox"),x=v.find(".messages"),$(".no-messages button",v).click(function(){i.remove()})
var e=$("#inboxMoreButton",v)
e.click(function(){var n=e.siblings(".loading")
e.hide(),n.show(),$.post("/mail/more",{skip:k,mode:R},function(i){return n.hide(),e.show(),i?void u(i):(x.find(".message").length||v.find(".no-messages").show(),void e.hide())})}),i.$messagesPane=i.body().find(".messages-pane"),s(i,i.body().height()),i.body().find(".toolbar .btn").click(function(e){e.preventDefault()
var n=$(this)
a(n.data("mode")),i.body().find(".toolbar .btn").removeClass("active"),n.addClass("active")}),c(x.find(".message"))}function c(e){e.length&&(v.find(".no-messages").hide(),e.click(function(){l($(this))}),$(".delete-button",e).click(function(e){e.preventDefault(),e.stopPropagation(),m($(this).parents(".message"))}))}function u(e){var n=$(e).find(".message")
n.appendTo(x),c(n),k+=n.length}function f(e){var n=$(e)
w=n.data("ts")
var i=$(e).find(".message")
i.prependTo(x),c(i),k+=i.length}function r(e){i.setTitle(t("inbox")),i.body().empty(),v.appendTo(i.body()),d(),i.body().scrollTop(y),"function"==typeof e&&e()}function l(e){y=i.body().scrollTop(),"inbox"==R&&$(".unread",e).remove(),v=v.clone(),x=v.find(".messages")
var n=e.data("id")
i.loadContent({url:"/mail/message",data:{id:n},onLoad:function(){g()}})}function m(n){var i=n.data("id")
n.fadeOut(300,function(){n.remove(),k--,x.find(".message").length||v.find("#inboxMoreButton").is(":visible")||v.find(".no-messages").show(),$.post("/mail/delete",{id:i},function(n){n.success&&($("#inboxLink .badge").text(n.unread?n.unread:""),e.mobile&&$("#profileNameLink .badge").text(n.unread?n.unread:""))})})}function b(e){r(function(){var n=$("#message-"+e,x)
m(n)})}function g(){var n=$(".mail-message",i.body()),o=n.data("id"),s=n.find(".subject").text(),a={id:n.data("sender-id"),name:n.find(".name").text()},d=n.data("request-id")
if(i.setTitle(t("inboxViewMessage")),"inbox"==R){var c=n.data("unread-count")
$("#inboxLink .badge").text(c?c:""),e.mobile&&$("#profileNameLink .badge").text(c?c:"")}$(".back-button",n).click(function(){r()}),$(".reply-button",n).click(function(){e.composeMessage(a.id,{id:o,subject:p(s)})}),$(".profile-button",n).click(function(){e.openProfile(a.id,a.name)}),$(".delete-button",n).click(function(){b(o)}),d&&($(".accept-button",n).click(function(){e.controllers.friends.acceptRequest(d,a.id,a.name,function(){b(o)})}),$(".decline-button",n).click(function(){b(o),e.controllers.friends.declineRequest(d,a.id)}))}function p(e){var n=new RegExp(/^Re:/),i=new RegExp(/^Re\(([0-9]+)\):/),t=n.test(e),o=i.test(e)
if(!t&&!o)return"Re: "+e
if(t)return e.replace(n,"Re(2):")
if(o){var s=Number(i.exec(e)[1])+1
return e.replace(i,"Re("+s+"):")}return e}function h(){w&&"inbox"==R&&$.post("/mail/check",{ts:w},function(e){e&&f(e)},"html")}var v,x,k=0,y=0,w=0,R="inbox"
o()}
function FriendsController(n,i){function e(){i.on("friends count",function(n){d=!0,o=n,s()}),i.on("friend login",function(){d&&(o++,s())}),i.on("friend logout",function(){d&&(o--,s())})}function s(){0>o&&(o=0),o>0?$("#friendsLink .badge").text(o).show():$("#friendsLink .badge").text("").hide()}var o=0,d=!1
e(),this.sendRequest=function(e,s){n.dialogs.confirm(t("friendConfirm",{name:s}),function(){$.post("/friends/request",{id:e},function(s){n.dialogs.message(s.message),n.isMemberOnline(e)&&i.emit("mail sent",e)},"json")})},this.acceptRequest=function(e,s,o,d){n.dialogs.confirm(t("friendConfirm",{name:o}),function(){$.post("/friends/accept",{id:e},function(e){n.dialogs.message(e.message),n.isMemberOnline(s)&&(i.emit("mail sent",s),i.emit("friend added",s)),n.dialogs.isDialogExists("friends")&&n.dialogs.getDialog("friends").formHandler.submit()},"json"),d&&d()})},this.declineRequest=function(e,s){$.post("/friends/decline",{id:e},function(e){e.success&&n.isMemberOnline(s)&&i.emit("mail sent",s)},"json")}}
function MapController(e,o){function i(){o.on("get coords",function(t){g()}),o.on("member new coords",function(t){n(t)})}function n(t){e.getMember(t.id).coords=t.coords,e.dialogs.isDialogExists("map")&&(p(t.id),a(t))}function s(t){y={},m={}
var e=t.body().find("#mapCanvas")
c=new google.maps.Map(e.get(0),{center:{lat:51,lng:0},zoom:2,zoomControlOptions:{style:google.maps.ZoomControlStyle.LARGE,position:google.maps.ControlPosition.LEFT_CENTER},streetViewControl:!1,panControl:!1,overviewControl:!1}),u=new MarkerClusterer(c,[],{gridSize:64,maxZoom:12,minimumClusterSize:2}),f=new google.maps.InfoWindow,r()}function r(){$.each(e.getMembers(),function(t,e){a(e)})}function a(t){if("coords"in t&&"lat"in t.coords){var e=Number(t.coords.lat),o=Number(t.coords.lng),i=e.toFixed(4)+"-"+o.toFixed(4)
if(y[t.id]=i,i in m){var n=m[i].members
n.push(t.id)
var s=n.length>9?"9":n.length.toString()
return void m[i].marker.setLabel(s)}var r=new google.maps.Marker({position:new google.maps.LatLng(e,o),label:"1"})
m[i]={members:[t.id],marker:r},google.maps.event.addListener(r,"click",function(){h(i)}),u.addMarker(r)}}function p(t){if(t in y){var e=y[t],o=m[e].members,i=m[e].marker,n=0
if($.each(o,function(e,o){o.id==t&&(n=e)}),o.splice(n,1),o.length<=0)u.removeMarker(i),delete m[e]
else{var s=o.length>9?"9":o.length.toString()
i.setLabel(s)}delete y[t]}}function h(t){var o=m[t].marker,i=m[t].members,n=$("<div/>").addClass("map-popup"),s=$("<ul/>").appendTo(n)
$.each(i,function(t,o){var i=e.getMember(o),n=$("<li/>"),r=$("<a/>").attr("href","#").html('<i class="fa fa-'+i.genderClass+'"></i> '+i.name.full).addClass("gender-"+i.genderClass).appendTo(n)
i.name.color&&r.css({color:i.name.color}),n.appendTo(s),r.click(function(){e.openProfile(i.id,i.name.full)})}),f.setContent(n.get(0)),f.open(c,o)}function g(){var t=e.getMember(e.userId)
d(t.location.full,function(e){return e===!1?void d(t.location.country,function(t){t&&l(t)}):void l(e)})}function l(t){o.emit("set coords",t)}function d(t,e){var o=new google.maps.Geocoder
o.geocode({address:t},function(t,o){if(o!==google.maps.GeocoderStatus.OK)return void e(!1)
var i=t[0].geometry.location.lat(),n=t[0].geometry.location.lng(),s={lat:i,lng:n}
e(s)})}var c,u,f,m={},y={}
i(),this.updateCoords=function(){g()},this.open=function(){e.dialogs.create({id:"map",width:800,height:500,title:t("membersMap"),content:tpl("mapDialogTemplate"),onResize:function(){google.maps.event.trigger(c,"resize")},onCreate:function(){s(this)},onClose:function(){}})},this.onMemberJoin=function(t){e.dialogs.isDialogExists("map")&&a(t)},this.onMemberLeave=function(t){e.dialogs.isDialogExists("map")&&p(t)}}!function(){function t(t){return function(e){this[t]=e}}function e(t){return function(){return this[t]}}function o(t,e,n){this.extend(o,google.maps.OverlayView),this.c=t,this.a=[],this.f=[],this.ca=[53,56,66,78,90],this.j=[],this.A=!1,n=n||{},this.g=n.gridSize||60,this.l=n.minimumClusterSize||2,this.J=n.maxZoom||u,this.j=n.styles||[],this.X=n.imagePath||this.Q,this.W=n.imageExtension||this.P,this.O=!0,void 0!=n.zoomOnClick&&(this.O=n.zoomOnClick),this.r=!1,void 0!=n.averageCenter&&(this.r=n.averageCenter),i(this),this.setMap(t),this.K=this.c.getZoom()
var s=this
google.maps.event.addListener(this.c,"zoom_changed",function(){var t=s.c.getZoom()
s.K!=t&&(s.K=t,s.m())}),google.maps.event.addListener(this.c,"idle",function(){s.i()}),e&&e.length&&this.C(e,!1)}function i(t){if(!t.j.length)for(var e,o=0;e=t.ca[o];o++)t.j.push({url:t.X+(o+1)+"."+t.W,height:e,width:e})}function n(t,e){e.s=!1,e.draggable&&google.maps.event.addListener(e,"dragend",function(){e.s=!1,t.L()}),t.a.push(e)}function s(t,e){var o=-1
if(t.a.indexOf)o=t.a.indexOf(e)
else for(var i,n=0;i=t.a[n];n++)if(i==e){o=n
break}return-1==o?!1:(e.setMap(u),t.a.splice(o,1),!0)}function r(t){if(t.A)for(var e,o=t.v(new google.maps.LatLngBounds(t.c.getBounds().getSouthWest(),t.c.getBounds().getNorthEast())),i=0;e=t.a[i];i++)if(!e.s&&o.contains(e.getPosition())){for(var n=t,s=4e4,r=u,p=0,h=void 0;h=n.f[p];p++){var g=h.getCenter()
if(g){var l=e.getPosition()
if(g&&l)var d=(l.lat()-g.lat())*Math.PI/180,c=(l.lng()-g.lng())*Math.PI/180,g=Math.sin(d/2)*Math.sin(d/2)+Math.cos(g.lat()*Math.PI/180)*Math.cos(l.lat()*Math.PI/180)*Math.sin(c/2)*Math.sin(c/2),g=12742*Math.atan2(Math.sqrt(g),Math.sqrt(1-g))
else g=0
s>g&&(s=g,r=h)}}r&&r.F.contains(e.getPosition())?r.q(e):(h=new a(n),h.q(e),n.f.push(h))}}function a(t){this.k=t,this.c=t.getMap(),this.g=t.w(),this.l=t.l,this.r=t.r,this.d=u,this.a=[],this.F=u,this.n=new h(this,t.z(),t.w())}function p(t){t.F=t.k.v(new google.maps.LatLngBounds(t.d,t.d))}function h(t,e,o){t.k.extend(h,google.maps.OverlayView),this.j=e,this.fa=o||0,this.u=t,this.d=u,this.c=t.getMap(),this.B=this.b=u,this.t=!1,this.setMap(this.c)}function g(t,e){var o=t.getProjection().fromLatLngToDivPixel(e)
return o.x-=parseInt(t.p/2,10),o.y-=parseInt(t.h/2,10),o}function l(t){t.b&&(t.b.style.display="none"),t.t=!1}function d(t,e){var o=[]
return o.push("background-image:url("+t.da+");"),o.push("background-position:"+(t.D?t.D:"0 0")+";"),"object"==typeof t.e?("number"==typeof t.e[0]&&t.e[0]>0&&t.e[0]<t.h?o.push("height:"+(t.h-t.e[0])+"px; padding-top:"+t.e[0]+"px;"):o.push("height:"+t.h+"px; line-height:"+t.h+"px;"),"number"==typeof t.e[1]&&t.e[1]>0&&t.e[1]<t.p?o.push("width:"+(t.p-t.e[1])+"px; padding-left:"+t.e[1]+"px;"):o.push("width:"+t.p+"px; text-align:center;")):o.push("height:"+t.h+"px; line-height:"+t.h+"px; width:"+t.p+"px; text-align:center;"),o.push("cursor:pointer; top:"+e.y+"px; left:"+e.x+"px; color:"+(t.M?t.M:"black")+"; position:absolute; font-size:"+(t.N?t.N:11)+"px; font-family:Arial,sans-serif; font-weight:bold"),o.join("")}var c,u=null
c=o.prototype,c.Q="https://raw.githubusercontent.com/googlemaps/js-marker-clusterer/gh-pages/images/m",c.P="png",c.extend=function(t,e){return function(t){for(var e in t.prototype)this.prototype[e]=t.prototype[e]
return this}.apply(t,[e])},c.onAdd=function(){this.A||(this.A=!0,r(this))},c.draw=function(){},c.S=function(){for(var t,e=this.o(),o=new google.maps.LatLngBounds,i=0;t=e[i];i++)o.extend(t.getPosition())
this.c.fitBounds(o)},c.z=e("j"),c.o=e("a"),c.V=function(){return this.a.length},c.ba=t("J"),c.I=e("J"),c.G=function(t,e){for(var o=0,i=t.length,n=i;0!==n;)n=parseInt(n/10,10),o++
return o=Math.min(o,e),{text:i,index:o}},c.$=t("G"),c.H=e("G"),c.C=function(t,e){for(var o,i=0;o=t[i];i++)n(this,o)
e||this.i()},c.q=function(t,e){n(this,t),e||this.i()},c.Y=function(t,e){var o=s(this,t)
return!e&&o?(this.m(),this.i(),!0):!1},c.Z=function(t,e){for(var o,i=!1,n=0;o=t[n];n++)o=s(this,o),i=i||o
return!e&&i?(this.m(),this.i(),!0):void 0},c.U=function(){return this.f.length},c.getMap=e("c"),c.setMap=t("c"),c.w=e("g"),c.aa=t("g"),c.v=function(t){var e=this.getProjection(),o=new google.maps.LatLng(t.getNorthEast().lat(),t.getNorthEast().lng()),i=new google.maps.LatLng(t.getSouthWest().lat(),t.getSouthWest().lng()),o=e.fromLatLngToDivPixel(o)
return o.x+=this.g,o.y-=this.g,i=e.fromLatLngToDivPixel(i),i.x-=this.g,i.y+=this.g,o=e.fromDivPixelToLatLng(o),e=e.fromDivPixelToLatLng(i),t.extend(o),t.extend(e),t},c.R=function(){this.m(!0),this.a=[]},c.m=function(t){for(var e,o=0;e=this.f[o];o++)e.remove()
for(o=0;e=this.a[o];o++)e.s=!1,t&&e.setMap(u)
this.f=[]},c.L=function(){var t=this.f.slice()
this.f.length=0,this.m(),this.i(),window.setTimeout(function(){for(var e,o=0;e=t[o];o++)e.remove()},0)},c.i=function(){r(this)},c=a.prototype,c.q=function(t){var e
t:if(this.a.indexOf)e=-1!=this.a.indexOf(t)
else{e=0
for(var o;o=this.a[e];e++)if(o==t){e=!0
break t}e=!1}if(e)return!1
if(this.d?this.r&&(o=this.a.length+1,e=(this.d.lat()*(o-1)+t.getPosition().lat())/o,o=(this.d.lng()*(o-1)+t.getPosition().lng())/o,this.d=new google.maps.LatLng(e,o),p(this)):(this.d=t.getPosition(),p(this)),t.s=!0,this.a.push(t),e=this.a.length,e<this.l&&t.getMap()!=this.c&&t.setMap(this.c),e==this.l)for(o=0;e>o;o++)this.a[o].setMap(u)
if(e>=this.l&&t.setMap(u),t=this.c.getZoom(),(e=this.k.I())&&t>e)for(t=0;e=this.a[t];t++)e.setMap(this.c)
else this.a.length<this.l?l(this.n):(e=this.k.H()(this.a,this.k.z().length),this.n.setCenter(this.d),t=this.n,t.B=e,t.ga=e.text,t.ea=e.index,t.b&&(t.b.innerHTML=e.text),e=Math.max(0,t.B.index-1),e=Math.min(t.j.length-1,e),e=t.j[e],t.da=e.url,t.h=e.height,t.p=e.width,t.M=e.textColor,t.e=e.anchor,t.N=e.textSize,t.D=e.backgroundPosition,this.n.show())
return!0},c.getBounds=function(){for(var t,e=new google.maps.LatLngBounds(this.d,this.d),o=this.o(),i=0;t=o[i];i++)e.extend(t.getPosition())
return e},c.remove=function(){this.n.remove(),this.a.length=0,delete this.a},c.T=function(){return this.a.length},c.o=e("a"),c.getCenter=e("d"),c.getMap=e("c"),c=h.prototype,c.onAdd=function(){this.b=document.createElement("DIV"),this.t&&(this.b.style.cssText=d(this,g(this,this.d)),this.b.innerHTML=this.B.text),this.getPanes().overlayMouseTarget.appendChild(this.b)
var t=this
google.maps.event.addDomListener(this.b,"click",function(){var e=t.u.k
google.maps.event.trigger(e,"clusterclick",t.u),e.O&&t.c.fitBounds(t.u.getBounds())})},c.draw=function(){if(this.t){var t=g(this,this.d)
this.b.style.top=t.y+"px",this.b.style.left=t.x+"px"}},c.show=function(){this.b&&(this.b.style.cssText=d(this,g(this,this.d)),this.b.style.display=""),this.t=!0},c.remove=function(){this.setMap(u)},c.onRemove=function(){this.b&&this.b.parentNode&&(l(this),this.b.parentNode.removeChild(this.b),this.b=u)},c.setCenter=t("d"),window.MarkerClusterer=o,o.prototype.addMarker=o.prototype.q,o.prototype.addMarkers=o.prototype.C,o.prototype.clearMarkers=o.prototype.R,o.prototype.fitMapToMarkers=o.prototype.S,o.prototype.getCalculator=o.prototype.H,o.prototype.getGridSize=o.prototype.w,o.prototype.getExtendedBounds=o.prototype.v,o.prototype.getMap=o.prototype.getMap,o.prototype.getMarkers=o.prototype.o,o.prototype.getMaxZoom=o.prototype.I,o.prototype.getStyles=o.prototype.z,o.prototype.getTotalClusters=o.prototype.U,o.prototype.getTotalMarkers=o.prototype.V,o.prototype.redraw=o.prototype.i,o.prototype.removeMarker=o.prototype.Y,o.prototype.removeMarkers=o.prototype.Z,o.prototype.resetViewport=o.prototype.m,o.prototype.repaint=o.prototype.L,o.prototype.setCalculator=o.prototype.$,o.prototype.setGridSize=o.prototype.aa,o.prototype.setMaxZoom=o.prototype.ba,o.prototype.onAdd=o.prototype.onAdd,o.prototype.draw=o.prototype.draw,a.prototype.getCenter=a.prototype.getCenter,a.prototype.getSize=a.prototype.T,a.prototype.getMarkers=a.prototype.o,h.prototype.onAdd=h.prototype.onAdd,h.prototype.draw=h.prototype.draw,h.prototype.onRemove=h.prototype.onRemove}()

function HistoryController(o,e,i){function n(){m=i.body().find("form"),f=i.body().find(".members-list .list-body"),b=i.body().find(".members-empty-msg").hide()
var e={view:{title:t("historyOpen"),icon:"history",click:function(t){l(t.roomId,t.name,t.date)}},profile:{title:t("viewProfile"),icon:"search",click:function(t){o.openProfile(t.userId,t.name)}},"delete":{title:t("historyDelete"),icon:"trash",click:function(t){d(t.roomId)}}}
a=o.contextMenuManager.createMenu({id:"historyRoomsListContextMenu",items:e}),o.mobile&&a.addItem({title:t("cancel"),icon:"times"}),o.mobile||(i.$roomsPane=i.body().find(".members-scroll"),r(i,i.body().height()),i.setOption("onResize",function(t){r(this,t.height())}),u=i.body().find(".members-list"),u.tablesorter({widgets:["stickyHeaders"],widgetOptions:{stickyHeaders_attachTo:"#history .members-scroll"}})),i.formHandler=new FormHandler({form:m,submitButton:m.find(".find-button"),onResult:function(){f.empty(),g=0,o.mobile&&i.body().find("#membersFilter").removeClass("visible")},onSuccess:function(t){t.total&&(s(t),b.hide()),t.total||b.show()}}),f.on("click",".item",function(t){var o=$(this),e=o.attr("id"),i=$(".name span",o).text(),n=$(".date",o).text(),s=o.data("user-id")
a.set({roomId:e,userId:s,name:i,date:n}).show(t)}),h=$("#historyMoreButton",i.body()).hide(),h.click(function(){var t=h.siblings(".loading")
h.hide(),t.show()
var o=i.formHandler.getValues()
o.skip=g,$.post("/history/get",o,function(o){t.hide(),h.show(),s(o)})}),i.formHandler.submit(),o.mobile&&i.body().find("#membersFilter .shortcut").click(function(t){t.preventDefault(),$(this).parent().toggleClass("visible")})}function s(t){var e=$(t.html)
e.appendTo(f),y=t.total,g+=t.count,h.toggle(y>g),o.mobile||u.trigger("update")}function r(t,o){t.$roomsPane.css({height:o-74+"px"})}function l(e,i,n){o.dialogs.create({id:"history-room-"+e,title:t("historyRoom",{name:i,date:n}),titleIcon:"history",content:{url:"/history/room",data:{id:e}},width:550,height:450,buttons:[{id:"download",title:t("historyDownload"),icon:"download","class":"btn-primary",click:function(){c(e)}},{id:"close",title:t("close"),"class":"btn-default",click:function(){this.remove()}}]})}function d(e){o.dialogs.confirm(t("historyDeleteConfirm"),function(){$.post("/history/delete",{id:e},function(){i.formHandler.submit()})})}function c(t){window.location="/history/download/"+t}var a,m,f,u,h,b,y,g=0
n()}
function GamesLobbyController(e,n){function a(){i()}function i(){n.on("games list",function(e){$.each(e,function(e,t){m(t)})}),n.on("game created",function(e){m(e)}),n.on("game updated",function(e){u(e)}),n.on("game deleted",function(e){r(e)})}function o(){f=e.dialogs.create({id:"games-lobby",width:800,height:500,title:t("gamesLobby",{count:0}),content:tpl("gamesLobbyTemplate"),onCreate:function(){n.emit("games lobby join")},onClose:function(){b()}}),f.body().find(".create-game").click(function(e){e.preventDefault(),l()}).prop("disabled",x),f.body().find(".in-game").toggle(x),f.$gamesPane=f.body().find(".members-scroll"),s(f,f.body().height()),f.setOption("onResize",function(e){s(this,e.height())}),p=f.body().find("#gamesList"),h=f.body().find(".toolbar"),e.mobile||p.tablesorter({widgets:["stickyHeaders"],widgetOptions:{stickyHeaders_attachTo:"#games-lobby .members-scroll"}}),y||(y=e.contextMenuManager.createMenu({id:"gamesLobbyContextMenu",items:{join:{title:t("gameJoin"),icon:"sign-in",click:function(e){T[e.gameId].closed||d(e.gameId)}},spectate:{title:t("gameSpectate"),icon:"eye",click:function(e){g(e.gameId)}}}})),v=f.body().find(".games-list .list-body"),v.on("click",".item",function(e){if(!x){var t=$(this),n=t.attr("id"),a=T[n]
a&&(y.toggleEnabledItem("join",!a.closed),y.set({gameId:n}).show(e,a.title))}})}function s(e,t){e.$gamesPane.css({height:t-51+"px"})}function l(){e.dialogs.create({id:"game-create",title:t("gameSettings"),width:400,buttons:[{id:"start","class":"btn-primary",title:t("start"),click:function(){c(this)}},{id:"cancel","class":"btn-default",title:t("cancel"),click:function(){this.remove()}}],content:{url:"/games/create",onLoad:function(e){e.body().find("#gameType").change(function(){var t=$(this).val()
e.body().find(".rules-block").hide(),e.body().find(".game-"+t).show()}).change()}}})}function c(e){var t=e.body().find("#gameType"),a=e.body().find("#gameLang"),i=e.body().find("#gameMaxPlayers")
t&&a&&(n.emit("game create",{type:t.val(),lang:a.val(),maxPlayers:i.val()}),e.remove())}function d(e){n.emit("game join",{id:e})}function g(e){n.emit("game join",{id:e,spectator:!0})}function m(n){n=L.parseGame(n),T[n.id]=n,k++
var a=$(tpl("gamesLobbyGameTemplate",n))
a.appendTo(v),e.mobile||p.trigger("update"),f.setTitle(t("gamesLobby",{count:k}))}function r(n){n in T&&($("#"+n,v).remove(),delete T[n],k--,p.trigger("update"),f.setTitle(t("gamesLobby",{count:k})),e.controllers.gamesRooms.removeGame(n))}function u(e){e=L.parseGame(e),T[e.id]=e
var t=$("#"+e.id,v)
t&&(t.find(".status").html(e.statusText),t.find(".players").html(e.playersCount+"/"+e.maxPlayers).toggleClass("is-closed-true",e.closed).toggleClass("is-closed-false",!e.closed))}function b(){n.emit("games lobby leave"),f=null}var f,y,p,h,v,L=this,T={},k=0,x=!1
a(),this.openLobby=function(){return f?void f.bringToFront():(T={},k=0,void o())},this.parseGame=function(n){switch(n.status){case 0:n.statusText=t("gameStatusIdle")
break
case 1:n.statusText=t("gameStatusStarted")}return n.title=t("game"+n.type),n.language=e.langs[n.lang],n.playersCount=Object.keys(n.players).length,n.closed=n.playersCount>=n.maxPlayers,n},this.getLobbyDialog=function(){return f},this.setInGame=function(e){x=e}}
function GamesRoomsController(e,n){function o(){i()}function i(){n.on("game open",function(e){a(e)}),n.on("game joined",function(e){v(e)}),n.on("game leaved",function(e){h(e.userId),"state"in e&&d({state:e.state})}),n.on("game message",function(e){return L&&L.id==e.id?"violation"in e?void I.gameMessageReceived({id:"system",icon:"ban","class":"text-danger"},t("gameRoundBadMsg")):void I.gameMessageReceived(e.sender,e.msg):void 0}),n.on("game event",function(e){L&&L.id==e.gameId&&"onEvent"in L.controller&&L.controller.onEvent(L,e)}),n.on("game state",function(e){d(e)}),n.on("game round end",function(e){m(e.winnerId,e.score,e.data)}),n.on("game start type",function(e){if(L&&L.id==e.id){var t=L.dialog.$membersList,n=t.find("#player-"+e.sender)
$("i.gender",n).hide(),$("i.typing",n).css("display","inline-block")}}),n.on("game end type",function(e){if(L&&L.id==e.id){var t=L.dialog.$membersList,n=t.find("#player-"+e.sender)
$("i.gender",n).show(),$("i.typing",n).hide()}})}function a(t){e.controllers.gamesLobby.setInGame(!0)
var n=e.controllers.gamesLobby.getLobbyDialog().body()
n.find(".create-game").prop("disabled",!0),n.find(".in-game").show(),l(t.game,t.spectator),M=!0}function s(){n.emit("game leave"),r()}function r(){L.dialog&&L.dialog.remove(),M=!1,e.controllers.gamesLobby.setInGame(!1),L.delayTimeout&&clearInterval(L.delayTimeout),L=null
var t=e.controllers.gamesLobby.getLobbyDialog()
t&&(t.body().find(".create-game").prop("disabled",!1),t.body().find(".in-game").hide())}function l(n,o){if(!M){n=e.controllers.gamesLobby.parseGame(n),n.controller=w[n.type]
var i=e.dialogs.create({id:"game-"+n.id,title:n.title,titleIcon:"trophy",titleCount:0,content:n.controller.getRoomTemplate(),width:600,height:400,isHideBottomBar:!0,closeConfirm:t("gameLeaveConfirm"),onClose:function(){s()},onFocus:function(){f(),y(this)},onBlur:function(){u(this)}})
if(i.$messagesCell=i.body().find(".messages"),i.$membersCell=i.body().find(".members"),n.controller.resizeDialog(i,i.body().height()),i.setOption("onResize",function(e){n.controller.resizeDialog(this,e.height())}),L=$.extend(n,{dialog:i,unreadCount:0,isTyping:!1,typingInterval:null,spectator:o}),i.$membersList=i.body().find(".members ul"),i.$emoticonsPane=i.body().find(".emoticons-pane"),i.$timer=i.body().find(".timer").html(""),n.controller.init(L),c(),d(),o&&(i.body().find(".player-controls").hide(),i.body().find(".spectator-controls").show()),!o){var a=i.body().find("input.message")
a.keyup(function(t){if(C(),13===t.which){a=$(this)
var n=a.val().trim()
if(!n)return
T(),g(n),a.val("").attr("placeholder",""),e.mobile&&a.blur()}}),e.mobile||$("input.message",i.body()).focus()}e.mobile&&(i.$membersCount=i.body().find(".members .count"),i.$membersCount.text(L.playersCount),i.body().find(".members .shortcut").click(function(e){e.preventDefault(),e.stopPropagation(),$(this).parent().toggleClass("visible")}),i.body().find(".members").click(function(e){e.stopPropagation(),$(this).toggleClass("visible")}))}}function d(e){L.delayTimeout&&(clearTimeout(L.delayTimeout),L.dialog.$timer.hide()),e&&(L=$.extend(L,e)),L.state==R&&L.controller.startStateWaiting(L),L.state==x&&L.controller.startStatePrepare(L),L.state==G&&L.controller.startStateRound(L),L.state==k&&L.controller.startStateOver(L)}function m(e,t,n){L.controller.endRound(L,e,t,n)}function c(){L.dialog.$membersList.empty(),$.each(L.players,function(t,n){n=$.extend(e.getMember(t),n),p(n)})}function g(e){n.emit("game send",{gameId:L.id,msg:e})}function u(e){$(".messages ul.chat .divider",e.body()).remove()
var t=$("<li/>").addClass("divider")
t.appendTo($(".messages ul.chat",e.body()))}function y(e){$(".messages ul.chat .divider:last-child",e.body()).remove()}function f(){L&&L.unreadCount>0&&(L.unreadCount=0,L.dialog.setTitleCounter(0))}function p(t){b(t.id)
var n=L.dialog.$membersList,o=$("<li/>").attr("id","player-"+t.id).appendTo(n),i=$("<a/>").attr("href","#").attr("title",t.name.full).addClass("gender-"+t.genderClass).html('<i class="fa fa-fw fa-pencil typing"></i> <i class="fa fa-fw fa-'+t.genderClass+' gender"></i> '+t.name.first).appendTo(o)
t.name.color&&i.css({color:t.name.color}),$("<span/>").addClass("badge").addClass("score").html(t.score).appendTo(i),i.click(function(n){n.preventDefault(),n.stopPropagation(),t.id!=e.userId&&e.openProfile(t.id,t.name.full)})}function b(e){var t=L.dialog.$membersList
$("#player-"+e,t).remove()}function v(n){var n=$.extend(e.getMember(n.id),n)
L.players[n.id]=n,L.playersCount=Object.keys(L.players).length,p(n),L.dialog.$membersCount&&L.dialog.$membersCount.text(L.playersCount),I.gameMessageReceived({id:"system",icon:"plus"},t("memberJoinedGame",{name:n.name.first})),L.state==R&&d()}function h(n){if(n in L.players){b(n)
var o=e.getMember(n).name.first
I.gameMessageReceived({id:"system",icon:"sign-out"},t("memberLeftGame",{name:o})),delete L.players[n],L.playersCount=Object.keys(L.players).length,L.dialog.$membersCount&&L.dialog.$membersCount.text(L.playersCount)}}function C(){L.isTyping&&clearTimeout(L.typingInterval),L.isTyping||(L.isTyping=!0,n.emit("game start type",L.id)),L.typingInterval=setTimeout(function(){T()},1500)}function T(){L.isTyping&&(L.isTyping=!1,clearTimeout(L.typingInterval),n.emit("game end type",L.id))}var I=this,L={},M=!1,w={Alias:new GameAlias(e,n,this),Builder:new GameBuilder(e,n,this)},R=0,x=1,G=2,k=3
o(),this.removeGame=function(e){L&&L.id==e&&r()},this.gameSetDelay=function(){L.delayCounter=L.delay,L.dialog.$timer.html(L.delayCounter).show(),L.delayTimeout=setInterval(function(){return L.delayCounter<=0?void clearInterval(L.delayTimeout):(L.delayCounter--,void L.dialog.$timer.html(L.delayCounter))},1e3)},this.gameClearChat=function(){$(".messages ul",L.dialog.body()).empty()},this.gameMessageReceived=function(t,n){var o
"system"===t.id?o=$(tpl("roomSystemMessageTemplate",{icon:t.icon,"class":t["class"]?t["class"]:"",message:n})):(o=$(tpl("roomMessageTemplate",{name:t.name,color:t.color,message:urls(emotions(n))})),t.id===e.userId&&o.addClass("my")),o.appendTo($(".messages ul.chat",L.dialog.body())),$(".messages .scroll",L.dialog.body()).scrollTop(1e9),L.dialog.isFocused()||(L.unreadCount++,L.dialog.setTitleCounter(L.unreadCount)),e.isActive()||e.counter.increment()},this.onMemberUpdate=function(e){L.players&&e.id in L.players&&p($.extend(L.players[e.id],e))}}
function GameAlias(e,a,s){var i
this.init=function(e){i=e.dialog.body().find(".status").html("")},this.getRoomTemplate=function(){return tpl("gameAliasRoomTemplate")},this.resizeDialog=function(e,t){e.$messagesCell.css({height:t-95+"px"}),e.$membersCell.css({height:t-95+"px"})},this.startStateWaiting=function(e){i.html(t("gameStateWaiting",{count:e.playersCount,max:e.maxPlayers}))},this.startStatePrepare=function(a){a.word=null,1==a.round?s.gameMessageReceived({id:"system",icon:"check","class":"text-primary"},t("gamePlayersJoined")):s.gameMessageReceived({id:"system",icon:"chevron-right"},t("gameRoundGetReady")),a.player.id==e.userId?i.html(t("gameStatePrepareYou")):i.html(t("gameStatePrepare",{name:a.player.name})),s.gameSetDelay()},this.startStateRound=function(a){s.gameClearChat(),s.gameMessageReceived({id:"system",icon:"clock-o"},t("gameRoundStarted")),a.player.id==e.userId?(i.html(t("gameStateRoundExplain",{word:a.word})),s.gameMessageReceived({id:"system",icon:"info-circle"},t("game"+a.type+"Rules"))):i.html(t("gameStateRoundGuess",{name:a.player.name})),s.gameSetDelay()},this.startStateOver=function(e){s.gameMessageReceived({id:"system",icon:"refresh"},t("gameOverRestart")),i.html(t("gameOver",{name:e.winnerName})),s.gameSetDelay()
var a=e.dialog.$membersList
for(var r in e.players)e.players[r].score=0,$("#player-"+r,a).find(".score").text("0")},this.endRound=function(a,i,r,m){var n=m.word
if(!i)return void s.gameMessageReceived({id:"system",icon:"clock-o","class":"text-danger"},t("gameRoundTimeUp",{word:n}))
var o=a.dialog.$membersList
if(a.players[i].score+=r,$("#player-"+i,o).find(".score").text(a.players[i].score),i==e.userId)return void s.gameMessageReceived({id:"system",icon:"check","class":"text-success"},t("gameRoundWinYou",{word:n}))
var c=e.getMember(i)
c&&s.gameMessageReceived({id:"system",icon:"check","class":"text-success"},t("gameRoundWin",{name:c.name.first,word:n}))}}
function GameBuilder(e,a,r){function s(e){m.toggle(e),g.toggle(!e),c.prop("disabled",e).val("")}function d(a){p.empty()
for(var t in a.players){var r=a.players[t],s=e.getMember(t),d=$("<div/>").addClass("player-display").addClass("player-"+t)
$("<div/>").addClass("player-name").html(s.name.first).appendTo(d)
var i=$("<div/>").addClass("player-words")
i.appendTo(d)
for(var l=0;l<a.patterns.length;l++){for(var n=$("<ul/>").data("id",l),o=a.patterns[l],m=0;m<o.length;m++){var g=o[m],c=$("<li/>")
if(g)c.html(g).addClass("fixed")
else{var v=""
r.guessedLetters&&l in r.guessedLetters&&m in r.guessedLetters[l]&&(v=r.guessedLetters[l][m]),c.addClass("space").html(v)}c.appendTo(n)}n.appendTo(i)}d.appendTo(p)}}function i(e){var a=m.find(".patterns")
a.empty()
for(var t=0;t<e.patterns.length;t++){for(var r=$("<ul/>").data("id",t),s=e.patterns[t],d=0;d<s.length;d++){var i=s[d],n=$("<li/>")
i?n.html(i).addClass("fixed"):n.addClass("space"),n.appendTo(r)}$("<div/>").addClass("wrap").append(r).appendTo(a)}var o=m.find(".letters ul")
o.empty()
for(var d=0;d<e.letters.length;d++){var i=e.letters[d],g=$("<li/>").html(i)
g.appendTo(o)}l(e,a,o)}function l(t,r,s){$("li",s).draggable({revert:"invalid"}),s.droppable(),$(".space",r).droppable({drop:function(d,i){var l=$(this),o=i.draggable,m=l.html(),g=o.html()
if(l.html(g).addClass("letter"),o.remove(),m){var c=$("<li/>").html(m).draggable({revert:"invalid"})
c.appendTo(s)}var p=l.parent("ul").data("id"),v=l.index()
a.emit("game event",{gameId:t.id,player:e.userId,wordId:p,letterId:v,letter:g}),n(t,r)}}).click(function(){var r=$(this),d=r.parent("ul")
if(d.removeClass("word-correct").removeClass("word-wrong"),r.html()){var i=$("<li/>").html(r.html()).draggable({revert:"invalid"})
i.appendTo(s),r.html("").removeClass("letter")
var l=d.data("id"),n=r.index()
a.emit("game event",{gameId:t.id,player:e.userId,wordId:l,letterId:n,letter:""})}})}function n(e,t){var r=[]
$("ul",t).each(function(a){var t=$(this),s=e.words[t.data("id")],d="",i=0
$("li",t).each(function(e){var a=$(this).html()
return a?void(d+=a):void i++}),d===s&&0===i&&t.addClass("word-correct"),d!==s&&0===i&&t.addClass("word-wrong"),r.push(d)})
var s=r.join(", ")
s===e.words.join(", ")&&a.emit("game send",{gameId:e.id,msg:s})}var o,m,g,c,p
this.init=function(e){o=e.dialog.body().find(".status").html(""),m=e.dialog.body().find(".game-field"),g=e.dialog.body().find(".messages ul.chat"),c=e.dialog.body().find(".controls input"),e.spectator&&(p=m.find(".spectator-field"),m.find(".patterns").hide(),m.find(".letters").hide())},this.getRoomTemplate=function(){return tpl("gameBuilderRoomTemplate")},this.resizeDialog=function(e,a){e.$messagesCell.css({height:a-95+"px"}),e.$membersCell.css({height:a-95+"px"})},this.startStateWaiting=function(e){s(!1),o.html(t("gameStateWaiting",{count:e.playersCount,max:e.maxPlayers}))},this.startStatePrepare=function(e){s(!1),1==e.round?r.gameMessageReceived({id:"system",icon:"check","class":"text-primary"},t("gamePlayersJoined")):r.gameMessageReceived({id:"system",icon:"chevron-right"},t("gameRoundGetReady")),o.html(t("gameRoundGetReady")),r.gameSetDelay()},this.startStateRound=function(e){return r.gameClearChat(),r.gameMessageReceived({id:"system",icon:"clock-o"},t("gameRoundStarted")),o.html(t("gameBuilderRules")),r.gameSetDelay(),s(!0),e.spectator?void d(e):void i(e)},this.startStateOver=function(e){s(!1),r.gameMessageReceived({id:"system",icon:"refresh"},t("gameOverRestart")),o.html(t("gameOver",{name:e.winnerName})),r.gameSetDelay()
var a=e.dialog.$membersList
for(var d in e.players)e.players[d].score=0,$("#player-"+d,a).find(".score").text("0")},this.endRound=function(a,d,i,l){s(!1)
var n=l.words.join(", ")
if(!d)return void r.gameMessageReceived({id:"system",icon:"clock-o","class":"text-danger"},t("gameBuilderRoundTimeUp",{words:n}))
var o=a.dialog.$membersList
if(a.players[d].score+=i,$("#player-"+d,o).find(".score").text(a.players[d].score),d==e.userId)return void r.gameMessageReceived({id:"system",icon:"check","class":"text-success"},t("gameBuilderRoundWinYou"))
var m=e.getMember(d)
m&&r.gameMessageReceived({id:"system",icon:"check","class":"text-success"},t("gameBuilderRoundWin",{name:m.name.first}))},this.onEvent=function(e,a){e.spectator&&p.find(".player-"+a.player).find(".player-words ul").eq(a.wordId).find("li").eq(a.letterId).html(a.letter).fadeIn()}}
function PremiumController(i,e){this.openDialog=function(){i.dialogs.create({id:"premium",modal:!0,title:t("premiumGet"),content:{url:"/premium/index"},width:800,buttons:[{id:"close",title:t("close"),"class":"btn-default",click:function(){this.remove()}}]})},this.openPaymentDialog=function(){i.dialogs.create({id:"premium-plan",modal:!0,title:t("premiumBuyNow"),content:{url:"/premium/plans"},width:650})}}
function t(e,t){var a=app.phrases[e]?app.phrases[e]:e
if("undefined"==typeof t)return a
for(var r in t)a=a.replace(new RegExp("{{"+r+"}}","g"),t[r])
return a}function tpl(e,t){function a(e,t,r){return $.each(e,function(n,u){var c=r?r+"."+n:n
return"object"==typeof e[n]?t=a(e[n],t,c):void(t=t.replace(new RegExp("{{"+c+"}}","g"),u))}),t}var r=$("#"+e).html()
return"undefined"==typeof t?r:a(t,r)}function parseMsg(e){return urls(emotions(name(e)))}function name(e){var t=app.getMember(app.userId).name.first
return e=e.replace(new RegExp(t,"g"),'<span class="my">'+t+"</span>")}function emotions(e){e=e.replace(/:\)/g,"*smile*"),e=e.replace(/=\)/g,"*waii*"),e=e.replace(/;\)/g,"*wink*"),e=e.replace(/:D/g,"*exciting*"),e=e.replace(/=D/g,"*exciting*"),e=e.replace(/:\(/g,"*unhappy*")
var t=new RegExp("(\\*)([a-z]+)\\*","g"),a=e.match(t)
return a?($.each(a,function(t,a){a=a.replace(/\*/g,""),emoticons.indexOf(a)>=0&&(e=e.replace(new RegExp("\\*"+a+"\\*","g"),'<i class="em em-'+a+'"></i>'))}),e):e}function urls(e){e=urls_yt(e)
var t=new RegExp("(?:(?:https?|ftp)://)?(?:[0-9a-z][\\-0-9a-z]*[0-9a-z]\\.)+[a-z]{2,6}(?::\\d{1,5})?(?:/[?!$.():='+\\-;&~#@,%*\\wА-Яа-я]+)*/?","g"),a=e.match(t)
return a?($.each(a,function(t,a){var r=a
a.startsWith("http:")||a.startsWith("https:")||(a="http://"+a),e=e.replace(r,'<a href="'+a+'" target="_blank">'+r+"</a>")}),e):e}function urls_yt(e){var t=/(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?/g,a=e.match(t)
if(!a)return e
var r=/(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?\s]*)/
return $.each(a,function(t,a){var n=a.match(r)
if(n&&11==n[2].length){var u=n[2]
e=e.replace(a,'<a href="#" onclick="return youtube(\''+u+'\')"><i class="fa fa-fw fa-youtube-play"></i>YouTube</a>')}}),e}function youtube(e){return app.dialogs.create({id:"yotube-"+e,title:"YouTube",titleIcon:"youtube-play",content:'<div class="youtube-player"><iframe width="100%" height="100%" src="//www.youtube.com/embed/'+e+'" frameborder="0" allowfullscreen></iframe></div>',width:656,height:424}),!1}
function App(e){function n(){$.post("/loader/data",{},function(e){g.phrases=e.phrases,g.langs=e.langs,g.countries=e.countries,y=e.blacklist,i(g),s(g)},"json")}function i(){g.dialogs=new DialogsManager(g),$("#profileMenu .profile-link").click(function(e){e.preventDefault(),g.openProfile(g.userId,t("myProfile"))}),$("#profileMenu .edit-link").click(function(e){e.preventDefault(),g.editProfile()}),$("#profileMenu .edit-name-color-link").click(function(e){e.preventDefault(),g.editNameColor()}),$("#inboxLink").click(function(e){e.preventDefault(),g.mobile&&$("#appHeader .menu-pane").hide(),g.openInbox()}),$("#findMembersLink").click(function(e){e.preventDefault(),g.mobile&&$("#appHeader .menu-pane").hide(),g.openMembersList()}),$("#friendsLink").click(function(e){e.preventDefault(),g.mobile&&$("#appHeader .menu-pane").hide(),g.openFriendsList()}),$("#historyLink").click(function(e){e.preventDefault(),g.openHistory()}),$("#voiceChatLink").click(function(e){e.preventDefault(),g.controllers.voiceChat.openLobby()}),$("#gamesLink").click(function(e){e.preventDefault(),g.mobile&&$("#appHeader .menu-pane").hide(),g.controllers.gamesLobby.openLobby()}),$("#mapLink").click(function(e){e.preventDefault(),g.mobile&&$("#appHeader .menu-pane").hide(),g.controllers.map.open()}),$("#donateLink").click(function(e){e.preventDefault(),g.dialogs.create({id:"donate",modal:!0,title:t("donate"),content:tpl("donateFormTemplate"),width:400,height:270})}),$("#premiumLink").click(function(e){e.preventDefault(),g.controllers.premium.openDialog()}),$("#premiumExtendLink").click(function(e){e.preventDefault(),g.controllers.premium.openPaymentDialog()}),g.mobile&&o()}function o(){g.height=$(window).outerHeight()-40,$("#app").css({height:g.height+"px"}),$(window).on("orientationchange",function(){r()}),$(window).resize(function(){r()}),$("#appHeader .menu-container > a").click(function(e){e.preventDefault(),$("#appHeader .menu-pane").hide(),$(this).siblings(".menu-pane").css({height:g.height+"px"}).show()}),$("#appHeader .menu-pane").on("click","a",function(e){$(this).parents(".menu-pane").hide()}),$("#publicRoomsLink").click(function(e){e.preventDefault(),$("#appHeader .menu-pane").hide(),g.controllers.textRooms.openRoomsList()}),$("#textLobbyLink").click(function(e){e.preventDefault(),$("#appHeader .menu-pane").hide(),g.dialogs.getDialog("text-lobby").bringToFront()})}function r(){g.height=$(window).outerHeight()-40,$("#app").css({height:g.height+"px"}),g.dialogs.each(function(e,t){t.resizeBody()})}function s(){b=io(e.host+":"+e.port,{reconnection:!1}),b.on("handshake",function(e){a(e)}),b.on("connect_error",function(){w.hide(),g.body().empty(),g.dialogs.create({id:"connect-error",modal:!0,isCloseable:!1,title:t("connectError"),content:tpl("messageDialogTemplate",{message:t("connectErrorText")}),buttons:[{id:"reconnect",title:t("reconnect"),"class":"btn-default",click:function(){location.reload()}}]})}),b.on("disconnect",function(){g.body().empty(),g.dialogs.create({id:"disconnected",modal:!0,isCloseable:!1,title:t("disconnected"),content:tpl("messageDialogTemplate",{message:t("disconnectedText")}),buttons:[{id:"reconnect",title:t("reconnect"),"class":"btn-default",click:function(){location.reload()}}]})}),b.on("broadcast",function(e){"message"===e.type&&g.dialogs.message(e.message,e.modal),"ban"===e.type&&window.localStorage&&localStorage.setItem("marker",!0)}),b.on("mail unread",function(e){f(e)}),b.on("voice chat count",function(e){p(e)}),b.on("games count",function(e){h(e)}),b.on("public counts",function(e){g.publicCounts=e,c("onUpdatePublicCounts",e)}),b.on("member in",function(e){l(e)}),b.on("member out",function(e){u(e)}),b.on("member updated",function(e){d(e)}),b.emit("handshake",{userId:e.userId,token:e.token})}function c(e,t){$.each(g.controllers,function(n,i){e in i&&i[e](t)})}function a(e){"function"==typeof AdminController&&(g.admin=new AdminController(g,b)),"function"==typeof ModeratorController&&(g.moderator=new ModeratorController(g,b)),g.controllers={textLobby:new TextLobbyController(g,b),textChat:new TextChatController(g,b),textRooms:new TextRoomsController(g,b),voiceChat:new VoiceChatController(g,b),gamesLobby:new GamesLobbyController(g,b),gamesRooms:new GamesRoomsController(g,b),friends:new FriendsController(g,b),map:new MapController(g,b),premium:new PremiumController(g,b)},$.each(e.members,function(e,t){l(t)}),g.counter=new Counter(g),$(window).focus(function(){C=!0,g.counter.reset()}),$(window).blur(function(){C=!1,g.dialogs.unfocusAll()}),f(e.mailUnread),p(e.voiceChatCount),h(e.gamesCount),c("onUpdatePublicCounts",e.publicCounts),w.hide(),window.localStorage&&localStorage.getItem("marker")&&b.emit("banself",{userId:g.userId})}function l(e){k[e.id]=m(e),v=Object.keys(k).length,c("onMemberJoin",e)}function d(e){k[e.id]=m(e),c("onMemberUpdate",e),e.id==g.userId&&($("#profileNameLink .name").html(e.name.full),g.controllers.map.updateCoords())}function u(e){delete k[e],v=Object.keys(k).length,c("onMemberLeave",e)}function m(e){var t={m:"mars",f:"venus",o:"genderless"}
e.genderClass=t[e.gender],e.location.country=g.countries[e.location.countryCode],e.location.full=e.location.country+(e.location.city?", "+e.location.city:"")
var n=[],i=[]
return $.each(e.langs.natives,function(e,t){i.push(g.langs[t])}),$.each(e.langs.learns,function(e,t){n.push(g.langs[t])}),e.speaks=i.join(", "),e.learns=n.join(", "),e}function f(e){e>0&&($("#inboxLink .badge").text(e).show(),g.mobile&&$("#profileNameLink .badge").text(e).show())}function p(e){M.html(e>0?"("+e+")":""),g.dialogs.isDialogExists("voice-lobby")&&g.dialogs.getDialog("voice-lobby").setTitleCounter(e)}function h(e){I.html(e>0?"("+e+")":"")}var b,g=this,k={},v=0,y=[],C=!0
this.phrases={},this.langs={},this.countries={},this.mobile=!!e.mobile,this.host=e.host,this.port=e.port,this.userId=e.userId,this.defaultRooms=e.rooms,this.contextMenuManager=new ContextMenuManager,this.controllers={}
var L=$("#app"),w=$("#loadingIndicator"),M=$("#voiceChatLink span"),I=$("#gamesLink span")
this.isActive=function(){return C},this.body=function(){return L},this.socket=function(){return b},this.require=function(e,t){$.getScript(e,t)},this.isMemberOnline=function(e){return e in k},this.getMember=function(e){return e in k?k[e]:!1},this.getMembers=function(){return k},this.getMembersCount=function(){return v},this.isInBlackList=function(e){return y.indexOf(e)>=0},this.addToBlackList=function(e){y.indexOf(e)>=0||$.post("/members/ignore",{id:e},function(t){t.success&&(y.push(e),b.emit("member ignore",e))},"json")},this.removeFromBlackList=function(e){y.indexOf(e)<0||$.post("/members/unignore",{id:e},function(t){t.success&&(y.splice(y.indexOf(e),1),b.emit("member unignore",e))},"json")},this.setUserOption=function(e,t){var n=this.getUserOptions()
null===t&&e in n?delete n[e]:n[e]=t,localStorage.setItem("user_opts",JSON.stringify(n))},this.getUserOption=function(e,t){var n=this.getUserOptions()
return e in n?n[e]:t},this.unsetUserOption=function(e){this.setUserOption(e,null)},this.getUserOptions=function(){var e=localStorage.getItem("user_opts")
return e?JSON.parse(e):{}},this.playSound=function(e){$("#"+e)[0].play()},this.stopSound=function(e){var t=$("#"+e)[0]
t.pause(),t.currentTime=0},this.isPremium=function(){if(g.admin)return!0
var e=g.getMember(g.userId)
return"premium"in e?1==e.premium:!1},this.checkPremium=function(e){return g.isPremium()?!0:(g.dialogs.create({id:"premium-required",title:t("premiumFeature"),content:tpl("premiumLockDialogTemplate"),buttons:[{id:"cancel","class":"btn-default",title:t("cancel"),click:function(){this.remove()}}]}),!1)},this.openProfile=function(e,n){var i=e==g.userId,o=g.admin||g.moderator
g.dialogs.create({id:"profile-"+e,title:n,titleIcon:"search",content:{url:"/profile/view",data:{id:e},onLoad:function(r){var s=r.body().find(".not-found").length>0
if(!s){var c={},a=r.body().find(".online").length>0,l=r.body().find(".banned").length>0,d=r.body().find(".blocked").length>0,u=r.body().find(".friend").length>0,m=g.isInBlackList(e),f=r.body().find(".moderator").length>0
if(l&&!d)return c.ok={id:"ok","class":"btn-default",title:t("close"),click:function(){this.remove()}},void r.setOption("buttons",c)
if(l&&d&&g.admin)return c.ban={id:"ban","class":"btn-danger",icon:"ban",hint:t("banUser"),click:function(){g.admin.banUser(e,n),this.remove()}},c.ok={id:"ok","class":"btn-default",title:t("close"),click:function(){this.remove()}},void r.setOption("buttons",c)
g.admin&&!i&&(c.history={id:"ban","class":"btn-primary",icon:"history",hint:t("viewLog"),click:function(){g.moderator.showMessagesLog(e,n)}},c.ban={id:"ban","class":"btn-danger",icon:"ban",hint:t("banUser"),click:function(){g.admin.banUser(e,n),this.remove()}}),g.moderator&&!i&&(c.block={id:"block","class":"btn-danger",icon:"shield",hint:t("blockUser"),click:function(){g.moderator.blockUser(e,n),this.remove()}}),i&&(c.edit={id:"edit","class":"btn-default",icon:"edit",title:t("editProfile"),click:function(){g.editProfile(),this.remove()}}),i||!a||m||(c.chat={id:"chat","class":"btn-primary",icon:"comment",hint:t("sendChatRequest"),click:function(){g.controllers.textChat.sendRequest(e,n)}}),i||m||(c.message={id:"message","class":"btn-primary",icon:"envelope",hint:t("sendMessage"),click:function(){g.composeMessage(e)}},u||(c.friend_add={id:"friend-add","class":"btn-primary",icon:"user-plus",hint:t("friendAdd"),click:function(){g.controllers.friends.sendRequest(e,n)}})),o||i||f||(m?c.unignore={id:"unignore","class":"btn-primary",icon:"microphone",hint:t("unignore"),click:function(){var i=this
g.dialogs.confirm(t("unignoreConfirm",{name:n}),function(){g.removeFromBlackList(e),i.remove(),g.openProfile(e,n)})}}:(c.ignore={id:"ignore","class":"btn-primary",icon:"microphone-slash",hint:t("ignore"),click:function(){var i=this
g.dialogs.confirm(t("ignoreConfirm",{name:n}),function(){g.addToBlackList(e),i.remove()})}},c.report={id:"report","class":"btn-primary",icon:"flag",hint:t("reportMod"),click:function(){g.reportUser(e,n)}})),c.ok={id:"ok","class":"btn-default",icon:g.mobile?"times":!1,title:g.mobile?!1:t("close"),click:function(){this.remove()}},r.setOption("buttons",c),g.admin&&(r.body().find("#banEmailLink").click(function(e){e.preventDefault(),g.admin.banEmail($(this).data("email"))}),r.body().find("#ipFilterLink").click(function(e){e.preventDefault(),g.openMembersList({name:"ip:"+$(this).data("ip")})}))}}},width:400})},this.editProfile=function(){g.dialogs.create({id:"profile-edit",title:t("editProfile"),titleIcon:"gear",content:{url:"/profile/edit",onLoad:function(e){ProfileController(g,b,e)}},width:450,height:740,buttons:[{id:"save","class":"btn-primary",title:t("save")},{id:"cancel","class":"btn-default",title:t("cancel"),click:function(){this.remove()}}]})},this.editNameColor=function(){g.checkPremium()&&g.dialogs.create({id:"name-color",title:t("nameColor"),titleIcon:"paint-brush",content:{url:"/profile/color",onLoad:function(e){ProfileColorController(g,b,e)}},width:420,height:420,buttons:[{id:"save","class":"btn-primary",title:t("save")},{id:"default","class":"btn-default",title:t("default")},{id:"cancel","class":"btn-default",title:t("cancel"),click:function(){this.remove()}}]})},this.openHistory=function(){g.checkPremium()&&g.dialogs.create({id:"history",title:t("history"),titleIcon:"history",content:{url:"/history/dialog",onLoad:function(e){HistoryController(g,b,e)}},width:600,height:500})},this.openInbox=function(){g.dialogs.create({id:"inbox",title:t("Inbox"),titleIcon:"envelope-o",titleCount:0,content:{url:"/mail/inbox",onLoad:function(e){InboxController(g,b,e)}},width:600,height:400})},this.openMembersList=function(e){e||(e={}),g.dialogs.create({id:"members",title:t("findMembers",{total:"-"}),titleIcon:"search",titleCount:0,content:{url:"/members/dialog",onLoad:function(n){MembersListController(g,b,n,{title:"findMembers",filter:e,emptyMessage:t("findMembersEmpty")})}},width:850,height:550})},this.openFriendsList=function(){g.dialogs.create({id:"friends",title:t("friends",{total:"-"}),titleIcon:"users",titleCount:0,content:{url:"/members/dialog",data:{mode:"friends"},onLoad:function(e){MembersListController(g,b,e,{title:"friends",emptyMessage:t("friendsListEmpty"),menu:{remove:{title:t("friendRemove"),icon:"user-times",click:function(n){g.dialogs.confirm(t("friendRemoveConfirm",{name:n.userName}),function(){$.post("/friends/remove",{id:n.userId},function(t){t.success&&e.formHandler.submit()},"json")})}}}})}},width:850,height:550})},this.composeMessage=function(e,n){n=n||{},g.dialogs.create({id:"compose-"+e,title:t("sendMessage"),titleIcon:"envelope-o",titleCount:0,content:{url:"/mail/compose",data:{id:e},onLoad:function(t){var i=t.body().find("form")
n.subject&&i.find("#subject").val(n.subject),n.id&&i.find("#prevMessageId").val(n.id),t.formHandler=new FormHandler({form:i,submitButton:t.getButton("send"),onSuccess:function(){b.emit("mail sent",e),t.remove()}})}},width:400,height:535,buttons:[{id:"send","class":"btn-primary",title:t("send")},{id:"cancel","class":"btn-default",title:t("cancel"),click:function(){this.remove()}}]})},this.reportUser=function(e,n){g.dialogs.create({id:"report-"+e,title:t("reportModDialog",{name:n}),titleIcon:"flag",content:{url:"/reports/create",data:{id:e},onLoad:function(e){var n=e.body().find("form")
e.formHandler=new FormHandler({form:n,submitButton:e.getButton("send"),onSuccess:function(n){n.report_id&&b.emit("member reported",{reportId:n.report_id,suspectId:n.suspect_id,reporterId:n.user_id}),e.remove(),g.dialogs.message(t("reportSent"))}})}},width:400,height:525,buttons:[{id:"send","class":"btn-primary",title:t("send")},{id:"cancel","class":"btn-default",title:t("cancel"),click:function(){this.remove()}}]})},n()}function Counter(e){function t(){i.badge(n)}var n=0,i=new Favico({type:"rectangle",animation:"none"})
this.increment=function(e){e||(e=1),n+=e,t()},this.decrement=function(e){e||(e=1),0>n-e?n=0:n-=e,t()},this.reset=function(){n=0,t()}}
