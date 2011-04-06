<div class="hidden" id="smilies">
	<fieldset class="noJavaScript">
		<legend class="noJavaScript">{lang}wcf.smiley.smilies{/lang}</legend>
		
	</fieldset>
</div>

<script type="text/javascript" src="{@RELATIVE_WCF_DIR}js/Pagination.class.js"></script>
<script type="text/javascript" src="{@RELATIVE_WCF_DIR}js/SmileyAjaxPages.class.js"></script>
<script type="text/javascript">
	//<![CDATA[
	tabbedPane.addTab('smilies', false);
	
	// define smiley categories
	var smileyCategories = new Hash();
	smileyCategories.set(0, { name: '{lang}wcf.smiley.category.default{/lang} ({#$defaultSmileys|count})', count: {@$defaultSmileys|count} } );
	{foreach from=$smileyCategories item=smileyCategory}
		{if !$smileyCategory->disabled}smileyCategories.set({@$smileyCategory->smileyCategoryID}, { name: '{lang}{$smileyCategory->title}{/lang} ({#$smileyCategory->smileys})', count: {@$smileyCategory->smileys} } );{/if}
	{/foreach}
		
	// init smiley category switcher
	{capture assign='smileysPerPage'}{if $this->user->smileysPerPage && $this->user->smileysPerPage > 0}{@$this->user->smileysPerPage}{else}{@SMILEYS_PER_PAGE}{/if}{/capture}
	var smileyAjaxPages = new SmileyAjaxPages(smileyCategories, {@$smileysPerPage}, {
		lang: {
			'wcf.global.thousandsSeparator': '{lang}wcf.global.thousandsSeparator{/lang}',
			'wcf.global.page.next': '{lang}wcf.global.page.next{/lang}',
			'wcf.global.page.previous': '{lang}wcf.global.page.previous{/lang}'
		},
		icon: {
			'previousS.png': '{icon}previousS.png{/icon}',
			'previousDisabledS.png': '{icon}previousDisabledS.png{/icon}',
			'arrowDown.png': '{icon}arrowDown.png{/icon}',
			'nextS.png': '{icon}nextS.png{/icon}',
			'nextDisabledS.png': '{icon}nextDisabledS.png{/icon}'
		}
	});
	{if $activeTab == 'smilies' || $activeTab == ''}
		document.observe("dom:loaded", function() {
			smileyAjaxPages._showSmileyCategories();
		});
	{/if}
	//]]>
</script>
