class helperStorage {
  constructor(storageName) {
    this.storageName = storageName;
  }
  get(name)       {return localStorage.getItem(this.storageName+name)}
  set(name, value){return localStorage.setItem(this.storageName+name, value)}
  remove(name)    {return localStorage.removeItem(this.storageName+name)}
}

let getElement = (i)=>{
  if (!document.getElementById(i))
    Consoles.warn('Cant find element with "'+i+'" id!');
  return document.getElementById(i);
},
querySelect = (i)=>{
  if (!document.querySelector(i))
    Consoles.warn('Cant find element by "'+i+'" querySelector!');
  return document.querySelector(i);
},
querySelectAll = (i)=>{
  if (!document.querySelectorAll(i))
    Consoles.warn('Cant find elements by "'+i+'" querySelector!');
  return document.querySelectorAll(i);
},

// #region базовые опции невхелпера
newHelperVer = '2.0.2',
logAll = false,
Consoles = {
  error: (...data)=>  {if (logAll) return console.error(...data)},
  log: (...data)=>    {if (logAll) return console.log(...data)},
  warn: (...data)=>   {if (logAll) return console.warn(...data)},
  time: (...data)=>   {if (logAll) return console.time(...data)},
  timeEnd: (...data)=>{if (logAll) return console.timeEnd(...data)},
},
errorService = {
  errors: {},
  count: 0, // используется в returnError()
  errorPositionX: 24,
  errorPositionY: 60,
},

mainLang = '', // язык, хотя вроде очевидно
servError = "\n\nADDR: \n\nSERVER RESP:\n\nxhr.response", // если 'helperRequest' вернёт ошибку, она будет записана сюда и отображена через 'returnError()'

Loading = (stop = 0, customImg = 'src=https://objecthub.xyz/imgs/load.svg')=>{
  if (stop == 0)
    document.body.insertAdjacentHTML('beforeend',
      `<div class=ALERT id=TheLoadElem style=position:fixed;top:20%;left:50%>`+
        `<img class=Loading ${customImg}>`+
      `</div>`
    );
  else 
    if (getElement('TheLoadElem'))
      getElement('TheLoadElem').remove();
  return stop;
},
// универсальная функция для запросов на сервер
helperRequest = (url, data, headers = '', fileUploadProgressElement = false)=>{
  return new Promise((resolve, reject)=>{
    if (url === false) {
      resolve(data);
      console.log(data);
    }
    let XHR = new XMLHttpRequest(),
        METHOD = 'GET';
    if (data !== undefined)
      METHOD = 'POST';

    XHR.open(METHOD, url);

    if (typeof(data) !== 'object') {
      XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    Consoles.log(headers);
    if (headers !== '')
      for (let header in headers) {
        XHR.setRequestHeader(header, headers[header]);
        Consoles.log(header, headers[header]);
      }

    if (fileUploadProgressElement != false)
      XHR.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          let percentage = (e.loaded / e.total);
          fileUploadProgressElement.setAttribute('value', percentage);
        }
      };

    XHR.onreadystatechange = ()=>{
      if (XHR.readyState === 4 ) {
        if (XHR.status === 200) {
          servError = "\n\nADDR: "+url+"\n\nSERVER RESP:\n\n"+XHR.response;
          resolve(XHR.response);
        } else {
          servError = '';
          reject(new Error('Unknown error, code status '+XHR.status), XHR);
        }
      }
    };
    // .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
    XHR.onerror = ()=>{
      servError = '';
      reject(new Error('Network error'), XHR);
    };

    if (data !== undefined) {
      XHR.send(data);
    } else {
      XHR.send();
    };
  });
},
// отображение ошибок у 'helperRequest', переменная errorService.count нужна чтобы считать ошибки
returnError = (err, addr = '')=>{
  Consoles.error(err, addr);
  errorService.count++;
  if (errorService.count === 1) {
    document.body.insertAdjacentHTML('beforeend',
      `<div id=errorBoxCount style=z-index:5;position:fixed;bottom:50px;left:50px;background-color:rgba(0,0,0,.5);padding:12px;border-radius:calc(var(--def-border-large)*1.5)>`+
        `<span id=errorCount style=position:absolute;right:10px;top:10px>1</span>`+
        `<button style=padding:12px class=emptybtn onclick="for (let errId in errorService.errors) {if (!getElement('debug'+errId))renderError(errId,errorService.errors[errId])}"`+
        `ondblclick="querySelectAll('[iserror]').forEach(el=>{subWindows.close(el.id);})">`+
          '!'+
        `</button>`+
      `</div>`
    )
  } else {
    getElement('errorCount').innerHTML = errorService.count;
  }
  renderError(errorService.count, err, addr);
  errorService.errors[errorService.count] = err+addr;
  if (getElement('TheLoadElem'))
    getElement('TheLoadElem').remove();
},
errorWindowButtons = [
  ['COPY ERROR',   `linkCopy(getElement('debugMega{errID}').innerText)`],
  ['RESTART',      `reStart(1,{errID})`],
  ['FULL RESTART', `location.reload()`]
],
errInfo = 
  `LOCATION: ${location}\n`,
renderError = (errID, errText, serverAddress = '')=>{
  let 
  buttons = '';
  errorWindowButtons.forEach(btn=>{
    buttons += buttonErr(btn[0], btn[1].replace('{errID}', errID));
  });

  function buttonErr(innerHtml, onclick) {
    return `<button style=background-color:#333 onclick="${onclick}">`+
          innerHtml+
        `</button> `
  };

  subWindows.open('debug'+errID,
    `<div id=debug${errID}>`+
      `<p align=center style=margin:0>DEBUG INFO</p>`+
      `ERROR<br>`+
      `<div style=background-color:#000;overflow-y:auto;max-height:200px>`+
        `<pre style=width:100%;white-space:pre-line id=debugMega${errID}></pre>`+
      `</div>`+
      `<br><br>`+
      `<center>`+
        buttons+
      `</center>`+
    `</div>`
  , `iserror style=top:${errorService.errorPositionY}px;left:${errorService.errorPositionX}px;width:300px;height:350px`);
  getElement('debugMega'+errID).innerText = errInfo+errText+`\n`+
  (serverAddress === '' ? '' : `\n${serverAddress}\n`);
  errorService.errorPositionY = errorService.errorPositionY + 24;
  if (errorService.errorPositionY > (innerHeight - 125))
    errorService.errorPositionY = 60;
  errorService.errorPositionX = errorService.errorPositionX + 24;
  if (errorService.errorPositionX > (innerWidth - 250))
    errorService.errorPositionX = 24;
},
ignore = false, // работает с функцией 'setLink', если true то сохранение состояния в истории вкладок не будет
helperTitleText = '',
// #endregion
// #region роутинг
setLink = (val, pageTitle = helperTitleText)=>{
  if (!ignore) {
    let link = location.search.replace('?','').split('&');
    link[0] = val;
    link = link.join('&');
    history.pushState(null, null, '?'+link);
    if (pageTitle)
      helperTitle.innerHTML = pageTitle;
  }
  ignore = false;
},
addLink = (val)=>{
  let link = location.search.replace('?','').split('&');
  if (!link.includes(val)) {
    link.push(val);
    link = link.join('&');
    history.pushState(null, null, '?'+link);
  }
},
removeLink = (val)=>{
  let link = location.search.replace('?','').split('&');
  if (link.includes(val)) {
    link.splice(link.indexOf(val), 1);
    link = link.join('&');
    history.pushState(null, null, '?'+link);
  }
},
basePage = ()=>{}, // installed by user
getLink = (string = window.location.search)=>{
  let params = string
    .replace('?','')
    .split('&')
    .reduce(
      (command,param)=>{
        let [key, value] = param.split('=');
        command[decodeURIComponent(key)] = decodeURIComponent(value);
        return command;
      },
      {}
    ),
    isFirst = true;
  Consoles.log(params);

  for (let KEY in params) {
    let VALUE = params[KEY];
    if (typeof KEY !== 'undefined') {
      if (typeof VALUE === 'undefined') 
        VALUE = 0;
      try {
        Consoles.log(KEY, VALUE);
        if (isFirst)
          if (linkActions[KEY])
            linkActions[KEY](VALUE);
          else 
            linkCommands[KEY](VALUE);
        else 
          linkCommands[KEY](VALUE);
      } catch (e) {
        console.error(e);getPromiseErrorPos(e);;
        if (isFirst)
          basePage();
      }
    };
    isFirst = false;
  };
},
linkActions = {}, // installed by user
linkCommands = {}, // installed by user
// #endregion
// #region движок модов, ну первая версия хотябы + лейзилоад
loadedScripts = [],
loadVer = 0,
loadScript = (url, ...args) => {
  if (!url.includes('?'))
    url = url+'?&helper='+loadVer;
  else if (!url.includes('&helper='+loadVer))
    url = url+'&helper='+loadVer;
  return new Promise((resolve, reject) => {
    if (loadedScripts.includes(url)) {
      resolve(args);
      return;
    }

    let script = document.createElement("script");
    script.type = "text/javascript";
    
    script.onload = () => {
      Loading(1);
      loadedScripts.push(url);
      resolve(args);
    };
    
    script.onerror = () => {
      Loading(1);
      reject(new Error(`Failed to load script: ${url}`));
    };
    
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  });
},
lazyScripts = (script, funcs)=>{
  if (!script.includes('?'))
    script = script+'?&helper='+loadVer;
  else if (!script.includes('&helper='+loadVer))
    script = script+'&helper='+loadVer;
  if (!Array.isArray(funcs))
    return new Error('Attempt to register non-array for list of scripts');
  funcs.forEach(fn=>{
    window[fn] = (...args) => lazy(script, fn)(...args);
  });
  console.log('Applied lazy '+script+' with this functions:', funcs);
},
lazy = (script, functionName)=>{
  Loading(0,'src=https://objecthub.xyz/imgs/plus.svg');
  return (...args) =>
    loadScript(script)
      .then(e=>{
        Loading(1);
        let returnable = window[functionName](...args);
        console.log(returnable);
        return returnable;
      });
},
preloadFunc = (scriptName, loadedFunction, ...funcArgs)=>{  
  Loading(0,'src=https://objecthub.xyz/imgs/plus.svg');
  loadScript(scriptName)
    .then(()=>{
      return loadedFunction(...funcArgs);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});;
},
// #endregion
// #region перевод "Налету"
getTrans = (id, renderType = 'text')=>{
  let getText = mainLang[id],
      prefix =  ` data-trans="${id}"`;
  if (getText == undefined || getText == '')
    if (renderType == 'window') {
      getText = id;
      prefix = '';
    } else {
      getText = `<code>getTrans('${id}','${renderType}')</code>`;
      console.warn(id);
    }
  try {
    switch (renderType) {
      case 'window':
      case 'text':        return `${prefix}>${getText}<`;
      case 'textButton':  return `${prefix}>${getText}`;
      case 'inputValue':  return `${prefix} value="${getText}">`;
      case 'input':       return `${prefix} placeholder="${getText}">`;
      case 'textarea':    return `${prefix} placeholder="${getText}"><`;
      case 'img':         return `${prefix} src="${getText}"`;
      default:            return getText;
    }
  } catch (err) {
    returnError(err);
    return id;
  }
},
replaceLang = (lang)=>{
  loadLanguage(lang)
    .then(data=>{
      console.time(this);
      let dataTrans = querySelectAll('[data-trans]');
      for (let el of dataTrans) {
        let key = el.getAttribute('data-trans'),
        langValue = mainLang[key];
        if (langValue == '')
          langValue = `<code>getTrans('${key}')</code>`;

        switch (el.tagName) {
          case 'IMG':
            el.setAttribute('src', langValue);
            break;
          case 'INPUT':
          case 'TEXTAREA':
            el.setAttribute('placeholder', langValue);
            break;
          default:
            el.innerHTML = langValue;
        }
      }
      console.timeEnd(this);
    })
    .catch(e=>{console.error(e);getPromiseErrorPos(e)});
},
applyLanguage = (langStr)=>{
  return langStr; // use .replaceAll('+var+', var)
},
languageAddress = '',
doLangSetup = (newData)=>{
  mainLang = JSON.parse(applyLanguage(newData));
},
loadLanguage = (name, autosetup = true)=>{
  return new Promise((resolve, reject)=>{
    Loading(0,'src=https://objecthub.xyz/imgs/load.svg');
    helperRequest(languageAddress+name+'.json', false, {'Cache-Control':'no-cache, no-store, max-age=0'}) // languageAddress custom string
      .then(data=>{

        let newData = data;

        if (autosetup) {
          doLangSetup(newData);
        }
        resolve(newData);
        Loading(1);
      })
      .catch(e=>{console.error(e);getPromiseErrorPos(e);reject(e)});
  })
},
// #endregion
// #region окна
helperWindows = getElement(''), // custom Element
helperHider = getElement(''), // custom Element
subWindows = {
  count: 0,
  subws: {},
  open: (windowName, htmlContent, customAttrs = '')=>{
    let windowId = subWindows.count+windowName,
    html =
    `<div class="upperWindow frameprofile ANIM-create2" id=${windowId} ${customAttrs}>`+
      `<div id=RSZb-${windowId} style=cursor:n-resize;position:absolute;width:100%;height:6px;bottom:-1px;left:-1px></div>`+
      `<div id=RSZl-${windowId} style=cursor:w-resize;position:absolute;width:6px;height:100%;left:-1px;top:-1px></div>`+
      `<div id=RSZr-${windowId} style=cursor:e-resize;position:absolute;width:6px;height:100%;right:-1px;top:-1px></div>`+
      `<div id=RSZt-${windowId} style=cursor:s-resize;position:absolute;width:100%;height:6px;top:-5px;left:-1px></div>`+
      `<div id=RSZtl-${windowId} style=cursor:nw-resize;position:absolute;width:6px;height:6px;top:-5px;left:-1px></div>`+
      `<div id=RSZtr-${windowId} style=cursor:ne-resize;position:absolute;width:6px;height:6px;top:-5px;right:-1px></div>`+
      `<div id=RSZbl-${windowId} style=cursor:sw-resize;position:absolute;width:6px;height:6px;bottom:-1px;left:-1px></div>`+
      `<div id=RSZbr-${windowId} style=cursor:se-resize;position:absolute;width:6px;height:6px;bottom:-1px;right:-1px></div>`+
      `<div align=right class=underWindow clicktime=0 ondblclick=subWindows.switchFullMode('${windowId}') id=DRAGGER${windowId}>`+
        `<div style=position:absolute;left:2px${getTrans('WINDOW-'+windowName,'window')}/div>`+
        windowButton('–', `subWindows.hide('${windowName}','${windowId}')`, `font-weight:bold`)+
        windowButton('X', `subWindows.close('${windowId}')`, `font-weight:bold`)+
      `</div>`+
      `<div id=content-${windowId} style=overflow:auto;width:100%;height:100%>`+
        htmlContent+
      `</div>`+
    `</div>`;
    helperWindows.insertAdjacentHTML('beforeend', html);

    let subWindow = getElement(windowId);
    if (!customAttrs.includes('top')) {
      let topValue = subWindow.offsetTop - (subWindow.offsetHeight / 2) + 'px',
      leftValue = subWindow.offsetLeft - (subWindow.offsetWidth / 2) + 'px';
      subWindow.style.top = parseInt(topValue) >= 0 ? topValue : '0px';
      subWindow.style.left = parseInt(leftValue) >= 0 ? leftValue : '0px';
    }
    if (!customAttrs.includes('width'))
      subWindow.style.height = (subWindow.offsetHeight - 50) + 'px';
    if (!customAttrs.includes('height'))
      subWindow.style.width = (subWindow.offsetWidth - 50) + 'px';

    subWindow.onanimationend = ()=>{
      subWindow.classList.remove('ANIM-create2');
      subWindow.onanimationend = null;
    };
    subWindows.initDragger(windowName);
    subWindows.initResizer(windowName);
    subWindows.subws[windowId] = {state:'opened', element:getElement(windowId)};
    return subWindows.count++;
  },
  switchFullMode: (windowId)=>{
    let subWindow = getElement(windowId),
    dragger = getElement('DRAGGER'+windowId);

    if (subWindow.classList.contains('ANIM-fullhide2'))
      subWindow.classList.remove('ANIM-fullhide2');
    if (subWindow.classList.contains('ANIM-full2')) {
      subWindow.classList.remove('ANIM-full2');
      subWindow.classList.add('ANIM-unfull2');
      subWindow.onanimationend = ()=>{
        subWindow.classList.remove('ANIM-unfull2');
        subWindows.initDragger(windowId,'');    
        subWindow.onanimationend = null;
        subWindows.subws[windowId].state = 'opened';
      }
    } else {
      dragger.onmousedown = null;
      dragger.ontouchstart = null;
      subWindow.style.height = (subWindow.offsetHeight - 50) + 'px';
      subWindow.style.width = (subWindow.offsetWidth - 50) + 'px';
      subWindow.classList.add('ANIM-full2');
      subWindow.onanimationend = ()=>{
        dragger.onmousedown = null;
        dragger.ontouchstart = null;
        subWindow.onanimationend = null;
        subWindows.subws[windowId].state = 'openedF';
      }
    }
  },
  initDragger: (windowName, customWinCount = subWindows.count)=>{
    let Window = getElement(customWinCount+windowName),
      pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0,
    startDrag = e=>{
      let target = e.target;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        if ('ontouchstart' in window) {
          stopDrag(e);
          return;
        }
        return;
      }
      if (Date.now() - target.getAttribute('clicktime') < 500)
        subWindows.switchFullMode(Window.id);
      target.setAttribute('clicktime', Date.now());

      helperWindows.appendChild(Window);

      e.preventDefault();
      let clientX = e.clientX || e.touches[0].clientX,
          clientY = e.clientY || e.touches[0].clientY;

      pos3 = clientX;
      pos4 = clientY;

      document.onmouseup = stopDrag;
      document.ontouchend = stopDrag;

      document.onmousemove = draggerMove;
      document.ontouchmove = draggerMove;
    },

    draggerMove = e=>{
      e.preventDefault();

      let clientX = e.clientX || e.touches[0].clientX,
          clientY = e.clientY || e.touches[0].clientY;

      pos1 = pos3 - clientX;
      pos2 = pos4 - clientY;
      pos3 = clientX;
      pos4 = clientY;

      Window.style.top = (Window.offsetTop - pos2) + "px";
      Window.style.left = (Window.offsetLeft - pos1) + "px";
    },

    stopDrag = ()=>{
      document.onmouseup = null;
      document.ontouchend = null;

      document.onmousemove = null;
      document.ontouchmove = null;
    };

    let draggerElement = getElement(`DRAGGER${Window.id}`);

    draggerElement.onmousedown = startDrag;
    draggerElement.ontouchstart = startDrag;
  },
  initResizer: (windowName)=>{
    let Window = getElement(subWindows.count+windowName),
      pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, padding = 50,

    startResize = e=>{
      let target = e.target;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        if ('ontouchstart' in window) {
          stopResize(e);
          return;
        }
        return;
      }

      helperWindows.appendChild(Window);

      e.preventDefault();
      let clientX = e.clientX || e.touches[0].clientX,
          clientY = e.clientY || e.touches[0].clientY;

      pos3 = clientX;
      pos4 = clientY;

      document.onmouseup = stopResize;
      document.ontouchend = stopResize;

      switch (target.id[3]) {
        case 't':
          if (target.id[4] !== '-') {
            if (target.id[4] == 'l') {
              document.onmousemove = resizeMoveTL;
              document.ontouchmove = resizeMoveTL;
            } else {
              document.onmousemove = resizeMoveTR;
              document.ontouchmove = resizeMoveTR;
            }
            break;
          }
          document.onmousemove = resizeMoveT;
          document.ontouchmove = resizeMoveT;
          break;
        case 'b':
          if (target.id[4] !== '-') {
            if (target.id[4] == 'l') {
              document.onmousemove = resizeMoveBL;
              document.ontouchmove = resizeMoveBL;
            } else {
              document.onmousemove = resizeMoveBR;
              document.ontouchmove = resizeMoveBR;
            }
            break;
          }
          document.onmousemove = resizeMoveB;
          document.ontouchmove = resizeMoveB;
          break;
        case 'l':
          document.onmousemove = resizeMoveL;
          document.ontouchmove = resizeMoveL;
          break;
        case 'r':
          document.onmousemove = resizeMoveR;
          document.ontouchmove = resizeMoveR;
          break;
      }
    },

    resizeMoveB = e=>{
      e.preventDefault();

      let clientY = e.clientY || e.touches[0].clientY;

      pos2 = pos4 - clientY;
      pos4 = clientY;

      Window.style.height = (Window.offsetHeight - padding - pos2) + "px";
    },

    resizeMoveT = e=>{
      e.preventDefault();

      let clientY = e.clientY || e.touches[0].clientY;

      pos2 = pos4 - clientY;
      pos4 = clientY;

      Window.style.top = (Window.offsetTop - pos2) + "px";
      Window.style.height = (Window.offsetHeight - padding + pos2) + "px";
    },

    resizeMoveL = e=>{
      e.preventDefault();

      let clientX = e.clientX || e.touches[0].clientX;

      pos1 = pos3 - clientX;
      pos3 = clientX;

      Window.style.left = (Window.offsetLeft - pos1) + "px";
      Window.style.width = (Window.offsetWidth - padding + pos1) + "px";
    },

    resizeMoveR = e=>{
      e.preventDefault();

      let clientX = e.clientX || e.touches[0].clientX;

      pos1 = pos3 - clientX;
      pos3 = clientX;

      Window.style.width = (Window.offsetWidth - padding - pos1) + "px";
    },

    resizeMoveTL = e=>{
      e.preventDefault();

      let clientX = e.clientX || e.touches[0].clientX,
          clientY = e.clientY || e.touches[0].clientY;

      pos1 = pos3 - clientX;
      pos2 = pos4 - clientY;
      pos3 = clientX;
      pos4 = clientY;

      Window.style.top = (Window.offsetTop - pos2) + "px";
      Window.style.height = (Window.offsetHeight - padding + pos2) + "px";
      Window.style.left = (Window.offsetLeft - pos1) + "px";
      Window.style.width = (Window.offsetWidth - padding + pos1) + "px";
    },

    resizeMoveTR = e=>{
      e.preventDefault();

      let clientX = e.clientX || e.touches[0].clientX,
          clientY = e.clientY || e.touches[0].clientY;

      pos1 = pos3 - clientX;
      pos2 = pos4 - clientY;
      pos3 = clientX;
      pos4 = clientY;

      Window.style.top = (Window.offsetTop - pos2) + "px";
      Window.style.height = (Window.offsetHeight - padding + pos2) + "px";
      Window.style.width = (Window.offsetWidth - padding - pos1) + "px";
    },

    resizeMoveBL = e=>{
      e.preventDefault();

      let clientX = e.clientX || e.touches[0].clientX,
          clientY = e.clientY || e.touches[0].clientY;

      pos1 = pos3 - clientX;
      pos2 = pos4 - clientY;
      pos3 = clientX;
      pos4 = clientY;

      Window.style.height = (Window.offsetHeight - padding - pos2) + "px";
      Window.style.left = (Window.offsetLeft - pos1) + "px";
      Window.style.width = (Window.offsetWidth - padding + pos1) + "px";
    },

    resizeMoveBR = e=>{
      e.preventDefault();

      let clientX = e.clientX || e.touches[0].clientX,
          clientY = e.clientY || e.touches[0].clientY;

      pos1 = pos3 - clientX;
      pos2 = pos4 - clientY;
      pos3 = clientX;
      pos4 = clientY;

      Window.style.height = (Window.offsetHeight - padding - pos2) + "px";
      Window.style.width = (Window.offsetWidth - padding - pos1) + "px";
    },

    resizeMove = e=>{
      e.preventDefault();

      let clientX = e.clientX || e.touches[0].clientX,
          clientY = e.clientY || e.touches[0].clientY;

      pos1 = pos3 - clientX;
      pos2 = pos4 - clientY;
      pos3 = clientX;
      pos4 = clientY;

      Window.style.height = (Window.offsetHeight - padding - pos2) + "px";
      Window.style.width = (Window.offsetWidth - padding - pos1) + "px";
    },

    stopResize = ()=>{
      document.onmouseup = null;
      document.ontouchend = null;

      document.onmousemove = null;
      document.ontouchmove = null;
    };

    let resizerElementT = getElement(`RSZt-${Window.id}`),
        resizerElementB = getElement(`RSZb-${Window.id}`),
        resizerElementL = getElement(`RSZl-${Window.id}`),
        resizerElementR = getElement(`RSZr-${Window.id}`),
        resizerElementTL = getElement(`RSZtl-${Window.id}`),
        resizerElementTR = getElement(`RSZtr-${Window.id}`),
        resizerElementBL = getElement(`RSZbl-${Window.id}`),
        resizerElementBR = getElement(`RSZbr-${Window.id}`);

        resizerElementT.onmousedown = startResize;
        resizerElementT.ontouchstart = startResize;
        resizerElementB.onmousedown = startResize;
        resizerElementB.ontouchstart = startResize;
        resizerElementL.onmousedown = startResize;
        resizerElementL.ontouchstart = startResize;
        resizerElementR.onmousedown = startResize;
        resizerElementR.ontouchstart = startResize;
        resizerElementTL.onmousedown = startResize;
        resizerElementTL.ontouchstart = startResize;
        resizerElementTR.onmousedown = startResize;
        resizerElementTR.ontouchstart = startResize;
        resizerElementBL.onmousedown = startResize;
        resizerElementBL.ontouchstart = startResize;
        resizerElementBR.onmousedown = startResize;
    resizerElementBR.ontouchstart = startResize;
  },
  close: (windowName)=>{
    if (!windowName)
      return;
    let subWindow = getElement(windowName);
    if (subWindow)
      if (subWindow.style.display == 'none') {
        getElement('hider'+subWindow.id).remove();
        subWindow.remove();
      }
      if (!subWindow.classList.contains('ANIM-full2'))
        subWindow.classList.add('ANIM-stop2');
      else {
        subWindow.classList.remove('ANIM-full2');
        subWindow.classList.add('ANIM-unfullstop2');
      }
    if (subWindow.classList.contains('ANIM-fullhide2'))
      subWindow.classList.remove('ANIM-fullhide2');

    subWindow.onanimationend = ()=>{
      [
        'DRAGGER'+windowName,
        'RSZb-'+windowName,
        'RSZl-'+windowName,
        'RSZr-'+windowName,
        'RSZt-'+windowName,
        'RSZtl-'+windowName,
        'RSZtr-'+windowName,
        'RSZbl-'+windowName,
        'RSZbr-'+windowName
      ].forEach(el=>{
        getElement(el).onmousedown = null;
        getElement(el).ontouchstart = null;
      });
      subWindow.remove();
      delete subWindows.subws[windowName];
    };
  },
  hide: (windowName, windowId)=>{
    let Window = getElement(windowId),
        animName = 'ANIM-hide2';
    if (Window.classList.contains('ANIM-fullhide2'))
      Window.classList.remove('ANIM-fullhide2');
    if (Window.classList.contains('ANIM-full2')) {
      Window.classList.remove('ANIM-full2');
      animName = 'ANIM-unfullhide2';
    }
    if (Window)
      Window.classList.add(animName);

    Window.onanimationend = ()=>{
      Window.style.display = 'none';
      if (animName != 'ANIM-unfullhide2')
        Window.classList.remove(animName);
      helperHider.insertAdjacentHTML('beforeend', basicButton(`${getTrans('WINDOW-'+windowName,'window')}`, `subWindows.unhide('${windowId}')`, ``, `hider${windowId}`));
      Window.onanimationend = null;
    };
    subWindows.subws[windowId].state = 'hidened';
  },
  unhide: (windowName)=>{
    let Window = getElement(windowName),
      hider = getElement('hider'+windowName);
    if (Window) {
      if (!Window.classList.contains('ANIM-unfullhide2'))
        Window.classList.add('ANIM-recreate2');
      else {
        Window.classList.remove('ANIM-unfullhide2');
        Window.classList.add('ANIM-fullhide2');
        Window.classList.add('ANIM-full2');
      }
      Window.style.display = '';
    }
    if (hider)
      hider.remove();

    Window.onanimationend = ()=>{
      if (!Window.classList.contains('ANIM-fullhide2')) {
        Window.classList.remove('ANIM-recreate2');
        subWindows.subws[windowName].state = 'opened';
      } else {
        subWindows.subws[windowName].state = 'openedF';
        // Window.classList.remove('ANIM-fullhide2');
      }
      Window.onanimationend = null;
    };
  },
},
windowButton = (text, func = '', style = '')=>{
  return `<button class=emptybtn style="padding:2px;color:var(--color-window);${style}" onclick="${func}">${text}</button>`;
},
basicButton = (text = '', func = '', style = '', id = '', Class = '')=>{
  return `<button ${id ? 'id="'+id+'"' : ''}class="loginbtn ${Class}" style="${style}" onclick="${func}"${text}/button>`;
},
memoreLeakCheck = ()=>{
    let DOM = document.querySelectorAll('*'),
    listeners = [];
    
    DOM.forEach(el => {
        for (let pr in el) 
            if (pr.startsWith('on') && el[pr])
                listeners.push(`${el.tagName}.${pr}`);
    });
    
    console.log('Listents cnt:', listeners.length);
    console.log('listeners list:', listeners);
    subWindows.open('listeners',
      `Listents cnt: ${listeners.length}<br>`+
      `listeners list:<br>${listeners.join('; ')}`
    )
},
// #endregion
// #region ловля ошибок
globalErr = (message, source, line, column, error)=>{
    returnError(message+`\nON LINE ${line} IN COLUMN ${column}`);
    return true;
  },
  getPromiseErrorPos = error=>{
    let errorStack = error.stack,
    errorPos = errorStack
      .split('&helper='+loadVer+':')[1]
      .split('\n')[0]
      .split(':');
    returnError(
      `PROMISE ERROR\n`+
      `${error}`+
      `\nON LINE ${errorPos[0]} IN COLUMN ${errorPos[1]}`
    , servError);
};

window.onerror = globalErr;
window.onunhandledrejection = globalErr;
// #endregion