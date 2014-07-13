// Controller
var clsAppController = (function( pobjView, pobjModel) {
	var objView = pobjView;
	var objModel = pobjModel;

	var cblnAsText = false;
	var cblnAsHTML = true;
	var cblnOpenDialog = true;
	var cblnSaveDialog = false;
	var cblnAsASCII = true;
	var cblnCancelError = true;
	var cblnSpecifiedStylesheet = false;

	var cstrXML_Version = "Msxml2.DOMDocument.6.0";
	var cstrCmnDlg_Licence = "comdlg.lpk";
	var objFilesystem = new ActiveXObject("Scripting.FileSystemObject");
	var MSComDlgLicence = "\
LPK License Package\n\
{3d25aba1-caec-11cf-b34a-00aa00a28331}\n\
mWXDqNF2ekGyVjg4QtBySg=\n\
AQAAAA=\n\
hTwE+fL2GhCjyQgAKy9J+yQAAAA\n\
yADgAQwA0AEMAOAAyADAALQA0ADAAMQBBAC0AMQAwADEAQgAtAEEAMwBDADkALQAw\n\
ADgAMAAwADIAQgAyAEYANAA5AEYAQgA=\n";
	var objFilters = {
		"xml": "XML Document(*.xml)|*.xml",
		"xsl": "XML Stylesheet(*.xsl)|*.xsl",
		"xsd": "XML Schema(*.xsd)|*.xsd"
	};
	var objFilenames = {
		"xml": "",
		"xsl": "",
		"xsd": ""
	};

	var createXML = function( pstrXML) {
		var objXML = null;

		try {
			objXML = new ActiveXObject(cstrXML_Version);
			objXML.async = false;
			objXML.validateOnParse = false;
			objXML.resolveExternals = true;
			objXML.loadXML(pstrXML);

			if (!!objXML.parseError.errorCode) {
				var objErr = objXML.parseError;
				alert("ERROR: Create XML failed ("+ objErr.errorCode+ "): " + objErr.reason);
				objXML = null;
			}
		}
		catch(err) {
			alert("ERROR: Create XML failed ("+ err.code+ "): " + err.message);
		}
		return objXML;
	};
	var checkAndCreateComDlgLic = function() {
		var fso = objFilesystem;

		try {
			fso.GetFile(cstrCmnDlg_Licence);
			objView.switchView("");
		}
		catch(err) {
			var f = fso.CreateTextFile(cstrCmnDlg_Licence, cblnAsASCII);
			f.write(MSComDlgLicence);
			f.Close();
			location.reload(false);
		}
	};
	var showFileDialog = function( pstrFileSpec, pstrFileName, pblnOpenSave) {
		var objDialog = document.getElementById("cDialog");
		var strFileName = "";

		objDialog.CancelError = cblnCancelError;
		try {
			objDialog.filename = pstrFileName;
			objDialog.Filter = pstrFileSpec;
			if( pblnOpenSave) {
				objDialog.ShowOpen();
			}
			else {
				objDialog.ShowSave();
			}
			strFileName = objDialog.filename;
		}
		catch(e) {
		}
		return strFileName;
	};

	var objModelMethods = {
		createXML: function( pstrDocument) {
			return createXML( pstrDocument);
		}
	};
	var objViewMethods = {
		openFile: function( pstrView) {
			var strFilename = (pstrView in objFilenames)?
				objFilenames[pstrView]:
				objFilenames["xml"];
			strFilename = showFileDialog( objFilters[pstrView], strFilename, cblnOpenDialog);

			if (strFilename) { // open document with given filename

				if (objModel.openXMLDocument( strFilename, pstrView)) {
					// record only new filename
					objFilenames[pstrView] = strFilename;
				}
				else {
					strFilename = "";
				}
			}
			return strFilename;
		},
		getNamespace: function() {
			objView.writeNamespace( objModel.getNamespace());
		},
		showXML: function( pstrView, pstrFormat) {
			var strXML = objModel.getXML_Text( pstrView);

			if (strXML) {
				objView.writeOutput( strXML, cblnAsText, "DisplayOutput");
			}
			else {
				objView.writeStatus( "Error: No "+ pstrFormat+ " to show.");
			}
		},
		transformDocument: function( pblnDefault, pblnAsHTML) {
			var objReturn = objModel.transformDocument( pblnDefault);
			if (objReturn.status) {
				objView.writeStatus( objReturn.status);
			}
			if (objReturn.output) {
				objView.writeOutput( objReturn.output, pblnAsHTML, "");
			}
		},
		selectXPath: function( pstrXPath) {
			var objReturn = objModel.selectXPath( pstrXPath);
			if (objReturn.status) {
				objView.writeStatus( objReturn.status);
			}
			if (objReturn.output) {
				objView.writeOutput( objReturn.output, cblnAsText, "");
			}
		},
		saveFile: function() {
			var strFilename = showFileDialog( objFilters["xml"], "", cblnSaveDialog);

			if (strFilename) { // open document with given filename
				var objReturn = objModel.transformDocument( cblnSpecifiedStylesheet);

				if (objReturn.output) {
					var objXML = createXML( objReturn.output);
					if (objXML) {
						try {
							objXML.save(strFilename);
						}
						catch(err) {
							objReturn.status = "Error: Failed to save the XML file.";
						}
					}
					else {
						objReturn.status = "Error: The Transformed output was not XML.";
					}
				}
				if (objReturn.status) {
					objView.writeStatus( objReturn.status);
				}
			}
		},
		validateXML: function() {
			var objReturn = objModel.validateXML();
			if (objReturn.output) {
				objView.writeOutput( objReturn.output, cblnAsHTML, objReturn.status);
			}
			else {
				objView.writeStatus( objReturn.status);
			}
		}
	};

	objModel.setController( objModelMethods);
	objView.setController( objViewMethods);
	checkAndCreateComDlgLic();

})( clsViewManager(), clsDataModel());
