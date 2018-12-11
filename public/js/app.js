(function(w){
"use strict";
// File /Users/eugenepetrov/reps/uikit_test/src/js/preamble.js

w.Components = {}
// End of /Users/eugenepetrov/reps/uikit_test/src/js/preamble.js
})(window);
(function(w){
"use strict";
// File /Users/eugenepetrov/reps/uikit_test/src/components/popup.js

w.Components['popup-modal'] = {
	template: "<transition name=modal><div class=popup-modal><div class=popup-modal__wrapper @click.stop.self=\"$emit(\'close\')\"><div class=popup-modal__container><div class=popup-modal__header><slot name=header>default header</slot></div><div class=popup-modal__body><slot name=body>default body</slot></div><div class=popup-modal__footer><slot name=footer>default footer <button class=popup-modal__default-button @click=\"$emit(\'close\')\">OK</button></slot></div></div></div></div></transition>"
}

// End of /Users/eugenepetrov/reps/uikit_test/src/components/popup.js
})(window);
(function(w){
"use strict";
// File /Users/eugenepetrov/reps/uikit_test/src/components/text-field.js

w.Components['text-field'] = {
	template: '<div class=text-field :class=\"{\n	\'text-field_error\': validator.$error,\n	\'text-field_has-input\': focus || value\n}\"><div class=disabled-overlay></div><input :value=value @input=updateValue($event.target.value) @focus=\"focus = true\" @blur=\"focus = false\" type=text class=text-field__input id=text-field-field__destination name=destination> <label class=text-field__label for=text-field-field__destination>{{message}}</label></div>',
	props: [
		'label',
		'label-error',
		'value',
		'validator'
	],
	created: function() {
		this.triggerError = _.debounce(_.bind(this.validator.$touch, this), 500)
	},
	data: function() {
		return {
			focus: false
		}
	},
	computed: {
		message: function() {
			if (this.validator.$error) {
				return this.labelError
			} else {
				return this.label
			}
		}
	},
	methods: {
		updateValue: function(value) {
			this.validator.$reset()
			this.$emit('input', value)
			this.triggerError()
		}
	}
}

// End of /Users/eugenepetrov/reps/uikit_test/src/components/text-field.js
})(window);
(function(w){
"use strict";
// File /Users/eugenepetrov/reps/uikit_test/src/apps/app-form.js

w.app = new Vue({
	template: "<div id=form-test><text-field label-error=\"Input a valid email\" label=Email v-model=email :validator=$v.email></text-field><text-field label-error=\"Input ‘John’\" label=Name v-model=name :validator=$v.name></text-field></div>",
	mixins: [window.vuelidate.validationMixin],
	data: {
		email: '',
		name: ''
	},
	validations: {
		email: {
			email: window.validators.email,
			required: window.validators.required
		},
		name: {
			text: function(val) {
				return(val == 'John')
			}
		}
	},
	components: {
		'text-field': Components['text-field']
	}
});

// End of /Users/eugenepetrov/reps/uikit_test/src/apps/app-form.js
})(window);
(function(w){
"use strict";
// File /Users/eugenepetrov/reps/uikit_test/src/apps/app-popup.js

w.popup = new Vue({
	template: "<div id=popup><a href=# @click.prevent=\"showModal = true\">Open</a><popup-modal v-show=showModal @close=\"showModal = false\"><div slot=body>Text</div></popup-modal></div>",
	data: {
		showModal: true
	},
	components: {
		'popup-modal': Components['popup-modal']
	}
});

// End of /Users/eugenepetrov/reps/uikit_test/src/apps/app-popup.js
})(window);
(function(w){
"use strict";
// File /Users/eugenepetrov/reps/uikit_test/src/js/main.js

function setCaret(target, isStart) {
	const range = document.createRange();
	const sel = window.getSelection();
	if (isStart){
		const newText = document.createTextNode('');
		target.appendChild(newText);
		range.setStart(target.childNodes[0], 0);
	}
	else {
		range.selectNodeContents(target);
	}
	range.collapse(isStart);
	sel.removeAllRanges();
	sel.addRange(range);
	// target.focus();
	// target.select();
}

function getCaretCharOffsetInDiv(element) {
	var caretOffset = 0;
	if (typeof window.getSelection != "undefined") {
			var range = window.getSelection().getRangeAt(0);
			var preCaretRange = range.cloneRange();
			preCaretRange.selectNodeContents(element);
			preCaretRange.setEnd(range.endContainer, range.endOffset);
			caretOffset = preCaretRange.toString().length;
	}
	else if (typeof document.selection != "undefined" && document.selection.type != "Control")
	{
			var textRange = document.selection.createRange();
			var preCaretTextRange = document.body.createTextRange();
			preCaretTextRange.moveToElementText(element);
			preCaretTextRange.setEndPoint("EndToEnd", textRange);
			caretOffset = preCaretTextRange.text.length;
	}
	return caretOffset;
} 

window.app = new Vue({
	data: {
		selected: [],
		tags: [ 'Test block', 'Unsubscribe' ],
		value: '',
		isInputInFocus: false,
		isTagFocus: null,
		undoBufferLength: 5,
		undoBuffer: [],
		blocks: [
			{group: 'Built-in blocks', items: ['Welcome message', 'Default answer']},
			{group: 'My blocks', items: ['Contact block']}
		],
		refinedBlocks: [],
		selectedPopupItem: [0,0],

		mouseInPopup: false,
		chosenByClick: false,
		prState: false,
		secState: false
	},
	mounted: function() {
		this.refinedBlocks = this.blocks;
		this.$refs['input'].addEventListener('keydown', _.bind(function(ev) {
			console.log(ev.key, ev.keyCode, ev.ctrlKey, ev.metaKey);

			if(ev.keyCode == 37) {
				if(this.isInputInFocus) {
					var caretPos = getCaretCharOffsetInDiv(this.$refs['mainInput']);
					// console.log(caretPos);
					if(caretPos == 0 && this.tags.length != 0) {
						this.selected = [ this.tags.length-1 ];
					}
				} else if(this.isTagFocus) {
					var prev = Math.max(0, this.isTagFocus - 1);
					this.selected = [prev];
				}
				return true;
			}

			if(ev.keyCode == 39) {
				if(this.isTagFocus != null) {
					ev.preventDefault();
					if(this.isTagFocus == (this.tags.length - 1) ) {
						this.activateInput();
					} else {
						var next = Math.min(this.isTagFocus + 1, this.tags.length - 1);
						this.selected = [next];
					}

					return false;
				}
			}

			if(ev.keyCode != 8) {
				this.activateInput( !this.isInputInFocus );
			}

			if(ev.keyCode == 13) {
				ev.preventDefault();

				// if(this.value != '' && this.isInputInFocus) this.pushValue(this.value);

				if(this.selectedPopupItem) this.pushValue(this.value);

				return false;
			} 

			if(ev.keyCode == 9) {
				ev.preventDefault();
			}

			if(ev.keyCode == 8) {
				if(this.selected.length != 0) {
					var firstRange = this.selected[0];
					var prev = Math.max(0, firstRange - 1);
					this.clearSelectedTags();
					if(this.tags.length != 0) {
						this.selected = [prev];
					} else {
						this.activateInput( true );
					}
					// this.activateInput( true );
				} else if(this.value == '') {
					this.selected = [ this.tags.length-1 ];
				}
				return true;
			}

			if(ev.keyCode == 38 || ev.keyCode == 40 && this.isInputInFocus) {
				ev.preventDefault();
				this.navigatePopup(ev.keyCode == 38);
			}

			return true;
		}, this));
	},
	watch: {
		value: function() {
			var result = [];

			if(this.value == '') {
				this.refinedBlocks = this.blocks;
			} else {
				var _val = this.value.toLowerCase();
				this.blocks.forEach(function(group, gindex) {
					var newGroup = {group: group.group, items: []};
					group.items.forEach(function(item, iindex) {
						if(item.toLowerCase().indexOf(_val) != -1) {
							newGroup.items.push(item);
						}
					})
					if(newGroup.items.length != 0) result.push(newGroup);
				});
				this.refinedBlocks = result;
				if(result.length == 0) {
					this.selectedPopupItem = [-1,-1];
				} else {
					this.selectedPopupItem = [0,0];
				}
				
			}
		}
	},
	methods: {
		_checkSelect: function(ind) {
			if(this.selected.indexOf(ind) != -1) {
				this._moveFocus(ind);
				return true;
			}
		},
		_calcActive: function(gi, ii) {
			return (this.selectedPopupItem != null && this.selectedPopupItem[0] == gi && this.selectedPopupItem[1] == ii);
		},
		navigatePopup: function(up) {
			var g = this.selectedPopupItem[0];
			var i = this.selectedPopupItem[1];
			console.log(g,i);

			if(this.refinedBlocks.length == 0) {
				this.selectedPopupItem = [-1, -1];
				return;
			}

			var newG = -1;
			var newI = -1;

			i += (up? -1 : 1);
			if(i >= this.refinedBlocks[g].items.length || i < 0) {
				g += (up? -1 : 1);
				if(!this.refinedBlocks[g] && !up) {
					// leave as is
					return;
				} else if(!this.refinedBlocks[g] && up) {
					// select Create block ...
					if(this.value != '') return this.selectedPopupItem = [-1,-1];
					return;
				} else {
					i = (up ? (this.refinedBlocks[g].items.length - 1) : 0);
				}
			}
			
			this.selectedPopupItem = [g,i];
			console.log(this.selectedPopupItem);
		},
		_selectSuggestItem: function(g, i, push) {
			console.log(g,i);
			this.selectedPopupItem = [g,i];
			console.log(this.selectedPopupItem);
			if(push) this.pushValue(this.value);
			this.activateInput();
		},
		activateInput: function(adjustCaret) {
			this.$refs['mainInput'].focus();
			if(adjustCaret) setCaret(this.$refs['mainInput'], false);
			this.removeSelection();
		},
		setInputState: function(focus) {
			if(focus) {
				this.isInputInFocus = true;
				this.isTagFocus = null;
				this.removeSelection();
			} else {
				this.isInputInFocus = false;
			}
		},
		removeSelection: function() {
			this.selected = [];
		},
		itemKeypress: function(ev) {
			// console.log(ev);
		},
		selectItem: function(elem) {
			var ind = parseInt(elem.dataset.index);
			this.selected = [ind];
		},
		setValue: function(elem) {
			// console.dir(elem);
			this.value = elem.textContent.trim();
			// console.log(this.value);
		},
		pushValue: function(val) {
			// console.log(val);
			// this.$set(this.tags, this.tags.length, val);

			if(this.selectedPopupItem[0] == -1) {
				this.$set(this.tags, this.tags.length, val);
			} else {
				this.$set(this.tags, this.tags.length, this.refinedBlocks[this.selectedPopupItem[0]].items[this.selectedPopupItem[1]]);
			}
			this.$nextTick(function() {
				this._clearValue();
			});			
		},
		_clearValue: function() {
			this.value = '';
			this.selectedPopupItem = [0,0];
			this.$nextTick(function() {
				this.$refs['mainInput'].innerHTML = '';
				// console.log(this.$refs['mainInput'].outerText);
			});
		},
		clearSelectedTags: function() {
			var newTags = [];
			for(var i = 0; i < this.tags.length; i++) {
				if(this.selected.indexOf(i) == -1) {
					newTags.push(this.tags[i]);
				} else {
					// this._storeUndo(i, this.tags[i]);
				}
			}
			this.tags = newTags;
		},
		_storeUndo: function(i, val) {
			if(this.undoBuffer.length >= this.undoBufferLength) {
				this.undoBuffer.splice(0,1);
			}
			this.undoBuffer.push({index: i, value: val});
		},
		restoreItem: function(i) {
			if(this.undoBuffer[i]) {
				this.tags.push(this.undoBuffer[i].value);
				this.selected = [ this.tags.length - 1 ];
				this.undoBuffer.splice(i, 1);
				this.$nextTick(function() {
					this._moveFocus(this.tags.length - 1);
				})
			}
		},
		_moveFocus: function(ind) {
			var items = this.$el.getElementsByClassName('item');
			for(var i = 0; i < items.length; i++) {
				if(items[i].dataset && ind == parseInt(items[i].dataset.index)) {
					items[i].focus();
					this.isTagFocus = i;
				} 
			}
		},
		shouldShowPopup: function() {
			return !this.isTagFocus && (this.mouseInPopup || this.isInputInFocus);
		}
	}
})

//app.$mount('#suggest-input');
// End of /Users/eugenepetrov/reps/uikit_test/src/js/main.js
})(window);