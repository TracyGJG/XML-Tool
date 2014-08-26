// Model
	var clsDataModel = function() {
		var objController;
		var objDefault = null;
		var cstrXML_Version = "Msxml2.DOMDocument.6.0";
		var cstrXSD_Version = "Msxml2.XMLSchemaCache.6.0";
		var strDefault = "\
<?xml version='1.0'?>\
<xsl:stylesheet version='2.0' xmlns:xsl='http://www.w3.org/1999/XSL/Transform'>\
	<xsl:template match='/*'>\
		<div style='background-color:AliceBlue; padding:20px;'>\
			<xsl:call-template name='ShowEntity'>\
				<xsl:with-param name='Indent' select='\"\"' />\
			</xsl:call-template>\
		</div>\
	</xsl:template>\
	<xsl:template name='ShowEntity'>\
		<xsl:param name='Indent' />\
		<xsl:if test='count(*) &gt; 0'>\
			<xsl:value-of select='$Indent' /><span style='color:orange;'>&lt;</span><span style='color:green;'>\
			<xsl:value-of select='name()' /></span><xsl:call-template name='ShowAttrib' />\
			<span style='color:orange;'>&gt;</span><br />\
			<xsl:for-each select='*'>\
				<xsl:call-template name='ShowEntity'>\
					<xsl:with-param name='Indent' select='concat($Indent,\"&#xa0;&#xa0;&#xa0;&#xa0;\")' />\
				</xsl:call-template>\
			</xsl:for-each>\
			<xsl:value-of select='$Indent' /><span style='color:orange;'>&lt;/</span><span style='color:green;'>\
			<xsl:value-of select='name()' /></span><span style='color:orange;'>&gt;</span><br />\
		</xsl:if>\
		<xsl:if test='count(*) = 0'>\
			<xsl:if test='. = \"\"'>\
				<xsl:value-of select='$Indent' /><span style='color:red;'>&lt;</span><span style='color:green;'>\
				<xsl:value-of select='name()' /></span><xsl:call-template name='ShowAttrib' />&#xa0;<span style='color:red;'>/&gt;</span><br />\
			</xsl:if>\
			<xsl:if test='. != \"\"'>\
				<xsl:value-of select='$Indent' /><span style='color:red;'>&lt;</span><span style='color:green;'>\
				<xsl:value-of select='name()' /></span><xsl:call-template name='ShowAttrib' /><span style='color:red;'>&gt;</span>\
				<span style='color:magenta;'><xsl:value-of select='.' /></span><span style='color:red;'>&lt;/</span><span style='color:green;'>\
				<xsl:value-of select='name()' /></span><span style='color:red;'>&gt;</span><br />\
			</xsl:if>\
		</xsl:if>\
	</xsl:template>\
	<xsl:template name='ShowAttrib'>\
		<xsl:for-each select='attribute::*'>\
			&#xa0;<span style='color:blue;'><xsl:value-of select='name()' />=&quot;</span><span style='color:black;'>\
			<xsl:value-of select='.' /></span><span style='color:blue;'>&quot;</span>\
		</xsl:for-each>\
	</xsl:template>\
</xsl:stylesheet>";
	var strNamespace = "";
	var objDocTypeMap = {
		"xml": "XML Document (XML)",
		"xsl": "XML Stylesheet (XSL)",
		"xsd": "XML Schema (XSD)"
	};
	var objDocuments = {
		"xml": null,
		"xsl": null,
		"xsd": null
	};

	var objMethods = {
		setController: function( pobjController) {
			objController = pobjController;
			objDefault = objController.createXML(strDefault);
		},
		openXMLDocument: function( pstrXML, pstrView) {
			var strDocType = "";
			var strObject = null;
			var objXML = null;

			if (pstrXML) {
				objXML = new ActiveXObject(cstrXML_Version);
				objXML.async = false;
				objXML.validateOnParse = false;
				objXML.resolveExternals = true;

				var arrFromFile = pstrXML.match(/...$/i);
				strObject = arrFromFile[0].toLowerCase();

				strDocType = objDocTypeMap[strObject];

				if ("xsd"===strObject) {
					strNamespace = "";
					if (objDocuments["xml"]) {
						strNamespace = objDocuments["xml"].documentElement.namespaceURI;
					}
				}
				else {
					objXML.setProperty("SelectionLanguage", "XPath");
				}
				if ("xsl"===strObject) {
					objXML.setProperty("AllowDocumentFunction", "true");
				}

				if (!!strDocType) {
					objXML.load(pstrXML);
				}
				else {
					objXML.loadXML(pstrXML);
				}

				if (!!objXML.parseError.errorCode) {
					var objErr = objXML.parseError;
					alert("ERROR: "+ strDocType+ " load failed ("+ objErr.errorCode+ "): " + objErr.reason);
					objXML = null;
				}
				else {
					objDocuments[ pstrView] = objXML;
				}
			}
			return !!objXML;
		},
		getNamespace : function() {
			return strNamespace;
		},
		getXML_Text: function( pstrXML) {
			return objDocuments[pstrXML]? objDocuments[pstrXML].xml :null;
		},
		transformDocument: function(pblnDefault) {
			var xmlStylesheet = (pblnDefault)? objDefault: objDocuments["xsl"];
			var objReturn = { output:"", status:""};

			if (objDocuments["xml"] && xmlStylesheet) {
				try {
					objReturn.output = objDocuments["xml"].transformNode(xmlStylesheet);
				}
				catch(err) {
					objReturn.output = "Error: "+ err.message+ " (" + err.code + ")";
					objReturn.status = "Failure during XML Transform."
				}
			}
			else {
				objReturn.status = "No Data or stylesheet to perform transform.";
			}
			return objReturn;
		},
		selectXPath: function( pstrXPath) {
			var objReturn = { output:"", status:""};
			var strObjXPath = "";
			var strQueryNamespace = "";
			var xmlObjXPath = null;
			var objExtract = null;
			var strOutput = "Extract Result:";

			if (objDocuments["xml"]) {
				strObjXPath = objDocuments["xml"].xml;
/*
				strQueryNamespace = objDocuments["xml"].documentElement.namespaceURI;
				if (strQueryNamespace) {
					strObjXPath = strObjXPath.replace(/ xmlns[^"']*["'][^"']*["']/gm,"");
					objReturn.status = "Namespace(s) temporarily removed.";
				}
*/
				xmlObjXPath = objController.createXML( strObjXPath);
				objExtract = xmlObjXPath.selectNodes(pstrXPath);
				if (!!objExtract.length) {
					for (var numExtract=0; numExtract<objExtract.length; numExtract++) {
						strOutput += ("\n"+objExtract[numExtract].xml);
					}
					objReturn.output = strOutput;
				}
				else {
					objReturn.status = "No results from the XPath query performed.";
				}
			}
			else {
				objReturn.status = "No Data to query against.";
			}
			return objReturn;
		},
		validateXML: function() {
			var xsdCache = new ActiveXObject(cstrXSD_Version);
			var errValidation;
			var strMessage = "<div class='@1@'>@2@</div>";
			var strResult = "";
			var objReturn = { output:"", status:""};

			if (objDocuments["xml"] && objDocuments["xsd"]) {
				try {
					strNamespace = objDocuments["xml"].documentElement.namespaceURI;
					xsdCache.add(strNamespace, objDocuments["xsd"]);
					objDocuments["xml"].schemas = xsdCache;

					errValidation = objDocuments["xml"].validate();

					if (errValidation.errorCode == 0) {
						strResult = "ValidationPass";
						strMessage = strMessage.replace(/@1@/, "ValidationPassed");
						strMessage = strMessage.replace(/@2@/, "Validation Passed - No Errors");
					}
					else {
						strResult = "ValidationFail";
						strMessage = strMessage.replace(/@1@/, "ValidationFailed");
						strMessage = strMessage.replace(/@2@/, "VALIDATION FAILED:</br>"+
							errValidation.reason+ " ("+ errValidation.errorCode+ ")");
					}
				}
				catch(err) {
					strResult = "ValidationFail";
					strMessage = strMessage.replace(/@1@/, "ValidationFailed");
					strMessage = strMessage.replace(/@2@/, "VALIDATION FAILED:</br>"+
						err.message+ " ("+ err.code+ ")");
				}
				xsdCache = null;
			}
			else {
				strMessage = "";
				strResult = "Validation requires both an XML Document and a Schema.";
			}
			objReturn.output = strMessage;
			objReturn.status = strResult;
			return objReturn;
		}
	};

	return objMethods;
};
