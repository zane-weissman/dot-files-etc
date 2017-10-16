/*
  KeeFox - Allows Firefox to communicate with KeePass (via the KeePassRPC KeePass plugin)
  Copyright 2015 Chris Tomlinson <keefox@christomlinson.name>
  
  This contains code related to the management and display of KeeFox notifications.

  It runs in a window scope so does not have direct access to the DOM of any given site.

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

keefox_win.notificationManager = {

    // priorities (subset of old Firefox notification priorities to ease transition
    // and maybe support Thunderbird but the actual values are probably different)
    PRIORITY_WARNING_HIGH: 3,
    PRIORITY_INFO_LOW: 2,
    PRIORITY_INFO_MEDIUM: 1,

    // For tracking which notifications belong to which tab
    tabNotificationMap: new Map(),

    // All window notifications
    windowNotifications: [],

    // We don't support global notifications across multiple windows (never have) but should be able
    // to add a 3rd category here if needed in future.

    add: function (notification) {

        // Unless it's a persistent or high priority message, we'll wait until the user has closed the current view

        if (!notification.persist && keefox_win.panel.isOpen
            && notification.priority != keefox_win.notificationManager.PRIORITY_WARNING_HIGH)
        {
            let onMainPanelClosed = function (event) {
                document.removeEventListener("keefoxMainPanelClosed", onMainPanelClosed, false);
                keefox_win.notificationManager.add(notification);
            };
            document.addEventListener("keefoxMainPanelClosed", onMainPanelClosed, false);
            return;
        }

        if (!notification.persist && keefox_win.persistentPanel.thePanel.state != "closed"
            && notification.priority != keefox_win.notificationManager.PRIORITY_WARNING_HIGH)
        {
            let onPersistentPanelClosed = function (event) {
                keefox_win.persistentPanel.thePanel.removeEventListener('popuphidden', onPersistentPanelClosed, false);
                keefox_win.notificationManager.add(notification);
            };
            keefox_win.persistentPanel.thePanel.addEventListener('popuphidden', onPersistentPanelClosed, false);
            return;
        }
        
        // We refresh all notifications in the same category after one is added because priorities
        // might mean the display order is not obvious. No doubt this could be made much more
        // efficient in future but for the handful of notifications expected we can safely take this shortcut
        if (notification.thisTabOnly)
        {
            let selectedTab = window.gBrowser.selectedTab;
            let notificationList = this.tabNotificationMap.get(selectedTab);
            if (!notificationList)
                notificationList = [];
            
            // delete any item with a matching notification.name
            notificationList = notificationList.filter(function(existingNotification)
            {
                return existingNotification.name!==notification.name
            });

            notificationList.push(notification);
            this.tabNotificationMap.set(selectedTab, notificationList);
            this.refreshTabView();
        } else
        {
            // delete any item with a matching notification.name
            this.windowNotifications = this.windowNotifications.filter(function(existingNotification)
            {
                return existingNotification.name!==notification.name
            });
            this.windowNotifications.push(notification);
            this.refreshWindowView();
        }

        if (notification.persist)
        {
            if (notification.thisTabOnly)
                keefox_win.persistentPanel.showNotifications();
            else
                keefox_win.persistentPanel.showWindowNotifications();
        } else
        {
            keefox_win.panel.displayPanel();
            keefox_win.panel.hideSubSections();
        }
    },
    remove: function (name) {
        // All notifications with the supplied name are removed from the current tab and window lists

        function hasBeenKept(existingNotification, name) {
            let keep = existingNotification.name!==name;

            if (!keep && existingNotification.DOM)
                existingNotification.DOM.parentNode.removeChild(existingNotification.DOM);

            // if the notification we're removing was set to persist, try closing the
            // persistent panel now (sometimes this won't be necessary but it won't do any harm)
            if (!keep && existingNotification.persist)
                keefox_win.persistentPanel.thePanel.hidePopup();
            return keep;
        }

        let selectedTab = window.gBrowser.selectedTab;
        let notificationList = this.tabNotificationMap.get(selectedTab);
        if (notificationList && notificationList.length > 0)
        {   
            notificationList = notificationList.filter(function(existingNotification)
            {
                return hasBeenKept(existingNotification, name);
            });
            this.tabNotificationMap.set(selectedTab, notificationList);
            this.refreshTabView();
        }

        if (this.windowNotifications && this.windowNotifications.length > 0)
        {
            this.windowNotifications = this.windowNotifications.filter(function(existingNotification)
            {
                return hasBeenKept(existingNotification, name);
            });
            this.refreshWindowView();
        }
    },
    tabClosing: function (event) {
        // Delete notifications that were associated with this tab
        keefox_win.notificationManager.tabNotificationMap.set(event.target, []);
        keefox_win.notificationManager.refreshTabView()
    },
    tabSelected: function () {
        keefox_win.notificationManager.refreshTabView();
    },
    getPriorityClass: function(notification) {
        if (notification.priority == keefox_win.notificationManager.PRIORITY_WARNING_HIGH)
            return "keeFoxPriorityHigh";
        else if (notification.priority == keefox_win.notificationManager.PRIORITY_INFO_LOW)
            return "keeFoxPriorityLow";
        else return "keeFoxPriorityMedium";
    },
    renderNotification: function (notification) {

        var bx = document.createElement('vbox');
        bx.classList.add('keeFoxNotification');
        bx.classList.add(this.getPriorityClass(notification));
        

        var topbx = document.createElement('hbox');
        var hackbx = document.createElement('vbox'); // Needed cos of Firefox bug #394738
        var close = document.createElement('button');
        close.setAttribute('label', 'X');
        close.setAttribute('tooltiptext', keefox_org.locale.$STR('dismiss-notification'));
        close.setAttribute('class', 'KeeFox-Close-Notification');
        close.addEventListener("command", function() {
            if (typeof(notification.onClose) === "function")
                notification.onClose(window.gBrowser.selectedBrowser);
            keefox_win.notificationManager.remove(notification.name);
        }, false);
        
        hackbx.appendChild(close);
        topbx.appendChild(hackbx);
        bx.appendChild(topbx);

        let contents = notification.render(bx);
        return contents;
    },

    renderButtons: function (buttons, doc, notifyBox, name, container) {
        
        var buttonContainer = null;
        buttonContainer = doc.createElement("hbox");
        buttonContainer.classList.add("keefox-button-actions");
        
        for(var bi=0; bi < buttons.length; bi++)
        {
            var butDef = buttons[bi];
            var newButton = null;
            newButton = doc.createElement('button');
            newButton = this._prepareNotificationButton(newButton, butDef, notifyBox, name, container);
            
            buttonContainer.appendChild(newButton);
        }
        container.appendChild(buttonContainer);
        return container;
    },

    renderStandardMessage: function (container, notificationText) {
        var doc = container.ownerDocument;
        let vb = doc.createElement('vbox');
        vb.setAttribute("flex","1");
        let space = doc.createElement('spacer');
        let text = doc.createElement('label');
        text.textContent = notificationText;
        text.setAttribute('class', 'KeeFox-message');
        vb.appendChild(text);
        container.firstChild.insertBefore(space, container.firstChild.firstChild);
        container.firstChild.insertBefore(vb, container.firstChild.firstChild);
        return container;
    },

    refreshView: function () {
        this.refreshTabView();
        this.refreshWindowView();
    },
    refreshWindowView: function () {
        this.refreshCommonView(document.getElementById('KeeFox-PanelSection-notifications-window'),
            this.windowNotifications);
    },
    refreshTabView: function () {
        this.refreshCommonView(document.getElementById('KeeFox-PanelSection-notifications-tab'),
            this.tabNotificationMap.get(window.gBrowser.selectedTab));
    },
    refreshCommonView: function (container, notificationList) {

        // Remove any notifications from the DOM that are no longer referenced in our notificationList
        for (let dom of container.childNodes)
        {
            let keep = false;
            if (notificationList && notificationList.length > 0) {
                for (let notification of notificationList)
                {
                    if (notification.DOM == dom)
                    {
                        keep = true;
                        break;
                    }
                }
            }
            if (!keep)
                container.removeChild(dom);
        }
        
        // Add any new notifications
        if (container && notificationList)
            for (let notification of notificationList) {
                if (!notification.DOM)
                {
                    notification.DOM = this.renderNotification(notification);
                    container.appendChild(notification.DOM);
                    if (notification.onAttached)
                        notification.onAttached(window.gBrowser.selectedBrowser,document);
                } else if (!notification.DOM.parentNode) {
                    // Re-attach an existing notification that was not applicable to the previous tab
                    container.appendChild(notification.DOM);
                }
            }
        
        //TODO:1.6: re-order by priority
    },

    _prepareNotificationButton : function (but, itemDef, notifyBox, name)
    {
        but.setAttribute("label", itemDef.label);
        if (itemDef.tooltip != undefined) but.setAttribute("tooltiptext", itemDef.tooltip);

        var callbackWrapper = function(fn, name){
            return function() {
                let keepOpen = false;
                try
                {
                    if (fn != null)
                        keepOpen = fn.apply(this, arguments);
                } catch(ex)
                {
                    keefox_win.Logger.error("Exception occurred in menu item callback: " + ex);
                } finally {
                    if (!keepOpen)
                        notifyBox.remove(name);
                }
            };
        };

        var callback = callbackWrapper(itemDef.callback, name);
        but.addEventListener('command', callback, false);
        if (itemDef.id != null)
            but.setAttribute("id", itemDef.id);
        if (itemDef.values != null)
        {
            for(var pi=0; pi < itemDef.values.length; pi++)
            {
                var key = itemDef.values[pi].key;
                var val = itemDef.values[pi].value;
                but.setUserData(key, val, null);
            }
        }
        return but;
    },

};
