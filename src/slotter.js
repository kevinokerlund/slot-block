import './polyfills/Element-Matches';

function slotHasName(slot) {
	return slot.hasAttribute('name') && slot.getAttribute('name').length;
}

function slotHasSelectRule(slot) {
	return slot.hasAttribute('select') && slot.getAttribute('select').length;
}

class Slotter {
	constructor(shadowRoot) {
		this.shadowRoot = shadowRoot;

		this.slots = [];
		this.defaultSlot = null;
		this.selectNameMap = {};

		this.setVariables();

		this.autoAssign();
	}

	setVariables() {
		this.slots = Array.from(this.shadowRoot.querySelectorAll('slot'));

		this.defaultSlot = this.slots.find(slot => !slotHasName(slot));

		this.selectNameMap = this.slots
			.filter(slotHasName && slotHasSelectRule)
			.reduce((a, b) => {
				let select = b.getAttribute('select');

				if (!a[select]) {
					a[select] = b.getAttribute('name');
				}

				return a;
			}, {});
	}

	autoAssign() {
		[...this.defaultSlot.assignedNodes()]
			.filter(node => node.nodeType === 1 && !node.hasAttribute('no-slot'))
			.forEach(node => {
				Object.keys(this.selectNameMap).some(selector => {
					if (node.matches(selector)) {
						node.setAttribute('slot', this.selectNameMap[selector]);
						return true;
					}
				});
			});
	}
}

export default {
	watch: function (shadowRoot) {
		new Slotter(shadowRoot);
	}
}
