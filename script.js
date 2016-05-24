
// no jQuery please
$.noConflict();

(function init($) {

"use strict";

var mainElement = document.getElementById('slide-container'),
	slidePane = document.getElementById('slide-contents'),
	logElement = null,
	config,
	javascript_text, // for running the codez
	buster = Math.floor(Math.random() * 12345),
	slides = ['<h3 class="eop">End of Presentation</h3>'];

var tmp_current_slide = 1;

$.get('slides/info.json?cb=' + buster, function(data) {
    config = JSON.parse(data);
 })
.always(function setupPage() {

	if(config) {
		if(config.title) {	document.querySelector('title').innerHTML = config.title; }
		if(config.runBefore) {
			// woohoo bad practices
			eval(config.runBefore);
		}
		if(config.slidejs) {
			var script = document.createElement('script');
			  	script.type = 'text/javascript'; 
				script.src = 'slides/slides.js';
				document.getElementsByTagName('head')[0].appendChild(script);
		}
	}

	$.ajax({
		url: 'slides/1.md?cb=' + buster,
		dataType: 'text',
		success: function (textContent) {
			slides.push(textContent);
			initSlide(1);
		},
	 	error: function(data) {
	 		slidePane.innerHTML = '<em>Unable to load presentation</em>';
	 	}
	 });

	var no_four_oh_four = true,
		currentSlide = 1;

	// init the check loop
	retrieveSlides();

	// Prevent window scroll on space
	window.onkeydown = function(e) {
	    if(e.keyCode == 32 && e.target == document.body) {
	        e.preventDefault();
	        return false;
	    }
	};

	/**
	 * Keep looking on the server to try to retrieve as many slides as we can
	 * @void
	 */
	function retrieveSlides() {
		currentSlide++;

		if(config.slideCount && currentSlide > config.slideCount) {
			createPagination(--currentSlide);
			return; // done
		}

		$.ajax({
			url: 'slides/' + (currentSlide) + '.md?cb=' + buster,
			dataType: 'text',
			success: function (textContent) {
				slides[currentSlide] = textContent;
				retrieveSlides();
			},
		 	error: function () {
		 		console.clear();
		 		createPagination(--currentSlide);
		 	}
		 });
	}

	/**
	 * Set up the pagination and controls for the page
	 * @param {integer} slide_count_plus_one
	 */
	function createPagination(slide_count) {

		var add_ellipsis = slide_count > 6,
			paginationElement = mainElement.querySelector('#slide-controls .pagination'),
			nextElement = mainElement.querySelector('#slide-controls li.pagination-next'),
			prevElement = mainElement.querySelector('#slide-controls li.pagination-previous'),
			firstPageElement = paginationElement.querySelector('li.current'), // at the start
			ellipsisElement,
			tmp, hide_me = false;

		function createAnchor(num) {
			var a = document.createElement("a");
			a.appendChild(document.createTextNode("" + num));
			// accessibility
			a.setAttribute('aria-label', "Page " + num);

			return a;
		}

		for(var i = 2; i <= slide_count; i++) {

			// add elipses for pagination
			if(add_ellipsis && i === 5) {
				ellipsisElement = document.createElement("li");
				ellipsisElement.className = "ellipsis";
				paginationElement.insertBefore(ellipsisElement, nextElement.previousElementSibling);
				hide_me = true;
			}
			else if(add_ellipsis && i > 5) {
				hide_me = ((slide_count - i) >= 2);
			}
			else {
				hide_me = false;
			}

			tmp = document.createElement("li");
			tmp.classList.add('page-num')
			tmp.appendChild(createAnchor(i));

			// if it's hidden, stagnate before ellipsis
			if(hide_me) {
				tmp.hideElement();
				paginationElement.insertBefore(tmp, ellipsisElement);
			}
			else {
				paginationElement.insertBefore(tmp, nextElement.previousElementSibling);
			}
		}

		nextElement.onclick = advance.bind(null, 'forward');
		prevElement.onclick = advance.bind(null, 'reverse');

		/**
		 * Bind down also the left and right arrow key for kicks
		 */
		document.addEventListener('keyup', function (event) {
			var key = (event.keyCode || event.which),
				codes = {
					'ENTER': 13,
					'SPACE': 32,
					'LEFT': 37,
					'RIGHT': 39,
					'BACKTICK': 192
				};

			if( key == codes.RIGHT ) {
				// advance if there's a current
				// document.querySelector('#slide-controls li.current') && advance('forward'); 
				advance('forward');
			}
			else if( key == codes.LEFT ) {
				// reverse if we can
				// !mainElement.querySelector('#slide-controls li.pagination-previous').classList.contains('disabled')
				// && advance('reverse'); 
				advance('reverse');
			}
			else if( key == codes.ENTER ) {
				var btn = document.querySelector('#slide-controls button.js-controls');
				if(!btn.isHiddenElement()) {
					btn.click(btn);
				}
			}
			else if( key == codes.SPACE ) {

				if(document.querySelectorAll('.eop').length === 0) { return; }
				restartPresentation();
			}
			else if( key == codes.BACKTICK ) {
				console.clear();
			}
		});

		/** 
		 * Advance in the given direction, and hit the end slide if going forward too far
		 * @param {string} dir - 'forward','reverse'
		 * @param {Object} event
		 * @void
		 */
		function advance(dir, e) {
			// var current = mainElement.querySelector('#slide-controls li.current'),
			// 	next = (dir === 'forward' ? current.nextElementSibling : current.previousElementSibling),
			// 	curr_num = parseInt(current.innerHTML, 10),
			var curr_num = tmp_current_slide,
				next_num = (dir === 'forward' ? curr_num + 1 : curr_num - 1);

			if(next_num < 0) next_num = slides.length -1;

			// // did we accidentally get to the ellipsis
			// if(next.classList.contains('ellipsis')) {
			// 	next = (dir === 'forward' ? next.nextElementSibling : next.previousElementSibling);
			// }
			
			// // is it a hidden element
			// if(next.style.display === 'none') {
			// 	// first get all the page number elements
			// 	var all_nums = mainElement.querySelectorAll('li.page-num');

			// 	if(dir === 'forward') {
			// 		// hide the first-most one
			// 		for (var i = 0; i < all_nums.length; i++) {
			// 			if(all_nums[i].isHiddenElement()) { continue; }
			// 			else {
			// 				// if first time, add ellipsis
			// 				if(all_nums[i] === firstPageElement) {
			// 					mainElement.querySelector('li.ellipsis-default').showElement();
			// 				}

			// 				all_nums[i].hideElement();
			// 				break;
			// 			}
			// 		}
			// 	}
			// 	else {
			// 		for (var len = i = all_nums.length -1; i >= 0; i--) {
			// 			if(all_nums[i].isHiddenElement()) { continue; }
			// 			else {
			// 				// if first time, add ellipsis
			// 				if(i === len) {
			// 					mainElement.querySelectorAll('li.ellipsis-default')[1].showElement();
			// 				}

			// 				all_nums[i].hideElement();
			// 				break;
			// 			}
			// 		}
			// 	}
				

			// 	// show it
			// 	next.showElement();

			// 	// evaluate if we need to hide the ellipsis
			// 	if(next.nextElementSibling === ellipsisElement) {
			// 		ellipsisElement.hideElement();
			// 	}
			// }

			// // de-highlight the current number
			// current.classList.remove('current');
			// current.innerHTML = '';
			// current.appendChild(createAnchor(curr_num));


			// // if we're two from the end, don't continue
			// var cnt = 0;
			// tmp = getNextSiblings(next, function() {
			// 	return cnt++ < 2;
			// });
			// if(tmp[1].classList.contains('ellipsis-default')) {
			// 	tmp[0].showElement();
			// 	tmp[1].hideElement();
			// }

			// If at the end, say so, otherwise wrap around
			if(dir === 'forward' && next_num === slides.length) {//&& next === nextElement) {
				endPresentation();
				tmp_current_slide = 0;
			}
			else {
				// next.innerHTML = next.querySelector('a').textContent;
				// next.classList.add('current');
				// next.setAttribute('aria-label', 'Page ' + next_num);

				initSlide(next_num);
				tmp_current_slide = next_num;
			}
		};

		/** 
		 * Simple function to make the display black and end things
		 * @void
		 */
		function endPresentation() {
			initSlide(0);
			// slidePane.style.background = 'black';
			paginationElement.hideElement();
			prevElement.classList.add('disabled');
		}

		/** 
		 * And of course the opposite
		 */
		function restartPresentation() {
			paginationElement.showElement();
			slidePane.style.background = '';
			firstPageElement.innerHTML = '' + 1;
			firstPageElement.classList.add('current');
			firstPageElement.setAttribute('aria-label', 'Page 1');

			tmp_current_slide = 1;

			initSlide(1);
		}

		/**
		 * Add a listener for clicking on the page number directly 
		 */
		paginationElement.addEventListener('click', function(event) {
			var page_num;

			if(event.target.tagName !== 'A') { return; }

			page_num = parseInt(event.target.textContent, 10);

			if(isNaN(page_num)) { return; }

			// similar to above
			var current	= document.querySelector('#slide-controls li.current'),
				next = event.target.parentElement,
				curr_num = parseInt(current.innerHTML, 10);

			current.classList.remove('current');
			current.innerHTML = '';
			current.appendChild(createAnchor(curr_num));

			next.innerHTML = "" + page_num;
			next.classList.add('current');
			next.setAttribute('aria-label', 'Page ' + (curr_num + 1));

			initSlide(page_num);
		});

		/**
		 * Add an event to restart everything 
		 */
		slidePane.addEventListener('click', function (event) {
			if(document.querySelectorAll('.eop').length === 0) { return; }
			restartPresentation();
		});
	}
});

document.querySelector('#slide-controls button.js-controls').onclick = function (event) {

	var script = document.createElement('script');
  	script.type = 'text/javascript'; 
	script.innerHTML = javascript_text;
	document.getElementsByTagName('head')[0].appendChild(script);

	setTimeout(function () {
		script.parentElement.removeChild(script);
	}, 500)	;

	if(logElement) { logElement.style.display = 'block'; }
};

/**
 * Do the main setup for coverting the markdown
 * and highlighting the code snippets
 * @param {integer} page_num - to retrieve raw markdown
 * @void
 */
function initSlide(page_num) {

	var content = slides[page_num];

	// set text to empty
	javascript_text = '';

	// render
	slidePane.innerHTML = marked(content);

	// grab and highlight all blocks
	var code_blocks = document.querySelectorAll('pre > code');

	for (var i = 0, len = code_blocks.length; i < len; i++) {
		if(code_blocks[i].className.indexOf('javascript')) {
			javascript_text += code_blocks[i].textContent;
		}
		hljs.highlightBlock(code_blocks[i]);
	}

	// show run & output section if relevant
	var log_divs = document.querySelectorAll('.output'),
		control_blocks = document.querySelectorAll('.js-controls');

	// look for the id
	if(javascript_text.length > 0) {

		// invoke the function in it's own scope
		javascript_text = "(function sample() {\n" +
						  (config.logDividers ? 
						  	"console.log(' ----- Slide {0} -----');\n".format(page_num) :
						  	'') +
							javascript_text +
						  "})();"

		// on screen logging?
		if(config.showLog) {

			// has it been initialized?
			if(logElement === null) {
				// set the id, add the script
				log_divs[0].id = 'console-log-div';

				// add the script
				var script = document.createElement('script');
			  	script.type = 'text/javascript'; 
				script.src = 'console-log-div.js';
				document.getElementsByTagName('head')[0].appendChild(script);

				logElement = log_divs[0];
			}
			else {
				log_divs[0].appendChild(logElement);
				document.getElementById('console-log-text').innerHTML = '';
			}
		}

		for (var i = control_blocks.length - 1; i >= 0; i--) {
			control_blocks[i].showElement();
		}
	}
	else {
		for (var i = control_blocks.length - 1; i >= 0; i--) {
			control_blocks[i].hideElement();
		}	
	}

	// hide the div if it exists
	if(logElement) { logElement.style.display = "none"; }


	/* 	Pagination  */
	var next_button = document.querySelector('#slide-controls li.pagination-next'),
		prev_button = document.querySelector('#slide-controls li.pagination-previous');

	if(page_num === 1) {
		// steps to disable a page, preserving accessibility
		prev_button.classList.add('disabled');
		prev_button.innerHTML = prev_button.textContent;
		prev_button.setAttribute('aria-label', 'Previous page');
	}
	else {
		// append the anchor for events, preserve aria-label
		var tmp = document.createElement('a');
		tmp.innerHTML = prev_button.textContent;

		prev_button.classList.remove('disabled');
		prev_button.innerHTML = '';
		tmp.setAttribute('aria-label', 'Previous page');
		prev_button.appendChild(tmp);
	}

	if(page_num === slides.length) {
		next_button.classList.add('disabled');
		next_button.innerHTML = next_button.textContent;
		// next_button.removeChild(next_button.querySelector('a'));
		next_button.setAttribute('aria-label', 'Next page');
	}
	else {
		var tmp = document.createElement('a');
		tmp.innerHTML = next_button.textContent;

		next_button.classList.remove('disabled');	
		next_button.innerHTML = '';
		tmp.setAttribute('aria-label', 'Next page');
		next_button.appendChild(tmp);
	}
}

})(jQuery);
