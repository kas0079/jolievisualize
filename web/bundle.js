/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.css":
/*!***********************!*\
  !*** ./src/index.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/svelte-hmr/runtime/hot-api.js":
/*!****************************************************!*\
  !*** ./node_modules/svelte-hmr/runtime/hot-api.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeApplyHmr": () => (/* binding */ makeApplyHmr)
/* harmony export */ });
/* harmony import */ var _proxy_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./proxy.js */ "./node_modules/svelte-hmr/runtime/proxy.js");
/* eslint-env browser */



const logPrefix = '[HMR:Svelte]'

// eslint-disable-next-line no-console
const log = (...args) => console.log(logPrefix, ...args)

const domReload = () => {
  // eslint-disable-next-line no-undef
  const win = typeof window !== 'undefined' && window
  if (win && win.location && win.location.reload) {
    log('Reload')
    win.location.reload()
  } else {
    log('Full reload required')
  }
}

const replaceCss = (previousId, newId) => {
  if (typeof document === 'undefined') return false
  if (!previousId) return false
  if (!newId) return false
  // svelte-xxx-style => svelte-xxx
  const previousClass = previousId.slice(0, -6)
  const newClass = newId.slice(0, -6)
  // eslint-disable-next-line no-undef
  document.querySelectorAll('.' + previousClass).forEach(el => {
    el.classList.remove(previousClass)
    el.classList.add(newClass)
  })
  return true
}

const removeStylesheet = cssId => {
  if (cssId == null) return
  if (typeof document === 'undefined') return
  // eslint-disable-next-line no-undef
  const el = document.getElementById(cssId)
  if (el) el.remove()
  return
}

const defaultArgs = {
  reload: domReload,
}

const makeApplyHmr = transformArgs => args => {
  const allArgs = transformArgs({ ...defaultArgs, ...args })
  return applyHmr(allArgs)
}

let needsReload = false

function applyHmr(args) {
  const {
    id,
    cssId,
    nonCssHash,
    reload = domReload,
    // normalized hot API (must conform to rollup-plugin-hot)
    hot,
    hotOptions,
    Component,
    acceptable, // some types of components are impossible to HMR correctly
    preserveLocalState,
    ProxyAdapter,
    emitCss,
  } = args

  const existing = hot.data && hot.data.record

  const canAccept = acceptable && (!existing || existing.current.canAccept)

  const r =
    existing ||
    (0,_proxy_js__WEBPACK_IMPORTED_MODULE_0__.createProxy)({
      Adapter: ProxyAdapter,
      id,
      Component,
      hotOptions,
      canAccept,
      preserveLocalState,
    })

  const cssOnly =
    hotOptions.injectCss &&
    existing &&
    nonCssHash &&
    existing.current.nonCssHash === nonCssHash

  r.update({
    Component,
    hotOptions,
    canAccept,
    nonCssHash,
    cssId,
    previousCssId: r.current.cssId,
    cssOnly,
    preserveLocalState,
  })

  hot.dispose(data => {
    // handle previous fatal errors
    if (needsReload || (0,_proxy_js__WEBPACK_IMPORTED_MODULE_0__.hasFatalError)()) {
      if (hotOptions && hotOptions.noReload) {
        log('Full reload required')
      } else {
        reload()
      }
    }

    // 2020-09-21 Snowpack master doesn't pass data as arg to dispose handler
    data = data || hot.data

    data.record = r

    if (!emitCss && cssId && r.current.cssId !== cssId) {
      if (hotOptions.cssEjectDelay) {
        setTimeout(() => removeStylesheet(cssId), hotOptions.cssEjectDelay)
      } else {
        removeStylesheet(cssId)
      }
    }
  })

  if (canAccept) {
    hot.accept(async arg => {
      const { bubbled } = arg || {}

      // NOTE Snowpack registers accept handlers only once, so we can NOT rely
      // on the surrounding scope variables -- they're not the last version!
      const { cssId: newCssId, previousCssId } = r.current
      const cssChanged = newCssId !== previousCssId
      // ensure old style sheet has been removed by now
      if (!emitCss && cssChanged) removeStylesheet(previousCssId)
      // guard: css only change
      if (
        // NOTE bubbled is provided only by rollup-plugin-hot, and we
        // can't safely assume a CSS only change without it... this means we
        // can't support CSS only injection with Nollup or Webpack currently
        bubbled === false && // WARNING check false, not falsy!
        r.current.cssOnly &&
        (!cssChanged || replaceCss(previousCssId, newCssId))
      ) {
        return
      }

      const success = await r.reload()

      if ((0,_proxy_js__WEBPACK_IMPORTED_MODULE_0__.hasFatalError)() || (!success && !hotOptions.optimistic)) {
        needsReload = true
      }
    })
  }

  // well, endgame... we won't be able to render next updates, even successful,
  // if we don't have proxies in svelte's tree
  //
  // since we won't return the proxy and the app will expect a svelte component,
  // it's gonna crash... so it's best to report the real cause
  //
  // full reload required
  //
  const proxyOk = r && r.proxy
  if (!proxyOk) {
    throw new Error(`Failed to create HMR proxy for Svelte component ${id}`)
  }

  return r.proxy
}


/***/ }),

/***/ "./node_modules/svelte-hmr/runtime/index.js":
/*!**************************************************!*\
  !*** ./node_modules/svelte-hmr/runtime/index.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "makeApplyHmr": () => (/* reexport safe */ _hot_api_js__WEBPACK_IMPORTED_MODULE_0__.makeApplyHmr)
/* harmony export */ });
/* harmony import */ var _hot_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./hot-api.js */ "./node_modules/svelte-hmr/runtime/hot-api.js");



/***/ }),

/***/ "./node_modules/svelte-hmr/runtime/overlay.js":
/*!****************************************************!*\
  !*** ./node_modules/svelte-hmr/runtime/overlay.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* eslint-env browser */

const removeElement = el => el && el.parentNode && el.parentNode.removeChild(el)

const ErrorOverlay = () => {
  let errors = []
  let compileError = null

  const errorsTitle = 'Failed to init component'
  const compileErrorTitle = 'Failed to compile'

  const style = {
    section: `
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 32px;
      background: rgba(0, 0, 0, .85);
      font-family: Menlo, Consolas, monospace;
      font-size: large;
      color: rgb(232, 232, 232);
      overflow: auto;
      z-index: 2147483647;
    `,
    h1: `
      margin-top: 0;
      color: #E36049;
      font-size: large;
      font-weight: normal;
    `,
    h2: `
      margin: 32px 0 0;
      font-size: large;
      font-weight: normal;
    `,
    pre: ``,
  }

  const createOverlay = () => {
    const h1 = document.createElement('h1')
    h1.style = style.h1
    const section = document.createElement('section')
    section.appendChild(h1)
    section.style = style.section
    const body = document.createElement('div')
    section.appendChild(body)
    return { h1, el: section, body }
  }

  const setTitle = title => {
    overlay.h1.textContent = title
  }

  const show = () => {
    const { el } = overlay
    if (!el.parentNode) {
      const target = document.body
      target.appendChild(overlay.el)
    }
  }

  const hide = () => {
    const { el } = overlay
    if (el.parentNode) {
      overlay.el.remove()
    }
  }

  const update = () => {
    if (compileError) {
      overlay.body.innerHTML = ''
      setTitle(compileErrorTitle)
      const errorEl = renderError(compileError)
      overlay.body.appendChild(errorEl)
      show()
    } else if (errors.length > 0) {
      overlay.body.innerHTML = ''
      setTitle(errorsTitle)
      errors.forEach(({ title, message }) => {
        const errorEl = renderError(message, title)
        overlay.body.appendChild(errorEl)
      })
      show()
    } else {
      hide()
    }
  }

  const renderError = (message, title) => {
    const div = document.createElement('div')
    if (title) {
      const h2 = document.createElement('h2')
      h2.textContent = title
      h2.style = style.h2
      div.appendChild(h2)
    }
    const pre = document.createElement('pre')
    pre.textContent = message
    div.appendChild(pre)
    return div
  }

  const addError = (error, title) => {
    const message = (error && error.stack) || error
    errors.push({ title, message })
    update()
  }

  const clearErrors = () => {
    errors.forEach(({ element }) => {
      removeElement(element)
    })
    errors = []
    update()
  }

  const setCompileError = message => {
    compileError = message
    update()
  }

  const overlay = createOverlay()

  return {
    addError,
    clearErrors,
    setCompileError,
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ErrorOverlay);


/***/ }),

/***/ "./node_modules/svelte-hmr/runtime/proxy-adapter-dom.js":
/*!**************************************************************!*\
  !*** ./node_modules/svelte-hmr/runtime/proxy-adapter-dom.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "adapter": () => (/* binding */ adapter),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
/* harmony import */ var _overlay_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./overlay.js */ "./node_modules/svelte-hmr/runtime/overlay.js");
/* global window, document */

// NOTE from 3.38.3 (or so), insert was carrying the hydration logic, that must
// be used because DOM elements are reused more (and so insertion points are not
// necessarily added in order); then in 3.40 the logic was moved to
// insert_hydration, which is the one we must use for HMR
const svelteInsert = svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert_hydration || svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert
if (!svelteInsert) {
  throw new Error(
    'failed to find insert_hydration and insert in svelte/internal'
  )
}



const removeElement = el => el && el.parentNode && el.parentNode.removeChild(el)

const adapter = class ProxyAdapterDom {
  constructor(instance) {
    this.instance = instance
    this.insertionPoint = null

    this.afterMount = this.afterMount.bind(this)
    this.rerender = this.rerender.bind(this)

    this._noOverlay = !!instance.hotOptions.noOverlay
  }

  // NOTE overlay is only created before being actually shown to help test
  // runner (it won't have to account for error overlay when running assertions
  // about the contents of the rendered page)
  static getErrorOverlay(noCreate = false) {
    if (!noCreate && !this.errorOverlay) {
      this.errorOverlay = (0,_overlay_js__WEBPACK_IMPORTED_MODULE_1__["default"])()
    }
    return this.errorOverlay
  }

  // TODO this is probably unused now: remove in next breaking release
  static renderCompileError(message) {
    const noCreate = !message
    const overlay = this.getErrorOverlay(noCreate)
    if (!overlay) return
    overlay.setCompileError(message)
  }

  dispose() {
    // Component is being destroyed, detaching is not optional in Svelte3's
    // component API, so we can dispose of the insertion point in every case.
    if (this.insertionPoint) {
      removeElement(this.insertionPoint)
      this.insertionPoint = null
    }
    this.clearError()
  }

  // NOTE afterMount CAN be called multiple times (e.g. keyed list)
  afterMount(target, anchor) {
    const {
      instance: { debugName },
    } = this
    if (!this.insertionPoint) {
      this.insertionPoint = document.createComment(debugName)
    }
    svelteInsert(target, this.insertionPoint, anchor)
  }

  rerender() {
    this.clearError()
    const {
      instance: { refreshComponent },
      insertionPoint,
    } = this
    if (!insertionPoint) {
      throw new Error('Cannot rerender: missing insertion point')
    }
    refreshComponent(insertionPoint.parentNode, insertionPoint)
  }

  renderError(err) {
    if (this._noOverlay) return
    const {
      instance: { debugName },
    } = this
    const title = debugName || err.moduleName || 'Error'
    this.constructor.getErrorOverlay().addError(err, title)
  }

  clearError() {
    if (this._noOverlay) return
    const overlay = this.constructor.getErrorOverlay(true)
    if (!overlay) return
    overlay.clearErrors()
  }
}

// TODO this is probably unused now: remove in next breaking release
if (typeof window !== 'undefined') {
  window.__SVELTE_HMR_ADAPTER = adapter
}

// mitigate situation with Snowpack remote source pulling latest of runtime,
// but using previous version of the Node code transform in the plugin
// see: https://github.com/rixo/svelte-hmr/issues/27
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (adapter);


/***/ }),

/***/ "./node_modules/svelte-hmr/runtime/proxy.js":
/*!**************************************************!*\
  !*** ./node_modules/svelte-hmr/runtime/proxy.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createProxy": () => (/* binding */ createProxy),
/* harmony export */   "hasFatalError": () => (/* binding */ hasFatalError)
/* harmony export */ });
/* harmony import */ var _svelte_hooks_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./svelte-hooks.js */ "./node_modules/svelte-hmr/runtime/svelte-hooks.js");
/* eslint-env browser */
/**
 * The HMR proxy is a component-like object whose task is to sit in the
 * component tree in place of the proxied component, and rerender each
 * successive versions of said component.
 */



const handledMethods = ['constructor', '$destroy']
const forwardedMethods = ['$set', '$on']

const logError = (msg, err) => {
  // eslint-disable-next-line no-console
  console.error('[HMR][Svelte]', msg)
  if (err) {
    // NOTE avoid too much wrapping around user errors
    // eslint-disable-next-line no-console
    console.error(err)
  }
}

const posixify = file => file.replace(/[/\\]/g, '/')

const getBaseName = id =>
  id
    .split('/')
    .pop()
    .split('.')
    .slice(0, -1)
    .join('.')

const capitalize = str => str[0].toUpperCase() + str.slice(1)

const getFriendlyName = id => capitalize(getBaseName(posixify(id)))

const getDebugName = id => `<${getFriendlyName(id)}>`

const relayCalls = (getTarget, names, dest = {}) => {
  for (const key of names) {
    dest[key] = function(...args) {
      const target = getTarget()
      if (!target) {
        return
      }
      return target[key] && target[key].call(this, ...args)
    }
  }
  return dest
}

const isInternal = key => key !== '$$' && key.slice(0, 2) === '$$'

// This is intented as a somewhat generic / prospective fix to the situation
// that arised with the introduction of $$set in Svelte 3.24.1 -- trying to
// avoid giving full knowledge (like its name) of this implementation detail
// to the proxy. The $$set method can be present or not on the component, and
// its presence impacts the behaviour (but with HMR it will be tested if it is
// present _on the proxy_). So the idea here is to expose exactly the same $$
// props as the current version of the component and, for those that are
// functions, proxy the calls to the current component.
const relayInternalMethods = (proxy, cmp) => {
  // delete any previously added $$ prop
  Object.keys(proxy)
    .filter(isInternal)
    .forEach(key => {
      delete proxy[key]
    })
  // guard: no component
  if (!cmp) return
  // proxy current $$ props to the actual component
  Object.keys(cmp)
    .filter(isInternal)
    .forEach(key => {
      Object.defineProperty(proxy, key, {
        configurable: true,
        get() {
          const value = cmp[key]
          if (typeof value !== 'function') return value
          return (
            value &&
            function(...args) {
              return value.apply(this, args)
            }
          )
        },
      })
    })
}

// proxy custom methods
const copyComponentProperties = (proxy, cmp, previous) => {
  if (previous) {
    previous.forEach(prop => {
      delete proxy[prop]
    })
  }

  const props = Object.getOwnPropertyNames(Object.getPrototypeOf(cmp))
  const wrappedProps = props.filter(prop => {
    if (!handledMethods.includes(prop) && !forwardedMethods.includes(prop)) {
      Object.defineProperty(proxy, prop, {
        configurable: true,
        get() {
          return cmp[prop]
        },
        set(value) {
          // we're changing it on the real component first to see what it
          // gives... if it throws an error, we want to throw the same error in
          // order to most closely follow non-hmr behaviour.
          cmp[prop] = value
        },
      })
      return true
    }
  })

  return wrappedProps
}

// everything in the constructor!
//
// so we don't polute the component class with new members
//
class ProxyComponent {
  constructor(
    {
      Adapter,
      id,
      debugName,
      current, // { Component, hotOptions: { preserveLocalState, ... } }
      register,
    },
    options // { target, anchor, ... }
  ) {
    let cmp
    let disposed = false
    let lastError = null

    const setComponent = _cmp => {
      cmp = _cmp
      relayInternalMethods(this, cmp)
    }

    const getComponent = () => cmp

    const destroyComponent = () => {
      // destroyComponent is tolerant (don't crash on no cmp) because it
      // is possible that reload/rerender is called after a previous
      // createComponent has failed (hence we have a proxy, but no cmp)
      if (cmp) {
        cmp.$destroy()
        setComponent(null)
      }
    }

    const refreshComponent = (target, anchor, conservativeDestroy) => {
      if (lastError) {
        lastError = null
        adapter.rerender()
      } else {
        try {
          const replaceOptions = {
            target,
            anchor,
            preserveLocalState: current.preserveLocalState,
          }
          if (conservativeDestroy) {
            replaceOptions.conservativeDestroy = true
          }
          cmp.$replace(current.Component, replaceOptions)
        } catch (err) {
          setError(err, target, anchor)
          if (
            !current.hotOptions.optimistic ||
            // non acceptable components (that is components that have to defer
            // to their parent for rerender -- e.g. accessors, named exports)
            // are most tricky, and they havent been considered when most of the
            // code has been written... as a result, they are especially tricky
            // to deal with, it's better to consider any error with them to be
            // fatal to avoid odities
            !current.canAccept ||
            (err && err.hmrFatal)
          ) {
            throw err
          } else {
            // const errString = String((err && err.stack) || err)
            logError(`Error during component init: ${debugName}`, err)
          }
        }
      }
    }

    const setError = err => {
      lastError = err
      adapter.renderError(err)
    }

    const instance = {
      hotOptions: current.hotOptions,
      proxy: this,
      id,
      debugName,
      refreshComponent,
    }

    const adapter = new Adapter(instance)

    const { afterMount, rerender } = adapter

    // $destroy is not called when a child component is disposed, so we
    // need to hook from fragment.
    const onDestroy = () => {
      // NOTE do NOT call $destroy on the cmp from here; the cmp is already
      //   dead, this would not work
      if (!disposed) {
        disposed = true
        adapter.dispose()
        unregister()
      }
    }

    // ---- register proxy instance ----

    const unregister = register(rerender)

    // ---- augmented methods ----

    this.$destroy = () => {
      destroyComponent()
      onDestroy()
    }

    // ---- forwarded methods ----

    relayCalls(getComponent, forwardedMethods, this)

    // ---- create & mount target component instance ---

    try {
      let lastProperties
      ;(0,_svelte_hooks_js__WEBPACK_IMPORTED_MODULE_0__.createProxiedComponent)(current.Component, options, {
        allowLiveBinding: current.hotOptions.allowLiveBinding,
        onDestroy,
        onMount: afterMount,
        onInstance: comp => {
          setComponent(comp)
          // WARNING the proxy MUST use the same $$ object as its component
          // instance, because a lot of wiring happens during component
          // initialisation... lots of references to $$ and $$.fragment have
          // already been distributed around when the component constructor
          // returns, before we have a chance to wrap them (and so we can't
          // wrap them no more, because existing references would become
          // invalid)
          this.$$ = comp.$$
          lastProperties = copyComponentProperties(this, comp, lastProperties)
        },
      })
    } catch (err) {
      const { target, anchor } = options
      setError(err, target, anchor)
      throw err
    }
  }
}

const syncStatics = (component, proxy, previousKeys) => {
  // remove previously copied keys
  if (previousKeys) {
    for (const key of previousKeys) {
      delete proxy[key]
    }
  }

  // forward static properties and methods
  const keys = []
  for (const key in component) {
    keys.push(key)
    proxy[key] = component[key]
  }

  return keys
}

const globalListeners = {}

const onGlobal = (event, fn) => {
  event = event.toLowerCase()
  if (!globalListeners[event]) globalListeners[event] = []
  globalListeners[event].push(fn)
}

const fireGlobal = (event, ...args) => {
  const listeners = globalListeners[event]
  if (!listeners) return
  for (const fn of listeners) {
    fn(...args)
  }
}

const fireBeforeUpdate = () => fireGlobal('beforeupdate')

const fireAfterUpdate = () => fireGlobal('afterupdate')

if (typeof window !== 'undefined') {
  window.__SVELTE_HMR = {
    on: onGlobal,
  }
  window.dispatchEvent(new CustomEvent('svelte-hmr:ready'))
}

let fatalError = false

const hasFatalError = () => fatalError

/**
 * Creates a HMR proxy and its associated `reload` function that pushes a new
 * version to all existing instances of the component.
 */
function createProxy({
  Adapter,
  id,
  Component,
  hotOptions,
  canAccept,
  preserveLocalState,
}) {
  const debugName = getDebugName(id)
  const instances = []

  // current object will be updated, proxy instances will keep a ref
  const current = {
    Component,
    hotOptions,
    canAccept,
    preserveLocalState,
  }

  const name = `Proxy${debugName}`

  // this trick gives the dynamic name Proxy<MyComponent> to the concrete
  // proxy class... unfortunately, this doesn't shows in dev tools, but
  // it stills allow to inspect cmp.constructor.name to confirm an instance
  // is a proxy
  const proxy = {
    [name]: class extends ProxyComponent {
      constructor(options) {
        try {
          super(
            {
              Adapter,
              id,
              debugName,
              current,
              register: rerender => {
                instances.push(rerender)
                const unregister = () => {
                  const i = instances.indexOf(rerender)
                  instances.splice(i, 1)
                }
                return unregister
              },
            },
            options
          )
        } catch (err) {
          // If we fail to create a proxy instance, any instance, that means
          // that we won't be able to fix this instance when it is updated.
          // Recovering to normal state will be impossible. HMR's dead.
          //
          // Fatal error will trigger a full reload on next update (reloading
          // right now is kinda pointless since buggy code still exists).
          //
          // NOTE Only report first error to avoid too much polution -- following
          // errors are probably caused by the first one, or they will show up
          // in turn when the first one is fixed ¯\_(ツ)_/¯
          //
          if (!fatalError) {
            fatalError = true
            logError(
              `Unrecoverable HMR error in ${debugName}: ` +
                `next update will trigger a full reload`
            )
          }
          throw err
        }
      }
    },
  }[name]

  // initialize static members
  let previousStatics = syncStatics(current.Component, proxy)

  const update = newState => Object.assign(current, newState)

  // reload all existing instances of this component
  const reload = () => {
    fireBeforeUpdate()

    // copy statics before doing anything because a static prop/method
    // could be used somewhere in the create/render call
    previousStatics = syncStatics(current.Component, proxy, previousStatics)

    const errors = []

    instances.forEach(rerender => {
      try {
        rerender()
      } catch (err) {
        logError(`Failed to rerender ${debugName}`, err)
        errors.push(err)
      }
    })

    if (errors.length > 0) {
      return false
    }

    fireAfterUpdate()

    return true
  }

  const hasFatalError = () => fatalError

  return { id, proxy, update, reload, hasFatalError, current }
}


/***/ }),

/***/ "./node_modules/svelte-hmr/runtime/svelte-hooks.js":
/*!*********************************************************!*\
  !*** ./node_modules/svelte-hmr/runtime/svelte-hooks.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createProxiedComponent": () => (/* binding */ createProxiedComponent)
/* harmony export */ });
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
/**
 * Emulates forthcoming HMR hooks in Svelte.
 *
 * All references to private component state ($$) are now isolated in this
 * module.
 */


const captureState = cmp => {
  // sanity check: propper behaviour here is to crash noisily so that
  // user knows that they're looking at something broken
  if (!cmp) {
    throw new Error('Missing component')
  }
  if (!cmp.$$) {
    throw new Error('Invalid component')
  }

  const {
    $$: { callbacks, bound, ctx, props },
  } = cmp

  const state = cmp.$capture_state()

  // capturing current value of props (or we'll recreate the component with the
  // initial prop values, that may have changed -- and would not be reflected in
  // options.props)
  const hmr_props_values = {}
  Object.keys(cmp.$$.props).forEach(prop => {
    hmr_props_values[prop] = ctx[props[prop]]
  })

  return {
    ctx,
    props,
    callbacks,
    bound,
    state,
    hmr_props_values,
  }
}

// remapping all existing bindings (including hmr_future_foo ones) to the
// new version's props indexes, and refresh them with the new value from
// context
const restoreBound = (cmp, restore) => {
  // reverse prop:ctxIndex in $$.props to ctxIndex:prop
  //
  // ctxIndex can be either a regular index in $$.ctx or a hmr_future_ prop
  //
  const propsByIndex = {}
  for (const [name, i] of Object.entries(restore.props)) {
    propsByIndex[i] = name
  }

  // NOTE $$.bound cannot change in the HMR lifetime of a component, because
  //      if bindings changes, that means the parent component has changed,
  //      which means the child (current) component will be wholly recreated
  for (const [oldIndex, updateBinding] of Object.entries(restore.bound)) {
    // can be either regular prop, or future_hmr_ prop
    const propName = propsByIndex[oldIndex]

    // this should never happen if remembering of future props is enabled...
    // in any case, there's nothing we can do about it if we have lost prop
    // name knowledge at this point
    if (propName == null) continue

    // NOTE $$.props[propName] also propagates knowledge of a possible
    //      future prop to the new $$.props (via $$.props being a Proxy)
    const newIndex = cmp.$$.props[propName]
    cmp.$$.bound[newIndex] = updateBinding

    // NOTE if the prop doesn't exist or doesn't exist anymore in the new
    //      version of the component, clearing the binding is the expected
    //      behaviour (since that's what would happen in non HMR code)
    const newValue = cmp.$$.ctx[newIndex]
    updateBinding(newValue)
  }
}

// restoreState
//
// It is too late to restore context at this point because component instance
// function has already been called (and so context has already been read).
// Instead, we rely on setting current_component to the same value it has when
// the component was first rendered -- which fix support for context, and is
// also generally more respectful of normal operation.
//
const restoreState = (cmp, restore) => {
  if (!restore) return

  if (restore.callbacks) {
    cmp.$$.callbacks = restore.callbacks
  }

  if (restore.bound) {
    restoreBound(cmp, restore)
  }

  // props, props.$$slots are restored at component creation (works
  // better -- well, at all actually)
}

const get_current_component_safe = () => {
  // NOTE relying on dynamic bindings (current_component) makes us dependent on
  // bundler config (and apparently it does not work in demo-svelte-nollup)
  try {
    // unfortunately, unlike current_component, get_current_component() can
    // crash in the normal path (when there is really no parent)
    return (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.get_current_component)()
  } catch (err) {
    // ... so we need to consider that this error means that there is no parent
    //
    // that makes us tightly coupled to the error message but, at least, we
    // won't mute an unexpected error, which is quite a horrible thing to do
    if (err.message === 'Function called outside component initialization') {
      // who knows...
      return svelte_internal__WEBPACK_IMPORTED_MODULE_0__.current_component
    } else {
      throw err
    }
  }
}

const createProxiedComponent = (
  Component,
  initialOptions,
  { allowLiveBinding, onInstance, onMount, onDestroy }
) => {
  let cmp
  let options = initialOptions

  const isCurrent = _cmp => cmp === _cmp

  const assignOptions = (target, anchor, restore, preserveLocalState) => {
    const props = Object.assign({}, options.props)

    // Filtering props to avoid "unexpected prop" warning
    // NOTE this is based on props present in initial options, but it should
    //      always works, because props that are passed from the parent can't
    //      change without a code change to the parent itself -- hence, the
    //      child component will be fully recreated, and initial options should
    //      always represent props that are currnetly passed by the parent
    if (options.props && restore.hmr_props_values) {
      for (const prop of Object.keys(options.props)) {
        if (restore.hmr_props_values.hasOwnProperty(prop)) {
          props[prop] = restore.hmr_props_values[prop]
        }
      }
    }

    if (preserveLocalState && restore.state) {
      if (Array.isArray(preserveLocalState)) {
        // form ['a', 'b'] => preserve only 'a' and 'b'
        props.$$inject = {}
        for (const key of preserveLocalState) {
          props.$$inject[key] = restore.state[key]
        }
      } else {
        props.$$inject = restore.state
      }
    } else {
      delete props.$$inject
    }
    options = Object.assign({}, initialOptions, {
      target,
      anchor,
      props,
      hydrate: false,
    })
  }

  // Preserving knowledge of "future props" -- very hackish version (maybe
  // there should be an option to opt out of this)
  //
  // The use case is bind:something where something doesn't exist yet in the
  // target component, but comes to exist later, after a HMR update.
  //
  // If Svelte can't map a prop in the current version of the component, it
  // will just completely discard it:
  // https://github.com/sveltejs/svelte/blob/1632bca34e4803d6b0e0b0abd652ab5968181860/src/runtime/internal/Component.ts#L46
  //
  const rememberFutureProps = cmp => {
    if (typeof Proxy === 'undefined') return

    cmp.$$.props = new Proxy(cmp.$$.props, {
      get(target, name) {
        if (target[name] === undefined) {
          target[name] = 'hmr_future_' + name
        }
        return target[name]
      },
      set(target, name, value) {
        target[name] = value
      },
    })
  }

  const instrument = targetCmp => {
    const createComponent = (Component, restore, previousCmp) => {
      ;(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_current_component)(parentComponent || previousCmp)
      const comp = new Component(options)
      // NOTE must be instrumented before restoreState, because restoring
      // bindings relies on hacked $$.props
      instrument(comp)
      restoreState(comp, restore)
      return comp
    }

    rememberFutureProps(targetCmp)

    targetCmp.$$.on_hmr = []

    // `conservative: true` means we want to be sure that the new component has
    // actually been successfuly created before destroying the old instance.
    // This could be useful for preventing runtime errors in component init to
    // bring down the whole HMR. Unfortunately the implementation bellow is
    // broken (FIXME), but that remains an interesting target for when HMR hooks
    // will actually land in Svelte itself.
    //
    // The goal would be to render an error inplace in case of error, to avoid
    // losing the navigation stack (especially annoying in native, that is not
    // based on URL navigation, so we lose the current page on each error).
    //
    targetCmp.$replace = (
      Component,
      {
        target = options.target,
        anchor = options.anchor,
        preserveLocalState,
        conservative = false,
      }
    ) => {
      const restore = captureState(targetCmp)
      assignOptions(
        target || options.target,
        anchor,
        restore,
        preserveLocalState
      )

      const callbacks = cmp ? cmp.$$.on_hmr : []

      const afterCallbacks = callbacks.map(fn => fn(cmp)).filter(Boolean)

      const previous = cmp
      if (conservative) {
        try {
          const next = createComponent(Component, restore, previous)
          // prevents on_destroy from firing on non-final cmp instance
          cmp = null
          previous.$destroy()
          cmp = next
        } catch (err) {
          cmp = previous
          throw err
        }
      } else {
        // prevents on_destroy from firing on non-final cmp instance
        cmp = null
        if (previous) {
          // previous can be null if last constructor has crashed
          previous.$destroy()
        }
        cmp = createComponent(Component, restore, cmp)
      }

      cmp.$$.hmr_cmp = cmp

      for (const fn of afterCallbacks) {
        fn(cmp)
      }

      cmp.$$.on_hmr = callbacks

      return cmp
    }

    // NOTE onMount must provide target & anchor (for us to be able to determinate
    // 			actual DOM insertion point)
    //
    // 			And also, to support keyed list, it needs to be called each time the
    // 			component is moved (same as $$.fragment.m)
    if (onMount) {
      const m = targetCmp.$$.fragment.m
      targetCmp.$$.fragment.m = (...args) => {
        const result = m(...args)
        onMount(...args)
        return result
      }
    }

    // NOTE onDestroy must be called even if the call doesn't pass through the
    //      component's $destroy method (that we can hook onto by ourselves, since
    //      it's public API) -- this happens a lot in svelte's internals, that
    //      manipulates cmp.$$.fragment directly, often binding to fragment.d,
    //      for example
    if (onDestroy) {
      targetCmp.$$.on_destroy.push(() => {
        if (isCurrent(targetCmp)) {
          onDestroy()
        }
      })
    }

    if (onInstance) {
      onInstance(targetCmp)
    }

    // Svelte 3 creates and mount components from their constructor if
    // options.target is present.
    //
    // This means that at this point, the component's `fragment.c` and,
    // most notably, `fragment.m` will already have been called _from inside
    // createComponent_. That is: before we have a chance to hook on it.
    //
    // Proxy's constructor
    //   -> createComponent
    //     -> component constructor
    //       -> component.$$.fragment.c(...) (or l, if hydrate:true)
    //       -> component.$$.fragment.m(...)
    //
    //   -> you are here <-
    //
    if (onMount) {
      const { target, anchor } = options
      if (target) {
        onMount(target, anchor)
      }
    }
  }

  const parentComponent = allowLiveBinding
    ? svelte_internal__WEBPACK_IMPORTED_MODULE_0__.current_component
    : get_current_component_safe()

  cmp = new Component(options)
  cmp.$$.hmr_cmp = cmp

  instrument(cmp)

  return cmp
}


/***/ }),

/***/ "./src/App.svelte":
/*!************************!*\
  !*** ./src/App.svelte ***!
  \************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
/* harmony import */ var _lib_data_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib/data/data */ "./src/lib/data/data.ts");
/* harmony import */ var _lib_Cell_svelte__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./lib/Cell.svelte */ "./src/lib/Cell.svelte");
/* harmony import */ var _lib_grid_grid__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./lib/grid/grid */ "./src/lib/grid/grid.ts");
/* harmony import */ var _lib_store__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./lib/store */ "./src/lib/store.ts");
/* harmony import */ var _lib_system_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./lib/system/service */ "./src/lib/system/service.ts");
/* harmony import */ var _Users_emilovcina_Desktop_jvnode_svelte_node_modules_svelte_loader_lib_hot_api_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./node_modules/svelte-loader/lib/hot-api.js */ "./node_modules/svelte-loader/lib/hot-api.js");
/* harmony import */ var _Users_emilovcina_Desktop_jvnode_svelte_node_modules_svelte_hmr_runtime_proxy_adapter_dom_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./node_modules/svelte-hmr/runtime/proxy-adapter-dom.js */ "./node_modules/svelte-hmr/runtime/proxy-adapter-dom.js");
/* module decorator */ module = __webpack_require__.hmd(module);
/* src/App.svelte generated by Svelte v3.52.0 */









const file = "src/App.svelte";

function add_css(target) {
	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append_styles)(target, "svelte-rccm52", "main.svelte-rccm52{background-size:gs + 'px' gs + 'px';background-image:linear-gradient(to right, #bbb 1px, transparent 1px),\n\t\t\tlinear-gradient(to bottom, #bbb 1px, transparent 1px)}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwLnN2ZWx0ZSIsIm1hcHBpbmdzIjoiQUE4QkMsSUFBQSxjQUFBLENBQUEsQUFDQyxlQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFvQyxDQUNwQyxnQkFBQSxDQUFBLGdCQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsV0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO3dEQUNzRCxBQUN2RCxDQUFBIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIkFwcC5zdmVsdGUiXX0= */");
}

// (24:1) {#if $pgRoot.nodes.length > 1}
function create_if_block(ctx) {
	let cell;
	let current;

	cell = new _lib_Cell_svelte__WEBPACK_IMPORTED_MODULE_2__["default"]({
			props: {
				root: /*$pgRoot*/ ctx[0],
				services: /*visibleServices*/ ctx[2]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(cell.$$.fragment);
		},
		m: function mount(target, anchor) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(cell, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const cell_changes = {};
			if (dirty & /*$pgRoot*/ 1) cell_changes.root = /*$pgRoot*/ ctx[0];
			cell.$set(cell_changes);
		},
		i: function intro(local) {
			if (current) return;
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(cell.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(cell.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(cell, detaching);
		}
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(24:1) {#if $pgRoot.nodes.length > 1}",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let main;
	let current;
	let if_block = /*$pgRoot*/ ctx[0].nodes.length > 1 && create_if_block(ctx);

	const block = {
		c: function create() {
			main = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.element)("main");
			if (if_block) if_block.c();
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(main, "class", "w-full h-screen bg-white svelte-rccm52");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(main, "background-size", /*gs*/ ctx[1] + "px " + /*gs*/ ctx[1] + "px");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.add_location)(main, file, 22, 0, 740);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert_dev)(target, main, anchor);
			if (if_block) if_block.m(main, null);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (/*$pgRoot*/ ctx[0].nodes.length > 1) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*$pgRoot*/ 1) {
						(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1);
					}
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1);
					if_block.m(main, null);
				}
			} else if (if_block) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)();

				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block, 1, 1, () => {
					if_block = null;
				});

				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
			}
		},
		i: function intro(local) {
			if (current) return;
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block);
			current = true;
		},
		o: function outro(local) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach_dev)(main);
			if (if_block) if_block.d();
		}
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let $pgRoot;
	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.validate_store)(_lib_store__WEBPACK_IMPORTED_MODULE_4__.pgRoot, 'pgRoot');
	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.component_subscribe)($$self, _lib_store__WEBPACK_IMPORTED_MODULE_4__.pgRoot, $$value => $$invalidate(0, $pgRoot = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.validate_slots)('App', slots, []);
	const gs = _lib_grid_grid__WEBPACK_IMPORTED_MODULE_3__.gridOptions.gridSize;
	const visibleServices = [];

	const update = pgroot => {
		if (pgroot.nodes.length > 1) {
			pgroot.nodes.forEach(node => {
				if (node.type !== 'service') return;
				visibleServices.push((0,_lib_system_service__WEBPACK_IMPORTED_MODULE_5__.getServiceFromID)(node.id, _lib_data_data__WEBPACK_IMPORTED_MODULE_1__.services));
			});
		}

		(0,_lib_system_service__WEBPACK_IMPORTED_MODULE_5__.sizeServices)(visibleServices);
		(0,_lib_system_service__WEBPACK_IMPORTED_MODULE_5__.setServicePosition)(visibleServices, pgroot);
		(0,_lib_grid_grid__WEBPACK_IMPORTED_MODULE_3__.initGrid)();
	};

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({
		services: _lib_data_data__WEBPACK_IMPORTED_MODULE_1__.services,
		Cell: _lib_Cell_svelte__WEBPACK_IMPORTED_MODULE_2__["default"],
		gridOptions: _lib_grid_grid__WEBPACK_IMPORTED_MODULE_3__.gridOptions,
		initGrid: _lib_grid_grid__WEBPACK_IMPORTED_MODULE_3__.initGrid,
		pgRoot: _lib_store__WEBPACK_IMPORTED_MODULE_4__.pgRoot,
		getServiceFromID: _lib_system_service__WEBPACK_IMPORTED_MODULE_5__.getServiceFromID,
		setServicePosition: _lib_system_service__WEBPACK_IMPORTED_MODULE_5__.setServicePosition,
		sizeServices: _lib_system_service__WEBPACK_IMPORTED_MODULE_5__.sizeServices,
		gs,
		visibleServices,
		update,
		$pgRoot
	});

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$pgRoot*/ 1) {
			$: update($pgRoot);
		}
	};

	return [$pgRoot, gs, visibleServices];
}

class App extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponentDev {
	constructor(options) {
		super(options);
		(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, {}, add_css);

		(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterComponent", {
			component: this,
			tagName: "App",
			options,
			id: create_fragment.name
		});
	}
}

if (module && module.hot) {}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (App);



/***/ }),

/***/ "./src/lib/Cell.svelte":
/*!*****************************!*\
  !*** ./src/lib/Cell.svelte ***!
  \*****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
/* harmony import */ var svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! svelte */ "./node_modules/svelte/index.mjs");
/* harmony import */ var _grid_grid__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./grid/grid */ "./src/lib/grid/grid.ts");
/* harmony import */ var _grid_pathFinding__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./grid/pathFinding */ "./src/lib/grid/pathFinding.ts");
/* harmony import */ var _Service_svelte__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Service.svelte */ "./src/lib/Service.svelte");
/* harmony import */ var _system_cell__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./system/cell */ "./src/lib/system/cell.ts");
/* harmony import */ var _Users_emilovcina_Desktop_jvnode_svelte_node_modules_svelte_loader_lib_hot_api_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./node_modules/svelte-loader/lib/hot-api.js */ "./node_modules/svelte-loader/lib/hot-api.js");
/* harmony import */ var _Users_emilovcina_Desktop_jvnode_svelte_node_modules_svelte_hmr_runtime_proxy_adapter_dom_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./node_modules/svelte-hmr/runtime/proxy-adapter-dom.js */ "./node_modules/svelte-hmr/runtime/proxy-adapter-dom.js");
/* module decorator */ module = __webpack_require__.hmd(module);
/* src/lib/Cell.svelte generated by Svelte v3.52.0 */








const file = "src/lib/Cell.svelte";

function add_css(target) {
	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append_styles)(target, "svelte-15pu8mt", "svg.svelte-15pu8mt .servicecell.svelte-15pu8mt{stroke:orange;fill:rgba(255, 202, 103, 0.441)}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2VsbC5zdmVsdGUiLCJtYXBwaW5ncyI6IkFBNENDLGtCQUFBLENBQUEsWUFBQSxlQUFBLENBQUEsQUFDQyxNQUFBLENBQUEsTUFBYyxDQUNkLElBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBZ0MsQUFDakMsQ0FBQSIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJDZWxsLnN2ZWx0ZSJdfQ== */");
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[4] = list[i];
	return child_ctx;
}

// (24:0) {#if root.nodes.length > 1}
function create_if_block_1(ctx) {
	let svg;

	function select_block_type(ctx, dirty) {
		if (/*root*/ ctx[0].type === 'network') return create_if_block_2;
		return create_else_block;
	}

	let current_block_type = select_block_type(ctx, -1);
	let if_block = current_block_type(ctx);

	const block = {
		c: function create() {
			svg = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.svg_element)("svg");
			if_block.c();
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(svg, "class", "w-1 h-1 overflow-visible svelte-15pu8mt");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.add_location)(svg, file, 24, 1, 1013);
		},
		m: function mount(target, anchor) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert_dev)(target, svg, anchor);
			if_block.m(svg, null);
		},
		p: function update(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(svg, null);
				}
			}
		},
		d: function destroy(detaching) {
			if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach_dev)(svg);
			if_block.d();
		}
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_if_block_1.name,
		type: "if",
		source: "(24:0) {#if root.nodes.length > 1}",
		ctx
	});

	return block;
}

// (28:2) {:else}
function create_else_block(ctx) {
	let path;

	const block = {
		c: function create() {
			path = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.svg_element)("path");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(path, "d", /*d*/ ctx[2]);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(path, "stroke-width", "2px");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(path, "class", "servicecell svelte-15pu8mt");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.add_location)(path, file, 28, 3, 1180);
		},
		m: function mount(target, anchor) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert_dev)(target, path, anchor);
		},
		p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
		d: function destroy(detaching) {
			if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach_dev)(path);
		}
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_else_block.name,
		type: "else",
		source: "(28:2) {:else}",
		ctx
	});

	return block;
}

// (26:2) {#if root.type === 'network'}
function create_if_block_2(ctx) {
	let path;

	const block = {
		c: function create() {
			path = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.svg_element)("path");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(path, "d", /*d*/ ctx[2]);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(path, "fill", "none");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(path, "stroke", "black");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(path, "stroke-width", "1px");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(path, "stroke-dasharray", "4");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.add_location)(path, file, 26, 3, 1087);
		},
		m: function mount(target, anchor) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert_dev)(target, path, anchor);
		},
		p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
		d: function destroy(detaching) {
			if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach_dev)(path);
		}
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_if_block_2.name,
		type: "if",
		source: "(26:2) {#if root.type === 'network'}",
		ctx
	});

	return block;
}

// (35:1) {#if node.type === 'service'}
function create_if_block(ctx) {
	let servicenode;
	let current;

	function func(...args) {
		return /*func*/ ctx[3](/*node*/ ctx[4], ...args);
	}

	servicenode = new _Service_svelte__WEBPACK_IMPORTED_MODULE_4__["default"]({
			props: {
				node: /*node*/ ctx[4],
				service: /*services*/ ctx[1].find(func)
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(servicenode.$$.fragment);
		},
		m: function mount(target, anchor) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(servicenode, target, anchor);
			current = true;
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			const servicenode_changes = {};
			if (dirty & /*root*/ 1) servicenode_changes.node = /*node*/ ctx[4];
			if (dirty & /*services, root*/ 3) servicenode_changes.service = /*services*/ ctx[1].find(func);
			servicenode.$set(servicenode_changes);
		},
		i: function intro(local) {
			if (current) return;
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(servicenode.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(servicenode.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(servicenode, detaching);
		}
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(35:1) {#if node.type === 'service'}",
		ctx
	});

	return block;
}

// (34:0) {#each root.nodes as node}
function create_each_block(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*node*/ ctx[4].type === 'service' && create_if_block(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert_dev)(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (/*node*/ ctx[4].type === 'service') {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*root*/ 1) {
						(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1);
					}
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)();

				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block, 1, 1, () => {
					if_block = null;
				});

				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
			}
		},
		i: function intro(local) {
			if (current) return;
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block);
			current = true;
		},
		o: function outro(local) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach_dev)(if_block_anchor);
		}
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_each_block.name,
		type: "each",
		source: "(34:0) {#each root.nodes as node}",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let t;
	let each_1_anchor;
	let current;
	let if_block = /*root*/ ctx[0].nodes.length > 1 && create_if_block_1(ctx);
	let each_value = /*root*/ ctx[0].nodes;
	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.validate_each_argument)(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			t = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.space)();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert_dev)(target, t, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert_dev)(target, each_1_anchor, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (/*root*/ ctx[0].nodes.length > 1) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_1(ctx);
					if_block.c();
					if_block.m(t.parentNode, t);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*root, services*/ 3) {
				each_value = /*root*/ ctx[0].nodes;
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.validate_each_argument)(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i], 1);
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
			}
		},
		i: function intro(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i]);
			}

			current = true;
		},
		o: function outro(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(each_blocks[i]);
			}

			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach_dev)(t);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_each)(each_blocks, detaching);
			if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach_dev)(each_1_anchor);
		}
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.validate_slots)('Cell', slots, []);
	let { root } = $$props;
	let { services } = $$props;
	const d = (0,_system_cell__WEBPACK_IMPORTED_MODULE_5__.renderCell)(root);

	(0,svelte__WEBPACK_IMPORTED_MODULE_1__.onMount)(() => {
		const paths = (0,_system_cell__WEBPACK_IMPORTED_MODULE_5__.createPathBetweenServices)(services);

		paths.forEach(path => {
			const points = (0,_grid_pathFinding__WEBPACK_IMPORTED_MODULE_3__.findPathServiceShapeIntersection)(path.path, path.input, path.output);
			(0,_grid_pathFinding__WEBPACK_IMPORTED_MODULE_3__.drawPath)(path.path, 1, 0, 'black', false, false, true);
			const offs = _grid_grid__WEBPACK_IMPORTED_MODULE_2__.gridOptions.servicePadding * _grid_grid__WEBPACK_IMPORTED_MODULE_2__.gridOptions.gridSize;
			path.op.x = points[0][0] - path.output.x + offs;
			path.op.y = points[0][1] - path.output.y + offs;
			path.ip.x = points[1][0] - path.input.x + offs;
			path.ip.y = points[1][1] - path.input.y + offs;
		});
	});

	$$self.$$.on_mount.push(function () {
		if (root === undefined && !('root' in $$props || $$self.$$.bound[$$self.$$.props['root']])) {
			console.warn("<Cell> was created without expected prop 'root'");
		}

		if (services === undefined && !('services' in $$props || $$self.$$.bound[$$self.$$.props['services']])) {
			console.warn("<Cell> was created without expected prop 'services'");
		}
	});

	const writable_props = ['root', 'services'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Cell> was created with unknown prop '${key}'`);
	});

	const func = (node, t) => t.id === node.id;

	$$self.$$set = $$props => {
		if ('root' in $$props) $$invalidate(0, root = $$props.root);
		if ('services' in $$props) $$invalidate(1, services = $$props.services);
	};

	$$self.$capture_state = () => ({
		onMount: svelte__WEBPACK_IMPORTED_MODULE_1__.onMount,
		blank_object: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.blank_object,
		gridOptions: _grid_grid__WEBPACK_IMPORTED_MODULE_2__.gridOptions,
		drawPath: _grid_pathFinding__WEBPACK_IMPORTED_MODULE_3__.drawPath,
		findPathServiceShapeIntersection: _grid_pathFinding__WEBPACK_IMPORTED_MODULE_3__.findPathServiceShapeIntersection,
		ServiceNode: _Service_svelte__WEBPACK_IMPORTED_MODULE_4__["default"],
		createPathBetweenServices: _system_cell__WEBPACK_IMPORTED_MODULE_5__.createPathBetweenServices,
		renderCell: _system_cell__WEBPACK_IMPORTED_MODULE_5__.renderCell,
		root,
		services,
		d
	});

	$$self.$inject_state = $$props => {
		if ('root' in $$props) $$invalidate(0, root = $$props.root);
		if ('services' in $$props) $$invalidate(1, services = $$props.services);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [root, services, d, func];
}

class Cell extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponentDev {
	constructor(options) {
		super(options);
		(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, { root: 0, services: 1 }, add_css);

		(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterComponent", {
			component: this,
			tagName: "Cell",
			options,
			id: create_fragment.name
		});
	}

	get root() {
		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set root(value) {
		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get services() {
		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set services(value) {
		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

if (module && module.hot) {}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Cell);



/***/ }),

/***/ "./src/lib/Port.svelte":
/*!*****************************!*\
  !*** ./src/lib/Port.svelte ***!
  \*****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
/* harmony import */ var svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! svelte */ "./node_modules/svelte/index.mjs");
/* harmony import */ var _Users_emilovcina_Desktop_jvnode_svelte_node_modules_svelte_loader_lib_hot_api_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./node_modules/svelte-loader/lib/hot-api.js */ "./node_modules/svelte-loader/lib/hot-api.js");
/* harmony import */ var _Users_emilovcina_Desktop_jvnode_svelte_node_modules_svelte_hmr_runtime_proxy_adapter_dom_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/svelte-hmr/runtime/proxy-adapter-dom.js */ "./node_modules/svelte-hmr/runtime/proxy-adapter-dom.js");
/* module decorator */ module = __webpack_require__.hmd(module);
/* src/lib/Port.svelte generated by Svelte v3.52.0 */



const file = "src/lib/Port.svelte";

// (1:0) <script lang="ts">import { tick }
function create_catch_block(ctx) {
	const block = { c: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop, m: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop, p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop, d: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop };

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_catch_block.name,
		type: "catch",
		source: "(1:0) <script lang=\\\"ts\\\">import { tick }",
		ctx
	});

	return block;
}

// (10:36)   {#if p.x}
function create_then_block(ctx) {
	let if_block_anchor;
	let if_block = /*p*/ ctx[3].x && create_if_block(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert_dev)(target, if_block_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (/*p*/ ctx[3].x) if_block.p(ctx, dirty);
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach_dev)(if_block_anchor);
		}
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_then_block.name,
		type: "then",
		source: "(10:36)   {#if p.x}",
		ctx
	});

	return block;
}

// (11:1) {#if p.x}
function create_if_block(ctx) {
	let circle;
	let circle_cx_value;
	let circle_cy_value;
	let circle_r_value;
	let circle_class_value;

	const block = {
		c: function create() {
			circle = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.svg_element)("circle");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(circle, "cx", circle_cx_value = /*p*/ ctx[3].x);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(circle, "cy", circle_cy_value = /*p*/ ctx[3].y);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(circle, "r", circle_r_value = 10);

			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(circle, "class", circle_class_value = '' + (/*isOutputPort*/ ctx[0]
			? 'fill-outputPort'
			: 'fill-inputPort'));

			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.add_location)(circle, file, 11, 2, 255);
		},
		m: function mount(target, anchor) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert_dev)(target, circle, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*isOutputPort*/ 1 && circle_class_value !== (circle_class_value = '' + (/*isOutputPort*/ ctx[0]
			? 'fill-outputPort'
			: 'fill-inputPort'))) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(circle, "class", circle_class_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach_dev)(circle);
		}
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(11:1) {#if p.x}",
		ctx
	});

	return block;
}

// (1:0) <script lang="ts">import { tick }
function create_pending_block(ctx) {
	const block = { c: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop, m: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop, p: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop, d: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop };

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_pending_block.name,
		type: "pending",
		source: "(1:0) <script lang=\\\"ts\\\">import { tick }",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let await_block_anchor;
	let promise;

	let info = {
		ctx,
		current: null,
		token: null,
		hasCatch: false,
		pending: create_pending_block,
		then: create_then_block,
		catch: create_catch_block,
		value: 3
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.handle_promise)(promise = /*populatePortCoords*/ ctx[1](), info);

	const block = {
		c: function create() {
			await_block_anchor = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
			info.block.c();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert_dev)(target, await_block_anchor, anchor);
			info.block.m(target, info.anchor = anchor);
			info.mount = () => await_block_anchor.parentNode;
			info.anchor = await_block_anchor;
		},
		p: function update(new_ctx, [dirty]) {
			ctx = new_ctx;
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.update_await_block_branch)(info, ctx, dirty);
		},
		i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
		o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__.noop,
		d: function destroy(detaching) {
			if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach_dev)(await_block_anchor);
			info.block.d(detaching);
			info.token = null;
			info = null;
		}
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.validate_slots)('Port', slots, []);
	let { port } = $$props;
	let { isOutputPort } = $$props;

	const populatePortCoords = async () => {
		await (0,svelte__WEBPACK_IMPORTED_MODULE_1__.tick)();
		return port;
	};

	$$self.$$.on_mount.push(function () {
		if (port === undefined && !('port' in $$props || $$self.$$.bound[$$self.$$.props['port']])) {
			console.warn("<Port> was created without expected prop 'port'");
		}

		if (isOutputPort === undefined && !('isOutputPort' in $$props || $$self.$$.bound[$$self.$$.props['isOutputPort']])) {
			console.warn("<Port> was created without expected prop 'isOutputPort'");
		}
	});

	const writable_props = ['port', 'isOutputPort'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Port> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ('port' in $$props) $$invalidate(2, port = $$props.port);
		if ('isOutputPort' in $$props) $$invalidate(0, isOutputPort = $$props.isOutputPort);
	};

	$$self.$capture_state = () => ({
		tick: svelte__WEBPACK_IMPORTED_MODULE_1__.tick,
		port,
		isOutputPort,
		populatePortCoords
	});

	$$self.$inject_state = $$props => {
		if ('port' in $$props) $$invalidate(2, port = $$props.port);
		if ('isOutputPort' in $$props) $$invalidate(0, isOutputPort = $$props.isOutputPort);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [isOutputPort, populatePortCoords, port];
}

class Port extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponentDev {
	constructor(options) {
		super(options);
		(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, { port: 2, isOutputPort: 0 });

		(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterComponent", {
			component: this,
			tagName: "Port",
			options,
			id: create_fragment.name
		});
	}

	get port() {
		throw new Error("<Port>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set port(value) {
		throw new Error("<Port>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isOutputPort() {
		throw new Error("<Port>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isOutputPort(value) {
		throw new Error("<Port>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

if (module && module.hot) {}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Port);



/***/ }),

/***/ "./src/lib/Service.svelte":
/*!********************************!*\
  !*** ./src/lib/Service.svelte ***!
  \********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
/* harmony import */ var _Port_svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Port.svelte */ "./src/lib/Port.svelte");
/* harmony import */ var _grid_grid__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./grid/grid */ "./src/lib/grid/grid.ts");
/* harmony import */ var _system_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./system/service */ "./src/lib/system/service.ts");
/* harmony import */ var _Users_emilovcina_Desktop_jvnode_svelte_node_modules_svelte_loader_lib_hot_api_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./node_modules/svelte-loader/lib/hot-api.js */ "./node_modules/svelte-loader/lib/hot-api.js");
/* harmony import */ var _Users_emilovcina_Desktop_jvnode_svelte_node_modules_svelte_hmr_runtime_proxy_adapter_dom_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./node_modules/svelte-hmr/runtime/proxy-adapter-dom.js */ "./node_modules/svelte-hmr/runtime/proxy-adapter-dom.js");
/* module decorator */ module = __webpack_require__.hmd(module);
/* src/lib/Service.svelte generated by Svelte v3.52.0 */





const file = "src/lib/Service.svelte";

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[4] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[7] = list[i];
	return child_ctx;
}

// (25:1) {#if service.outputPorts}
function create_if_block_1(ctx) {
	let each_1_anchor;
	let current;
	let each_value_1 = /*service*/ ctx[1].outputPorts;
	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.validate_each_argument)(each_value_1);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	const out = i => (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	const block = {
		c: function create() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
		},
		m: function mount(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert_dev)(target, each_1_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (dirty & /*service*/ 2) {
				each_value_1 = /*service*/ ctx[1].outputPorts;
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.validate_each_argument)(each_value_1);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i], 1);
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)();

				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
			}
		},
		i: function intro(local) {
			if (current) return;

			for (let i = 0; i < each_value_1.length; i += 1) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i]);
			}

			current = true;
		},
		o: function outro(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(each_blocks[i]);
			}

			current = false;
		},
		d: function destroy(detaching) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_each)(each_blocks, detaching);
			if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach_dev)(each_1_anchor);
		}
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_if_block_1.name,
		type: "if",
		source: "(25:1) {#if service.outputPorts}",
		ctx
	});

	return block;
}

// (26:2) {#each service.outputPorts as op}
function create_each_block_1(ctx) {
	let port;
	let current;

	port = new _Port_svelte__WEBPACK_IMPORTED_MODULE_1__["default"]({
			props: { port: /*op*/ ctx[7], isOutputPort: true },
			$$inline: true
		});

	const block = {
		c: function create() {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(port.$$.fragment);
		},
		m: function mount(target, anchor) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(port, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const port_changes = {};
			if (dirty & /*service*/ 2) port_changes.port = /*op*/ ctx[7];
			port.$set(port_changes);
		},
		i: function intro(local) {
			if (current) return;
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(port.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(port.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(port, detaching);
		}
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_each_block_1.name,
		type: "each",
		source: "(26:2) {#each service.outputPorts as op}",
		ctx
	});

	return block;
}

// (30:1) {#if service.inputPorts}
function create_if_block(ctx) {
	let each_1_anchor;
	let current;
	let each_value = /*service*/ ctx[1].inputPorts;
	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.validate_each_argument)(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	const block = {
		c: function create() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
		},
		m: function mount(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert_dev)(target, each_1_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (dirty & /*service*/ 2) {
				each_value = /*service*/ ctx[1].inputPorts;
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.validate_each_argument)(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i], 1);
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
			}
		},
		i: function intro(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(each_blocks[i]);
			}

			current = true;
		},
		o: function outro(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(each_blocks[i]);
			}

			current = false;
		},
		d: function destroy(detaching) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_each)(each_blocks, detaching);
			if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach_dev)(each_1_anchor);
		}
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(30:1) {#if service.inputPorts}",
		ctx
	});

	return block;
}

// (31:2) {#each service.inputPorts as ip}
function create_each_block(ctx) {
	let port;
	let current;

	port = new _Port_svelte__WEBPACK_IMPORTED_MODULE_1__["default"]({
			props: { port: /*ip*/ ctx[4], isOutputPort: false },
			$$inline: true
		});

	const block = {
		c: function create() {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.create_component)(port.$$.fragment);
		},
		m: function mount(target, anchor) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.mount_component)(port, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const port_changes = {};
			if (dirty & /*service*/ 2) port_changes.port = /*ip*/ ctx[4];
			port.$set(port_changes);
		},
		i: function intro(local) {
			if (current) return;
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(port.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(port.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.destroy_component)(port, detaching);
		}
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_each_block.name,
		type: "each",
		source: "(31:2) {#each service.inputPorts as ip}",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let svg;
	let path;
	let text_1;
	let t_value = /*service*/ ctx[1].name + "";
	let t;
	let text_1_x_value;
	let text_1_y_value;
	let if_block0_anchor;
	let svg_id_value;
	let current;
	let if_block0 = /*service*/ ctx[1].outputPorts && create_if_block_1(ctx);
	let if_block1 = /*service*/ ctx[1].inputPorts && create_if_block(ctx);

	const block = {
		c: function create() {
			svg = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.svg_element)("svg");
			path = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.svg_element)("path");
			text_1 = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.svg_element)("text");
			t = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.text)(t_value);
			if (if_block0) if_block0.c();
			if_block0_anchor = (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.empty)();
			if (if_block1) if_block1.c();
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(path, "d", /*drawString*/ ctx[2]);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(path, "class", "hover:cursor-pointer fill-service");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.add_location)(path, file, 15, 1, 515);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(text_1, "text-anchor", "middle");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(text_1, "stroke", "#000");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(text_1, "class", "absolute hover:cursor-pointer select-none font-light");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(text_1, "font-size", "1.4rem");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(text_1, "x", text_1_x_value = /*service*/ ctx[1].width + /*padding*/ ctx[3]);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(text_1, "y", text_1_y_value = /*service*/ ctx[1].height / 2 + /*padding*/ ctx[3] + 6);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.add_location)(text_1, file, 16, 1, 582);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(svg, "id", svg_id_value = "" + (/*node*/ ctx[0].name + /*node*/ ctx[0].id));
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(svg, "class", "absolute z-10");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(svg, "height", /*service*/ ctx[1].height + /*padding*/ ctx[3] * 2 + "px");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(svg, "top", /*service*/ ctx[1].y - /*padding*/ ctx[3] + "px");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(svg, "width", /*service*/ ctx[1].width * 2 + /*padding*/ ctx[3] * 2 + "px");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(svg, "left", /*service*/ ctx[1].x - /*padding*/ ctx[3] + "px");
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.add_location)(svg, file, 9, 0, 299);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.insert_dev)(target, svg, anchor);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append_dev)(svg, path);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append_dev)(svg, text_1);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append_dev)(text_1, t);
			if (if_block0) if_block0.m(svg, null);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.append_dev)(svg, if_block0_anchor);
			if (if_block1) if_block1.m(svg, null);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if ((!current || dirty & /*service*/ 2) && t_value !== (t_value = /*service*/ ctx[1].name + "")) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_data_dev)(t, t_value);

			if (!current || dirty & /*service*/ 2 && text_1_x_value !== (text_1_x_value = /*service*/ ctx[1].width + /*padding*/ ctx[3])) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(text_1, "x", text_1_x_value);
			}

			if (!current || dirty & /*service*/ 2 && text_1_y_value !== (text_1_y_value = /*service*/ ctx[1].height / 2 + /*padding*/ ctx[3] + 6)) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(text_1, "y", text_1_y_value);
			}

			if (/*service*/ ctx[1].outputPorts) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty & /*service*/ 2) {
						(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_1(ctx);
					if_block0.c();
					(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block0, 1);
					if_block0.m(svg, if_block0_anchor);
				}
			} else if (if_block0) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)();

				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
			}

			if (/*service*/ ctx[1].inputPorts) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*service*/ 2) {
						(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block(ctx);
					if_block1.c();
					(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block1, 1);
					if_block1.m(svg, null);
				}
			} else if (if_block1) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.group_outros)();

				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.check_outros)();
			}

			if (!current || dirty & /*node*/ 1 && svg_id_value !== (svg_id_value = "" + (/*node*/ ctx[0].name + /*node*/ ctx[0].id))) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.attr_dev)(svg, "id", svg_id_value);
			}

			if (!current || dirty & /*service*/ 2) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(svg, "height", /*service*/ ctx[1].height + /*padding*/ ctx[3] * 2 + "px");
			}

			if (!current || dirty & /*service*/ 2) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(svg, "top", /*service*/ ctx[1].y - /*padding*/ ctx[3] + "px");
			}

			if (!current || dirty & /*service*/ 2) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(svg, "width", /*service*/ ctx[1].width * 2 + /*padding*/ ctx[3] * 2 + "px");
			}

			if (!current || dirty & /*service*/ 2) {
				(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.set_style)(svg, "left", /*service*/ ctx[1].x - /*padding*/ ctx[3] + "px");
			}
		},
		i: function intro(local) {
			if (current) return;
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block0);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_in)(if_block1);
			current = true;
		},
		o: function outro(local) {
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block0);
			(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.transition_out)(if_block1);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) (0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.detach_dev)(svg);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};

	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.validate_slots)('Service', slots, []);
	let { node } = $$props;
	let { service } = $$props;
	const drawString = (0,_system_service__WEBPACK_IMPORTED_MODULE_3__.drawService)(service);
	const padding = _grid_grid__WEBPACK_IMPORTED_MODULE_2__.gridOptions.servicePadding * _grid_grid__WEBPACK_IMPORTED_MODULE_2__.gridOptions.gridSize;

	$$self.$$.on_mount.push(function () {
		if (node === undefined && !('node' in $$props || $$self.$$.bound[$$self.$$.props['node']])) {
			console.warn("<Service> was created without expected prop 'node'");
		}

		if (service === undefined && !('service' in $$props || $$self.$$.bound[$$self.$$.props['service']])) {
			console.warn("<Service> was created without expected prop 'service'");
		}
	});

	const writable_props = ['node', 'service'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Service> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ('node' in $$props) $$invalidate(0, node = $$props.node);
		if ('service' in $$props) $$invalidate(1, service = $$props.service);
	};

	$$self.$capture_state = () => ({
		Port: _Port_svelte__WEBPACK_IMPORTED_MODULE_1__["default"],
		gridOptions: _grid_grid__WEBPACK_IMPORTED_MODULE_2__.gridOptions,
		drawService: _system_service__WEBPACK_IMPORTED_MODULE_3__.drawService,
		node,
		service,
		drawString,
		padding
	});

	$$self.$inject_state = $$props => {
		if ('node' in $$props) $$invalidate(0, node = $$props.node);
		if ('service' in $$props) $$invalidate(1, service = $$props.service);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [node, service, drawString, padding];
}

class Service extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__.SvelteComponentDev {
	constructor(options) {
		super(options);
		(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.init)(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal, { node: 0, service: 1 });

		(0,svelte_internal__WEBPACK_IMPORTED_MODULE_0__.dispatch_dev)("SvelteRegisterComponent", {
			component: this,
			tagName: "Service",
			options,
			id: create_fragment.name
		});
	}

	get node() {
		throw new Error("<Service>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set node(value) {
		throw new Error("<Service>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get service() {
		throw new Error("<Service>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set service(value) {
		throw new Error("<Service>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

if (module && module.hot) {}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Service);



/***/ }),

/***/ "./node_modules/svelte-loader/lib/hot-api.js":
/*!***************************************************!*\
  !*** ./node_modules/svelte-loader/lib/hot-api.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "applyHmr": () => (/* binding */ applyHmr)
/* harmony export */ });
/* harmony import */ var svelte_hmr_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte-hmr/runtime */ "./node_modules/svelte-hmr/runtime/index.js");


// eslint-disable-next-line no-undef
const g = typeof window !== 'undefined' ? window : __webpack_require__.g;

const globalKey =
	typeof Symbol !== 'undefined'
		? Symbol('SVELTE_LOADER_HOT')
		: '__SVELTE_LOADER_HOT';

if (!g[globalKey]) {
	// do updating refs counting to know when a full update has been applied
	let updatingCount = 0;

	const notifyStart = () => {
		updatingCount++;
	};

	const notifyError = reload => err => {
		const errString = (err && err.stack) || err;
		// eslint-disable-next-line no-console
		console.error(
			'[HMR] Failed to accept update (nollup compat mode)',
			errString
		);
		reload();
		notifyEnd();
	};

	const notifyEnd = () => {
		updatingCount--;
		if (updatingCount === 0) {
			// NOTE this message is important for timing in tests
			// eslint-disable-next-line no-console
			console.log('[HMR:Svelte] Up to date');
		}
	};

	g[globalKey] = {
		hotStates: {},
		notifyStart,
		notifyError,
		notifyEnd,
	};
}

const runAcceptHandlers = acceptHandlers => {
	const queue = [...acceptHandlers];
	const next = () => {
		const cur = queue.shift();
		if (cur) {
			return cur(null).then(next);
		} else {
			return Promise.resolve(null);
		}
	};
	return next();
};

const applyHmr = (0,svelte_hmr_runtime__WEBPACK_IMPORTED_MODULE_0__.makeApplyHmr)(args => {
	const { notifyStart, notifyError, notifyEnd } = g[globalKey];
	const { m, reload } = args;

	let acceptHandlers = (m.hot.data && m.hot.data.acceptHandlers) || [];
	let nextAcceptHandlers = [];

	m.hot.dispose(data => {
		data.acceptHandlers = nextAcceptHandlers;
	});

	const dispose = (...args) => m.hot.dispose(...args);

	const accept = handler => {
		if (nextAcceptHandlers.length === 0) {
			m.hot.accept();
		}
		nextAcceptHandlers.push(handler);
	};

	const check = status => {
		if (status === 'ready') {
			notifyStart();
		} else if (status === 'idle') {
			runAcceptHandlers(acceptHandlers)
				.then(notifyEnd)
				.catch(notifyError(reload));
		}
	};

	m.hot.addStatusHandler(check);

	m.hot.dispose(() => {
		m.hot.removeStatusHandler(check);
	});

	const hot = {
		data: m.hot.data,
		dispose,
		accept,
	};

	return { ...args, hot };
});


/***/ }),

/***/ "./src/lib/data/data.ts":
/*!******************************!*\
  !*** ./src/lib/data/data.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "interfaces": () => (/* binding */ interfaces),
/* harmony export */   "name": () => (/* binding */ name),
/* harmony export */   "placegraph": () => (/* binding */ placegraph),
/* harmony export */   "services": () => (/* binding */ services),
/* harmony export */   "types": () => (/* binding */ types)
/* harmony export */ });
/* harmony import */ var _preprocess__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./preprocess */ "./src/lib/data/preprocess.ts");

// const json: Data = JSON.parse(data);
const json = JSON.parse(`{"name":"jolieexample","interfaces":[{"name":"FaxInterface","reqres":[{"name":"fax","res":"void","req":"FaxRequest"}]},{"name":"PrinterInterface","reqres":[{"name":"print","res":"PrintResponse","req":"PrintRequest"}],"oneway":[{"name":"del","req":"JobID"}]},{"name":"AggregatorInterface","reqres":[{"name":"faxAndPrint","res":"void","req":"FaxAndPrintRequest"}]}],"types":[{"name":"PrintRequest","subTypes":[{"name":"content","type":"string"}]},{"name":"PrintResponse","type":"JobID"},{"name":"FaxAndPrintRequest","subTypes":[{"name":"print","type":"PrintRequest"},{"name":"fax","type":"FaxRequest"}]},{"name":"FaxRequest","subTypes":[{"name":"destination","type":"string"},{"name":"content","type":"string"}]},{"name":"JobID","subTypes":[{"name":"jobId","type":"string"}]}],"placegraph":[{"nodes":[{"type":"site","id":0},{"name":"Aggregator","nodes":[{"type":"site","id":1},{"name":"Console","nodes":[{"type":"site","id":2}],"id":1,"type":"service"},{"name":"Fax","nodes":[{"type":"site","id":3},{"name":"Console","nodes":[{"type":"site","id":4}],"id":2,"type":"service"}],"id":5,"type":"service"},{"name":"Printer","nodes":[{"type":"site","id":5},{"name":"Console","nodes":[{"type":"site","id":6}],"id":4,"type":"service"}],"id":0,"type":"service"}],"id":3,"type":"service"},{"name":"Client","nodes":[{"type":"site","id":7},{"name":"Console","nodes":[{"type":"site","id":8}],"id":6,"type":"service"}],"id":7,"type":"service"}],"id":0,"type":"network"}],"services":[{"embeddings":[{"name":"Console","type":"jolie","port":"Console"}],"execution":"concurrent","outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface"}],"location":"local"}],"name":"Printer","inputPorts":[{"name":"PrinterInput","protocol":"sodep","interfaces":[{"name":"PrinterInterface"}],"location":"socket:\/\/localhost:9000"}],"id":0},{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface"}],"location":"local"}],"id":1},{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface"}],"location":"local"}],"id":2},{"embeddings":[{"name":"Console","type":"jolie","port":"Console"},{"name":"Fax","type":"jolie","port":"Fax"},{"name":"Printer","type":"jolie","port":"printer"}],"execution":"concurrent","outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface"}],"location":"local"},{"name":"printer","protocol":"sodep","interfaces":[{"name":"PrinterInterface"}],"location":"socket:\/\/localhost:9000"},{"name":"Fax","protocol":"sodep","interfaces":[{"name":"FaxInterface"}],"location":"socket:\/\/localhost:9001"}],"name":"Aggregator","inputPorts":[{"name":"Aggregator","protocol":"sodep","interfaces":[{"name":"AggregatorInterface"}],"location":"socket:\/\/localhost:9002","aggregates":[{"name":"printer"},{"name":"Fax"}]}],"id":3},{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface"}],"location":"local"}],"id":4},{"embeddings":[{"name":"Console","type":"jolie","port":"Console"}],"execution":"concurrent","outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface"}],"location":"local"}],"name":"Fax","inputPorts":[{"name":"FaxInput","protocol":"sodep","interfaces":[{"name":"FaxInterface"}],"location":"socket:\/\/localhost:9001"}],"id":5},{"name":"Console","execution":"single","inputPorts":[{"name":"ConsoleInput","protocol":"sodep","interfaces":[{"name":"ConsoleIface"}],"location":"local"}],"id":6},{"embeddings":[{"name":"Console","type":"jolie","port":"Console"}],"name":"Client","execution":"single","id":7,"outputPorts":[{"name":"Console","protocol":"sodep","interfaces":[{"name":"ConsoleIface"}],"location":"local"},{"name":"Aggregator","protocol":"sodep","interfaces":[{"name":"AggregatorInterface"},{"name":"PrinterInterface"},{"name":"FaxInterface"}],"location":"socket:\/\/localhost:9002"}]}]}`);
//pre-processing here
const processedData = (0,_preprocess__WEBPACK_IMPORTED_MODULE_0__.preprocess)(json);
const services = processedData.services;
const interfaces = processedData.interfaces;
const types = processedData.types;
const placegraph = processedData.placegraph;
const name = processedData.name;


/***/ }),

/***/ "./src/lib/data/preprocess.ts":
/*!************************************!*\
  !*** ./src/lib/data/preprocess.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "preprocess": () => (/* binding */ preprocess)
/* harmony export */ });
let p_services;
let p_interfaces;
let p_types;
const preprocess = (json) => {
    var _a;
    p_services = json.services;
    p_interfaces = json.interfaces;
    p_types = json.types;
    p_services.forEach((service) => {
        if (service.embeddings) {
            connectEmbeds(service);
            connectEmbedOutputPorts(service);
        }
        if (service.outputPorts) {
            connectRedirectResources(service.outputPorts);
            joinOutputPortArrows(service);
        }
    });
    return {
        name: (_a = json.name) !== null && _a !== void 0 ? _a : undefined,
        placegraph: json.placegraph,
        services: p_services,
        interfaces: p_interfaces,
        types: p_types
    };
};
const joinOutputPortArrows = (service) => {
    var _a;
    const list = [];
    (_a = service.outputPorts) === null || _a === void 0 ? void 0 : _a.forEach((p) => {
        var _a;
        const otherPorts = (_a = service.outputPorts) === null || _a === void 0 ? void 0 : _a.filter((p2) => p.name !== p2.name && p.location === p2.location);
        if (!otherPorts || (otherPorts === null || otherPorts === void 0 ? void 0 : otherPorts.length) === 0)
            return;
        otherPorts.forEach((op) => list.push(op));
    });
    list.splice(0, 1);
    if (list.length == 0)
        return;
    list.forEach((p) => {
        p.cost = false;
    });
};
const connectRedirectResources = (outputPorts) => {
    if (outputPorts.find((p) => p.location.includes('/!/')) === undefined)
        return;
    outputPorts.forEach((p) => {
        if (!p.location.includes('/!/'))
            return;
        const url = p.location.split('/!/');
        p.location = url[0];
        p.resource = url[1];
    });
};
const connectEmbedOutputPorts = (service) => {
    var _a;
    let newListOfOPs = service.outputPorts;
    let embeds = [];
    (_a = service.embeddings) === null || _a === void 0 ? void 0 : _a.forEach((embed) => {
        var _a;
        newListOfOPs = newListOfOPs.filter((t) => t.name !== embed.port);
        const corrOutputPort = (_a = service.outputPorts) === null || _a === void 0 ? void 0 : _a.find((t) => embed.port === t.name);
        if (corrOutputPort === undefined)
            return;
        embeds.push(corrOutputPort);
    });
    service.outputPorts = embeds.concat(newListOfOPs);
};
const connectEmbeds = (service) => {
    if (service.embeddings === undefined)
        return;
    service.embeddings.forEach((embed) => {
        var _a, _b;
        const corrOutputPort = (_a = service.outputPorts) === null || _a === void 0 ? void 0 : _a.find((t) => embed.port === t.name);
        if (corrOutputPort === undefined)
            return;
        const embeddedService = p_services.find((s) => s.name === embed.name);
        if (embeddedService === undefined)
            return;
        const corrInputPort = (_b = embeddedService.inputPorts) === null || _b === void 0 ? void 0 : _b.find((t) => t.location === 'local' ||
            (t.location == corrOutputPort.location && sharesInterface(t, corrOutputPort)));
        if (corrInputPort === undefined)
            return;
        corrOutputPort.location = `!local_${embed.name}`;
        corrInputPort.location = `!local_${embed.name}`;
        embeddedService.embeddingType = embed.type;
    });
};
const sharesInterface = (p1, p2) => {
    if (p1.interfaces === undefined && p2.interfaces === undefined)
        return true;
    const listP1 = p1.interfaces.flatMap((t) => t.name);
    const listP2 = p2.interfaces.flatMap((t) => t.name);
    for (let i = 0; i < listP1.length; i++)
        for (let j = 0; j < listP2.length; j++)
            if (listP1[i] === listP2[j])
                return true;
    return false;
};


/***/ }),

/***/ "./src/lib/grid/grid.ts":
/*!******************************!*\
  !*** ./src/lib/grid/grid.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Point": () => (/* binding */ Point),
/* harmony export */   "getGridBox": () => (/* binding */ getGridBox),
/* harmony export */   "getGridCoord": () => (/* binding */ getGridCoord),
/* harmony export */   "grid": () => (/* binding */ grid),
/* harmony export */   "gridOptions": () => (/* binding */ gridOptions),
/* harmony export */   "initGrid": () => (/* binding */ initGrid),
/* harmony export */   "setGridSize": () => (/* binding */ setGridSize),
/* harmony export */   "setGridWall": () => (/* binding */ setGridWall)
/* harmony export */ });
const gridOptions = {
    gridSize: 14,
    gridWidth: 0,
    gridHeight: 0,
    minGridSize: 6,
    maxGridSize: 18,
    gridOffsetX: 5,
    gridOffsetY: 5,
    leftMargin: 5,
    topMargin: 5,
    leftOffset: 0,
    topOffset: 0,
    servicePadding: 2,
    cellPadding: 5
};
class Point {
    constructor(x, y) {
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.closed = false;
        this.visited = false;
        this.isWall = false;
        this.cost = 0;
        this.x = x;
        this.y = y;
        this.parent = null;
    }
}
let grid;
const initGrid = () => {
    grid = {};
    for (let x = -(gridOptions.gridOffsetX * gridOptions.gridSize); x <= gridOptions.gridWidth + gridOptions.gridSize * gridOptions.gridOffsetX; x += gridOptions.gridSize)
        for (let y = -(gridOptions.gridOffsetY * gridOptions.gridSize); y <= gridOptions.gridHeight + gridOptions.gridSize * gridOptions.gridOffsetY; y += gridOptions.gridSize)
            grid[`${[x, y]}`] = new Point(x, y);
};
const setGridSize = (width, height) => {
    const w = width + (gridOptions.leftMargin / 4) * gridOptions.gridSize;
    const h = height + (gridOptions.topMargin / 4) * gridOptions.gridSize;
    gridOptions.gridWidth = w;
    gridOptions.gridHeight = h;
};
const getGridCoord = (x, y) => {
    return grid[`${[x, y]}`];
};
const setGridWall = (x, y, bool = true) => {
    grid[`${[x, y]}`].isWall = bool;
};
const getGridBox = (services) => {
    let w = Number.NEGATIVE_INFINITY;
    let h = Number.NEGATIVE_INFINITY;
    services.forEach((svc) => {
        const height = svc.height;
        w = svc.x + gridOptions.gridSize * 18 > w ? svc.x + gridOptions.gridSize * 18 : w;
        h = svc.y + height > h ? svc.y + height : h;
    });
    return { w, h };
};


/***/ }),

/***/ "./src/lib/grid/pathFinding.ts":
/*!*************************************!*\
  !*** ./src/lib/grid/pathFinding.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "aStarSearch": () => (/* binding */ aStarSearch),
/* harmony export */   "drawPath": () => (/* binding */ drawPath),
/* harmony export */   "findFirstIntersectionBetweenPaths": () => (/* binding */ findFirstIntersectionBetweenPaths),
/* harmony export */   "findPathServiceShapeIntersection": () => (/* binding */ findPathServiceShapeIntersection),
/* harmony export */   "makeCoordArray": () => (/* binding */ makeCoordArray),
/* harmony export */   "resetAStarGrid": () => (/* binding */ resetAStarGrid)
/* harmony export */ });
/* harmony import */ var _system_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../system/service */ "./src/lib/system/service.ts");
/* harmony import */ var _grid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./grid */ "./src/lib/grid/grid.ts");


class PQElement {
    constructor(element, priority) {
        this.element = element;
        this.priority = priority;
    }
}
class PriorityQueue {
    constructor() {
        this.items = [];
    }
    enqueue(item, priority) {
        const qElement = new PQElement(item, priority);
        let contain = false;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > qElement.priority) {
                this.items.splice(i, 0, qElement);
                contain = true;
                break;
            }
        }
        if (!contain)
            this.items.push(qElement);
    }
    dequeue() {
        if (this.isEmpty())
            return undefined;
        const resE = this.items.shift();
        return resE === null || resE === void 0 ? void 0 : resE.element;
    }
    isEmpty() {
        return this.items.length == 0;
    }
    front() {
        if (this.isEmpty())
            return undefined;
        return this.items[0];
    }
    remove(item) {
        this.items = this.items.filter((i) => i.element != item);
    }
    rescore(item, priority) {
        this.remove(item);
        this.enqueue(item, priority);
    }
}
const manhattenHeuristic = (src, dest) => {
    return Math.abs(src.x - dest.x) + Math.abs(src.y - dest.y);
};
const diagonalHeuristic = (src, dest) => {
    //Octile distance:
    const D = 1;
    const D2 = Math.sqrt(2);
    const dx = Math.abs(src.x - dest.x);
    const dy = Math.abs(src.y - dest.y);
    return D * Math.max(dx, dy) + (D2 - D) * Math.min(dx, dy);
};
const euclidianHeuristic = (src, dest) => {
    return (Math.sqrt(Math.pow(src.x, 2) - Math.pow(dest.x, 2)) +
        Math.sqrt(Math.pow(src.y, 2) - Math.pow(dest.y, 2)));
};
const makeCoordArray = (listOfPoints) => {
    let res = [];
    listOfPoints.forEach((p) => {
        res.push([p.x, p.y]);
    });
    return res;
};
const getNeightbours = (node) => {
    const neighbours = [];
    const gridSize = _grid__WEBPACK_IMPORTED_MODULE_1__.gridOptions.gridSize;
    if ((0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x, node.y - gridSize) && !(0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x, node.y - gridSize).isWall)
        neighbours.push((0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x, node.y - gridSize)); // N
    if ((0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x, node.y + gridSize) && !(0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x, node.y + gridSize).isWall)
        neighbours.push((0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x, node.y + gridSize)); // S
    if ((0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x - gridSize, node.y) && !(0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x - gridSize, node.y).isWall)
        neighbours.push((0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x - gridSize, node.y)); // W
    if ((0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x + gridSize, node.y) && !(0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x + gridSize, node.y).isWall)
        neighbours.push((0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x + gridSize, node.y)); // E
    if ((0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x - gridSize, node.y - gridSize) &&
        !(0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x - gridSize, node.y - gridSize).isWall)
        neighbours.push((0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x - gridSize, node.y - gridSize)); //NW
    if ((0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x - gridSize, node.y + gridSize) &&
        !(0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x - gridSize, node.y + gridSize).isWall)
        neighbours.push((0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x - gridSize, node.y + gridSize)); //SW
    if ((0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x + gridSize, node.y + gridSize) &&
        !(0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x + gridSize, node.y + gridSize).isWall)
        neighbours.push((0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x + gridSize, node.y + gridSize)); //SE
    if ((0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x + gridSize, node.y - gridSize) &&
        !(0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x + gridSize, node.y - gridSize).isWall)
        neighbours.push((0,_grid__WEBPACK_IMPORTED_MODULE_1__.getGridCoord)(node.x + gridSize, node.y - gridSize)); //NE
    return neighbours;
};
const aStarSearch = (src, dest, cost = true) => {
    let openList = new PriorityQueue();
    openList.enqueue(src, src.f);
    while (!openList.isEmpty()) {
        let currentNode = openList.dequeue();
        if (currentNode != undefined) {
            if (currentNode.x == dest.x && currentNode.y == dest.y) {
                let curr = currentNode;
                let ret = [];
                while (curr.parent) {
                    if (cost)
                        curr.cost = 5;
                    ret.push(curr);
                    curr = curr.parent;
                }
                ret.push(src);
                resetAStarGrid();
                return ret.reverse();
            }
            currentNode.closed = true;
            let neighbours = getNeightbours(currentNode);
            neighbours.forEach((n) => {
                // if neighbour is closed or wall:
                if (n.closed || currentNode == undefined)
                    return;
                let gScore = currentNode.g + n.cost;
                let beenVisited = n.visited;
                if (!beenVisited || gScore < n.g) {
                    n.visited = true;
                    n.parent = currentNode;
                    n.h = diagonalHeuristic(n, dest);
                    n.g = gScore;
                    n.f = n.g + n.h;
                    if (!beenVisited) {
                        openList.enqueue(n, 0);
                    }
                    else {
                        openList.rescore(n, n.f);
                    }
                }
            });
        }
    }
    resetAStarGrid();
    return [];
};
const resetAStarGrid = () => {
    for (let x = 0; x < _grid__WEBPACK_IMPORTED_MODULE_1__.gridOptions.gridWidth; x += _grid__WEBPACK_IMPORTED_MODULE_1__.gridOptions.gridSize) {
        for (let y = 0; y < _grid__WEBPACK_IMPORTED_MODULE_1__.gridOptions.gridHeight; y += _grid__WEBPACK_IMPORTED_MODULE_1__.gridOptions.gridSize) {
            _grid__WEBPACK_IMPORTED_MODULE_1__.grid[`${[x, y]}`].f = 0;
            _grid__WEBPACK_IMPORTED_MODULE_1__.grid[`${[x, y]}`].h = 0;
            _grid__WEBPACK_IMPORTED_MODULE_1__.grid[`${[x, y]}`].g = 0;
            _grid__WEBPACK_IMPORTED_MODULE_1__.grid[`${[x, y]}`].visited = false;
            _grid__WEBPACK_IMPORTED_MODULE_1__.grid[`${[x, y]}`].parent = null;
            _grid__WEBPACK_IMPORTED_MODULE_1__.grid[`${[x, y]}`].closed = false;
        }
    }
};
const drawPath = (path, arrow_thickness, marker_size, colour, doubleArrow = false, dotted = false, curved = true) => {
    const arrowPoints = [
        [0, 0],
        [0, marker_size],
        [marker_size, marker_size / 2]
    ];
    const refX = marker_size;
    const refY = refX / 2;
    const svg = d3.select('main').append('svg');
    const curve = d3.line().curve(curved ? d3.curveBasis : d3.curveLinear);
    svg
        .attr('class', 'arrow_svg')
        .style('position', 'absolute')
        .style('overflow', 'visible')
        .style('width', 1)
        .style('height', 1)
        .style('top', 0)
        .style('left', 0);
    svg
        .append('defs')
        .append('marker')
        .attr('id', `arrow_${colour}`)
        .attr('viewBox', [0, 0, marker_size, marker_size])
        .attr('refX', refX)
        .attr('refY', refY)
        .attr('markerWidth', marker_size)
        .attr('markerHeight', marker_size)
        .attr('orient', 'auto-start-reverse')
        .attr('stroke', colour)
        .append('path')
        .attr('stroke-width', arrow_thickness)
        .attr('stroke', colour)
        .attr('fill', colour)
        .attr('d', d3.line()(arrowPoints) + ' Z');
    const arrow = svg
        .append('path')
        .attr('d', curve(path))
        .style('stroke-dasharray', dotted ? '3,3' : '')
        .attr('stroke', colour)
        .attr('marker-end', marker_size > 0 ? `url(#arrow_${colour})` : '')
        .attr('marker-start', doubleArrow ? `url(#arrow_${colour})` : '')
        .attr('fill', 'none');
    return arrow;
};
const findFirstIntersectionBetweenPaths = (paths) => {
    const result = paths.reduce((a, b) => a.filter((c) => b.includes(c)));
    return result[0];
};
const findPathServiceShapeIntersection = (path, input, output) => {
    const serviceLines = [...getLinesFromServiceShape(output), ...getLinesFromServiceShape(input)];
    const pathLines = getLinesFromPath(path);
    const res = [];
    for (let i = 0; i < pathLines.length; i++) {
        for (let j = 0; j < serviceLines.length; j++) {
            const int = lineLineIntersection(pathLines[i], serviceLines[j]);
            if (int !== false) {
                res.push([int.x, int.y]);
                break;
            }
        }
    }
    return res;
};
const lineLineIntersection = (line1, line2) => {
    const x1 = line1.x1, x2 = line1.x2, x3 = line2.x1, x4 = line2.x2;
    const y1 = line1.y1, y2 = line1.y2, y3 = line2.y1, y4 = line2.y2;
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    const x = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
    const y = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
    if (denom !== 0) {
        const point = new _grid__WEBPACK_IMPORTED_MODULE_1__.Point(x / denom, y / denom);
        if (between(point.x, x1, x2) &&
            between(point.y, y1, y2) &&
            between(point.x, x3, x4) &&
            between(point.y, y3, y4)) {
            return point;
        }
    }
    return false;
};
const between = (a, b1, b2) => {
    if (a >= b1 && a <= b2) {
        return true;
    }
    if (a >= b2 && a <= b1) {
        return true;
    }
    return false;
};
const getLinesFromPath = (path) => {
    const res = [];
    for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];
        res.push({ x1: p1[0], x2: p2[0], y1: p1[1], y2: p2[1] });
    }
    return res;
};
const getLinesFromServiceShape = (svc) => {
    const res = [];
    const height = svc.height;
    const width = svc.width;
    const x = svc.x;
    const y = svc.y;
    res.push({ x1: x, x2: x + width / 2, y1: y + height / 2, y2: y + height });
    res.push({ x2: x + width / 2 + width, x1: x + width / 2, y2: y + height, y1: y + height });
    res.push({ x1: x + width / 2 + width, x2: x + width * 2, y1: y + height, y2: y + height / 2 });
    res.push({ x2: x + width / 2 + width, x1: x + width * 2, y2: y, y1: y + height / 2 });
    res.push({ x1: x + width / 2 + width, x2: x + width / 2, y1: y, y2: y });
    res.push({ x2: x, x1: x + width / 2, y2: y + height / 2, y1: y });
    return res;
};


/***/ }),

/***/ "./src/lib/store.ts":
/*!**************************!*\
  !*** ./src/lib/store.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pgRoot": () => (/* binding */ pgRoot)
/* harmony export */ });
/* harmony import */ var svelte_store__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/store */ "./node_modules/svelte/store/index.mjs");
/* harmony import */ var _data_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./data/data */ "./src/lib/data/data.ts");


const pgRoot = (0,svelte_store__WEBPACK_IMPORTED_MODULE_0__.writable)(_data_data__WEBPACK_IMPORTED_MODULE_1__.placegraph[0]);


/***/ }),

/***/ "./src/lib/system/cell.ts":
/*!********************************!*\
  !*** ./src/lib/system/cell.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createPathBetweenServices": () => (/* binding */ createPathBetweenServices),
/* harmony export */   "findIntersection": () => (/* binding */ findIntersection),
/* harmony export */   "renderCell": () => (/* binding */ renderCell)
/* harmony export */ });
/* harmony import */ var _data_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../data/data */ "./src/lib/data/data.ts");
/* harmony import */ var _grid_grid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../grid/grid */ "./src/lib/grid/grid.ts");
/* harmony import */ var _grid_pathFinding__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../grid/pathFinding */ "./src/lib/grid/pathFinding.ts");
/* harmony import */ var _service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./service */ "./src/lib/system/service.ts");




const renderCell = (node) => {
    const internalServices = [];
    node.nodes.forEach((n) => {
        if (n.type === 'service')
            internalServices.push((0,_service__WEBPACK_IMPORTED_MODULE_3__.getServiceFromID)(n.id, _data_data__WEBPACK_IMPORTED_MODULE_0__.services));
    });
    const dims = getCellDimension(internalServices);
    return node.type == 'network' ? drawNetworkCell(dims) : drawServiceCell(dims);
};
const createPathBetweenServices = (services) => {
    const res = [];
    services.forEach((svc) => {
        var _a;
        if (svc.outputPorts.length == 0)
            return;
        (_a = svc.outputPorts) === null || _a === void 0 ? void 0 : _a.forEach((op) => {
            if (op.location === 'local' || op.location === 'none')
                return;
            services.forEach((svc2) => {
                var _a, _b;
                if (((_a = svc2.inputPorts) === null || _a === void 0 ? void 0 : _a.length) == 0 || svc2.id === svc.id)
                    return;
                (_b = svc2.inputPorts) === null || _b === void 0 ? void 0 : _b.forEach((ip) => {
                    if (ip.location !== op.location || ip.location === 'local' || ip.location === 'none')
                        return;
                    const path = (0,_grid_pathFinding__WEBPACK_IMPORTED_MODULE_2__.aStarSearch)(svc.center, svc2.center);
                    const coordArray = (0,_grid_pathFinding__WEBPACK_IMPORTED_MODULE_2__.makeCoordArray)(path);
                    if (coordArray.length === 0)
                        return;
                    res.push({
                        input: svc2,
                        ip,
                        output: svc,
                        op,
                        path: coordArray
                    });
                });
            });
        });
    });
    return res;
};
const findIntersection = (path, svc, svc2) => { };
const drawServiceCell = (dims) => {
    const padding = _grid_grid__WEBPACK_IMPORTED_MODULE_1__.gridOptions.cellPadding * _grid_grid__WEBPACK_IMPORTED_MODULE_1__.gridOptions.gridSize;
    const x = dims.x - padding;
    const w = (dims.w + padding) / 2;
    const y = dims.y - padding * 2;
    const h = dims.h + padding * 2;
    return `M${x - padding} ${y + h / 2} L${x + padding} ${y + h} L${x + w / 2 + w} ${y + h} L${x + w * 2} ${y + h / 2} L${x + w / 2 + w} ${y} L${x + padding} ${y} Z`;
};
const drawNetworkCell = (dims) => {
    const padding = _grid_grid__WEBPACK_IMPORTED_MODULE_1__.gridOptions.cellPadding * _grid_grid__WEBPACK_IMPORTED_MODULE_1__.gridOptions.gridSize;
    const x = dims.x - padding;
    const y = dims.y - padding;
    const w = dims.w + padding;
    const h = dims.h + padding;
    return `M${x + 2} ${y + 2} L${x + 2} ${h - 1} L${w - 1} ${h - 1} L${w - 1} ${y + 2} Z`;
};
const getCellDimension = (services) => {
    let rectX = Number.POSITIVE_INFINITY;
    let rectY = Number.POSITIVE_INFINITY;
    let rectW = Number.NEGATIVE_INFINITY;
    let rectH = Number.NEGATIVE_INFINITY;
    services.forEach((svc) => {
        if (svc.x < rectX)
            rectX = svc.x;
        if (svc.y < rectY)
            rectY = svc.y;
        const height = svc.height + svc.y;
        if (height > rectH)
            rectH = height;
        const width = svc.width * 2 + svc.x;
        if (width > rectW)
            rectW = width;
    });
    return {
        x: rectX,
        y: rectY,
        w: rectW,
        h: rectH
    };
};


/***/ }),

/***/ "./src/lib/system/service.ts":
/*!***********************************!*\
  !*** ./src/lib/system/service.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "drawService": () => (/* binding */ drawService),
/* harmony export */   "getServiceFromID": () => (/* binding */ getServiceFromID),
/* harmony export */   "setServicePosition": () => (/* binding */ setServicePosition),
/* harmony export */   "sizeServices": () => (/* binding */ sizeServices)
/* harmony export */ });
/* harmony import */ var _grid_grid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../grid/grid */ "./src/lib/grid/grid.ts");
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/utils */ "./src/lib/utils/utils.ts");


const getServiceFromID = (id, services) => {
    return services.find((t) => t.id === id);
};
const sizeServices = (svcs) => {
    svcs.forEach((svc) => {
        svc.height = _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.gridSize * 10;
        svc.width = _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.gridSize * 6;
    });
};
const setServicePosition = (services, node, overwrite = false) => {
    const categories = categorize(services);
    setOffsets(node);
    const startArray = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_1__.countEntries)(categories.flatMap((t) => t.category));
    const countArray = (0,_utils_utils__WEBPACK_IMPORTED_MODULE_1__.countEntries)(categories.flatMap((t) => t.category));
    categories.forEach((cat) => {
        if (cat.svc.x === undefined || overwrite)
            cat.svc.x =
                _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.leftOffset * _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.gridSize +
                    cat.category * (cat.svc.width * 2 + _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.leftMargin * _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.gridSize);
        if (cat.svc.y === undefined || overwrite)
            cat.svc.y =
                _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.topOffset * _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.gridSize +
                    (cat.svc.height + _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.topMargin * _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.gridSize) *
                        (startArray[cat.category] - countArray[cat.category]);
        cat.svc.center = new _grid_grid__WEBPACK_IMPORTED_MODULE_0__.Point(cat.svc.x + (cat.svc.width * 2) / 2, cat.svc.y + cat.svc.height / 2);
        countArray[cat.category]--;
    });
    const dim = (0,_grid_grid__WEBPACK_IMPORTED_MODULE_0__.getGridBox)(services);
    (0,_grid_grid__WEBPACK_IMPORTED_MODULE_0__.setGridSize)(dim.w, dim.h);
};
const drawService = (svc) => {
    const width = svc.width;
    const height = svc.height;
    const x = _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.servicePadding * _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.gridSize;
    const y = _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.servicePadding * _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.gridSize;
    let drawPath = `M${x} ${y + height / 2} L${x + width / 2} ${y + height} L${x + width / 2 + width} ${y + height} L${x + width * 2} ${y + height / 2} L${x + width / 2 + width} ${y} L${x + width / 2} ${y} Z`;
    const gs = _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.gridSize;
    (0,_grid_grid__WEBPACK_IMPORTED_MODULE_0__.setGridWall)(svc.x, svc.y + height / 2);
    (0,_grid_grid__WEBPACK_IMPORTED_MODULE_0__.setGridWall)(svc.x + gs, svc.y + height / 2);
    (0,_grid_grid__WEBPACK_IMPORTED_MODULE_0__.setGridWall)(svc.x + width / 2, svc.y + height);
    (0,_grid_grid__WEBPACK_IMPORTED_MODULE_0__.setGridWall)(svc.x + width / 2, svc.y);
    (0,_grid_grid__WEBPACK_IMPORTED_MODULE_0__.setGridWall)(svc.x + width / 2 + width, svc.y + height);
    (0,_grid_grid__WEBPACK_IMPORTED_MODULE_0__.setGridWall)(svc.x + width / 2 + width, svc.y);
    (0,_grid_grid__WEBPACK_IMPORTED_MODULE_0__.setGridWall)(svc.x + width * 2, svc.y + height / 2);
    (0,_grid_grid__WEBPACK_IMPORTED_MODULE_0__.setGridWall)(svc.x + width * 2 - gs, svc.y + height / 2);
    return drawPath;
};
const setOffsets = (node) => {
    if (node.type !== 'service') {
        _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.leftOffset += _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.cellPadding + 1;
        _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.topOffset += _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.cellPadding + 1;
    }
    else {
        _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.topOffset = _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.cellPadding * 2 + 1;
        _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.leftOffset = _grid_grid__WEBPACK_IMPORTED_MODULE_0__.gridOptions.cellPadding * 2 + 1;
    }
    // const numberOfCategories = new Set(categories.flatMap((t) => t.category)).size;
    // const servicesWidths = categories.flatMap(
    // 	(t) => t.svc.width * 2 + gridOptions.servicePadding * 2
    // );
    // const serviceHeights = categories.flatMap((t) => t.svc.height + gridOptions.servicePadding * 2);
    // gridOptions.leftOffset =
    // 	(numberOfCategories * (servicesWidths.reduce((t) => t) + gridOptions.leftMargin)) /
    // 	gridOptions.gridSize;
    // gridOptions.topOffset =
    // 	(numberOfCategories * (serviceHeights.reduce((t) => t) + gridOptions.topMargin)) /
    // 	gridOptions.gridSize;
};
const categorize = (services) => {
    const categoryList = [];
    const totalLength = services.length * 2;
    let tmp_list = services;
    let count = 1;
    while (tmp_list.length > 0) {
        tmp_list = categorizeServices(tmp_list, categoryList, count);
        count += totalLength;
    }
    return normalizeRange(categoryList.sort((a, b) => a.category - b.category));
};
const categorizeServices = (services, categoryList, count) => {
    const max_column_size = 4;
    const pivot = getPivotElement(services);
    categoryList.push({ svc: pivot, category: count });
    let svcs = services.filter((t) => t.name !== pivot.name);
    getIncomingServices(pivot, svcs).forEach((inc) => {
        categoryList.push({ svc: inc, category: count + 1 });
        svcs = svcs.filter((t) => t.name !== inc.name);
    });
    getOutgoingServices(pivot, svcs).forEach((out) => {
        if (categoryList.flatMap((t) => t.category).filter((t) => t == count - 1).length < max_column_size)
            categoryList.push({ svc: out, category: count - 1 });
        else
            categoryList.push({ svc: out, category: count - services.length });
        svcs = svcs.filter((t) => t.name !== out.name);
    });
    return svcs;
};
const getOutgoingServices = (svc, svcList) => {
    var _a;
    const list = [];
    (_a = svc.outputPorts) === null || _a === void 0 ? void 0 : _a.forEach((op) => {
        svcList.forEach((s) => {
            var _a;
            (_a = s.inputPorts) === null || _a === void 0 ? void 0 : _a.forEach((ip) => {
                if (ip.location === op.location && !op.location.startsWith('!local'))
                    if (!list.flatMap((t) => t.name).includes(s.name))
                        list.push(s);
            });
        });
    });
    return list;
};
const getIncomingServices = (svc, svcList) => {
    var _a;
    const list = [];
    (_a = svc.inputPorts) === null || _a === void 0 ? void 0 : _a.forEach((ip) => {
        svcList.forEach((s) => {
            var _a;
            (_a = s.outputPorts) === null || _a === void 0 ? void 0 : _a.forEach((op) => {
                if (ip.location === op.location && !ip.location.startsWith('!local'))
                    if (!list.flatMap((t) => t.name).includes(s.name))
                        list.push(s);
            });
        });
    });
    return list;
};
const getPivotElement = (svcs) => {
    let pivot = svcs[0];
    svcs.forEach((svc) => {
        const cmp = (pivot.inputPorts === undefined ? -10 : pivot.inputPorts.length) +
            (pivot.outputPorts === undefined ? -10 : pivot.outputPorts.length);
        if (cmp <
            (svc.inputPorts === undefined ? -10 : svc.inputPorts.length) +
                (svc.outputPorts === undefined ? -10 : svc.outputPorts.length)) {
            pivot = svc;
        }
    });
    return pivot;
};
const normalizeRange = (list) => {
    let count = -1;
    let last = Number.NEGATIVE_INFINITY;
    list.forEach((i) => {
        if (i.category !== last)
            count++;
        last = i.category;
        i.category = count;
    });
    return list;
};


/***/ }),

/***/ "./src/lib/utils/utils.ts":
/*!********************************!*\
  !*** ./src/lib/utils/utils.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "countEntries": () => (/* binding */ countEntries)
/* harmony export */ });
const countEntries = (list) => {
    const result = [];
    list.forEach((i) => {
        if (isNaN(result[i]))
            result[i] = -1;
        result[i]++;
    });
    return result;
};


/***/ }),

/***/ "./node_modules/svelte/index.mjs":
/*!***************************************!*\
  !*** ./node_modules/svelte/index.mjs ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "SvelteComponent": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.SvelteComponentDev),
/* harmony export */   "SvelteComponentTyped": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.SvelteComponentTyped),
/* harmony export */   "afterUpdate": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.afterUpdate),
/* harmony export */   "beforeUpdate": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.beforeUpdate),
/* harmony export */   "createEventDispatcher": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.createEventDispatcher),
/* harmony export */   "getAllContexts": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.getAllContexts),
/* harmony export */   "getContext": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.getContext),
/* harmony export */   "hasContext": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.hasContext),
/* harmony export */   "onDestroy": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.onDestroy),
/* harmony export */   "onMount": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.onMount),
/* harmony export */   "setContext": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.setContext),
/* harmony export */   "tick": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.tick)
/* harmony export */ });
/* harmony import */ var _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./internal/index.mjs */ "./node_modules/svelte/internal/index.mjs");



/***/ }),

/***/ "./node_modules/svelte/internal/index.mjs":
/*!************************************************!*\
  !*** ./node_modules/svelte/internal/index.mjs ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HtmlTag": () => (/* binding */ HtmlTag),
/* harmony export */   "HtmlTagHydration": () => (/* binding */ HtmlTagHydration),
/* harmony export */   "SvelteComponent": () => (/* binding */ SvelteComponent),
/* harmony export */   "SvelteComponentDev": () => (/* binding */ SvelteComponentDev),
/* harmony export */   "SvelteComponentTyped": () => (/* binding */ SvelteComponentTyped),
/* harmony export */   "SvelteElement": () => (/* binding */ SvelteElement),
/* harmony export */   "action_destroyer": () => (/* binding */ action_destroyer),
/* harmony export */   "add_attribute": () => (/* binding */ add_attribute),
/* harmony export */   "add_classes": () => (/* binding */ add_classes),
/* harmony export */   "add_flush_callback": () => (/* binding */ add_flush_callback),
/* harmony export */   "add_location": () => (/* binding */ add_location),
/* harmony export */   "add_render_callback": () => (/* binding */ add_render_callback),
/* harmony export */   "add_resize_listener": () => (/* binding */ add_resize_listener),
/* harmony export */   "add_styles": () => (/* binding */ add_styles),
/* harmony export */   "add_transform": () => (/* binding */ add_transform),
/* harmony export */   "afterUpdate": () => (/* binding */ afterUpdate),
/* harmony export */   "append": () => (/* binding */ append),
/* harmony export */   "append_dev": () => (/* binding */ append_dev),
/* harmony export */   "append_empty_stylesheet": () => (/* binding */ append_empty_stylesheet),
/* harmony export */   "append_hydration": () => (/* binding */ append_hydration),
/* harmony export */   "append_hydration_dev": () => (/* binding */ append_hydration_dev),
/* harmony export */   "append_styles": () => (/* binding */ append_styles),
/* harmony export */   "assign": () => (/* binding */ assign),
/* harmony export */   "attr": () => (/* binding */ attr),
/* harmony export */   "attr_dev": () => (/* binding */ attr_dev),
/* harmony export */   "attribute_to_object": () => (/* binding */ attribute_to_object),
/* harmony export */   "beforeUpdate": () => (/* binding */ beforeUpdate),
/* harmony export */   "bind": () => (/* binding */ bind),
/* harmony export */   "binding_callbacks": () => (/* binding */ binding_callbacks),
/* harmony export */   "blank_object": () => (/* binding */ blank_object),
/* harmony export */   "bubble": () => (/* binding */ bubble),
/* harmony export */   "check_outros": () => (/* binding */ check_outros),
/* harmony export */   "children": () => (/* binding */ children),
/* harmony export */   "claim_component": () => (/* binding */ claim_component),
/* harmony export */   "claim_element": () => (/* binding */ claim_element),
/* harmony export */   "claim_html_tag": () => (/* binding */ claim_html_tag),
/* harmony export */   "claim_space": () => (/* binding */ claim_space),
/* harmony export */   "claim_svg_element": () => (/* binding */ claim_svg_element),
/* harmony export */   "claim_text": () => (/* binding */ claim_text),
/* harmony export */   "clear_loops": () => (/* binding */ clear_loops),
/* harmony export */   "component_subscribe": () => (/* binding */ component_subscribe),
/* harmony export */   "compute_rest_props": () => (/* binding */ compute_rest_props),
/* harmony export */   "compute_slots": () => (/* binding */ compute_slots),
/* harmony export */   "construct_svelte_component": () => (/* binding */ construct_svelte_component),
/* harmony export */   "construct_svelte_component_dev": () => (/* binding */ construct_svelte_component_dev),
/* harmony export */   "createEventDispatcher": () => (/* binding */ createEventDispatcher),
/* harmony export */   "create_animation": () => (/* binding */ create_animation),
/* harmony export */   "create_bidirectional_transition": () => (/* binding */ create_bidirectional_transition),
/* harmony export */   "create_component": () => (/* binding */ create_component),
/* harmony export */   "create_in_transition": () => (/* binding */ create_in_transition),
/* harmony export */   "create_out_transition": () => (/* binding */ create_out_transition),
/* harmony export */   "create_slot": () => (/* binding */ create_slot),
/* harmony export */   "create_ssr_component": () => (/* binding */ create_ssr_component),
/* harmony export */   "current_component": () => (/* binding */ current_component),
/* harmony export */   "custom_event": () => (/* binding */ custom_event),
/* harmony export */   "dataset_dev": () => (/* binding */ dataset_dev),
/* harmony export */   "debug": () => (/* binding */ debug),
/* harmony export */   "destroy_block": () => (/* binding */ destroy_block),
/* harmony export */   "destroy_component": () => (/* binding */ destroy_component),
/* harmony export */   "destroy_each": () => (/* binding */ destroy_each),
/* harmony export */   "detach": () => (/* binding */ detach),
/* harmony export */   "detach_after_dev": () => (/* binding */ detach_after_dev),
/* harmony export */   "detach_before_dev": () => (/* binding */ detach_before_dev),
/* harmony export */   "detach_between_dev": () => (/* binding */ detach_between_dev),
/* harmony export */   "detach_dev": () => (/* binding */ detach_dev),
/* harmony export */   "dirty_components": () => (/* binding */ dirty_components),
/* harmony export */   "dispatch_dev": () => (/* binding */ dispatch_dev),
/* harmony export */   "each": () => (/* binding */ each),
/* harmony export */   "element": () => (/* binding */ element),
/* harmony export */   "element_is": () => (/* binding */ element_is),
/* harmony export */   "empty": () => (/* binding */ empty),
/* harmony export */   "end_hydrating": () => (/* binding */ end_hydrating),
/* harmony export */   "escape": () => (/* binding */ escape),
/* harmony export */   "escape_attribute_value": () => (/* binding */ escape_attribute_value),
/* harmony export */   "escape_object": () => (/* binding */ escape_object),
/* harmony export */   "exclude_internal_props": () => (/* binding */ exclude_internal_props),
/* harmony export */   "fix_and_destroy_block": () => (/* binding */ fix_and_destroy_block),
/* harmony export */   "fix_and_outro_and_destroy_block": () => (/* binding */ fix_and_outro_and_destroy_block),
/* harmony export */   "fix_position": () => (/* binding */ fix_position),
/* harmony export */   "flush": () => (/* binding */ flush),
/* harmony export */   "getAllContexts": () => (/* binding */ getAllContexts),
/* harmony export */   "getContext": () => (/* binding */ getContext),
/* harmony export */   "get_all_dirty_from_scope": () => (/* binding */ get_all_dirty_from_scope),
/* harmony export */   "get_binding_group_value": () => (/* binding */ get_binding_group_value),
/* harmony export */   "get_current_component": () => (/* binding */ get_current_component),
/* harmony export */   "get_custom_elements_slots": () => (/* binding */ get_custom_elements_slots),
/* harmony export */   "get_root_for_style": () => (/* binding */ get_root_for_style),
/* harmony export */   "get_slot_changes": () => (/* binding */ get_slot_changes),
/* harmony export */   "get_spread_object": () => (/* binding */ get_spread_object),
/* harmony export */   "get_spread_update": () => (/* binding */ get_spread_update),
/* harmony export */   "get_store_value": () => (/* binding */ get_store_value),
/* harmony export */   "globals": () => (/* binding */ globals),
/* harmony export */   "group_outros": () => (/* binding */ group_outros),
/* harmony export */   "handle_promise": () => (/* binding */ handle_promise),
/* harmony export */   "hasContext": () => (/* binding */ hasContext),
/* harmony export */   "has_prop": () => (/* binding */ has_prop),
/* harmony export */   "head_selector": () => (/* binding */ head_selector),
/* harmony export */   "identity": () => (/* binding */ identity),
/* harmony export */   "init": () => (/* binding */ init),
/* harmony export */   "insert": () => (/* binding */ insert),
/* harmony export */   "insert_dev": () => (/* binding */ insert_dev),
/* harmony export */   "insert_hydration": () => (/* binding */ insert_hydration),
/* harmony export */   "insert_hydration_dev": () => (/* binding */ insert_hydration_dev),
/* harmony export */   "intros": () => (/* binding */ intros),
/* harmony export */   "invalid_attribute_name_character": () => (/* binding */ invalid_attribute_name_character),
/* harmony export */   "is_client": () => (/* binding */ is_client),
/* harmony export */   "is_crossorigin": () => (/* binding */ is_crossorigin),
/* harmony export */   "is_empty": () => (/* binding */ is_empty),
/* harmony export */   "is_function": () => (/* binding */ is_function),
/* harmony export */   "is_promise": () => (/* binding */ is_promise),
/* harmony export */   "is_void": () => (/* binding */ is_void),
/* harmony export */   "listen": () => (/* binding */ listen),
/* harmony export */   "listen_dev": () => (/* binding */ listen_dev),
/* harmony export */   "loop": () => (/* binding */ loop),
/* harmony export */   "loop_guard": () => (/* binding */ loop_guard),
/* harmony export */   "merge_ssr_styles": () => (/* binding */ merge_ssr_styles),
/* harmony export */   "missing_component": () => (/* binding */ missing_component),
/* harmony export */   "mount_component": () => (/* binding */ mount_component),
/* harmony export */   "noop": () => (/* binding */ noop),
/* harmony export */   "not_equal": () => (/* binding */ not_equal),
/* harmony export */   "now": () => (/* binding */ now),
/* harmony export */   "null_to_empty": () => (/* binding */ null_to_empty),
/* harmony export */   "object_without_properties": () => (/* binding */ object_without_properties),
/* harmony export */   "onDestroy": () => (/* binding */ onDestroy),
/* harmony export */   "onMount": () => (/* binding */ onMount),
/* harmony export */   "once": () => (/* binding */ once),
/* harmony export */   "outro_and_destroy_block": () => (/* binding */ outro_and_destroy_block),
/* harmony export */   "prevent_default": () => (/* binding */ prevent_default),
/* harmony export */   "prop_dev": () => (/* binding */ prop_dev),
/* harmony export */   "query_selector_all": () => (/* binding */ query_selector_all),
/* harmony export */   "raf": () => (/* binding */ raf),
/* harmony export */   "run": () => (/* binding */ run),
/* harmony export */   "run_all": () => (/* binding */ run_all),
/* harmony export */   "safe_not_equal": () => (/* binding */ safe_not_equal),
/* harmony export */   "schedule_update": () => (/* binding */ schedule_update),
/* harmony export */   "select_multiple_value": () => (/* binding */ select_multiple_value),
/* harmony export */   "select_option": () => (/* binding */ select_option),
/* harmony export */   "select_options": () => (/* binding */ select_options),
/* harmony export */   "select_value": () => (/* binding */ select_value),
/* harmony export */   "self": () => (/* binding */ self),
/* harmony export */   "setContext": () => (/* binding */ setContext),
/* harmony export */   "set_attributes": () => (/* binding */ set_attributes),
/* harmony export */   "set_current_component": () => (/* binding */ set_current_component),
/* harmony export */   "set_custom_element_data": () => (/* binding */ set_custom_element_data),
/* harmony export */   "set_custom_element_data_map": () => (/* binding */ set_custom_element_data_map),
/* harmony export */   "set_data": () => (/* binding */ set_data),
/* harmony export */   "set_data_dev": () => (/* binding */ set_data_dev),
/* harmony export */   "set_input_type": () => (/* binding */ set_input_type),
/* harmony export */   "set_input_value": () => (/* binding */ set_input_value),
/* harmony export */   "set_now": () => (/* binding */ set_now),
/* harmony export */   "set_raf": () => (/* binding */ set_raf),
/* harmony export */   "set_store_value": () => (/* binding */ set_store_value),
/* harmony export */   "set_style": () => (/* binding */ set_style),
/* harmony export */   "set_svg_attributes": () => (/* binding */ set_svg_attributes),
/* harmony export */   "space": () => (/* binding */ space),
/* harmony export */   "spread": () => (/* binding */ spread),
/* harmony export */   "src_url_equal": () => (/* binding */ src_url_equal),
/* harmony export */   "start_hydrating": () => (/* binding */ start_hydrating),
/* harmony export */   "stop_propagation": () => (/* binding */ stop_propagation),
/* harmony export */   "subscribe": () => (/* binding */ subscribe),
/* harmony export */   "svg_element": () => (/* binding */ svg_element),
/* harmony export */   "text": () => (/* binding */ text),
/* harmony export */   "tick": () => (/* binding */ tick),
/* harmony export */   "time_ranges_to_array": () => (/* binding */ time_ranges_to_array),
/* harmony export */   "to_number": () => (/* binding */ to_number),
/* harmony export */   "toggle_class": () => (/* binding */ toggle_class),
/* harmony export */   "transition_in": () => (/* binding */ transition_in),
/* harmony export */   "transition_out": () => (/* binding */ transition_out),
/* harmony export */   "trusted": () => (/* binding */ trusted),
/* harmony export */   "update_await_block_branch": () => (/* binding */ update_await_block_branch),
/* harmony export */   "update_keyed_each": () => (/* binding */ update_keyed_each),
/* harmony export */   "update_slot": () => (/* binding */ update_slot),
/* harmony export */   "update_slot_base": () => (/* binding */ update_slot_base),
/* harmony export */   "validate_component": () => (/* binding */ validate_component),
/* harmony export */   "validate_dynamic_element": () => (/* binding */ validate_dynamic_element),
/* harmony export */   "validate_each_argument": () => (/* binding */ validate_each_argument),
/* harmony export */   "validate_each_keys": () => (/* binding */ validate_each_keys),
/* harmony export */   "validate_slots": () => (/* binding */ validate_slots),
/* harmony export */   "validate_store": () => (/* binding */ validate_store),
/* harmony export */   "validate_void_dynamic_element": () => (/* binding */ validate_void_dynamic_element),
/* harmony export */   "xlink_attr": () => (/* binding */ xlink_attr)
/* harmony export */ });
function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function is_promise(value) {
    return value && typeof value === 'object' && typeof value.then === 'function';
}
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file, line, column, char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
let src_url_equal_anchor;
function src_url_equal(element_src, url) {
    if (!src_url_equal_anchor) {
        src_url_equal_anchor = document.createElement('a');
    }
    src_url_equal_anchor.href = url;
    return element_src === src_url_equal_anchor.href;
}
function not_equal(a, b) {
    return a != a ? b == b : a !== b;
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function validate_store(store, name) {
    if (store != null && typeof store.subscribe !== 'function') {
        throw new Error(`'${name}' is not a store with a 'subscribe' method`);
    }
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
    let value;
    subscribe(store, _ => value = _)();
    return value;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}
function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
    const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
    update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn);
}
function get_all_dirty_from_scope($$scope) {
    if ($$scope.ctx.length > 32) {
        const dirty = [];
        const length = $$scope.ctx.length / 32;
        for (let i = 0; i < length; i++) {
            dirty[i] = -1;
        }
        return dirty;
    }
    return -1;
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}
function compute_rest_props(props, keys) {
    const rest = {};
    keys = new Set(keys);
    for (const k in props)
        if (!keys.has(k) && k[0] !== '$')
            rest[k] = props[k];
    return rest;
}
function compute_slots(slots) {
    const result = {};
    for (const key in slots) {
        result[key] = true;
    }
    return result;
}
function once(fn) {
    let ran = false;
    return function (...args) {
        if (ran)
            return;
        ran = true;
        fn.call(this, ...args);
    };
}
function null_to_empty(value) {
    return value == null ? '' : value;
}
function set_store_value(store, ret, value) {
    store.set(value);
    return ret;
}
const has_prop = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;
// used internally for testing
function set_now(fn) {
    now = fn;
}
function set_raf(fn) {
    raf = fn;
}

const tasks = new Set();
function run_tasks(now) {
    tasks.forEach(task => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * For testing purposes only!
 */
function clear_loops() {
    tasks.clear();
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise(fulfill => {
            tasks.add(task = { c: callback, f: fulfill });
        }),
        abort() {
            tasks.delete(task);
        }
    };
}

// Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
// at the end of hydration without touching the remaining nodes.
let is_hydrating = false;
function start_hydrating() {
    is_hydrating = true;
}
function end_hydrating() {
    is_hydrating = false;
}
function upper_bound(low, high, key, value) {
    // Return first index of value larger than input value in the range [low, high)
    while (low < high) {
        const mid = low + ((high - low) >> 1);
        if (key(mid) <= value) {
            low = mid + 1;
        }
        else {
            high = mid;
        }
    }
    return low;
}
function init_hydrate(target) {
    if (target.hydrate_init)
        return;
    target.hydrate_init = true;
    // We know that all children have claim_order values since the unclaimed have been detached if target is not <head>
    let children = target.childNodes;
    // If target is <head>, there may be children without claim_order
    if (target.nodeName === 'HEAD') {
        const myChildren = [];
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            if (node.claim_order !== undefined) {
                myChildren.push(node);
            }
        }
        children = myChildren;
    }
    /*
    * Reorder claimed children optimally.
    * We can reorder claimed children optimally by finding the longest subsequence of
    * nodes that are already claimed in order and only moving the rest. The longest
    * subsequence subsequence of nodes that are claimed in order can be found by
    * computing the longest increasing subsequence of .claim_order values.
    *
    * This algorithm is optimal in generating the least amount of reorder operations
    * possible.
    *
    * Proof:
    * We know that, given a set of reordering operations, the nodes that do not move
    * always form an increasing subsequence, since they do not move among each other
    * meaning that they must be already ordered among each other. Thus, the maximal
    * set of nodes that do not move form a longest increasing subsequence.
    */
    // Compute longest increasing subsequence
    // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
    const m = new Int32Array(children.length + 1);
    // Predecessor indices + 1
    const p = new Int32Array(children.length);
    m[0] = -1;
    let longest = 0;
    for (let i = 0; i < children.length; i++) {
        const current = children[i].claim_order;
        // Find the largest subsequence length such that it ends in a value less than our current value
        // upper_bound returns first greater value, so we subtract one
        // with fast path for when we are on the current longest subsequence
        const seqLen = ((longest > 0 && children[m[longest]].claim_order <= current) ? longest + 1 : upper_bound(1, longest, idx => children[m[idx]].claim_order, current)) - 1;
        p[i] = m[seqLen] + 1;
        const newLen = seqLen + 1;
        // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
        m[newLen] = i;
        longest = Math.max(newLen, longest);
    }
    // The longest increasing subsequence of nodes (initially reversed)
    const lis = [];
    // The rest of the nodes, nodes that will be moved
    const toMove = [];
    let last = children.length - 1;
    for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
        lis.push(children[cur - 1]);
        for (; last >= cur; last--) {
            toMove.push(children[last]);
        }
        last--;
    }
    for (; last >= 0; last--) {
        toMove.push(children[last]);
    }
    lis.reverse();
    // We sort the nodes being moved to guarantee that their insertion order matches the claim order
    toMove.sort((a, b) => a.claim_order - b.claim_order);
    // Finally, we move the nodes
    for (let i = 0, j = 0; i < toMove.length; i++) {
        while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
            j++;
        }
        const anchor = j < lis.length ? lis[j] : null;
        target.insertBefore(toMove[i], anchor);
    }
}
function append(target, node) {
    target.appendChild(node);
}
function append_styles(target, style_sheet_id, styles) {
    const append_styles_to = get_root_for_style(target);
    if (!append_styles_to.getElementById(style_sheet_id)) {
        const style = element('style');
        style.id = style_sheet_id;
        style.textContent = styles;
        append_stylesheet(append_styles_to, style);
    }
}
function get_root_for_style(node) {
    if (!node)
        return document;
    const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
    if (root && root.host) {
        return root;
    }
    return node.ownerDocument;
}
function append_empty_stylesheet(node) {
    const style_element = element('style');
    append_stylesheet(get_root_for_style(node), style_element);
    return style_element.sheet;
}
function append_stylesheet(node, style) {
    append(node.head || node, style);
    return style.sheet;
}
function append_hydration(target, node) {
    if (is_hydrating) {
        init_hydrate(target);
        if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentNode !== target))) {
            target.actual_end_child = target.firstChild;
        }
        // Skip nodes of undefined ordering
        while ((target.actual_end_child !== null) && (target.actual_end_child.claim_order === undefined)) {
            target.actual_end_child = target.actual_end_child.nextSibling;
        }
        if (node !== target.actual_end_child) {
            // We only insert if the ordering of this node should be modified or the parent node is not target
            if (node.claim_order !== undefined || node.parentNode !== target) {
                target.insertBefore(node, target.actual_end_child);
            }
        }
        else {
            target.actual_end_child = node.nextSibling;
        }
    }
    else if (node.parentNode !== target || node.nextSibling !== null) {
        target.appendChild(node);
    }
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function insert_hydration(target, node, anchor) {
    if (is_hydrating && !anchor) {
        append_hydration(target, node);
    }
    else if (node.parentNode !== target || node.nextSibling != anchor) {
        target.insertBefore(node, anchor || null);
    }
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function element_is(name, is) {
    return document.createElement(name, { is });
}
function object_without_properties(obj, exclude) {
    const target = {};
    for (const k in obj) {
        if (has_prop(obj, k)
            // @ts-ignore
            && exclude.indexOf(k) === -1) {
            // @ts-ignore
            target[k] = obj[k];
        }
    }
    return target;
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
    return function (event) {
        event.preventDefault();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function stop_propagation(fn) {
    return function (event) {
        event.stopPropagation();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function self(fn) {
    return function (event) {
        // @ts-ignore
        if (event.target === this)
            fn.call(this, event);
    };
}
function trusted(fn) {
    return function (event) {
        // @ts-ignore
        if (event.isTrusted)
            fn.call(this, event);
    };
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function set_attributes(node, attributes) {
    // @ts-ignore
    const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
    for (const key in attributes) {
        if (attributes[key] == null) {
            node.removeAttribute(key);
        }
        else if (key === 'style') {
            node.style.cssText = attributes[key];
        }
        else if (key === '__value') {
            node.value = node[key] = attributes[key];
        }
        else if (descriptors[key] && descriptors[key].set) {
            node[key] = attributes[key];
        }
        else {
            attr(node, key, attributes[key]);
        }
    }
}
function set_svg_attributes(node, attributes) {
    for (const key in attributes) {
        attr(node, key, attributes[key]);
    }
}
function set_custom_element_data_map(node, data_map) {
    Object.keys(data_map).forEach((key) => {
        set_custom_element_data(node, key, data_map[key]);
    });
}
function set_custom_element_data(node, prop, value) {
    if (prop in node) {
        node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
    }
    else {
        attr(node, prop, value);
    }
}
function xlink_attr(node, attribute, value) {
    node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
}
function get_binding_group_value(group, __value, checked) {
    const value = new Set();
    for (let i = 0; i < group.length; i += 1) {
        if (group[i].checked)
            value.add(group[i].__value);
    }
    if (!checked) {
        value.delete(__value);
    }
    return Array.from(value);
}
function to_number(value) {
    return value === '' ? null : +value;
}
function time_ranges_to_array(ranges) {
    const array = [];
    for (let i = 0; i < ranges.length; i += 1) {
        array.push({ start: ranges.start(i), end: ranges.end(i) });
    }
    return array;
}
function children(element) {
    return Array.from(element.childNodes);
}
function init_claim_info(nodes) {
    if (nodes.claim_info === undefined) {
        nodes.claim_info = { last_index: 0, total_claimed: 0 };
    }
}
function claim_node(nodes, predicate, processNode, createNode, dontUpdateLastIndex = false) {
    // Try to find nodes in an order such that we lengthen the longest increasing subsequence
    init_claim_info(nodes);
    const resultNode = (() => {
        // We first try to find an element after the previous one
        for (let i = nodes.claim_info.last_index; i < nodes.length; i++) {
            const node = nodes[i];
            if (predicate(node)) {
                const replacement = processNode(node);
                if (replacement === undefined) {
                    nodes.splice(i, 1);
                }
                else {
                    nodes[i] = replacement;
                }
                if (!dontUpdateLastIndex) {
                    nodes.claim_info.last_index = i;
                }
                return node;
            }
        }
        // Otherwise, we try to find one before
        // We iterate in reverse so that we don't go too far back
        for (let i = nodes.claim_info.last_index - 1; i >= 0; i--) {
            const node = nodes[i];
            if (predicate(node)) {
                const replacement = processNode(node);
                if (replacement === undefined) {
                    nodes.splice(i, 1);
                }
                else {
                    nodes[i] = replacement;
                }
                if (!dontUpdateLastIndex) {
                    nodes.claim_info.last_index = i;
                }
                else if (replacement === undefined) {
                    // Since we spliced before the last_index, we decrease it
                    nodes.claim_info.last_index--;
                }
                return node;
            }
        }
        // If we can't find any matching node, we create a new one
        return createNode();
    })();
    resultNode.claim_order = nodes.claim_info.total_claimed;
    nodes.claim_info.total_claimed += 1;
    return resultNode;
}
function claim_element_base(nodes, name, attributes, create_element) {
    return claim_node(nodes, (node) => node.nodeName === name, (node) => {
        const remove = [];
        for (let j = 0; j < node.attributes.length; j++) {
            const attribute = node.attributes[j];
            if (!attributes[attribute.name]) {
                remove.push(attribute.name);
            }
        }
        remove.forEach(v => node.removeAttribute(v));
        return undefined;
    }, () => create_element(name));
}
function claim_element(nodes, name, attributes) {
    return claim_element_base(nodes, name, attributes, element);
}
function claim_svg_element(nodes, name, attributes) {
    return claim_element_base(nodes, name, attributes, svg_element);
}
function claim_text(nodes, data) {
    return claim_node(nodes, (node) => node.nodeType === 3, (node) => {
        const dataStr = '' + data;
        if (node.data.startsWith(dataStr)) {
            if (node.data.length !== dataStr.length) {
                return node.splitText(dataStr.length);
            }
        }
        else {
            node.data = dataStr;
        }
    }, () => text(data), true // Text nodes should not update last index since it is likely not worth it to eliminate an increasing subsequence of actual elements
    );
}
function claim_space(nodes) {
    return claim_text(nodes, ' ');
}
function find_comment(nodes, text, start) {
    for (let i = start; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (node.nodeType === 8 /* comment node */ && node.textContent.trim() === text) {
            return i;
        }
    }
    return nodes.length;
}
function claim_html_tag(nodes, is_svg) {
    // find html opening tag
    const start_index = find_comment(nodes, 'HTML_TAG_START', 0);
    const end_index = find_comment(nodes, 'HTML_TAG_END', start_index);
    if (start_index === end_index) {
        return new HtmlTagHydration(undefined, is_svg);
    }
    init_claim_info(nodes);
    const html_tag_nodes = nodes.splice(start_index, end_index - start_index + 1);
    detach(html_tag_nodes[0]);
    detach(html_tag_nodes[html_tag_nodes.length - 1]);
    const claimed_nodes = html_tag_nodes.slice(1, html_tag_nodes.length - 1);
    for (const n of claimed_nodes) {
        n.claim_order = nodes.claim_info.total_claimed;
        nodes.claim_info.total_claimed += 1;
    }
    return new HtmlTagHydration(claimed_nodes, is_svg);
}
function set_data(text, data) {
    data = '' + data;
    if (text.wholeText !== data)
        text.data = data;
}
function set_input_value(input, value) {
    input.value = value == null ? '' : value;
}
function set_input_type(input, type) {
    try {
        input.type = type;
    }
    catch (e) {
        // do nothing
    }
}
function set_style(node, key, value, important) {
    if (value === null) {
        node.style.removeProperty(key);
    }
    else {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
}
function select_option(select, value) {
    for (let i = 0; i < select.options.length; i += 1) {
        const option = select.options[i];
        if (option.__value === value) {
            option.selected = true;
            return;
        }
    }
    select.selectedIndex = -1; // no option should be selected
}
function select_options(select, value) {
    for (let i = 0; i < select.options.length; i += 1) {
        const option = select.options[i];
        option.selected = ~value.indexOf(option.__value);
    }
}
function select_value(select) {
    const selected_option = select.querySelector(':checked') || select.options[0];
    return selected_option && selected_option.__value;
}
function select_multiple_value(select) {
    return [].map.call(select.querySelectorAll(':checked'), option => option.__value);
}
// unfortunately this can't be a constant as that wouldn't be tree-shakeable
// so we cache the result instead
let crossorigin;
function is_crossorigin() {
    if (crossorigin === undefined) {
        crossorigin = false;
        try {
            if (typeof window !== 'undefined' && window.parent) {
                void window.parent.document;
            }
        }
        catch (error) {
            crossorigin = true;
        }
    }
    return crossorigin;
}
function add_resize_listener(node, fn) {
    const computed_style = getComputedStyle(node);
    if (computed_style.position === 'static') {
        node.style.position = 'relative';
    }
    const iframe = element('iframe');
    iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
        'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    const crossorigin = is_crossorigin();
    let unsubscribe;
    if (crossorigin) {
        iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
        unsubscribe = listen(window, 'message', (event) => {
            if (event.source === iframe.contentWindow)
                fn();
        });
    }
    else {
        iframe.src = 'about:blank';
        iframe.onload = () => {
            unsubscribe = listen(iframe.contentWindow, 'resize', fn);
        };
    }
    append(node, iframe);
    return () => {
        if (crossorigin) {
            unsubscribe();
        }
        else if (unsubscribe && iframe.contentWindow) {
            unsubscribe();
        }
        detach(iframe);
    };
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, bubbles, cancelable, detail);
    return e;
}
function query_selector_all(selector, parent = document.body) {
    return Array.from(parent.querySelectorAll(selector));
}
function head_selector(nodeId, head) {
    const result = [];
    let started = 0;
    for (const node of head.childNodes) {
        if (node.nodeType === 8 /* comment node */) {
            const comment = node.textContent.trim();
            if (comment === `HEAD_${nodeId}_END`) {
                started -= 1;
                result.push(node);
            }
            else if (comment === `HEAD_${nodeId}_START`) {
                started += 1;
                result.push(node);
            }
        }
        else if (started > 0) {
            result.push(node);
        }
    }
    return result;
}
class HtmlTag {
    constructor(is_svg = false) {
        this.is_svg = false;
        this.is_svg = is_svg;
        this.e = this.n = null;
    }
    c(html) {
        this.h(html);
    }
    m(html, target, anchor = null) {
        if (!this.e) {
            if (this.is_svg)
                this.e = svg_element(target.nodeName);
            else
                this.e = element(target.nodeName);
            this.t = target;
            this.c(html);
        }
        this.i(anchor);
    }
    h(html) {
        this.e.innerHTML = html;
        this.n = Array.from(this.e.childNodes);
    }
    i(anchor) {
        for (let i = 0; i < this.n.length; i += 1) {
            insert(this.t, this.n[i], anchor);
        }
    }
    p(html) {
        this.d();
        this.h(html);
        this.i(this.a);
    }
    d() {
        this.n.forEach(detach);
    }
}
class HtmlTagHydration extends HtmlTag {
    constructor(claimed_nodes, is_svg = false) {
        super(is_svg);
        this.e = this.n = null;
        this.l = claimed_nodes;
    }
    c(html) {
        if (this.l) {
            this.n = this.l;
        }
        else {
            super.c(html);
        }
    }
    i(anchor) {
        for (let i = 0; i < this.n.length; i += 1) {
            insert_hydration(this.t, this.n[i], anchor);
        }
    }
}
function attribute_to_object(attributes) {
    const result = {};
    for (const attribute of attributes) {
        result[attribute.name] = attribute.value;
    }
    return result;
}
function get_custom_elements_slots(element) {
    const result = {};
    element.childNodes.forEach((node) => {
        result[node.slot || 'default'] = true;
    });
    return result;
}
function construct_svelte_component(component, props) {
    return new component(props);
}

// we need to store the information for multiple documents because a Svelte application could also contain iframes
// https://github.com/sveltejs/svelte/issues/3624
const managed_styles = new Map();
let active = 0;
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_style_information(doc, node) {
    const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
    managed_styles.set(doc, info);
    return info;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    const doc = get_root_for_style(node);
    const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
    if (!rules[name]) {
        rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    const previous = (node.style.animation || '').split(', ');
    const next = previous.filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    );
    const deleted = previous.length - next.length;
    if (deleted) {
        node.style.animation = next.join(', ');
        active -= deleted;
        if (!active)
            clear_rules();
    }
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        managed_styles.forEach(info => {
            const { ownerNode } = info.stylesheet;
            // there is no ownerNode if it runs on jsdom.
            if (ownerNode)
                detach(ownerNode);
        });
        managed_styles.clear();
    });
}

function create_animation(node, from, fn, params) {
    if (!from)
        return noop;
    const to = node.getBoundingClientRect();
    if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
        return noop;
    const { delay = 0, duration = 300, easing = identity, 
    // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
    start: start_time = now() + delay, 
    // @ts-ignore todo:
    end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
    let running = true;
    let started = false;
    let name;
    function start() {
        if (css) {
            name = create_rule(node, 0, 1, duration, delay, easing, css);
        }
        if (!delay) {
            started = true;
        }
    }
    function stop() {
        if (css)
            delete_rule(node, name);
        running = false;
    }
    loop(now => {
        if (!started && now >= start_time) {
            started = true;
        }
        if (started && now >= end) {
            tick(1, 0);
            stop();
        }
        if (!running) {
            return false;
        }
        if (started) {
            const p = now - start_time;
            const t = 0 + 1 * easing(p / duration);
            tick(t, 1 - t);
        }
        return true;
    });
    start();
    tick(0, 1);
    return stop;
}
function fix_position(node) {
    const style = getComputedStyle(node);
    if (style.position !== 'absolute' && style.position !== 'fixed') {
        const { width, height } = style;
        const a = node.getBoundingClientRect();
        node.style.position = 'absolute';
        node.style.width = width;
        node.style.height = height;
        add_transform(node, a);
    }
}
function add_transform(node, a) {
    const b = node.getBoundingClientRect();
    if (a.left !== b.left || a.top !== b.top) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
    }
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
/**
 * Schedules a callback to run immediately before the component is updated after any state change.
 *
 * The first time the callback runs will be before the initial `onMount`
 *
 * https://svelte.dev/docs#run-time-svelte-beforeupdate
 */
function beforeUpdate(fn) {
    get_current_component().$$.before_update.push(fn);
}
/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs#run-time-svelte-onmount
 */
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
/**
 * Schedules a callback to run immediately after the component has been updated.
 *
 * The first time the callback runs will be after the initial `onMount`
 */
function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
}
/**
 * Schedules a callback to run immediately before the component is unmounted.
 *
 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
 * only one that runs inside a server-side component.
 *
 * https://svelte.dev/docs#run-time-svelte-ondestroy
 */
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
/**
 * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
 *
 * Component events created with `createEventDispatcher` create a
 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
 * property and can contain any type of data.
 *
 * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
 */
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail, { cancelable = false } = {}) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail, { cancelable });
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
            return !event.defaultPrevented;
        }
        return true;
    };
}
/**
 * Associates an arbitrary `context` object with the current component and the specified `key`
 * and returns that object. The context is then available to children of the component
 * (including slotted content) with `getContext`.
 *
 * Like lifecycle functions, this must be called during component initialisation.
 *
 * https://svelte.dev/docs#run-time-svelte-setcontext
 */
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
    return context;
}
/**
 * Retrieves the context that belongs to the closest parent component with the specified `key`.
 * Must be called during component initialisation.
 *
 * https://svelte.dev/docs#run-time-svelte-getcontext
 */
function getContext(key) {
    return get_current_component().$$.context.get(key);
}
/**
 * Retrieves the whole context map that belongs to the closest parent component.
 * Must be called during component initialisation. Useful, for example, if you
 * programmatically create a component and want to pass the existing context to it.
 *
 * https://svelte.dev/docs#run-time-svelte-getallcontexts
 */
function getAllContexts() {
    return get_current_component().$$.context;
}
/**
 * Checks whether a given `key` has been set in the context of a parent component.
 * Must be called during component initialisation.
 *
 * https://svelte.dev/docs#run-time-svelte-hascontext
 */
function hasContext(key) {
    return get_current_component().$$.context.has(key);
}
// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
        // @ts-ignore
        callbacks.slice().forEach(fn => fn.call(this, event));
    }
}

const dirty_components = [];
const intros = { enabled: false };
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function tick() {
    schedule_update();
    return resolved_promise;
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function add_flush_callback(fn) {
    flush_callbacks.push(fn);
}
// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();
let flushidx = 0; // Do *not* move this inside the flush() function
function flush() {
    const saved_component = current_component;
    do {
        // first, call beforeUpdate functions
        // and update components
        while (flushidx < dirty_components.length) {
            const component = dirty_components[flushidx];
            flushidx++;
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        flushidx = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
    else if (callback) {
        callback();
    }
}
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
    let config = fn(node, params);
    let running = false;
    let animation_name;
    let task;
    let uid = 0;
    function cleanup() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
        tick(0, 1);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        if (task)
            task.abort();
        running = true;
        add_render_callback(() => dispatch(node, true, 'start'));
        task = loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(1, 0);
                    dispatch(node, true, 'end');
                    cleanup();
                    return running = false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(t, 1 - t);
                }
            }
            return running;
        });
    }
    let started = false;
    return {
        start() {
            if (started)
                return;
            started = true;
            delete_rule(node);
            if (is_function(config)) {
                config = config();
                wait().then(go);
            }
            else {
                go();
            }
        },
        invalidate() {
            started = false;
        },
        end() {
            if (running) {
                cleanup();
                running = false;
            }
        }
    };
}
function create_out_transition(node, fn, params) {
    let config = fn(node, params);
    let running = true;
    let animation_name;
    const group = outros;
    group.r += 1;
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        add_render_callback(() => dispatch(node, false, 'start'));
        loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(0, 1);
                    dispatch(node, false, 'end');
                    if (!--group.r) {
                        // this will result in `end()` being called,
                        // so we don't need to clean up here
                        run_all(group.c);
                    }
                    return false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(1 - t, t);
                }
            }
            return running;
        });
    }
    if (is_function(config)) {
        wait().then(() => {
            // @ts-ignore
            config = config();
            go();
        });
    }
    else {
        go();
    }
    return {
        end(reset) {
            if (reset && config.tick) {
                config.tick(1, 0);
            }
            if (running) {
                if (animation_name)
                    delete_rule(node, animation_name);
                running = false;
            }
        }
    };
}
function create_bidirectional_transition(node, fn, params, intro) {
    let config = fn(node, params);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    function clear_animation() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function init(program, duration) {
        const d = (program.b - t);
        duration *= Math.abs(d);
        return {
            a: t,
            b: program.b,
            d,
            duration,
            start: program.start,
            end: program.start + duration,
            group: program.group
        };
    }
    function go(b) {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        const program = {
            start: now() + delay,
            b
        };
        if (!b) {
            // @ts-ignore todo: improve typings
            program.group = outros;
            outros.r += 1;
        }
        if (running_program || pending_program) {
            pending_program = program;
        }
        else {
            // if this is an intro, and there's a delay, we need to do
            // an initial tick and/or apply CSS animation immediately
            if (css) {
                clear_animation();
                animation_name = create_rule(node, t, b, duration, delay, easing, css);
            }
            if (b)
                tick(0, 1);
            running_program = init(program, duration);
            add_render_callback(() => dispatch(node, b, 'start'));
            loop(now => {
                if (pending_program && now > pending_program.start) {
                    running_program = init(pending_program, duration);
                    pending_program = null;
                    dispatch(node, running_program.b, 'start');
                    if (css) {
                        clear_animation();
                        animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                    }
                }
                if (running_program) {
                    if (now >= running_program.end) {
                        tick(t = running_program.b, 1 - t);
                        dispatch(node, running_program.b, 'end');
                        if (!pending_program) {
                            // we're done
                            if (running_program.b) {
                                // intro — we can tidy up immediately
                                clear_animation();
                            }
                            else {
                                // outro — needs to be coordinated
                                if (!--running_program.group.r)
                                    run_all(running_program.group.c);
                            }
                        }
                        running_program = null;
                    }
                    else if (now >= running_program.start) {
                        const p = now - running_program.start;
                        t = running_program.a + running_program.d * easing(p / running_program.duration);
                        tick(t, 1 - t);
                    }
                }
                return !!(running_program || pending_program);
            });
        }
    }
    return {
        run(b) {
            if (is_function(config)) {
                wait().then(() => {
                    // @ts-ignore
                    config = config();
                    go(b);
                });
            }
            else {
                go(b);
            }
        },
        end() {
            clear_animation();
            running_program = pending_program = null;
        }
    };
}

function handle_promise(promise, info) {
    const token = info.token = {};
    function update(type, index, key, value) {
        if (info.token !== token)
            return;
        info.resolved = value;
        let child_ctx = info.ctx;
        if (key !== undefined) {
            child_ctx = child_ctx.slice();
            child_ctx[key] = value;
        }
        const block = type && (info.current = type)(child_ctx);
        let needs_flush = false;
        if (info.block) {
            if (info.blocks) {
                info.blocks.forEach((block, i) => {
                    if (i !== index && block) {
                        group_outros();
                        transition_out(block, 1, 1, () => {
                            if (info.blocks[i] === block) {
                                info.blocks[i] = null;
                            }
                        });
                        check_outros();
                    }
                });
            }
            else {
                info.block.d(1);
            }
            block.c();
            transition_in(block, 1);
            block.m(info.mount(), info.anchor);
            needs_flush = true;
        }
        info.block = block;
        if (info.blocks)
            info.blocks[index] = block;
        if (needs_flush) {
            flush();
        }
    }
    if (is_promise(promise)) {
        const current_component = get_current_component();
        promise.then(value => {
            set_current_component(current_component);
            update(info.then, 1, info.value, value);
            set_current_component(null);
        }, error => {
            set_current_component(current_component);
            update(info.catch, 2, info.error, error);
            set_current_component(null);
            if (!info.hasCatch) {
                throw error;
            }
        });
        // if we previously had a then/catch block, destroy it
        if (info.current !== info.pending) {
            update(info.pending, 0);
            return true;
        }
    }
    else {
        if (info.current !== info.then) {
            update(info.then, 1, info.value, promise);
            return true;
        }
        info.resolved = promise;
    }
}
function update_await_block_branch(info, ctx, dirty) {
    const child_ctx = ctx.slice();
    const { resolved } = info;
    if (info.current === info.then) {
        child_ctx[info.value] = resolved;
    }
    if (info.current === info.catch) {
        child_ctx[info.error] = resolved;
    }
    info.block.p(child_ctx, dirty);
}

const globals = (typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
        ? globalThis
        : global);

function destroy_block(block, lookup) {
    block.d(1);
    lookup.delete(block.key);
}
function outro_and_destroy_block(block, lookup) {
    transition_out(block, 1, 1, () => {
        lookup.delete(block.key);
    });
}
function fix_and_destroy_block(block, lookup) {
    block.f();
    destroy_block(block, lookup);
}
function fix_and_outro_and_destroy_block(block, lookup) {
    block.f();
    outro_and_destroy_block(block, lookup);
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--)
        old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = new Map();
    const deltas = new Map();
    i = n;
    while (i--) {
        const child_ctx = get_context(ctx, list, i);
        const key = get_key(child_ctx);
        let block = lookup.get(key);
        if (!block) {
            block = create_each_block(key, child_ctx);
            block.c();
        }
        else if (dynamic) {
            block.p(child_ctx, dirty);
        }
        new_lookup.set(key, new_blocks[i] = block);
        if (key in old_indexes)
            deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = new Set();
    const did_move = new Set();
    function insert(block) {
        transition_in(block, 1);
        block.m(node, next);
        lookup.set(block.key, block);
        next = block.first;
        n--;
    }
    while (o && n) {
        const new_block = new_blocks[n - 1];
        const old_block = old_blocks[o - 1];
        const new_key = new_block.key;
        const old_key = old_block.key;
        if (new_block === old_block) {
            // do nothing
            next = new_block.first;
            o--;
            n--;
        }
        else if (!new_lookup.has(old_key)) {
            // remove old block
            destroy(old_block, lookup);
            o--;
        }
        else if (!lookup.has(new_key) || will_move.has(new_key)) {
            insert(new_block);
        }
        else if (did_move.has(old_key)) {
            o--;
        }
        else if (deltas.get(new_key) > deltas.get(old_key)) {
            did_move.add(new_key);
            insert(new_block);
        }
        else {
            will_move.add(old_key);
            o--;
        }
    }
    while (o--) {
        const old_block = old_blocks[o];
        if (!new_lookup.has(old_block.key))
            destroy(old_block, lookup);
    }
    while (n)
        insert(new_blocks[n - 1]);
    return new_blocks;
}
function validate_each_keys(ctx, list, get_context, get_key) {
    const keys = new Set();
    for (let i = 0; i < list.length; i++) {
        const key = get_key(get_context(ctx, list, i));
        if (keys.has(key)) {
            throw new Error('Cannot have duplicate keys in a keyed each');
        }
        keys.add(key);
    }
}

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}

// source: https://html.spec.whatwg.org/multipage/indices.html
const boolean_attributes = new Set([
    'allowfullscreen',
    'allowpaymentrequest',
    'async',
    'autofocus',
    'autoplay',
    'checked',
    'controls',
    'default',
    'defer',
    'disabled',
    'formnovalidate',
    'hidden',
    'inert',
    'ismap',
    'itemscope',
    'loop',
    'multiple',
    'muted',
    'nomodule',
    'novalidate',
    'open',
    'playsinline',
    'readonly',
    'required',
    'reversed',
    'selected'
]);

/** regex of all html void element names */
const void_element_names = /^(?:area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;
function is_void(name) {
    return void_element_names.test(name) || name.toLowerCase() === '!doctype';
}

const invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
// https://infra.spec.whatwg.org/#noncharacter
function spread(args, attrs_to_add) {
    const attributes = Object.assign({}, ...args);
    if (attrs_to_add) {
        const classes_to_add = attrs_to_add.classes;
        const styles_to_add = attrs_to_add.styles;
        if (classes_to_add) {
            if (attributes.class == null) {
                attributes.class = classes_to_add;
            }
            else {
                attributes.class += ' ' + classes_to_add;
            }
        }
        if (styles_to_add) {
            if (attributes.style == null) {
                attributes.style = style_object_to_string(styles_to_add);
            }
            else {
                attributes.style = style_object_to_string(merge_ssr_styles(attributes.style, styles_to_add));
            }
        }
    }
    let str = '';
    Object.keys(attributes).forEach(name => {
        if (invalid_attribute_name_character.test(name))
            return;
        const value = attributes[name];
        if (value === true)
            str += ' ' + name;
        else if (boolean_attributes.has(name.toLowerCase())) {
            if (value)
                str += ' ' + name;
        }
        else if (value != null) {
            str += ` ${name}="${value}"`;
        }
    });
    return str;
}
function merge_ssr_styles(style_attribute, style_directive) {
    const style_object = {};
    for (const individual_style of style_attribute.split(';')) {
        const colon_index = individual_style.indexOf(':');
        const name = individual_style.slice(0, colon_index).trim();
        const value = individual_style.slice(colon_index + 1).trim();
        if (!name)
            continue;
        style_object[name] = value;
    }
    for (const name in style_directive) {
        const value = style_directive[name];
        if (value) {
            style_object[name] = value;
        }
        else {
            delete style_object[name];
        }
    }
    return style_object;
}
const ATTR_REGEX = /[&"]/g;
const CONTENT_REGEX = /[&<]/g;
/**
 * Note: this method is performance sensitive and has been optimized
 * https://github.com/sveltejs/svelte/pull/5701
 */
function escape(value, is_attr = false) {
    const str = String(value);
    const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
    pattern.lastIndex = 0;
    let escaped = '';
    let last = 0;
    while (pattern.test(str)) {
        const i = pattern.lastIndex - 1;
        const ch = str[i];
        escaped += str.substring(last, i) + (ch === '&' ? '&amp;' : (ch === '"' ? '&quot;' : '&lt;'));
        last = i + 1;
    }
    return escaped + str.substring(last);
}
function escape_attribute_value(value) {
    // keep booleans, null, and undefined for the sake of `spread`
    const should_escape = typeof value === 'string' || (value && typeof value === 'object');
    return should_escape ? escape(value, true) : value;
}
function escape_object(obj) {
    const result = {};
    for (const key in obj) {
        result[key] = escape_attribute_value(obj[key]);
    }
    return result;
}
function each(items, fn) {
    let str = '';
    for (let i = 0; i < items.length; i += 1) {
        str += fn(items[i], i);
    }
    return str;
}
const missing_component = {
    $$render: () => ''
};
function validate_component(component, name) {
    if (!component || !component.$$render) {
        if (name === 'svelte:component')
            name += ' this={...}';
        throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules. Otherwise you may need to fix a <${name}>.`);
    }
    return component;
}
function debug(file, line, column, values) {
    console.log(`{@debug} ${file ? file + ' ' : ''}(${line}:${column})`); // eslint-disable-line no-console
    console.log(values); // eslint-disable-line no-console
    return '';
}
let on_destroy;
function create_ssr_component(fn) {
    function $$render(result, props, bindings, slots, context) {
        const parent_component = current_component;
        const $$ = {
            on_destroy,
            context: new Map(context || (parent_component ? parent_component.$$.context : [])),
            // these will be immediately discarded
            on_mount: [],
            before_update: [],
            after_update: [],
            callbacks: blank_object()
        };
        set_current_component({ $$ });
        const html = fn(result, props, bindings, slots);
        set_current_component(parent_component);
        return html;
    }
    return {
        render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
            on_destroy = [];
            const result = { title: '', head: '', css: new Set() };
            const html = $$render(result, props, {}, $$slots, context);
            run_all(on_destroy);
            return {
                html,
                css: {
                    code: Array.from(result.css).map(css => css.code).join('\n'),
                    map: null // TODO
                },
                head: result.title + result.head
            };
        },
        $$render
    };
}
function add_attribute(name, value, boolean) {
    if (value == null || (boolean && !value))
        return '';
    const assignment = (boolean && value === true) ? '' : `="${escape(value, true)}"`;
    return ` ${name}${assignment}`;
}
function add_classes(classes) {
    return classes ? ` class="${classes}"` : '';
}
function style_object_to_string(style_object) {
    return Object.keys(style_object)
        .filter(key => style_object[key])
        .map(key => `${key}: ${style_object[key]};`)
        .join(' ');
}
function add_styles(style_object) {
    const styles = style_object_to_string(style_object);
    return styles ? ` style="${styles}"` : '';
}

function bind(component, name, callback) {
    const index = component.$$.props[name];
    if (index !== undefined) {
        component.$$.bound[index] = callback;
        callback(component.$$.ctx[index]);
    }
}
function create_component(block) {
    block && block.c();
}
function claim_component(block, parent_nodes) {
    block && block.l(parent_nodes);
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
            // if the component was destroyed immediately
            // it will update the `$$.on_destroy` reference to `null`.
            // the destructured on_destroy may still reference to the old array
            if (component.$$.on_destroy) {
                component.$$.on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: [],
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false,
        root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            start_hydrating();
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        end_hydrating();
        flush();
    }
    set_current_component(parent_component);
}
let SvelteElement;
if (typeof HTMLElement === 'function') {
    SvelteElement = class extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }
        connectedCallback() {
            const { on_mount } = this.$$;
            this.$$.on_disconnect = on_mount.map(run).filter(is_function);
            // @ts-ignore todo: improve typings
            for (const key in this.$$.slotted) {
                // @ts-ignore todo: improve typings
                this.appendChild(this.$$.slotted[key]);
            }
        }
        attributeChangedCallback(attr, _oldValue, newValue) {
            this[attr] = newValue;
        }
        disconnectedCallback() {
            run_all(this.$$.on_disconnect);
        }
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            // TODO should this delegate to addEventListener?
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    };
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        if (!is_function(callback)) {
            return noop;
        }
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, Object.assign({ version: '3.52.0' }, detail), { bubbles: true }));
}
function append_dev(target, node) {
    dispatch_dev('SvelteDOMInsert', { target, node });
    append(target, node);
}
function append_hydration_dev(target, node) {
    dispatch_dev('SvelteDOMInsert', { target, node });
    append_hydration(target, node);
}
function insert_dev(target, node, anchor) {
    dispatch_dev('SvelteDOMInsert', { target, node, anchor });
    insert(target, node, anchor);
}
function insert_hydration_dev(target, node, anchor) {
    dispatch_dev('SvelteDOMInsert', { target, node, anchor });
    insert_hydration(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev('SvelteDOMRemove', { node });
    detach(node);
}
function detach_between_dev(before, after) {
    while (before.nextSibling && before.nextSibling !== after) {
        detach_dev(before.nextSibling);
    }
}
function detach_before_dev(after) {
    while (after.previousSibling) {
        detach_dev(after.previousSibling);
    }
}
function detach_after_dev(before) {
    while (before.nextSibling) {
        detach_dev(before.nextSibling);
    }
}
function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
    const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
    if (has_prevent_default)
        modifiers.push('preventDefault');
    if (has_stop_propagation)
        modifiers.push('stopPropagation');
    dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
    const dispose = listen(node, event, handler, options);
    return () => {
        dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
        dispose();
    };
}
function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
        dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
    else
        dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
}
function prop_dev(node, property, value) {
    node[property] = value;
    dispatch_dev('SvelteDOMSetProperty', { node, property, value });
}
function dataset_dev(node, property, value) {
    node.dataset[property] = value;
    dispatch_dev('SvelteDOMSetDataset', { node, property, value });
}
function set_data_dev(text, data) {
    data = '' + data;
    if (text.wholeText === data)
        return;
    dispatch_dev('SvelteDOMSetData', { node: text, data });
    text.data = data;
}
function validate_each_argument(arg) {
    if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
        let msg = '{#each} only iterates over array-like objects.';
        if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
            msg += ' You can use a spread to convert this iterable into an array.';
        }
        throw new Error(msg);
    }
}
function validate_slots(name, slot, keys) {
    for (const slot_key of Object.keys(slot)) {
        if (!~keys.indexOf(slot_key)) {
            console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
        }
    }
}
function validate_dynamic_element(tag) {
    const is_string = typeof tag === 'string';
    if (tag && !is_string) {
        throw new Error('<svelte:element> expects "this" attribute to be a string.');
    }
}
function validate_void_dynamic_element(tag) {
    if (tag && is_void(tag)) {
        console.warn(`<svelte:element this="${tag}"> is self-closing and cannot have content.`);
    }
}
function construct_svelte_component_dev(component, props) {
    const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
    try {
        const instance = new component(props);
        if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
            throw new Error(error_message);
        }
        return instance;
    }
    catch (err) {
        const { message } = err;
        if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
            throw new Error(error_message);
        }
        else {
            throw err;
        }
    }
}
/**
 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
 */
class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
        if (!options || (!options.target && !options.$$inline)) {
            throw new Error("'target' is a required option");
        }
        super();
    }
    $destroy() {
        super.$destroy();
        this.$destroy = () => {
            console.warn('Component was already destroyed'); // eslint-disable-line no-console
        };
    }
    $capture_state() { }
    $inject_state() { }
}
/**
 * Base class to create strongly typed Svelte components.
 * This only exists for typing purposes and should be used in `.d.ts` files.
 *
 * ### Example:
 *
 * You have component library on npm called `component-library`, from which
 * you export a component called `MyComponent`. For Svelte+TypeScript users,
 * you want to provide typings. Therefore you create a `index.d.ts`:
 * ```ts
 * import { SvelteComponentTyped } from "svelte";
 * export class MyComponent extends SvelteComponentTyped<{foo: string}> {}
 * ```
 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
 * to provide intellisense and to use the component like this in a Svelte file
 * with TypeScript:
 * ```svelte
 * <script lang="ts">
 * 	import { MyComponent } from "component-library";
 * </script>
 * <MyComponent foo={'bar'} />
 * ```
 *
 * #### Why not make this part of `SvelteComponent(Dev)`?
 * Because
 * ```ts
 * class ASubclassOfSvelteComponent extends SvelteComponent<{foo: string}> {}
 * const component: typeof SvelteComponent = ASubclassOfSvelteComponent;
 * ```
 * will throw a type error, so we need to separate the more strictly typed class.
 */
class SvelteComponentTyped extends SvelteComponentDev {
    constructor(options) {
        super(options);
    }
}
function loop_guard(timeout) {
    const start = Date.now();
    return () => {
        if (Date.now() - start > timeout) {
            throw new Error('Infinite loop detected');
        }
    };
}




/***/ }),

/***/ "./node_modules/svelte/store/index.mjs":
/*!*********************************************!*\
  !*** ./node_modules/svelte/store/index.mjs ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "derived": () => (/* binding */ derived),
/* harmony export */   "get": () => (/* reexport safe */ _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.get_store_value),
/* harmony export */   "readable": () => (/* binding */ readable),
/* harmony export */   "writable": () => (/* binding */ writable)
/* harmony export */ });
/* harmony import */ var _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../internal/index.mjs */ "./node_modules/svelte/internal/index.mjs");



const subscriber_queue = [];
/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
function readable(value, start) {
    return {
        subscribe: writable(value, start).subscribe
    };
}
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.noop) {
    let stop;
    const subscribers = new Set();
    function set(new_value) {
        if ((0,_internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.safe_not_equal)(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (const subscriber of subscribers) {
                    subscriber[1]();
                    subscriber_queue.push(subscriber, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.noop) {
        const subscriber = [run, invalidate];
        subscribers.add(subscriber);
        if (subscribers.size === 1) {
            stop = start(set) || _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.noop;
        }
        run(value);
        return () => {
            subscribers.delete(subscriber);
            if (subscribers.size === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}
function derived(stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single
        ? [stores]
        : stores;
    const auto = fn.length < 2;
    return readable(initial_value, (set) => {
        let inited = false;
        const values = [];
        let pending = 0;
        let cleanup = _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.noop;
        const sync = () => {
            if (pending) {
                return;
            }
            cleanup();
            const result = fn(single ? values[0] : values, set);
            if (auto) {
                set(result);
            }
            else {
                cleanup = (0,_internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.is_function)(result) ? result : _internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.noop;
            }
        };
        const unsubscribers = stores_array.map((store, i) => (0,_internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.subscribe)(store, (value) => {
            values[i] = value;
            pending &= ~(1 << i);
            if (inited) {
                sync();
            }
        }, () => {
            pending |= (1 << i);
        }));
        inited = true;
        sync();
        return function stop() {
            (0,_internal_index_mjs__WEBPACK_IMPORTED_MODULE_0__.run_all)(unsubscribers);
            cleanup();
        };
    });
}




/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/harmony module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.hmd = (module) => {
/******/ 			module = Object.create(module);
/******/ 			if (!module.children) module.children = [];
/******/ 			Object.defineProperty(module, 'exports', {
/******/ 				enumerable: true,
/******/ 				set: () => {
/******/ 					throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
/******/ 				}
/******/ 			});
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _App_svelte__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./App.svelte */ "./src/App.svelte");
/* harmony import */ var _index_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.css */ "./src/index.css");
//@ts-ignore


const app = new _App_svelte__WEBPACK_IMPORTED_MODULE_0__["default"]({
    target: document.getElementById('app')
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (app);

})();

/******/ })()
;