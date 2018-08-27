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
					this._storeUndo(i, this.tags[i]);
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

app.$mount('#suggest-input');