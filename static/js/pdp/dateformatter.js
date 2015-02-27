/*
****	Adding new method to Date prototype.
****	With these methods we can have the Date is any string format defined by user.
*/
if(!Date.toFormattedString){
	Date.prototype.toFormattedString = function (f){
		var nm = this.getMonthName();
		var nd = this.getDayName();
	
	if(typeof this !== 'undefined' && typeof nm !== 'undefined' && typeof nd !== 'undefined'){
		f = f.replace(/yyyy/g, this.getFullYear());
		f = f.replace(/yy/g, String(this.getFullYear()).substr(2,2));
		f = f.replace(/MMM/g, nm.substr(0,3).toUpperCase());
		f = f.replace(/Mmm/g, nm.substr(0,3));
		f = f.replace(/MM\*/g, nm.toUpperCase());
		f = f.replace(/Mm\*/g, nm);
		f = f.replace(/mm/g, String(this.getMonth()+1).padLeft('0',2));
		f = f.replace(/DDD/g, nd.substr(0,3).toUpperCase());
		f = f.replace(/Ddd/g, nd.substr(0,3));
		f = f.replace(/DD\*/g, nd.toUpperCase());
		f = f.replace(/Dd\*/g, nd);
		f = f.replace(/dd/g, String(this.getDate()).padLeft('0',2));
		f = f.replace(/d\*/g, this.getDate());
		return f;
	} else {
		return "";
	}
	};
}
			
if(!Date.getMonthName){			
	Date.prototype.getMonthName = function (){
		try{
		switch(this.getMonth()){
			case 0: return 'January';case 1: return 'February';case 2: return 'March';case 3: return 'April';case 4: return 'May';case 5: return 'June';case 6: return 'July';case 7: return 'August';case 8: return 'September';case 9: return 'October';case 10: return 'November';case 11: return 'December'; default: '';
		}
		} catch(e) {
			return '';
		}
	};
}

if(!Date.getDayName){
	Date.prototype.getDayName = function (){
		try{
		switch(this.getDay()){
			case 0: return 'Sunday';case 1: return 'Monday';case 2: return 'Tuesday';case 3: return 'Wednesday';case 4: return 'Thursday';case 5: return 'Friday';case 6: return 'Saturday';
		}
		} catch(e) {
			return '';
		}
	}
}

if(!String.getDateFromString){
	String.prototype.getDateFromString = function(splitter){
		try{
		var ddarr = this.split(splitter);
		return (new Date(ddarr[1]+' '+ddarr[0]));
		} catch(e){
		return '';
		}
	}
}

if(!Number.SingleToDoubleDigit){
	Number.prototype.SingleToDoubleDigit = function(){
		var n = this;
		return n > 9 ? "" + n: "0" + n;
	}
}

if(!String.padLeft){
	String.prototype.padLeft = function (value, size){
		var x = this;
		while (x.length < size) {x = value + x;}
		return x;
	}
}	

if (!String.contains) {
    String.prototype.contains = function (str, startIndex) {
        "use strict";
        return -1 !== String.prototype.indexOf.call(this, str, startIndex);
    };
}	

if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisArg */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t))
          res.push(val);
      }
    }

    return res;
  };
}