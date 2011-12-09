<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:output method="text"/>

	<xsl:template match="tag" mode="tags">
		<xsl:variable name="tagName"><xsl:value-of select="@name"/></xsl:variable>
		tags['<xsl:value-of select="$tagName"/>'.toLowerCase()] = [];
	 	<xsl:for-each select="images/image">
			tags['<xsl:value-of select="$tagName"/>'.toLowerCase()].push(imageHashes[<xsl:value-of select="@imageId"/>]);
		</xsl:for-each>
	</xsl:template>

	
	<xsl:template match="set" mode="sets">
		<xsl:variable name="setName"><xsl:value-of select="@name"/></xsl:variable>
		sets['<xsl-value-of select="$setName"/>'.toLowerCase()] = [];
		<xsl:for-each select="images/image">
			sets['<xsl-value-of select="$setName"/>'.toLowerCase()].push(<xsl:value-of select="@imageId"/>);
		</xsl:for-each>
	</xsl:template>
	
	<xsl:template match="image" mode="hashes">
		imageHashes[<xsl:value-of select="@imageId"/>] = { id: <xsl:value-of select="@imageId"/>, hash: '<xsl:value-of select="@hash"/>', aliases:[ '<xsl:value-of select="@aliasImageId"/>'] };
	</xsl:template>

	<xsl:template match="/">
	<!-- First convert the image hash list -->
	var imageHashes = [];
	<xsl:apply-templates select="/dbContent/images/image" mode="hashes"/>

	var sets = {};
	<xsl:apply-templates select="/dbContent/sets/set" mode="sets"/>
	
	var tags = {};
	<xsl:apply-templates select="/dbContent/tags/tag" mode="tags"/>

	module.exports.imageHashes = imageHashes;
	module.exports.sets = sets;
	module.exports.tags = tags;
	</xsl:template>
	
</xsl:stylesheet>
