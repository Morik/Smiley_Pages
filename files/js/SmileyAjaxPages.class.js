/**
 * @author		Markus Bartz
 * @copyright	2011 Markus Bartz
 * @license		GNU Lesser General Public License <http://www.gnu.org/licenses/lgpl.html>
 */
var SmileyAjaxPages = Class.create({
	/**
	 * Initialize the SmileyAjaxPages instance
	 * 
	 * @parameter	Hash	smileyCategories
	 * @parameter	integer	smileysPerPage
	 * @parameter	Object	paginatorOptions
	 */
	initialize: function(smileyCategories, smileysPerPage, paginatorOptions) {
		// bindings
		this.showSmileyCategories = this._showSmileyCategories.bindAsEventListener(this);
		this.hideSmileyCategories = this._hideSmileyCategories.bindAsEventListener(this);
		this.handleResponse = this._handleResponse.bindAsEventListener(this);
		this.handleAJAXFailure = this._handleAJAXFailure.bindAsEventListener(this);
		this.checkLock = this._checkLock.bindAsEventListener(this);
		this.handlePageSwitch = this._handlePageSwitch.bindAsEventListener(this);
		
		// initialize variables
		this.smileyCategories = smileyCategories;
		this.smileysPerPage = smileysPerPage;
		this.paginatorOptions = paginatorOptions;
		this.activeCategory = -1;
		this.activePage = new Hash();
		this.initializedCategories = new Hash();
		this.locked = false;
		
		// now do the "real" work
		var fieldset = $('smilies').down('fieldset');
		this.smileyCategories.each(function(category) {
			if (category.value.count > 0) {
				var categoryContainer = new Element('div', {
					id: 'smileyContainer-' + String(category.key)
				}).hide();
				fieldset.insert(categoryContainer);
				
				var categoryPaginator = new Element('div', {
					id: 'categoryPaginator-' + String(category.key)
				});
				categoryContainer.insert(categoryPaginator);
				
				var innerCategoryContainer = new Element('div', {
					id: 'smileyInnerContainer-' + String(category.key),
					style: 'clear: left; padding-top: 5px;'
				});
				categoryContainer.insert(innerCategoryContainer);
				
				this.activePage.set(category.key, -1);
			}
		}, this);
		
		$('tabMenuList').childElements().each(function(element) {
			if (element.id == 'smiliesTab') element.observe('click', this.showSmileyCategories);
			else element.observe('click', this.hideSmileyCategories);
		}, this);
		
		this.loadPage(null, 0, 0);
	},
	
	/**
	 * Shows the smiley categories
	 */
	_showSmileyCategories: function() {
		var containerHead = $('subTabMenu').down('.containerHead');
		
		containerHead.childElements().each(function(element) {
			element.remove();
		});
		
		if (this.smileyCategories.keys().length > 1) {
			var categoryList = new Element('ul');
			containerHead.insert(categoryList);
			
			this.smileyCategories.each(function(category) {
				if (category.value.count > 0) {
					var categoryElement = new Element('li', {
						id: 'smileyCategoryLink-' + String(category.key)
					});
					categoryList.insert(categoryElement);
					
					var categoryLink = new Element('a');
					categoryElement.insert(categoryLink);
					categoryLink.observe('click', this.loadPage.bindAsEventListener(this, category.key, 0));
					
					var categoryText = new Element('span').update(category.value.name);
					categoryLink.insert(categoryText);
					
					if (parseInt(category.key) == this.activeCategory) {
						categoryElement.addClassName('activeSubTabMenu');
					}
				}
			}, this);
		}
	},
	
	/**
	 * Hides the smiley categories
	 */
	_hideSmileyCategories: function() {
		var containerHead = $('subTabMenu').down('.containerHead');
		
		containerHead.childElements().each(function(element) {
			element.remove();
		});
	},
	
	/**
	 * Shows the given category
	 * 
	 * @parameter	integer	categoryID
	 */
	showCategory: function(categoryID) {
		var oldCategoryID = this.activeCategory;
		if (this.smileyCategories.get(oldCategoryID) != undefined) {
			$('smileyContainer-' + String(oldCategoryID)).hide();
			$('smileyCategoryLink-' + String(oldCategoryID)).removeClassName('activeSubTabMenu');
		}
		
		this.activeCategory = categoryID;
		if (this.smileyCategories.get(this.activeCategory) != undefined) {
			$('smileyContainer-' + String(this.activeCategory)).show();
			$('smileyCategoryLink-' + String(this.activeCategory)).addClassName('activeSubTabMenu');
		}
	},
	
	/**
	 * Loads the given page of the given category
	 * 
	 * @parameter	Event	event
	 * @parameter	integer	categoryID
	 * @parameter	integer	page
	 */
	loadPage: function(event, categoryID, page) {
		if (!this.locked) {
			if (this.initializedCategories.get(categoryID) == true && page == 0) {
				this.showCategory(categoryID);
			}
			else {
				this.locked = true;
				new Ajax.Request('index.php?page=SmileyAjax' + SID_ARG_2ND, {
					parameters: {
						smileyCategoryID: categoryID,
						pageNo: page
					},
					onSuccess: this.handleResponse,
					onFailure: this.handleAJAXFailure,
					onException: this.handleAJAXFailure
				});
			}
		}
	},
	
	/**
	 * Handle AJAX response
	 * 
	 * @parameter	Ajax.Response	response
	 */
	_handleResponse: function(response) {
		this.locked = false;
		
		var xml = response.responseXML;
		var smileys = xml.getElementsByTagName('smileys')[0];
		var categoryID = smileys.getAttribute('categoryID');
		var page = smileys.getAttribute('page');
		
		if (this.initializedCategories.get(categoryID) != true) {
			this.initializedCategories.set(categoryID, true);
			
			new Pagination('categoryPaginator-' + String(categoryID), 1, (this.smileyCategories.get(categoryID).count / this.smileysPerPage).ceil(), this.paginatorOptions);
			var paginator = $('categoryPaginator-' + String(categoryID));
			paginator.observe('pagination:shouldSwitch', this.checkLock);
			paginator.observe('pagination:switched', this.handlePageSwitch);
		}
		
		if (this.activePage.get(categoryID) != page || this.activeCategory != categoryID) {
			this.activePage.set(categoryID, page);
			var smileysContainer = $('smileyInnerContainer-' + String(categoryID));
			smileysContainer.childElements().each(function(element) {
				element.remove();
			});
			
			var smileyList = new Element('ul');
			
			$A(xml.getElementsByTagName('smiley')).each(function(smiley) {
				var smileyContainer = new Element('li');
				smileyList.insert(smileyContainer);
				
				var smileyPath = RELATIVE_WCF_DIR + smiley.getElementsByTagName('path')[0].firstChild.nodeValue;
				var smileyTitle = smiley.getElementsByTagName('title')[0].firstChild.nodeValue;
				var smileyCode = smiley.getElementsByTagName('code')[0].firstChild.nodeValue;
				
				var smileyElement = new Element('img', {
					title: smileyTitle,
					alt: '',
					src: smileyPath,
					style: 'cursor: pointer;'
				});
				smileyContainer.insert(smileyElement);
				smileyElement.observe('mouseover', function(event) {
					this.style.cursor='pointer';
				});
				smileyElement.observe('click', function(event) {
					WysiwygInsert('smiley', smileyPath, smileyTitle, smileyCode);
				});
			});
			smileysContainer.insert(smileyList);
			smileyList.addClassName('smileys');
		}
		
		if (this.activeCategory != categoryID) {
			this.showCategory(categoryID);
		}
	},
	
	/**
	 * Handles AJAX failures
	 */
	_handleAJAXFailure: function() {
		this.locked = false;
	},
	
	/**
	 * Checks if lock is set
	 * 
	 * @parameter	Event	event
	 */
	_checkLock: function(event) {
		if (this.locked) Event.stop(event);
	},
	
	/**
	 * Handle page switch
	 * 
	 * @parameter	Event	event
	 */
	_handlePageSwitch: function(event) {
		this.loadPage(null, this.activeCategory, event.memo.activePage);
	}
});
