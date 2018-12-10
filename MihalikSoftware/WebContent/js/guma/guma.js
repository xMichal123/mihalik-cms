'use strict';
class Guma {
	constructor() {
		this._scene = new THREE.Scene();
		
		this._renderer = new THREE.CSS3DRenderer();
		this._renderer.setSize( window.innerWidth, window.innerHeight );
		this._renderer.domElement.style.position = 'absolute';
		this._renderer.domElement.style.top = 0;
		this._renderer.domElement.style.zIndex = 0;
        document.body.appendChild( this._renderer.domElement );
        
        window.addEventListener('resize', this._onWindowResize.bind(this), false);
        window.addEventListener('touchend', this._onWindowResize.bind(this), false);
	    
        this.cameraDistance = 2000;
        
        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
        this.camera.position.set(0, 0, this.cameraDistance);
        
        this._pages = [];
        
        this.controls = new GumaControls(this);
        
        animate.bind(this)();

        function animate() {
            requestAnimationFrame(animate.bind(this));
            
            this.controls.update();
            
            this._renderer.render(this._scene, this.camera);
        }
        
        this._onWindowResize();
	}
	
	addPage(content, width, height, x, y, z) {
		let page = new GumaPage(this, content, width, height, x, y, z);
		
		this._scene.add(page);
		this._pages.push(page);
		
		return page;
	}
	
	addPrismPageSet(pageNames, pageContents, pageWidth, pageHeight, x, y, z) {
		let prismPageSet = new PrismPageSet(this, pageNames, pageContents, pageWidth, pageHeight, x, y, z);
		
		for (let page of prismPageSet.pages) {
			this._scene.add(page);
			this._pages.push(page);
		}
		
		return prismPageSet;
	}
	
	_onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
	}
}

class GumaPage extends THREE.CSS3DObject {
	constructor(gumaReference, content, width, height, x, y, z) {
		super(document.createElement('div'));
		
		this._gumaReference = gumaReference;
		
		this.element.innerHTML = content;
		this.element.style.background = 'lightblue';
		//this.element.onclick = function() { alert('yep!') };
		
		this._width = width || 800;
		this._height = height || 600;
		this.position.x = x || 0;
		this.position.y = y || 0;
		this.position.z = z || 0;
		
		this.updateSize();
	}
	
	updateSize() {
        this.element.style.width = this._width + 'px';
        this.element.style.height = this._height + 'px';		
	}
}

class PageSet {
	constructor(gumaReference, x, y, z) {
		this._gumaReference = gumaReference;
		this._x = x || 0;
		this._y = y || 0;
		this._z = z || 0;
	}
}

class PrismPageSet extends PageSet {
	constructor(gumaReference, pageNames, pageContents, pageWidth, pageHeight, x, y, z) {
		super(gumaReference, x, y, z);
		
		this._pages = [];
		this._edges = pageContents.length;
		this._pageWidth = pageWidth || 800;
		this._pageHeight = pageHeight || 600;
		
		this._angle = (this._edges - 2) * Math.PI / this._edges;
		this._rotateAngle = 2 * Math.PI / this._edges;
		this._diameter = this._pageWidth * Math.tan(this._angle / 2);
		this._radius = this._diameter / 2;
		
		let pageActions = [];
		let iterAngle = 0;
		for (let i = 0; i < pageContents.length; i++) {
			let x = this._radius * Math.sin(iterAngle);
			let z = this._radius * Math.cos(iterAngle);
			
			let page = new GumaPage(this._gumaReference, pageContents[i], this._pageWidth, this._pageHeight, this._x + x, this._y + y, this._z + z);
			page.rotation.y = iterAngle;
			pageActions.push(this._pageClick(page.rotation.y));
			page.element.onclick = pageActions[i];
			
			this._pages.push(page);
			
			iterAngle += this._rotateAngle;
		}

		this._menu = new GumaMenu(gumaReference, pageNames, /*pages(),*/ pageActions);
	}
	
	_pageClick(angle) {
		return () => {this._gumaReference.controls.rotateCamera(angle)};
	}
	
	/*_pageClick(index) {
		return () => {this._gumaReference.controls.scrollToPage(index)};
	}*/
	
	get pages() {
		return this._pages;
	}
}

class GumaMenu {
    constructor(gumaReference, texts, actions, x, y, z) {
		this._gumaReference = gumaReference;
		this._items = [];
		this._x = x || 0;
		this._y = y || 0;
		this._z = z || 0;

		for (let i = 0; i < texts.length; i++) {
            this._items.push(new GumaMenuItem(gumaReference, texts[i], actions[i]));
		}
	}
}

class GumaMenuItem extends THREE.CSS3DObject {
	constructor(gumaReference, buttonText, action, x, y, z) {
		super(document.createElement('button'));
		
		this._gumaReference = gumaReference;
		
		this.position.x = x || 0;
		this.position.y = y || 0;
		this.position.z = z || 0;

		this.element.value = buttonText;
		this.element.onclick = action;
	}
}

class GumaControls {
	constructor(gumaReference, rotateSpeed) {
		this._gumaReference = gumaReference;
		this._currentAngle = 0;
		this._moveToAngle = this._currentAngle;
		this.rotateSpeed = rotateSpeed || 0.1;
	}
	
	update() {
		if (this._moveToAngle != this._currentAngle) {
			if (Math.abs(this._moveToAngle - this._currentAngle) <= this.rotateSpeed) {
				this._currentAngle = this._moveToAngle;
			} else {
				let clockWise = false;
				
				if (Math.abs(this._moveToAngle - this._currentAngle) <= Math.PI) {
					clockWise = true;
				}
				
				if (this._moveToAngle < this._currentAngle) {
					clockWise = !clockWise;
				}
				
				this._currentAngle += clockWise ? this.rotateSpeed : -this.rotateSpeed;
				
				this._currentAngle = this._currentAngle < 0
				? this._currentAngle + 2 * Math.PI
						: this._currentAngle >= 2 * Math.PI
						? this._currentAngle - 2 * Math.PI
								: this._currentAngle;
			}
			
	        this._gumaReference.camera.position.set(this._gumaReference.cameraDistance * Math.sin(this._currentAngle), 0, this._gumaReference.cameraDistance * Math.cos(this._currentAngle));
	        this._gumaReference.camera.lookAt(0, 0, 0);
		}
	}
	
	rotateCamera(angle) {
		this._moveToAngle = angle;
	}
}