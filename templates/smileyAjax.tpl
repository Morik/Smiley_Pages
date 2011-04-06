<?xml version="1.0" encoding="{@CHARSET}"?>
<smileys categoryID="{@$smileyCategoryID}" page="{@$page}">
	{foreach from=$smileys item=$smiley}
	<smiley>
		<path><![CDATA[{$smiley->smileyPath}]]></path>
		<title><![CDATA[{lang}{$smiley->smileyTitle}{/lang}]]></title>
		<code><![CDATA[{$smiley->smileyCode|addslashes}]]></code>
	</smiley>
	{/foreach}
</smileys>