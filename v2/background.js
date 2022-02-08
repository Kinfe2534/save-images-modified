/* Copyright (C) 2014-2021 Joe Ertaba
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.

 * Home: https://add0n.com/save-images.html
 * GitHub: https://github.com/belaviyo/save-images/ */

'use strict';

const notify = message => chrome.storage.local.get({
  notify: true
}, prefs => prefs.notify && chrome.notifications.create({
  type: 'basic',
  title: chrome.runtime.getManifest().name,
  message,
  iconUrl: '/data/icons/48.png'
}));
let url_index=0;
let start=false;
var  urls=["https://www.youtube.com/","https://www.ebay.com","https://www.youtube.com/","https://www.ebay.com","https://www.youtube.com/","https://www.ebay.com",];
// first send message to content script
function onClicked(tab){
if(start==false){
  start=true;
  chrome.tabs.query({active:true,currentWindow:true},function(tabs){
    chrome.tabs.sendMessage(tabs[0].id,{message:"open_new_url",url:`${urls[url_index]}`},function(response){});    
    });  
}
else if(start==true){start=false}  
}
//  listen and send messages to content script
chrome.runtime.onMessage.addListener((request, sender) => {
if ( url_index<urls.length && start && request.message=="window_loaded") {    
    setTimeout(()=>{ chrome.tabs.query({active:true,currentWindow:true},function(tabs){
      chrome.tabs.sendMessage(tabs[0].id,{message:"open_save_images_config"},function(response){
        // alert("hello again");
     });  
    });   
  },3000);
   url_index++; }
else if (url_index<urls.length && start && request.message=="scan_completed"){
   setTimeout(()=>{ chrome.tabs.query({active:true,currentWindow:true},function(tabs){     
    chrome.tabs.sendMessage(tabs[0].id,{message:"save_images"},function(response){
      // alert("hello again");
   });   
          
  });      
   },3000)
  }
else if(url_index<urls.length && start && request.message==""){}
else if(url_index<urls.length && start && request.message==""){
  
}
});

chrome.browserAction.onClicked.addListener(onClicked);


chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.method === 'notify') {
    notify(request.message);
  }
  else if (request.method === 'open-me') {
    const id = sender.tab.id;
    chrome.tabs.create({
      openerTabId: id,
      url: 'data/gallery/index.html?id=' + id
    });
  }
});

/* FAQs & Feedback */
{
  const {management, runtime: {onInstalled, setUninstallURL, getManifest}, storage, tabs} = chrome;
  if (navigator.webdriver !== true) {
    const page = getManifest().homepage_url;
    const {name, version} = getManifest();
    onInstalled.addListener(({reason, previousVersion}) => {
      management.getSelf(({installType}) => installType === 'normal' && storage.local.get({
        'faqs': true,
        'last-update': 0
      }, prefs => {
        if (reason === 'install' || (prefs.faqs && reason === 'update')) {
          const doUpdate = (Date.now() - prefs['last-update']) / 1000 / 60 / 60 / 24 > 45;
          if (doUpdate && previousVersion !== version) {
            tabs.query({active: true, currentWindow: true}, tbs => tabs.create({
              url: page + '?version=' + version + (previousVersion ? '&p=' + previousVersion : '') + '&type=' + reason,
              active: reason === 'install',
              ...(tbs && tbs.length && {index: tbs[0].index + 1})
            }));
            storage.local.set({'last-update': Date.now()});
          }
        }
      }));
    });
    setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
  }
}
