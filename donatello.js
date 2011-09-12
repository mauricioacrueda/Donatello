/**
* Donatello - A pure CSS vector drawing library.
*
* Provided under the MIT license.
* See LICENSE file for full text of the license.
* Copyright 2011 Dan Newcome.
*/


/**
* Donatello objects are used to represent shapes drawn
* in the scene. The scene consists of a tree of these.
*
* id - id string of an existing DOM element or a reference
* to the DOM element itself.
* x/y, w/h - position and size
*/
function Donatello( id, x, y, w, h ) {
	// TODO fix hacky initialization
	// Donatello.setTransform();
	// if( id != null ) Donatello.setTransform();

	/** 
	* Translation between drawing terminology and CSS property 
	* names.
	*/
	this.attrMap = {
		fill: 'backgroundColor',
		stroke: 'borderColor',
		'stroke-style': 'borderStyle',
		// todo: we ignore stroke width becuase it requires
		// the object to be recalculated
		'stroke-width': null,
		'x': null,
		'y': null,
		'w': null,
		'h': null,
		'r': 'borderRadius',
		'type': null,
		'children': null,
		'transform': Donatello.getTransform()
	}

	// some attributes we want to read a different css value
	// than we use for writing. e.g. top/offsetTop
	this.attrReverseMap = Donatello.merge( {
		'x': 'top',
		'y': 'left',
		'w': 'width',
		'h': 'height'
	}, this.attrMap );

	if( typeof id == 'string' ) {
		var el = document.getElementById( id );
		Donatello.createElement( x, y, w, h, el );
		this.dom = el;
	}
	else if( id != null ) {
		this.dom = id;
	}
}

/**
 * Utility function to merge properties of 
 * two objects. Used with map objects.
 */
Donatello.merge = function( src, dst ) {
	for( var prop in src ) {
		dst[prop] = src[prop];
	}
	return dst;
};

/*
* Paper is a Donatello object that serves as a container 
* and has no visible attributes. Essentially a factory
* method wrapping Donatello constructor for now.
*  todo; thinking about renaming this to plane 
*/
Donatello.paper = function( id, x, y, z, w, h ) {
	return new Donatello( id, x, y, z, w, h );
}

/** 
* create drawing graph declaratively
* par - parent Donatello object
* a - attribute object 
* Only works for rect at this stage.
*/
Donatello.decl = function( par, a ) {
	var don;
	if( a.type == 'rect' ) {
		don = par.rect( a.x, a.y, a.w, a.h, a );
	}
	for( var i=0; i < a.children.length; i++ ) {
		Donatello.decl( don, a.children[i] );	
	}
}

/**
 * Detect css transform attribute for browser compatibility.
 * Must be called after DOM is loaded since we detect
 * features by looking at DOM properties.
 */
Donatello.getTransform = function() {
	var transform;
	var testEl = document.createElement('div');
	if( Donatello.transform == undefined ) {
		// css spec, no browser supports this yet
		if( typeof testEl.style.transform != 'undefined' ) {
			transform = 'transform';
		} 
		else if( typeof testEl.style.webkitTransform != 'undefined' ) {
			transform = 'webkitTransform';
		} 
		else if( typeof testEl.style.MozTransform != 'undefined' ) {
			transform = 'MozTransform';
		} 
		else if( typeof testEl.style.msTransform != 'undefined' ) {
			transform = 'msTransform';
		} 
		else if( typeof testEl.style.OTransform != 'undefined' ) {
			transform = 'OTransform';
		} 
		// transforms not supported
		else { transform = null }
		console.log( 'css transform: ' + transform );
		Donatello.transform = transform;
	}
	else {
		transform = Donatello.transform;
	}	
	// also return transform - used in attr mapping
	// part of hacky init that should be fixed somehow
	return transform;
}


/**
* Internal function for creating the appropriate 
* linear gradient function
*/
Donatello.createLinearGradient = function( deg, color1, color2 ) {
	// we round angles down to multiples of 45deg
	deg = Math.floor(deg/45);
	// default to centered vertical gradient
	var webkitLine = "center top, center bottom";
	switch( deg ) {
		case 0:
			webkitLine = "left center, right center";
			break;
		case 1:
			webkitLine = "left bottom, right top";
			break;
		case 2:
			webkitLine = "center bottom, center top";
			break;
		case 3:
			webkitLine = "right bottom, left top";
			break;
		case 4:
			webkitLine = "right center, left center";
			break;
		case 5:
			webkitLine = "right top, left bottom";
			break;
		case 6:
			webkitLine = "center top, center bottom";
			break;
		case 7:
			webkitLine = "left top, right bottom";
			break;
		case 8:
			webkitLine = "left center, right center";
			break;
	}
	var retval;
	switch( Donatello.getTransform() ) {
		case 'MozTransform':
			retval = '-moz-linear-gradient(' + 
				deg*45 + 'deg,' + color1 + ', ' + color2 + ')';
			break;
		case 'webkitTransform':
			retval = '-webkit-gradient(linear, ' + webkitLine + 
				', from(' + color1 + '), to(' + color2 + '))'; 
			break;
		case 'msTransform':
			// note that filter: attribute must be set rather than background:
			// in IE gradient type is either 0 (top to bottom) or 1 (left to right)
			var gtype = Math.floor(deg%4/2)
			retval = 'progid:DXImageTransform.Microsoft.gradient(GradientType=' + 
				gtype + ', startColorstr="' + 
				color1 + '", endColorstr="' + color2 + '")'; 
			break;
		case 'OTransform':
			retval = '-o-linear-gradient(' + deg*45 +'deg,' + 
				color1 + ',' + color2 + ')';
			break;
	}
	console.log( 'gradient: ' + retval );
	return retval;
}


/**
* Internal function for creating the appropriate 
* radial gradient function
* TODO: this is incomplete - need to decide on what level of
* support to provide for radial gradients
*/
Donatello.createRadialGradient = function( deg, color1, color2 ) {
	var retval;
	switch( Donatello.getTransform() ) {
		case 'MozTransform':
			retval = '-moz-radial-gradient(' + deg + 'deg,' + 
				color1 + ', ' + color2 + ')';
			break;
		default:
			throw 'Gradients not implemented for ' + Donatello.getTransform();
	}
	console.log( 'gradient: ' + retval );
	return retval;
}

/**
 * Transformation methods that apply to all shapes
 */

Donatello.prototype.rotate = function( deg ) {
	// note that we add the rotation to the existing transform. 
	// not sure if this will cause problems at any point - we may 
	// need some more sophisticated managment of the list of applied
	// transforms later on down the road.
	this.dom.style[ Donatello.getTransform() ] += 'rotate(' + deg + 'deg)';
}

Donatello.prototype.clear = function() {
	while( this.dom.hasChildNodes() ) {
		this.dom.removeChild( this.dom.lastChild );
	}
}

Donatello.prototype['delete'] = function() {
	this.dom.parentNode.removeChild( this.dom );
}

Donatello.prototype.node = function() {
	return this.dom;
}

/**
* Time given in seconds
* Easing is always in-out
*/
Donatello.prototype.animate = function( time, attrs ) {
	// TODO: only works in firefox right now
	var me = this;
	this.attr( {'MozTransition':'all ' + time + 's ease-in 0s'});
	// in order for the animation to work, we have to set
	// moz-transition first, then later in setTimout set the props
	setTimeout( function() { me.attr( attrs ) }, 0 );
	return this.dom;
}

/*
* Stop the current animation
*/
Donatello.prototype.stop = function( time, attrs ) {
	// TODO: this doesn't work how it should
	this.attr( {'MozTransition':''});
}



/**
* Get a list of all of the attributes
* according to attribut map
*/
Donatello.prototype.attrs = function( obj ) {
	var retval = {};
	var mapping = this.attrReverseMap;
	for( attr in mapping ) {
		retval[attr] = this.dom.style[mapping[attr]];
	}
	return retval;
}

/**
* Setting attributes looks for mapped attributes first, then
* passes attribute through as a CSS attribute.
*/
Donatello.prototype.attr = function( obj ) {
	var mapping = this.attrMap;
	for( attr in obj ) {
		if( mapping[attr] != null ){
			if( attr == 'r' || attr == 'stroke-width' ) {
				// special case to add 'px' to radius specification
				// TODO: see about simplifying this stuff
				this.dom.style[mapping[attr]] = obj[attr] + 'px';
			}
			else {
				this.dom.style[mapping[attr]] = obj[attr];
			}
		} 
		else if( 
			// ignore attributes that we ordinarily set using
			// positional arguments.
			attr != 'stroke-width' && 
			attr != 'x' && 
			attr != 'y' && 
			attr != 'w' && 
			attr != 'h' && 
			// children and type are used for declarative instantiation
			attr != 'type' && 
			attr != 'children' 
		) {
			this.dom.style[attr] = obj[attr];
		}
	}
	return this;
}


/**
* Drawing methods
*/

/**
 * Draw a circle
 * center coordinates, radius, attributes 
 */
Donatello.prototype.circle = function( x, y, r, a ) {
	a = Donatello.attrDefaults( a );
	var s = a['stroke-width'];
	var c = a['stroke'];
	var f = a['fill'];
	var style = a['stroke-style'];
	var el = Donatello.createElement( x-r-s, y-r-s, 2*r, 2*r, 'div');
	el.style.borderRadius = r + s + 'px';
	el.style.borderStyle = style;
	el.style.borderColor = c;
	el.style.backgroundColor = f;
	el.style.borderWidth = s  + 'px';

	this.dom.appendChild( el );
	var don = new Donatello( el ); 
	don.attr( a );
	return don;
}

/**
 * Ellipse is similar to circle, should consolidate
 * xy position, xy radius, stroke width
 */
Donatello.prototype.ellipse = function( x, y, rx, ry, a ) {
	a = Donatello.attrDefaults( a );
	var s = a['stroke-width'];
	var c = a['stroke'];
	var f = a['fill'];
	var style = a['stroke-style'];

	var el = Donatello.createElement( x-rx-s, y-ry-s, 2*rx, 2*ry, 'div');
	el.style.borderRadius = ( rx + s ) + 'px / ' + ( ry + s ) + 'px';
	el.style.borderStyle = style;
	el.style.borderColor = c;
	el.style.borderWidth = s + 'px';
	el.style.backgroundColor = f;
	
	this.dom.appendChild( el );
	var don = new Donatello( el ); 
	don.attr( a );
	return don; 
}

/**
*  Draw a rectangular region to the scene.
*/
Donatello.prototype.rect = function( x, y, w, h, a ) {
	return this.pgram( x, y, w, h, null, a );
}

/**
 * generalized parallelogram, used by rect.
 */
Donatello.prototype.pgram = function( x, y, dx, dy, skew, a ) {
	a = Donatello.attrDefaults( a );
	var el = Donatello.createElement( x, y, dx, dy, 'div');

	el.style.borderWidth = a['stroke-width'] + 'px';

	if( skew != null ) {
		el.style[ Donatello.getTransform() ] += 'skew(' + skew + 'deg)';
	}
	this.dom.appendChild( el );
	var don = new Donatello( el );
	don.attr( a );
	return don;
}

/**
* Draw text to the scene using a <div> tag.
*/
Donatello.prototype.text = function( x, y, str, a ) {
	var el = Donatello.createElement( x, y, null, null, 'div');
	el.innerHTML = str;
	this.dom.appendChild( el );
	var don = new Donatello( el );
	don.attr( a );
	return don;
}

/**
* Draw an image to the scene using an <img> tag.
*/
Donatello.prototype.image = function( x, y, w, h, img, a ) {
	var el = Donatello.createElement( x, y, w, h, 'img');
	el.src = img;
	this.dom.appendChild( el );
	var don = new Donatello( el );
	don.attr( a );
	return don;
}

Donatello.Line = function( parent, x, y, dx, dy, a ) {
	a = Donatello.attrDefaults( a );
	var w = a['stroke-width']; 
	var stroke = w;
	var c = a['stroke'];
	var f = a['fill'];
	var style = a['stroke-style'];

	var len = Math.sqrt(dx*dx + dy*dy );
	var el = document.createElement( 'div' );	
	el.style.position = 'absolute';
	el.style.top = y + 'px';
	el.style.left = x + 'px';

	// width is the line length	
	el.style.width = len + 'px';

	// height is the line width
	el.style.height = '0px';

	// use attribute map modifications to write attributes
	// to the object. This was previously hard coded
	this.attrMap['stroke-width'] = 'borderTopWidth';
	this.attrMap['stroke-style'] = 'borderTopStyle';
	this.attrMap['stroke'] = 'borderTopColor';

/// 

	this.dom = el;
	this.draw( x, y, dx, dy,len,stroke, a );


	// transform origin referenced from border width
	el.style[ Donatello.getTransform() + 'Origin' ] = '0px 0px';

	parent.dom.appendChild( el );

	// applying styles messes up lines, fix this
	this.attr( a );

};
Donatello.Line.prototype = new Donatello( null );
Donatello.Line.prototype.draw = function( x, y, dx, dy, len,stroke, a ) {
	// TODO: get the drawing related stuff out of the constructor
	a = Donatello.attrDefaults( this.attrs() );

	// find the angle
	var rot = Math.asin( Math.abs(dy) / len );
	// convert to degrees
	rot = rot * (180/Math.PI);

	// we handle other orientations by adjusting 
	// rotation according to quadrant 
	if( dx < 0 && dy >= 0 ) {
		rot = 180-rot;
	}
	else if( dx < 0 && dy <  0 ) {
		rot = 180+rot;
	}
	else if( dx >= 0 && dy < 0 ) {
		rot = 360-rot;
	}

	this.dom.style[ Donatello.getTransform() ] = 
		'rotate(' + rot + 'deg) translate(0px, -' + stroke/2 + 'px)';
};

/**
* Draw a straight line.
* dx/dy are offsets from start, w is stroke width
*
* TODO: add end caps - box-radius for rounded,
* borders for diagonal. also maybe linejoin
*/
Donatello.prototype.line = function( x, y, dx, dy, a ) {
	return new Donatello.Line( this, x, y, dx, dy, a );
}

/**
* Internally used  method for creating
* and initializing DOM elements.
* name is either tag name of a dom element
*/
Donatello.createElement = function( x, y, w, h, name ) {
	var el;
	if( typeof name == 'string' ) {
		el = document.createElement( name );
	}
	else {
		el = name;
	}
	el.style.position = 'absolute';
	el.style.top = y + 'px';
	el.style.left = x + 'px';
	el.style.width = w + 'px';
	el.style.height = h + 'px';
	return el;
}

/**
* Set up some reasonable default values if attr array
* is missing or underspecified
*/
Donatello.attrDefaults = function( a ) {
	a = a || {};
	if( !a['stroke-width'] ) a['stroke-width'] = 1;
	if( !a['stroke'] ) a['stroke'] = 'black';
	if( !a['fill'] ) a['fill'] = 'transparent';
	if( !a['stroke-style'] ) a['stroke-style'] = 'solid';
	return a;
};

