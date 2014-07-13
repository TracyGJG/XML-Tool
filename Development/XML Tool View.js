// View
var clsViewManager = function() {
	var objController;
	var gstrCurrentView = document.body.className;;
	var cblnAsText = false;
	var cblnAsHTML = true;
	var cblnDefaultStylesheet = true;
	var cblnSpecifiedStylesheet = false;
	var cblnEnabled = false;
	var cstrStatusBar = "Status information";

	var objFieldMapping = {
		"Document filename": null,
		"XPath query": null,
		"Stylesheet filename": null,
		"Schema filename": null,
		"Extracted Namespace": null,
		"XML Data document": null,
		"XML Stylesheet": null,
		"XML Schema": null,
		"Status information": null
	};
	var objFilenameField = {
		"xml": "Document filename",
		"xsl": "Stylesheet filename",
		"xsd": "Schema filename"
	};
	var objDocType = {
		"xml": "XML Data document",
		"xsl": "XML Stylesheet",
		"xsd": "XML Schema"
	};

	var objButtonMapping = {
		"XML data document mode": function() {
					switchPageView("xml");
		},
		"XML stylesheet document mode": function() {
					switchPageView("xsl");
		},
		"XML data schema mode": function() {
					switchPageView("xsd");
		},
		"Open document file": function() {
			var strView = gstrCurrentView || "xml";
			var strFilename = objController.openFile( strView);

			// First XML document opened, so show View and enable buttons.
			if (!!strFilename) {
				if (!gstrCurrentView) {
					switchPageView("xml");
					enableButtons();
				}

				outputTextToField( strFilename, objFilenameField[strView], cblnAsText);
				if ("xsd"===gstrCurrentView) {
					objController.getNamespace();
				}
				outputTextToStatusBar( objDocType[strView]+ " loaded.");
			}
		},
		"Show (raw) document": function() {
			objController.showXML( gstrCurrentView, objDocType[gstrCurrentView]);
		},
		"Show document": function() {
			objController.transformDocument( cblnDefaultStylesheet, cblnAsHTML);
		},
		"Perform XPath selection": function() {
			var strQuery = objFieldMapping["XPath query"].innerText;
			if (strQuery) {
				objController.selectXPath( strQuery);
			}
			else {
				outputTextToStatusBar( "No XPath query to extract.");
			}
		},
		"Present result XML transformation": function() {
			objController.transformDocument( cblnSpecifiedStylesheet, cblnAsText);
		},
		"Copy presented data to windows clipboard": function() {
			var objFieldName = objFieldMapping["XML Stylesheet"];
			var strReport = "Nothing to capture.";

			if (objFieldName.innerText) {
				window.clipboardData.setData("text", objFieldName.innerText);
				strReport = "Output captured to clipboard.";
			}
			outputTextToStatusBar(strReport);
		},
		"Save presented data to file": function() {
			objController.saveFile();
		},
		"Render as HTML, the result XML transformation": function() {
			objController.transformDocument( cblnSpecifiedStylesheet, cblnAsHTML);
		},
		"Check the XML document against Schema": function() {
			objController.validateXML();
		}
	};

	var mapFields = function() {
		var arrFields = document.getElementsByTagName("DIV");
		var strFieldTitle;

		for (var numField=0; numField<arrFields.length; numField+=1) {
			strFieldTitle = arrFields[ numField].title;
			if (strFieldTitle in objFieldMapping) {
				objFieldMapping[strFieldTitle] = arrFields[ numField];
			}
		}
	};
	var bindButtons = function() {
		var arrButtons = document.getElementsByTagName("BUTTON");

		for (var numButton=0; numButton<arrButtons.length; numButton+=1) {
			arrButtons[ numButton].onclick = function() {
				(objButtonMapping[this.title])();
			};
			if (! arrButtons[ numButton].disabled) {
				arrButtons[ numButton].focus();
			}
		}
	};
	var enableButtons = function() {
		var arrButtons = document.getElementsByTagName("BUTTON");

		for (var numButton=0; numButton<arrButtons.length; numButton+=1) {
			arrButtons[ numButton].disabled = cblnEnabled;
		}
	};
	var outputTextToMainPanel = function( pstrText, pblnAsHTML, pstrClass) {
		var objTarget = outputTextToField( pstrText, objDocType[ gstrCurrentView], pblnAsHTML);
		if (objTarget) {
			objTarget.className = ("mainPanel "+ pstrClass);
		}
	};
	var outputTextToStatusBar = function(pstrStatusMessage) {
		outputTextToField( pstrStatusMessage, cstrStatusBar, cblnAsText);
	};

	var outputTextToField = function( pstrText, pstrTarget, pblnAsHTML) {
		var strErrorMessage = "ERROR: Output field '"+ pstrTarget+ "' could not be located.";

		if (pstrTarget in objFieldMapping) {
			if (pblnAsHTML) {
				objFieldMapping[pstrTarget].innerHTML = pstrText;
			}
			else {
				objFieldMapping[pstrTarget].innerText = pstrText;
			}
			return objFieldMapping[pstrTarget];
		}
		else {
			if (cstrStatusBar in objFieldMapping) {
				objFieldMapping[cstrStatusBar].innerText = strErrorMessage;
			}
			else {
				alert( strErrorMessage);
			}
			return null;
		}
	};
	var switchPageView = function(pstrView) {
		document.body.className = pstrView;
		gstrCurrentView = pstrView;
	};

	var objMethods = {
		setController: function( pobjController) {
			objController = pobjController;
			mapFields();
			bindButtons();
		},
		switchView: function(pstrView) {
			switchPageView( pstrView);
		},
		writeStatus: function(pstrStatusMessage)	{
			outputTextToStatusBar(pstrStatusMessage);
		},
		writeOutput: function( pstrOutput, pblnAsHTML, pblnValid) {
			outputTextToMainPanel( pstrOutput, pblnAsHTML, pblnValid);
		},
		writeNamespace: function(pstrNamespace) {
			outputTextToField( pstrNamespace, "Extracted Namespace", cblnAsText);
		}
	};

	return objMethods;
};
