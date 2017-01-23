import './polyfills/Element-Matches';

let Instances = new WeakMap();

class Slotter {
	constructor(slot) {
		this.slot = slot;
		this.allow = ''; // Might look at making this work inside a function too
		this.callback = Function.prototype; // noop
	}


	clean() {
		let nodes = this.slot.assignedNodes();
		nodes.forEach(node => {
			let matches = (this.allow.length) ? node.matches(this.allow) : false;
			let test = this.callback(node);

			if (!matches && !test) {
				node.removeAttribute('slot');
			}
		});
	}


	setEvents() {
		this.slot.addEventListener('slotchange', (e) => {
			this.clean();
		});
	}
}

// @Todo Feels like a LOT of logic for allowing two ways of specifying "allow" rules (allow, watch)
export default {
	allow(slot, check) {
		let slotName = slot.getAttribute('name');

		if (!slotName) {
			return;
		}

		let instance = Instances.get(slot);

		if (!instance) {
			instance = new Slotter(slot);
			Instances.set(slot, instance);
		}

		instance.callback = check;
	},

	watch(shadowRoot) {
		let slots = Array.from(shadowRoot.querySelectorAll('slot[name]'));
		slots.forEach(slot => {
			let instance = Instances.get(slot);
			let allowValue = slot.getAttribute('allow');
			let slotName = slot.getAttribute('name');

			if (!slotName) {
				return;
			}

			if (allowValue && !instance) {
				instance = new Slotter(slot);
				Instances.set(slot, instance);
				instance.allow = allowValue;
			}
			else if (allowValue && instance) {
				instance.allow = allowValue;
			}

			if (instance) {
				instance.clean();
				instance.setEvents();
			}
		});
	}
}
