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
		sets['<xsl:value-of select="$setName"/>'.toLowerCase()] = [];
		<xsl:for-each select="images/image">
			if(imageHashes[<xsl:value-of select="@imageId"/>])	sets['<xsl:value-of select="$setName"/>'.toLowerCase()].push(<xsl:value-of select="@imageId"/>);
		</xsl:for-each>
	</xsl:template>
	
	<xsl:template match="image" mode="hashes">
		if( path.existsSync('/home/wei/storage/<xsl:value-of select="@hash"/>')){
			imageHashes[<xsl:value-of select="@imageId"/>] = { id: <xsl:value-of select="@imageId"/>, hash: '<xsl:value-of select="@hash"/>', aliases:[ '<xsl:value-of select="@aliasImageId"/>'] };
		}
	</xsl:template>

	<xsl:template match="/">
	<!-- First convert the image hash list -->
	var path = require("path");
	var imageHashes = [];
	<xsl:apply-templates select="/dbContent/images/image" mode="hashes"/>

	var sets = {};
	<xsl:apply-templates select="/dbContent/sets/*[name()='set']" mode="sets"/>
	
	var tags = {};
	<xsl:apply-templates select="/dbContent/tags/tag" mode="tags"/>

	module.exports.imageHashes = imageHashes;
	module.exports.sets = sets;
	module.exports.tags = tags;
	
	 var fs = require("fs");

     var ihFile = fs.createWriteStream('imageHashes.json')
     .on("open", function(){
             ihFile.end(JSON.stringify(imageHashes, null, '\t'));
     });
     var setFile = fs.createWriteStream('imageSets.json')
     .on("open", function(){
             setFile.end(JSON.stringify(sets, null, '\t'));
     });
     var tagFile = fs.createWriteStream('imageTags.json')
     .on("open", function(){
             tagFile.end(JSON.stringify(tags, null, '\t'));
     });

	
	</xsl:template>
	
</xsl:stylesheet>
