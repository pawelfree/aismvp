var KontomatikPrivateUtils = {
    Objects: (function() {
      function pushNonBlank(array, elm) {
        if (elm) array.push(elm);
      }
  
      function stringify(object, opts, depth, prefix) {
        opts = opts || {};
        opts.maxDepth = opts.maxDepth || 5;
        depth = (depth && depth + 1) || 1;
        if (depth > opts.maxDepth + 1 || object === null || object === undefined) return '';
  
        if (typeof object === 'string' || typeof object === 'number' || typeof object === 'boolean')
          return prefix ? encodeURIComponent(prefix) + '=' + encodeURIComponent(object) : '';
  
        var parts = [];
        for (var key in object)
          if (object.hasOwnProperty(key))
            pushNonBlank(parts, stringify(object[key], opts, depth, prefix ? prefix + '[' + key + ']' : key));
  
        return parts.join('&');
      }
  
      return {
        stringify: stringify
      };
    })(),
    openKontomatikPopup: (function() {
      'use strict';
      var kontomatikPopup;
  
      return function(url, name, windowFeatures) {
        if (!kontomatikPopup || kontomatikPopup.closed) {
          kontomatikPopup = window.open(url, name, windowFeatures);
        }
      };
    })()
  };
  
  function createEmbedFunction(isPopup) {
    var HOST = 'https://signin.kontomatik.com';
    var options = {};
  
    function embedWidget() {
      var error = checkForEmbedErrors(options);
      if (error) {
        alert(error);
        throw new Error(error);
      }
      doEmbedWidget();
    }
  
    function checkForEmbedErrors(options) {
      if (!document.getElementById(options.divId)) {
        return 'Unable to embed widget. Reason: missing element with id="' + options.divId + '"';
      }
    }
  
    function doEmbedWidget() {
      if (window.addEventListener) window.addEventListener('message', callback, false);
      else window.attachEvent('onmessage', callback);
  
      injectKontomatikHtml();
    }
  
    function injectKontomatikHtml() {
      if (isPopup) {
        injectPopupHtml();
      } else {
        injectWidgetHtml();
      }
    }
  
    function injectPopupHtml() {
      var width = 500;
      var height = 600;
      var left = (screen.width - width) / 2;
      var top = (screen.height - height) / 2;
      var buttonLabel = options.buttonLabel ? options.buttonLabel : 'Kontomatik SignIn';
      var windowFeatures =
        'location=yes,resizable=yes,scrollbars=yes,status=yes,width=' +
        width +
        ',height=' +
        height +
        ',top=' +
        top +
        ',left=' +
        left;
      document.getElementById(options.divId).innerHTML =
        '<button id="kontomatik-button" onclick="KontomatikPrivateUtils.openKontomatikPopup(\'' +
        buildUrl() +
        "', '_blank', '" +
        windowFeatures +
        '\');">' +
        buttonLabel +
        '</button>';
    }
  
    function injectWidgetHtml() {
      var anchor = document.getElementById(options.divId);
  
      // Clear all child nodes
      anchor.innerHTML = '';
  
      // Append iframe
      anchor.appendChild(createIframeElement());
    }
  
    function createIframeElement() {
      var el = document.createElement('iframe');
  
      el.src = buildUrl();
      el.style.width = '100%';
      el.style.cssText += ' min-width: 280px !important;';
      el.style.margin = 0;
      el.style.padding = 0;
      el.style.border = 'none';
      el.style.overflow = 'hidden';
      el.scrolling = 'no';
      if (!options.layout) el.style['max-width'] = '400px';
      if (!options.dynamicHeight) {
        el.height = '560';
        el.style.cssText += ' height: 560px !important;';
      }
  
      return el;
    }
  
    function buildUrl() {
      var parameters = {};
      var names = [
        'client',
        'locale',
        'country',
        'ownerExternalId',
        'showFavicons',
        'showScreenshots',
        'layout',
        'target',
        'widgetEmbeddedUrl',
        'styles',
        'autoImport',
        'screenshotZoomIn',
        'showTargetMissingOption',
        'showDefaultTarget',
        'showBetaQualityLabels',
        'showTargetMissingForm',
        'clientIdentity',
        'isPopup',
        'dynamicHeight',
        'psd2',
        'forceTestCredentials'
      ];
      for (var i = 0; i < names.length; i++)
        if (options.hasOwnProperty(names[i])) parameters[names[i]] = options[names[i]];
      return baseUrl() + KontomatikPrivateUtils.Objects.stringify(parameters);
    }
  
    function baseUrl() {
      return HOST + popupPath() + 'signin/?';
    }
  
    function popupPath() {
      if (isPopup) {
        return '/popup/';
      } else {
        return '/';
      }
    }
  
    function parseJson(text) {
      try {
        return JSON.parse(text);
      } catch (e) {
        return {};
      }
    }
  
    function callback(event) {
      if (event.origin !== HOST) return;
      var json = typeof event.data === 'string' ? parseJson(event.data) : event.data;
  
      if (!json.kontomatik) return;
  
      if (json.kontomatik.screenshot) callOnScreenshot(json);
      else if (json.kontomatik.error) callOnError(json);
      else if (json.kontomatik.unsupportedTarget) callOnUnsupportedTarget(json);
      else if (json.kontomatik.signedIn) callOnSuccess(json);
      else if (json.kontomatik.application) callOnApplicationStateChanged(json);
      else if (json.kontomatik.targetSelected) callOnTargetSelected(json);
      else if (json.kontomatik.credentialEntered) callOnCredentialEntered(json);
      else if (json.kontomatik.started) callOnStarted(json);
      else if (json.kontomatik.widgetSize) resizeWidget(json);
    }
  
    function callOnScreenshot(json) {
      options.onScreenshotClicked && options.onScreenshotClicked(json.kontomatik.screenshot);
    }
  
    function callOnError(json) {
      options.onError &&
        options.onError(json.kontomatik.error.cause, {
          target: json.kontomatik.error.target,
          sessionId: json.kontomatik.error.sessionId,
          message: json.kontomatik.error.message
        });
    }
  
    function callOnSuccess(json) {
      options.onSuccess &&
        options.onSuccess(
          json.kontomatik.signedIn.target,
          json.kontomatik.signedIn.sessionId,
          json.kontomatik.signedIn.sessionIdSignature,
          json.kontomatik.signedIn.options
        );
    }
  
    function callOnUnsupportedTarget(json) {
      options.onUnsupportedTarget &&
        options.onUnsupportedTarget({
          target: json.kontomatik.unsupportedTarget.target,
          country: json.kontomatik.unsupportedTarget.country,
          address: json.kontomatik.unsupportedTarget.address
        });
    }
  
    function callOnApplicationStateChanged(json) {
      if (options.onInitialized && json.kontomatik.application.state === 'widgetInitialized')
        options.onInitialized({
          application: {
            state: json.kontomatik.application.state
          }
        });
  
      if (options.onUnloaded && json.kontomatik.application.state === 'unloaded')
        options.onUnloaded({
          application: {
            state: json.kontomatik.application.state
          }
        });
    }
  
    function callOnTargetSelected(json) {
      options.onTargetSelected && options.onTargetSelected(json.kontomatik.targetSelected);
    }
  
    function callOnCredentialEntered() {
      options.onCredentialEntered && options.onCredentialEntered();
    }
  
    function callOnStarted() {
      options.onStarted && options.onStarted();
    }
  
    function resizeWidget(json) {
      if (options.dynamicHeight) {
        var widgetSize = json.kontomatik.widgetSize || {};
        var anchor = document.querySelector('#' + options.divId + " iframe[src^='" + baseUrl() + "']");
        if (widgetSize.height && anchor) anchor.height = widgetSize.height;
      }
    }
  
    return function(opts) {
      options = opts;
      options.isPopup = isPopup;
      if (!options.divId) options.divId = 'kontomatik';
      if (window.location) options.widgetEmbeddedUrl = window.location.href;
      if (options.onScreenshotClicked) options.screenshotZoomIn = true;
      embedWidget();
    };
  }
  
  var embedKontomatik = (function() {
    return createEmbedFunction(false);
  })();
  
  var embedKontomatikPopup = (function() {
    return createEmbedFunction(true);
  })();
  
  // @Deprecated
  function embedKontox(options) {
    embedKontomatik(options);
  }