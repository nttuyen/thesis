if (typeof(bsn) == "undefined")
	_b = bsn = {};

if (typeof(_b.Autosuggest) == "undefined")
	_b.Autosuggest = {};
//else
	//alert("Autosuggest is already set!");

_b.AutoSuggest = function (id, param)
{
	// no DOM - give up!
	//
	if (!document.getElementById)
		return 0;
	
	// get field via DOM
	//
	this.fld = _b.DOM.gE(id);

	if (!this.fld)
		return 0;
	
	// init variables
	//
	this.sInp 	= "";
	this.nInpC 	= 0;
	this.aSug 	= [];
	this.iHigh 	= 0;
	
	// parameters object
	//
	this.oP = param ? param : {};
	
	// defaults	
	//
	var k, def = {minchars:1, meth:"get", varname:"input", className:"autosuggest", timeout:8000, delay:200, offsety:-5, shownoresults: true, noresults: "Không có kết quả!", maxheight: 250, cache: true, maxentries: 25};
	for (k in def)
	{
		if (typeof(this.oP[k]) != typeof(def[k]))
			this.oP[k] = def[k];
	}
	
	
	// set keyup handler for field
	// and prevent autocomplete from client
	//
	var p = this;
	
	// NOTE: not using addEventListener because UpArrow fired twice in Safari
	//_b.DOM.addEvent( this.fld, 'keyup', function(ev){ return pointer.onKeyPress(ev); } );
	
	this.fld.onkeypress 	= function(ev){ return p.onKeyPress(ev); };
	this.fld.onkeyup 		= function(ev){ return p.onKeyUp(ev); };
	
	this.fld.setAttribute("autocomplete","off");
};


_b.AutoSuggest.prototype.onKeyPress = function(ev)
{
	
	var key = (window.event) ? window.event.keyCode : ev.keyCode;



	// set responses to keydown events in the field
	// this allows the user to use the arrow keys to scroll through the results
	// ESCAPE clears the list
	// TAB sets the current highlighted value
	//
	var RETURN = 13;
	var TAB = 9;
	var ESC = 27;
	
	var bubble = 1;

	switch(key)
	{
		case RETURN:
			this.setHighlightedValue();
			bubble = 0;
			break;
		case ESC:
			this.clearSuggestions();
			break;
	}

	return bubble;
};



_b.AutoSuggest.prototype.onKeyUp = function(ev)
{
	var key = (window.event) ? window.event.keyCode : ev.keyCode;
	


	// set responses to keydown events in the field
	// this allows the user to use the arrow keys to scroll through the results
	// ESCAPE clears the list
	// TAB sets the current highlighted value
	//

	var ARRUP = 38;
	var ARRDN = 40;
	
	var bubble = 1;

	switch(key)
	{


		case ARRUP:
			this.changeHighlight(key);
			bubble = 0;
			break;


		case ARRDN:
			this.changeHighlight(key);
			bubble = 0;
			break;
		
		
		default:
			this.getSuggestions(this.fld.value);
	}

	return bubble;
	

};


_b.AutoSuggest.prototype.getSuggestions = function (val)
{
	
	// if input stays the same, do nothing
	//
	if (val == this.sInp)
		return 0;
	
	
	// kill list
	//
	_b.DOM.remE(this.idAs);
	
	
	this.sInp = val;
	
	
	// input length is less than the min required to trigger a request
	// do nothing
	//
	if (val.length < this.oP.minchars)
	{
		this.aSug = [];
		this.nInpC = val.length;
		return 0;
	}
	
	
	
	
	var ol = this.nInpC; // old length
	this.nInpC = val.length ? val.length : 0;
	
	
	
	// if caching enabled, and user is typing (ie. length of input is increasing)
	// filter results out of aSuggestions from last request
	//
	var l = this.aSug.length;
	if (this.nInpC > ol && l && l<this.oP.maxentries && this.oP.cache)
	{
		var arr = [];
		for (var i=0;i<l;i++)
		{
			if (this.aSug[i].value.substr(0,val.length).toLowerCase() == val.toLowerCase())
				arr.push( this.aSug[i] );
		}
		this.aSug = arr;
		
		this.createList(this.aSug);
		
		
		
		return false;
	}
	else
	// do new request
	//
	{
		var pointer = this;
		var input = this.sInp;
		clearTimeout(this.ajID);
		this.ajID = setTimeout( function() { pointer.doAjaxRequest(input) }, this.oP.delay );
	}

	return false;
};

_b.AutoSuggest.prototype.doAjaxRequest = function (input)
{
	// check that saved input is still the value of the field
	//
	if (input != this.fld.value)
		return false;
	
	
	var pointer = this;
	
	
	// create ajax request
	//
	if (typeof(this.oP.script) == "function")
		var url = this.oP.script(encodeURIComponent(this.sInp));
	else
		var url = this.oP.script+this.oP.varname+"="+encodeURIComponent(this.sInp);
	
	if (!url)
		return false;
	
	var meth = this.oP.meth;
	var input = this.sInp;
	
	var onSuccessFunc = function (req) { pointer.setSuggestions(req, input) };
	var onErrorFunc = function (status) { //alert("AJAX error: "+status); 
	};

	var myAjax = new _b.Ajax();
	myAjax.makeRequest( url, meth, onSuccessFunc, onErrorFunc );
};


_b.AutoSuggest.prototype.setSuggestions = function (req, input)
{
	// if field input no longer matches what was passed to the request
	// don't show the suggestions
	//
	if (input != this.fld.value)
		return false;
	
	
	this.aSug = [];
	
	
	if (this.oP.json)
	{
		var jsondata = eval('(' + req.responseText + ')');
		
		for (var i=0;i<jsondata.results.length;i++)
		{
			this.aSug.push(  { 'id':jsondata.results[i].id, 'value':jsondata.results[i].value, 'info':jsondata.results[i].info }  );
		}
	}
	else
	{

		var xml = req.responseXML;
	
		// traverse xml
		//
		var results = xml.getElementsByTagName('results')[0].childNodes;

		for (var i=0;i<results.length;i++)
		{
			if (results[i].hasChildNodes())
				this.aSug.push(  { 'id':results[i].getAttribute('id'), 'value':results[i].childNodes[0].nodeValue, 'info':results[i].getAttribute('info') }  );
		}
	
	}
	
	this.idAs = "as_"+this.fld.id;
	

	this.createList(this.aSug);

};


_b.AutoSuggest.prototype.createList = function(arr)
{
	var pointer = this;

	// get rid of old list
	// and clear the list removal timeout
	//
	_b.DOM.remE(this.idAs);
	this.killTimeout();
	
	
	// if no results, and shownoresults is false, do nothing
	//
	if (arr.length == 0 && !this.oP.shownoresults)
		return false;
	
	
	// create holding div
	//
	var div = _b.DOM.cE("div", {id:this.idAs, className:this.oP.className});	
	
	//var hcorner = _b.DOM.cE("div", {className:"as_corner"});
	//var hbar = _b.DOM.cE("div", {className:"as_bar"});
	
	var header = _b.DOM.cE("div", {className:"as_header"});
	
	
	header.innerHTML = "<ul id='title_as_ul'><li><strong>Từ khóa</strong></li></ul>";
	
	
	//header.appendChild(hcorner);
	//header.appendChild(hbar);
	div.appendChild(header);
	
	// create and populate ul
	//
	var ul = _b.DOM.cE("ul", {id:"as_ul"});
	
	
	
	
	// loop throught arr of suggestions
	// creating an LI element for each suggestion
	//
	for (var i=0;i<arr.length;i++)
	{
		// format output with the input enclosed in a EM element
		// (as HTML, not DOM)
		//
		var val = arr[i].value;
		var st = val.toLowerCase().indexOf( this.sInp.toLowerCase() );
		//var output = val.substring(0,st) + "<li><em>" + val.substring(st, st+this.sInp.length) + "</em></li>" + val.substring(st+this.sInp.length);
		var output = val.substring(0,st) + "<li><div id=\"lidiv\"><div id=\"divtitle\"><em>" + val.substring(st, st+this.sInp.length) + "</em>"+val.substring(st+this.sInp.length)+ "</div><div id=\"divinfo\">" +arr[i].info+ "</div></div></li>";
		
		
		//var span 		= _b.DOM.cE("ul", {}, output, true);
		var span 		= _b.DOM.cE("ul", {}, output, true);
		if (arr[i].info != "")
		{
			//var br			= _b.DOM.cE("br", {});
			//span.appendChild(br);
			
			//var small		= _b.DOM.cE("li", {}, arr[i].info);
			//var small		= _b.DOM.cE("li", { id:"litotal"}, arr[i].info);
			//span.appendChild(small);
		}
		
		var a 			= _b.DOM.cE("a", { href:"#" });
		
//		var tl 		= _b.DOM.cE("span", {className:"tl"}, " ");
//		var tr 		= _b.DOM.cE("span", {className:"tr"}, " ");
//		a.appendChild(tl);
//		a.appendChild(tr);
		
		a.appendChild(span);
		
		a.name = i+1;
		a.onclick = function () { pointer.setHighlightedValue(); return false; };
		a.onmouseover = function () { pointer.setHighlight(this.name); };
		
		
		var li = _b.DOM.cE(  "li", {}, a  );
		ul.appendChild( li );
	}
	// no results
	//
	if (arr.length == 0 && this.oP.shownoresults)
	{
		var li = _b.DOM.cE(  "li", {className:"as_warning"}, this.oP.noresults  );
		ul.appendChild( li );
	}
	
	
	div.appendChild( ul );
	
	
	var fcorner = _b.DOM.cE("div", {className:"as_corner"});
	var fbar = _b.DOM.cE("div", {className:"as_bar"});
	var footer = _b.DOM.cE("div", {className:"as_footer"});
	footer.appendChild(fcorner);
	footer.appendChild(fbar);
	div.appendChild(footer);
	
	
	
	// get position of target textfield
	// position holding div below it
	// set width of holding div to width of field
	//
	var pos = _b.DOM.getPos(this.fld);
	
	div.style.left 		= pos.x + "px";
	div.style.top 		= ( pos.y + this.fld.offsetHeight + this.oP.offsety + 10) + "px";
	div.style.width 	= (this.fld.offsetWidth + 82) + "px";
	
	
	
	// set mouseover functions for div
	// when mouse pointer leaves div, set a timeout to remove the list after an interval
	// when mouse enters div, kill the timeout so the list won't be removed
	//
	div.onmouseover 	= function(){ pointer.killTimeout() };
	div.onmouseout 		= function(){ pointer.resetTimeout() };


	// add DIV to document
	//
	document.getElementsByTagName("body")[0].appendChild(div);
	
	
	
	// currently no item is highlighted
	//
	this.iHigh = 0;
	

	// remove list after an interval
	//
	var pointer = this;
	this.toID = setTimeout(function () { pointer.clearSuggestions() }, this.oP.timeout);
};


_b.AutoSuggest.prototype.changeHighlight = function(key)
{	
	var list = _b.DOM.gE("as_ul");
	if (!list)
		return false;
	
	var n;

	if (key == 40)
		n = this.iHigh + 1;
	else if (key == 38)
		n = this.iHigh - 1;
	
	
	if (n > list.childNodes.length)
		n = list.childNodes.length;
	if (n < 1)
		n = 1;
	
	
	this.setHighlight(n);
};



_b.AutoSuggest.prototype.setHighlight = function(n)
{
	var list = _b.DOM.gE("as_ul");
	if (!list)
		return false;
	
	if (this.iHigh > 0)
		this.clearHighlight();
	
	this.iHigh = Number(n);
	
	list.childNodes[this.iHigh-1].className = "as_highlight";


	this.killTimeout();
};


_b.AutoSuggest.prototype.clearHighlight = function()
{
	var list = _b.DOM.gE("as_ul");
	if (!list)
		return false;
	
	if (this.iHigh > 0)
	{
		list.childNodes[this.iHigh-1].className = "";
		this.iHigh = 0;
	}
};


_b.AutoSuggest.prototype.setHighlightedValue = function ()
{
	if (this.iHigh)
	{
		this.sInp = this.fld.value = this.aSug[ this.iHigh-1 ].value;
		
		// move cursor to end of input (safari)
		//
		this.fld.focus();
		if (this.fld.selectionStart)
			this.fld.setSelectionRange(this.sInp.length, this.sInp.length);
		

		this.clearSuggestions();
		
		// pass selected object to callback function, if exists
		//
		if (typeof(this.oP.callback) == "function")
			this.oP.callback( this.aSug[this.iHigh-1] );
	}
};


_b.AutoSuggest.prototype.killTimeout = function()
{
	clearTimeout(this.toID);
};

_b.AutoSuggest.prototype.resetTimeout = function()
{
	clearTimeout(this.toID);
	var pointer = this;
	this.toID = setTimeout(function () { pointer.clearSuggestions() }, 1000);
};


_b.AutoSuggest.prototype.clearSuggestions = function ()
{
	
	this.killTimeout();
	
	var ele = _b.DOM.gE(this.idAs);
	var pointer = this;
	if (ele)
	{
		var fade = new _b.Fader(ele,1,0,250,function () { _b.DOM.remE(pointer.idAs) });
	}
};



// AJAX PROTOTYPE _____________________________________________


if (typeof(_b.Ajax) == "undefined")
	_b.Ajax = {};



_b.Ajax = function ()
{
	this.req = {};
	this.isIE = false;
};



_b.Ajax.prototype.makeRequest = function (url, meth, onComp, onErr)
{
	
	if (meth != "POST")
		meth = "GET";
	
	this.onComplete = onComp;
	this.onError = onErr;
	
	var pointer = this;
	
	// branch for native XMLHttpRequest object
	if (window.XMLHttpRequest)
	{
		this.req = new XMLHttpRequest();
		this.req.onreadystatechange = function () { pointer.processReqChange() };
		this.req.open("GET", url, true); //
		this.req.send(null);
	// branch for IE/Windows ActiveX version
	}
	else if (window.ActiveXObject)
	{
		this.req = new ActiveXObject("Microsoft.XMLHTTP");
		if (this.req)
		{
			this.req.onreadystatechange = function () { pointer.processReqChange() };
			this.req.open(meth, url, true);
			this.req.send();
		}
	}
};


_b.Ajax.prototype.processReqChange = function()
{
	
	// only if req shows "loaded"
	if (this.req.readyState == 4) {
		// only if "OK"
		if (this.req.status == 200)
		{
			this.onComplete( this.req );
		} else {
			this.onError( this.req.status );
		}
	}
};



// DOM PROTOTYPE _____________________________________________


if (typeof(_b.DOM) == "undefined")
	_b.DOM = {};



/* create element */
_b.DOM.cE = function ( type, attr, cont, html )
{
	var ne = document.createElement( type );
	if (!ne)
		return 0;
		
	for (var a in attr)
		ne[a] = attr[a];
	
	var t = typeof(cont);
	
	if (t == "string" && !html)
		ne.appendChild( document.createTextNode(cont) );
	else if (t == "string" && html)
		ne.innerHTML = cont;
	else if (t == "object")
		ne.appendChild( cont );

	return ne;
};



/* get element */
_b.DOM.gE = function ( e )
{
	var t=typeof(e);
	if (t == "undefined")
		return 0;
	else if (t == "string")
	{
		var re = document.getElementById( e );
		if (!re)
			return 0;
		else if (typeof(re.appendChild) != "undefined" )
			return re;
		else
			return 0;
	}
	else if (typeof(e.appendChild) != "undefined")
		return e;
	else
		return 0;
};

/* remove element */
_b.DOM.remE = function ( ele )
{
	var e = this.gE(ele);
	
	if (!e)
		return 0;
	else if (e.parentNode.removeChild(e))
		return true;
	else
		return 0;
};



/* get position */
_b.DOM.getPos = function ( e )
{
	var e = this.gE(e);

	var obj = e;

	var curleft = 0;
	if (obj.offsetParent)
	{
		while (obj.offsetParent)
		{
			curleft += obj.offsetLeft;
			obj = obj.offsetParent;
		}
	}
	else if (obj.x)
		curleft += obj.x;
	
	var obj = e;
	
	var curtop = 0;
	if (obj.offsetParent)
	{
		while (obj.offsetParent)
		{
			curtop += obj.offsetTop;
			obj = obj.offsetParent;
		}
	}
	else if (obj.y)
		curtop += obj.y;

	return {x:curleft, y:curtop};
};


// FADER PROTOTYPE _____________________________________________



if (typeof(_b.Fader) == "undefined")
	_b.Fader = {};


_b.Fader = function (ele, from, to, fadetime, callback)
{	
	if (!ele)
		return 0;
	
	this.e = ele;
	
	this.from = from;
	this.to = to;
	
	this.cb = callback;
	
	this.nDur = fadetime;
		
	this.nInt = 50;
	this.nTime = 0;
	
	var p = this;
	this.nID = setInterval(function() { p._fade() }, this.nInt);
};


_b.Fader.prototype._fade = function()
{
	this.nTime += this.nInt;
	
	var ieop = Math.round( this._tween(this.nTime, this.from, this.to, this.nDur) * 100 );
	var op = ieop / 100;
	
	if (this.e.filters) // internet explorer
	{
		try
		{
			this.e.filters.item("DXImageTransform.Microsoft.Alpha").opacity = ieop;
		} catch (e) { 
			// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
			this.e.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity='+ieop+')';
		}
	}
	else // other browsers
	{
		this.e.style.opacity = op;
	}
	
	
	if (this.nTime == this.nDur)
	{
		clearInterval( this.nID );
		if (this.cb != undefined)
			this.cb();
	}
};



_b.Fader.prototype._tween = function(t,b,c,d)
{
	return b + ( (c-b) * (t/d) );
};
/*
 *  AVIM JavaScript Vietnamese Input Method Source File dated 02-11-2007
 *
 *	Copyright (C) 2004-2007 Hieu Tran Dang <lt2hieu2004 (at) users (dot) sf (dot) net>
 *	Website:	http://hdang.co.uk
 *
 *	You are allowed to use this software in any way you want providing:
 *		1. You must retain this copyright notice at all time
 *		2. You must not claim that you or any other third party is the author
 *		   of this software in any way.
*/

va="email".split(',') //Put the ID of the fields you DON'T want to let users type Vietnamese in, multiple fields allowed, separated by a comma (,)
method=0 //Default input method, 0=AUTO, 1=TELEX, 2=VNI, 3=VIQR, 4=VIQR*
on_off=1 //Start AVIM on
dockspell=1 //Start AVIM with spell checking on
dauCu=1 //Start AVIM with old way of marking accent (o`a, o`e, u`y)
useCookie=1 //Set this to 0 to NOT use cookies
radioID="him_auto,him_telex,him_vni,him_viqr,him_viqr2,him_off,him_ckspell,him_daucu".split(",")
var agt=navigator.userAgent.toLowerCase(),alphabet="QWERTYUIOPASDFGHJKLZXCVBNM\ ",them,spellerr,setCookie,getCookie,attached=new Array()
var is_ie=((agt.indexOf("msie")!=-1)&&(agt.indexOf("opera")==-1)),S,F,J,R,X,D,oc,sk,saveStr,wi,frame,is_opera=false,D2,isKHTML=false
var ver=0,support=true,changed=false,specialChange=false,uni,uni2,g,h,SFJRX,DAWEO,Z,AEO,moc,trang,kl=0,tw5,range=null,fID=document.getElementsByTagName("iframe")
skey=new Array(97,226,259,101,234,105,111,244,417,117,432,121,65,194,258,69,202,73,79,212,416,85,431,89)
var skey2="a,a,a,e,e,i,o,o,o,u,u,y,A,A,A,E,E,I,O,O,O,U,U,Y".split(','),A,E,O,whit=false,english="ĐÂĂƠƯÊÔ",lowen="đâăơưêô",ds1="d,D".split(","),db1=new Array(273,272)
os1="o,O,ơ,Ơ,ó,Ó,ò,Ò,ọ,Ọ,ỏ,Ỏ,õ,Õ,ớ,Ớ,ờ,Ờ,ợ,Ợ,ở,Ở,ỡ,Ỡ".split(","),ob1="ô,Ô,ô,Ô,ố,Ố,ồ,Ồ,ộ,Ộ,ổ,Ổ,ỗ,Ỗ,ố,Ố,ồ,Ồ,ộ,Ộ,ổ,Ổ,ỗ,Ỗ".split(",")
mocs1="o,O,ô,Ô,u,U,ó,Ó,ò,Ò,ọ,Ọ,ỏ,Ỏ,õ,Õ,ú,Ú,ù,Ù,ụ,Ụ,ủ,Ủ,ũ,Ũ,ố,Ố,ồ,Ồ,ộ,Ộ,ổ,Ổ,ỗ,Ỗ".split(",");mocb1="ơ,Ơ,ơ,Ơ,ư,Ư,ớ,Ớ,ờ,Ờ,ợ,Ợ,ở,Ở,ỡ,Ỡ,ứ,Ứ,ừ,Ừ,ự,Ự,ử,Ử,ữ,Ữ,ớ,Ớ,ờ,Ờ,ợ,Ợ,ở,Ở,ỡ,Ỡ".split(",")
trangs1="a,A,â,Â,á,Á,à,À,ạ,Ạ,ả,Ả,ã,Ã,ấ,Ấ,ầ,Ầ,ậ,Ậ,ẩ,Ẩ,ẫ,Ẫ".split(",");trangb1="ă,Ă,ă,Ă,ắ,Ắ,ằ,Ằ,ặ,Ặ,ẳ,Ẳ,ẵ,Ẵ,ắ,Ắ,ằ,Ằ,ặ,Ặ,ẳ,Ẳ,ẵ,Ẵ".split(",")
as1="a,A,ă,Ă,á,Á,à,À,ạ,Ạ,ả,Ả,ã,Ã,ắ,Ắ,ằ,Ằ,ặ,Ặ,ẳ,Ẳ,ẵ,Ẵ,ế,Ế,ề,Ề,ệ,Ệ,ể,Ể,ễ,Ễ".split(",");ab1="â,Â,â,Â,ấ,Ấ,ầ,Ầ,ậ,Ậ,ẩ,Ẩ,ẫ,Ẫ,ấ,Ấ,ầ,Ầ,ậ,Ậ,ẩ,Ẩ,ẫ,Ẫ,é,É,è,È,ẹ,Ẹ,ẻ,Ẻ,ẽ,Ẽ".split(",")
es1="e,E,é,É,è,È,ẹ,Ẹ,ẻ,Ẻ,ẽ,Ẽ".split(",");eb1="ê,Ê,ế,Ế,ề,Ề,ệ,Ệ,ể,Ể,ễ,Ễ".split(",")
arA="á,à,ả,ã,ạ,a,Á,À,Ả,Ã,Ạ,A".split(',');mocrA="ó,ò,ỏ,õ,ọ,o,ú,ù,ủ,ũ,ụ,u,Ó,Ò,Ỏ,Õ,Ọ,O,Ú,Ù,Ủ,Ũ,Ụ,U".split(',');erA="é,è,ẻ,ẽ,ẹ,e,É,È,Ẻ,Ẽ,Ẹ,E".split(',');orA="ó,ò,ỏ,õ,ọ,o,Ó,Ò,Ỏ,Õ,Ọ,O".split(',')
aA="ấ,ầ,ẩ,ẫ,ậ,â,Ấ,Ầ,Ẩ,Ẫ,Ậ,Â".split(',');mocA="ớ,ờ,ở,ỡ,ợ,ơ,ứ,ừ,ử,ữ,ự,ư,Ớ,Ờ,Ở,Ỡ,Ợ,Ơ,Ứ,Ừ,Ử,Ữ,Ự,Ư".split(',');trangA="ắ,ằ,ẳ,ẵ,ặ,ă,Ắ,Ằ,Ẳ,Ẵ,Ặ,Ă".split(',');eA="ế,ề,ể,ễ,ệ,ê,Ế,Ề,Ể,Ễ,Ệ,Ê".split(',');oA="ố,ồ,ổ,ỗ,ộ,ô,Ố,Ồ,Ổ,Ỗ,Ộ,Ô".split(',')

function notWord(w) {
	var str="\ \r\n#,\\;.:-_()<>+-*/=?!\"$%{}[]\'~|^\@\&\t"+fcc(160)
	return (str.indexOf(w)>=0)
}
function nan(w) {
	if ((isNaN(w))||(w=='e')) return true
	else return false
}
function mozGetText(obj) {
	var v,pos,w="";g=1
	v=(obj.data)?obj.data:obj.value
	if(v.length<=0) return false
	if(!obj.data) {
		if(!obj.setSelectionRange) return false
		pos=obj.selectionStart
	} else pos=obj.pos
	if(obj.selectionStart!=obj.selectionEnd) return new Array("",pos)
	while(1) {
		if(pos-g<0) break
		else if(notWord(v.substr(pos-g,1))) { if(v.substr(pos-g,1)=="\\") w=v.substr(pos-g,1)+w; break }
		else w=v.substr(pos-g,1)+w; g++
	}
	return new Array(w,pos)
}
function start(obj,key) {
	var w="",nnc;oc=obj;uni2=false
	if(method==0) { uni="D,A,E,O,W,W".split(','); uni2="9,6,6,6,7,8".split(','); D2="DAWEO6789" }
	else if(method==1) { uni="D,A,E,O,W,W".split(','); D2="DAWEO" }
	else if(method==2) { uni="9,6,6,6,7,8".split(','); D2="6789" }
	else if(method==3) { uni="D,^,^,^,+,(".split(','); D2="D^+(" }
	else if(method==4) { uni="D,^,^,^,*,(".split(','); D2="D^*(" }
	if(!is_ie) {
		key=fcc(key.which)
		w=mozGetText(obj)
		if(D2.indexOf(up(key))>=0) nnc=true
		else nnc=false
		if((!w)||(obj.sel)) return
		main(w[0],key,w[1],uni,nnc)
		if(!dockspell) w=mozGetText(obj)
		if((w)&&(uni2)&&(!changed)) main(w[0],key,w[1],uni2,nnc)
	} else {
		obj=ieGetText(obj)
		if(obj) {
			var sT=obj.cW.text
			w=main(obj.cW.text,key,0,uni,false)
			if((uni2)&&((w==sT)||(typeof(w)=='undefined'))) w=main(obj.cW.text,key,0,uni2,false)
			if(w) obj.cW.text=w
		}
	}
	if(D2.indexOf(up(key))>=0) {
		if(!is_ie) {
			w=mozGetText(obj)
			if(!w) return
			normC(w[0],key,w[1])
		} else if(typeof(obj)=="object") { 
			obj=ieGetText(obj)
			if(obj) {
				w=obj.cW.text
				if(!changed) { w+=key; changed=true }
				obj.cW.text=w
				w=normC(w,key,0)
				if(w) { obj=ieGetText(obj); obj.cW.text=w }
			}
		} 
	}
}
function ieGetText(obj) {
	var caret=obj.document.selection.createRange(),w=""
	if(caret.text) caret.text=""
	else {
		while(1) {
			caret.moveStart("character",-1)
			if(w.length==caret.text.length) break
			w=caret.text
			if(notWord(w.charAt(0))) {
				if(w.charCodeAt(0)==13) w=w.substr(2)
				else if(w.charAt(0)!="\\") w=w.substr(1)
				break
			}
		}
	}
	if(w.length) {
		caret.collapse(false)
		caret.moveStart("character",-w.length)
		obj.cW=caret.duplicate()
		return obj
	} else return false
}
function ie_replaceChar(w,pos,c) {
	var r="",uc=0
	if(isNaN(c)) uc=up(c)
	if((whit)&&(up(w.substr(w.length-pos-1,1))=='U')&&(pos!=1)&&(up(w.substr(w.length-pos-2,1))!='Q')) {
		whit=false
		if((up(unV(fcc(c)))=="Ơ")||(uc=="O")) {
			if(w.substr(w.length-pos-1,1)=='u') r=fcc(432)
			else r=fcc(431)
		}
		if(uc=="O") {
			if(c=="o") c=417
			else c=416
		}
	}
	if(!isNaN(c)) {
		changed=true;r+=fcc(c)
		return w.substr(0,w.length-pos-r.length+1)+r+w.substr(w.length-pos+1)
	} else return w.substr(0,w.length-pos)+c+w.substr(w.length-pos+1)
}
function tr(k,w,by,sf,i) {
	var r,pos=findC(w,k,sf)
	if(pos) {
		if(pos[1]) {
			if(is_ie) return ie_replaceChar(w,pos[0],pos[1])
			else return replaceChar(oc,i-pos[0],pos[1])
		} else {
			var c,pC=w.substr(w.length-pos,1),cmp;r=sf
			for(g=0;g<r.length;g++) {
				if((nan(r[g]))||(r[g]=="e")) cmp=pC
				else cmp=pC.charCodeAt(0)
				if(cmp==r[g]) {
					if(!nan(by[g])) c=by[g]
					else c=by[g].charCodeAt(0)
					if(is_ie) return ie_replaceChar(w,pos,c)
					else return replaceChar(oc,i-pos,c)
				}
			}
		}
	}
	return false
}
function main(w,k,i,a,nnc) {
	var uk=up(k),bya=new Array(db1,ab1,eb1,ob1,mocb1,trangb1),got=false,t="d,D,a,A,a,A,o,O,u,U,e,E,o,O".split(",")
	var sfa=new Array(ds1,as1,es1,os1,mocs1,trangs1),by=new Array(),sf=new Array()
	if((method==2)||((method==0)&&(a[0]=="9"))) {
		DAWEO="6789";SFJRX="12534";S="1";F="2";J="5";R="3";X="4";Z="0";D="9";FRX="234";AEO="6";moc="7";trang="8";them="678";A="^";E="^";O="^"
	} else if(method==3) {
		DAWEO="^+(D";SFJRX="'`.?~";S="'";F="`";J=".";R="?";X="~";Z="-";D="D";FRX="`?~";AEO="^";moc="+";trang="(";them="^+(";A="^";E="^";O="^"
	} else if(method==4) {
		DAWEO="^*(D";SFJRX="'`.?~";S="'";F="`";J=".";R="?";X="~";Z="-";D="D";FRX="`?~";AEO="^";moc="*";trang="(";them="^*(";A="^";E="^";O="^"
	} else if((method==1)||((method==0)&&(a[0]=="D"))) {
		SFJRX="SFJRX";DAWEO="DAWEO";D='D';S='S';F='F';J='J';R='R';X='X';Z='Z';FRX="FRX";them="AOEW";trang="W";moc="W";A="A";E="E";O="O"
	}
	if(SFJRX.indexOf(uk)>=0) {
		var ret=sr(w,k,i); got=true
		if(ret) return ret
	} else if(uk==Z) {
		sf=repSign(null)
		for(h=0;h<english.length;h++) {
			sf[sf.length]=lowen.charCodeAt(h)
			sf[sf.length]=english.charCodeAt(h)
		}
		for(h=0;h<5;h++) for(g=0;g<skey.length;g++) by[by.length]=skey[g]
		for(h=0;h<t.length;h++) by[by.length]=t[h]
		got=true
	}
	else for(h=0;h<a.length;h++) if(a[h]==uk) { got=true; by=by.concat(bya[h]); sf=sf.concat(sfa[h]) }
	if(uk==moc) whit=true;
	if(!got) {
		if(nnc) return
		return normC(w,k,i)
	}
	return DAWEOZ(k,w,by,sf,i,uk)
}
function DAWEOZ(k,w,by,sf,i,uk) { if((DAWEO.indexOf(uk)>=0)||(Z.indexOf(uk)>=0)) return tr(k,w,by,sf,i) }
function normC(w,k,i) {
	var uk=up(k),u=repSign(null),fS,c,j,space=(k.charCodeAt(0)==32)?true:false
	if((!is_ie)&&(space)) return
	for(j=1;j<=w.length;j++) {
		for(h=0;h<u.length;h++) {
			if(u[h]==w.charCodeAt(w.length-j)) {
				if(h<=23) fS=S
				else if(h<=47) fS=F
				else if(h<=71) fS=J
				else if(h<=95) fS=R
				else fS=X
				c=skey[h%24]; if((alphabet.indexOf(uk)<0)&&(D2.indexOf(uk)<0)) return w; w=unV(w)
				if((!space)&&(!changed)) w+=k
				if(!is_ie) {
					var sp=oc.selectionStart,pos=sp
					if(!changed) {
						var sst=oc.scrollTop;pos+=k.length
						if(!oc.data) { oc.value=oc.value.substr(0,sp)+k+oc.value.substr(oc.selectionEnd);changed=true;oc.scrollTop=sst }
						else { oc.insertData(oc.pos,k);oc.pos++;range.setEnd(oc,oc.pos);specialChange=true }
					}
					if(!oc.data) oc.setSelectionRange(pos,pos)
					if(!ckspell(w,fS)) {
						replaceChar(oc,i-j,c)
						if(!oc.data) {
							var a=new Array(D)
							main(w,fS,pos,a,false)
						} else {
							var ww=mozGetText(oc)
							var a=new Array(D)
							main(ww[0],fS,ww[1],a,false)
						}
					}
				} else {
					var ret=sr(w,fS,0)
					if((space)&&(ret)) ret+=fcc(32)
					if(ret) return ret
				}
			}
		}
	}
}
function nospell(w,k) { return false }
function ckspell(w,k) {
	w=unV(w); var exc="UOU,IEU".split(','),z,next=true,noE="UU,UOU,UOI,IEU,AO,IA,AI,AY,AU,AO".split(','),noBE="YEU",test,a,b
	var check=true,noM="UE,UYE,IU,EU,UY".split(','),noMT="AY,AU".split(','),noT="UA",t=-1,notV2="IAO"
	var uw=up(w),tw=uw,update=false,gi="IO",noAOEW="OE,OO,AO,EO,IA,AI".split(','),noAOE="OA"
	var notViet="AA,AE,EE,OU,YY,YI,IY,EY,EA,EI,II,IO,YO,YA,OOO".split(','),uk=up(k),twE,uw2=unV2(uw)
	var vSConsonant="B,C,D,G,H,K,L,M,N,P,Q,R,S,T,V,X".split(','),vDConsonant="CH,GI,KH,NGH,GH,NG,NH,PH,QU,TH,TR".split(',')
	var vDConsonantE="CH,NG,NH".split(','),sConsonant="C,P,T,CH".split(','),vSConsonantE="C,M,N,P,T".split(',')
	var noNHE="O,U,IE,Ô,Ơ,Ư,IÊ,Ă,Â,UYE,UYÊ,UO,ƯƠ,ƯO,UƠ,UA,ƯA,OĂ,OE,OÊ".split(','),oMoc="UU,UOU".split(',')
	if(FRX.indexOf(uk)>=0) for(a=0;a<sConsonant.length;a++) if(uw.substr(uw.length-sConsonant[a].length,sConsonant[a].length)==sConsonant[a]) return true
	for(a=0;a<uw.length;a++) {
		if("FJZW1234567890".indexOf(uw.substr(a,1))>=0) return true
		for(b=0;b<notViet.length;b++) {
			if(uw2.substr(a,notViet[b].length)==notViet[b]) {
				for(z=0;z<exc.length;z++) if(uw2.indexOf(exc[z])>=0) next=false
				if((next)&&((gi.indexOf(notViet[b])<0)||(a<=0)||(uw2.substr(a-1,1)!='G'))) return true
			}
		}
	}
	for(b=0;b<vDConsonant.length;b++) if(tw.indexOf(vDConsonant[b])==0){tw=tw.substr(vDConsonant[b].length);update=true;t=b;break}
	if(!update) for(b=0;b<vSConsonant.length;b++) if(tw.indexOf(vSConsonant[b])==0){tw=tw.substr(1);break}
	update=false;twE=tw
	for(b=0;b<vDConsonantE.length;b++) {
		if(tw.substr(tw.length-vDConsonantE[b].length)==vDConsonantE[b]) {
			tw=tw.substr(0,tw.length-vDConsonantE[b].length)
			if(b==2){
				for(z=0;z<noNHE.length;z++) if(tw==noNHE[z]) return true
				if((uk==trang)&&((tw=="OA")||(tw=="A"))) return true
			}
			update=true;break
		}
	}
	if(!update) for(b=0;b<vSConsonantE.length;b++) if(tw.substr(tw.length-1)==vSConsonantE[b]){tw=tw.substr(0,tw.length-1);break}
	if(tw) {
		for(a=0;a<vDConsonant.length;a++) {
			for(b=0;b<tw.length;b++) { if(tw.substr(b,vDConsonant[a].length)==vDConsonant[a]) return true }
		}
		for(a=0;a<vSConsonant.length;a++) { if(tw.indexOf(vSConsonant[a])>=0) return true }
	}
	test=tw.substr(0,1)
	if((t==3)&&((test=="A")||(test=="O")||(test=="U")||(test=="Y"))) return true
	if((t==5)&&((test=="E")||(test=="I")||(test=="Y"))) return true
	uw2=unV2(tw)
	if(uw2==notV2) return true
	if(tw!=twE) for(z=0;z<noE.length;z++) if(uw2==noE[z]) return true
	if((tw!=uw)&&(uw2==noBE)) return true
	if(uk!=moc) for(z=0;z<oMoc.length;z++) if(tw==oMoc[z]) return true
	if((uw2.indexOf('UYE')>0)&&(uk=='E')) check=false
	if((them.indexOf(uk)>=0)&&(check)) {
		for(a=0;a<noAOEW.length;a++) if(uw2.indexOf(noAOEW[a])>=0) return true
		if(uk!=trang) if(uw2==noAOE) return true
		if((uk==trang)&&(trang!='W')) if(uw2==noT) return true
		if(uk==moc) for(a=0;a<noM.length;a++) if(uw2==noM[a]) return true
		if((uk==moc)||(uk==trang)) for(a=0;a<noMT.length;a++) if(uw2==noMT[a]) return true
	}
	tw5=tw
	if((uw2.charCodeAt(0)==272)||(uw2.charCodeAt(0)==273)) { if(uw2.length>4) return true }
	else if(uw2.length>3) return true
	return false
}
function DAWEOF(cc,k) {
	var ret=new Array(),kA=new Array(A,moc,trang,E,O),z,a;ret[0]=g
	var ccA=new Array(aA,mocA,trangA,eA,oA),ccrA=new Array(arA,mocrA,arA,erA,orA)
	for(a=0;a<kA.length;a++) if(k==kA[a]) for(z=0;z<ccA[a].length;z++) if(cc==ccA[a][z]) ret[1]=ccrA[a][z]
	if(ret[1]) return ret
	else return false
}
function findC(w,k,sf) {
	if(((method==3)||(method==4))&&(w.substr(w.length-1,1)=="\\")) return new Array(1,k.charCodeAt(0))
	var str="",res,cc="",pc="",tE="",vowA=new Array(),s="ÂĂÊÔƠƯêâăơôư",c=0,dn=false,uw=up(w),tv
	var DAWEOFA=aA.join()+eA.join()+mocA.join()+trangA.join()+oA.join()+english;DAWEOFA=up(DAWEOFA)
	for(g=0;g<sf.length;g++) {
		if(nan(sf[g])) str+=sf[g]
		else str+=fcc(sf[g])
	}
	var uk=up(k),i=w.length,uni_array=repSign(k),w2=up(unV2(unV(w))),dont="ƯA,ƯU".split(',')
	if (DAWEO.indexOf(uk)>=0) {
		if(uk==moc) {
			if((w2.indexOf("UU")>=0)&&(tw5!=dont[1])) {
				if(w2.indexOf("UU")==(w.length-2)) res=2
				else return false
			} else if(w2.indexOf("UOU")>=0) {
				if(w2.indexOf("UOU")==(w.length-3)) res=2
				else return false
			}
		}
		if(!res) {
			for(g=1;g<=w.length;g++) {
				cc=w.substr(w.length-g,1)
				pc=up(w.substr(w.length-g-1,1))
				uc=up(cc)
				for(h=0;h<dont.length;h++) if((tw5==dont[h])&&(tw5==unV(pc+uc))) dn=true
				if(dn) { dn=false; continue }
				if(str.indexOf(uc)>=0) {
					if(((uk==moc)&&(unV(uc)=="U")&&(up(unV(w.substr(w.length-g+1,1)))=="A"))||((uk==trang)&&(unV(uc)=='A')&&(unV(pc)=='U'))) {
						if(unV(uc)=="U") tv=1
						else tv=2
						ccc=up(w.substr(w.length-g-tv,1))
						if(ccc!="Q") res=g+tv-1
						else if(uk==trang) res=g
						else if(moc!=trang) return false
					} else res=g
					if((!whit)||(uw.indexOf("Ư")<0)||(uw.indexOf("W")<0)) break
				} else if(DAWEOFA.indexOf(uc)>=0) {
					if(uk==D) {
						if(cc=="đ") res=new Array(g,'d')
						else if(cc=="Đ") res=new Array(g,'D')
					} else res=DAWEOF(cc,uk)
					if(res) break
				}
			}
		}
	}
	if((uk!=Z)&&(DAWEO.indexOf(uk)<0)) { var tEC=retKC(uk); for (g=0;g<tEC.length;g++) tE+=fcc(tEC[g]) }
	for(g=1;g<=w.length;g++) {
		if(DAWEO.indexOf(uk)<0) {
			cc=up(w.substr(w.length-g,1))
			pc=up(w.substr(w.length-g-1,1))
			if(str.indexOf(cc)>=0) {
				if(cc=='U') {
					if(pc!='Q') { c++;vowA[vowA.length]=g }
				} else if(cc=='I') {
					if((pc!='G')||(c<=0)) { c++;vowA[vowA.length]=g }
				} else { c++;vowA[vowA.length]=g }
			} else if(uk!=Z) {
				for(h=0;h<uni_array.length;h++) if(uni_array[h]==w.charCodeAt(w.length-g)) {
					if(spellerr(w,k)) return false
					return new Array(g,tEC[h%24])
				}
				for(h=0;h<tEC.length;h++) if(tEC[h]==w.charCodeAt(w.length-g)) return new Array(g,fcc(skey[h]))
			}
		}
	}
	if((uk!=Z)&&(typeof(res)!='object')) if(spellerr(w,k)) return false
	if(DAWEO.indexOf(uk)<0) {
		for(g=1;g<=w.length;g++) {
			if((uk!=Z)&&(s.indexOf(w.substr(w.length-g,1))>=0)) return g
			else if(tE.indexOf(w.substr(w.length-g,1))>=0) {
				for(h=0;h<tEC.length;h++) {
					if(w.substr(w.length-g,1).charCodeAt(0)==tEC[h]) return new Array(g,fcc(skey[h]))
				}
			}
		}
	}
	if(res) return res
	if((c==1)||(uk==Z)) return vowA[0]
	else if(c==2) {
		var v=2
		if(w.substr(w.length-1)==" ") v=3
		var ttt=up(w.substr(w.length-v,2))
		if((dauCu==0)&&((ttt=="UY")||(ttt=="OA")||(ttt=="OE"))) return vowA[0]
		var c2=0,fdconsonant,sc="BCD"+fcc(272)+"GHKLMNPQRSTVX",dc="CH,GI,KH,NGH,GH,NG,NH,PH,QU,TH,TR".split(',')
		for(h=1;h<=w.length;h++) {
			fdconsonant=false
			for(g=0;g<dc.length;g++) {
				if(up(w.substr(w.length-h-dc[g].length+1,dc[g].length)).indexOf(dc[g])>=0) {
					c2++;fdconsonant=true
					if(dc[g]!='NGH') h++
					else h+=2
				}
			}
			if(!fdconsonant) {
				if(sc.indexOf(up(w.substr(w.length-h,1)))>=0) c2++
				else break
			}
		}
		if((c2==1)||(c2==2)) return vowA[0]
		else return vowA[1]
	} else if(c==3) return vowA[1]
	else return false
}
function unV(w) {
	var u=repSign(null),b,a
	for(a=1;a<=w.length;a++) {
		for(b=0;b<u.length;b++) {
			if(u[b]==w.charCodeAt(w.length-a)) {
				w=w.substr(0,w.length-a)+fcc(skey[b%24])+w.substr(w.length-a+1)
			}
		}
	}
	return w
}
function unV2(w) {
	var a,b
	for(a=1;a<=w.length;a++) {
		for(b=0;b<skey.length;b++) {
			if(skey[b]==w.charCodeAt(w.length-a)) w=w.substr(0,w.length-a)+skey2[b]+w.substr(w.length-a+1)
		}
	}
	return w
}
function repSign(k) {
	var t=new Array(),u=new Array(),a,b
	for(a=0;a<5;a++) {
		if((k==null)||(SFJRX.substr(a,1)!=up(k))) {
			t=retKC(SFJRX.substr(a,1))
			for(b=0;b<t.length;b++) u[u.length]=t[b]
		}
	}
	return u
}
function sr(w,k,i) {
	var sf=getSF()
	pos=findC(w,k,sf)
	if(pos) {
		if(pos[1]) {
			if(!is_ie) replaceChar(oc,i-pos[0],pos[1])
			else return ie_replaceChar(w,pos[0],pos[1])
		} else {
			var c=retUni(w,k,pos)
			if (!is_ie) replaceChar(oc,i-pos,c)
			else return ie_replaceChar(w,pos,c)
		}
	}
	return false
}
function retUni(w,k,pos) {
	var u=retKC(up(k)),uC,lC,c=w.charCodeAt(w.length-pos),a
	for(a=0;a<skey.length;a++) if(skey[a]==c) {
		if(a<12) { lC=a;uC=a+12 }
		else { lC=a-12;uC=a }
		t=fcc(c);if(t!=up(t)) return u[lC]
		return u[uC]
	}
}
function replaceChar(o,pos,c) {
	var bb=false; if(!nan(c)) { var replaceBy=fcc(c),wfix=up(unV(fcc(c))); changed=true }
	else { var replaceBy=c; if((up(c)=="O")&&(whit)) bb=true }
	if(!o.data) {
		var savePos=o.selectionStart,sst=o.scrollTop
		if ((up(o.value.substr(pos-1,1))=='U')&&(pos<savePos-1)&&(up(o.value.substr(pos-2,1))!='Q')) {
			if((wfix=="Ơ")||(bb))
			{
				if (o.value.substr(pos-1,1)=='u') var r=fcc(432)
				else var r=fcc(431)
			}
			if(bb) {
				changed=true; if(c=="o") replaceBy="ơ"
				else replaceBy="Ơ"
			}
		}
		o.value=o.value.substr(0,pos)+replaceBy+o.value.substr(pos+1)
		if(r) o.value=o.value.substr(0,pos-1)+r+o.value.substr(pos)
		o.setSelectionRange(savePos,savePos);o.scrollTop=sst
	} else {
		if ((up(o.data.substr(pos-1,1))=='U')&&(pos<o.pos-1)) {
			if((wfix=="Ơ")||(bb))
			{
				if (o.data.substr(pos-1,1)=='u') var r=fcc(432)
				else var r=fcc(431)
			}
			if(bb) {
				changed=true; if(c=="o") replaceBy="ơ"
				else replaceBy="Ơ"
			}
		}
		o.deleteData(pos,1);o.insertData(pos,replaceBy)
		if(r) { o.deleteData(pos-1,1);o.insertData(pos-1,r) }
	}
	if(whit) whit=false
}
function retKC(k) {
	if(k==S) return new Array(225,7845,7855,233,7871,237,243,7889,7899,250,7913,253,193,7844,7854,201,7870,205,211,7888,7898,218,7912,221)
	if(k==F) return new Array(224,7847,7857,232,7873,236,242,7891,7901,249,7915,7923,192,7846,7856,200,7872,204,210,7890,7900,217,7914,7922)
	if(k==J) return new Array(7841,7853,7863,7865,7879,7883,7885,7897,7907,7909,7921,7925,7840,7852,7862,7864,7878,7882,7884,7896,7906,7908,7920,7924)
	if(k==R) return new Array(7843,7849,7859,7867,7875,7881,7887,7893,7903,7911,7917,7927,7842,7848,7858,7866,7874,7880,7886,7892,7902,7910,7916,7926)
	if(k==X) return new Array(227,7851,7861,7869,7877,297,245,7895,7905,361,7919,7929,195,7850,7860,7868,7876,296,213,7894,7904,360,7918,7928)
}
function getEL(id) { return document.getElementById(id) }
function getSF() { var sf=new Array(),x; for(x=0;x<skey.length;x++) sf[sf.length]=fcc(skey[x]); return sf }
function statusMessage() {
	var str='Kiểu gõ: '
	if(on_off==0) str+='Tắt'
	else if(method==1) str+='TELEX'
	else if(method==2) str+='VNI'
	else if(method==3) str+='VIQR'
	else if(method==4) str+='VIQR*'
	else if(method==0) str+='Tự động'
	if(isKHTML) str+=" [Alt-F9]"
	else str+=" [F9]"
	str+=" | Chính tả: "
	str+=(dockspell==0)?"Tắt":"Bật"
	if(isKHTML) str+=" [Alt-F8]"
	else str+=" [F8]"
	str+=" | Bỏ dấu: "
	str+=(dauCu==1)?"Cũ":"Mới"
	if(isKHTML) str+=" [Alt-F7]"
	else str+=" [F7]"
	str+=" | Bật/Tắt [F12] - AVIM 20071102"
	window.status=str
}
function updateInfo() { setCookie(); if(support) statusMessage() }
function setMethod(m) {
	if(m==-1) { on_off=0;if(getEL(radioID[5])) getEL(radioID[5]).checked=true }
	else { on_off=1;method=m;if(getEL(radioID[m])) getEL(radioID[m]).checked=true }
	setSpell(dockspell);setDauCu(dauCu);updateInfo()
}
function setDauCu(box) {
	if(typeof(box)=="number") {
		dauCu=box;if(getEL(radioID[7])) getEL(radioID[7]).checked=box
	} else dauCu=(box.checked)?1:0
	updateInfo()
}
function setSpell(box) {
	if(typeof(box)=="number") { 
		spellerr=(box==1)?ckspell:nospell
		if(getEL(radioID[6])) getEL(radioID[6]).checked=box
	}
	else {
		if(box.checked) { spellerr=ckspell;dockspell=1 }
		else { spellerr=nospell;dockspell=0 }
	}
	updateInfo()
}
function onKeyDown(e) {
	if (e=='iframe') { frame=findF();var key=frame.event.keyCode }
	else var key=(!is_ie)?e.which:window.event.keyCode
	if((key==120)||(key==123)||(key==119)||(key==118)) {
		if(key==120) { on_off=1;setMethod(((method==4)?0:++method)) }
		else if(key==118) { setDauCu(((dauCu==1)?0:1)) }
		else if(key==119) { dockspell=(dockspell==0)?1:0;setSpell(dockspell) }
		else if(key==123) {
			on_off=(on_off==0)?1:0
			if(on_off==0) setMethod(-1)
			else setMethod(method)
		}
		updateInfo()
	}
}
function ifInit(w) {
	var sel=w.getSelection()
	range=sel?sel.getRangeAt(0):document.createRange()
}
function ifMoz(e) {
	var code=e.which,cwi=e.target.parentNode.wi
	if(typeof(cwi)=="undefined") cwi=e.target.parentNode.parentNode.wi
	if((e.ctrlKey)||((e.altKey)&&(code!=92)&&(code!=126))) return;ifInit(cwi)
	var node=range.endContainer,newPos;sk=fcc(code);saveStr=""
	if(checkCode(code)||(!range.startOffset)||(typeof(node.data)=='undefined')) return;node.sel=false
	if(node.data) {
		saveStr=node.data.substr(range.endOffset)
		if(range.startOffset!=range.endOffset) node.sel=true
		node.deleteData(range.startOffset,node.data.length)
	}
	range.setEnd(node,range.endOffset)
	range.setStart(node,0)
	if(!node.data) return
	node.value=node.data; node.pos=node.data.length; node.which=code
	start(node,e)
	node.insertData(node.data.length,saveStr)
	newPos=node.data.length-saveStr.length+kl
	range.setEnd(node,newPos);range.setStart(node,newPos);kl=0
	if(specialChange) { specialChange=false; changed=false; node.deleteData(node.pos-1,1) }
	if(changed) { changed=false; e.preventDefault() }
}
function FKeyPress() {
	var obj=findF()
	sk=fcc(obj.event.keyCode)
	if(checkCode(obj.event.keyCode)||((obj.event.ctrlKey)&&(obj.event.keyCode!=92)&&(obj.event.keyCode!=126))) return
	start(obj,fcc(obj.event.keyCode))
	if (changed) { changed=false; return false }
}
function checkCode(code) { if(((on_off==0)||((code<45)&&(code!=42)&&(code!=32)&&(code!=39)&&(code!=40)&&(code!=43))||(code==145)||(code==255))) return true; return false }
function fcc(x) { return String.fromCharCode(x) }
if(useCookie==1) { setCookie=doSetCookie; getCookie=doGetCookie }
else { setCookie=noCookie; getCookie=noCookie }
function noCookie() {}
function doSetCookie() {
	var exp=new Date(11245711156480).toGMTString(),end=';expires='+exp+';path=/'
	document.cookie='AVIM_on_off='+on_off+end
	document.cookie='AVIM_method='+method+end
	document.cookie='AVIM_ckspell='+dockspell+end
	document.cookie='AVIM_daucu='+dauCu+end
}
function doGetCookie() {
	var ck=document.cookie, res=/AVIM_method/.test(ck)
	if((!res)||(ck.indexOf('AVIM_ckspell')<0)) { setCookie(); return }
	var p,ckA=ck.split(';')
	for(var i=0;i<ckA.length;i++) {
		p=ckA[i].split('='); p[0]=p[0].replace(/^\s+/g,""); p[1]=parseInt(p[1])
		if(p[0]=='AVIM_on_off') on_off=p[1]
		else if(p[0]=='AVIM_method') method=p[1]
		else if(p[0]=='AVIM_ckspell') {
			if(p[1]==0) { dockspell=0; spellerr=nospell }
			else { dockspell=1; spellerr=ckspell }
		} else if(p[0]=='AVIM_daucu') dauCu=parseInt(p[1])
	}
}
if(!is_ie) {
	if(agt.indexOf("opera")>=0) {
		operaV=agt.split(" ");operaVersion=parseInt(operaV[operaV.length-1])
		if(operaVersion>=8) is_opera=true
		else {
			operaV=operaV[0].split("/");operaVersion=parseInt(operaV[1])
			if(operaVersion>=8) is_opera=true
		}
	} else if(agt.indexOf("khtml")>=0) isKHTML=true
	else {
		ver=agt.substr(agt.indexOf("rv:")+3)
		ver=parseFloat(ver.substr(0,ver.indexOf(" ")))
		if(agt.indexOf("mozilla")<0) ver=0
	}
}
function up(w) {
	w=w.toUpperCase()
	if(isKHTML) {
		str="êôơâăưếốớấắứềồờầằừễỗỡẫẵữệộợậặự",rep="ÊÔƠÂĂƯẾỐỚẤẮỨỀỒỜẦẰỪỄỖỠẪẴỮỆỘỢẶỰ"
		for(z=0;z<w.length;z++) {
			io=str.indexOf(w.substr(z,1))
			if(io>=0) w=w.substr(0,z)+rep.substr(io,1)+w.substr(z+1)
		}
	}
	return w
}
function findIgnore(el) {
	for(i=0;i<va.length;i++) if((el.id==va[i])&&(va[i].length>0)) return true
}
if((is_ie)||(ver>=1.3)||(is_opera)||(isKHTML)) {
	getCookie()
	if(on_off==0) setMethod(-1)
	else setMethod(method)
	setSpell(dockspell);setDauCu(dauCu);statusMessage()
} else support=false
function onKeyPress(e) {
	if(!support) return
	if(!is_ie) { var el=e.target,code=e.which; if(e.ctrlKey) return; if((e.altKey)&&(code!=92)&&(code!=126)) return }
	else { var el=window.event.srcElement,code=window.event.keyCode; if((event.ctrlKey)&&(code!=92)&&(code!=126)) return }
	if(((el.type!='textarea')&&(el.type!='text'))||checkCode(code)) return
	sk=fcc(code); if (findIgnore(el)) return
	if(!is_ie) start(el,e)
	else start(el,sk)
	if(changed) { 
		changed=false
		if (!is_ie) e.preventDefault()
		else return false
	}
}
function attachEvt(obj,evt,handle,capture) {
	if(is_ie) { obj.attachEvent("on"+evt,handle); obj.attachEvent("on"+evt,getCookie) }
	else { obj.addEventListener(evt,handle,capture); obj.addEventListener(evt,getCookie,capture) }
}
attachEvt(document,"keydown",onKeyDown,false)
attachEvt(document,"keypress",onKeyPress,false)
function findF() {
	for(g=0;g<fID.length;g++) {
		if(findIgnore(fID[g])) continue;frame=fID[g]
		if(typeof(frame)!="undefined") {
			try { if((frame.contentWindow.document)&&(frame.contentWindow.event)&&(frame.contentWindow.document.designMode)) return frame.contentWindow }
			catch(e) { if((frame.document)&&(frame.event)) return frame }
		}
	}
}
function onKeyDownI() { onKeyDown("iframe") }
function init() {
var kkk=false
if((support)&&(!isKHTML)) {
	if(is_opera) { if(operaVersion<9) return }
	for(g=0;g<fID.length;g++) {
		if(findIgnore(fID[g])) continue
		if(is_ie) {
			var doc
			try {
				frame=fID[g];if(typeof(frame)!="undefined") {
					if(frame.contentWindow.document) doc=frame.contentWindow.document
					else if(frame.document) doc=frame.document
				}
				if((doc)&&((up(doc.designMode)=="ON")||(doc.body.contentEditable))) {
					for(l=0;l<attached.length;l++) if(doc==attached[l]) { kkk=true; break }
					if(!kkk) {
						attached[attached.length]=doc
						attachEvt(doc,"keydown",onKeyDownI,false)
						attachEvt(doc,"keypress",FKeyPress,false)
					} else kkk=false
				}
			}
			catch(e) { }
		} else {
			var iframedit
			try {
				wi=fID[g].contentWindow;iframedit=wi.document;iframedit.wi=wi
				if((iframedit)&&(up(iframedit.designMode)=="ON")) {
					attachEvt(iframedit,"keypress",ifMoz,false)
					attachEvt(iframedit,"keydown",onKeyDown,true)
				}
			} catch(e) { }
		}
	}
}
}
function uglyF() { ugly=50;while(ugly<5000) {setTimeout("init()",ugly);ugly+=50} }
uglyF();attachEvt(document,"mousedown",uglyF,false)
/*
 * jQuery 1.2.6 - New Wave Javascript
 *
 * Copyright (c) 2008 John Resig (jquery.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2008-05-24 14:22:17 -0400 (Sat, 24 May 2008) $
 * $Rev: 5685 $
 */
eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('(H(){J w=1b.4M,3m$=1b.$;J D=1b.4M=1b.$=H(a,b){I 2B D.17.5j(a,b)};J u=/^[^<]*(<(.|\\s)+>)[^>]*$|^#(\\w+)$/,62=/^.[^:#\\[\\.]*$/,12;D.17=D.44={5j:H(d,b){d=d||S;G(d.16){7[0]=d;7.K=1;I 7}G(1j d=="23"){J c=u.2D(d);G(c&&(c[1]||!b)){G(c[1])d=D.4h([c[1]],b);N{J a=S.61(c[3]);G(a){G(a.2v!=c[3])I D().2q(d);I D(a)}d=[]}}N I D(b).2q(d)}N G(D.1D(d))I D(S)[D.17.27?"27":"43"](d);I 7.6Y(D.2d(d))},5w:"1.2.6",8G:H(){I 7.K},K:0,3p:H(a){I a==12?D.2d(7):7[a]},2I:H(b){J a=D(b);a.5n=7;I a},6Y:H(a){7.K=0;2p.44.1p.1w(7,a);I 7},P:H(a,b){I D.P(7,a,b)},5i:H(b){J a=-1;I D.2L(b&&b.5w?b[0]:b,7)},1K:H(c,a,b){J d=c;G(c.1q==56)G(a===12)I 7[0]&&D[b||"1K"](7[0],c);N{d={};d[c]=a}I 7.P(H(i){R(c 1n d)D.1K(b?7.V:7,c,D.1i(7,d[c],b,i,c))})},1g:H(b,a){G((b==\'2h\'||b==\'1Z\')&&3d(a)<0)a=12;I 7.1K(b,a,"2a")},1r:H(b){G(1j b!="49"&&b!=U)I 7.4E().3v((7[0]&&7[0].2z||S).5F(b));J a="";D.P(b||7,H(){D.P(7.3t,H(){G(7.16!=8)a+=7.16!=1?7.76:D.17.1r([7])})});I a},5z:H(b){G(7[0])D(b,7[0].2z).5y().39(7[0]).2l(H(){J a=7;1B(a.1x)a=a.1x;I a}).3v(7);I 7},8Y:H(a){I 7.P(H(){D(7).6Q().5z(a)})},8R:H(a){I 7.P(H(){D(7).5z(a)})},3v:H(){I 7.3W(19,M,Q,H(a){G(7.16==1)7.3U(a)})},6F:H(){I 7.3W(19,M,M,H(a){G(7.16==1)7.39(a,7.1x)})},6E:H(){I 7.3W(19,Q,Q,H(a){7.1d.39(a,7)})},5q:H(){I 7.3W(19,Q,M,H(a){7.1d.39(a,7.2H)})},3l:H(){I 7.5n||D([])},2q:H(b){J c=D.2l(7,H(a){I D.2q(b,a)});I 7.2I(/[^+>] [^+>]/.11(b)||b.1h("..")>-1?D.4r(c):c)},5y:H(e){J f=7.2l(H(){G(D.14.1f&&!D.4n(7)){J a=7.6o(M),5h=S.3h("1v");5h.3U(a);I D.4h([5h.4H])[0]}N I 7.6o(M)});J d=f.2q("*").5c().P(H(){G(7[E]!=12)7[E]=U});G(e===M)7.2q("*").5c().P(H(i){G(7.16==3)I;J c=D.L(7,"3w");R(J a 1n c)R(J b 1n c[a])D.W.1e(d[i],a,c[a][b],c[a][b].L)});I f},1E:H(b){I 7.2I(D.1D(b)&&D.3C(7,H(a,i){I b.1k(a,i)})||D.3g(b,7))},4Y:H(b){G(b.1q==56)G(62.11(b))I 7.2I(D.3g(b,7,M));N b=D.3g(b,7);J a=b.K&&b[b.K-1]!==12&&!b.16;I 7.1E(H(){I a?D.2L(7,b)<0:7!=b})},1e:H(a){I 7.2I(D.4r(D.2R(7.3p(),1j a==\'23\'?D(a):D.2d(a))))},3F:H(a){I!!a&&D.3g(a,7).K>0},7T:H(a){I 7.3F("."+a)},6e:H(b){G(b==12){G(7.K){J c=7[0];G(D.Y(c,"2A")){J e=c.64,63=[],15=c.15,2V=c.O=="2A-2V";G(e<0)I U;R(J i=2V?e:0,2f=2V?e+1:15.K;i<2f;i++){J d=15[i];G(d.2W){b=D.14.1f&&!d.at.2x.an?d.1r:d.2x;G(2V)I b;63.1p(b)}}I 63}N I(7[0].2x||"").1o(/\\r/g,"")}I 12}G(b.1q==4L)b+=\'\';I 7.P(H(){G(7.16!=1)I;G(b.1q==2p&&/5O|5L/.11(7.O))7.4J=(D.2L(7.2x,b)>=0||D.2L(7.34,b)>=0);N G(D.Y(7,"2A")){J a=D.2d(b);D("9R",7).P(H(){7.2W=(D.2L(7.2x,a)>=0||D.2L(7.1r,a)>=0)});G(!a.K)7.64=-1}N 7.2x=b})},2K:H(a){I a==12?(7[0]?7[0].4H:U):7.4E().3v(a)},7b:H(a){I 7.5q(a).21()},79:H(i){I 7.3s(i,i+1)},3s:H(){I 7.2I(2p.44.3s.1w(7,19))},2l:H(b){I 7.2I(D.2l(7,H(a,i){I b.1k(a,i,a)}))},5c:H(){I 7.1e(7.5n)},L:H(d,b){J a=d.1R(".");a[1]=a[1]?"."+a[1]:"";G(b===12){J c=7.5C("9z"+a[1]+"!",[a[0]]);G(c===12&&7.K)c=D.L(7[0],d);I c===12&&a[1]?7.L(a[0]):c}N I 7.1P("9u"+a[1]+"!",[a[0],b]).P(H(){D.L(7,d,b)})},3b:H(a){I 7.P(H(){D.3b(7,a)})},3W:H(g,f,h,d){J e=7.K>1,3x;I 7.P(H(){G(!3x){3x=D.4h(g,7.2z);G(h)3x.9o()}J b=7;G(f&&D.Y(7,"1T")&&D.Y(3x[0],"4F"))b=7.3H("22")[0]||7.3U(7.2z.3h("22"));J c=D([]);D.P(3x,H(){J a=e?D(7).5y(M)[0]:7;G(D.Y(a,"1m"))c=c.1e(a);N{G(a.16==1)c=c.1e(D("1m",a).21());d.1k(b,a)}});c.P(6T)})}};D.17.5j.44=D.17;H 6T(i,a){G(a.4d)D.3Y({1a:a.4d,31:Q,1O:"1m"});N D.5u(a.1r||a.6O||a.4H||"");G(a.1d)a.1d.37(a)}H 1z(){I+2B 8J}D.1l=D.17.1l=H(){J b=19[0]||{},i=1,K=19.K,4x=Q,15;G(b.1q==8I){4x=b;b=19[1]||{};i=2}G(1j b!="49"&&1j b!="H")b={};G(K==i){b=7;--i}R(;i<K;i++)G((15=19[i])!=U)R(J c 1n 15){J a=b[c],2w=15[c];G(b===2w)6M;G(4x&&2w&&1j 2w=="49"&&!2w.16)b[c]=D.1l(4x,a||(2w.K!=U?[]:{}),2w);N G(2w!==12)b[c]=2w}I b};J E="4M"+1z(),6K=0,5r={},6G=/z-?5i|8B-?8A|1y|6B|8v-?1Z/i,3P=S.3P||{};D.1l({8u:H(a){1b.$=3m$;G(a)1b.4M=w;I D},1D:H(a){I!!a&&1j a!="23"&&!a.Y&&a.1q!=2p&&/^[\\s[]?H/.11(a+"")},4n:H(a){I a.1C&&!a.1c||a.2j&&a.2z&&!a.2z.1c},5u:H(a){a=D.3k(a);G(a){J b=S.3H("6w")[0]||S.1C,1m=S.3h("1m");1m.O="1r/4t";G(D.14.1f)1m.1r=a;N 1m.3U(S.5F(a));b.39(1m,b.1x);b.37(1m)}},Y:H(b,a){I b.Y&&b.Y.2r()==a.2r()},1Y:{},L:H(c,d,b){c=c==1b?5r:c;J a=c[E];G(!a)a=c[E]=++6K;G(d&&!D.1Y[a])D.1Y[a]={};G(b!==12)D.1Y[a][d]=b;I d?D.1Y[a][d]:a},3b:H(c,b){c=c==1b?5r:c;J a=c[E];G(b){G(D.1Y[a]){2U D.1Y[a][b];b="";R(b 1n D.1Y[a])1X;G(!b)D.3b(c)}}N{1U{2U c[E]}1V(e){G(c.5l)c.5l(E)}2U D.1Y[a]}},P:H(d,a,c){J e,i=0,K=d.K;G(c){G(K==12){R(e 1n d)G(a.1w(d[e],c)===Q)1X}N R(;i<K;)G(a.1w(d[i++],c)===Q)1X}N{G(K==12){R(e 1n d)G(a.1k(d[e],e,d[e])===Q)1X}N R(J b=d[0];i<K&&a.1k(b,i,b)!==Q;b=d[++i]){}}I d},1i:H(b,a,c,i,d){G(D.1D(a))a=a.1k(b,i);I a&&a.1q==4L&&c=="2a"&&!6G.11(d)?a+"2X":a},1F:{1e:H(c,b){D.P((b||"").1R(/\\s+/),H(i,a){G(c.16==1&&!D.1F.3T(c.1F,a))c.1F+=(c.1F?" ":"")+a})},21:H(c,b){G(c.16==1)c.1F=b!=12?D.3C(c.1F.1R(/\\s+/),H(a){I!D.1F.3T(b,a)}).6s(" "):""},3T:H(b,a){I D.2L(a,(b.1F||b).6r().1R(/\\s+/))>-1}},6q:H(b,c,a){J e={};R(J d 1n c){e[d]=b.V[d];b.V[d]=c[d]}a.1k(b);R(J d 1n c)b.V[d]=e[d]},1g:H(d,e,c){G(e=="2h"||e=="1Z"){J b,3X={30:"5x",5g:"1G",18:"3I"},35=e=="2h"?["5e","6k"]:["5G","6i"];H 5b(){b=e=="2h"?d.8f:d.8c;J a=0,2C=0;D.P(35,H(){a+=3d(D.2a(d,"57"+7,M))||0;2C+=3d(D.2a(d,"2C"+7+"4b",M))||0});b-=29.83(a+2C)}G(D(d).3F(":4j"))5b();N D.6q(d,3X,5b);I 29.2f(0,b)}I D.2a(d,e,c)},2a:H(f,l,k){J e,V=f.V;H 3E(b){G(!D.14.2k)I Q;J a=3P.54(b,U);I!a||a.52("3E")==""}G(l=="1y"&&D.14.1f){e=D.1K(V,"1y");I e==""?"1":e}G(D.14.2G&&l=="18"){J d=V.50;V.50="0 7Y 7W";V.50=d}G(l.1I(/4i/i))l=y;G(!k&&V&&V[l])e=V[l];N G(3P.54){G(l.1I(/4i/i))l="4i";l=l.1o(/([A-Z])/g,"-$1").3y();J c=3P.54(f,U);G(c&&!3E(f))e=c.52(l);N{J g=[],2E=[],a=f,i=0;R(;a&&3E(a);a=a.1d)2E.6h(a);R(;i<2E.K;i++)G(3E(2E[i])){g[i]=2E[i].V.18;2E[i].V.18="3I"}e=l=="18"&&g[2E.K-1]!=U?"2F":(c&&c.52(l))||"";R(i=0;i<g.K;i++)G(g[i]!=U)2E[i].V.18=g[i]}G(l=="1y"&&e=="")e="1"}N G(f.4g){J h=l.1o(/\\-(\\w)/g,H(a,b){I b.2r()});e=f.4g[l]||f.4g[h];G(!/^\\d+(2X)?$/i.11(e)&&/^\\d/.11(e)){J j=V.1A,66=f.65.1A;f.65.1A=f.4g.1A;V.1A=e||0;e=V.aM+"2X";V.1A=j;f.65.1A=66}}I e},4h:H(l,h){J k=[];h=h||S;G(1j h.3h==\'12\')h=h.2z||h[0]&&h[0].2z||S;D.P(l,H(i,d){G(!d)I;G(d.1q==4L)d+=\'\';G(1j d=="23"){d=d.1o(/(<(\\w+)[^>]*?)\\/>/g,H(b,a,c){I c.1I(/^(aK|4f|7E|aG|4T|7A|aB|3n|az|ay|av)$/i)?b:a+"></"+c+">"});J f=D.3k(d).3y(),1v=h.3h("1v");J e=!f.1h("<au")&&[1,"<2A 7w=\'7w\'>","</2A>"]||!f.1h("<ar")&&[1,"<7v>","</7v>"]||f.1I(/^<(aq|22|am|ak|ai)/)&&[1,"<1T>","</1T>"]||!f.1h("<4F")&&[2,"<1T><22>","</22></1T>"]||(!f.1h("<af")||!f.1h("<ad"))&&[3,"<1T><22><4F>","</4F></22></1T>"]||!f.1h("<7E")&&[2,"<1T><22></22><7q>","</7q></1T>"]||D.14.1f&&[1,"1v<1v>","</1v>"]||[0,"",""];1v.4H=e[1]+d+e[2];1B(e[0]--)1v=1v.5T;G(D.14.1f){J g=!f.1h("<1T")&&f.1h("<22")<0?1v.1x&&1v.1x.3t:e[1]=="<1T>"&&f.1h("<22")<0?1v.3t:[];R(J j=g.K-1;j>=0;--j)G(D.Y(g[j],"22")&&!g[j].3t.K)g[j].1d.37(g[j]);G(/^\\s/.11(d))1v.39(h.5F(d.1I(/^\\s*/)[0]),1v.1x)}d=D.2d(1v.3t)}G(d.K===0&&(!D.Y(d,"3V")&&!D.Y(d,"2A")))I;G(d[0]==12||D.Y(d,"3V")||d.15)k.1p(d);N k=D.2R(k,d)});I k},1K:H(d,f,c){G(!d||d.16==3||d.16==8)I 12;J e=!D.4n(d),40=c!==12,1f=D.14.1f;f=e&&D.3X[f]||f;G(d.2j){J g=/5Q|4d|V/.11(f);G(f=="2W"&&D.14.2k)d.1d.64;G(f 1n d&&e&&!g){G(40){G(f=="O"&&D.Y(d,"4T")&&d.1d)7p"O a3 a1\'t 9V 9U";d[f]=c}G(D.Y(d,"3V")&&d.7i(f))I d.7i(f).76;I d[f]}G(1f&&e&&f=="V")I D.1K(d.V,"9T",c);G(40)d.9Q(f,""+c);J h=1f&&e&&g?d.4G(f,2):d.4G(f);I h===U?12:h}G(1f&&f=="1y"){G(40){d.6B=1;d.1E=(d.1E||"").1o(/7f\\([^)]*\\)/,"")+(3r(c)+\'\'=="9L"?"":"7f(1y="+c*7a+")")}I d.1E&&d.1E.1h("1y=")>=0?(3d(d.1E.1I(/1y=([^)]*)/)[1])/7a)+\'\':""}f=f.1o(/-([a-z])/9H,H(a,b){I b.2r()});G(40)d[f]=c;I d[f]},3k:H(a){I(a||"").1o(/^\\s+|\\s+$/g,"")},2d:H(b){J a=[];G(b!=U){J i=b.K;G(i==U||b.1R||b.4I||b.1k)a[0]=b;N 1B(i)a[--i]=b[i]}I a},2L:H(b,a){R(J i=0,K=a.K;i<K;i++)G(a[i]===b)I i;I-1},2R:H(a,b){J i=0,T,2S=a.K;G(D.14.1f){1B(T=b[i++])G(T.16!=8)a[2S++]=T}N 1B(T=b[i++])a[2S++]=T;I a},4r:H(a){J c=[],2o={};1U{R(J i=0,K=a.K;i<K;i++){J b=D.L(a[i]);G(!2o[b]){2o[b]=M;c.1p(a[i])}}}1V(e){c=a}I c},3C:H(c,a,d){J b=[];R(J i=0,K=c.K;i<K;i++)G(!d!=!a(c[i],i))b.1p(c[i]);I b},2l:H(d,a){J c=[];R(J i=0,K=d.K;i<K;i++){J b=a(d[i],i);G(b!=U)c[c.K]=b}I c.7d.1w([],c)}});J v=9B.9A.3y();D.14={5B:(v.1I(/.+(?:9y|9x|9w|9v)[\\/: ]([\\d.]+)/)||[])[1],2k:/75/.11(v),2G:/2G/.11(v),1f:/1f/.11(v)&&!/2G/.11(v),42:/42/.11(v)&&!/(9s|75)/.11(v)};J y=D.14.1f?"7o":"72";D.1l({71:!D.14.1f||S.70=="6Z",3X:{"R":"9n","9k":"1F","4i":y,72:y,7o:y,9h:"9f",9e:"9d",9b:"99"}});D.P({6W:H(a){I a.1d},97:H(a){I D.4S(a,"1d")},95:H(a){I D.3a(a,2,"2H")},91:H(a){I D.3a(a,2,"4l")},8Z:H(a){I D.4S(a,"2H")},8X:H(a){I D.4S(a,"4l")},8W:H(a){I D.5v(a.1d.1x,a)},8V:H(a){I D.5v(a.1x)},6Q:H(a){I D.Y(a,"8U")?a.8T||a.8S.S:D.2d(a.3t)}},H(c,d){D.17[c]=H(b){J a=D.2l(7,d);G(b&&1j b=="23")a=D.3g(b,a);I 7.2I(D.4r(a))}});D.P({6P:"3v",8Q:"6F",39:"6E",8P:"5q",8O:"7b"},H(c,b){D.17[c]=H(){J a=19;I 7.P(H(){R(J i=0,K=a.K;i<K;i++)D(a[i])[b](7)})}});D.P({8N:H(a){D.1K(7,a,"");G(7.16==1)7.5l(a)},8M:H(a){D.1F.1e(7,a)},8L:H(a){D.1F.21(7,a)},8K:H(a){D.1F[D.1F.3T(7,a)?"21":"1e"](7,a)},21:H(a){G(!a||D.1E(a,[7]).r.K){D("*",7).1e(7).P(H(){D.W.21(7);D.3b(7)});G(7.1d)7.1d.37(7)}},4E:H(){D(">*",7).21();1B(7.1x)7.37(7.1x)}},H(a,b){D.17[a]=H(){I 7.P(b,19)}});D.P(["6N","4b"],H(i,c){J b=c.3y();D.17[b]=H(a){I 7[0]==1b?D.14.2G&&S.1c["5t"+c]||D.14.2k&&1b["5s"+c]||S.70=="6Z"&&S.1C["5t"+c]||S.1c["5t"+c]:7[0]==S?29.2f(29.2f(S.1c["4y"+c],S.1C["4y"+c]),29.2f(S.1c["2i"+c],S.1C["2i"+c])):a==12?(7.K?D.1g(7[0],b):U):7.1g(b,a.1q==56?a:a+"2X")}});H 25(a,b){I a[0]&&3r(D.2a(a[0],b,M),10)||0}J C=D.14.2k&&3r(D.14.5B)<8H?"(?:[\\\\w*3m-]|\\\\\\\\.)":"(?:[\\\\w\\8F-\\8E*3m-]|\\\\\\\\.)",6L=2B 4v("^>\\\\s*("+C+"+)"),6J=2B 4v("^("+C+"+)(#)("+C+"+)"),6I=2B 4v("^([#.]?)("+C+"*)");D.1l({6H:{"":H(a,i,m){I m[2]=="*"||D.Y(a,m[2])},"#":H(a,i,m){I a.4G("2v")==m[2]},":":{8D:H(a,i,m){I i<m[3]-0},8C:H(a,i,m){I i>m[3]-0},3a:H(a,i,m){I m[3]-0==i},79:H(a,i,m){I m[3]-0==i},3o:H(a,i){I i==0},3S:H(a,i,m,r){I i==r.K-1},6D:H(a,i){I i%2==0},6C:H(a,i){I i%2},"3o-4u":H(a){I a.1d.3H("*")[0]==a},"3S-4u":H(a){I D.3a(a.1d.5T,1,"4l")==a},"8z-4u":H(a){I!D.3a(a.1d.5T,2,"4l")},6W:H(a){I a.1x},4E:H(a){I!a.1x},8y:H(a,i,m){I(a.6O||a.8x||D(a).1r()||"").1h(m[3])>=0},4j:H(a){I"1G"!=a.O&&D.1g(a,"18")!="2F"&&D.1g(a,"5g")!="1G"},1G:H(a){I"1G"==a.O||D.1g(a,"18")=="2F"||D.1g(a,"5g")=="1G"},8w:H(a){I!a.3R},3R:H(a){I a.3R},4J:H(a){I a.4J},2W:H(a){I a.2W||D.1K(a,"2W")},1r:H(a){I"1r"==a.O},5O:H(a){I"5O"==a.O},5L:H(a){I"5L"==a.O},5p:H(a){I"5p"==a.O},3Q:H(a){I"3Q"==a.O},5o:H(a){I"5o"==a.O},6A:H(a){I"6A"==a.O},6z:H(a){I"6z"==a.O},2s:H(a){I"2s"==a.O||D.Y(a,"2s")},4T:H(a){I/4T|2A|6y|2s/i.11(a.Y)},3T:H(a,i,m){I D.2q(m[3],a).K},8t:H(a){I/h\\d/i.11(a.Y)},8s:H(a){I D.3C(D.3O,H(b){I a==b.T}).K}}},6x:[/^(\\[) *@?([\\w-]+) *([!*$^~=]*) *(\'?"?)(.*?)\\4 *\\]/,/^(:)([\\w-]+)\\("?\'?(.*?(\\(.*?\\))?[^(]*?)"?\'?\\)/,2B 4v("^([:.#]*)("+C+"+)")],3g:H(a,c,b){J d,1t=[];1B(a&&a!=d){d=a;J f=D.1E(a,c,b);a=f.t.1o(/^\\s*,\\s*/,"");1t=b?c=f.r:D.2R(1t,f.r)}I 1t},2q:H(t,o){G(1j t!="23")I[t];G(o&&o.16!=1&&o.16!=9)I[];o=o||S;J d=[o],2o=[],3S,Y;1B(t&&3S!=t){J r=[];3S=t;t=D.3k(t);J l=Q,3j=6L,m=3j.2D(t);G(m){Y=m[1].2r();R(J i=0;d[i];i++)R(J c=d[i].1x;c;c=c.2H)G(c.16==1&&(Y=="*"||c.Y.2r()==Y))r.1p(c);d=r;t=t.1o(3j,"");G(t.1h(" ")==0)6M;l=M}N{3j=/^([>+~])\\s*(\\w*)/i;G((m=3j.2D(t))!=U){r=[];J k={};Y=m[2].2r();m=m[1];R(J j=0,3i=d.K;j<3i;j++){J n=m=="~"||m=="+"?d[j].2H:d[j].1x;R(;n;n=n.2H)G(n.16==1){J g=D.L(n);G(m=="~"&&k[g])1X;G(!Y||n.Y.2r()==Y){G(m=="~")k[g]=M;r.1p(n)}G(m=="+")1X}}d=r;t=D.3k(t.1o(3j,""));l=M}}G(t&&!l){G(!t.1h(",")){G(o==d[0])d.4s();2o=D.2R(2o,d);r=d=[o];t=" "+t.6v(1,t.K)}N{J h=6J;J m=h.2D(t);G(m){m=[0,m[2],m[3],m[1]]}N{h=6I;m=h.2D(t)}m[2]=m[2].1o(/\\\\/g,"");J f=d[d.K-1];G(m[1]=="#"&&f&&f.61&&!D.4n(f)){J p=f.61(m[2]);G((D.14.1f||D.14.2G)&&p&&1j p.2v=="23"&&p.2v!=m[2])p=D(\'[@2v="\'+m[2]+\'"]\',f)[0];d=r=p&&(!m[3]||D.Y(p,m[3]))?[p]:[]}N{R(J i=0;d[i];i++){J a=m[1]=="#"&&m[3]?m[3]:m[1]!=""||m[0]==""?"*":m[2];G(a=="*"&&d[i].Y.3y()=="49")a="3n";r=D.2R(r,d[i].3H(a))}G(m[1]==".")r=D.5m(r,m[2]);G(m[1]=="#"){J e=[];R(J i=0;r[i];i++)G(r[i].4G("2v")==m[2]){e=[r[i]];1X}r=e}d=r}t=t.1o(h,"")}}G(t){J b=D.1E(t,r);d=r=b.r;t=D.3k(b.t)}}G(t)d=[];G(d&&o==d[0])d.4s();2o=D.2R(2o,d);I 2o},5m:H(r,m,a){m=" "+m+" ";J c=[];R(J i=0;r[i];i++){J b=(" "+r[i].1F+" ").1h(m)>=0;G(!a&&b||a&&!b)c.1p(r[i])}I c},1E:H(t,r,h){J d;1B(t&&t!=d){d=t;J p=D.6x,m;R(J i=0;p[i];i++){m=p[i].2D(t);G(m){t=t.8r(m[0].K);m[2]=m[2].1o(/\\\\/g,"");1X}}G(!m)1X;G(m[1]==":"&&m[2]=="4Y")r=62.11(m[3])?D.1E(m[3],r,M).r:D(r).4Y(m[3]);N G(m[1]==".")r=D.5m(r,m[2],h);N G(m[1]=="["){J g=[],O=m[3];R(J i=0,3i=r.K;i<3i;i++){J a=r[i],z=a[D.3X[m[2]]||m[2]];G(z==U||/5Q|4d|2W/.11(m[2]))z=D.1K(a,m[2])||\'\';G((O==""&&!!z||O=="="&&z==m[5]||O=="!="&&z!=m[5]||O=="^="&&z&&!z.1h(m[5])||O=="$="&&z.6v(z.K-m[5].K)==m[5]||(O=="*="||O=="~=")&&z.1h(m[5])>=0)^h)g.1p(a)}r=g}N G(m[1]==":"&&m[2]=="3a-4u"){J e={},g=[],11=/(-?)(\\d*)n((?:\\+|-)?\\d*)/.2D(m[3]=="6D"&&"2n"||m[3]=="6C"&&"2n+1"||!/\\D/.11(m[3])&&"8q+"+m[3]||m[3]),3o=(11[1]+(11[2]||1))-0,d=11[3]-0;R(J i=0,3i=r.K;i<3i;i++){J j=r[i],1d=j.1d,2v=D.L(1d);G(!e[2v]){J c=1;R(J n=1d.1x;n;n=n.2H)G(n.16==1)n.4q=c++;e[2v]=M}J b=Q;G(3o==0){G(j.4q==d)b=M}N G((j.4q-d)%3o==0&&(j.4q-d)/3o>=0)b=M;G(b^h)g.1p(j)}r=g}N{J f=D.6H[m[1]];G(1j f=="49")f=f[m[2]];G(1j f=="23")f=6u("Q||H(a,i){I "+f+";}");r=D.3C(r,H(a,i){I f(a,i,m,r)},h)}}I{r:r,t:t}},4S:H(b,c){J a=[],1t=b[c];1B(1t&&1t!=S){G(1t.16==1)a.1p(1t);1t=1t[c]}I a},3a:H(a,e,c,b){e=e||1;J d=0;R(;a;a=a[c])G(a.16==1&&++d==e)1X;I a},5v:H(n,a){J r=[];R(;n;n=n.2H){G(n.16==1&&n!=a)r.1p(n)}I r}});D.W={1e:H(f,i,g,e){G(f.16==3||f.16==8)I;G(D.14.1f&&f.4I)f=1b;G(!g.24)g.24=7.24++;G(e!=12){J h=g;g=7.3M(h,H(){I h.1w(7,19)});g.L=e}J j=D.L(f,"3w")||D.L(f,"3w",{}),1H=D.L(f,"1H")||D.L(f,"1H",H(){G(1j D!="12"&&!D.W.5k)I D.W.1H.1w(19.3L.T,19)});1H.T=f;D.P(i.1R(/\\s+/),H(c,b){J a=b.1R(".");b=a[0];g.O=a[1];J d=j[b];G(!d){d=j[b]={};G(!D.W.2t[b]||D.W.2t[b].4p.1k(f)===Q){G(f.3K)f.3K(b,1H,Q);N G(f.6t)f.6t("4o"+b,1H)}}d[g.24]=g;D.W.26[b]=M});f=U},24:1,26:{},21:H(e,h,f){G(e.16==3||e.16==8)I;J i=D.L(e,"3w"),1L,5i;G(i){G(h==12||(1j h=="23"&&h.8p(0)=="."))R(J g 1n i)7.21(e,g+(h||""));N{G(h.O){f=h.2y;h=h.O}D.P(h.1R(/\\s+/),H(b,a){J c=a.1R(".");a=c[0];G(i[a]){G(f)2U i[a][f.24];N R(f 1n i[a])G(!c[1]||i[a][f].O==c[1])2U i[a][f];R(1L 1n i[a])1X;G(!1L){G(!D.W.2t[a]||D.W.2t[a].4A.1k(e)===Q){G(e.6p)e.6p(a,D.L(e,"1H"),Q);N G(e.6n)e.6n("4o"+a,D.L(e,"1H"))}1L=U;2U i[a]}}})}R(1L 1n i)1X;G(!1L){J d=D.L(e,"1H");G(d)d.T=U;D.3b(e,"3w");D.3b(e,"1H")}}},1P:H(h,c,f,g,i){c=D.2d(c);G(h.1h("!")>=0){h=h.3s(0,-1);J a=M}G(!f){G(7.26[h])D("*").1e([1b,S]).1P(h,c)}N{G(f.16==3||f.16==8)I 12;J b,1L,17=D.1D(f[h]||U),W=!c[0]||!c[0].32;G(W){c.6h({O:h,2J:f,32:H(){},3J:H(){},4C:1z()});c[0][E]=M}c[0].O=h;G(a)c[0].6m=M;J d=D.L(f,"1H");G(d)b=d.1w(f,c);G((!17||(D.Y(f,\'a\')&&h=="4V"))&&f["4o"+h]&&f["4o"+h].1w(f,c)===Q)b=Q;G(W)c.4s();G(i&&D.1D(i)){1L=i.1w(f,b==U?c:c.7d(b));G(1L!==12)b=1L}G(17&&g!==Q&&b!==Q&&!(D.Y(f,\'a\')&&h=="4V")){7.5k=M;1U{f[h]()}1V(e){}}7.5k=Q}I b},1H:H(b){J a,1L,38,5f,4m;b=19[0]=D.W.6l(b||1b.W);38=b.O.1R(".");b.O=38[0];38=38[1];5f=!38&&!b.6m;4m=(D.L(7,"3w")||{})[b.O];R(J j 1n 4m){J c=4m[j];G(5f||c.O==38){b.2y=c;b.L=c.L;1L=c.1w(7,19);G(a!==Q)a=1L;G(1L===Q){b.32();b.3J()}}}I a},6l:H(b){G(b[E]==M)I b;J d=b;b={8o:d};J c="8n 8m 8l 8k 2s 8j 47 5d 6j 5E 8i L 8h 8g 4K 2y 5a 59 8e 8b 58 6f 8a 88 4k 87 86 84 6d 2J 4C 6c O 82 81 35".1R(" ");R(J i=c.K;i;i--)b[c[i]]=d[c[i]];b[E]=M;b.32=H(){G(d.32)d.32();d.80=Q};b.3J=H(){G(d.3J)d.3J();d.7Z=M};b.4C=b.4C||1z();G(!b.2J)b.2J=b.6d||S;G(b.2J.16==3)b.2J=b.2J.1d;G(!b.4k&&b.4K)b.4k=b.4K==b.2J?b.6c:b.4K;G(b.58==U&&b.5d!=U){J a=S.1C,1c=S.1c;b.58=b.5d+(a&&a.2e||1c&&1c.2e||0)-(a.6b||0);b.6f=b.6j+(a&&a.2c||1c&&1c.2c||0)-(a.6a||0)}G(!b.35&&((b.47||b.47===0)?b.47:b.5a))b.35=b.47||b.5a;G(!b.59&&b.5E)b.59=b.5E;G(!b.35&&b.2s)b.35=(b.2s&1?1:(b.2s&2?3:(b.2s&4?2:0)));I b},3M:H(a,b){b.24=a.24=a.24||b.24||7.24++;I b},2t:{27:{4p:H(){55();I},4A:H(){I}},3D:{4p:H(){G(D.14.1f)I Q;D(7).2O("53",D.W.2t.3D.2y);I M},4A:H(){G(D.14.1f)I Q;D(7).4e("53",D.W.2t.3D.2y);I M},2y:H(a){G(F(a,7))I M;a.O="3D";I D.W.1H.1w(7,19)}},3N:{4p:H(){G(D.14.1f)I Q;D(7).2O("51",D.W.2t.3N.2y);I M},4A:H(){G(D.14.1f)I Q;D(7).4e("51",D.W.2t.3N.2y);I M},2y:H(a){G(F(a,7))I M;a.O="3N";I D.W.1H.1w(7,19)}}}};D.17.1l({2O:H(c,a,b){I c=="4X"?7.2V(c,a,b):7.P(H(){D.W.1e(7,c,b||a,b&&a)})},2V:H(d,b,c){J e=D.W.3M(c||b,H(a){D(7).4e(a,e);I(c||b).1w(7,19)});I 7.P(H(){D.W.1e(7,d,e,c&&b)})},4e:H(a,b){I 7.P(H(){D.W.21(7,a,b)})},1P:H(c,a,b){I 7.P(H(){D.W.1P(c,a,7,M,b)})},5C:H(c,a,b){I 7[0]&&D.W.1P(c,a,7[0],Q,b)},2m:H(b){J c=19,i=1;1B(i<c.K)D.W.3M(b,c[i++]);I 7.4V(D.W.3M(b,H(a){7.4Z=(7.4Z||0)%i;a.32();I c[7.4Z++].1w(7,19)||Q}))},7X:H(a,b){I 7.2O(\'3D\',a).2O(\'3N\',b)},27:H(a){55();G(D.2Q)a.1k(S,D);N D.3A.1p(H(){I a.1k(7,D)});I 7}});D.1l({2Q:Q,3A:[],27:H(){G(!D.2Q){D.2Q=M;G(D.3A){D.P(D.3A,H(){7.1k(S)});D.3A=U}D(S).5C("27")}}});J x=Q;H 55(){G(x)I;x=M;G(S.3K&&!D.14.2G)S.3K("69",D.27,Q);G(D.14.1f&&1b==1S)(H(){G(D.2Q)I;1U{S.1C.7V("1A")}1V(3e){3B(19.3L,0);I}D.27()})();G(D.14.2G)S.3K("69",H(){G(D.2Q)I;R(J i=0;i<S.4W.K;i++)G(S.4W[i].3R){3B(19.3L,0);I}D.27()},Q);G(D.14.2k){J a;(H(){G(D.2Q)I;G(S.3f!="68"&&S.3f!="1J"){3B(19.3L,0);I}G(a===12)a=D("V, 7A[7U=7S]").K;G(S.4W.K!=a){3B(19.3L,0);I}D.27()})()}D.W.1e(1b,"43",D.27)}D.P(("7R,7Q,43,85,4y,4X,4V,7P,"+"7O,7N,89,53,51,7M,2A,"+"5o,7L,7K,8d,3e").1R(","),H(i,b){D.17[b]=H(a){I a?7.2O(b,a):7.1P(b)}});J F=H(a,c){J b=a.4k;1B(b&&b!=c)1U{b=b.1d}1V(3e){b=c}I b==c};D(1b).2O("4X",H(){D("*").1e(S).4e()});D.17.1l({67:D.17.43,43:H(g,d,c){G(1j g!=\'23\')I 7.67(g);J e=g.1h(" ");G(e>=0){J i=g.3s(e,g.K);g=g.3s(0,e)}c=c||H(){};J f="2P";G(d)G(D.1D(d)){c=d;d=U}N{d=D.3n(d);f="6g"}J h=7;D.3Y({1a:g,O:f,1O:"2K",L:d,1J:H(a,b){G(b=="1W"||b=="7J")h.2K(i?D("<1v/>").3v(a.4U.1o(/<1m(.|\\s)*?\\/1m>/g,"")).2q(i):a.4U);h.P(c,[a.4U,b,a])}});I 7},aL:H(){I D.3n(7.7I())},7I:H(){I 7.2l(H(){I D.Y(7,"3V")?D.2d(7.aH):7}).1E(H(){I 7.34&&!7.3R&&(7.4J||/2A|6y/i.11(7.Y)||/1r|1G|3Q/i.11(7.O))}).2l(H(i,c){J b=D(7).6e();I b==U?U:b.1q==2p?D.2l(b,H(a,i){I{34:c.34,2x:a}}):{34:c.34,2x:b}}).3p()}});D.P("7H,7G,7F,7D,7C,7B".1R(","),H(i,o){D.17[o]=H(f){I 7.2O(o,f)}});J B=1z();D.1l({3p:H(d,b,a,c){G(D.1D(b)){a=b;b=U}I D.3Y({O:"2P",1a:d,L:b,1W:a,1O:c})},aE:H(b,a){I D.3p(b,U,a,"1m")},aD:H(c,b,a){I D.3p(c,b,a,"3z")},aC:H(d,b,a,c){G(D.1D(b)){a=b;b={}}I D.3Y({O:"6g",1a:d,L:b,1W:a,1O:c})},aA:H(a){D.1l(D.60,a)},60:{1a:5Z.5Q,26:M,O:"2P",2T:0,7z:"4R/x-ax-3V-aw",7x:M,31:M,L:U,5Y:U,3Q:U,4Q:{2N:"4R/2N, 1r/2N",2K:"1r/2K",1m:"1r/4t, 4R/4t",3z:"4R/3z, 1r/4t",1r:"1r/as",4w:"*/*"}},4z:{},3Y:H(s){s=D.1l(M,s,D.1l(M,{},D.60,s));J g,2Z=/=\\?(&|$)/g,1u,L,O=s.O.2r();G(s.L&&s.7x&&1j s.L!="23")s.L=D.3n(s.L);G(s.1O=="4P"){G(O=="2P"){G(!s.1a.1I(2Z))s.1a+=(s.1a.1I(/\\?/)?"&":"?")+(s.4P||"7u")+"=?"}N G(!s.L||!s.L.1I(2Z))s.L=(s.L?s.L+"&":"")+(s.4P||"7u")+"=?";s.1O="3z"}G(s.1O=="3z"&&(s.L&&s.L.1I(2Z)||s.1a.1I(2Z))){g="4P"+B++;G(s.L)s.L=(s.L+"").1o(2Z,"="+g+"$1");s.1a=s.1a.1o(2Z,"="+g+"$1");s.1O="1m";1b[g]=H(a){L=a;1W();1J();1b[g]=12;1U{2U 1b[g]}1V(e){}G(i)i.37(h)}}G(s.1O=="1m"&&s.1Y==U)s.1Y=Q;G(s.1Y===Q&&O=="2P"){J j=1z();J k=s.1a.1o(/(\\?|&)3m=.*?(&|$)/,"$ap="+j+"$2");s.1a=k+((k==s.1a)?(s.1a.1I(/\\?/)?"&":"?")+"3m="+j:"")}G(s.L&&O=="2P"){s.1a+=(s.1a.1I(/\\?/)?"&":"?")+s.L;s.L=U}G(s.26&&!D.4O++)D.W.1P("7H");J n=/^(?:\\w+:)?\\/\\/([^\\/?#]+)/;G(s.1O=="1m"&&O=="2P"&&n.11(s.1a)&&n.2D(s.1a)[1]!=5Z.al){J i=S.3H("6w")[0];J h=S.3h("1m");h.4d=s.1a;G(s.7t)h.aj=s.7t;G(!g){J l=Q;h.ah=h.ag=H(){G(!l&&(!7.3f||7.3f=="68"||7.3f=="1J")){l=M;1W();1J();i.37(h)}}}i.3U(h);I 12}J m=Q;J c=1b.7s?2B 7s("ae.ac"):2B 7r();G(s.5Y)c.6R(O,s.1a,s.31,s.5Y,s.3Q);N c.6R(O,s.1a,s.31);1U{G(s.L)c.4B("ab-aa",s.7z);G(s.5S)c.4B("a9-5R-a8",D.4z[s.1a]||"a7, a6 a5 a4 5N:5N:5N a2");c.4B("X-9Z-9Y","7r");c.4B("9W",s.1O&&s.4Q[s.1O]?s.4Q[s.1O]+", */*":s.4Q.4w)}1V(e){}G(s.7m&&s.7m(c,s)===Q){s.26&&D.4O--;c.7l();I Q}G(s.26)D.W.1P("7B",[c,s]);J d=H(a){G(!m&&c&&(c.3f==4||a=="2T")){m=M;G(f){7k(f);f=U}1u=a=="2T"&&"2T"||!D.7j(c)&&"3e"||s.5S&&D.7h(c,s.1a)&&"7J"||"1W";G(1u=="1W"){1U{L=D.6X(c,s.1O,s.9S)}1V(e){1u="5J"}}G(1u=="1W"){J b;1U{b=c.5I("7g-5R")}1V(e){}G(s.5S&&b)D.4z[s.1a]=b;G(!g)1W()}N D.5H(s,c,1u);1J();G(s.31)c=U}};G(s.31){J f=4I(d,13);G(s.2T>0)3B(H(){G(c){c.7l();G(!m)d("2T")}},s.2T)}1U{c.9P(s.L)}1V(e){D.5H(s,c,U,e)}G(!s.31)d();H 1W(){G(s.1W)s.1W(L,1u);G(s.26)D.W.1P("7C",[c,s])}H 1J(){G(s.1J)s.1J(c,1u);G(s.26)D.W.1P("7F",[c,s]);G(s.26&&!--D.4O)D.W.1P("7G")}I c},5H:H(s,a,b,e){G(s.3e)s.3e(a,b,e);G(s.26)D.W.1P("7D",[a,s,e])},4O:0,7j:H(a){1U{I!a.1u&&5Z.9O=="5p:"||(a.1u>=7e&&a.1u<9N)||a.1u==7c||a.1u==9K||D.14.2k&&a.1u==12}1V(e){}I Q},7h:H(a,c){1U{J b=a.5I("7g-5R");I a.1u==7c||b==D.4z[c]||D.14.2k&&a.1u==12}1V(e){}I Q},6X:H(a,c,b){J d=a.5I("9J-O"),2N=c=="2N"||!c&&d&&d.1h("2N")>=0,L=2N?a.9I:a.4U;G(2N&&L.1C.2j=="5J")7p"5J";G(b)L=b(L,c);G(c=="1m")D.5u(L);G(c=="3z")L=6u("("+L+")");I L},3n:H(a){J s=[];G(a.1q==2p||a.5w)D.P(a,H(){s.1p(3u(7.34)+"="+3u(7.2x))});N R(J j 1n a)G(a[j]&&a[j].1q==2p)D.P(a[j],H(){s.1p(3u(j)+"="+3u(7))});N s.1p(3u(j)+"="+3u(D.1D(a[j])?a[j]():a[j]));I s.6s("&").1o(/%20/g,"+")}});D.17.1l({1N:H(c,b){I c?7.2g({1Z:"1N",2h:"1N",1y:"1N"},c,b):7.1E(":1G").P(H(){7.V.18=7.5D||"";G(D.1g(7,"18")=="2F"){J a=D("<"+7.2j+" />").6P("1c");7.V.18=a.1g("18");G(7.V.18=="2F")7.V.18="3I";a.21()}}).3l()},1M:H(b,a){I b?7.2g({1Z:"1M",2h:"1M",1y:"1M"},b,a):7.1E(":4j").P(H(){7.5D=7.5D||D.1g(7,"18");7.V.18="2F"}).3l()},78:D.17.2m,2m:H(a,b){I D.1D(a)&&D.1D(b)?7.78.1w(7,19):a?7.2g({1Z:"2m",2h:"2m",1y:"2m"},a,b):7.P(H(){D(7)[D(7).3F(":1G")?"1N":"1M"]()})},9G:H(b,a){I 7.2g({1Z:"1N"},b,a)},9F:H(b,a){I 7.2g({1Z:"1M"},b,a)},9E:H(b,a){I 7.2g({1Z:"2m"},b,a)},9D:H(b,a){I 7.2g({1y:"1N"},b,a)},9M:H(b,a){I 7.2g({1y:"1M"},b,a)},9C:H(c,a,b){I 7.2g({1y:a},c,b)},2g:H(k,j,i,g){J h=D.77(j,i,g);I 7[h.36===Q?"P":"36"](H(){G(7.16!=1)I Q;J f=D.1l({},h),p,1G=D(7).3F(":1G"),46=7;R(p 1n k){G(k[p]=="1M"&&1G||k[p]=="1N"&&!1G)I f.1J.1k(7);G(p=="1Z"||p=="2h"){f.18=D.1g(7,"18");f.33=7.V.33}}G(f.33!=U)7.V.33="1G";f.45=D.1l({},k);D.P(k,H(c,a){J e=2B D.28(46,f,c);G(/2m|1N|1M/.11(a))e[a=="2m"?1G?"1N":"1M":a](k);N{J b=a.6r().1I(/^([+-]=)?([\\d+-.]+)(.*)$/),2b=e.1t(M)||0;G(b){J d=3d(b[2]),2M=b[3]||"2X";G(2M!="2X"){46.V[c]=(d||1)+2M;2b=((d||1)/e.1t(M))*2b;46.V[c]=2b+2M}G(b[1])d=((b[1]=="-="?-1:1)*d)+2b;e.3G(2b,d,2M)}N e.3G(2b,a,"")}});I M})},36:H(a,b){G(D.1D(a)||(a&&a.1q==2p)){b=a;a="28"}G(!a||(1j a=="23"&&!b))I A(7[0],a);I 7.P(H(){G(b.1q==2p)A(7,a,b);N{A(7,a).1p(b);G(A(7,a).K==1)b.1k(7)}})},9X:H(b,c){J a=D.3O;G(b)7.36([]);7.P(H(){R(J i=a.K-1;i>=0;i--)G(a[i].T==7){G(c)a[i](M);a.7n(i,1)}});G(!c)7.5A();I 7}});J A=H(b,c,a){G(b){c=c||"28";J q=D.L(b,c+"36");G(!q||a)q=D.L(b,c+"36",D.2d(a))}I q};D.17.5A=H(a){a=a||"28";I 7.P(H(){J q=A(7,a);q.4s();G(q.K)q[0].1k(7)})};D.1l({77:H(b,a,c){J d=b&&b.1q==a0?b:{1J:c||!c&&a||D.1D(b)&&b,2u:b,41:c&&a||a&&a.1q!=9t&&a};d.2u=(d.2u&&d.2u.1q==4L?d.2u:D.28.5K[d.2u])||D.28.5K.74;d.5M=d.1J;d.1J=H(){G(d.36!==Q)D(7).5A();G(D.1D(d.5M))d.5M.1k(7)};I d},41:{73:H(p,n,b,a){I b+a*p},5P:H(p,n,b,a){I((-29.9r(p*29.9q)/2)+0.5)*a+b}},3O:[],48:U,28:H(b,c,a){7.15=c;7.T=b;7.1i=a;G(!c.3Z)c.3Z={}}});D.28.44={4D:H(){G(7.15.2Y)7.15.2Y.1k(7.T,7.1z,7);(D.28.2Y[7.1i]||D.28.2Y.4w)(7);G(7.1i=="1Z"||7.1i=="2h")7.T.V.18="3I"},1t:H(a){G(7.T[7.1i]!=U&&7.T.V[7.1i]==U)I 7.T[7.1i];J r=3d(D.1g(7.T,7.1i,a));I r&&r>-9p?r:3d(D.2a(7.T,7.1i))||0},3G:H(c,b,d){7.5V=1z();7.2b=c;7.3l=b;7.2M=d||7.2M||"2X";7.1z=7.2b;7.2S=7.4N=0;7.4D();J e=7;H t(a){I e.2Y(a)}t.T=7.T;D.3O.1p(t);G(D.48==U){D.48=4I(H(){J a=D.3O;R(J i=0;i<a.K;i++)G(!a[i]())a.7n(i--,1);G(!a.K){7k(D.48);D.48=U}},13)}},1N:H(){7.15.3Z[7.1i]=D.1K(7.T.V,7.1i);7.15.1N=M;7.3G(0,7.1t());G(7.1i=="2h"||7.1i=="1Z")7.T.V[7.1i]="9m";D(7.T).1N()},1M:H(){7.15.3Z[7.1i]=D.1K(7.T.V,7.1i);7.15.1M=M;7.3G(7.1t(),0)},2Y:H(a){J t=1z();G(a||t>7.15.2u+7.5V){7.1z=7.3l;7.2S=7.4N=1;7.4D();7.15.45[7.1i]=M;J b=M;R(J i 1n 7.15.45)G(7.15.45[i]!==M)b=Q;G(b){G(7.15.18!=U){7.T.V.33=7.15.33;7.T.V.18=7.15.18;G(D.1g(7.T,"18")=="2F")7.T.V.18="3I"}G(7.15.1M)7.T.V.18="2F";G(7.15.1M||7.15.1N)R(J p 1n 7.15.45)D.1K(7.T.V,p,7.15.3Z[p])}G(b)7.15.1J.1k(7.T);I Q}N{J n=t-7.5V;7.4N=n/7.15.2u;7.2S=D.41[7.15.41||(D.41.5P?"5P":"73")](7.4N,n,0,1,7.15.2u);7.1z=7.2b+((7.3l-7.2b)*7.2S);7.4D()}I M}};D.1l(D.28,{5K:{9l:9j,9i:7e,74:9g},2Y:{2e:H(a){a.T.2e=a.1z},2c:H(a){a.T.2c=a.1z},1y:H(a){D.1K(a.T.V,"1y",a.1z)},4w:H(a){a.T.V[a.1i]=a.1z+a.2M}}});D.17.2i=H(){J b=0,1S=0,T=7[0],3q;G(T)ao(D.14){J d=T.1d,4a=T,1s=T.1s,1Q=T.2z,5U=2k&&3r(5B)<9c&&!/9a/i.11(v),1g=D.2a,3c=1g(T,"30")=="3c";G(T.7y){J c=T.7y();1e(c.1A+29.2f(1Q.1C.2e,1Q.1c.2e),c.1S+29.2f(1Q.1C.2c,1Q.1c.2c));1e(-1Q.1C.6b,-1Q.1C.6a)}N{1e(T.5X,T.5W);1B(1s){1e(1s.5X,1s.5W);G(42&&!/^t(98|d|h)$/i.11(1s.2j)||2k&&!5U)2C(1s);G(!3c&&1g(1s,"30")=="3c")3c=M;4a=/^1c$/i.11(1s.2j)?4a:1s;1s=1s.1s}1B(d&&d.2j&&!/^1c|2K$/i.11(d.2j)){G(!/^96|1T.*$/i.11(1g(d,"18")))1e(-d.2e,-d.2c);G(42&&1g(d,"33")!="4j")2C(d);d=d.1d}G((5U&&(3c||1g(4a,"30")=="5x"))||(42&&1g(4a,"30")!="5x"))1e(-1Q.1c.5X,-1Q.1c.5W);G(3c)1e(29.2f(1Q.1C.2e,1Q.1c.2e),29.2f(1Q.1C.2c,1Q.1c.2c))}3q={1S:1S,1A:b}}H 2C(a){1e(D.2a(a,"6V",M),D.2a(a,"6U",M))}H 1e(l,t){b+=3r(l,10)||0;1S+=3r(t,10)||0}I 3q};D.17.1l({30:H(){J a=0,1S=0,3q;G(7[0]){J b=7.1s(),2i=7.2i(),4c=/^1c|2K$/i.11(b[0].2j)?{1S:0,1A:0}:b.2i();2i.1S-=25(7,\'94\');2i.1A-=25(7,\'aF\');4c.1S+=25(b,\'6U\');4c.1A+=25(b,\'6V\');3q={1S:2i.1S-4c.1S,1A:2i.1A-4c.1A}}I 3q},1s:H(){J a=7[0].1s;1B(a&&(!/^1c|2K$/i.11(a.2j)&&D.1g(a,\'30\')==\'93\'))a=a.1s;I D(a)}});D.P([\'5e\',\'5G\'],H(i,b){J c=\'4y\'+b;D.17[c]=H(a){G(!7[0])I;I a!=12?7.P(H(){7==1b||7==S?1b.92(!i?a:D(1b).2e(),i?a:D(1b).2c()):7[c]=a}):7[0]==1b||7[0]==S?46[i?\'aI\':\'aJ\']||D.71&&S.1C[c]||S.1c[c]:7[0][c]}});D.P(["6N","4b"],H(i,b){J c=i?"5e":"5G",4f=i?"6k":"6i";D.17["5s"+b]=H(){I 7[b.3y()]()+25(7,"57"+c)+25(7,"57"+4f)};D.17["90"+b]=H(a){I 7["5s"+b]()+25(7,"2C"+c+"4b")+25(7,"2C"+4f+"4b")+(a?25(7,"6S"+c)+25(7,"6S"+4f):0)}})})();',62,669,'|||||||this|||||||||||||||||||||||||||||||||||if|function|return|var|length|data|true|else|type|each|false|for|document|elem|null|style|event||nodeName|||test|undefined||browser|options|nodeType|fn|display|arguments|url|window|body|parentNode|add|msie|css|indexOf|prop|typeof|call|extend|script|in|replace|push|constructor|text|offsetParent|cur|status|div|apply|firstChild|opacity|now|left|while|documentElement|isFunction|filter|className|hidden|handle|match|complete|attr|ret|hide|show|dataType|trigger|doc|split|top|table|try|catch|success|break|cache|height||remove|tbody|string|guid|num|global|ready|fx|Math|curCSS|start|scrollTop|makeArray|scrollLeft|max|animate|width|offset|tagName|safari|map|toggle||done|Array|find|toUpperCase|button|special|duration|id|copy|value|handler|ownerDocument|select|new|border|exec|stack|none|opera|nextSibling|pushStack|target|html|inArray|unit|xml|bind|GET|isReady|merge|pos|timeout|delete|one|selected|px|step|jsre|position|async|preventDefault|overflow|name|which|queue|removeChild|namespace|insertBefore|nth|removeData|fixed|parseFloat|error|readyState|multiFilter|createElement|rl|re|trim|end|_|param|first|get|results|parseInt|slice|childNodes|encodeURIComponent|append|events|elems|toLowerCase|json|readyList|setTimeout|grep|mouseenter|color|is|custom|getElementsByTagName|block|stopPropagation|addEventListener|callee|proxy|mouseleave|timers|defaultView|password|disabled|last|has|appendChild|form|domManip|props|ajax|orig|set|easing|mozilla|load|prototype|curAnim|self|charCode|timerId|object|offsetChild|Width|parentOffset|src|unbind|br|currentStyle|clean|float|visible|relatedTarget|previousSibling|handlers|isXMLDoc|on|setup|nodeIndex|unique|shift|javascript|child|RegExp|_default|deep|scroll|lastModified|teardown|setRequestHeader|timeStamp|update|empty|tr|getAttribute|innerHTML|setInterval|checked|fromElement|Number|jQuery|state|active|jsonp|accepts|application|dir|input|responseText|click|styleSheets|unload|not|lastToggle|outline|mouseout|getPropertyValue|mouseover|getComputedStyle|bindReady|String|padding|pageX|metaKey|keyCode|getWH|andSelf|clientX|Left|all|visibility|container|index|init|triggered|removeAttribute|classFilter|prevObject|submit|file|after|windowData|inner|client|globalEval|sibling|jquery|absolute|clone|wrapAll|dequeue|version|triggerHandler|oldblock|ctrlKey|createTextNode|Top|handleError|getResponseHeader|parsererror|speeds|checkbox|old|00|radio|swing|href|Modified|ifModified|lastChild|safari2|startTime|offsetTop|offsetLeft|username|location|ajaxSettings|getElementById|isSimple|values|selectedIndex|runtimeStyle|rsLeft|_load|loaded|DOMContentLoaded|clientTop|clientLeft|toElement|srcElement|val|pageY|POST|unshift|Bottom|clientY|Right|fix|exclusive|detachEvent|cloneNode|removeEventListener|swap|toString|join|attachEvent|eval|substr|head|parse|textarea|reset|image|zoom|odd|even|before|prepend|exclude|expr|quickClass|quickID|uuid|quickChild|continue|Height|textContent|appendTo|contents|open|margin|evalScript|borderTopWidth|borderLeftWidth|parent|httpData|setArray|CSS1Compat|compatMode|boxModel|cssFloat|linear|def|webkit|nodeValue|speed|_toggle|eq|100|replaceWith|304|concat|200|alpha|Last|httpNotModified|getAttributeNode|httpSuccess|clearInterval|abort|beforeSend|splice|styleFloat|throw|colgroup|XMLHttpRequest|ActiveXObject|scriptCharset|callback|fieldset|multiple|processData|getBoundingClientRect|contentType|link|ajaxSend|ajaxSuccess|ajaxError|col|ajaxComplete|ajaxStop|ajaxStart|serializeArray|notmodified|keypress|keydown|change|mouseup|mousedown|dblclick|focus|blur|stylesheet|hasClass|rel|doScroll|black|hover|solid|cancelBubble|returnValue|wheelDelta|view|round|shiftKey|resize|screenY|screenX|relatedNode|mousemove|prevValue|originalTarget|offsetHeight|keyup|newValue|offsetWidth|eventPhase|detail|currentTarget|cancelable|bubbles|attrName|attrChange|altKey|originalEvent|charAt|0n|substring|animated|header|noConflict|line|enabled|innerText|contains|only|weight|font|gt|lt|uFFFF|u0128|size|417|Boolean|Date|toggleClass|removeClass|addClass|removeAttr|replaceAll|insertAfter|prependTo|wrap|contentWindow|contentDocument|iframe|children|siblings|prevAll|wrapInner|nextAll|outer|prev|scrollTo|static|marginTop|next|inline|parents|able|cellSpacing|adobeair|cellspacing|522|maxLength|maxlength|readOnly|400|readonly|fast|600|class|slow|1px|htmlFor|reverse|10000|PI|cos|compatible|Function|setData|ie|ra|it|rv|getData|userAgent|navigator|fadeTo|fadeIn|slideToggle|slideUp|slideDown|ig|responseXML|content|1223|NaN|fadeOut|300|protocol|send|setAttribute|option|dataFilter|cssText|changed|be|Accept|stop|With|Requested|Object|can|GMT|property|1970|Jan|01|Thu|Since|If|Type|Content|XMLHTTP|th|Microsoft|td|onreadystatechange|onload|cap|charset|colg|host|tfoot|specified|with|1_|thead|leg|plain|attributes|opt|embed|urlencoded|www|area|hr|ajaxSetup|meta|post|getJSON|getScript|marginLeft|img|elements|pageYOffset|pageXOffset|abbr|serialize|pixelLeft'.split('|'),0,{}))
/*
 * Thickbox 3.1 - One Box To Rule Them All.
 * By Cody Lindley (http://www.codylindley.com)
 * Copyright (c) 2007 cody lindley
 * Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
*/
		  
var tb_pathToImage = "/images/indicator.gif";

/*!!!!!!!!!!!!!!!!! edit below this line at your own risk !!!!!!!!!!!!!!!!!!!!!!!*/

//on page load call tb_init
$(document).ready(function(){   
	tb_init('a.thickbox, area.thickbox, input.thickbox');//pass where to apply thickbox
	imgLoader = new Image();// preload image
	imgLoader.src = tb_pathToImage;
});

//add thickbox to href & area elements that have a class of .thickbox
function tb_init(domChunk){
	$(domChunk).click(function(){
	var t = this.title || this.name || null;
	var a = this.href || this.alt;
	var g = this.rel || false;
	tb_show(t,a,g);
	this.blur();
	return false;
	});
}

function tb_show(caption, url, imageGroup) {//function called when the user clicks on a thickbox link

	try {
		if (typeof document.body.style.maxHeight === "undefined") {//if IE 6
			$("body","html").css({height: "100%", width: "100%"});
			$("html").css("overflow","hidden");
			if (document.getElementById("TB_HideSelect") === null) {//iframe to hide select elements in ie6
				$("body").append("<iframe id='TB_HideSelect'></iframe><div id='TB_overlay'></div><div id='TB_window'></div>");
				$("#TB_overlay").click(tb_remove);
			}
		}else{//all others
			if(document.getElementById("TB_overlay") === null){
				$("body").append("<div id='TB_overlay'></div><div id='TB_window'></div>");
				$("#TB_overlay").click(tb_remove);
			}
		}
		
		if(tb_detectMacXFF()){
			$("#TB_overlay").addClass("TB_overlayMacFFBGHack");//use png overlay so hide flash
		}else{
			$("#TB_overlay").addClass("TB_overlayBG");//use background and opacity
		}
		
		if(caption===null){caption="";}
		$("body").append("<div id='TB_load'><img src='"+imgLoader.src+"' /></div>");//add loader to the page
		$('#TB_load').show();//show loader
		
		var baseURL;
	   if(url.indexOf("?")!==-1){ //ff there is a query string involved
			baseURL = url.substr(0, url.indexOf("?"));
	   }else{ 
	   		baseURL = url;
	   }
	   
	   var urlString = /\.jpg$|\.jpeg$|\.png$|\.gif$|\.bmp$/;
	   var urlType = baseURL.toLowerCase().match(urlString);

		if(urlType == '.jpg' || urlType == '.jpeg' || urlType == '.png' || urlType == '.gif' || urlType == '.bmp'){//code to show images
				
			TB_PrevCaption = "";
			TB_PrevURL = "";
			TB_PrevHTML = "";
			TB_NextCaption = "";
			TB_NextURL = "";
			TB_NextHTML = "";
			TB_imageCount = "";
			TB_FoundURL = false;
			if(imageGroup){
				TB_TempArray = $("a[@rel="+imageGroup+"]").get();
				for (TB_Counter = 0; ((TB_Counter < TB_TempArray.length) && (TB_NextHTML === "")); TB_Counter++) {
					var urlTypeTemp = TB_TempArray[TB_Counter].href.toLowerCase().match(urlString);
						if (!(TB_TempArray[TB_Counter].href == url)) {						
							if (TB_FoundURL) {
								TB_NextCaption = TB_TempArray[TB_Counter].title;
								TB_NextURL = TB_TempArray[TB_Counter].href;
								TB_NextHTML = "<span id='TB_next'>&nbsp;&nbsp;<a href='#'>Next &gt;</a></span>";
							} else {
								TB_PrevCaption = TB_TempArray[TB_Counter].title;
								TB_PrevURL = TB_TempArray[TB_Counter].href;
								TB_PrevHTML = "<span id='TB_prev'>&nbsp;&nbsp;<a href='#'>&lt; Prev</a></span>";
							}
						} else {
							TB_FoundURL = true;
							TB_imageCount = "Image " + (TB_Counter + 1) +" of "+ (TB_TempArray.length);											
						}
				}
			}

			imgPreloader = new Image();
			imgPreloader.onload = function(){		
			imgPreloader.onload = null;
				
			// Resizing large images - orginal by Christian Montoya edited by me.
			var pagesize = tb_getPageSize();
			var x = pagesize[0] - 150;
			var y = pagesize[1] - 150;
			var imageWidth = imgPreloader.width;
			var imageHeight = imgPreloader.height;
			if (imageWidth > x) {
				imageHeight = imageHeight * (x / imageWidth); 
				imageWidth = x; 
				if (imageHeight > y) { 
					imageWidth = imageWidth * (y / imageHeight); 
					imageHeight = y; 
				}
			} else if (imageHeight > y) { 
				imageWidth = imageWidth * (y / imageHeight); 
				imageHeight = y; 
				if (imageWidth > x) { 
					imageHeight = imageHeight * (x / imageWidth); 
					imageWidth = x;
				}
			}
			// End Resizing
			
			TB_WIDTH = imageWidth + 30;
			TB_HEIGHT = imageHeight + 60;
			$("#TB_window").append("<a href='' id='TB_ImageOff' title='Close'><img id='TB_Image' src='"+url+"' width='"+imageWidth+"' height='"+imageHeight+"' alt='"+caption+"'/></a>" + "<div id='TB_caption'>"+caption+"<div id='TB_secondLine'>" + TB_imageCount + TB_PrevHTML + TB_NextHTML + "</div></div><div id='TB_closeWindow'><a href='#' id='TB_closeWindowButton' title='Close'>close</a></div>"); 		
			
			$("#TB_closeWindowButton").click(tb_remove);
			
			if (!(TB_PrevHTML === "")) {
				function goPrev(){
					if($(document).unbind("click",goPrev)){$(document).unbind("click",goPrev);}
					$("#TB_window").remove();
					$("body").append("<div id='TB_window'></div>");
					tb_show(TB_PrevCaption, TB_PrevURL, imageGroup);
					return false;	
				}
				$("#TB_prev").click(goPrev);
			}
			
			if (!(TB_NextHTML === "")) {		
				function goNext(){
					$("#TB_window").remove();
					$("body").append("<div id='TB_window'></div>");
					tb_show(TB_NextCaption, TB_NextURL, imageGroup);				
					return false;	
				}
				$("#TB_next").click(goNext);
				
			}

			document.onkeydown = function(e){ 	
				if (e == null) { // ie
					keycode = event.keyCode;
				} else { // mozilla
					keycode = e.which;
				}
				if(keycode == 27){ // close
					tb_remove();
				} else if(keycode == 190){ // display previous image
					if(!(TB_NextHTML == "")){
						document.onkeydown = "";
						goNext();
					}
				} else if(keycode == 188){ // display next image
					if(!(TB_PrevHTML == "")){
						document.onkeydown = "";
						goPrev();
					}
				}	
			};
			
			tb_position();
			$("#TB_load").remove();
			$("#TB_ImageOff").click(tb_remove);
			$("#TB_window").css({display:"block"}); //for safari using css instead of show
			};
			
			imgPreloader.src = url;
		}else{//code to show html
			
			var queryString = url.replace(/^[^\?]+\??/,'');
			var params = tb_parseQuery( queryString );

			//TB_WIDTH = (params['width']*1) + 30 || 630; //defaults to 630 if no paramaters were added to URL
			TB_WIDTH = (params['width']*1) || 630; //defaults to 630 if no paramaters were added to URL
			TB_HEIGHT = (params['height']*1) + 40 || 440; //defaults to 440 if no paramaters were added to URL
			//ajaxContentW = TB_WIDTH - 30;
			ajaxContentW = TB_WIDTH;
			ajaxContentH = TB_HEIGHT - 45;
			
			if(url.indexOf('TB_iframe') != -1){// either iframe or ajax window		
					urlNoQuery = url.split('TB_');
					$("#TB_iframeContent").remove();
					if(params['modal'] != "true"){//iframe no modal
						$("#TB_window").append("<div id='TB_title'><div id='TB_ajaxWindowTitle'>"+caption+"</div><div id='TB_closeAjaxWindow'><a href='#' id='TB_closeWindowButton' title='Close'>close</a></div></div><iframe frameborder='0' hspace='0' src='"+urlNoQuery[0]+"' id='TB_iframeContent' name='TB_iframeContent"+Math.round(Math.random()*1000)+"' onload='tb_showIframe()' style='width:"+(ajaxContentW + 29)+"px;height:"+(ajaxContentH + 17)+"px;' > </iframe>");
					}else{//iframe modal
					$("#TB_overlay").unbind();
						$("#TB_window").append("<iframe frameborder='0' hspace='0' src='"+urlNoQuery[0]+"' id='TB_iframeContent' name='TB_iframeContent"+Math.round(Math.random()*1000)+"' onload='tb_showIframe()' style='width:"+(ajaxContentW + 29)+"px;height:"+(ajaxContentH + 17)+"px;'> </iframe>");
					}
			}else{// not an iframe, ajax
					if($("#TB_window").css("display") != "block"){
						if(params['modal'] != "true"){//ajax no modal
						$("#TB_window").append("<div id='TB_title'><div id='TB_ajaxWindowTitle'>"+caption+"</div><div id='TB_closeAjaxWindow'><a href='#' id='TB_closeWindowButton'>close </a></div></div><div id='TB_ajaxContent' style='width:"+ajaxContentW+"px;height:"+ajaxContentH+"px'></div>");
						}else{//ajax modal
						$("#TB_overlay").unbind();
						$("#TB_window").append("<div id='TB_ajaxContent' class='TB_modal' style='width:"+ajaxContentW+"px;height:"+ajaxContentH+"px;'></div>");	
						}
					}else{//this means the window is already up, we are just loading new content via ajax
						$("#TB_ajaxContent")[0].style.width = ajaxContentW +"px";
						$("#TB_ajaxContent")[0].style.height = ajaxContentH +"px";
						$("#TB_ajaxContent")[0].scrollTop = 0;
						$("#TB_ajaxWindowTitle").html(caption);
					}
			}
					
			$("#TB_closeWindowButton").click(tb_remove);
			
				if(url.indexOf('TB_inline') != -1){	
					$("#TB_ajaxContent").append($('#' + params['inlineId']).children());
					$("#TB_window").unload(function () {
						$('#' + params['inlineId']).append( $("#TB_ajaxContent").children() ); // move elements back when you're finished
					});
					tb_position();
					$("#TB_load").remove();
					$("#TB_window").css({display:"block"}); 
				}else if(url.indexOf('TB_iframe') != -1){
					tb_position();
					if($.browser.safari){//safari needs help because it will not fire iframe onload
						$("#TB_load").remove();
						$("#TB_window").css({display:"block"});
					}
				}else{
					$("#TB_ajaxContent").load(url += "&random=" + (new Date().getTime()),function(){//to do a post change this load method
						tb_position();
						$("#TB_load").remove();
						tb_init("#TB_ajaxContent a.thickbox");
						$("#TB_window").css({display:"block"});
					});
				}
		}

		if(!params['modal']){
			document.onkeyup = function(e){ 	
				if (e == null) { // ie
					keycode = event.keyCode;
				} else { // mozilla
					keycode = e.which;
				}
				if(keycode == 27){ // close
					tb_remove();
				}	
			};
		}
		
	} catch(e) {
		//nothing here
	}
}

//helper functions below
function tb_showIframe(){
	$("#TB_load").remove();
	$("#TB_window").css({display:"block"});
}

function tb_remove() {
 	$("#TB_imageOff").unbind("click");
	$("#TB_closeWindowButton").unbind("click");
	$("#TB_window").fadeOut("fast",function(){$('#TB_window,#TB_overlay,#TB_HideSelect').trigger("unload").unbind().remove();});
	$("#TB_load").remove();
	if (typeof document.body.style.maxHeight == "undefined") {//if IE 6
		$("body","html").css({height: "auto", width: "auto"});
		$("html").css("overflow","");
	}
	document.onkeydown = "";
	document.onkeyup = "";
	return false;
}

function tb_position() {
$("#TB_window").css({marginLeft: '-' + parseInt((TB_WIDTH / 2),10) + 'px', width: TB_WIDTH + 'px'});
	if ( !(jQuery.browser.msie && jQuery.browser.version < 7)) { // take away IE6
		$("#TB_window").css({marginTop: '-' + parseInt((TB_HEIGHT / 2),10) + 'px'});
	}
}

function tb_parseQuery ( query ) {
   var Params = {};
   if ( ! query ) {return Params;}// return empty object
   var Pairs = query.split(/[;&]/);
   for ( var i = 0; i < Pairs.length; i++ ) {
      var KeyVal = Pairs[i].split('=');
      if ( ! KeyVal || KeyVal.length != 2 ) {continue;}
      var key = unescape( KeyVal[0] );
      var val = unescape( KeyVal[1] );
      val = val.replace(/\+/g, ' ');
      Params[key] = val;
   }
   return Params;
}

function tb_getPageSize(){
	var de = document.documentElement;
	var w = window.innerWidth || self.innerWidth || (de&&de.clientWidth) || document.body.clientWidth;
	var h = window.innerHeight || self.innerHeight || (de&&de.clientHeight) || document.body.clientHeight;
	arrayPageSize = [w,h];
	return arrayPageSize;
}

function tb_detectMacXFF() {
  var userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('mac') != -1 && userAgent.indexOf('firefox')!=-1) {
    return true;
  }
}



function SetCookie(cookieName,cookieValue,nDays) {
    var today = new Date();
    var expire = new Date();
    if (nDays==null || nDays==0) nDays=1;
    expire.setTime(today.getTime() + 3600000*24*nDays);
    document.cookie = cookieName+"="+escape(cookieValue)
                 + ";expires="+expire.toGMTString();
}

function Get_Cookie( name ) {
    var start = document.cookie.indexOf( name + "=" );
    var len = start + name.length + 1;
    if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) )
    {
        return null;
    }
    
    if ( start == -1 ) return null;
    var end = document.cookie.indexOf( ";", len );
    if ( end == -1 ) end = document.cookie.length;
    return unescape( document.cookie.substring( len, end ) );
}

function Delete_Cookie( name, path, domain ) {
    if ( Get_Cookie( name ) ) document.cookie = name + "=" +
    ( ( path ) ? ";path=" + path : "") +
    ( ( domain ) ? ";domain=" + domain : "" ) +
    ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
}
// JScript File
function changeAutoStart(objcheck, idtextarea,lrtauto,lrtnotauto)
{
    var checkAutoPlay = document.getElementById(objcheck);
    
    var objlrtauto = document.getElementById(lrtauto);
    var objlrtnotauto = document.getElementById(lrtnotauto);
    
    if(checkAutoPlay.checked == true)
    {
        document.getElementById(idtextarea).value =  objlrtauto.value;
    }
    else
    {
        document.getElementById(idtextarea).value =  objlrtnotauto.value;
    }
}



function bb_bookmarksite(title, url)
{
    if (document.all)
        window.external.AddFavorite(url, title);
    else if (window.sidebar)
        window.sidebar.addPanel(title, url, "")
}

function bb_setHomepage(obj)
{
    obj.style.behavior='url(#default#homepage)';
    if (document.all)
    {
        obj.setHomePage('http://BaamBoo.com');
    }
    else
    {
        alert("Kéo Logo Baamboo vào nút Home để đặt baamboo làm trang chủ");
    }
}

function PNGNotOk()
{
    var arVersion = navigator.appVersion.split("MSIE")
    var version = parseFloat(arVersion[1])
    
    return ((version >= 5.5) && (document.body.filters) && (version <7));
}

function btnVietkey_onclick(imgID1, imgID2) 
{
    var temp = document.getElementById(imgID1).src;   
    var namecookie = Get_Cookie('cookieVE');
    if (namecookie != null)
    {
        if(namecookie == 'V')
        {
            SetCookie('cookieVE','E',29);
            setMethod(-1);
            document.getElementById(imgID1).src ='/images/E.gif';
            document.getElementById(imgID2).src ='/images/E.gif';                           
        }
        else{
            SetCookie('cookieVE','V',29);
            setMethod(0);
            document.getElementById(imgID1).src ='/images/V.gif';
            document.getElementById(imgID2).src ='/images/V.gif';
        }
    }
    return true;
}

function btnVietkeyHome_onclick(imgID1) 
{
    var temp = document.getElementById(imgID1).src;
    var namecookie = Get_Cookie('cookieVE');
    if (namecookie != null)
    {
        if(namecookie == 'V')
        {
            SetCookie('cookieVE','E',29);
            setMethod(-1);
            document.getElementById(imgID1).src ='/images/E.gif';                           
        }
        else{
            SetCookie('cookieVE','V',29);
            setMethod(0);
            document.getElementById(imgID1).src ='/images/V.gif';
        }
    }
    return true;
}

function loadimagesEV(imgID1,imgID2)
{
    var namecookie = Get_Cookie('cookieVE');
    if(namecookie == null)
    {
        SetCookie('cookieVE','E',29);
        setMethod(-1);
        document.getElementById(imgID1).src ='/images/E.gif';
        document.getElementById(imgID2).src ='/images/E.gif';
    }
    else
    {
        if(namecookie == 'V')
        {
            setMethod(0);
            document.getElementById(imgID1).src ='/images/V.gif';
            document.getElementById(imgID2).src ='/images/V.gif';
        }
        else{
            setMethod(-1);
            document.getElementById(imgID1).src ='/images/E.gif';
            document.getElementById(imgID2).src ='/images/E.gif';   
        }
    }
}


function loadimagesEVHome(imgID1)
{
    var namecookie = Get_Cookie('cookieVE');
    if(namecookie == null)
    {
        SetCookie('cookieVE','E',29);
        setMethod(-1);
        document.getElementById(imgID1).src ='/images/E.gif';
    }
    else
    {
        if(namecookie == 'V')
        {
            setMethod(0);
            document.getElementById(imgID1).src ='/images/V.gif';
        }
        else{
            setMethod(-1);
            document.getElementById(imgID1).src ='/images/E.gif';   
        }
    }
}

function correctPNG() // correctly handle PNG transparency in Win IE 5.5 & 6.
{
    var arVersion = navigator.appVersion.split("MSIE")
    var version = parseFloat(arVersion[1])
    if ((version >= 5.5) && (document.body.filters)) 
    {
        for(var i=0; i<document.images.length; i++)
        {
            var img = document.images[i]
            var imgName = img.src.toUpperCase()
            if (imgName.substring(imgName.length-3, imgName.length) == "PNG")
            {
                var imgID = (img.id) ? "id='" + img.id + "' " : ""
                var imgClass = (img.className) ? "class='" + img.className + "' " : ""
                var imgTitle = (img.title) ? "title='" + img.title + "' " : "title='" + img.alt + "' "
                var imgStyle = "display:inline-block;" + img.style.cssText 
                if (img.align == "left") imgStyle = "float:left;" + imgStyle
                if (img.align == "right") imgStyle = "float:right;" + imgStyle
                if (img.parentElement.href) imgStyle = "cursor:hand;" + imgStyle
                var strNewHTML = "<span " + imgID + imgClass + imgTitle
                + " style=\"" + "width:" + img.width + "px; height:" + img.height + "px;" + imgStyle + ";"
                + "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader"
                + "(src=\'" + img.src + "\', sizingMethod='scale');\"></span>" 
                img.outerHTML = strNewHTML
                i = i-1
            }
        }
    } 
}

function PNGNotOk()
{
    var arVersion = navigator.appVersion.split("MSIE")
    var version = parseFloat(arVersion[1])
    
    return ((version >= 5.5) && (document.body.filters) && (version <7));
}


var choicesuggest = 1;

function builtEx(tab, choice)
{    
    if (tab == "mp3")
    {
        choicesuggest = choice;
        $.get("/Modules/DataExamples.aspx", { choice: choice },
            function(data) {
                if (data.toString().length > 2) {
                    $('#divEx1').html(data);
                }
                else {
                    $('#liExample').html("");
                    $('#divEx1').html("");
                }
            });
        
        makePOSTRequest("/setCookie.aspx?tab=" + tab + "&choice=" + choice, "")
    }
}

var http_request = false;

function makePOSTRequest(url, parameters) {
    http_request = false;
    if (window.XMLHttpRequest) { // Mozilla, Safari,...
     http_request = new XMLHttpRequest();
     if (http_request.overrideMimeType) {
 	    // set type accordingly to anticipated content type
        //http_request.overrideMimeType('text/xml');
        http_request.overrideMimeType('text/html');
     }
    } else if (window.ActiveXObject) { // IE
     try {
        http_request = new ActiveXObject("Msxml2.XMLHTTP");
     } catch (e) {
        try {
           http_request = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {}
     }
    }
    if (!http_request) {
     alert('Cannot create XMLHTTP instance');
     return false;
    }

    //http_request.onreadystatechange = alertContents;
    http_request.open('POST', url, true);
    http_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http_request.setRequestHeader("Content-length", parameters.length);
    http_request.setRequestHeader("Connection", "close");
    http_request.send(parameters);
}

function clickButton(e, buttonid)
{

      var evt = e ? e : window.event;

      var bt = document.getElementById(buttonid);

      if (bt){

          if (evt.keyCode == 13){

                bt.click();

                return false;

          }
      }
}

function DisplayRelateVideo(base64keyword, choice)
{
	$.get("/Modules/RelateVideos.aspx",
	{keyword:base64keyword,choice:choice},
	function(data)
	{
	   $('#displayrelate').html(data); 
    });
	
//	var tabYoutube = document.getElementById("divtabyoutupe");
//    var tabVietNam = document.getElementById("divtabvietname");
//    
//    tabVietNam.className = "divtabrelatenoactive";
//    tabYoutube.className = "divtabrelateactive";
//    if (choice == '5')
//    {
//        tabVietNam.className = "divtabrelateactive";
//        tabYoutube.className = "divtabrelatenoactive";
//    }
}

function DisplayRelateVideoArtist(base64keyword, choice)
{
	$.get("/Modules/RelateArtist.aspx",
	{keyword:base64keyword,choice:choice},
	function(data){
	    $('#displayrelateartist').html(data);
	});
}

function GetLinkDownload(id)
{
	$.get("/Handlers/Download.ashx",{id:id},
	function(data){
	    $('#divLinkDownload').html(data);
	});
}

function RelateLyric(search)
{
	$.get("/Modules/RelateLyric.aspx",{keysearch:search},
	function(data){
	    if(data.toString().length > 3)
	    {
	        $('#divRelateLyric').html(data);
	    }
	    else
	    {
            $('#divRelateLyric').html("<center>Không có lời bài hát liên quan.<center>");
	    }
	});
}

function GetLinkDownloadNTC(id)
{
	$.get("/Handlers/DownloadNCT.ashx",{id:id},
	function(data){
	    $('#divLinkDownload').html(data);
	});
}

function GetAdvertising(idbinddata,position)
{
	$.get("/Handlers/Advertising.ashx",{position:position},
	function(data){
	    $(idbinddata).html(data);
	});
}

function openwindow(url,title,width,height)
{
    window.open(url, 'dd','menubar=no,resizable=no,width=' + width + ',height=' + height + "'");
}

function DisplayTopMusic100(top,page)
{
	$.get("/Modules/TopMusicArtist.aspx",
	{top:top,page:page},
	function(data){
	    $('#a1').removeClass().addClass('Pageing');
	    $('#a2').removeClass().addClass('Pageing');
	    $('#a3').removeClass().addClass('Pageing');
	    $('#a4').removeClass().addClass('Pageing');
	    $('#a5').removeClass().addClass('Pageing');
	    $('#divcontenttopmusic').html(data);
	    $('#a' + page).removeClass().addClass('PageingII');
	});
}

function DisplayEnbac()
{
     $.ajax({
        url: "/Modules/CodeEmbed.aspx",
        cache:false,
        success: function(html){
          $('#displayenbac').html(html);
        }
    });
}

function DisplaySanNhac()
{
    $.ajax({
        url: "/Modules/CodeEmbedSanNhac.aspx",
        cache:false,
        success: function(html){
          $('#displaysannhac').html(html);
        }
    });
}

function DisplayVideoRelate(keyword,choice,width,column,count,bgcolor)
{
    
    $.get("/Modules/VideoRelate.aspx",{keyword:keyword,choice:choice,width:width,column:column,count:count,bgcolor:bgcolor},
    function(data){
        $('#displayvideorelate').html(data);
    });
    
}

function DisplayTopVideo(choice,width,column,count,bgcolor)
{
    $.get("/Modules/TopVideo.aspx",{choice:choice,width:width,column:column,count:count,bgcolor:bgcolor},
    function(data){
        $('#displaytopvideo').html(data);
    });
    
    
//    var tabYoutube = document.getElementById("divtoptabyoutupe");
//    var tabVietNam = document.getElementById("divtoptabvietname");
//    
//    tabVietNam.className = "divtabrelatenoactive";
//    tabYoutube.className = "divtabrelateactive";
//    if (choice == '5')
//    {
//        tabVietNam.className = "divtabrelateactive";
//        tabYoutube.className = "divtabrelatenoactive";
//    }	
}

function DisplayTotalMp3(base64keyword)
{
	$.get("/Modules/totalpage.aspx",{keyword:base64keyword,type:"1"},
	function(data){
	    $('#totalmp3').html(data);
	});	
}

function DisplayTotalLyric(base64keyword)
{
	$.get("/Modules/totalpage.aspx",{keyword:base64keyword,type:"2"},
	function(data){
	    $('#totallyric').html(data);
	});
}

function DisplayTotalVideo(base64keyword)
{
	$.get("/Modules/totalpage.aspx",{keyword:base64keyword,type:"3"},
	function(data){
	    $('#totalvideo').html(data);
	});
}


function DisplayTotalSannhac(base64keyword)
{
	$.get("/Modules/totalpage.aspx",{keyword:base64keyword,type:"4"},
	function(data){
	    $('#totalsannhac').html(data);
	});
}


function DisplayMp3TopHot(page)
{
	$.get("/Modules/TopMp3Hot.aspx",{page:page},
	function(data){
	    $('#DisplayMp3TopHot').html(data);
	});
}

$(document).ready(function()
{
    //-------------------------------------clip board copy--------------------
     $.clipboardReady(function()
     {
        $('#ctl00_ContentPlaceHolder1_ucMp3Detail1_txtEmbedWeb').click(function()
        {
            $(this).select();
            $.clipboard( $(this).text() );
            
            
        });
        
     }, { debug: false } );
     
     $.clipboardReady(function()
     {
        $('#ctl00_ContentPlaceHolder1_ucMp3Detail1_txtEmbedFrum').click(function()
        {
            $(this).select();
            $.clipboard( $(this).text() );
            
            
        });
        
     }, { debug: false } );
     
      $.clipboardReady(function()
     {
        $('#divLinkDownload').click(function()
        {
            $(this).select();
            $.clipboard( $(this).text() );
            
            
        });
        
     }, { swfpath: "/js/clipboard.swf",debug: false } );
     
     //------------------------------------------------------------------
     
     $('#ctl00_ContentPlaceHolder1_ucRelateAlbumOnSearch1_divButtonAlbumNext').click(function()
     {
        var $divRelateAlbum = $("#divRelateAlbum");
        var $divButtonAlbumNext = $('#ctl00_ContentPlaceHolder1_ucRelateAlbumOnSearch1_divButtonAlbumNext');
        if($divRelateAlbum.is(":hidden"))
        {
           $divRelateAlbum.slideDown("slow");
           $divButtonAlbumNext.html("Thu gọn <label style=\"color:#FA0186;\">»</label>&nbsp;");
           
        }
        else
        {
            $divRelateAlbum.slideUp("slow");
            $divButtonAlbumNext.html("Mở rộng <label style=\"color:#FA0186;\">»</label>&nbsp;");
            
        }
     });
     
     
     $('#ctl00_ContentPlaceHolder1_ucRelateArtistOnSearch1_divButtonArtistNext').click(function()
     {
        var $divRelateArtist= $("#divRelateArtist");
        var $divButtonArtistNext = $('#ctl00_ContentPlaceHolder1_ucRelateArtistOnSearch1_divButtonArtistNext');
        if($divRelateArtist.is(":hidden"))
        {
           $divRelateArtist.slideDown("slow");
           $divButtonArtistNext.html("Thu gọn <label style=\"color:#FA0186;\">»</label>&nbsp;");
           
        }
        else
        {
            $divRelateArtist.slideUp("slow");
            $divButtonArtistNext.html("Mở rộng <label style=\"color:#FA0186;\">»</label>&nbsp;");
            
        }
     });
     
     
     $('#ctl00_ContentPlaceHolder1_ucMp3Detail1_ucRelateAlbumOnSearch1_divButtonAlbumNext').click(function()
     {
        var $divRelateAlbum = $("#divRelateAlbum");
        var $divButtonAlbumNext = $('#ctl00_ContentPlaceHolder1_ucMp3Detail1_ucRelateAlbumOnSearch1_divButtonAlbumNext');
        if($divRelateAlbum.is(":hidden"))
        {
           $divRelateAlbum.slideDown("slow");
           $divButtonAlbumNext.html("Thu gọn <label style=\"color:#FA0186;\">»</label>&nbsp;");
           
        }
        else
        {
            $divRelateAlbum.slideUp("slow");
            $divButtonAlbumNext.html("Mở rộng <label style=\"color:#FA0186;\">»</label>&nbsp;");
            
        }
     });
     
     
     $('#ctl00_ContentPlaceHolder1_ucMp3Detail1_ucRelateArtistOnSearch1_divButtonArtistNext').click(function()
     {
        var $divRelateArtist= $("#divRelateArtist");
        var $divButtonArtistNext = $('#ctl00_ContentPlaceHolder1_ucMp3Detail1_ucRelateArtistOnSearch1_divButtonArtistNext');
        if($divRelateArtist.is(":hidden"))
        {
           $divRelateArtist.slideDown("slow");
           $divButtonArtistNext.html("Thu gọn <label style=\"color:#FA0186;\">»</label>&nbsp;");
           
        }
        else
        {
            $divRelateArtist.slideUp("slow");
            $divButtonArtistNext.html("Mở rộng <label style=\"color:#FA0186;\">»</label>&nbsp;");
            
        }
     });
     
      
     //-----------------show hide advance search box
     
     $('#divShowSearchAdvance').click(function(){
        var $divBoxSearchAdvance = $('#divBoxSearchAdvance');
        if($divBoxSearchAdvance.is(":hidden"))
        {
            $divBoxSearchAdvance.show("slow");
        }
        else
        {
            $divBoxSearchAdvance.hide("slow");
        }
        
     });
     
     
     $('#divBoxSearchClose').click(function(){
        var $divBoxSearchAdvance = $('#divBoxSearchAdvance');
        if($divBoxSearchAdvance.is(":hidden"))
        {
            $divBoxSearchAdvance.show("slow");
        }
        else
        {
            $divBoxSearchAdvance.hide("slow");
        }
     });
     
 });


 function showContentLyric(objname) {
     var $objdiv = $('divDescLyric_' + objname);
     var $objdivContent = $('#divContentLyric_' + objname);
     if ($objdivContent.is(":hidden")) 
     {
         if ($('.notselected').hasClass('selected')) {
             $('.notselected').removeClass('selected');
             $('.notselected').css('display','none');
         }
         $objdivContent.addClass('selected');
         $objdivContent.show("slow");
         
     }
     else {
         $('.notselected').removeClass('selected');
         $objdivContent.hide("slow");
     }
     
     
     
     //alert(objname);
 }
 
 //-----------------------show active icon search--------------------------------
 function showactiveicon(objname)
 {
    var $objdivaction = $(objname).find("#ulactionsearchitem");
    var $objli1 = $objdivaction.find("#li1").find("a");
    var $objli2 = $objdivaction.find("#li2").find("a");
    var $objli3 = $objdivaction.find("#li3").find("a");
    var $objli4 = $objdivaction.find("#li4").find("a");
    var $objli5 = $objdivaction.find("#li5").find("a");
    var $objli6 = $objdivaction.find("#li6").find("a");
    $objli1.removeClass("classli1notactive").addClass("classli1");
    $objli2.removeClass("classli2notactive").addClass("classli2");
    $objli3.removeClass("classli3notactive").addClass("classli3");
    $objli4.removeClass("classli4notactive").addClass("classli4");
    $objli5.removeClass("classli5notactive").addClass("classli5");
    $objli6.removeClass("classli6notactive").addClass("classli6");
 }
 
  function hideactiveicon(objname)
  {
    var $objdiv = $(objname);
    if($objdiv.hasClass('divItemMusicPlayed') != true)
    {
        //alert("vao` day");
        var $objdivaction = $(objname).find("#ulactionsearchitem");
        var $objli1 = $objdivaction.find("#li1").find("a");
        var $objli2 = $objdivaction.find("#li2").find("a");
        var $objli3 = $objdivaction.find("#li3").find("a");
        var $objli4 = $objdivaction.find("#li4").find("a");
        var $objli5 = $objdivaction.find("#li5").find("a");
        var $objli6 = $objdivaction.find("#li6").find("a");
        $objli1.removeClass("classli1").addClass("classli1notactive");
        $objli2.removeClass("classli2").addClass("classli2notactive");
        $objli3.removeClass("classli3").addClass("classli3notactive");
        $objli4.removeClass("classli4").addClass("classli4notactive");
        $objli5.removeClass("classli5").addClass("classli5notactive");
        $objli6.removeClass("classli6").addClass("classli6notactive");
    }
 }
 
 function hideicon(objname)
  {
   
    var $objdivaction = $(objname).find("#ulactionsearchitem");
    var $objli1 = $objdivaction.find("#li1").find("a");
    var $objli2 = $objdivaction.find("#li2").find("a");
    var $objli3 = $objdivaction.find("#li3").find("a");
    var $objli4 = $objdivaction.find("#li4").find("a");
    var $objli5 = $objdivaction.find("#li5").find("a");
    var $objli6 = $objdivaction.find("#li6").find("a");
    $objli1.removeClass("classli1").addClass("classli1notactive");
    $objli2.removeClass("classli2").addClass("classli2notactive");
    $objli3.removeClass("classli3").addClass("classli3notactive");
    $objli4.removeClass("classli4").addClass("classli4notactive");
    $objli5.removeClass("classli5").addClass("classli5notactive");
    $objli6.removeClass("classli6").addClass("classli6notactive");
    
 }
 
var anarchy_url = 'http://mp3.baamboo.com/player' // http address for the anarchy-media folder (no trailing slash).
var accepted_domains=new Array("") 	// OPTIONAL - Restrict script use to your domains. Add root domain name (minus 'http' or 'www') in quotes, add extra domains in quotes and separated by comma.
var viddownloadLink = 'none'	// Download link for flv and wmv links: One of 'none' (to turn downloading off) or 'inline' to display the link. ***Use $qtkiosk for qt***.

// MP3 Flash player options
var playerloop = 'no'		// Loop the music ... yes or no?
var mp3downloadLink = 'none'	// Download for mp3 links: One of 'none' (to turn downloading off) or 'inline' to display the link.

// Hex colours for the MP3 Flash Player (minus the #)
var playerbg ='FFFFFF'				// Background colour
var playerleftbg = 'FD0074'			// Left background colour 00A89B
var playerrightbg = 'FD0074'		// Right background colour
var playerrightbghover = 'B30051'	// Right background colour (hover)
var playerlefticon = '000000'		// Left icon colour
var playerrighticon = '000000'		// Right icon colour
var playerrighticonhover = 'FFFFFF'	// Right icon colour (hover)
var playertext = '00A89B'			// Text colour
var playerslider = '00A89B'			// Slider colour
var playertrack = 'E6F6F5'			// Loader bar colour
var playerloader = 'E6F6F5'			// Progress track colour
var playerborder = 'E6F6F5'			// Progress track border colour

// Flash video player options
var flvwidth = '300' 	// Width of the flv player
var flvheight = '250'	// Height of the flv player (allow 20px for controller)
var flvfullscreen = 'true' // Show fullscreen button, true or false (no auto return on Safari, double click in IE6)

//Quicktime player options
var qtloop = 'false'	// Loop Quicktime movies: true or false.
var qtwidth = '400'		// Width of your Quicktime player
var qtheight = '250'	// Height of your Quicktime player (allow 16px for controller)
var qtkiosk = 'false'	// Allow downloads, false = yes, true = no.
// Required Quicktime version - To set the minimum version higher than 6 go to Quicktime player section below and edit (quicktime.ver6) on or around line 236.

//WMV player options
var wmvwidth = '350'	// Width of your WMV player
var wmvheight = '300'	// Height of your WMV player (allow 45px for WMV controller or 16px if QT player - ignored by WinIE)

//WMA player options
var wmawidth = '300'	// Width of your WMA player
var wmaheight = '60'	// Height of your WMA player

// CSS styles
var mp3playerstyle = 'vertical-align:top; margin:0px 0 0px 0px;'	// Flash mp3 player css style
var mp3imgmargin = '0.5em 0.5em -4px 5px'		// Mp3 button image css margins
var vidimgmargin = '0'		// Video image placeholder css margins

/* ------------------ End configuration options --------------------- */

/* --------------------- Domain Check ----------------------- */
//Lite protection only, you can also use .htaccss if you're paranoid - see http://evolt.org/node/60180
var domaincheck=document.location.href //retrieve the current URL of user browser
var accepted_ok=false //set acess to false by default

var warningHtml = '<div style="color:red;" id="sonpawarning">Bạn đang nghe thử 1/2 bài hát.</div>';

var currentplayerid = '0';



function Remove_Object () 
{
    $('.divbutton_played').removeClass('divbutton_played').addClass('divbutton_play');
    $('.divItemMusicPlayed').removeClass('divItemMusicPlayed');
    $('.controlactive').html("");
}
    
function flvButtonClick(self, url, limitedTime)
{
    Remove_Player_Object();
	
    self.style.display = "none";
	
    var temp = document.createElement('span');	
	temp.innerHTML = '<object type="application/x-shockwave-flash" id="sonpaflvplayer" wmode="transparent" data="'+anarchy_url+'/flvplayer_file.swf?click='+anarchy_url+'/images/flvplaybutton.gif&file='+url+'&autostart=true&showfsbutton='+flvfullscreen+'" height="'+flvheight+'" width="'+flvwidth+'">' +
        '<param name="movie" value="'+anarchy_url+'/flvplayer_file.swf?click='+anarchy_url+'/images/flvplaybutton.gif&autostart=true&file='+url+'&showfsbutton='+flvfullscreen+'"> <param name="wmode" value="transparent">' +
        '<embed src="'+anarchy_url+'/flvplayer_file.swf?file='+url+'&autostart=true&click='+anarchy_url+'/images/flvplaybutton.gif&&showfsbutton='+flvfullscreen+'" ' + 
        'width="'+flvwidth+'" height="'+flvheight+'" name="flvplayer" align="middle" ' + 
        'play="true" loop="false" quality="high" allowScriptAccess="sameDomain" ' +
        'type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer">' + 
        '</embed></object>';
        
    if (limitedTime > 0)
        temp.innerHTML += warningHtml;
        
    self.parentNode.insertBefore(temp, self.nextSibling)
}

function WmvButtonClick(self, url, limitedTime,numberitem, statusid)
{
    if($(self).hasClass('divbutton_played') == true)
    {
        
        Remove_Object ();
        $(self).addClass('divbutton_play');
        $(self).attr({title:"Click vào đây để nghe thử bài này."});
        hideactiveicon(".divItemMusic_" + numberitem);
        if(currentplayerid == numberitem)
        {
            $(".divItemMusic_" + currentplayerid).mouseout(function(){
                 hideactiveicon(".divItemMusic_" + currentplayerid);
            });
        }
        else
        {
            $(".divItemMusic_" + numberitem).mouseout(function(){
                 hideactiveicon(".divItemMusic_" + numberitem);
            });
        }
    }
    else
    {
        
        
        Remove_Object();
        $(self).removeClass('divbutton_play');
        $(self).addClass('divbutton_played');//change trang thai cua button play --> played
        $('.divItemMusic_' + numberitem).addClass('divItemMusicPlayed');//changed item background
        $(self).attr({title:"Click vào đây để dừng nghe thử."});
        
        var $playercontrols = $('#divplayercontrol_' + numberitem);
        $playercontrols.addClass('controlactive');
        var temp;
    		
	    if(navigator.userAgent.indexOf('Mac') != -1) 
	    {	
    	    temp = '<embed src="'+url+'" width="'+wmawidth+'" height="'+wmaheight+'" id="sonpawmaplayer" loop="'+qtloop+'" autoplay="true" controller="true" border="0" type="video/quicktime" kioskmode="'+qtkiosk+'" scale="tofit" pluginspage="http://www.apple.com/quicktime/download/"></embed>';
	        $playercontrols.html(temp);
	    } 
	    else 
	    {	
	        var currentid = ".divItemMusic_"+currentplayerid;
            hideactiveicon(currentid);
            
            if(currentplayerid == numberitem)
            {
                $(currentid).mouseout(function(){
                    showactiveicon(currentid);
                });
            }
            else
            {
                if(numberitem == '0')
                {
                    $(".divItemMusic_"+numberitem).mouseout(function(){
                        showactiveicon(".divItemMusic_"+numberitem);
                    });    
                }
                else
                {
                    $(currentid).mouseout(function(){
                        hideactiveicon(currentid);
                    });    
                }
                
            }
            
            showactiveicon(".divItemMusic_"+numberitem);
            $(".divItemMusic_"+numberitem).removeAttr("onmouseout");
            currentplayerid = numberitem;
             if (navigator.plugins && navigator.plugins.length) 
             {		
		        temp = '<embed type="application/x-mplayer2" src="'+url+'" ' +
		              'showcontrols="1" ShowStatusBar="0" autostart="1" id="sonpawmaplayer" displaySize="0"' +
		              'pluginspage="http://www.microsoft.com/Windows/Downloads/Contents/Products/MediaPlayer/"' +
		              'width="'+wmvwidth+'" height="'+wmvheight+'">' +
		              '</embed>';

		        if (statusid == '141') {
		            temp += '<div style="color:#ff0000;">Bạn không nghe được đầy đủ bài hát này.Vì bản quyền, mong bạn thông cảm.</div>';
		        }
		        $playercontrols.html(temp);
		        if (statusid == '141') {
		            setTimeout("Remove_Object()", 120000);
		        }		              
	          }
	          else
	          {
	            temp = '<object classid="CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6" width="'+wmvwidth+'" height="'+wmvheight+'" id="sonpawmaplayer"> ' +
                      '<param name="url" value="'+url+'" /> ' +
                      '<param name="autoStart" value="True" /> ' +
                      '<param name="showControls" value="True" /> ' +
                      '<param name="rate" value="1">' +
                      '<param name="balance" value="0">' +
                      '<param name="currentPosition" value="0">' +
                      '<param name="playCount" value="5">' + 
                      '<param name="currentMarker" value="0">' +
                      '<param name="invokeURLs" value="-1">' + 
                      '<param name="volume" value="100">' +
                      '<param name="mute" value="0">' +
                      '<param name="uiMode" value="full">' +
                      '<param name="stretchToFit" value="0">' +
                      '<param name="windowlessVideo" value="1">' +
                      '<param name="enabled" value="-1">' +
                      '<param name="enableContextMenu" value="0">' +
                      '<param name="fullScreen" value="0">' +
                      '<param name="enableErrorDialogs" value="0">' +			  
                      '</object>';

	            if (statusid == '141') {
	                temp += '<div style="color:#ff0000;">Bạn không nghe được đầy đủ bài hát này.Vì bản quyền, mong bạn thông cảm.</div>';
	            }
	            
	            $playercontrols.html(temp);
	            
	            if (statusid == '141') {
	                setTimeout("Remove_Object()", 120000);
	            }		              
	            
	          }
		    
	    }        
    }
    
    
}

//function otherButtonClickLonghk(self, url, limitedTime,numberitem)
function otherButtonClickLonghk(self, idmd5, fileSource,numberitem, statusid)
{
    var Player = document.getElementById("sonpawmaplayer");
    
    //jQuery.noConflict();

    $('.classadvertise').html("");
    
//    $('.classadvertise').removeClass("advertisenct");
//    if (fileSource == "nhaccuatui.com") {
//        $('.classadvertise').addClass('advertisenct');
//    }
    
    if($(self).hasClass('divbutton_played') == true)
    {
        if (!navigator.plugins && navigator.plugins.length)
        {
            Player.controls.stop();
        } 
        
        Remove_Object ();
        $(self).addClass('divbutton_play');
        $(self).attr({title:"Click vào đây để nghe thử bài này."});
        hideicon(".divItemMusic_" + numberitem);
        currentplayerid = numberitem;
        
    }
    else
    {
        if (!navigator.plugins && navigator.plugins.length)
        {
            Player.controls.stop();
        }
        var currentid = ".divItemMusic_" + currentplayerid;
        
        if(currentplayerid!= numberitem)
        {
            showactiveicon(".divItemMusic_"+numberitem);
            hideicon(currentid);
        }
        else
        {
            showactiveicon(".divItemMusic_"+numberitem);
        }
        
        
        currentplayerid = numberitem;
        //alert(indexitem);
        //quang cao code
        var strAdvContent = '<div id="div_adv_player_mp3_300x250">' + $('#div_adv_player_mp3_300x250').html() + '</div>';
        $('#divAdvertise_' + numberitem).html(strAdvContent); //khi can hien quang cao bo rem code
        //advertisenct
//        if (fileSource == "canhac.com" ||
//            fileSource == "nhac1000.com" ||
//            fileSource == "musicdrimr" ||
//            fileSource == "nhacvui" ||
//            fileSource == "musiczing") { 
//            $('#divAdvertise_' + numberitem).html(strAdvContent); //khi can hien quang cao bo rem code
//        }
         
        Remove_Object();
        $(self).removeClass('divbutton_play');
        $(self).addClass('divbutton_played');//change trang thai cua button play --> played
        $(self).attr({title:"Click vào đây để dừng nghe thử."});
        $('.divItemMusic_' + numberitem).addClass('divItemMusicPlayed');//changed item background
        
        var $playercontrols = $('#divplayercontrol_' + numberitem);
        $playercontrols.addClass('controlactive');
        var temp;
        
	    if(navigator.userAgent.indexOf('Mac') != -1) 
	    {	
    	    temp = '<embed src="'+url+'" width="'+wmawidth+'" height="'+wmaheight+'" id="sonpawmaplayer" loop="'+qtloop+'" autoplay="true" controller="true" border="0" type="video/quicktime" kioskmode="'+qtkiosk+'" scale="tofit" pluginspage="http://www.apple.com/quicktime/download/"></embed>';
	        $playercontrols.html(temp);
	    } 
	    else 
	    {	
	    
	        //player bt khong co video quang cao'

//            temp = '<object width="300" height="70" id="sonpamp3player" classid="CLSID:22d6f312-b0f6-11d0-94ab-0080c74c7e95"> ' +
//                  '<param name="Filename" value="'+idmd5+'" /> ' +
//                  '<param name="AutoStart" value="1">' +
//                  '<param name="ShowControls" value="1">' + 
//                  '<param name="ShowStatusBar" value="1">' +
//                  '<param name="AutoRewind" value="True">'	+	
//                  '<embed autorewind="1" showstatusbar="1" ' + 
//                  'width="300" filename="' + idmd5 + '" height="70" type="application/x-mplayer2" src="'+idmd5+'" ' +
//	              'pluginspage="http://www.microsoft.com/Windows/Downloads/Contents/Products/MediaPlayer/" showcontrols="1"' +
//	              '</embed>' + 	  
//                  '</object>';

//                $.get("/Player/CodeEmbed.aspx",
//	            {idmd5:idmd5,fileSource:fileSource},
//	            function(data)
//	            {
//	               $playercontrols.html(data); 
//                });

            $playercontrols.html("<img src=\"/images/indicator.gif\" border=\"0\"/>Bạn vui lòng chờ...");

            $.get("/Handlers/Player.ashx",
	            { idmd5: idmd5, fileSource: fileSource },
	            function(data) {

	                if (statusid == '141') {
	                    data += '<div style="color:#ff0000;">Bạn không nghe được đầy đủ bài hát này.Vì bản quyền, mong bạn thông cảm.</div>';
	                    $playercontrols.html(data);
	                }
	                else {
	                    $playercontrols.html(data);
	                }

	            });

	            if (statusid == '141') {
	                setTimeout("Remove_Object()", 120000);
	            }
	            
	            //--------log khi user click vao nut nghe thu--------
	            $.get("/Handlers/LogHearDemo.ashx",
	            { sourcename: fileSource },function(data){});
	            //---------------------------------------------------

            //player co video quang cao
        
//            temp =  '<object width="300" height="385" type="application/x-shockwave-flash" data="/Player/quangCaoBaamBoo.swf">' +
//                    '<param name="movie" value="/Player/quangCaoBaamBoo.swf"/>' +
//                    '<param name="allowFullScreen" value="true"/>' +
//                    '<param name="allowScriptAccess" value="always"/>'+
//                    '<param name="FlashVars" value="autoplay=1&src=/Player/R7.flv&duration=130&vol=0&loop=0&frame=27&idmd5=' +idmd5+ '&fileSource=' +fileSource+ '"/></object>';
			  
              //$playercontrols.html(temp);
		          
		    
	        }        
    }
}

function sayCheck(idmd5,fileSource)
{
    //alert(idmd5 + "  "+currentplayerid+"  " + fileSource);
    
    $.get("/Player/CodeEmbed.aspx",
	{idmd5:idmd5,fileSource:fileSource},
	function(data)
	{
	   $(currentplayerid).html(data); 
    });
}

function PlayerChacha(self, url,idreffer,numberitem)
{
    var Player = document.getElementById("sonpawmaplayer");
    
    $('.classadvertise').html("");
    
    if($(self).hasClass('divbutton_played') == true)
    {
        Remove_Object ();
        $(self).addClass('divbutton_play');
        $(self).attr({title:"Click vào đây để nghe thử bài này."});
    }
    else
    {
        Remove_Object();
        //quang cao code
        var strAdvContent = '<div id="div_adv_player_mp3_300x250">' + $('#div_adv_player_mp3_300x250').html() + '</div>';
        //$('#divAdvertise_' + numberitem).html(strAdvContent); //khi can hien quang cao bo rem code
    
        $(self).removeClass('divbutton_play');
        $(self).addClass('divbutton_played');//change trang thai cua button play --> played
        $(self).attr({title:"Click vào đây để dừng nghe thử."});
        $('.divItemMusic_' + numberitem).addClass('divItemMusicPlayed');//changed item background
        
        var $playercontrols = $('#divplayercontrol_' + numberitem);
        $playercontrols.addClass('controlactive');
        var temp;
    		
	    if(navigator.userAgent.indexOf('Mac') != -1)
	    {	
    	    temp = '<embed src="'+url+'" width="'+wmawidth+'" height="'+wmaheight+'" id="sonpawmaplayer" loop="'+qtloop+'" autoplay="true" controller="true" border="0" type="video/quicktime" kioskmode="'+qtkiosk+'" scale="tofit" pluginspage="http://www.apple.com/quicktime/download/"></embed>';
	        $playercontrols.html(temp);
	    } 
	    else 
	    {	

//            temp = '<embed flashvars="blogmode=1&file=http://chacha.vn/embedded/v1.0/getMedia.php?songId=' + idreffer + '" ' +
//                    'type="application/x-shockwave-flash" src="http://chacha.vn/embedded/v1.0/mp3player.swf" ' +
//                    'wmode="transparent" allowscriptaccess="none" height="130" width="368"/>';



             temp = '<iframe id="frametest"  runat="server" src="/Player/PlayChacha.aspx?id=' +idreffer+ '" height="140" width="375" frameborder="0">' +
                    '</iframe>';
             
                    
              $playercontrols.html(temp);
        }        
    }
}





function otherPageReferButtonClick(url,idmd5,fileSource,statusid)//dang code do
{
	
	var temp = "";
		
	if(navigator.userAgent.indexOf('Mac') != -1) 
	{	
	    temp = '<embed src="'+url+'" width="'+wmawidth+'" height="'+wmaheight+'" id="sonpawmaplayer" loop="'+qtloop+'" autoplay="true" controller="true" border="0" type="video/quicktime" kioskmode="'+qtkiosk+'" scale="tofit" pluginspage="http://www.apple.com/quicktime/download/"></embed>'
	} 
	else 
	{	
		$.get("/Handlers/Player.ashx",
            {idmd5:idmd5,fileSource:fileSource},
            function(data)
            {
                if (statusid == '141') {
                    data += '<div style="color:#ff0000;">Bạn không nghe được đầy đủ bài hát này.Vì bản quyền, mong bạn thông cảm.</div>';
                    $('#objdivPlayer').html(data);
                }
                else {
                    $('#objdivPlayer').html(data);
                }
                
                
            });

            if (statusid == '141') {
                setTimeout("removePlayerDetail()",120000);
            }
	}
}

function removePlayerDetail() {
    $('#objdivPlayer').html('');
}


/*

Clipboard - Copy utility for jQuery
Version 2.0
November 24, 2007

Project page:

	http://bradleysepos.com/projects/jquery/clipboard/

Files:

	Source:            jquery.clipboard.js
	Source (packed):   jquery.clipboard.pack.js
	Flash helper:      jquery.clipboard.swf

Usage examples:

	// Basic usage:
	$.clipboardReady(function(){
		$( "a" ).click(function(){
			$.clipboard( "You clicked on a link and copied this text!" );
			return false;
		});
	});

	// With options:
	$.clipboardReady(function(){
		$( "a" ).click(function(){
			$.clipboard( "You clicked on a link and copied this text!" );
			return false;
		});
	}, { swfpath: "path/to/jquery.clipboard.swf", debug: true } );

Compatibility:

	IE 6+, FF 2+, Safari 2+, Opera 9+
	Requires jQuery 1.2+
	Non-IE browsers require Flash 8 or higher.


Released under an MIT-style license

LICENSE
------------------------------------------------------------------------

Copyright (c) 2007 Bradley Sepos

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

------------------------------------------------------------------------

*/

(function($){

// Some variables that need scope
var flashMinVersion = [8,0,0];
var flashDetectedVersion = [0,0,0];
var swfpath;
var debugging;

var flashdetect = function( minVersion ){
	// Flash detection
	// Based on swfObject 2.0: http://code.google.com/p/swfobject/
	var d = null;
	if (typeof navigator.plugins != "undefined" && typeof navigator.plugins["Shockwave Flash"] == "object") {
		d = navigator.plugins["Shockwave Flash"].description;
		if (d) {
			// Got Flash, parse version
			d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
			flashDetectedVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
			flashDetectedVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
			if ( /r/.test(d) ) {
				flashDetectedVersion[2] = parseInt(d.replace(/^.*r(.*)$/, "$1"), 10);
			} else {
				flashDetectedVersion[2] = 0;
			}
			if (flashDetectedVersion[0] > minVersion[0] || (flashDetectedVersion[0] == minVersion[0] && flashDetectedVersion[1] > minVersion[1]) || (flashDetectedVersion[0] == minVersion[0] && flashDetectedVersion[1] == minVersion[1] && flashDetectedVersion[2] >= minVersion[2])){
				// Version ok
				return true;
			} else {
				// Version too old
				return false;
			}
		}
	}
	// No Flash detected
	return false;
};

var iecopydetect = function(){
	// Check for IE method
	if ( typeof window.clipboardData != "undefined" ){
		return true;
	}
};

var debug = function( string ){
	if ( debugging && typeof console != "undefined" && typeof console.log == "function" ){
		console.log( string );
	}
};

var swfready = function(){
	
	// The swf is already loaded, ignore
	if ( $.clipboardReady.done ) {
		return false;
	}
	
	// Count how many times swfready() has been called
	if ( typeof $.clipboardReady.counter == 'undefined' ){
		// Init counter
		$.clipboardReady.counter = 0;
	}
	// Increment counter
	$.clipboardReady.counter++;
	if ( $.clipboardReady.counter > 599 ){
		// Terminate process after 600 executions to avoid calling indefinitely and crashing some 
		// browsers (observed in Firefox 2.x). At 100ms interval, this should be plenty of time for 
		// the swf to load on even the slowest connections.
		clearInterval( $.clipboardReady.timer );
		// Debug
		debug("Waited "+$.clipboardReady.counter/10+" seconds for Flash object to load, terminating.");
		return false;
	}
	if ( ($.clipboardReady.counter % 100) == 0 ){
		// Debug
		debug("Waited "+$.clipboardReady.counter/10+" seconds for Flash object to load so far...");
	}
	
	// Check to see if the swf's external interface is ready
	var swf = $("#jquery_clipboard_swf:first");
	var swfdom = $(swf).get(0);
	if ( typeof swfdom.jqueryClipboardCopy == "function" && swfdom.jqueryClipboardAvailable ){
		
		// Swf is ready, stop checking
		clearInterval( $.clipboardReady.timer );
		$.clipboardReady.timer = null;
		
		// Set copy method
		$.clipboard.method = 'flash';
		
		// Execute queued functions
		for ( var i = 0; i < $.clipboardReady.ready.length; i++ ){
			$.clipboardReady.ready[i]();
		}
		
		// Remember that the swf is ready
		$.clipboardReady.ready = null;
		$.clipboardReady.done = true;
		
		// Everything is totally ready now
		debug( "jQuery.clipboard: OK. Initialized and ready to copy using Flash method." );
	}
};

$.clipboardReady = function( f, options ){
	
	// Options
	options = jQuery.extend({
		swfpath: "/js/clipboard.swf",
		debug: false
	}, options);
	swfpath = options.swfpath;
	debugging = options.debug;
	
	// Run immediately if IE method available
	if ( iecopydetect() ){
		$.clipboard.method = 'ie';
		debug( "jQuery.clipboard: OK. Initialized and ready to copy using native IE method." );
		return f();
	}
	
	// Run immediately if Flash 8 is available and loaded
	if ( $.clipboardReady.done ){
		return f();
	}
	
	// If we've already added a function
	if ( $.clipboardReady.timer ){
		
		// Add to the existing array
		$.clipboardReady.ready.push( f );
		
	} else {
		
		// Check for Flash and Flash version
		if ( flashdetect( flashMinVersion ) ){
			
			// Flash detected OK
			
			// Destroy any existing elements
			$( "#jquery_clipboard_swf" ).remove();
			$( "#jquery_clipboard_div" ).remove();
			
			// Create the wrapper div
			var div;
			div = $( "<div/>" )
				.attr( "id", "jquery_clipboard_div" )
				.css( "width", "0" )
				.css( "height", "0" )
				.appendTo( "body" )
				.html( "" );
			// Create the helper swf
			// Use embed method since we're only targeting non-IE browsers anyway
			var swf;
			swf = $( '<embed id="jquery_clipboard_swf" name="jquery_clipboard_swf" src="'+swfpath+'" type="application/x-shockwave-flash"></embed>' );
			$( swf )
				.css( "width", "0" )
				.css( "height", "0" )
				.appendTo( div );
			
			// Init the functions array
			$.clipboardReady.ready = [ f ];
			
			// Continually check to see if the swf is loaded
			$.clipboardReady.timer = setInterval( swfready, 100 );
			
			// Debug
			debug( "jQuery.clipboard: INFO. Waiting for Flash object to become ready. Detected Flash version: "+flashDetectedVersion[0]+"."+flashDetectedVersion[1]+"."+flashDetectedVersion[2] );
			
		} else if ( flashDetectedVersion[0] === 0 ){
			
			// Flash not detected
			debug( "jQuery.clipboard: ERROR. Flash plugin not detected." );
			return false;
			
		} else {
			
			// Flash version too old
			debug( "jQuery.clipboard: ERROR. Minimum Flash version: "+flashMinVersion[0]+"."+flashMinVersion[1]+"."+flashMinVersion[2]+" Detected Flash version: "+flashDetectedVersion[0]+"."+flashDetectedVersion[1]+"."+flashDetectedVersion[2] );
			return false;
			
		}
	}
};

$.clipboard = function( text ){
	
	// Check arguments
	if ( arguments.length < 1 || typeof text != "string" ){
		// First argument is not text
		debug( "jQuery.clipboard: ERROR. Nothing to copy. You must specify a string as the first parameter." );
		return false;
	}
	
	// Looks good, perform copy
	
	// Internet Explorer's built-in method
	if ( $.clipboard.method == 'ie' ){
		try {
			window.clipboardData.setData( "Text", text );
			debug( "jQuery.clipboard: OK. Copied "+text.length+" bytes to clipboard using native IE method." );
			return true;
		} catch (e) {
			debug( "jQuery.clipboard: ERROR. Tried to copy using native IE method but an unknown error occurred." );
			return false;
		}
	}
	
	// Flash method
	if ( $.clipboard.method == 'flash'){
		var swf = $("#jquery_clipboard_swf:first");
		var swfdom = $(swf).get(0);
		if ( swfdom.jqueryClipboardCopy( text ) ){
			// Copy succeeded
			debug( "jQuery.clipboard: OK. Copied "+text.length+" bytes to clipboard using Flash method." );
			return true;
		} else {
			// Copy failed
			debug( "jQuery.clipboard: ERROR. Tried to copy using Flash method but an unknown error occurred." );
			return false;
		}
	}
	
	// Uh-oh. Somebody called $.clipboard() without $.clipboardReady()
	debug( "jQuery.clipboard: ERROR. You must use $.clipboardReady() in conjunction with $.clipboard()." );
	return false;
	
};

})(jQuery); /* jQuery.clipboard */

