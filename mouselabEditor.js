
    /* global variable declaration */
    var jsonVal = null; // copy of the current json file for editing
    var names = []; // stores the names that are already in use
    var dropdownStyleHtml;
    var undoStack = [];
    var redoStack = [];
    var allowedRedo = false;
    var controlPressed = false;
    var fileName = "newpage";
    var colorTable;
    var swapFirstColumn = null;
    var swapFirstRow = null;
    var selectedElements = [];
    var dragMouseX = null;
    var dragMouseY = null;
    var menuOn = null;
    var tempJsonVal = null;					  

    /** all things that need to be done at the start*/
    function initializeEdit()
    {
        
        loadJson(undefined, json);

        /* adds the add button for columns*/
        addAddButton();
        addAttriButton();

        /* html table with w3-css colors, for the user to pick*/
        colorTable = '<table class="w3-table"><tr><td class="w3-red colorEl w3-panel" style="width:25%"></td>' +
        '<td class="w3-pink colorEl w3-panel" style="width:25%"></td><td class="w3-khaki colorEl w3-panel" style="width:25%"></td>' +
        '<td class="w3-yellow w3-panel colorEl" style="width:25%"></td></tr><tr>' +
        '<td class="w3-purple w3-panel colorEl" style="width:25%"></td><td class="w3-deep-purple w3-panel colorEl" style="width:25%"></td>' +
        '<td class="w3-amber w3-panel colorEl" style="width:25%"></td><td class="w3-orange w3-panel colorEl" style="width:25%"></td>' +
        '</tr><tr><td class="w3-indigo w3-panel colorEl" style="width:25%"></td>' +
        '<td class="w3-blue w3-panel colorEl" style="width:25%"></td><td class="w3-deep-orange w3-panel colorEl" style="width:25%"></td>' +
        '<td class="w3-blue-gray w3-panel colorEl" style="width:25%"></td></tr><tr>' +
        '<td class="w3-light-blue w3-panel colorEl" style="width:25%"></td><td class="w3-cyan w3-panel colorEl" style="width:25%"></td>' +
        '<td class="w3-brown w3-panel colorEl" style="width:25%"></td><td class="w3-light-gray w3-panel colorEl" style="width:25%"></td>' +
        '</tr><tr></tr><td class="w3-aqua w3-panel colorEl" style="width:25%"></td>' +
        '<td class="w3-teal w3-panel colorEl" style="width:25%"></td><td class="w3-gray w3-panel colorEl" style="width:25%"></td>' +
        '<td class="w3-dark-gray w3-panel colorEl" style="width:25%"></td></tr><tr>' +
        '<td class="w3-green w3-panel colorEl" style="width:25%"></td><td class="w3-light-green w3-panel colorEl" style="width:25%"></td>' +
        '<td class="w3-pale-red w3-panel colorEl" style="width:25%"></td>' +
        '<td class="w3-pale-yellow w3-panel colorEl" style="width:25%"></td></tr><tr>' +
        '<td class="w3-lime w3-panel colorEl" style="width:25%"></td><td class="w3-sand w3-panel colorEl" style="width:25%"></td>' +
        '<td class="w3-pale-green w3-panel colorEl" style="width:25%"></td>' +
        '<td class="w3-pale-blue w3-panel colorEl" style="width:25%"></td></tr></table>';

        /* sets the buttons that are added to the menu of opt/attri based on styling*/
        // dropdownStyleHtml = '<li><a class="dropdown-item" id="blurButton">Blur</a></li>' +
        //     '<li class="dropright"><a class="dropdown-toggle dropdown-item" id="background">background</a>' +
        //     '<ul class="dropdown-menu">' + colorTable;

    /** stops button clicking from closing the dropdown*/
    $(document).on('click', '[class*="dropdown-item"]', function(e)
    {
        e.stopPropagation();
    });

    $(document).on('click', '[class*="dropdown-menu"]', function(e)
    {
        e.stopPropagation();
    });

    /** functions for the add and delete column/row buttons*/
    $(document).on('click', '[id="addButton"]', function()
    {
        addSameColumn();
    });

    $(document).on('click', '[id="delButton"]', function()
    {
        /* note: only works with label ids lower than 10*/
		menuOn = null;			  
        var delSelEl = false;
        var parEl = this.parentElement.parentElement.parentElement.parentElement;
        if(selectedElements.length === 0 || selectedElements[0].id.slice(0, -1) === "sideLabel")
        {
            selectedElements = [parEl];
            delSelEl = true;
        }
        var copySelected = selectedElements.slice();
        for(var i = 0; i < copySelected.length; i++)
        {
            selectedElements.splice(0, 1);
            delTargetColumn(copySelected[i].getAttribute("id").substr(-1) - 1);
        }
        if(delSelEl)
        {
            selectedElements = [];
        }
    });

    $(document).on('click', '[id="attriButton"]', function()
    {
        addSameAttribute();
    });

    $(document).on('click', '[id="attriDelButton"]', function()
    {
        /* note: only works with div ids lower than 10*/
        menuOn = null;					  
        var delSelEl = false;
        var parEl = this.parentElement.parentElement.parentElement.parentElement;
        if(selectedElements.length === 0 || selectedElements[0].id.slice(0, -1) === "headerLabel")
        {
            selectedElements = [parEl];
            delSelEl = true;
        }
        var copySelected = selectedElements.slice();
        for(var i = 0; i < selectedElements.length; i++)
        {
            selectedElements.splice(0, 1);
            var index = copySelected[i].getAttribute("id").substr(-1) - 1;
            delTargetAttri(index);
        }
        if(delSelEl)
        {
            selectedElements = [];
        }
    });

    /** functions for the buttons in the dropdowns*/
    $(document).on('click', '[id="okButton"]', function()
    {
        var dropdownUl =  menuOn.lastChild;
        dropdownUl.classList.remove("show");
        menuOn = null;
        labelDropdown(dropdownUl.parentElement.parentElement, false);
        updateScreenJson(jsonVal);
    });

    $(document).on('change', '[id="columnWidthInput"]', function(e)
    {
        var delSelEl = false;
        var parEl = this.parentElement.parentElement.parentElement.parentElement;
		//console.log(parEl)
        if(selectedElements.length === 0 ||selectedElements[0].id.slice(0, -1) === "sideLabel")
        {
            selectedElements = [parEl];
            delSelEl = true;
        }
        for(var i = 0; i < selectedElements.length; i++)
        {
            var optNumber = selectedElements[i].id.substr(-1) - 1;
			//console.log(dropdownStyleHtml)
			//dropdownStyleHtml = dropdownStyleHtml.replace('id="cellWidthInput" value="' + jsonVal["opt"][optNumber]["width"].slice(0, -1) + '"',
             //   'id="cellWidthInput" value="' + this.value + '"');
            changeColumnValues(selectedElements[i].id, undefined, undefined, this.value);
        }
        if(delSelEl)
        {
            selectedElements = [];
        }
    });

    $(document).on('change', '[id="attriHeightInput"]', function()
    {
        var delSelEl = false;
        var parEl = this.parentElement.parentElement.parentElement.parentElement;
        if(selectedElements.length === 0 || selectedElements[0].id.slice(0, -1) === "headerLabel")
        {
            selectedElements = [parEl];
            delSelEl = true;
        }
        for(var i = 0; i < selectedElements.length; i++)
        {
            var cellNumber;
            cellNumber = selectedElements[i].id.substr(-1) - 1;
            //dropdownStyleHtml = dropdownStyleHtml.replace('id="cellHeightInput" value="' + jsonVal["attr"][cellNumber]["height"]
            //    .slice(0, -1) + '"', 'id="cellHeightInput" value="' + this.value + '"');
            changeAttriValues(selectedElements[i].id, undefined, undefined, this.value);
        }
        if(delSelEl)
        {
            selectedElements = [];
        }
    });

    $(document).on('click', '[id="blurButton"]', function()
    {
        var delSelEl = false;
        var parEl = this.parentElement.parentElement.parentElement.parentElement;
        if(selectedElements.length === 0 || (jsonVal["sets"][0]["styling"] === "byOpt" && selectedElements[0].id.slice(0, -1) ===
            "sideLabel") || (jsonVal["sets"][0]["styling"] === "byAtt" && selectedElements[0].id.slice(0, -1) === "headerLabel"))
        {
            selectedElements = [parEl];
            delSelEl = true;
        }
        for(var i = 0; i < selectedElements.length; i++)
        {
            if(selectedElements[0].id.slice(0, -1) === "headerLabel")
            {
                ChangeStyle(undefined, undefined, undefined, true,
                    selectedElements[i].getAttribute("id").substr(-1) - 1, undefined);
            }
            else
            {
                ChangeStyle(undefined, undefined, undefined, true,
                    undefined, selectedElements[i].getAttribute("id").substr(-1) - 1);
            }

        }
        if(delSelEl)
        {
            selectedElements = [];
        }
    });

    /** permanent dropdown menu buttons*/
    $(document).on('click', '[id="swapColumnButton"]', function()
    {
        swapFirstColumn = this.parentElement.parentElement.parentElement.parentElement;
        swapFirstColumn.style.border = "solid";
    });

    $(document).on('click', '[id="swapRowButton"]', function()
    {
        swapFirstRow = this.parentElement.parentElement.parentElement.parentElement;
        swapFirstRow.style.border = "solid";
    });

    $(document).on('change', '[id="labelColumnInput"]', function()
    {
        var delSelEl = false;
        var parEl = this.parentElement.parentElement.parentElement;
        if(selectedElements.length === 0 || selectedElements[0].id.slice(0, -1) === "sideLabel")
        {
            selectedElements = [parEl];
            delSelEl = true;
        }
        
		for(var i = 0; i < selectedElements.length; i++)
        {
            changeColumnValues(selectedElements[i].id, this.value, undefined, undefined);
        }
        if(delSelEl)
        {
            selectedElements = [];
        }
    });

    $(document).on('click', '[class*="styleButton"]', function()
    {
        var newStyle = this.id;
        var parEl = this.parentElement.parentElement.parentElement.parentElement.parentElement;
		if(parEl.id.slice(0, -1) === "headerLabel")
        {
            changeStyle(newStyle, parEl.id, undefined, undefined);
        }
        else if(parEl.id.slice(0, -1) === "sideLabel")
        {
            changeStyle(newStyle, undefined, parEl.id, undefined);
        }
        else
        {
            parEl = this.parentElement.parentElement.parentElement.parentElement.parentElement;
            changeStyle(newStyle, undefined, undefined, parEl.id);
            var ShownStyles = document.getElementsByClassName("dropdown-item styleButton");
            for(var i = 0; i < ShownStyles.length; i++)
            {
                if(ShownStyles[i].id === getCell(parEl.id)["style"])
                {
                    ShownStyles[i].classList.add("curStyle");
                }
                else
                {
                    ShownStyles[i].classList.remove("curStyle");
                }
            }
        }
    });

    $(document).on('change', '[id="nameColumnInput"]', function()
    {
        if(!checkNameInUse(this.value))
        {
            changeColumnValues(this.parentElement.parentElement.parentElement.id, undefined,  this.value,undefined);
        }
		else
		{alert("option name in use")}
    });

    $(document).on('change', '[id="labelAttriInput"]', function()
    {
        var delSelEl = false;
        var parEl = this.parentElement.parentElement.parentElement;
        if(selectedElements.length === 0 || selectedElements[0].id.slice(0, -1) === "headerLabel")
        {
            selectedElements = [parEl];
            delSelEl = true;
        }
        for(var i = 0; i < selectedElements.length; i++)
        {
            changeAttriValues(selectedElements[0].id, this.value, undefined);
        }
        if(delSelEl)
        {
            selectedElements = [];
        }
    });

    $(document).on('change', '[id="varAttriInput"]', function()
    {
        changeAttriValues(this.parentElement.parentElement.parentElement.id, undefined, this.value);
    });

    // /** function for color options*/
    // $(document).on('click', '[class*="colorEl"]', function()
    // {
    //     var styleNumber = this.parentElement.parentElement.parentElement.parentElement.parentElement
    //         .parentElement.parentElement.parentElement.id.substr(-1) - 1;
    //     console.log(styleNumber);
    //     var styleElement = this.parentElement.parentElement.parentElement.parentElement.previousSibling.id;
    //     if(styleElement === "background")
    //     {
    //         ChangeStyle([this.classList[0], "w3-center", "w3-padding-4", "w3-margin-left"], undefined,
    //             undefined, false, styleNumber);
    //     }
    // });

   /** functions for box editing*/
    $(document).on('mouseenter', '[class^="w3-display-container"]', function()
    {
        boxDropDown(this.parentElement, true);
    });

    $(document).on('mouseleave', '[class^="w3-display-container"]', function(e)
    {
        if(menuOn === null)
        {
            boxDropDown(this.parentElement, false);
        }
    });
	
    $(document).on('change', '[id="innerTextInput"]', function()
    {
        setBoxText(this.parentElement.parentElement.parentElement.id, this.value, undefined);
    });

    $(document).on('change', '[id="outerTextInput"]', function()
    {
        setBoxText(this.parentElement.parentElement.parentElement.id, undefined, this.value);
    });

    $(document).on('change', '[id="varNameInput"]', function()
    {
        if(!checkNameInUse(this.value))
        {
            changeVarName(this.parentElement.parentElement.parentElement.id, this.value);
        }
		else
		{alert("variable name in use");}
    });

     /** functions for the dropdown menu*/
    $(document).on('mouseenter', '[class^="headerElement"]', function()
    {
        labelDropdown(this, true);
    });

    $(document).on('mouseleave', '[class^="headerElement"]', function()
    {
        if(menuOn === null)
        {
            labelDropdown(this, false);
        }
    });

    $(document).on('mouseenter', '[class^="sideElement"]', function()
    {
        attributeDropdown(this, true);
    });

    $(document).on('mouseleave', '[class^="sideElement"]', function()
    {
        if(menuOn === null)
        {
            attributeDropdown(this, false);
        }
    });
	
    /** main menu buttons*/
    $(document).on('click', '[id="nameButton"]', function()
    {
        document.getElementById("fileNameInput").value = fileName;
    });

    $(document).on('change', '[id="fileNameInput"]', function()
    {
        fileName = this.value;
    });

    /** functions for the default styles*/
    $(document).on('change', '[class="changeStyleInput"]', function()
    {
        var position = -1;
        for(var i = 1; i < jsonVal["styles"].length - 2; i++)
        {
            if(jsonVal["styles"][i]["name"] === this.id.substr(3))
            {
                position = i;
            }
            if(JSON.parse(this.value)["name"] === jsonVal["styles"][i]["name"] && JSON.parse(this.value)["name"] !== this.id.substr(3))
            {
                var textValue = JSON.parse(this.value);
                textValue["name"] = this.id.substr(3);
                this.value = JSON.stringify(textValue);
                position = -1;
				break;
            }
        }
        if(position >= 0)
        {
            jsonVal["styles"][position] = JSON.parse(this.value);
            this.id = "st_"+JSON.parse(this.value)["name"];
			
			updateScreenJson(jsonVal);
			var listEl = document.getElementsByClassName("dropright styleClass");
			for(j = 0; j < listEl.length; j++)
            {
                if(listEl[j].innerText.substr(6) !== jsonVal["styles"][j + 1]["name"])
                {
                    listEl[j].lastChild.firstChild.innerHTML = JSON.stringify(jsonVal["styles"][j + 1]);
                    listEl[j].innerHTML = listEl[j].innerHTML.replace(listEl[j].innerText.substr(6),
                        jsonVal["styles"][j + 1]["name"]);
                }
            }
        }
    });

    $(document).on('click', '[id="newStyleButton"]', function()
    {
        addNewStyle();
    });

    /** functions for undo and redo*/
    $(document).on('click', '[id="undoButton"]', function()
    {
        undo();
    });

    $(document).on('click', '[id="redoButton"]', function()
    {
        redo();
    });

    /** functions for key shortcuts*/
    $(document).keydown(function(event)
    {
        /*control*/
        if(event.which === 17)
        {
            controlPressed = true;
        }
        /* control + z*/
        else if(event.which === 90)
        {
            if(controlPressed)
            {
                undo();
            }
        }
        /* control + y*/
        else if(event.which === 89)
        {
            if(controlPressed)
            {
                redo();
            }
        }
    });

    $(document).keyup(function(event)
    {
        if(event.which === 17)
        {
            controlPressed = false;
        }
    });

    /** functions for downloading json file*/
    $(document).on('click', '[id="downloadButton"]', function()
    {
        var jsonString = JSON.stringify(jsonVal, null, '\t');
        // jsonString = jsonString.replace(/testtest/g, "\r\n");
        download(fileName + ".json", jsonString);
    });

    /* NOTE: only works in browsers that support html5*/
    /* reference: https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server*/
    function download(filename, text)
    {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    /** uploads a json file to use in the editor*/
    $(document).on('change', '[id="fileInput"]', function(event)
    {
        var input = event.target;
        var reader = new FileReader();
        reader.onload = function()
        {
            loadJson(undefined, JSON.parse(reader.result));
            updateScreenJson(jsonVal);
        };
        reader.readAsText(input.files[0]);
    });

    /** opens dropdowns within dropdowns*/
    $(document).on('click', '[class="dropdown-toggle dropdown-item"]', function()
    {
        /* reference: https://bootsnipp.com/snippets/35p8X*/
        if (!$(this).next().hasClass('show')) {
            $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
        }
        var $subMenu = $(this).next(".dropdown-menu");
        $subMenu.toggleClass('show');

        $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function () {
            $('.dropdown-submenu .show').removeClass("show");
        });

        return false;
    });

    /** regulates the onclick cases where the dropdown menu should not expand, i.e. swapping or selecting*/
    $(document).on('click', '[class="btn btn-primary dropdown-toggle"]', function()
    {
        var index1;
        var index2;
        /*if the users is swapping columns*/
        if(swapFirstColumn !== null)
        {
            index1 = swapFirstColumn.id.substr(-1) - 1;
            index2 = this.parentElement.parentElement.id.substr(-1) - 1;
            swapColumns(index1, index2);
            swapFirstColumn = null;
        }
        /*if the users is swapping rows*/
        else if(swapFirstRow !== null)
        {
            index1 = swapFirstRow.id.substr(-1) - 1;
            index2 = this.parentElement.parentElement.id.substr(-1) - 1;
            swapRows(index1, index2);
            swapFirstRow = null;
        }
        else if(controlPressed === true)
        {
            var parEl = this.parentElement.parentElement;

            if(!checkElementInSelected(parEl))
            {
                if(selectedElements.length >0 && parEl.id.slice(0, -1) !== selectedElements[0].id.slice(0, -1))
                {
                    changeColorSelected("none");
                    selectedElements = [];
                }
                selectedElements.push(parEl);
                changeColorSelected("dashed");
            }
            else
            {
                selectedElements.splice(selectedElements.indexOf(parEl), 1);
                parEl.style.border = "none";
            }
            // console.log(selectedElements);
        }
    });

    /** manages the preview window*/
    $(document).on('mouseenter', '[class^="colElement"]', function()
    {
        var hoverData = document.getElementById("processData").value;
        var preview = "";
        hoverData = hoverData.slice(0, hoverData.lastIndexOf("\n"));
        for(i = 0; i < 4; i++)
        {
            preview = hoverData.substr(hoverData.lastIndexOf("\n")) + "<br>" + preview;
            hoverData = hoverData.slice(0, hoverData.lastIndexOf("\n"));
        }
        document.getElementById("preview").innerHTML = preview;
    });

    /** functions for box dragging*/
    $(document).on('mousedown', '[id="boxHandle"]', function(e)
    {
        dragMouseX = e.clientX;
        dragMouseY = e.clientY;
        this.parentElement.innerHTML = this.parentElement.innerHTML + '<div id="dragBox"></div>';
        $("#dragBox").css({"position": "absolute", "top": "0px", "left": "0px", "background-color":"green"});

    });

    $(document).on('mouseup', '[id="container"]', function()
    {
        dragMouseX = null;
        dragMouseY = null;
    });

    $(document).on('mousemove', '[id="container"]', function(e)
    {
        if(dragMouseX !== null && dragMouseY !== null)
        {
            var xSize = e.clientX - dragMouseX;
            var ySize = e.clientY - dragMouseY;
            //var cellNumber = this.parentElement.parentElement.parentElement.id.substr(-1);
            // $("#dragBox").css({"width":xSize.toString(), "height":ySize.toString()});
            ChangeCellWidth(xSize + 25, ySize + 80, 0);
        }
    });

   /* function to manually toggle dropdown menus*/
    $(document).on('click', '[class*="dropdownDiv"]', function(e)
    {
        if(this.lastChild.classList.contains("show") || (menuOn !== null && !menuOn.isSameNode(this)))
        {
            menuOn.lastChild.classList.remove("show");
            menuOn = null;
        }
        else
        {
            this.lastChild.classList.add("show");
            menuOn = this;
            tempJsonVal = arrayCopy(jsonVal);
            //console.log(arrayCopy(tempJsonVal));
        }
    });

    /* function to given prompt when clicked outside dropdown menu*/
    $(document).on('click', 'body', function(e)
    {
        if(menuOn !== null && !$('.btn-primary').is(e.target))
        {
            if(JSON.stringify(tempJsonVal) === JSON.stringify(jsonVal) || confirm("Discard changes?"))
            {
                var dropdownUl =  menuOn.lastChild;
                dropdownUl.classList.remove("show");
                menuOn = null;
                labelDropdown(dropdownUl.parentElement.parentElement, false);
//                console.log(arrayCopy(tempJsonVal));
                jsonVal = arrayCopy(tempJsonVal);
                updateScreenJson(jsonVal);
            }
        }
    });																	
	}
	
    /** creates and deletes the dropdown menu for the labels*/
    function labelDropdown(element, dropdownOff)
    {
        /* if the hover is on the attribute label column, do nothing*/
        if(element.getAttribute("id") === "headerLabel0")
        {

        }
        /* check if the dropdown button needs to be added or removed*/
        else if(dropdownOff && element.textContent === jsonVal["opt"][element.id.substr(-1) - 1]["label"])
        {
            // var optionalButtons = dropdownStyleHtml;

            var oldLabel = element.textContent;
            var optNumber = element.id.substr(-1) - 1;
            var oldName = jsonVal["opt"][optNumber]["name"];
            var columnWidth = jsonVal["opt"][optNumber]["width"].slice(0, -1);

            var styleButtons = getStyleButtons();

            /* add the html dropdown  to the label */
            element.innerHTML = '<div class="dropdown dropdownDiv">' +
            //data-toggle="dropdown"
            '<button class="btn btn-primary dropdown-toggle" type="button" >' + oldLabel +
            '<span class="caret"></span></button><ul class="dropdown-menu">' +
            'Label: <input type="text" id="labelColumnInput" value="' + oldLabel + '">' +
            'Name: <input type="text" id="nameColumnInput" value="' + oldName + '">' +
            '<li><a class="dropdown-item" id="delButton" >Delete</a></li>' +
            '<li>Width: <input type="text" id="columnWidthInput" value="' + columnWidth +'"></li>' +
            '<li><a class="dropdown-item" type="text" id="swapColumnButton">Swap</a></li>' +
            '<li class="dropright"><a class="dropdown-toggle dropdown-item">style</a>' +
            '<ul class="dropdown-menu">' + styleButtons +
            '</ul></li><div class="dropdown-divider"></div>' +
            '<li><a class="dropdown-item" type="text" id="okButton">Ok</a></li>' +
            '</div>';
        }
        else if(menuOn === null && jsonVal["opt"][element.id.substr(-1) - 1] !== undefined)
        {
            /* set the label back to the json label*/
            element.innerHTML = jsonVal["opt"][element.id.substr(-1) - 1]["label"];
        }
    }

    function attributeDropdown(element, dropdownOff)
    {
        /* check if the dropdown button needs to be added or removed*/
        if(dropdownOff && element.textContent === jsonVal["attr"][element.getAttribute("id").substr(-1) - 1]["label"])
        {
            // var optionalButtons = dropdownStyleHtml;

            var oldLabel = element.textContent;
            var name = jsonVal["attr"][element.id.substr(-1) - 1]["name"];
            var attriHeight = jsonVal["attr"][element.id.substr(-1) - 1]["height"].slice(0, -2);

            var styleButtons = getStyleButtons();

            /* add the html dropdown  to the div */
            element.innerHTML = '<div class="dropdown dropdownDiv">' +
                '<button class="btn btn-primary dropdown-toggle" type="button"">' + oldLabel +
                '<span class="caret"></span></button><ul class="dropdown-menu">' +
                'Label: <input type="text" id="labelAttriInput" value="' + oldLabel + '">' +
                'Name: <input type="text" id="varAttriInput" value="' + name + '">' +
                '<li><a class="dropdown-item" id="attriDelButton" >Delete</a></li>' +
                '<li>Height: <input type="text" id="attriHeightInput" value="' + attriHeight +'"></li>' +
                '<li><a class="dropdown-item" type="text" id="swapRowButton">Swap</a></li>' +
                '<li class="dropright"><a class="dropdown-toggle dropdown-item">style</a>' +
                '<ul class="dropdown-menu">' + styleButtons +
                '</ul></li><div class="dropdown-divider"></div>' +
                '<li><a class="dropdown-item" type="text" id="okButton">Ok</a></li>' +
                '</div>';
        }
        else if(menuOn === null && jsonVal["attr"][element.getAttribute("id").substr(-1) - 1] !== undefined)
        {
            /* set the attribute label back to the json label*/
            element.innerHTML = jsonVal["attr"][element.getAttribute("id").substr(-1) - 1]["label"];
        }
    }


    /** adds the hover button to the box with the given id*/
    function boxDropDown(element, dropdownOff)
    {
        /* check if the dropdown button needs to be added or removed*/
        if(dropdownOff && document.getElementById("boxDropdown") === null)
        {
            
            var cell = getCell(element.id);
			var varName = cell["var"];
//			console.log(varName)
			var innerText = cell["txt"];
			var outerText = cell["box"];
			
		    var styleButtons = getStyleButtons();

            /* add the html dropdown  to the div */
            element.innerHTML = element.innerHTML + "<div class='dropdown dropdownDiv' id='boxDropdown'>" +
                "<button class='btn btn-primary dropdown-toggle' type='button'>" +
                "<span class='caret'></span></button><ul class='dropdown-menu'>" +
                "Inner text:<input type='text' id='innerTextInput' value=\"" + innerText.replace(/"/g, "'") + "\">" +
                "Outer text:<input type='text' id='outerTextInput' value=\"" + outerText.replace(/"/g, "'") + "\">" +
                "Variable name:<input type='text' id='varNameInput' value=\"" + varName + "\">" +
                "<li class='dropright'><a class='dropdown-toggle dropdown-item'>style</a>" +
                "<ul class='dropdown-menu'>" + styleButtons + "</ul></li>" +
                '<div class="dropdown-divider"></div>' +
                '<li><a class="dropdown-item" type="text" id="okButton">Ok</a></li>' +
                '</div>';
            element.style.position = "relative";
            $("#boxDropdown").css({"position": "absolute", "top": "4px", "right": "7px"});

            var ShownStyles = document.getElementsByClassName("dropdown-item styleButton");
            for(var i = 0; i < ShownStyles.length; i++)
            {
                if(ShownStyles[i].id === cell["style"])
                {
                    ShownStyles[i].classList.add("curStyle");
                }
            }
//            document.getElementById(cell["style"]).classList.add("curStyle");
            /* code for the box handle*/
//            element.innerHTML = element.innerHTML + '<div id="boxHandle"></div>';
//            $("#boxHandle").css({"position": "absolute", "bottom": "0px", "right": "0px", "height":"15px", "width":"15px",
//            "background-color":"white"});
        }
        else if(!dropdownOff && menuOn === null)
        {
            /* set the attribute label back to the json label*/
            document.getElementById("boxDropdown").remove();
//            document.getElementById("boxHandle").remove();
        }
    }


    /** adds the add-button to the label row*/
    function addAddButton()
    {
        $("#headerLabels").append('<button type="button" id="addButton">add</button>');
    }

    /** adds the add-button to the label row*/
    function addAttriButton()
    {
        $("#button0").append('<button type="button" id="attriButton">attri</button>');
    }


    /** Copies the last column and adds it at the end of options */
    function addSameColumn()
    {
        /* copy the last option, change its name and add it to jsonVal*/
        var option = arrayCopy(jsonVal["opt"][jsonVal["opt"].length - 1]);
        var name = newName(option["name"]);
        option["name"] = name;
        // option["label"] = newName(option["label"]);
        jsonVal["opt"].push(option);

        /*copy the last cells and add them to cell*/
        for(var i = 0; i < jsonVal["attr"].length; i++)
        {
            var keys = Object.keys(jsonVal["cell"][i]);
            jsonVal["cell"][i][name] = arrayCopy(jsonVal["cell"][i][keys[keys.length - 1]]);
        }

        /*  update var en delay var*/
        var varnames = getVarNames(jsonVal,jsonVal["opt"].length-2,undefined)
		for(i = 0; i < varnames.length; i++)
        {
            var varName = newName(getCell(undefined, varnames[i])["var"]);
            getCell(undefined, varnames[i])["var"] = varName;
            jsonVal["delay"]["var"].push(varName);
        }

        /* updates the delay matrix, copying were possible, adding 0 otherwise*/
        var delayMatrix = jsonVal["delay"]["delays"];
        var numAttri = varnames.length;
        for(i = 0; i < numAttri; i++)
        {
            delayMatrix.push([]);
            for(var j = 0; j < delayMatrix[0].length; j++)
            {
                delayMatrix[delayMatrix.length - 1].push(delayMatrix[delayMatrix.length - 2][j]);
            }
        }
        for(i = 0; i < delayMatrix.length; i++)
        {
            for(j = 0; j < numAttri; j++)
            {
                delayMatrix[i].push(0);
            }
        }

        /* add the new option to the order*/
        if (Array.isArray(jsonVal["optOrders"][0]["opt"]))
		{
		jsonVal["optOrders"][0]["opt"].push(name);
		}
        /* updates the screen*/
        updateScreenJson(jsonVal);
    }

    /** deletes a column at the target index*/
    function delTargetColumn(indexTarget)
    {
        /* if no target is specified, take the last column*/
        if(indexTarget === undefined)
        {
            indexTarget = jsonVal["opt"].length - 1;
        }

        /* update the delay vars and matrix and update the names array*/
         var varnames = getVarNames(jsonVal,indexTarget,undefined)
		
		for(var i = 0; i < varnames.length; i++)
        {
            var varIndex = jsonVal["delay"]["var"].indexOf(varnames[i]);
            jsonVal["delay"]["var"].splice(varIndex, 1);
            jsonVal["delay"]["delays"].splice(varIndex, 1);
            for(var j = 0; j < jsonVal["delay"]["delays"].length; j++)
            {
                jsonVal["delay"]["delays"][j].splice(varIndex, 1);
            }
            deleteName(varnames[i]);
        }

        /* update the option order*/
        if (Array.isArray(jsonVal["optOrders"][0]["opt"]))
		{
			var optOrderIndex = jsonVal["optOrders"][0]["opt"].indexOf(jsonVal["opt"][indexTarget]["name"]);
        jsonVal["optOrders"][0]["opt"].splice(optOrderIndex, 1);
		}
        /* update the names array*/
        deleteName(jsonVal["opt"][indexTarget]["name"]);
        // deleteName(jsonVal["opt"][indexTarget]["label"]);

        

        /* remove the cells*/
        for(i = 0; i < jsonVal["cell"].length; i++)
        {
            delete jsonVal["cell"][i][getKey(i, indexTarget)];
        }

		/* remove the column*/		
        jsonVal["opt"].splice(indexTarget, 1);
		
        /* update the screen*/
        updateScreenJson(jsonVal);
    }

    /** Copies the last row of attributes and adds it at the end of options */
    function addSameAttribute()
    {
        /* adds a new attribute with new name to attr*/
        jsonVal["attr"].push(arrayCopy(jsonVal["attr"][jsonVal["attr"].length - 1]));
        jsonVal["attr"][jsonVal["attr"].length-1]["name"] = newName(jsonVal["attr"][jsonVal["attr"].length - 2]["name"]);
		jsonVal["cell"].push(arrayCopy(jsonVal["cell"][jsonVal["cell"].length - 1]));
        /* updates the delay matrix, copying were possible, adding 0 otherwise*/
		
		 /*  update var en delay var*/
        var varnames = getVarNames(jsonVal,undefined,jsonVal["attr"].length - 1)
//		console.log(varnames)
		for(i = 0; i < varnames.length; i++)
        {
            var varName = newName(varnames[i]);
			
            getCell(undefined, varnames[i], undefined,jsonVal["attr"].length - 1)["var"] = varName;
            jsonVal["delay"]["var"].push(varName);
		}

        /* updates the delay matrix, copying were possible, adding 0 otherwise*/
        var delayMatrix = jsonVal["delay"]["delays"];
        var numAttri = varnames.length;
		
		for(i = 0; i < numAttri; i++)
        {
            delayMatrix.push([]);
            for(var j = 0; j < delayMatrix[0].length; j++)
            {
                delayMatrix[delayMatrix.length - 1].push(delayMatrix[delayMatrix.length - 2][j]);
            }
        }
        for(i = 0; i < delayMatrix.length; i++)
        {
            for(j = 0; j < numAttri; j++)
            {
                delayMatrix[i].push(0);
            }
        }
			

        /* update the screen*/
        updateScreenJson(jsonVal);
    }

    /** deletes an attribute at the target index*/
    function delTargetAttri(indexTarget)
    {
        /* if no target is specified, take the last column*/
        if(indexTarget === undefined)
        {
            indexTarget = jsonVal["attr"].length - 1;
        }

        /* deletes the attribute en updates name*/
        deleteName(jsonVal["attr"][indexTarget]["name"]);
		
		var varnames = getVarNames(jsonVal,undefined,indexTarget)
		
		for(var i = 0; i < varnames.length; i++)
        {
            var varIndex = jsonVal["delay"]["var"].indexOf(varnames[i]);
            jsonVal["delay"]["var"].splice(varIndex, 1);
            jsonVal["delay"]["delays"].splice(varIndex, 1);
            for(var j = 0; j < jsonVal["delay"]["delays"].length; j++)
            {
                jsonVal["delay"]["delays"][j].splice(varIndex, 1);
            }
            deleteName(varnames[i]);
        }
		
        jsonVal["attr"].splice(indexTarget, 1);

       
        /*deletes the attribute in cells*/
        jsonVal["cell"].splice(indexTarget, 1);

        /* update the screen*/
        updateScreenJson(jsonVal);
    }

    /** changes the width and height of the given cell to the given values (in % and px)*/
    function ChangeCellWidth(width, height, cellNumber)
    {
        /* if no cell number is specified or if its impossible, take the first cell*/
        var cell;
        if(cellNumber === undefined || cellNumber < 0 || cellNumber >= jsonVal["cells"].length)
        {
            cell = jsonVal["cells"][0];
        }
        else
        {
            cell = jsonVal["cells"][cellNumber];
        }

        /* if no width is specified, or the width is impossible, use current value*/
        if(width === undefined || parseInt(width) < 0)
        {
            width = parseInt(cell["width"].slice(0, -1));
        }
        if(height === undefined || parseInt(height) < 0)
        {
            height = parseInt(cell["height"].slice(0, -2));
        }

        /* changes the width and update the screen*/
        cell["width"] = width.toString() + "%";
        cell["height"] = height.toString() + "px";

        updateScreenJson(jsonVal);
    }

    /** switches the placement of two options and corresponding order and cells*/
    function swapColumns(optIndex1, optIndex2)
    {
		
		

        var storeOptLabel = arrayCopy(jsonVal["opt"][optIndex1]["label"]);
        jsonVal["opt"][optIndex1]["label"] = arrayCopy(jsonVal["opt"][optIndex2]["label"]);
        jsonVal["opt"][optIndex2]["label"] = storeOptLabel;

        var storeOptWidth = arrayCopy(jsonVal["opt"][optIndex1]["width"]);
        jsonVal["opt"][optIndex1]["width"] = arrayCopy(jsonVal["opt"][optIndex2]["width"]);
        jsonVal["opt"][optIndex2]["width"] = storeOptWidth;

        for(var i = 0; i < jsonVal["cell"].length; i++)
        {
            var storeCell = arrayCopy(jsonVal["cell"][i][getKey(i, optIndex1)]);
            jsonVal["cell"][i][getKey(i, optIndex1)] = arrayCopy(jsonVal["cell"][i][getKey(i, optIndex2)]);
            jsonVal["cell"][i][getKey(i, optIndex2)] = storeCell;
        }

		var optName1=jsonVal["opt"][optIndex1]["name"];
		var optName2=jsonVal["opt"][optIndex2]["name"];
		jsonVal["opt"][optIndex2]["name"] = optName1;
		jsonVal["opt"][optIndex1]["name"] = optName2;
		
		
		newCell=[]
		for(var i = 0; i < jsonVal["cell"].length; i++)
        {
            
			[jsonVal["cell"][i][optName1],jsonVal["cell"][i][optName2]]=[jsonVal["cell"][i][optName2],jsonVal["cell"][i][optName1]]
        }
		
		
		
        jsonVal["optOrders"][0]["opt"][optIndex1]=optName2;
        jsonVal["optOrders"][0]["opt"][optIndex2] = optName1;
        
        updateScreenJson(jsonVal);
    }

    /** switches the placement of two attributes and corresponding order and cells*/
    function swapRows(attriIndex1, attriIndex2)
    {
        var storeCell = arrayCopy(jsonVal["cell"][attriIndex1]);
        jsonVal["cell"][attriIndex1] = arrayCopy(jsonVal["cell"][attriIndex2]);
        jsonVal["cell"][attriIndex2] = storeCell;

		var storeAttr = arrayCopy(jsonVal["attr"][attriIndex1]);
		jsonVal["attr"][attriIndex1]= arrayCopy(jsonVal["attr"][attriIndex2]);
		jsonVal["attr"][attriIndex2]=storeAttr;
		
        

        updateScreenJson(jsonVal);
    }

    /** sets the text of the given square, by html id*/
    function setBoxText(squareId, textInside, textOutside)
    {
        /* if no squareId is specified, do nothing*/
        if(squareId === undefined)
        {
            return;
        }

        /* get the correct option corresponding to the id*/
        var cell = getCell(squareId);

        /* if no text is specified, keep text the same, else replace ' with " and add an outer div*/
        if(textInside === undefined)
        {
            textInside =  cell["txt"];
        }
        else
        {
            textInside = textInside.replace(/"/g, "'");
            //textInside = '<div class="w3-display-middle">' + textInside + '</div>';
        }
        if(textOutside === undefined)
        {
            textOutside =  cell["box"];
        }
        else
        {
            textOutside = textOutside.replace(/"/g, "'");
            //textOutside = '<div class="w3-display-middle">' + textOutside + '</div>';
        }

        /* changes the text in the correct attribute and update the screen*/
        cell["txt"] = textInside;
        cell["box"] = textOutside;

        updateScreenJson(jsonVal);
    }

    /** */
    function changeVarName(squareId, varName)
    {
        /* if no squareId is specified, do nothing*/
        if(squareId === undefined)
        {
            return;
        }

        /* get the correct option corresponding to the id*/
        var cell = getCell(squareId);

        /* if no text is specified or if it is the empty string, keep the var name the same*/
        var oldname = cell["var"];
        if(varName === undefined || varName === "")
        {
            varName = oldname;
        }

        jsonVal["delay"]["var"][jsonVal["delay"]["var"].indexOf(oldname)] = varName;
		deleteName(oldname);
		names.push(varName);
        /* changes the text in the correct attribute and update the screen*/
        cell["var"] = varName;

        updateScreenJson(jsonVal);
    }

    /** changes the settings of an option given by id to the given settings*/
    function changeColumnValues(optId, labelText, newName, width)
    {
        /* if no squareId is specified, do nothing*/
        if(optId === undefined)
        {
            return;
        }

        /* get the correct option corresponding to the id*/
        var option = jsonVal["opt"][optId.substr(-1) - 1];

        /* if no text is specified or if it is the empty string, keep the names the same, otherwise change the names*/
        if(labelText !== undefined && labelText !== "")
        {
            option["label"] = labelText;
        }
        if(newName !== undefined && newName !== "")
        {
            if (checkNameInUse(newName)) {alert("option name in use");return false};
			jsonVal["optOrders"][0]["opt"][jsonVal["optOrders"][0]["opt"].indexOf(option["name"])] = newName;
            deleteName(option["name"]); 
			names.push(newName);
			changeOptKey(newName, option["name"]);
            option["name"] = newName;
			
			
        }
        if(width !== undefined && width > 0)
        {
            option["width"] = width.toString() + "%";
        }

        /* Update the screen*/
        updateScreenJson(jsonVal);
    }

    /** changes the names of an option given by id to the given names*/
    function changeAttriValues(squareId, labelText, newName, height)
    {
        /* if no squareId is specified, do nothing*/
        if(squareId === undefined)
        {
            return;
        }

        /* if no text is specified or if it is the empty string, keep the names the same, otherwise change the names*/
        if(labelText !== undefined && labelText !== "")
        {
            jsonVal["attr"][squareId.substr(-1) - 1]["label"] = labelText;
        }
        if(newName !== undefined && newName !== "")
        {
            if (checkNameInUse(newName)) {alert("attribute name in use"); return false}
			else {
			deleteName(jsonVal["attr"][squareId.substr(-1) - 1]["name"]);
			jsonVal["attr"][squareId.substr(-1) - 1]["name"] = newName;
			names.push(newName);
			}
		}
        if(height !== undefined && height > 0)
        {
            jsonVal["attr"][squareId.substr(-1) - 1]["height"] = height.toString() + "px";
        }

        /* Update the screen*/
        updateScreenJson(jsonVal);
    }

    /** changes the style of the given option, row or cell*/
    function changeStyle(newStyle, optId, attrId, cellId)
    {
        /* check for style*/
        if(newStyle !== undefined)
        {
            /* check which of the three is used*/
            if(optId !== undefined)
            {
                var optNum = optId.substr(-1) - 1;
                var varnames = getVarNames(jsonVal,optNum, undefined)
				
				for(var i = 0; i < varnames.length; i++)
                {
                    getCell(undefined,varnames[i])["style"] = newStyle
                }
            }
            if(attrId !== undefined)
            {
                var attriNum = attrId.substr(-1) - 1;
                var varnames = getVarNames(jsonVal,undefined, attriNum)
				
				for(var i = 0; i < varnames.length; i++)
                {
                    getCell(undefined,varnames[i])["style"] = newStyle
                }
            }
            if(cellId !== undefined)
            {
                console.log(cellId);
                getCell(cellId)["style"] = newStyle;
            }
        }

        /* Update the screen*/
        updateScreenJson(jsonVal);
    }

  

    /** sets the json back to the previous action*/
    function undo()
    {
        if(undoStack.length > 1)
        {
            if(!allowedRedo)
            {
                redoStack = [];
            }
            redoStack.push(arrayCopy(undoStack[undoStack.length - 1]));
            undoStack.pop();
            jsonVal = arrayCopy(undoStack[undoStack.length - 1]);
            updateScreenJson(jsonVal);
            undoStack.pop();
            allowedRedo = true;
        }
    }

    /** reverse the undo action*/
    function redo()
    {
        if(allowedRedo && redoStack.length >= 1)
        {
            jsonVal = arrayCopy(redoStack[redoStack.length - 1]);
            redoStack.pop();
            updateScreenJson(jsonVal);
            allowedRedo = true;
        }
    }

    /** loads the json on page load*/
    function loadJson(filepath, jsonF)
    {
        if(filepath !== undefined)
        {
            $.getJSON(filepath, function(result)
            {
                jsonVal = result;
                undoStack.push(arrayCopy(jsonVal));
                addStyleButtons();
				names=getVarNames(jsonVal, undefined, undefined);
            });
        }
        else if(jsonF !== undefined)
        {
            jsonVal = jsonF;
            undoStack.push(arrayCopy(jsonVal));
            addStyleButtons();
			names=getVarNames(jsonVal, undefined, undefined);
        }
    }

    /** adds the butons with style names to the main menu dropdown on page load*/
    function addStyleButtons()
    {
        for(var i = 1; i < jsonVal["styles"].length - 2; i++)
        {
            var value = JSON.stringify(jsonVal["styles"][i]);
            document.getElementById("stylesButton").innerHTML = document.getElementById("stylesButton").innerHTML +
                '<li class="dropright styleClass"><a class="dropdown-toggle dropdown-item">style ' + jsonVal["styles"][i]["name"] + '</a>' +
                '<ul class="dropdown-menu"><textarea rows="4" cols="50" class="changeStyleInput" id="st_' + jsonVal["styles"][i]["name"] + '">' +
                value + '</textarea></ul></li>';
            //<input type="text" class="changeStyleInput" id="' + jsonVal["styles"][i]["name"] + '"' + ' value=\'' + value + '\'>
        }
    }

    /** returns the style buttons for the opt, attri and cell dropdowns */
    function getStyleButtons()
    {
        var styleButtons = "";
        for(var i = 1; i < jsonVal["styles"].length - 2; i++)
        {
            styleButtons = styleButtons + '<li class="dropdown-item styleButton" id="' + jsonVal["styles"][i]["name"] + '">' +
                'Style:' + jsonVal["styles"][i]["name"] + '</li>';
        }
        return styleButtons;
    }

    function addNewStyle()
    {
        jsonVal["styles"].splice(jsonVal["styles"].length - 3, 0, arrayCopy(jsonVal["styles"][jsonVal["styles"].length - 3]));
        var position = jsonVal["styles"].length - 3;
        jsonVal["styles"][position]["name"] = newName(jsonVal["styles"][position]["name"]);
        document.getElementById("stylesButton").innerHTML = document.getElementById("stylesButton").innerHTML +
            '<li class="dropright styleClass"><a class="dropdown-toggle dropdown-item">style ' + jsonVal["styles"][position]["name"] + '</a>' +
            '<ul class="dropdown-menu"><textarea rows="4" cols="50" class="changeStyleInput" id="st_' + jsonVal["styles"][position]["name"]
            + '">' + JSON.stringify(jsonVal["styles"][position]) + '</textarea></ul></li>';
    }

    /** changes the json variable to the inputted variable and updates the screen*/
    function updateScreenJson(newJson)
    {
		if(menuOn === null)
        {				   
            json = Object.assign({}, newJson);
            printJSON();
            var tempOpt = json["optOrders"][0]["opt"];
            var tempAttr = json["optOrders"][0]["attr"];

            json["optOrders"][0]["opt"]="standard";
            json["optOrders"][0]["attr"]="standard";
            refreshTrial($("#trialid").val(), 0);
            json["optOrders"][0]["opt"]=tempOpt;
            json["optOrders"][0]["attr"]=tempAttr;
            /* regulates the undo/redo functionality*/
            undoStack.push(arrayCopy(jsonVal));
            allowedRedo = false;

            /* adds the add buttons*/
            addAddButton();
            addAttriButton();

            /* make sure that selected elements are correctly shown*/
            changeColorSelected("dashed");
		}
	}

    /** changes the key of an option*/
    function changeOptKey(newKey, oldKey, oldKeyIndex)
    {
        if(oldKey === undefined)
        {
            oldKey = jsonVal["opt"][oldKeyIndex]["name"]
        }
        for(var i = 0; i < jsonVal["cell"].length; i++)
        {
            jsonVal["cell"][i][newKey] = jsonVal["cell"][i][oldKey];
            delete jsonVal["cell"][i][oldKey];
        }
    }

    /** changes the color of the selected elements*/
    function changeColorSelected(borderStyle)
    {
        for(var i = 0; i < selectedElements.length; i++)
        {
            document.getElementById(selectedElements[i].id).style.border = borderStyle;
        }
    }

    /** check if the inputted name is already in use*/
    function checkNameInUse(name)
    {
        if (names.indexOf(name)==-1) {return false}
		else{return true}
		//for(var i = 0; i < jsonVal["opt"].length; i++)
        //{
        //    if(name === jsonVal["opt"][i]["name"])
        //    {
        //        return true;
         //   }
        //}
        //return false;
    }

    

    /** uses html ids to check if an element is already selected*/
    function checkElementInSelected(element)
    {
        var id = element.id;
        for(var i = 0; i < selectedElements.length; i++)
        {
            if(selectedElements[i].id === id)
            {
                return true;
            }
        }
        return false;
    }

   

    /** returns a new name based on the inputted name that is not already in the names var*/
    function newName(oldName)
    {
        var count = 1; // counting variable for the while loop
        var endString = -1; // string to append to the end of the name

        /* add the numbers at th end of the name to endstring, if any*/
        while(/^\d+$/.test(oldName.substring(oldName.length - count, oldName.length)))
        {
            endString = parseInt(oldName.substring(oldName.length - count, oldName.length), 10);
            count++;
        }

        /* if the string ended with a number, increase it by 1, else, add "1", repeat in case the name was already in use*/
        var result;
        do
        {
            if(endString !== -1)
            {
                endString++;
                result = oldName.substring(0, oldName.length - (count - 1)) + String(endString);
            }
            else
            {
                result = oldName + "1";
                endString = 1;
            }
        }
        while(names.indexOf(result) !== -1);

        /* update names and return the result*/
        names.push(result);
        return result;
    }

   
    /** gets the cell key from the cake*/
    function getKey(attriNum, optNum)
    {
        return jsonVal["opt"][optNum]["name"]
		//return Object.keys(jsonVal["cell"][attriNum])[optNum];
    }

    /** finds the option corresponding to the given html id*/
    function getCell(squareId, cellname, optNum, attrNum)
    {
        //get cell name from name attribute of mother element
		if (squareId!==undefined) {cellname=$("#"+squareId).attr("name");}
		cellout=[];	
		//loop through all the cells to find the right cell values (note works with new subcell format)
		for (var i=0;i<jsonVal["cell"].length;i++)
			{	
			var optNames;
			if (optNum!==undefined) {optNames=[jsonVal["opt"][optNum]["name"]]} else {optNames=Object.keys(jsonVal["cell"][i])}
		
			optNames.forEach(function(k){
			if (i==attrNum || attrNum===undefined)
			{
		
			if (jsonVal["cell"][i][k].length!==undefined)
				{
				// more than one cell
					for (var j=0;j<jsonVal["cell"][i][k].length;j++)
					//one row of cells
					{
					if (jsonVal["cell"][i][k][j].length!==undefined)
						{
						//more than one row 
						for (l=0;l<jsonVal["cell"][i][k][j].length;l++)
							{
								if (jsonVal["cell"][i][k][j][l]["var"]==cellname)
								{cellout=jsonVal["cell"][i][k][j][l];}
							}
						}
						else
						{
							if (jsonVal["cell"][i][k][j]["var"]==cellname)
							{cellout=jsonVal["cell"][i][k][j];}
						
						}
					}
				}
				else
				{
					if (jsonVal["cell"][i][k]["var"]==cellname)
					{cellout=jsonVal["cell"][i][k];}
				}
			}
			})
			}
		return cellout;
		
    }

    /** remove the given name from names*/
    function deleteName(name)
    {
        var nameIndex = names.indexOf(name);
        names.splice(nameIndex, 1);
    }

    /** deep copy the given array*/
    function arrayCopy(array)
    {
        return JSON.parse(JSON.stringify(array));
    }

	function getVarNames(jsonPart, optNum, attrNum)
	{
	namesArray=[];
	for (var i=0;i<jsonPart["cell"].length;i++)
		{	
		//get names
		var optNames;
		if (optNum!==undefined) {optNames=[jsonVal["opt"][optNum]["name"]]} else {optNames=Object.keys(jsonPart["cell"][i])}
		
		optNames.forEach(function(k){
			
		if (i==attrNum || attrNum===undefined)
		{
			
		if (jsonPart["cell"][i][k].length!==undefined)
			{
			// more than one cell
				for (var j=0;j<jsonPart["cell"][i][k].length;j++)
				//one row of cells
				{
				if (jsonPart["cell"][i][k][j].length!==undefined)
					{
					//more than one row 
					for (l=0;l<jsonPart["cell"][i][k][j].length;l++)
						{
							namesArray.push(jsonPart["cell"][i][k][j][l]["var"]);
						}
					}
					else
					{
						namesArray.push(jsonPart["cell"][i][k][j]["var"]);
					
					}
				}
			}
			else
			{
				namesArray.push(jsonPart["cell"][i][k]["var"]);
			}
			}
			
		})
		}
	if (optNum===undefined && attrNum==undefined)
	{ //add opt and attr names 
	for (var i=0;i<jsonPart["opt"].length;i++)
		{namesArray.push(jsonPart["opt"][i]["name"])}
	for (var i=0;i<jsonPart["attr"].length;i++)
		{namesArray.push(jsonPart["attr"][i]["name"])}
	}
	return namesArray
	}