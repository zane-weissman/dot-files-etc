/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  PasswordSaver objects are added to each browser object when KFUI needs to present
  an interface to the user to help them save a password to a new or existing entry.

  This program is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation; either version 2 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software
  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
"use strict";

keefox_win.PasswordSaver = function(doc, saveData, URLs, saveButtonCallback)
{
    this.doc = doc;
    this.saveData = saveData;
    this.URLs = URLs;
    this.saveButtonCallback = saveButtonCallback;

    Cu.import("resource://kfmod/search.js", this);

    this.search = new this.Search(keefox_org, {
        version: 1,
        searchAllDatabases: true,
        maximumResults: 50
    });
};

keefox_win.PasswordSaver.prototype = 
{
    generateUI: function(container) {
        let saveTypeChooser = this.createSaveTypeChooser();
        container.appendChild(saveTypeChooser);
        let saveTypeContainer = this.createSaveTypeContainer();
        container.appendChild(saveTypeContainer);
        return container;
    },
    
    createDBSelect: function () {
  
        let dbOptions = [];
              
        for (var dbi = 0; dbi < keefox_org.KeePassDatabases.length; dbi++)
        {
            var db = keefox_org.KeePassDatabases[dbi];
            let opt = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'option');
            opt.setAttribute("value", db.fileName);
            if (db.name)
                opt.textContent = db.name;
            else
                opt.textContent = db.fileName;
            if (dbi == keefox_org.ActiveKeePassDatabaseIndex)
                opt.selected = true;
            opt.style.backgroundImage = "url(data:image/png;base64," + db.iconImageData + ")";
            dbOptions.push(opt);
        }
              
        let changeHandler = function (event) {
            let opt = event.target.selectedOptions[0];
            event.target.style.backgroundImage = opt.style.backgroundImage;
            this.updateGroups(keefox_org.getDBbyFilename(event.target.value),
                this.doc.getElementById('keefox-save-password-group-select'));
            this.saveData.db = opt.value;
        };

        let sel = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'select');
        sel.setAttribute("id","keefox-save-password-db-select");
        sel.addEventListener("change", changeHandler.bind(this), false);
        for (let o of dbOptions)
          sel.appendChild(o);

        this.saveData.db = sel.selectedOptions[0].value;
  
        return sel;
    },
    
    createGroupSelect: function () {
  
        let changeHandler = function (event) {
            let opt = event.target.selectedOptions[0];
            event.target.style.backgroundImage = opt.style.backgroundImage;
            event.target.style.paddingLeft = (opt.style.paddingLeft.substring(0,
                opt.style.paddingLeft.length - 2) - 5) + "px";
            event.target.style.backgroundPosition = opt.style.backgroundPosition;
            this.saveData.group = opt.value;
        };
              
        let sel = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'select');
        sel.addEventListener("change", changeHandler.bind(this), false);
        sel.setAttribute("id","keefox-save-password-group-select");
  
        return sel;
    },

    updateGroups: function (db, sel) {
  
        let groupOptions = [];
        let mruGroup = "";
        if (keefox_org._keeFoxExtension.prefs.getValue("rememberMRUGroup",false))
        {
            mruGroup = keefox_org._keeFoxExtension.prefs.getValue("MRUGroup-"+db.fileName,"");
        }
  
        function generateGroupOptions (group, depth) {
    
            let opt = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'option');
            opt.setAttribute("value", group.uniqueID);
            opt.textContent = group.title;
    
            if (mruGroup == group.uniqueID)
                opt.setAttribute("selected", "true");
    
            let indent = 20 + depth * 16;
            opt.style.paddingLeft = (indent+5) + "px";
            opt.style.backgroundPosition = (indent-15) + "px 7px";
            opt.style.backgroundImage = "url(data:image/png;base64," + group.iconImageData + ")";
    
            groupOptions.push(opt);
    
            for (let c of group.childGroups)
            generateGroupOptions.call(this, c, depth+1);
        }
  
        generateGroupOptions.call(this, db.root, 0);
  
        for (var opt in sel){
            sel.remove(opt);
        }
        for (let o of groupOptions)
          sel.appendChild(o);
  
        let currentOpt = sel.selectedOptions[0];
        sel.style.backgroundImage = currentOpt.style.backgroundImage;
        sel.style.paddingLeft = (currentOpt.style.paddingLeft.substring(0,
            currentOpt.style.paddingLeft.length - 2) - 5) + "px";
        sel.style.backgroundPosition = currentOpt.style.backgroundPosition;

        this.saveData.group = currentOpt.value;
    },

    getCurrentUrlMergeMode: function()  {
        let radioOptions = this.doc.getElementById("KeeFox-loginURLsUpdateRadioGroup");
        return radioOptions.selectedIndex + 1;
    },

    createSaveTypeChooser: function ()
    {
        let saveTypeChooser = this.doc.createElement('hbox');
        let createButton = this.doc.createElement('button');
        createButton.setAttribute("id","keefox-save-password-new-button");
        createButton.setAttribute("label",keefox_org.locale.$STR("create-new-entry"));
        createButton.addEventListener("command", this.enableNewEntry.bind(this));
        createButton.classList.add("selected");
        let updateButton = this.doc.createElement('button');
        updateButton.setAttribute("id","keefox-save-password-update-button");
        updateButton.setAttribute("label",keefox_org.locale.$STR("update-existing-entry"));
        updateButton.addEventListener("command", this.enableEditEntry.bind(this));
        updateButton.classList.add("unselected");

        saveTypeChooser.appendChild(createButton);
        saveTypeChooser.appendChild(updateButton);
        return saveTypeChooser;
    },

    createSaveTypeContainer: function ()
    {
        let saveTypeContainer = this.doc.createElement('vbox');
        saveTypeContainer.setAttribute("id","keefox-save-password-saveTypeContainer");

        let typeNew = this.createSaveTypeNew();
        let typeUpdate1 = this.createSaveTypeUpdate1();
        let typeUpdate2 = this.createSaveTypeUpdate2();

        saveTypeContainer.appendChild(typeNew);
        saveTypeContainer.appendChild(typeUpdate1);
        saveTypeContainer.appendChild(typeUpdate2);
        return saveTypeContainer;
    },

    createSaveTypeNew: function ()
    {
        let panel = this.doc.createElement('vbox');
        panel.setAttribute("id", "keefox-save-password-new-panel");
        panel.classList.add("enabled");
        
        let dbSel = this.createDBSelect();
        dbSel.style.backgroundImage = dbSel.selectedOptions[0].style.backgroundImage;
              
        let dbSelContainer = this.doc.createElement('hbox');
        dbSelContainer.setAttribute('class', 'keeFox-save-password');
        let dbSelLabel = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'label');
        dbSelLabel.setAttribute('for', dbSel.id);
        dbSelLabel.textContent = keefox_org.locale.$STR("database.label");
              
        dbSelContainer.appendChild(dbSelLabel);
        dbSelContainer.appendChild(dbSel);
                            
        if (dbSel.options.length <= 1)
            dbSelContainer.classList.add('disabled');
              
        panel.appendChild(dbSelContainer);
              
        let groupSelContainer = this.createGroupSelector();
        panel.appendChild(groupSelContainer);

        panel.appendChild(this.generateCreateButton());

        return panel;
    },

    createSaveTypeUpdate1: function ()
    {
        let panel = this.doc.createElement('vbox');
        panel.classList.add("disabled");
        panel.setAttribute("id", "keefox-save-password-update-panel1");
        let whichEntryLabel = this.doc.createElement('label');
        whichEntryLabel.textContent = keefox_org.locale.$STR("whichEntry.label");
        whichEntryLabel.classList.add("KeeFox-message");
        panel.appendChild(whichEntryLabel);

        let searchResultspanel = this.doc.createElement('vbox');
        let searchBox = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'input');
        searchBox.setAttribute("placeholder", keefox_org.locale.$STR("KeeFox_Search.label"));
        searchBox.setAttribute("type", "text");
        searchBox.setAttribute("id", "KeeFox-SaveLogin-searchbox");
        searchBox.setAttribute("title", keefox_org.locale.$STR("KeeFox_Search.tip"));
        searchBox.classList.add("KeeFox-Search");
        searchBox.addEventListener('input',function(e){
            this.search.execute(e.target.value, this.onSearchComplete.bind(this), 
                e.target.ownerDocument.getElementById('KeeFox-SaveLogin-searchfilter').selectedOptions[0].value.split(','));
        }.bind(this), false);

        let searchFields = keefox_win.SearchFilter.attachFilterToSearchBox(searchBox, this, keefox_org.utils.stringsToNsIURIs(this.URLs));

        let searchResults = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'div');
        searchResults.setAttribute("id", "KeeFox-SaveLogin-SearchResults");
        
        searchResultspanel.appendChild(searchFields);
        searchResultspanel.appendChild(searchResults);
        panel.appendChild(searchResultspanel);

        return panel;
    },
    
    createSaveTypeUpdate2: function ()
    {
        let panel = this.doc.createElement('vbox');
        panel.classList.add("disabled");
        panel.setAttribute("id", "keefox-save-password-update-panel2");
        
        let selectedEntryContainer = this.doc.createElement('hbox');
        let selectedEntryList = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'ul');
        selectedEntryList.setAttribute("id","KeeFox-SaveLogin-selectedEntryList");
        selectedEntryContainer.appendChild(selectedEntryList);
        let spacer1 = this.doc.createElement("spacer");
        spacer1.setAttribute("flex", "1");
        selectedEntryContainer.appendChild(spacer1);
        let selectedEntryChangeButton = this.doc.createElement('button');
        selectedEntryChangeButton.setAttribute("label", keefox_org.locale.$STR("search-again"));
        selectedEntryChangeButton.classList.add("KeeFox-SaveLogin-Change-Setting");
        selectedEntryChangeButton.addEventListener("command", this.enableSelectEntryToUpdate.bind(this));
        selectedEntryContainer.appendChild(selectedEntryChangeButton);
        panel.appendChild(selectedEntryContainer);

        let loginURLsUpdateStatusContainer = this.doc.createElement('hbox');
        loginURLsUpdateStatusContainer.setAttribute("id","KeeFox-loginURLsUpdateStatusContainer");
        let loginURLsUpdateStatus = this.doc.createElement('label');
        loginURLsUpdateStatus.textContent = keefox_org.locale.$STR("change-url-status");
        loginURLsUpdateStatus.classList.add("KeeFox-message");
        loginURLsUpdateStatusContainer.appendChild(loginURLsUpdateStatus);
        let spacer3 = this.doc.createElement("spacer");
        spacer3.setAttribute("flex", "1");
        loginURLsUpdateStatusContainer.appendChild(spacer3);
        let loginURLsUpdateButton = this.doc.createElement('button');
        loginURLsUpdateButton.setAttribute("label", keefox_org.locale.$STR("more-options"));
        loginURLsUpdateButton.classList.add("KeeFox-SaveLogin-Change-Setting");
        loginURLsUpdateButton.addEventListener("command", this.enableEditURLs.bind(this));
        loginURLsUpdateStatusContainer.appendChild(loginURLsUpdateButton);
        panel.appendChild(loginURLsUpdateStatusContainer);

        let loginURLsUpdateRadioGroup = this.doc.createElement('radiogroup');
        loginURLsUpdateRadioGroup.classList.add("disabled");
        loginURLsUpdateRadioGroup.setAttribute("id","KeeFox-loginURLsUpdateRadioGroup");
        let loginURLsUpdateRadio1 = this.doc.createElement('radio');
        loginURLsUpdateRadio1.setAttribute("label", keefox_org.locale.$STR("change-url-option-1"));
        loginURLsUpdateRadio1.setAttribute("selected", "true");
        loginURLsUpdateRadioGroup.appendChild(loginURLsUpdateRadio1);
        let loginURLsUpdateRadio2 = this.doc.createElement('radio');
        loginURLsUpdateRadio2.setAttribute("label", keefox_org.locale.$STR("change-url-option-2"));
        loginURLsUpdateRadio2.setAttribute("selected", "false");
        loginURLsUpdateRadioGroup.appendChild(loginURLsUpdateRadio2);
        let loginURLsUpdateRadio3 = this.doc.createElement('radio');
        loginURLsUpdateRadio3.setAttribute("label", keefox_org.locale.$STR("change-url-option-3"));
        loginURLsUpdateRadio3.setAttribute("selected", "false");
        loginURLsUpdateRadioGroup.appendChild(loginURLsUpdateRadio3);
        let loginURLsUpdateRadio4 = this.doc.createElement('radio');
        loginURLsUpdateRadio4.setAttribute("label", keefox_org.locale.$STR("change-url-option-4"));
        loginURLsUpdateRadio4.setAttribute("selected", "false");
        loginURLsUpdateRadioGroup.appendChild(loginURLsUpdateRadio4);
        panel.appendChild(loginURLsUpdateRadioGroup);

        panel.appendChild(this.generateUpdateButton());

        return panel;
    },
    
    generateCreateButton: function ()
    {
        return this.generateCreateUpdateButton(keefox_org.locale.$STR("create"));
    },

    generateUpdateButton: function ()
    {
        return this.generateCreateUpdateButton(keefox_org.locale.$STR("update"));
    },

    generateCreateUpdateButton: function (label)
    {
        let hbox = this.doc.createElement('hbox');
        hbox.setAttribute("pack","end");
        let button = this.doc.createElement('button');
        button.setAttribute("label",label);
        button.addEventListener("command", this.saveButtonCallback);
        hbox.appendChild(button);
        return hbox;
    },

    createGroupSelector: function ()
    { 
        let groupSel = this.createGroupSelect();
        this.updateGroups(
           keefox_org.KeePassDatabases[keefox_org.ActiveKeePassDatabaseIndex],groupSel);
                
        let groupSelContainer = this.doc.createElement('hbox');
        groupSelContainer.setAttribute('class', 'keeFox-save-password');
        let groupSelLabel = this.doc.createElementNS('http://www.w3.org/1999/xhtml', 'label');
        groupSelLabel.setAttribute('for', groupSel.id);
        groupSelLabel.textContent = keefox_org.locale.$STR("group.label");
                
        groupSelContainer.appendChild(groupSelLabel);
        groupSelContainer.appendChild(groupSel);
        return groupSelContainer;
    },

    enableEditEntry: function () {
        // If we've already chosen an entry to edit, clicking on this tab takes
        // us back to the 2nd stage of the update process
        if (this.saveData.oldLoginUUID)
            this.enableUpdateEntryDetails();
        else
            this.enableSelectEntryToUpdate();
    },

    enableEditURLs: function ()
    {
        let loginURLsUpdateStatusContainer = this.doc.getElementById("KeeFox-loginURLsUpdateStatusContainer");
        let loginURLsUpdateRadioGroup = this.doc.getElementById("KeeFox-loginURLsUpdateRadioGroup");
        loginURLsUpdateStatusContainer.classList.add("disabled");
        loginURLsUpdateStatusContainer.classList.remove("enabled");
        loginURLsUpdateRadioGroup.classList.add("enabled");
        loginURLsUpdateRadioGroup.classList.remove("disabled");
    },

    enableNewEntry: function ()
    {
        let panel1 = this.doc.getElementById("keefox-save-password-new-panel");
        let panel2 = this.doc.getElementById("keefox-save-password-update-panel1");
        let panel3 = this.doc.getElementById("keefox-save-password-update-panel2");
        panel1.classList.add("enabled");
        panel2.classList.add("disabled");
        panel3.classList.add("disabled");
        panel1.classList.remove("disabled");
        panel2.classList.remove("enabled");
        panel3.classList.remove("enabled");
        this.saveData.update = false;

        this.setTypeChooserButtonState("keefox-save-password-new-button", "keefox-save-password-update-button");
    },

    enableSelectEntryToUpdate: function ()
    {
        let panel1 = this.doc.getElementById("keefox-save-password-new-panel");
        let panel2 = this.doc.getElementById("keefox-save-password-update-panel1");
        let panel3 = this.doc.getElementById("keefox-save-password-update-panel2");
        panel1.classList.add("disabled");
        panel2.classList.add("enabled");
        panel3.classList.add("disabled");
        panel1.classList.remove("enabled");
        panel2.classList.remove("disabled");
        panel3.classList.remove("enabled");
        this.saveData.update = true;
        let selectedEntryList = this.doc.getElementById("KeeFox-SaveLogin-selectedEntryList");
        while (selectedEntryList.firstChild)
            selectedEntryList.removeChild(selectedEntryList.firstChild); 
        this.saveData.oldLoginUUID = null;
        this.saveData.db = null;

        this.setTypeChooserButtonState("keefox-save-password-update-button", "keefox-save-password-new-button");
    },

    enableUpdateEntryDetails: function ()
    {
        let panel1 = this.doc.getElementById("keefox-save-password-new-panel");
        let panel2 = this.doc.getElementById("keefox-save-password-update-panel1");
        let panel3 = this.doc.getElementById("keefox-save-password-update-panel2");
        panel1.classList.add("disabled");
        panel2.classList.add("disabled");
        panel3.classList.add("enabled");
        panel1.classList.remove("enabled");
        panel2.classList.remove("enabled");
        panel3.classList.remove("disabled");
        this.saveData.update = true;

        this.setTypeChooserButtonState("keefox-save-password-update-button", "keefox-save-password-new-button");
    },

    setTypeChooserButtonState: function (selectedId, unselectedId)
    {
        let selectedButton = this.doc.getElementById(selectedId);
        let otherButton = this.doc.getElementById(unselectedId);
        selectedButton.classList.add("selected");
        otherButton.classList.add("unselected");
        selectedButton.classList.remove("unselected");
        otherButton.classList.remove("selected");
    },

    abortAndLaunchManualEdit: function ()
    {
        keefox_org.metricsManager.pushEvent("feature", "abortAndLaunchManualEdit");
        keefox_org.launchLoginEditor(this.saveData.oldLoginUUID, this.saveData.db);
        keefox_win.notificationManager.remove("password-save");
    },
    
    onSearchComplete: function (logins)
    {
        logins = logins.sort(function(a,b) {
            if (a.relevanceScore > b.relevanceScore)
                return -1;
            if (a.relevanceScore < b.relevanceScore)
                return 1;
            return 0;
        });
        this.showSearchResults(logins);
    },
    
    // Calling this function with null or empty logins array will clear all existing search results
    showSearchResults: function (logins)
    {
        keefox_win.Logger.debug("passwordSaver showSearchResults started");
        
        let ps = this;

        // The container that we want to add our search results to.
        var container = this.getEmptyContainerFor("KeeFox-SaveLogin-SearchResults");
        if (container === undefined || container == null || logins == null || logins.length == 0)
            return;
            
        keefox_win.Logger.debug(logins.length + " search results found");

        for (let i = 0; i < logins.length; i++) {
            var login = logins[i];
            var usernameValue = "";
            var usernameName = "";
            var usernameDisplayValue = "[" + keefox_org.locale.$STR("noUsername.partial-tip") + "]";
            usernameValue = login.usernameValue;
            if (usernameValue != undefined && usernameValue != null && usernameValue != "")
                usernameDisplayValue = usernameValue;
            usernameName = login.usernameName;

            var loginItem = ps.doc.createElementNS('http://www.w3.org/1999/xhtml', 'li');
            loginItem.setAttribute("class","login-item");
            loginItem.setAttribute("data-fileName",login.dbFileName);
            loginItem.setAttribute("data-usernameName",usernameName);
            loginItem.setAttribute("data-usernameValue",usernameValue);
            loginItem.setAttribute("data-url",login.url);
            loginItem.setAttribute("data-uuid",login.uniqueID);
            loginItem.setAttribute("style",'background-image:url(data:image/png;base64,' + login.iconImageData + ')');
            loginItem.setAttribute("title",keefox_org.locale.$STRF(
                "savePasswordLogin.tip", [usernameDisplayValue, login.url]));
            loginItem.setAttribute("tabindex","-1");
            
            if (keefox_org._keeFoxExtension.prefs.getValue("alwaysDisplayUsernameWhenTitleIsShown",false))
                loginItem.textContent = keefox_org.locale.$STRF("matchedLogin.label", [usernameDisplayValue, login.title]);
            else
                loginItem.textContent = login.title;
            //TODO:1.6: Keyboard nav?
            //loginItem.addEventListener("keydown", this.keyboardNavHandler, false);
            loginItem.addEventListener("mouseup", function (event) { 
                // Make sure no parent groups override the actions of this handler
                event.stopPropagation();

                if (event.button == 0 || event.button == 1)
                {
                    this.dispatchEvent(new CustomEvent("keefoxCommand", { 'detail': { 'button': event.button, 'ctrlKey': event.ctrlKey }}));
                } 
            }, false);
            loginItem.addEventListener("keefoxCommand", function (event) { 
                ps.saveData.oldLoginUUID = this.getAttribute('data-uuid');
                ps.saveData.db = this.getAttribute('data-fileName');

                var loginItem = ps.doc.createElementNS('http://www.w3.org/1999/xhtml', 'li');
                loginItem.setAttribute("class","login-item");
                loginItem.setAttribute("style",this.getAttribute("style"));
                loginItem.setAttribute("title",this.getAttribute("title"));
                loginItem.setAttribute("tabindex","-1");
                loginItem.textContent = this.textContent;
                ps.doc.getElementById("KeeFox-SaveLogin-selectedEntryList").appendChild(loginItem);

                ps.enableUpdateEntryDetails();
            }, false);
            
            container.appendChild(loginItem);
        }
        
        // Update the UI state to reflect the number of logins found
        //if (container.childElementCount > 0)
        //    this.enableUIElement("KeeFox-PanelSubSection-SearchResults");
        
        keefox_win.Logger.debug(logins.length + " search results set.");
    },

    getEmptyContainerFor: function (id)
    {
        let panelSection = this.doc.getElementById(id);
        if (panelSection === undefined || panelSection == null)
            return null;
        
        // Remove all of the existing items by removing the top-level list
        // if it has been created earlier
        if (panelSection.childNodes.length > 0)
            panelSection.removeChild(panelSection.childNodes[0]);
        
        // Create the ul menu top level container        
        let groupContainer = this.doc.createElement('ul');
        groupContainer.setAttribute("id",id + '-Container');
        panelSection.appendChild(groupContainer);
        return groupContainer;
    },

    showUpdateSuccessNotification: function()
    {
        if (keefox_org._keeFoxExtension.prefs.getValue("notifyWhenEntryUpdated",true))
        {
            let aNotifyBox = keefox_win.UI._getNotificationManager();
            var buttons = [
                {
                    label:     keefox_org.locale.$STR("KeeFox-FAMS-NotifyBar-DoNotShowAgain-Button.label"),
                    accessKey: keefox_org.locale.$STR("KeeFox-FAMS-NotifyBar-DoNotShowAgain-Button.key"),
                    popup:     null,
                    callback:  function() {
                        keefox_org._keeFoxExtension.prefs.setValue("notifyWhenEntryUpdated",false);
                    } 
                }
            ];
            let notification = {
                name: "password-updated",
                render: function (container) {
                     
                    // We will append the rendered view of our own notification information to the
                    // standard notification container that we have been supplied
                    var doc = container.ownerDocument;
                    container = doc.ownerGlobal.keefox_win.notificationManager
                        .renderStandardMessage(container, doc.ownerGlobal.keefox_org.locale.$STR("password-successfully-updated"));
                        
                    let vb = doc.createElement('vbox');
                    vb.setAttribute("flex","1");
                    vb.setAttribute("id","keefox-password-updated-notification");

                    let p1 = doc.createElement('label');
                    p1.textContent = doc.ownerGlobal.keefox_org.locale.$STR("keepass-history-pointer");
                    p1.setAttribute('class', 'KeeFox-message');
                    vb.appendChild(p1);
                    let p2 = doc.createElement('label');
                    p2.textContent = doc.ownerGlobal.keefox_org.locale.$STR("change-field-status");
                    p2.setAttribute('class', 'KeeFox-message');
                    vb.appendChild(p2);
                    let p3 = doc.createElement('label');
                    p3.textContent = doc.ownerGlobal.keefox_org.locale.$STR("change-field-explanation");
                    p3.setAttribute('class', 'KeeFox-message');
                    vb.appendChild(p3);
                    let p4 = doc.createElement('label');
                    p4.textContent = doc.ownerGlobal.keefox_org.locale.$STR("multi-page-update-warning");
                    p4.setAttribute('class', 'KeeFox-message');
                    vb.appendChild(p4);

                    container.appendChild(vb);
              
                    // We might customise other aspects of the notifications but when we want
                    // to display buttons we can treat them all the same
                    container = doc.ownerGlobal.keefox_win.notificationManager
                        .renderButtons(buttons, doc, aNotifyBox, "password-updated", container);

                    return container;
                },
                thisTabOnly: true,
                priority: null,
                persist: true
            };
            aNotifyBox.add(notification);
        }
    }

};
