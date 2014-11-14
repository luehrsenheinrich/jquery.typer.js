(function($){

	spanWithColor = function(color, backgroundColor) {
		if (color === 'rgba(0, 0, 0, 0)') {
		  color = 'rgb(255, 255, 255)';
		}

		return $('<span></span>')
		  .css('color', color)
		  .css('background-color', backgroundColor);
	};

	isNumber = function (n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	};

	/**
	 * Clear the saved data so we can start again
	 *
	 * @param {object} $e The jQuery object of the typer element
	 */
	clearData = function ($e) {
		$e.removeData([
			'typePosition',
			'highlightPosition',
			'leftStop',
			'rightStop',
			'primaryColor',
			'backgroundColor',
			'text',
			'typing',
		]);
	};

	/**
	 * The function, that handles the actual typing
	 *
	 * @param {object} $e The jQuery object of the typer element.
	 */
	type = function ($e) {
		var
		text = $e.data('text'),
		oldLeft = $e.data('oldLeft'),
		oldRight = $e.data('oldRight');


		if (!text || text.length === 0) {
		clearData($e);
		return;
		}


		$e.text(
			oldLeft +
			text.charAt(0) +
			oldRight
		).data({
			oldLeft: oldLeft + text.charAt(0),
			text: text.substring(1)
		});

		// $e.text($e.text() + text.substring(position, position + 1));

		// $e.data('typePosition', position + 1);

		setTimeout(function () {
			type($e);
		}, $e.data('typerOptions').typeSpeed);
	};

	/**
 	 * Clears the text, after it has been highlighted
     *
	 * @param {object} $e The jQuery object of the typer element.
	 */
	clearText = function ($e) {
		$e.find('span').remove();

		setTimeout(function () {
		  type($e);
		},  $e.data('typerOptions').typeDelay);
	};
	/**
	 * Highlights the text
	 *
	 * @param {object} $e The jQuery object of the typer element.
	 */
	highlight = function ($e) {
		var
		  position = $e.data('highlightPosition'),
		  leftText,
		  highlightedText,
		  rightText;

		if (!isNumber(position)) {
		  position = $e.data('rightStop') + 1;
		}

		if (position <= $e.data('leftStop')) {
		  setTimeout(function () {
		    clearText($e);
		  }, $e.data('typerOptions').clearDelay);
		  return;
		}

		leftText = $e.text().substring(0, position - 1);
		highlightedText = $e.text().substring(position - 1, $e.data('rightStop') + 1);
		rightText = $e.text().substring($e.data('rightStop') + 1);

		$e.html(leftText)
		  .append(
		    spanWithColor(
		        $e.data('backgroundColor'),
		        $e.data('primaryColor')
		      )
		      .append(highlightedText)
		  )
		  .append(rightText);

		$e.data('highlightPosition', position - 1);

		setTimeout(function () {
		  return highlight($e);
		}, $e.data('typerOptions').highlightInterval);
	};

	/**
	* Read the attributes und perform the typing animation on them
	*
	* @param {object} $e The jQuery object of the typer element.
	*/
	typeWithAttribute = function ($e) {
		var targets;

		if ($e.data('typing')) {
		  return;
		}

		try {
		  targets = JSON.parse($e.attr($e.data('typerOptions').typerDataAttr)).targets;
		} catch (e) {}

		if (typeof targets === "undefined") {
		  targets = $.map($e.attr($e.data('typerOptions').typerDataAttr).split(','), function (e) {
		    return $.trim(e);
		  });
		}

		if($e.data('typerOptions').random){
		    // Just select the target to type randomly
		    $e.typeTo(targets[Math.floor(Math.random()*targets.length)]);
		} else {
			// Determine the next index from the targets array and type that
		    if(typeof($e.data('currentIndex')) == "undefined"){
		      $e.data('currentIndex', 0);
		    } else {
		      $e.data('currentIndex', $e.data('currentIndex') + 1);
		    }

		    if(typeof(targets[$e.data('currentIndex')]) == "undefined"){
		      $e.data('currentIndex', 0);
		    }

		    $e.typeTo(targets[$e.data('currentIndex')], $e.data('typerOptions'));
		}
	};


	/**
     * Bootstrap the $el.typer() function
     */
    $.fn.typer = function( options ) {
		var $elements = $(this);
		var opts = $.extend( {}, $.fn.typer.defaults, options );

		return $elements.each(function () {
		  var $e = $(this);

		  if (typeof $e.attr(opts.typerDataAttr) === "undefined") {
		    return;
		  }

		  $e.data('typerOptions', opts); // Assign the options to the element, so it transports over to the other elements

		  typeWithAttribute($e);
		  setInterval(function () {
		    typeWithAttribute($e);
		  }, $e.data('typerOptions').typerInterval);

		});
    }

    /**
	 * Bootstrap the $el.typeTo function
	 */
	$.fn.typeTo = function ( newString, options ) {
		 var
	      $e = $(this),
	      currentText = $e.text(),
	      opts = $.extend( {}, $.fn.typer.defaults, options );
	      i = 0,
	      j = 0;

	    if (currentText === newString) {
	      console.log("Our strings are equal, nothing to type");
	      return $e;
	    }

	    if (currentText !== $e.html()) {
	      console.error("Typer does not work on elements with child elements.");
	      return $e;
	    }

	    $e.data('typing', true);
	    $e.data('typerOptions', opts);

		if(!$e.data('typerOptions').wholeWord){
		    while (currentText.charAt(i) === newString.charAt(i)) {
		      i++;
		    }

		    while (currentText.rightChars(j) === newString.rightChars(j)) {
		      j++;
		    }
	    }

	    newString = newString.substring(i, newString.length - j + 1);

	    $e.data({
	      oldLeft: currentText.substring(0, i),
	      oldRight: currentText.rightChars(j - 1),
	      leftStop: i,
	      rightStop: currentText.length - j,
	      primaryColor: $e.css('color'),
	      backgroundColor: $e.css('background-color'),
	      text: newString
	    });

	    highlight($e);

	    return $e;
	}

	// The default settings
	$.fn.typer.defaults = {
		highlightSpeed    : 20,
		typeSpeed         : 100,
		clearDelay        : 500,
		typeDelay         : 200,
		clearOnHighlight  : true,
		typerDataAttr     : 'data-typer-targets',
		typerInterval     : 2000,
		random			: false,
		wholeWord			: false
	}

	String.prototype.rightChars = function(n){
		if (n <= 0) {
			return "";
		}
		else if (n > this.length) {
			return this;
		}
		else {
			return this.substring(this.length, this.length - n);
		}
	};

})(jQuery);