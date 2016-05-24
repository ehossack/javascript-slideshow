/*

	A collection of utilities from my JavaScript development that I find useful,
	and end up using over and over again

*/

/**
 * @since 05/23/16
 * @source http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
 */
if (!String.prototype.format) {
	Object.defineProperty(String.prototype, 'format', {
		value: function() {
		    var args = arguments;
		    return this.replace(/{(\d+)}/g, function(match, number) { 
		     	return 	(typeof args[number] !== 'undefined') ?
		      			args[number] : // show number if nothing exists
		      			match;
		    });
		},
		writable: true
	});
}

/**
 * @since 05/23/16
 */
if(!HTMLElement.prototype.hideElement) {
	// like a jQuery.hide(), but just sets display to none, and saves prev if existing
	Object.defineProperty(HTMLElement.prototype, 'hideElement', {
		value: function() {
			if(this.style.display !== '') {
				if(this.style.display === 'none') { return; }

				if(HTMLElement.dataSet) {
					this.dataSet.displayOriginal = this.style.display;
				}
				else this.setAttribute('data-display-original', this.style.display);
			}

			this.style.display = 'none';
		},
		writable: true
	});	
}
if(!HTMLElement.prototype.showElement) {
	// like a jQuery.show()
	Object.defineProperty(HTMLElement.prototype, 'showElement', {
		value: function() {
			if(this.style.display === 'none') {

				this.style.display = (HTMLElement.dataSet ? 
										this.dataSet.displayOriginal :
										this.getAttribute('data-display-original')) ||
									  '';
			}
		},
		writable: true
	});	
}
if(!HTMLElement.prototype.isHiddenElement) {
	Object.defineProperty(HTMLElement.prototype, 'isHiddenElement', {
		value: function() {
			return (this.style.display === 'none') ||
					(window.getComputedStyle(this) === 'none') || // kinda slow
					false;
		},
		writable: true
	});
}
if(!HTMLElement.prototype.toggleElement) {
	// like a jQuery.toggle()
	Object.defineProperty(HTMLElement.prototype, 'toggleElement', {
		value: function() {
		    if(this.isHiddenElement()) {
		    	this.showElement();
		    }
		    else {
		    	this.hideElement();
		    }
		 },
		 writable: true
	});
}


/**
 * @source https://plainjs.com/javascript/traversing/get-siblings-of-an-element-40/
 * @since 05/23/16
 * @param {HTMLElement} el
 * @param {Function} filter [optional]
 * @return {Array<HTMLElement>}
 */
function getNextSiblings(el, filter) {
    var siblings = [];
    while (el= el.nextElementSibling) { if (!filter || filter(el)) siblings.push(el); }
    return siblings;
}
/**
 * @source https://plainjs.com/javascript/traversing/get-siblings-of-an-element-40/
 * @since 05/23/16
 * @param {HTMLElement} el
 * @param {Function} filter [optional]
 * @return {Array<HTMLElement>}
 */
function getPreviousSiblings(el, filter) {
    var siblings = [];
    while (el = el.previousElementSibling) { if (!filter || filter(el)) siblings.push(el); }
    return siblings;
}
