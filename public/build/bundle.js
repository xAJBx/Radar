
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    const has_prop = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
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
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

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
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.28.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
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
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

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
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
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
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
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
            let cleanup = noop;
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
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
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
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.28.0 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(10, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(9, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(8, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 256) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 1536) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [routes, location, base, basepath, url, $$scope, slots];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.28.0 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 2,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[1],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 530) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[1],
    		/*routeProps*/ ctx[2]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 22)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 2 && get_spread_object(/*routeParams*/ ctx[1]),
    					dirty & /*routeProps*/ 4 && get_spread_object(/*routeProps*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(3, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(1, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(2, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 8) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(1, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(2, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.28.0 */
    const file = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$2(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(14, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(15, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	const writable_props = ["to", "replace", "state", "getProps"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		$base,
    		$location,
    		ariaCurrent
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(12, isPartiallyCurrent = $$props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(13, isCurrent = $$props.isCurrent);
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$props.ariaCurrent);
    	};

    	let ariaCurrent;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 16448) {
    			 $$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 32769) {
    			 $$invalidate(12, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 32769) {
    			 $$invalidate(13, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 8192) {
    			 $$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 45569) {
    			 $$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		to,
    		replace,
    		state,
    		getProps,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { to: 6, replace: 7, state: 8, getProps: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var frappeCharts_min_cjs = createCommonjsModule(function (module, exports) {
    function styleInject(t,e){void 0===e&&(e={});var n=e.insertAt;if(t&&"undefined"!=typeof document){var i=document.head||document.getElementsByTagName("head")[0],a=document.createElement("style");a.type="text/css","top"===n&&i.firstChild?i.insertBefore(a,i.firstChild):i.appendChild(a),a.styleSheet?a.styleSheet.cssText=t:a.appendChild(document.createTextNode(t));}}function $(t,e){return "string"==typeof t?(e||document).querySelector(t):t||null}function getOffset(t){var e=t.getBoundingClientRect();return {top:e.top+(document.documentElement.scrollTop||document.body.scrollTop),left:e.left+(document.documentElement.scrollLeft||document.body.scrollLeft)}}function isHidden(t){return null===t.offsetParent}function isElementInViewport(t){var e=t.getBoundingClientRect();return e.top>=0&&e.left>=0&&e.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&e.right<=(window.innerWidth||document.documentElement.clientWidth)}function getElementContentWidth(t){var e=window.getComputedStyle(t),n=parseFloat(e.paddingLeft)+parseFloat(e.paddingRight);return t.clientWidth-n}function fire(t,e,n){var i=document.createEvent("HTMLEvents");i.initEvent(e,!0,!0);for(var a in n)i[a]=n[a];return t.dispatchEvent(i)}function getTopOffset(t){return t.titleHeight+t.margins.top+t.paddings.top}function getLeftOffset(t){return t.margins.left+t.paddings.left}function getExtraHeight(t){return t.margins.top+t.margins.bottom+t.paddings.top+t.paddings.bottom+t.titleHeight+t.legendHeight}function getExtraWidth(t){return t.margins.left+t.margins.right+t.paddings.left+t.paddings.right}function _classCallCheck$4(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function floatTwo(t){return parseFloat(t.toFixed(2))}function fillArray(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]&&arguments[3];n||(n=i?t[0]:t[t.length-1]);var a=new Array(Math.abs(e)).fill(n);return t=i?a.concat(t):t.concat(a)}function getStringWidth(t,e){return (t+"").length*e}function getPositionByAngle(t,e){return {x:Math.sin(t*ANGLE_RATIO)*e,y:Math.cos(t*ANGLE_RATIO)*e}}function isValidNumber(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return !Number.isNaN(t)&&(void 0!==t&&(!!Number.isFinite(t)&&!(e&&t<0)))}function round(t){return Number(Math.round(t+"e4")+"e-4")}function getBarHeightAndYAttr(t,e){var n=void 0,i=void 0;return t<=e?(n=e-t,i=t):(n=t-e,i=e),[n,i]}function equilizeNoOfElements(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e.length-t.length;return n>0?t=fillArray(t,n):e=fillArray(e,n),[t,e]}function truncateString(t,e){if(t)return t.length>e?t.slice(0,e-3)+"...":t}function shortenLargeNumber(t){var e=void 0;if("number"==typeof t)e=t;else if("string"==typeof t&&(e=Number(t),Number.isNaN(e)))return t;var n=Math.floor(Math.log10(Math.abs(e)));if(n<=2)return e;var i=Math.floor(n/3),a=Math.pow(10,n-3*i)*+(e/Math.pow(10,n)).toFixed(1);return Math.round(100*a)/100+" "+["","K","M","B","T"][i]}function getSplineCurvePointsStr(t,e){for(var n=[],i=0;i<t.length;i++)n.push([t[i],e[i]]);var a=function(t,e){var n=e[0]-t[0],i=e[1]-t[1];return {length:Math.sqrt(Math.pow(n,2)+Math.pow(i,2)),angle:Math.atan2(i,n)}},r=function(t,e,n,i){var r=a(e||t,n||t),s=r.angle+(i?Math.PI:0),o=.2*r.length;return [t[0]+Math.cos(s)*o,t[1]+Math.sin(s)*o]};return function(t,e){return t.reduce(function(t,n,i,a){return 0===i?n[0]+","+n[1]:t+" "+e(n,i,a)},"")}(n,function(t,e,n){var i=r(n[e-1],n[e-2],t),a=r(t,n[e-1],n[e+1],!0);return "C "+i[0]+","+i[1]+" "+a[0]+","+a[1]+" "+t[0]+","+t[1]})}function limitColor(t){return t>255?255:t<0?0:t}function lightenDarkenColor(t,e){var n=getColor(t),i=!1;"#"==n[0]&&(n=n.slice(1),i=!0);var a=parseInt(n,16),r=limitColor((a>>16)+e),s=limitColor((a>>8&255)+e),o=limitColor((255&a)+e);return (i?"#":"")+(o|s<<8|r<<16).toString(16)}function isValidColor(t){var e=/(^\s*)(rgb|hsl)(a?)[(]\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*(?:,\s*([\d.]+)\s*)?[)]$/i;return /(^\s*)(#)((?:[A-Fa-f0-9]{3}){1,2})$/i.test(t)||e.test(t)}function $$1(t,e){return "string"==typeof t?(e||document).querySelector(t):t||null}function createSVG(t,e){var n=document.createElementNS("http://www.w3.org/2000/svg",t);for(var i in e){var a=e[i];if("inside"===i)$$1(a).appendChild(n);else if("around"===i){var r=$$1(a);r.parentNode.insertBefore(n,r),n.appendChild(r);}else "styles"===i?"object"===(void 0===a?"undefined":_typeof$1(a))&&Object.keys(a).map(function(t){n.style[t]=a[t];}):("className"===i&&(i="class"),"innerHTML"===i?n.textContent=a:n.setAttribute(i,a));}return n}function renderVerticalGradient(t,e){return createSVG("linearGradient",{inside:t,id:e,x1:0,x2:0,y1:0,y2:1})}function setGradientStop(t,e,n,i){return createSVG("stop",{inside:t,style:"stop-color: "+n,offset:e,"stop-opacity":i})}function makeSVGContainer(t,e,n,i){return createSVG("svg",{className:e,inside:t,width:n,height:i})}function makeSVGDefs(t){return createSVG("defs",{inside:t})}function makeSVGGroup(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:void 0,i={className:t,transform:e};return n&&(i.inside=n),createSVG("g",i)}function makePath(t){return createSVG("path",{className:arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",d:t,styles:{stroke:arguments.length>2&&void 0!==arguments[2]?arguments[2]:"none",fill:arguments.length>3&&void 0!==arguments[3]?arguments[3]:"none","stroke-width":arguments.length>4&&void 0!==arguments[4]?arguments[4]:2}})}function makeArcPathStr(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:1,r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,s=n.x+t.x,o=n.y+t.y,l=n.x+e.x,u=n.y+e.y;return "M"+n.x+" "+n.y+"\n\t\tL"+s+" "+o+"\n\t\tA "+i+" "+i+" 0 "+r+" "+(a?1:0)+"\n\t\t"+l+" "+u+" z"}function makeCircleStr(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:1,r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,s=n.x+t.x,o=n.y+t.y,l=n.x+e.x,u=2*n.y,c=n.y+e.y;return "M"+n.x+" "+n.y+"\n\t\tL"+s+" "+o+"\n\t\tA "+i+" "+i+" 0 "+r+" "+(a?1:0)+"\n\t\t"+l+" "+u+" z\n\t\tL"+s+" "+u+"\n\t\tA "+i+" "+i+" 0 "+r+" "+(a?1:0)+"\n\t\t"+l+" "+c+" z"}function makeArcStrokePathStr(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:1,r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,s=n.x+t.x,o=n.y+t.y,l=n.x+e.x,u=n.y+e.y;return "M"+s+" "+o+"\n\t\tA "+i+" "+i+" 0 "+r+" "+(a?1:0)+"\n\t\t"+l+" "+u}function makeStrokeCircleStr(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:1,r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,s=n.x+t.x,o=n.y+t.y,l=n.x+e.x,u=2*i+o,c=n.y+t.y;return "M"+s+" "+o+"\n\t\tA "+i+" "+i+" 0 "+r+" "+(a?1:0)+"\n\t\t"+l+" "+u+"\n\t\tM"+s+" "+u+"\n\t\tA "+i+" "+i+" 0 "+r+" "+(a?1:0)+"\n\t\t"+l+" "+c}function makeGradient(t,e){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],i="path-fill-gradient-"+e+"-"+(n?"lighter":"default"),a=renderVerticalGradient(t,i),r=[1,.6,.2];return n&&(r=[.4,.2,0]),setGradientStop(a,"0%",e,r[0]),setGradientStop(a,"50%",e,r[1]),setGradientStop(a,"100%",e,r[2]),i}function percentageBar(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:PERCENTAGE_BAR_DEFAULT_DEPTH,r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:"none";return createSVG("rect",{className:"percentage-bar",x:t,y:e,width:n,height:i,fill:r,styles:{stroke:lightenDarkenColor(r,-25),"stroke-dasharray":"0, "+(i+n)+", "+n+", "+i,"stroke-width":a}})}function heatSquare(t,e,n,i,a){var r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:"none",s=arguments.length>6&&void 0!==arguments[6]?arguments[6]:{},o={className:t,x:e,y:n,width:i,height:i,rx:a,fill:r};return Object.keys(s).map(function(t){o[t]=s[t];}),createSVG("rect",o)}function legendBar(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"none",a=arguments[4];a=arguments.length>5&&void 0!==arguments[5]&&arguments[5]?truncateString(a,LABEL_MAX_CHARS):a;var r={className:"legend-bar",x:0,y:0,width:n,height:"2px",fill:i},s=createSVG("text",{className:"legend-dataset-text",x:0,y:0,dy:2*FONT_SIZE+"px","font-size":1.2*FONT_SIZE+"px","text-anchor":"start",fill:FONT_FILL,innerHTML:a}),o=createSVG("g",{transform:"translate("+t+", "+e+")"});return o.appendChild(createSVG("rect",r)),o.appendChild(s),o}function legendDot(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"none",a=arguments[4];a=arguments.length>5&&void 0!==arguments[5]&&arguments[5]?truncateString(a,LABEL_MAX_CHARS):a;var r={className:"legend-dot",cx:0,cy:0,r:n,fill:i},s=createSVG("text",{className:"legend-dataset-text",x:0,y:0,dx:FONT_SIZE+"px",dy:FONT_SIZE/3+"px","font-size":1.2*FONT_SIZE+"px","text-anchor":"start",fill:FONT_FILL,innerHTML:a}),o=createSVG("g",{transform:"translate("+t+", "+e+")"});return o.appendChild(createSVG("circle",r)),o.appendChild(s),o}function makeText(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{},r=a.fontSize||FONT_SIZE;return createSVG("text",{className:t,x:e,y:n,dy:(void 0!==a.dy?a.dy:r/2)+"px","font-size":r+"px",fill:a.fill||FONT_FILL,"text-anchor":a.textAnchor||"start",innerHTML:i})}function makeVertLine(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{};a.stroke||(a.stroke=BASE_LINE_COLOR);var r=createSVG("line",{className:"line-vertical "+a.className,x1:0,x2:0,y1:n,y2:i,styles:{stroke:a.stroke}}),s=createSVG("text",{x:0,y:n>i?n+LABEL_MARGIN:n-LABEL_MARGIN-FONT_SIZE,dy:FONT_SIZE+"px","font-size":FONT_SIZE+"px","text-anchor":"middle",innerHTML:e+""}),o=createSVG("g",{transform:"translate("+t+", 0)"});return o.appendChild(r),o.appendChild(s),o}function makeHoriLine(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{};a.stroke||(a.stroke=BASE_LINE_COLOR),a.lineType||(a.lineType=""),a.shortenNumbers&&(e=shortenLargeNumber(e));var r=createSVG("line",{className:"line-horizontal "+a.className+("dashed"===a.lineType?"dashed":""),x1:n,x2:i,y1:0,y2:0,styles:{stroke:a.stroke}}),s=createSVG("text",{x:n<i?n-LABEL_MARGIN:n+LABEL_MARGIN,y:0,dy:FONT_SIZE/2-2+"px","font-size":FONT_SIZE+"px","text-anchor":n<i?"end":"start",innerHTML:e+""}),o=createSVG("g",{transform:"translate(0, "+t+")","stroke-opacity":1});return 0!==s&&"0"!==s||(o.style.stroke="rgba(27, 31, 35, 0.6)"),o.appendChild(r),o.appendChild(s),o}function yLine(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};isValidNumber(t)||(t=0),i.pos||(i.pos="left"),i.offset||(i.offset=0),i.mode||(i.mode="span"),i.stroke||(i.stroke=BASE_LINE_COLOR),i.className||(i.className="");var a=-1*AXIS_TICK_LENGTH,r="span"===i.mode?n+AXIS_TICK_LENGTH:0;return "tick"===i.mode&&"right"===i.pos&&(a=n+AXIS_TICK_LENGTH,r=n),a+=i.offset,r+=i.offset,makeHoriLine(t,e,a,r,{stroke:i.stroke,className:i.className,lineType:i.lineType,shortenNumbers:i.shortenNumbers})}function xLine(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};isValidNumber(t)||(t=0),i.pos||(i.pos="bottom"),i.offset||(i.offset=0),i.mode||(i.mode="span"),i.stroke||(i.stroke=BASE_LINE_COLOR),i.className||(i.className="");var a=n+AXIS_TICK_LENGTH,r="span"===i.mode?-1*AXIS_TICK_LENGTH:n;return "tick"===i.mode&&"top"===i.pos&&(a=-1*AXIS_TICK_LENGTH,r=0),makeVertLine(t,e,a,r,{stroke:i.stroke,className:i.className,lineType:i.lineType})}function yMarker(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};i.labelPos||(i.labelPos="right");var a=createSVG("text",{className:"chart-label",x:"left"===i.labelPos?LABEL_MARGIN:n-getStringWidth(e,5)-LABEL_MARGIN,y:0,dy:FONT_SIZE/-2+"px","font-size":FONT_SIZE+"px","text-anchor":"start",innerHTML:e+""}),r=makeHoriLine(t,"",0,n,{stroke:i.stroke||BASE_LINE_COLOR,className:i.className||"",lineType:i.lineType});return r.appendChild(a),r}function yRegion(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{},r=t-e,s=createSVG("rect",{className:"bar mini",styles:{fill:"rgba(228, 234, 239, 0.49)",stroke:BASE_LINE_COLOR,"stroke-dasharray":n+", "+r},x:0,y:0,width:n,height:r});a.labelPos||(a.labelPos="right");var o=createSVG("text",{className:"chart-label",x:"left"===a.labelPos?LABEL_MARGIN:n-getStringWidth(i+"",4.5)-LABEL_MARGIN,y:0,dy:FONT_SIZE/-2+"px","font-size":FONT_SIZE+"px","text-anchor":"start",innerHTML:i+""}),l=createSVG("g",{transform:"translate(0, "+e+")"});return l.appendChild(s),l.appendChild(o),l}function datasetBar(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:"",r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,s=arguments.length>6&&void 0!==arguments[6]?arguments[6]:0,o=arguments.length>7&&void 0!==arguments[7]?arguments[7]:{},l=getBarHeightAndYAttr(e,o.zeroLine),u=_slicedToArray(l,2),c=u[0],h=u[1];h-=s,0===c&&(c=o.minHeight,h-=o.minHeight),isValidNumber(t)||(t=0),isValidNumber(h)||(h=0),isValidNumber(c,!0)||(c=0),isValidNumber(n,!0)||(n=0);var d=createSVG("rect",{className:"bar mini",style:"fill: "+i,"data-point-index":r,x:t,y:h,width:n,height:c});if((a+="")||a.length){d.setAttribute("y",0),d.setAttribute("x",0);var f=createSVG("text",{className:"data-point-value",x:n/2,y:0,dy:FONT_SIZE/2*-1+"px","font-size":FONT_SIZE+"px","text-anchor":"middle",innerHTML:a}),p=createSVG("g",{"data-point-index":r,transform:"translate("+t+", "+h+")"});return p.appendChild(d),p.appendChild(f),p}return d}function datasetDot(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:"",r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,s=createSVG("circle",{style:"fill: "+i,"data-point-index":r,cx:t,cy:e,r:n});if((a+="")||a.length){s.setAttribute("cy",0),s.setAttribute("cx",0);var o=createSVG("text",{className:"data-point-value",x:0,y:0,dy:FONT_SIZE/2*-1-n+"px","font-size":FONT_SIZE+"px","text-anchor":"middle",innerHTML:a}),l=createSVG("g",{"data-point-index":r,transform:"translate("+t+", "+e+")"});return l.appendChild(s),l.appendChild(o),l}return s}function getPaths(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{},r=e.map(function(e,n){return t[n]+","+e}).join("L");i.spline&&(r=getSplineCurvePointsStr(t,e));var s=makePath("M"+r,"line-graph-path",n);if(i.heatline){var o=makeGradient(a.svgDefs,n);s.style.stroke="url(#"+o+")";}var l={path:s};if(i.regionFill){var u=makeGradient(a.svgDefs,n,!0),c="M"+t[0]+","+a.zeroLine+"L"+r+"L"+t.slice(-1)[0]+","+a.zeroLine;l.region=makePath(c,"region-fill","none","url(#"+u+")");}return l}function translate(t,e,n,i){var a="string"==typeof e?e:e.join(", ");return [t,{transform:n.join(", ")},i,STD_EASING,"translate",{transform:a}]}function translateVertLine(t,e,n){return translate(t,[n,0],[e,0],MARKER_LINE_ANIM_DUR)}function translateHoriLine(t,e,n){return translate(t,[0,n],[0,e],MARKER_LINE_ANIM_DUR)}function animateRegion(t,e,n,i){var a=e-n,r=t.childNodes[0];return [[r,{height:a,"stroke-dasharray":r.getAttribute("width")+", "+a},MARKER_LINE_ANIM_DUR,STD_EASING],translate(t,[0,i],[0,n],MARKER_LINE_ANIM_DUR)]}function animateBar(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:0,r=getBarHeightAndYAttr(n,(arguments.length>5&&void 0!==arguments[5]?arguments[5]:{}).zeroLine),s=_slicedToArray$2(r,2),o=s[0],l=s[1];return l-=a,"rect"!==t.nodeName?[[t.childNodes[0],{width:i,height:o},UNIT_ANIM_DUR,STD_EASING],translate(t,t.getAttribute("transform").split("(")[1].slice(0,-1),[e,l],MARKER_LINE_ANIM_DUR)]:[[t,{width:i,height:o,x:e,y:l},UNIT_ANIM_DUR,STD_EASING]]}function animateDot(t,e,n){return "circle"!==t.nodeName?[translate(t,t.getAttribute("transform").split("(")[1].slice(0,-1),[e,n],MARKER_LINE_ANIM_DUR)]:[[t,{cx:e,cy:n},UNIT_ANIM_DUR,STD_EASING]]}function animatePath(t,e,n,i,a){var r=[],s=n.map(function(t,n){return e[n]+","+t}).join("L");a&&(s=getSplineCurvePointsStr(e,n));var o=[t.path,{d:"M"+s},PATH_ANIM_DUR,STD_EASING];if(r.push(o),t.region){var l=e[0]+","+i+"L",u="L"+e.slice(-1)[0]+", "+i,c=[t.region,{d:"M"+l+s+u},PATH_ANIM_DUR,STD_EASING];r.push(c);}return r}function animatePathStr(t,e){return [t,{d:e},UNIT_ANIM_DUR,STD_EASING]}function _toConsumableArray$1(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function animateSVGElement(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"linear",a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:void 0,r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:{},s=t.cloneNode(!0),o=t.cloneNode(!0);for(var l in e){var u=void 0;u="transform"===l?document.createElementNS("http://www.w3.org/2000/svg","animateTransform"):document.createElementNS("http://www.w3.org/2000/svg","animate");var c=r[l]||t.getAttribute(l),h=e[l],d={attributeName:l,from:c,to:h,begin:"0s",dur:n/1e3+"s",values:c+";"+h,keySplines:EASING[i],keyTimes:"0;1",calcMode:"spline",fill:"freeze"};a&&(d.type=a);for(var f in d)u.setAttribute(f,d[f]);s.appendChild(u),a?o.setAttribute(l,"translate("+h+")"):o.setAttribute(l,h);}return [s,o]}function transform(t,e){t.style.transform=e,t.style.webkitTransform=e,t.style.msTransform=e,t.style.mozTransform=e,t.style.oTransform=e;}function animateSVG(t,e){var n=[],i=[];e.map(function(t){var e=t[0],a=e.parentNode,r=void 0,s=void 0;t[0]=e;var o=animateSVGElement.apply(void 0,_toConsumableArray$1(t)),l=_slicedToArray$1(o,2);r=l[0],s=l[1],n.push(s),i.push([r,a]),a.replaceChild(r,e);});var a=t.cloneNode(!0);return i.map(function(t,i){t[1].replaceChild(n[i],t[0]),e[i][0]=n[i];}),a}function runSMILAnimation(t,e,n){if(0!==n.length){var i=animateSVG(e,n);e.parentNode==t&&(t.removeChild(e),t.appendChild(i)),setTimeout(function(){i.parentNode==t&&(t.removeChild(i),t.appendChild(e));},REPLACE_ALL_NEW_DUR);}}function downloadFile(t,e){var n=document.createElement("a");n.style="display: none";var i=new Blob(e,{type:"image/svg+xml; charset=utf-8"}),a=window.URL.createObjectURL(i);n.href=a,n.download=t,document.body.appendChild(n),n.click(),setTimeout(function(){document.body.removeChild(n),window.URL.revokeObjectURL(a);},300);}function prepareForExport(t){var e=t.cloneNode(!0);e.classList.add("chart-container"),e.setAttribute("xmlns","http://www.w3.org/2000/svg"),e.setAttribute("xmlns:xlink","http://www.w3.org/1999/xlink");var n=$.create("style",{innerHTML:CSSTEXT});e.insertBefore(n,e.firstChild);var i=$.create("div");return i.appendChild(e),i.innerHTML}function _classCallCheck$3(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _classCallCheck$2(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn$1(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function _inherits$1(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function treatAsUtc(t){var e=new Date(t);return e.setMinutes(e.getMinutes()-e.getTimezoneOffset()),e}function getYyyyMmDd(t){var e=t.getDate(),n=t.getMonth()+1;return [t.getFullYear(),(n>9?"":"0")+n,(e>9?"":"0")+e].join("-")}function clone(t){return new Date(t.getTime())}function getWeeksBetween(t,e){var n=setDayToSunday(t);return Math.ceil(getDaysBetween(n,e)/NO_OF_DAYS_IN_WEEK)}function getDaysBetween(t,e){var n=SEC_IN_DAY*NO_OF_MILLIS;return (treatAsUtc(e)-treatAsUtc(t))/n}function areInSameMonth(t,e){return t.getMonth()===e.getMonth()&&t.getFullYear()===e.getFullYear()}function getMonthName(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=MONTH_NAMES[t];return e?n.slice(0,3):n}function getLastDateInMonth(t,e){return new Date(e,t+1,0)}function setDayToSunday(t){var e=clone(t),n=e.getDay();return 0!==n&&addDays(e,-1*n),e}function addDays(t,e){t.setDate(t.getDate()+e);}function _classCallCheck$5(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function getComponent(t,e,n){var i=Object.keys(componentConfigs).filter(function(e){return t.includes(e)}),a=componentConfigs[i[0]];return Object.assign(a,{constants:e,getData:n}),new ChartComponent(a)}function _toConsumableArray(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function _classCallCheck$1(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function _inherits(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function _toConsumableArray$2(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function _classCallCheck$6(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn$2(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function _inherits$2(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function _toConsumableArray$4(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function normalize(t){if(0===t)return [0,0];if(isNaN(t))return {mantissa:-6755399441055744,exponent:972};var e=t>0?1:-1;if(!isFinite(t))return {mantissa:4503599627370496*e,exponent:972};t=Math.abs(t);var n=Math.floor(Math.log10(t));return [e*(t/Math.pow(10,n)),n]}function getChartRangeIntervals(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=Math.ceil(t),i=Math.floor(e),a=n-i,r=a,s=1;a>5&&(a%2!=0&&(a=++n-i),r=a/2,s=2),a<=2&&(s=a/(r=4)),0===a&&(r=5,s=1);for(var o=[],l=0;l<=r;l++)o.push(i+s*l);return o}function getChartIntervals(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=normalize(t),i=_slicedToArray$4(n,2),a=i[0],r=i[1],s=e?e/Math.pow(10,r):0,o=getChartRangeIntervals(a=a.toFixed(6),s);return o=o.map(function(t){return t*Math.pow(10,r)})}function calcChartIntervals(t){function e(t,e){for(var n=getChartIntervals(t),i=n[1]-n[0],a=0,r=1;a<e;r++)a+=i,n.unshift(-1*a);return n}var n=arguments.length>1&&void 0!==arguments[1]&&arguments[1],i=Math.max.apply(Math,_toConsumableArray$4(t)),a=Math.min.apply(Math,_toConsumableArray$4(t)),r=[];if(i>=0&&a>=0)normalize(i)[1],r=n?getChartIntervals(i,a):getChartIntervals(i);else if(i>0&&a<0){var s=Math.abs(a);i>=s?(normalize(i)[1],r=e(i,s)):(normalize(s)[1],r=e(s,i).reverse().map(function(t){return -1*t}));}else if(i<=0&&a<=0){var o=Math.abs(a),l=Math.abs(i);normalize(o)[1],r=(r=n?getChartIntervals(o,l):getChartIntervals(o)).reverse().map(function(t){return -1*t});}return r}function getZeroIndex(t){var e=getIntervalSize(t);return t.indexOf(0)>=0?t.indexOf(0):t[0]>0?-1*t[0]/e:-1*t[t.length-1]/e+(t.length-1)}function getIntervalSize(t){return t[1]-t[0]}function getValueRange(t){return t[t.length-1]-t[0]}function scale(t,e){return floatTwo(e.zeroLine-t*e.scaleMultiplier)}function getClosestInArray(t,e){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],i=e.reduce(function(e,n){return Math.abs(n-t)<Math.abs(e-t)?n:e},[]);return n?e.indexOf(i):i}function calcDistribution(t,e){for(var n=Math.max.apply(Math,_toConsumableArray$4(t)),i=1/(e-1),a=[],r=0;r<e;r++){var s=n*(i*r);a.push(s);}return a}function getMaxCheckpoint(t,e){return e.filter(function(e){return e<t}).length}function _toConsumableArray$3(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function _classCallCheck$7(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn$3(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function _inherits$3(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function _toConsumableArray$6(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function dataPrep(t,e){t.labels=t.labels||[];var n=t.labels.length,i=t.datasets,a=new Array(n).fill(0);return i||(i=[{values:a}]),i.map(function(t){if(t.values){var i=t.values;i=(i=i.map(function(t){return isNaN(t)?0:t})).length>n?i.slice(0,n):fillArray(i,n-i.length,0);}else t.values=a;t.chartType||(t.chartType=e);}),t.yRegions&&t.yRegions.map(function(t){if(t.end<t.start){var e=[t.end,t.start];t.start=e[0],t.end=e[1];}}),t}function zeroDataPrep(t){var e=t.labels.length,n=new Array(e).fill(0),i={labels:t.labels.slice(0,-1),datasets:t.datasets.map(function(t){return {name:"",values:n.slice(0,-1),chartType:t.chartType}})};return t.yMarkers&&(i.yMarkers=[{value:0,label:""}]),t.yRegions&&(i.yRegions=[{start:0,end:0,label:""}]),i}function getShortenedLabels(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],i=t/e.length;i<=0&&(i=1);var a=i/DEFAULT_CHAR_WIDTH,r=void 0;if(n){var s=Math.max.apply(Math,_toConsumableArray$6(e.map(function(t){return t.length})));r=Math.ceil(s/a);}return e.map(function(t,e){return (t+="").length>a&&(n?e%r!=0&&(t=""):t=a-3>0?t.slice(0,a-3)+" ...":t.slice(0,a)+".."),t})}function _toConsumableArray$5(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function _classCallCheck$8(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn$4(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function _inherits$4(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function _toConsumableArray$7(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function _classCallCheck$9(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn$5(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function _inherits$5(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function getChartByType(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"line",e=arguments[1],n=arguments[2];return "axis-mixed"===t?(n.type="line",new AxisChart(e,n)):chartTypes[t]?new chartTypes[t](e,n):void console.error("Undefined chart type: "+t)}Object.defineProperty(exports,"__esModule",{value:!0});var css_248z='.chart-container{position:relative;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif}.chart-container .axis,.chart-container .chart-label{fill:#555b51}.chart-container .axis line,.chart-container .chart-label line{stroke:#dadada}.chart-container .dataset-units circle{stroke:#fff;stroke-width:2}.chart-container .dataset-units path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container .dataset-path{stroke-width:2px}.chart-container .path-group path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container line.dashed{stroke-dasharray:5,3}.chart-container .axis-line .specific-value{text-anchor:start}.chart-container .axis-line .y-line{text-anchor:end}.chart-container .axis-line .x-line{text-anchor:middle}.chart-container .legend-dataset-text{fill:#6c7680;font-weight:600}.graph-svg-tip{position:absolute;z-index:99999;padding:10px;font-size:12px;color:#959da5;text-align:center;background:rgba(0,0,0,.8);border-radius:3px}.graph-svg-tip ol,.graph-svg-tip ul{padding-left:0;display:-webkit-box;display:-ms-flexbox;display:flex}.graph-svg-tip ul.data-point-list li{min-width:90px;-webkit-box-flex:1;-ms-flex:1;flex:1;font-weight:600}.graph-svg-tip strong{color:#dfe2e5;font-weight:600}.graph-svg-tip .svg-pointer{position:absolute;height:5px;margin:0 0 0 -5px;content:" ";border:5px solid transparent;border-top-color:rgba(0,0,0,.8)}.graph-svg-tip.comparison{padding:0;text-align:left;pointer-events:none}.graph-svg-tip.comparison .title{display:block;padding:10px;margin:0;font-weight:600;line-height:1;pointer-events:none}.graph-svg-tip.comparison ul{margin:0;white-space:nowrap;list-style:none}.graph-svg-tip.comparison li{display:inline-block;padding:5px 10px}';styleInject(css_248z);var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};$.create=function(t,e){var n=document.createElement(t);for(var i in e){var a=e[i];if("inside"===i)$(a).appendChild(n);else if("around"===i){var r=$(a);r.parentNode.insertBefore(n,r),n.appendChild(r);}else "styles"===i?"object"===(void 0===a?"undefined":_typeof(a))&&Object.keys(a).map(function(t){n.style[t]=a[t];}):i in n?n[i]=a:n.setAttribute(i,a);}return n};var BASE_MEASURES={margins:{top:10,bottom:10,left:20,right:20},paddings:{top:20,bottom:40,left:30,right:10},baseHeight:240,titleHeight:20,legendHeight:30,titleFontSize:12},INIT_CHART_UPDATE_TIMEOUT=700,CHART_POST_ANIMATE_TIMEOUT=400,AXIS_LEGEND_BAR_SIZE=100,BAR_CHART_SPACE_RATIO=.5,MIN_BAR_PERCENT_HEIGHT=0,LINE_CHART_DOT_SIZE=4,DOT_OVERLAY_SIZE_INCR=4,PERCENTAGE_BAR_DEFAULT_HEIGHT=20,PERCENTAGE_BAR_DEFAULT_DEPTH=2,HEATMAP_DISTRIBUTION_SIZE=5,HEATMAP_SQUARE_SIZE=10,HEATMAP_GUTTER_SIZE=2,DEFAULT_CHAR_WIDTH=7,TOOLTIP_POINTER_TRIANGLE_HEIGHT=5,DEFAULT_CHART_COLORS=["light-blue","blue","violet","red","orange","yellow","green","light-green","purple","magenta","light-grey","dark-grey"],HEATMAP_COLORS_GREEN=["#ebedf0","#c6e48b","#7bc96f","#239a3b","#196127"],DEFAULT_COLORS={bar:DEFAULT_CHART_COLORS,line:DEFAULT_CHART_COLORS,pie:DEFAULT_CHART_COLORS,percentage:DEFAULT_CHART_COLORS,heatmap:HEATMAP_COLORS_GREEN,donut:DEFAULT_CHART_COLORS},ANGLE_RATIO=Math.PI/180,FULL_ANGLE=360,_createClass$3=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),SvgTip=function(){function t(e){var n=e.parent,i=void 0===n?null:n,a=e.colors,r=void 0===a?[]:a;_classCallCheck$4(this,t),this.parent=i,this.colors=r,this.titleName="",this.titleValue="",this.listValues=[],this.titleValueFirst=0,this.x=0,this.y=0,this.top=0,this.left=0,this.setup();}return _createClass$3(t,[{key:"setup",value:function(){this.makeTooltip();}},{key:"refresh",value:function(){this.fill(),this.calcPosition();}},{key:"makeTooltip",value:function(){var t=this;this.container=$.create("div",{inside:this.parent,className:"graph-svg-tip comparison",innerHTML:'<span class="title"></span>\n\t\t\t\t<ul class="data-point-list"></ul>\n\t\t\t\t<div class="svg-pointer"></div>'}),this.hideTip(),this.title=this.container.querySelector(".title"),this.dataPointList=this.container.querySelector(".data-point-list"),this.parent.addEventListener("mouseleave",function(){t.hideTip();});}},{key:"fill",value:function(){var t=this,e=void 0;this.index&&this.container.setAttribute("data-point-index",this.index),e=this.titleValueFirst?"<strong>"+this.titleValue+"</strong>"+this.titleName:this.titleName+"<strong>"+this.titleValue+"</strong>",this.title.innerHTML=e,this.dataPointList.innerHTML="",this.listValues.map(function(e,n){var i=t.colors[n]||"black",a=0===e.formatted||e.formatted?e.formatted:e.value,r=$.create("li",{styles:{"border-top":"3px solid "+i},innerHTML:'<strong style="display: block;">'+(0===a||a?a:"")+"</strong>\n\t\t\t\t\t"+(e.title?e.title:"")});t.dataPointList.appendChild(r);});}},{key:"calcPosition",value:function(){var t=this.container.offsetWidth;this.top=this.y-this.container.offsetHeight-TOOLTIP_POINTER_TRIANGLE_HEIGHT,this.left=this.x-t/2;var e=this.parent.offsetWidth-t,n=this.container.querySelector(".svg-pointer");if(this.left<0)n.style.left="calc(50% - "+-1*this.left+"px)",this.left=0;else if(this.left>e){var i="calc(50% + "+(this.left-e)+"px)";n.style.left=i,this.left=e;}else n.style.left="50%";}},{key:"setValues",value:function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:[],a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:-1;this.titleName=n.name,this.titleValue=n.value,this.listValues=i,this.x=t,this.y=e,this.titleValueFirst=n.valueFirst||0,this.index=a,this.refresh();}},{key:"hideTip",value:function(){this.container.style.top="0px",this.container.style.left="0px",this.container.style.opacity="0";}},{key:"showTip",value:function(){this.container.style.top=this.top+"px",this.container.style.left=this.left+"px",this.container.style.opacity="1";}}]),t}(),PRESET_COLOR_MAP={"light-blue":"#7cd6fd",blue:"#5e64ff",violet:"#743ee2",red:"#ff5858",orange:"#ffa00a",yellow:"#feef72",green:"#28a745","light-green":"#98d85b",purple:"#b554ff",magenta:"#ffa3ef",black:"#36114C",grey:"#bdd3e6","light-grey":"#f0f4f7","dark-grey":"#b8c2cc"},getColor=function(t){return /rgb[a]{0,1}\([\d, ]+\)/gim.test(t)?/\D+(\d*)\D+(\d*)\D+(\d*)/gim.exec(t).map(function(t,e){return 0!==e?Number(t).toString(16):"#"}).reduce(function(t,e){return ""+t+e}):PRESET_COLOR_MAP[t]||t},_slicedToArray=function(){function t(t,e){var n=[],i=!0,a=!1,r=void 0;try{for(var s,o=t[Symbol.iterator]();!(i=(s=o.next()).done)&&(n.push(s.value),!e||n.length!==e);i=!0);}catch(t){a=!0,r=t;}finally{try{!i&&o.return&&o.return();}finally{if(a)throw r}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_typeof$1="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},AXIS_TICK_LENGTH=6,LABEL_MARGIN=4,LABEL_MAX_CHARS=15,FONT_SIZE=10,BASE_LINE_COLOR="#dadada",FONT_FILL="#555b51",makeOverlay={bar:function(t){var e=void 0;"rect"!==t.nodeName&&(e=t.getAttribute("transform"),t=t.childNodes[0]);var n=t.cloneNode();return n.style.fill="#000000",n.style.opacity="0.4",e&&n.setAttribute("transform",e),n},dot:function(t){var e=void 0;"circle"!==t.nodeName&&(e=t.getAttribute("transform"),t=t.childNodes[0]);var n=t.cloneNode(),i=t.getAttribute("r"),a=t.getAttribute("fill");return n.setAttribute("r",parseInt(i)+DOT_OVERLAY_SIZE_INCR),n.setAttribute("fill",a),n.style.opacity="0.6",e&&n.setAttribute("transform",e),n},heat_square:function(t){var e=void 0;"circle"!==t.nodeName&&(e=t.getAttribute("transform"),t=t.childNodes[0]);var n=t.cloneNode(),i=t.getAttribute("r"),a=t.getAttribute("fill");return n.setAttribute("r",parseInt(i)+DOT_OVERLAY_SIZE_INCR),n.setAttribute("fill",a),n.style.opacity="0.6",e&&n.setAttribute("transform",e),n}},updateOverlay={bar:function(t,e){var n=void 0;"rect"!==t.nodeName&&(n=t.getAttribute("transform"),t=t.childNodes[0]);var i=["x","y","width","height"];Object.values(t.attributes).filter(function(t){return i.includes(t.name)&&t.specified}).map(function(t){e.setAttribute(t.name,t.nodeValue);}),n&&e.setAttribute("transform",n);},dot:function(t,e){var n=void 0;"circle"!==t.nodeName&&(n=t.getAttribute("transform"),t=t.childNodes[0]);var i=["cx","cy"];Object.values(t.attributes).filter(function(t){return i.includes(t.name)&&t.specified}).map(function(t){e.setAttribute(t.name,t.nodeValue);}),n&&e.setAttribute("transform",n);},heat_square:function(t,e){var n=void 0;"circle"!==t.nodeName&&(n=t.getAttribute("transform"),t=t.childNodes[0]);var i=["cx","cy"];Object.values(t.attributes).filter(function(t){return i.includes(t.name)&&t.specified}).map(function(t){e.setAttribute(t.name,t.nodeValue);}),n&&e.setAttribute("transform",n);}},_slicedToArray$2=function(){function t(t,e){var n=[],i=!0,a=!1,r=void 0;try{for(var s,o=t[Symbol.iterator]();!(i=(s=o.next()).done)&&(n.push(s.value),!e||n.length!==e);i=!0);}catch(t){a=!0,r=t;}finally{try{!i&&o.return&&o.return();}finally{if(a)throw r}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),UNIT_ANIM_DUR=350,PATH_ANIM_DUR=350,MARKER_LINE_ANIM_DUR=UNIT_ANIM_DUR,REPLACE_ALL_NEW_DUR=250,STD_EASING="easein",_slicedToArray$1=function(){function t(t,e){var n=[],i=!0,a=!1,r=void 0;try{for(var s,o=t[Symbol.iterator]();!(i=(s=o.next()).done)&&(n.push(s.value),!e||n.length!==e);i=!0);}catch(t){a=!0,r=t;}finally{try{!i&&o.return&&o.return();}finally{if(a)throw r}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),EASING={ease:"0.25 0.1 0.25 1",linear:"0 0 1 1",easein:"0.1 0.8 0.2 1",easeout:"0 0 0.58 1",easeinout:"0.42 0 0.58 1"},CSSTEXT=".chart-container{position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif}.chart-container .axis,.chart-container .chart-label{fill:#555b51}.chart-container .axis line,.chart-container .chart-label line{stroke:#dadada}.chart-container .dataset-units circle{stroke:#fff;stroke-width:2}.chart-container .dataset-units path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container .dataset-path{stroke-width:2px}.chart-container .path-group path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container line.dashed{stroke-dasharray:5,3}.chart-container .axis-line .specific-value{text-anchor:start}.chart-container .axis-line .y-line{text-anchor:end}.chart-container .axis-line .x-line{text-anchor:middle}.chart-container .legend-dataset-text{fill:#6c7680;font-weight:600}.graph-svg-tip{position:absolute;z-index:99999;padding:10px;font-size:12px;color:#959da5;text-align:center;background:rgba(0,0,0,.8);border-radius:3px}.graph-svg-tip ul{padding-left:0;display:flex}.graph-svg-tip ol{padding-left:0;display:flex}.graph-svg-tip ul.data-point-list li{min-width:90px;flex:1;font-weight:600}.graph-svg-tip strong{color:#dfe2e5;font-weight:600}.graph-svg-tip .svg-pointer{position:absolute;height:5px;margin:0 0 0 -5px;content:' ';border:5px solid transparent;border-top-color:rgba(0,0,0,.8)}.graph-svg-tip.comparison{padding:0;text-align:left;pointer-events:none}.graph-svg-tip.comparison .title{display:block;padding:10px;margin:0;font-weight:600;line-height:1;pointer-events:none}.graph-svg-tip.comparison ul{margin:0;white-space:nowrap;list-style:none}.graph-svg-tip.comparison li{display:inline-block;padding:5px 10px}",_createClass$2=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),BaseChart=function(){function t(e,n){if(_classCallCheck$3(this,t),this.parent="string"==typeof e?document.querySelector(e):e,!(this.parent instanceof HTMLElement))throw new Error("No `parent` element to render on was provided.");this.rawChartArgs=n,this.title=n.title||"",this.type=n.type||"",this.realData=this.prepareData(n.data),this.data=this.prepareFirstData(this.realData),this.colors=this.validateColors(n.colors,this.type),this.config={showTooltip:1,showLegend:1,isNavigable:n.isNavigable||0,animate:void 0!==n.animate?n.animate:1,truncateLegends:n.truncateLegends||1},this.measures=JSON.parse(JSON.stringify(BASE_MEASURES));var i=this.measures;this.setMeasures(n),this.title.length||(i.titleHeight=0),this.config.showLegend||(i.legendHeight=0),this.argHeight=n.height||i.baseHeight,this.state={},this.options={},this.initTimeout=INIT_CHART_UPDATE_TIMEOUT,this.config.isNavigable&&(this.overlays=[]),this.configure(n);}return _createClass$2(t,[{key:"prepareData",value:function(t){return t}},{key:"prepareFirstData",value:function(t){return t}},{key:"validateColors",value:function(t,e){var n=[];return (t=(t||[]).concat(DEFAULT_COLORS[e])).forEach(function(t){var e=getColor(t);isValidColor(e)?n.push(e):console.warn('"'+t+'" is not a valid color.');}),n}},{key:"setMeasures",value:function(){}},{key:"configure",value:function(){var t=this,e=this.argHeight;this.baseHeight=e,this.height=e-getExtraHeight(this.measures),this.boundDrawFn=function(){return t.draw(!0)},window.addEventListener("resize",this.boundDrawFn),window.addEventListener("orientationchange",this.boundDrawFn);}},{key:"destroy",value:function(){window.removeEventListener("resize",this.boundDrawFn),window.removeEventListener("orientationchange",this.boundDrawFn);}},{key:"setup",value:function(){this.makeContainer(),this.updateWidth(),this.makeTooltip(),this.draw(!1,!0);}},{key:"makeContainer",value:function(){this.parent.innerHTML="";var t={inside:this.parent,className:"chart-container"};this.independentWidth&&(t.styles={width:this.independentWidth+"px"}),this.container=$.create("div",t);}},{key:"makeTooltip",value:function(){this.tip=new SvgTip({parent:this.container,colors:this.colors}),this.bindTooltip();}},{key:"bindTooltip",value:function(){}},{key:"draw",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],n=arguments.length>1&&void 0!==arguments[1]&&arguments[1];e&&isHidden(this.parent)||(this.updateWidth(),this.calc(e),this.makeChartArea(),this.setupComponents(),this.components.forEach(function(e){return e.setup(t.drawArea)}),this.render(this.components,!1),n&&(this.data=this.realData,setTimeout(function(){t.update(t.data);},this.initTimeout)),this.renderLegend(),this.setupNavigation(n));}},{key:"calc",value:function(){}},{key:"updateWidth",value:function(){this.baseWidth=getElementContentWidth(this.parent),this.width=this.baseWidth-getExtraWidth(this.measures);}},{key:"makeChartArea",value:function(){this.svg&&this.container.removeChild(this.svg);var t=this.measures;this.svg=makeSVGContainer(this.container,"frappe-chart chart",this.baseWidth,this.baseHeight),this.svgDefs=makeSVGDefs(this.svg),this.title.length&&(this.titleEL=makeText("title",t.margins.left,t.margins.top,this.title,{fontSize:t.titleFontSize,fill:"#666666",dy:t.titleFontSize}));var e=getTopOffset(t);this.drawArea=makeSVGGroup(this.type+"-chart chart-draw-area","translate("+getLeftOffset(t)+", "+e+")"),this.config.showLegend&&(e+=this.height+t.paddings.bottom,this.legendArea=makeSVGGroup("chart-legend","translate("+getLeftOffset(t)+", "+e+")")),this.title.length&&this.svg.appendChild(this.titleEL),this.svg.appendChild(this.drawArea),this.config.showLegend&&this.svg.appendChild(this.legendArea),this.updateTipOffset(getLeftOffset(t),getTopOffset(t));}},{key:"updateTipOffset",value:function(t,e){this.tip.offset={x:t,y:e};}},{key:"setupComponents",value:function(){this.components=new Map;}},{key:"update",value:function(t){t||console.error("No data to update."),this.data=this.prepareData(t),this.calc(),this.render(this.components,this.config.animate);}},{key:"render",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.components,n=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];this.config.isNavigable&&this.overlays.map(function(t){return t.parentNode.removeChild(t)});var i=[];e.forEach(function(t){i=i.concat(t.update(n));}),i.length>0?(runSMILAnimation(this.container,this.svg,i),setTimeout(function(){e.forEach(function(t){return t.make()}),t.updateNav();},CHART_POST_ANIMATE_TIMEOUT)):(e.forEach(function(t){return t.make()}),this.updateNav());}},{key:"updateNav",value:function(){this.config.isNavigable&&(this.makeOverlay(),this.bindUnits());}},{key:"renderLegend",value:function(){}},{key:"setupNavigation",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];this.config.isNavigable&&e&&(this.bindOverlay(),this.keyActions={13:this.onEnterKey.bind(this),37:this.onLeftArrow.bind(this),38:this.onUpArrow.bind(this),39:this.onRightArrow.bind(this),40:this.onDownArrow.bind(this)},document.addEventListener("keydown",function(e){isElementInViewport(t.container)&&(e=e||window.event,t.keyActions[e.keyCode]&&t.keyActions[e.keyCode]());}));}},{key:"makeOverlay",value:function(){}},{key:"updateOverlay",value:function(){}},{key:"bindOverlay",value:function(){}},{key:"bindUnits",value:function(){}},{key:"onLeftArrow",value:function(){}},{key:"onRightArrow",value:function(){}},{key:"onUpArrow",value:function(){}},{key:"onDownArrow",value:function(){}},{key:"onEnterKey",value:function(){}},{key:"addDataPoint",value:function(){}},{key:"removeDataPoint",value:function(){}},{key:"getDataPoint",value:function(){}},{key:"setCurrentDataPoint",value:function(){}},{key:"updateDataset",value:function(){}},{key:"export",value:function(){var t=prepareForExport(this.svg);downloadFile(this.title||"Chart",[t]);}}]),t}(),_createClass$1=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),_get$1=function t(e,n,i){null===e&&(e=Function.prototype);var a=Object.getOwnPropertyDescriptor(e,n);if(void 0===a){var r=Object.getPrototypeOf(e);return null===r?void 0:t(r,n,i)}if("value"in a)return a.value;var s=a.get;if(void 0!==s)return s.call(i)},AggregationChart=function(t){function e(t,n){return _classCallCheck$2(this,e),_possibleConstructorReturn$1(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n))}return _inherits$1(e,t),_createClass$1(e,[{key:"configure",value:function(t){_get$1(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"configure",this).call(this,t),this.config.formatTooltipY=(t.tooltipOptions||{}).formatTooltipY,this.config.maxSlices=t.maxSlices||20,this.config.maxLegendPoints=t.maxLegendPoints||20;}},{key:"calc",value:function(){var t=this,e=this.state,n=this.config.maxSlices;e.sliceTotals=[];var i=this.data.labels.map(function(e,n){var i=0;return t.data.datasets.map(function(t){i+=t.values[n];}),[i,e]}).filter(function(t){return t[0]>=0}),a=i;if(i.length>n){i.sort(function(t,e){return e[0]-t[0]}),a=i.slice(0,n-1);var r=0;i.slice(n-1).map(function(t){r+=t[0];}),a.push([r,"Rest"]),this.colors[n-1]="grey";}e.labels=[],a.map(function(t){e.sliceTotals.push(round(t[0])),e.labels.push(t[1]);}),e.grandTotal=e.sliceTotals.reduce(function(t,e){return t+e},0),this.center={x:this.width/2,y:this.height/2};}},{key:"renderLegend",value:function(){var t=this,e=this.state;this.legendArea.textContent="",this.legendTotals=e.sliceTotals.slice(0,this.config.maxLegendPoints);var n=0,i=0;this.legendTotals.map(function(a,r){var s=150,o=Math.floor((t.width-getExtraWidth(t.measures))/s);t.legendTotals.length<o&&(s=t.width/t.legendTotals.length),n>o&&(n=0,i+=20);var l=s*n+5,u=t.config.truncateLegends?truncateString(e.labels[r],s/10):e.labels[r],c=t.config.formatTooltipY?t.config.formatTooltipY(a):a,h=legendDot(l,i,5,t.colors[r],u+": "+c,!1);t.legendArea.appendChild(h),n++;});}}]),e}(BaseChart),NO_OF_YEAR_MONTHS=12,NO_OF_DAYS_IN_WEEK=7,NO_OF_MILLIS=1e3,SEC_IN_DAY=86400,MONTH_NAMES=["January","February","March","April","May","June","July","August","September","October","November","December"],DAY_NAMES_SHORT=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],_slicedToArray$3=function(){function t(t,e){var n=[],i=!0,a=!1,r=void 0;try{for(var s,o=t[Symbol.iterator]();!(i=(s=o.next()).done)&&(n.push(s.value),!e||n.length!==e);i=!0);}catch(t){a=!0,r=t;}finally{try{!i&&o.return&&o.return();}finally{if(a)throw r}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_createClass$4=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),ChartComponent=function(){function t(e){var n=e.layerClass,i=void 0===n?"":n,a=e.layerTransform,r=void 0===a?"":a,s=e.constants,o=e.getData,l=e.makeElements,u=e.animateElements;_classCallCheck$5(this,t),this.layerTransform=r,this.constants=s,this.makeElements=l,this.getData=o,this.animateElements=u,this.store=[],this.labels=[],this.layerClass=i,this.layerClass="function"==typeof this.layerClass?this.layerClass():this.layerClass,this.refresh();}return _createClass$4(t,[{key:"refresh",value:function(t){this.data=t||this.getData();}},{key:"setup",value:function(t){this.layer=makeSVGGroup(this.layerClass,this.layerTransform,t);}},{key:"make",value:function(){this.render(this.data),this.oldData=this.data;}},{key:"render",value:function(t){var e=this;this.store=this.makeElements(t),this.layer.textContent="",this.store.forEach(function(t){e.layer.appendChild(t);}),this.labels.forEach(function(t){e.layer.appendChild(t);});}},{key:"update",value:function(){var t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];this.refresh();var e=[];return t&&(e=this.animateElements(this.data)||[]),e}}]),t}(),componentConfigs={donutSlices:{layerClass:"donut-slices",makeElements:function(t){return t.sliceStrings.map(function(e,n){var i=makePath(e,"donut-path",t.colors[n],"none",t.strokeWidth);return i.style.transition="transform .3s;",i})},animateElements:function(t){return this.store.map(function(e,n){return animatePathStr(e,t.sliceStrings[n])})}},pieSlices:{layerClass:"pie-slices",makeElements:function(t){return t.sliceStrings.map(function(e,n){var i=makePath(e,"pie-path","none",t.colors[n]);return i.style.transition="transform .3s;",i})},animateElements:function(t){return this.store.map(function(e,n){return animatePathStr(e,t.sliceStrings[n])})}},percentageBars:{layerClass:"percentage-bars",makeElements:function(t){var e=this;return t.xPositions.map(function(n,i){return percentageBar(n,0,t.widths[i],e.constants.barHeight,e.constants.barDepth,t.colors[i])})},animateElements:function(t){if(t)return []}},yAxis:{layerClass:"y axis",makeElements:function(t){var e=this;return t.positions.map(function(n,i){return yLine(n,t.labels[i],e.constants.width,{mode:e.constants.mode,pos:e.constants.pos,shortenNumbers:e.constants.shortenNumbers})})},animateElements:function(t){var e=t.positions,n=t.labels,i=this.oldData.positions,a=this.oldData.labels,r=equilizeNoOfElements(i,e),s=_slicedToArray$3(r,2);i=s[0],e=s[1];var o=equilizeNoOfElements(a,n),l=_slicedToArray$3(o,2);return a=l[0],n=l[1],this.render({positions:i,labels:n}),this.store.map(function(t,n){return translateHoriLine(t,e[n],i[n])})}},xAxis:{layerClass:"x axis",makeElements:function(t){var e=this;return t.positions.map(function(n,i){return xLine(n,t.calcLabels[i],e.constants.height,{mode:e.constants.mode,pos:e.constants.pos})})},animateElements:function(t){var e=t.positions,n=t.calcLabels,i=this.oldData.positions,a=this.oldData.calcLabels,r=equilizeNoOfElements(i,e),s=_slicedToArray$3(r,2);i=s[0],e=s[1];var o=equilizeNoOfElements(a,n),l=_slicedToArray$3(o,2);return a=l[0],n=l[1],this.render({positions:i,calcLabels:n}),this.store.map(function(t,n){return translateVertLine(t,e[n],i[n])})}},yMarkers:{layerClass:"y-markers",makeElements:function(t){var e=this;return t.map(function(t){return yMarker(t.position,t.label,e.constants.width,{labelPos:t.options.labelPos,mode:"span",lineType:"dashed"})})},animateElements:function(t){var e=equilizeNoOfElements(this.oldData,t),n=_slicedToArray$3(e,2);this.oldData=n[0];var i=(t=n[1]).map(function(t){return t.position}),a=t.map(function(t){return t.label}),r=t.map(function(t){return t.options}),s=this.oldData.map(function(t){return t.position});return this.render(s.map(function(t,e){return {position:s[e],label:a[e],options:r[e]}})),this.store.map(function(t,e){return translateHoriLine(t,i[e],s[e])})}},yRegions:{layerClass:"y-regions",makeElements:function(t){var e=this;return t.map(function(t){return yRegion(t.startPos,t.endPos,e.constants.width,t.label,{labelPos:t.options.labelPos})})},animateElements:function(t){var e=equilizeNoOfElements(this.oldData,t),n=_slicedToArray$3(e,2);this.oldData=n[0];var i=(t=n[1]).map(function(t){return t.endPos}),a=t.map(function(t){return t.label}),r=t.map(function(t){return t.startPos}),s=t.map(function(t){return t.options}),o=this.oldData.map(function(t){return t.endPos}),l=this.oldData.map(function(t){return t.startPos});this.render(o.map(function(t,e){return {startPos:l[e],endPos:o[e],label:a[e],options:s[e]}}));var u=[];return this.store.map(function(t,e){u=u.concat(animateRegion(t,r[e],i[e],o[e]));}),u}},heatDomain:{layerClass:function(){return "heat-domain domain-"+this.constants.index},makeElements:function(t){var e=this,n=this.constants,i=n.index,a=n.colWidth,r=n.rowHeight,s=n.squareSize,o=n.radius,l=n.xTranslate,u=0;return this.serializedSubDomains=[],t.cols.map(function(t,n){1===n&&e.labels.push(makeText("domain-name",l,-12,getMonthName(i,!0).toUpperCase(),{fontSize:9})),t.map(function(t,n){if(t.fill){var i={"data-date":t.yyyyMmDd,"data-value":t.dataValue,"data-day":n},a=heatSquare("day",l,u,s,o,t.fill,i);e.serializedSubDomains.push(a);}u+=r;}),u=0,l+=a;}),this.serializedSubDomains},animateElements:function(t){if(t)return []}},barGraph:{layerClass:function(){return "dataset-units dataset-bars dataset-"+this.constants.index},makeElements:function(t){var e=this.constants;return this.unitType="bar",this.units=t.yPositions.map(function(n,i){return datasetBar(t.xPositions[i],n,t.barWidth,e.color,t.labels[i],i,t.offsets[i],{zeroLine:t.zeroLine,barsWidth:t.barsWidth,minHeight:e.minHeight})}),this.units},animateElements:function(t){var e=t.xPositions,n=t.yPositions,i=t.offsets,a=t.labels,r=this.oldData.xPositions,s=this.oldData.yPositions,o=this.oldData.offsets,l=this.oldData.labels,u=equilizeNoOfElements(r,e),c=_slicedToArray$3(u,2);r=c[0],e=c[1];var h=equilizeNoOfElements(s,n),d=_slicedToArray$3(h,2);s=d[0],n=d[1];var f=equilizeNoOfElements(o,i),p=_slicedToArray$3(f,2);o=p[0],i=p[1];var v=equilizeNoOfElements(l,a),g=_slicedToArray$3(v,2);l=g[0],a=g[1],this.render({xPositions:r,yPositions:s,offsets:o,labels:a,zeroLine:this.oldData.zeroLine,barsWidth:this.oldData.barsWidth,barWidth:this.oldData.barWidth});var y=[];return this.store.map(function(a,r){y=y.concat(animateBar(a,e[r],n[r],t.barWidth,i[r],{zeroLine:t.zeroLine}));}),y}},lineGraph:{layerClass:function(){return "dataset-units dataset-line dataset-"+this.constants.index},makeElements:function(t){var e=this.constants;return this.unitType="dot",this.paths={},e.hideLine||(this.paths=getPaths(t.xPositions,t.yPositions,e.color,{heatline:e.heatline,regionFill:e.regionFill,spline:e.spline},{svgDefs:e.svgDefs,zeroLine:t.zeroLine})),this.units=[],e.hideDots||(this.units=t.yPositions.map(function(n,i){return datasetDot(t.xPositions[i],n,t.radius,e.color,e.valuesOverPoints?t.values[i]:"",i)})),Object.values(this.paths).concat(this.units)},animateElements:function(t){var e=t.xPositions,n=t.yPositions,i=t.values,a=this.oldData.xPositions,r=this.oldData.yPositions,s=this.oldData.values,o=equilizeNoOfElements(a,e),l=_slicedToArray$3(o,2);a=l[0],e=l[1];var u=equilizeNoOfElements(r,n),c=_slicedToArray$3(u,2);r=c[0],n=c[1];var h=equilizeNoOfElements(s,i),d=_slicedToArray$3(h,2);s=d[0],i=d[1],this.render({xPositions:a,yPositions:r,values:i,zeroLine:this.oldData.zeroLine,radius:this.oldData.radius});var f=[];return Object.keys(this.paths).length&&(f=f.concat(animatePath(this.paths,e,n,t.zeroLine,this.constants.spline))),this.units.length&&this.units.map(function(t,i){f=f.concat(animateDot(t,e[i],n[i]));}),f}}},_createClass=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),_get=function t(e,n,i){null===e&&(e=Function.prototype);var a=Object.getOwnPropertyDescriptor(e,n);if(void 0===a){var r=Object.getPrototypeOf(e);return null===r?void 0:t(r,n,i)}if("value"in a)return a.value;var s=a.get;if(void 0!==s)return s.call(i)},PercentageChart=function(t){function e(t,n){_classCallCheck$1(this,e);var i=_possibleConstructorReturn(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return i.type="percentage",i.setup(),i}return _inherits(e,t),_createClass(e,[{key:"setMeasures",value:function(t){var e=this.measures;this.barOptions=t.barOptions||{};var n=this.barOptions;n.height=n.height||PERCENTAGE_BAR_DEFAULT_HEIGHT,n.depth=n.depth||PERCENTAGE_BAR_DEFAULT_DEPTH,e.paddings.right=30,e.legendHeight=60,e.baseHeight=8*(n.height+.5*n.depth);}},{key:"setupComponents",value:function(){var t=this.state,e=[["percentageBars",{barHeight:this.barOptions.height,barDepth:this.barOptions.depth},function(){return {xPositions:t.xPositions,widths:t.widths,colors:this.colors}}.bind(this)]];this.components=new Map(e.map(function(t){var e=getComponent.apply(void 0,_toConsumableArray(t));return [t[0],e]}));}},{key:"calc",value:function(){var t=this;_get(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"calc",this).call(this);var n=this.state;n.xPositions=[],n.widths=[];var i=0;n.sliceTotals.map(function(e){var a=t.width*e/n.grandTotal;n.widths.push(a),n.xPositions.push(i),i+=a;});}},{key:"makeDataByIndex",value:function(){}},{key:"bindTooltip",value:function(){var t=this,e=this.state;this.container.addEventListener("mousemove",function(n){var i=t.components.get("percentageBars").store,a=n.target;if(i.includes(a)){var r=i.indexOf(a),s=getOffset(t.container),o=getOffset(a),l=o.left-s.left+parseInt(a.getAttribute("width"))/2,u=o.top-s.top,c=(t.formattedLabels&&t.formattedLabels.length>0?t.formattedLabels[r]:t.state.labels[r])+": ",h=e.sliceTotals[r]/e.grandTotal;t.tip.setValues(l,u,{name:c,value:(100*h).toFixed(1)+"%"}),t.tip.showTip();}});}}]),e}(AggregationChart),_createClass$5=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),_get$2=function t(e,n,i){null===e&&(e=Function.prototype);var a=Object.getOwnPropertyDescriptor(e,n);if(void 0===a){var r=Object.getPrototypeOf(e);return null===r?void 0:t(r,n,i)}if("value"in a)return a.value;var s=a.get;if(void 0!==s)return s.call(i)},PieChart=function(t){function e(t,n){_classCallCheck$6(this,e);var i=_possibleConstructorReturn$2(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return i.type="pie",i.initTimeout=0,i.init=1,i.setup(),i}return _inherits$2(e,t),_createClass$5(e,[{key:"configure",value:function(t){_get$2(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"configure",this).call(this,t),this.mouseMove=this.mouseMove.bind(this),this.mouseLeave=this.mouseLeave.bind(this),this.hoverRadio=t.hoverRadio||.1,this.config.startAngle=t.startAngle||0,this.clockWise=t.clockWise||!1;}},{key:"calc",value:function(){var t=this;_get$2(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"calc",this).call(this);var n=this.state;this.radius=this.height>this.width?this.center.x:this.center.y;var i=this.radius,a=this.clockWise,r=n.slicesProperties||[];n.sliceStrings=[],n.slicesProperties=[];var s=180-this.config.startAngle;n.sliceTotals.map(function(e,o){var l=s,u=e/n.grandTotal*FULL_ANGLE,c=u>180?1:0,h=a?-u:u,d=s+=h,f=getPositionByAngle(l,i),p=getPositionByAngle(d,i),v=t.init&&r[o],g=void 0,y=void 0;t.init?(g=v?v.startPosition:f,y=v?v.endPosition:f):(g=f,y=p);var m=360===u?makeCircleStr(g,y,t.center,t.radius,a,c):makeArcPathStr(g,y,t.center,t.radius,a,c);n.sliceStrings.push(m),n.slicesProperties.push({startPosition:f,endPosition:p,value:e,total:n.grandTotal,startAngle:l,endAngle:d,angle:h});}),this.init=0;}},{key:"setupComponents",value:function(){var t=this.state,e=[["pieSlices",{},function(){return {sliceStrings:t.sliceStrings,colors:this.colors}}.bind(this)]];this.components=new Map(e.map(function(t){var e=getComponent.apply(void 0,_toConsumableArray$2(t));return [t[0],e]}));}},{key:"calTranslateByAngle",value:function(t){var e=this.radius,n=this.hoverRadio,i=getPositionByAngle(t.startAngle+t.angle/2,e);return "translate3d("+i.x*n+"px,"+i.y*n+"px,0)"}},{key:"hoverSlice",value:function(t,e,n,i){if(t){var a=this.colors[e];if(n){transform(t,this.calTranslateByAngle(this.state.slicesProperties[e])),t.style.fill=lightenDarkenColor(a,50);var r=getOffset(this.svg),s=i.pageX-r.left+10,o=i.pageY-r.top-10,l=(this.formatted_labels&&this.formatted_labels.length>0?this.formatted_labels[e]:this.state.labels[e])+": ",u=(100*this.state.sliceTotals[e]/this.state.grandTotal).toFixed(1);this.tip.setValues(s,o,{name:l,value:u+"%"}),this.tip.showTip();}else transform(t,"translate3d(0,0,0)"),this.tip.hideTip(),t.style.fill=a;}}},{key:"bindTooltip",value:function(){this.container.addEventListener("mousemove",this.mouseMove),this.container.addEventListener("mouseleave",this.mouseLeave);}},{key:"mouseMove",value:function(t){var e=t.target,n=this.components.get("pieSlices").store,i=this.curActiveSliceIndex,a=this.curActiveSlice;if(n.includes(e)){var r=n.indexOf(e);this.hoverSlice(a,i,!1),this.curActiveSlice=e,this.curActiveSliceIndex=r,this.hoverSlice(e,r,!0,t);}else this.mouseLeave();}},{key:"mouseLeave",value:function(){this.hoverSlice(this.curActiveSlice,this.curActiveSliceIndex,!1);}}]),e}(AggregationChart),_slicedToArray$4=function(){function t(t,e){var n=[],i=!0,a=!1,r=void 0;try{for(var s,o=t[Symbol.iterator]();!(i=(s=o.next()).done)&&(n.push(s.value),!e||n.length!==e);i=!0);}catch(t){a=!0,r=t;}finally{try{!i&&o.return&&o.return();}finally{if(a)throw r}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_createClass$6=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),COL_WIDTH=HEATMAP_SQUARE_SIZE+HEATMAP_GUTTER_SIZE,ROW_HEIGHT=COL_WIDTH,Heatmap=function(t){function e(t,n){_classCallCheck$7(this,e);var i=_possibleConstructorReturn$3(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));i.type="heatmap",i.countLabel=n.countLabel||"";var a=["Sunday","Monday"],r=a.includes(n.startSubDomain)?n.startSubDomain:"Sunday";return i.startSubDomainIndex=a.indexOf(r),i.setup(),i}return _inherits$3(e,t),_createClass$6(e,[{key:"setMeasures",value:function(t){var e=this.measures;this.discreteDomains=0===t.discreteDomains?0:1,e.paddings.top=3*ROW_HEIGHT,e.paddings.bottom=0,e.legendHeight=2*ROW_HEIGHT,e.baseHeight=ROW_HEIGHT*NO_OF_DAYS_IN_WEEK+getExtraHeight(e);var n=this.data,i=this.discreteDomains?NO_OF_YEAR_MONTHS:0;this.independentWidth=(getWeeksBetween(n.start,n.end)+i)*COL_WIDTH+getExtraWidth(e);}},{key:"updateWidth",value:function(){var t=this.discreteDomains?NO_OF_YEAR_MONTHS:0,e=this.state.noOfWeeks?this.state.noOfWeeks:52;this.baseWidth=(e+t)*COL_WIDTH+getExtraWidth(this.measures);}},{key:"prepareData",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.data;if(t.start&&t.end&&t.start>t.end)throw new Error("Start date cannot be greater than end date.");if(t.start||(t.start=new Date,t.start.setFullYear(t.start.getFullYear()-1)),t.end||(t.end=new Date),t.dataPoints=t.dataPoints||{},parseInt(Object.keys(t.dataPoints)[0])>1e5){var e={};Object.keys(t.dataPoints).forEach(function(n){var i=new Date(n*NO_OF_MILLIS);e[getYyyyMmDd(i)]=t.dataPoints[n];}),t.dataPoints=e;}return t}},{key:"calc",value:function(){var t=this.state;t.start=clone(this.data.start),t.end=clone(this.data.end),t.firstWeekStart=clone(t.start),t.noOfWeeks=getWeeksBetween(t.start,t.end),t.distribution=calcDistribution(Object.values(this.data.dataPoints),HEATMAP_DISTRIBUTION_SIZE),t.domainConfigs=this.getDomains();}},{key:"setupComponents",value:function(){var t=this,e=this.state,n=this.discreteDomains?0:1,i=e.domainConfigs.map(function(i,a){return ["heatDomain",{index:i.index,colWidth:COL_WIDTH,rowHeight:ROW_HEIGHT,squareSize:HEATMAP_SQUARE_SIZE,radius:t.rawChartArgs.radius||0,xTranslate:e.domainConfigs.filter(function(t,e){return e<a}).map(function(t){return t.cols.length-n}).reduce(function(t,e){return t+e},0)*COL_WIDTH},function(){return e.domainConfigs[a]}.bind(t)]});this.components=new Map(i.map(function(t,e){var n=getComponent.apply(void 0,_toConsumableArray$3(t));return [t[0]+"-"+e,n]}));var a=0;DAY_NAMES_SHORT.forEach(function(e,n){if([1,3,5].includes(n)){var i=makeText("subdomain-name",-COL_WIDTH/2,a,e,{fontSize:HEATMAP_SQUARE_SIZE,dy:8,textAnchor:"end"});t.drawArea.appendChild(i);}a+=ROW_HEIGHT;});}},{key:"update",value:function(t){t||console.error("No data to update."),this.data=this.prepareData(t),this.draw(),this.bindTooltip();}},{key:"bindTooltip",value:function(){var t=this;this.container.addEventListener("mousemove",function(e){t.components.forEach(function(n){var i=n.store,a=e.target;if(i.includes(a)){var r=a.getAttribute("data-value"),s=a.getAttribute("data-date").split("-"),o=getMonthName(parseInt(s[1])-1,!0),l=t.container.getBoundingClientRect(),u=a.getBoundingClientRect(),c=parseInt(e.target.getAttribute("width")),h=u.left-l.left+c/2,d=u.top-l.top,f=r+" "+t.countLabel,p=" on "+o+" "+s[0]+", "+s[2];t.tip.setValues(h,d,{name:p,value:f,valueFirst:1},[]),t.tip.showTip();}});});}},{key:"renderLegend",value:function(){var t=this;this.legendArea.textContent="";var e=0,n=ROW_HEIGHT,i=this.rawChartArgs.radius||0,a=makeText("subdomain-name",e,n,"Less",{fontSize:HEATMAP_SQUARE_SIZE+1,dy:9});e=2*COL_WIDTH+COL_WIDTH/2,this.legendArea.appendChild(a),this.colors.slice(0,HEATMAP_DISTRIBUTION_SIZE).map(function(a,r){var s=heatSquare("heatmap-legend-unit",e+(COL_WIDTH+3)*r,n,HEATMAP_SQUARE_SIZE,i,a);t.legendArea.appendChild(s);});var r=makeText("subdomain-name",e+HEATMAP_DISTRIBUTION_SIZE*(COL_WIDTH+3)+COL_WIDTH/4,n,"More",{fontSize:HEATMAP_SQUARE_SIZE+1,dy:9});this.legendArea.appendChild(r);}},{key:"getDomains",value:function(){for(var t=this.state,e=[t.start.getMonth(),t.start.getFullYear()],n=e[0],i=e[1],a=[t.end.getMonth(),t.end.getFullYear()],r=a[0]-n+1+12*(a[1]-i),s=[],o=clone(t.start),l=0;l<r;l++){var u=t.end;if(!areInSameMonth(o,t.end)){var c=[o.getMonth(),o.getFullYear()];u=getLastDateInMonth(c[0],c[1]);}s.push(this.getDomainConfig(o,u)),addDays(u,1),o=u;}return s}},{key:"getDomainConfig",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n=[t.getMonth(),t.getFullYear()],i=n[0],a=n[1],r=setDayToSunday(t),s={index:i,cols:[]};addDays(e=clone(e)||getLastDateInMonth(i,a),1);for(var o=getWeeksBetween(r,e),l=[],u=void 0,c=0;c<o;c++)u=this.getCol(r,i),l.push(u),addDays(r=new Date(u[NO_OF_DAYS_IN_WEEK-1].yyyyMmDd),1);return void 0!==u[NO_OF_DAYS_IN_WEEK-1].dataValue&&(addDays(r,1),l.push(this.getCol(r,i,!0))),s.cols=l,s}},{key:"getCol",value:function(t,e){for(var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],i=this.state,a=clone(t),r=[],s=0;s<NO_OF_DAYS_IN_WEEK;s++,addDays(a,1)){var o={},l=a>=i.start&&a<=i.end;n||a.getMonth()!==e||!l?o.yyyyMmDd=getYyyyMmDd(a):o=this.getSubDomainConfig(a),r.push(o);}return r}},{key:"getSubDomainConfig",value:function(t){var e=getYyyyMmDd(t),n=this.data.dataPoints[e];return {yyyyMmDd:e,dataValue:n||0,fill:this.colors[getMaxCheckpoint(n,this.state.distribution)]}}}]),e}(BaseChart),_createClass$7=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),_get$3=function t(e,n,i){null===e&&(e=Function.prototype);var a=Object.getOwnPropertyDescriptor(e,n);if(void 0===a){var r=Object.getPrototypeOf(e);return null===r?void 0:t(r,n,i)}if("value"in a)return a.value;var s=a.get;if(void 0!==s)return s.call(i)},AxisChart=function(t){function e(t,n){_classCallCheck$8(this,e);var i=_possibleConstructorReturn$4(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return i.barOptions=n.barOptions||{},i.lineOptions=n.lineOptions||{},i.type=n.type||"line",i.init=1,i.setup(),i}return _inherits$4(e,t),_createClass$7(e,[{key:"setMeasures",value:function(){this.data.datasets.length<=1&&(this.config.showLegend=0,this.measures.paddings.bottom=30);}},{key:"configure",value:function(t){_get$3(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"configure",this).call(this,t),t.axisOptions=t.axisOptions||{},t.tooltipOptions=t.tooltipOptions||{},this.config.xAxisMode=t.axisOptions.xAxisMode||"span",this.config.yAxisMode=t.axisOptions.yAxisMode||"span",this.config.xIsSeries=t.axisOptions.xIsSeries||0,this.config.shortenYAxisNumbers=t.axisOptions.shortenYAxisNumbers||0,this.config.formatTooltipX=t.tooltipOptions.formatTooltipX,this.config.formatTooltipY=t.tooltipOptions.formatTooltipY,this.config.valuesOverPoints=t.valuesOverPoints;}},{key:"prepareData",value:function(){return dataPrep(arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.data,this.type)}},{key:"prepareFirstData",value:function(){return zeroDataPrep(arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.data)}},{key:"calc",value:function(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];this.calcXPositions(),t||this.calcYAxisParameters(this.getAllYValues(),"line"===this.type),this.makeDataByIndex();}},{key:"calcXPositions",value:function(){var t=this.state,e=this.data.labels;t.datasetLength=e.length,t.unitWidth=this.width/t.datasetLength,t.xOffset=t.unitWidth/2,t.xAxis={labels:e,positions:e.map(function(e,n){return floatTwo(t.xOffset+n*t.unitWidth)})};}},{key:"calcYAxisParameters",value:function(t){var e=calcChartIntervals(t,arguments.length>1&&void 0!==arguments[1]?arguments[1]:"false"),n=this.height/getValueRange(e),i=getIntervalSize(e)*n,a=this.height-getZeroIndex(e)*i;this.state.yAxis={labels:e,positions:e.map(function(t){return a-t*n}),scaleMultiplier:n,zeroLine:a},this.calcDatasetPoints(),this.calcYExtremes(),this.calcYRegions();}},{key:"calcDatasetPoints",value:function(){var t=this.state,e=function(e){return e.map(function(e){return scale(e,t.yAxis)})};t.datasets=this.data.datasets.map(function(t,n){var i=t.values,a=t.cumulativeYs||[];return {name:t.name,index:n,chartType:t.chartType,values:i,yPositions:e(i),cumulativeYs:a,cumulativeYPos:e(a)}});}},{key:"calcYExtremes",value:function(){var t=this.state;if(this.barOptions.stacked)return void(t.yExtremes=t.datasets[t.datasets.length-1].cumulativeYPos);t.yExtremes=new Array(t.datasetLength).fill(9999),t.datasets.map(function(e){e.yPositions.map(function(e,n){e<t.yExtremes[n]&&(t.yExtremes[n]=e);});});}},{key:"calcYRegions",value:function(){var t=this.state;this.data.yMarkers&&(this.state.yMarkers=this.data.yMarkers.map(function(e){return e.position=scale(e.value,t.yAxis),e.options||(e.options={}),e})),this.data.yRegions&&(this.state.yRegions=this.data.yRegions.map(function(e){return e.startPos=scale(e.start,t.yAxis),e.endPos=scale(e.end,t.yAxis),e.options||(e.options={}),e}));}},{key:"getAllYValues",value:function(){var t,e=this,n="values";if(this.barOptions.stacked){n="cumulativeYs";var i=new Array(this.state.datasetLength).fill(0);this.data.datasets.map(function(t,a){var r=e.data.datasets[a].values;t[n]=i=i.map(function(t,e){return t+r[e]});});}var a=this.data.datasets.map(function(t){return t[n]});return this.data.yMarkers&&a.push(this.data.yMarkers.map(function(t){return t.value})),this.data.yRegions&&this.data.yRegions.map(function(t){a.push([t.end,t.start]);}),(t=[]).concat.apply(t,_toConsumableArray$5(a))}},{key:"setupComponents",value:function(){var t=this,e=[["yAxis",{mode:this.config.yAxisMode,width:this.width,shortenNumbers:this.config.shortenYAxisNumbers},function(){return this.state.yAxis}.bind(this)],["xAxis",{mode:this.config.xAxisMode,height:this.height},function(){var t=this.state;return t.xAxis.calcLabels=getShortenedLabels(this.width,t.xAxis.labels,this.config.xIsSeries),t.xAxis}.bind(this)],["yRegions",{width:this.width,pos:"right"},function(){return this.state.yRegions}.bind(this)]],n=this.state.datasets.filter(function(t){return "bar"===t.chartType}),i=this.state.datasets.filter(function(t){return "line"===t.chartType}),a=n.map(function(e){var i=e.index;return ["barGraph-"+e.index,{index:i,color:t.colors[i],stacked:t.barOptions.stacked,valuesOverPoints:t.config.valuesOverPoints,minHeight:t.height*MIN_BAR_PERCENT_HEIGHT},function(){var t=this.state,e=t.datasets[i],a=this.barOptions.stacked,r=this.barOptions.spaceRatio||BAR_CHART_SPACE_RATIO,s=t.unitWidth*(1-r),o=s/(a?1:n.length),l=t.xAxis.positions.map(function(t){return t-s/2});a||(l=l.map(function(t){return t+o*i}));var u=new Array(t.datasetLength).fill("");this.config.valuesOverPoints&&(u=a&&e.index===t.datasets.length-1?e.cumulativeYs:e.values);var c=new Array(t.datasetLength).fill(0);return a&&(c=e.yPositions.map(function(t,n){return t-e.cumulativeYPos[n]})),{xPositions:l,yPositions:e.yPositions,offsets:c,labels:u,zeroLine:t.yAxis.zeroLine,barsWidth:s,barWidth:o}}.bind(t)]}),r=i.map(function(e){var n=e.index;return ["lineGraph-"+e.index,{index:n,color:t.colors[n],svgDefs:t.svgDefs,heatline:t.lineOptions.heatline,regionFill:t.lineOptions.regionFill,spline:t.lineOptions.spline,hideDots:t.lineOptions.hideDots,hideLine:t.lineOptions.hideLine,valuesOverPoints:t.config.valuesOverPoints},function(){var t=this.state,e=t.datasets[n],i=t.yAxis.positions[0]<t.yAxis.zeroLine?t.yAxis.positions[0]:t.yAxis.zeroLine;return {xPositions:t.xAxis.positions,yPositions:e.yPositions,values:e.values,zeroLine:i,radius:this.lineOptions.dotSize||LINE_CHART_DOT_SIZE}}.bind(t)]}),s=[["yMarkers",{width:this.width,pos:"right"},function(){return this.state.yMarkers}.bind(this)]];e=e.concat(a,r,s);var o=["yMarkers","yRegions"];this.dataUnitComponents=[],this.components=new Map(e.filter(function(e){return !o.includes(e[0])||t.state[e[0]]}).map(function(e){var n=getComponent.apply(void 0,_toConsumableArray$5(e));return (e[0].includes("lineGraph")||e[0].includes("barGraph"))&&t.dataUnitComponents.push(n),[e[0],n]}));}},{key:"makeDataByIndex",value:function(){var t=this;this.dataByIndex={};var e=this.state,n=this.config.formatTooltipX,i=this.config.formatTooltipY;e.xAxis.labels.map(function(a,r){var s=t.state.datasets.map(function(e,n){var a=e.values[r];return {title:e.name,value:a,yPos:e.yPositions[r],color:t.colors[n],formatted:i?i(a):a}});t.dataByIndex[r]={label:a,formattedLabel:n?n(a):a,xPos:e.xAxis.positions[r],values:s,yExtreme:e.yExtremes[r]};});}},{key:"bindTooltip",value:function(){var t=this;this.container.addEventListener("mousemove",function(e){var n=t.measures,i=getOffset(t.container),a=e.pageX-i.left-getLeftOffset(n),r=e.pageY-i.top;r<t.height+getTopOffset(n)&&r>getTopOffset(n)?t.mapTooltipXPosition(a):t.tip.hideTip();});}},{key:"mapTooltipXPosition",value:function(t){var e=this.state;if(e.yExtremes){var n=getClosestInArray(t,e.xAxis.positions,!0);if(n>=0){var i=this.dataByIndex[n];this.tip.setValues(i.xPos+this.tip.offset.x,i.yExtreme+this.tip.offset.y,{name:i.formattedLabel,value:""},i.values,n),this.tip.showTip();}}}},{key:"renderLegend",value:function(){var t=this,e=this.data;e.datasets.length>1&&(this.legendArea.textContent="",e.datasets.map(function(e,n){var i=AXIS_LEGEND_BAR_SIZE,a=legendBar(i*n,"0",i,t.colors[n],e.name,t.config.truncateLegends);t.legendArea.appendChild(a);}));}},{key:"makeOverlay",value:function(){var t=this;if(this.init)return void(this.init=0);this.overlayGuides&&this.overlayGuides.forEach(function(t){var e=t.overlay;e.parentNode.removeChild(e);}),this.overlayGuides=this.dataUnitComponents.map(function(t){return {type:t.unitType,overlay:void 0,units:t.units}}),void 0===this.state.currentIndex&&(this.state.currentIndex=this.state.datasetLength-1),this.overlayGuides.map(function(e){var n=e.units[t.state.currentIndex];e.overlay=makeOverlay[e.type](n),t.drawArea.appendChild(e.overlay);});}},{key:"updateOverlayGuides",value:function(){this.overlayGuides&&this.overlayGuides.forEach(function(t){var e=t.overlay;e.parentNode.removeChild(e);});}},{key:"bindOverlay",value:function(){var t=this;this.parent.addEventListener("data-select",function(){t.updateOverlay();});}},{key:"bindUnits",value:function(){var t=this;this.dataUnitComponents.map(function(e){e.units.map(function(e){e.addEventListener("click",function(){var n=e.getAttribute("data-point-index");t.setCurrentDataPoint(n);});});}),this.tip.container.addEventListener("click",function(){var e=t.tip.container.getAttribute("data-point-index");t.setCurrentDataPoint(e);});}},{key:"updateOverlay",value:function(){var t=this;this.overlayGuides.map(function(e){var n=e.units[t.state.currentIndex];updateOverlay[e.type](n,e.overlay);});}},{key:"onLeftArrow",value:function(){this.setCurrentDataPoint(this.state.currentIndex-1);}},{key:"onRightArrow",value:function(){this.setCurrentDataPoint(this.state.currentIndex+1);}},{key:"getDataPoint",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.state.currentIndex,e=this.state;return {index:t,label:e.xAxis.labels[t],values:e.datasets.map(function(e){return e.values[t]})}}},{key:"setCurrentDataPoint",value:function(t){var e=this.state;(t=parseInt(t))<0&&(t=0),t>=e.xAxis.labels.length&&(t=e.xAxis.labels.length-1),t!==e.currentIndex&&(e.currentIndex=t,fire(this.parent,"data-select",this.getDataPoint()));}},{key:"addDataPoint",value:function(t,n){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this.state.datasetLength;_get$3(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"addDataPoint",this).call(this,t,n,i),this.data.labels.splice(i,0,t),this.data.datasets.map(function(t,e){t.values.splice(i,0,n[e]);}),this.update(this.data);}},{key:"removeDataPoint",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.state.datasetLength-1;this.data.labels.length<=1||(_get$3(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"removeDataPoint",this).call(this,t),this.data.labels.splice(t,1),this.data.datasets.map(function(e){e.values.splice(t,1);}),this.update(this.data));}},{key:"updateDataset",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;this.data.datasets[e].values=t,this.update(this.data);}},{key:"updateDatasets",value:function(t){this.data.datasets.map(function(e,n){t[n]&&(e.values=t[n]);}),this.update(this.data);}}]),e}(BaseChart),_createClass$8=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),_get$4=function t(e,n,i){null===e&&(e=Function.prototype);var a=Object.getOwnPropertyDescriptor(e,n);if(void 0===a){var r=Object.getPrototypeOf(e);return null===r?void 0:t(r,n,i)}if("value"in a)return a.value;var s=a.get;if(void 0!==s)return s.call(i)},DonutChart=function(t){function e(t,n){_classCallCheck$9(this,e);var i=_possibleConstructorReturn$5(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return i.type="donut",i.initTimeout=0,i.init=1,i.setup(),i}return _inherits$5(e,t),_createClass$8(e,[{key:"configure",value:function(t){_get$4(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"configure",this).call(this,t),this.mouseMove=this.mouseMove.bind(this),this.mouseLeave=this.mouseLeave.bind(this),this.hoverRadio=t.hoverRadio||.1,this.config.startAngle=t.startAngle||0,this.clockWise=t.clockWise||!1,this.strokeWidth=t.strokeWidth||30;}},{key:"calc",value:function(){var t=this;_get$4(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"calc",this).call(this);var n=this.state;this.radius=this.height>this.width?this.center.x-this.strokeWidth/2:this.center.y-this.strokeWidth/2;var i=this.radius,a=this.clockWise,r=n.slicesProperties||[];n.sliceStrings=[],n.slicesProperties=[];var s=180-this.config.startAngle;n.sliceTotals.map(function(e,o){var l=s,u=e/n.grandTotal*FULL_ANGLE,c=u>180?1:0,h=a?-u:u,d=s+=h,f=getPositionByAngle(l,i),p=getPositionByAngle(d,i),v=t.init&&r[o],g=void 0,y=void 0;t.init?(g=v?v.startPosition:f,y=v?v.endPosition:f):(g=f,y=p);var m=360===u?makeStrokeCircleStr(g,y,t.center,t.radius,t.clockWise,c):makeArcStrokePathStr(g,y,t.center,t.radius,t.clockWise,c);n.sliceStrings.push(m),n.slicesProperties.push({startPosition:f,endPosition:p,value:e,total:n.grandTotal,startAngle:l,endAngle:d,angle:h});}),this.init=0;}},{key:"setupComponents",value:function(){var t=this.state,e=[["donutSlices",{},function(){return {sliceStrings:t.sliceStrings,colors:this.colors,strokeWidth:this.strokeWidth}}.bind(this)]];this.components=new Map(e.map(function(t){var e=getComponent.apply(void 0,_toConsumableArray$7(t));return [t[0],e]}));}},{key:"calTranslateByAngle",value:function(t){var e=this.radius,n=this.hoverRadio,i=getPositionByAngle(t.startAngle+t.angle/2,e);return "translate3d("+i.x*n+"px,"+i.y*n+"px,0)"}},{key:"hoverSlice",value:function(t,e,n,i){if(t){var a=this.colors[e];if(n){transform(t,this.calTranslateByAngle(this.state.slicesProperties[e])),t.style.stroke=lightenDarkenColor(a,50);var r=getOffset(this.svg),s=i.pageX-r.left+10,o=i.pageY-r.top-10,l=(this.formatted_labels&&this.formatted_labels.length>0?this.formatted_labels[e]:this.state.labels[e])+": ",u=(100*this.state.sliceTotals[e]/this.state.grandTotal).toFixed(1);this.tip.setValues(s,o,{name:l,value:u+"%"}),this.tip.showTip();}else transform(t,"translate3d(0,0,0)"),this.tip.hideTip(),t.style.stroke=a;}}},{key:"bindTooltip",value:function(){this.container.addEventListener("mousemove",this.mouseMove),this.container.addEventListener("mouseleave",this.mouseLeave);}},{key:"mouseMove",value:function(t){var e=t.target,n=this.components.get("donutSlices").store,i=this.curActiveSliceIndex,a=this.curActiveSlice;if(n.includes(e)){var r=n.indexOf(e);this.hoverSlice(a,i,!1),this.curActiveSlice=e,this.curActiveSliceIndex=r,this.hoverSlice(e,r,!0,t);}else this.mouseLeave();}},{key:"mouseLeave",value:function(){this.hoverSlice(this.curActiveSlice,this.curActiveSliceIndex,!1);}}]),e}(AggregationChart),chartTypes={bar:AxisChart,line:AxisChart,percentage:PercentageChart,heatmap:Heatmap,pie:PieChart,donut:DonutChart},Chart=function t(e,n){return _classCallCheck(this,t),getChartByType(n.type,e,n)};exports.Chart=Chart,exports.PercentageChart=PercentageChart,exports.PieChart=PieChart,exports.Heatmap=Heatmap,exports.AxisChart=AxisChart;

    });

    /* node_modules/svelte-frappe-charts/src/components/base.svelte generated by Svelte v3.28.0 */
    const file$1 = "node_modules/svelte-frappe-charts/src/components/base.svelte";

    function create_fragment$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$1, 84, 0, 1983);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[15](div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[15](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Base", slots, []);

    	let { data = {
    		labels: [],
    		datasets: [{ values: [] }],
    		yMarkers: {},
    		yRegions: []
    	} } = $$props;

    	let { type = "line" } = $$props;
    	let { height = 300 } = $$props;
    	let { axisOptions = {} } = $$props;
    	let { barOptions = {} } = $$props;
    	let { lineOptions = {} } = $$props;
    	let { tooltipOptions = {} } = $$props;
    	let { colors = [] } = $$props;
    	let { valuesOverPoints = 0 } = $$props;
    	let { isNavigable = false } = $$props;
    	let { maxSlices = 3 } = $$props;

    	/**
     *  COMPONENT
     */
    	//  The Chart returned from frappe
    	let chart = null;

    	//  DOM node for frappe to latch onto
    	let chartRef;

    	//  Helper HOF for calling a fn only if chart exists
    	function ifChartThen(fn) {
    		return function ifChart(...args) {
    			if (chart) {
    				return fn(...args);
    			}
    		};
    	}

    	const addDataPoint = ifChartThen((label, valueFromEachDataset, index) => chart.addDataPoint(label, valueFromEachDataset, index));
    	const removeDataPoint = ifChartThen(index => chart.removeDataPoint(index));
    	const exportChart = ifChartThen(() => chart.export());

    	/**
     *  Handle initializing the chart when this Svelte component mounts 
     */
    	onMount(() => {
    		chart = new frappeCharts_min_cjs.Chart(chartRef,
    		{
    				data,
    				type,
    				height,
    				colors,
    				axisOptions,
    				barOptions,
    				lineOptions,
    				tooltipOptions,
    				valuesOverPoints,
    				isNavigable,
    				maxSlices
    			});
    	});

    	//  Update the chart when incoming data changes
    	afterUpdate(() => chart.update(data));

    	//  Mark Chart references for garbage collection when component is unmounted
    	onDestroy(() => {
    		chart = null;
    	});

    	const writable_props = [
    		"data",
    		"type",
    		"height",
    		"axisOptions",
    		"barOptions",
    		"lineOptions",
    		"tooltipOptions",
    		"colors",
    		"valuesOverPoints",
    		"isNavigable",
    		"maxSlices"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Base> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			chartRef = $$value;
    			$$invalidate(0, chartRef);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("height" in $$props) $$invalidate(3, height = $$props.height);
    		if ("axisOptions" in $$props) $$invalidate(4, axisOptions = $$props.axisOptions);
    		if ("barOptions" in $$props) $$invalidate(5, barOptions = $$props.barOptions);
    		if ("lineOptions" in $$props) $$invalidate(6, lineOptions = $$props.lineOptions);
    		if ("tooltipOptions" in $$props) $$invalidate(7, tooltipOptions = $$props.tooltipOptions);
    		if ("colors" in $$props) $$invalidate(8, colors = $$props.colors);
    		if ("valuesOverPoints" in $$props) $$invalidate(9, valuesOverPoints = $$props.valuesOverPoints);
    		if ("isNavigable" in $$props) $$invalidate(10, isNavigable = $$props.isNavigable);
    		if ("maxSlices" in $$props) $$invalidate(11, maxSlices = $$props.maxSlices);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		afterUpdate,
    		onDestroy,
    		Chart: frappeCharts_min_cjs.Chart,
    		data,
    		type,
    		height,
    		axisOptions,
    		barOptions,
    		lineOptions,
    		tooltipOptions,
    		colors,
    		valuesOverPoints,
    		isNavigable,
    		maxSlices,
    		chart,
    		chartRef,
    		ifChartThen,
    		addDataPoint,
    		removeDataPoint,
    		exportChart
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("height" in $$props) $$invalidate(3, height = $$props.height);
    		if ("axisOptions" in $$props) $$invalidate(4, axisOptions = $$props.axisOptions);
    		if ("barOptions" in $$props) $$invalidate(5, barOptions = $$props.barOptions);
    		if ("lineOptions" in $$props) $$invalidate(6, lineOptions = $$props.lineOptions);
    		if ("tooltipOptions" in $$props) $$invalidate(7, tooltipOptions = $$props.tooltipOptions);
    		if ("colors" in $$props) $$invalidate(8, colors = $$props.colors);
    		if ("valuesOverPoints" in $$props) $$invalidate(9, valuesOverPoints = $$props.valuesOverPoints);
    		if ("isNavigable" in $$props) $$invalidate(10, isNavigable = $$props.isNavigable);
    		if ("maxSlices" in $$props) $$invalidate(11, maxSlices = $$props.maxSlices);
    		if ("chart" in $$props) chart = $$props.chart;
    		if ("chartRef" in $$props) $$invalidate(0, chartRef = $$props.chartRef);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		chartRef,
    		data,
    		type,
    		height,
    		axisOptions,
    		barOptions,
    		lineOptions,
    		tooltipOptions,
    		colors,
    		valuesOverPoints,
    		isNavigable,
    		maxSlices,
    		addDataPoint,
    		removeDataPoint,
    		exportChart,
    		div_binding
    	];
    }

    class Base extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			data: 1,
    			type: 2,
    			height: 3,
    			axisOptions: 4,
    			barOptions: 5,
    			lineOptions: 6,
    			tooltipOptions: 7,
    			colors: 8,
    			valuesOverPoints: 9,
    			isNavigable: 10,
    			maxSlices: 11,
    			addDataPoint: 12,
    			removeDataPoint: 13,
    			exportChart: 14
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Base",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get data() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get axisOptions() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set axisOptions(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get barOptions() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set barOptions(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lineOptions() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lineOptions(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tooltipOptions() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltipOptions(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colors() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valuesOverPoints() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valuesOverPoints(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isNavigable() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isNavigable(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxSlices() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxSlices(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addDataPoint() {
    		return this.$$.ctx[12];
    	}

    	set addDataPoint(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get removeDataPoint() {
    		return this.$$.ctx[13];
    	}

    	set removeDataPoint(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exportChart() {
    		return this.$$.ctx[14];
    	}

    	set exportChart(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/login.svelte generated by Svelte v3.28.0 */

    const { console: console_1 } = globals;
    const file$2 = "src/routes/login.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[52] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[53] = list[i];
    	child_ctx[55] = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[48] = list[i];
    	child_ctx[50] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[59] = list[i];
    	child_ctx[61] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[56] = list[i];
    	return child_ctx;
    }

    // (726:0) {:else}
    function create_else_block$1(ctx) {
    	let mainBody;
    	let div;
    	let center1;
    	let header;
    	let h1;
    	let center0;
    	let img;
    	let img_src_value;
    	let t0;
    	let t1_value = /*user*/ ctx[3].name.toUpperCase() + "";
    	let t1;
    	let t2;
    	let t3;
    	let center2;
    	let menu;
    	let ul;
    	let t4;
    	let li0;
    	let menuButton0;
    	let t6;
    	let t7;
    	let li1;
    	let menuButton1;
    	let t9;
    	let t10;
    	let li2;
    	let menuButton2;
    	let t12;
    	let t13;
    	let t14;
    	let t15;
    	let t16;
    	let t17;
    	let section;
    	let br0;
    	let t18;
    	let br1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*settings_page*/ ctx[13] && create_if_block_9(ctx);
    	let if_block1 = /*instruments_page*/ ctx[14] && create_if_block_6(ctx);
    	let if_block2 = /*collections_page*/ ctx[15] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			mainBody = element("mainBody");
    			div = element("div");
    			center1 = element("center");
    			header = element("header");
    			h1 = element("h1");
    			center0 = element("center");
    			img = element("img");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = text("'s Profile");
    			t3 = space();
    			center2 = element("center");
    			menu = element("menu");
    			ul = element("ul");
    			t4 = text("||\n          ");
    			li0 = element("li");
    			menuButton0 = element("menuButton");
    			menuButton0.textContent = "Settings";
    			t6 = space();
    			t7 = text("||\n          ");
    			li1 = element("li");
    			menuButton1 = element("menuButton");
    			menuButton1.textContent = "Instruments";
    			t9 = space();
    			t10 = text("||\n          ");
    			li2 = element("li");
    			menuButton2 = element("menuButton");
    			menuButton2.textContent = "Collections";
    			t12 = space();
    			t13 = text("||");
    			t14 = space();
    			if (if_block0) if_block0.c();
    			t15 = space();
    			if (if_block1) if_block1.c();
    			t16 = space();
    			if (if_block2) if_block2.c();
    			t17 = space();
    			section = element("section");
    			br0 = element("br");
    			t18 = space();
    			br1 = element("br");
    			if (img.src !== (img_src_value = get_gravatar(/*user*/ ctx[3].email, 200))) attr_dev(img, "src", img_src_value);
    			add_location(img, file$2, 731, 20, 21292);
    			add_location(center0, file$2, 731, 12, 21284);
    			attr_dev(h1, "id", "tiptop");
    			attr_dev(h1, "class", "svelte-160fwfv");
    			add_location(h1, file$2, 730, 10, 21255);
    			attr_dev(header, "class", "header");
    			add_location(header, file$2, 729, 8, 21221);
    			add_location(center1, file$2, 728, 6, 21204);
    			attr_dev(div, "class", "container");
    			add_location(div, file$2, 727, 4, 21174);
    			attr_dev(menuButton0, "class", "svelte-160fwfv");
    			add_location(menuButton0, file$2, 742, 12, 21533);
    			attr_dev(li0, "class", "svelte-160fwfv");
    			add_location(li0, file$2, 741, 10, 21516);
    			attr_dev(menuButton1, "class", "svelte-160fwfv");
    			add_location(menuButton1, file$2, 745, 12, 21636);
    			attr_dev(li1, "class", "svelte-160fwfv");
    			add_location(li1, file$2, 744, 10, 21619);
    			attr_dev(menuButton2, "class", "svelte-160fwfv");
    			add_location(menuButton2, file$2, 748, 12, 21745);
    			attr_dev(li2, "class", "svelte-160fwfv");
    			add_location(li2, file$2, 747, 10, 21728);
    			add_location(ul, file$2, 739, 8, 21488);
    			attr_dev(menu, "class", "svelte-160fwfv");
    			add_location(menu, file$2, 738, 6, 21473);
    			add_location(center2, file$2, 737, 4, 21458);
    			add_location(br0, file$2, 854, 13, 25207);
    			add_location(br1, file$2, 854, 20, 25214);
    			attr_dev(section, "class", "svelte-160fwfv");
    			add_location(section, file$2, 854, 4, 25198);
    			attr_dev(mainBody, "class", "svelte-160fwfv");
    			add_location(mainBody, file$2, 726, 2, 21159);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, mainBody, anchor);
    			append_dev(mainBody, div);
    			append_dev(div, center1);
    			append_dev(center1, header);
    			append_dev(header, h1);
    			append_dev(h1, center0);
    			append_dev(center0, img);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(mainBody, t3);
    			append_dev(mainBody, center2);
    			append_dev(center2, menu);
    			append_dev(menu, ul);
    			append_dev(ul, t4);
    			append_dev(ul, li0);
    			append_dev(li0, menuButton0);
    			append_dev(li0, t6);
    			append_dev(ul, t7);
    			append_dev(ul, li1);
    			append_dev(li1, menuButton1);
    			append_dev(li1, t9);
    			append_dev(ul, t10);
    			append_dev(ul, li2);
    			append_dev(li2, menuButton2);
    			append_dev(li2, t12);
    			append_dev(ul, t13);
    			append_dev(mainBody, t14);
    			if (if_block0) if_block0.m(mainBody, null);
    			append_dev(mainBody, t15);
    			if (if_block1) if_block1.m(mainBody, null);
    			append_dev(mainBody, t16);
    			if (if_block2) if_block2.m(mainBody, null);
    			append_dev(mainBody, t17);
    			append_dev(mainBody, section);
    			append_dev(section, br0);
    			append_dev(section, t18);
    			append_dev(section, br1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(menuButton0, "click", /*goToSettings*/ ctx[25], false, false, false),
    					listen_dev(menuButton1, "click", /*goToInstruments*/ ctx[26], false, false, false),
    					listen_dev(menuButton2, "click", /*goToCollections*/ ctx[27], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*user*/ 8 && img.src !== (img_src_value = get_gravatar(/*user*/ ctx[3].email, 200))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if ((!current || dirty[0] & /*user*/ 8) && t1_value !== (t1_value = /*user*/ ctx[3].name.toUpperCase() + "")) set_data_dev(t1, t1_value);

    			if (/*settings_page*/ ctx[13]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_9(ctx);
    					if_block0.c();
    					if_block0.m(mainBody, t15);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*instruments_page*/ ctx[14]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*instruments_page*/ 16384) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(mainBody, t16);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*collections_page*/ ctx[15]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					if_block2.m(mainBody, t17);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(mainBody);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(726:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (698:18) 
    function create_if_block_1$1(ctx) {
    	let section;
    	let main;
    	let h1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let form;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let label1;
    	let t3;
    	let input1;
    	let t4;
    	let label2;
    	let t5;
    	let input2;
    	let t6;
    	let label3;
    	let t7;
    	let input3;
    	let t8;
    	let label4;
    	let t9;
    	let input4;
    	let t10;
    	let div;
    	let button;
    	let t12;
    	let p;
    	let t13;
    	let img1;
    	let img1_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			main = element("main");
    			h1 = element("h1");
    			img0 = element("img");
    			t0 = space();
    			form = element("form");
    			label0 = element("label");
    			t1 = text("Username ");
    			input0 = element("input");
    			t2 = space();
    			label1 = element("label");
    			t3 = text("Email ");
    			input1 = element("input");
    			t4 = space();
    			label2 = element("label");
    			t5 = text("Company ");
    			input2 = element("input");
    			t6 = space();
    			label3 = element("label");
    			t7 = text("Password\n          ");
    			input3 = element("input");
    			t8 = space();
    			label4 = element("label");
    			t9 = text("Confirm\n          ");
    			input4 = element("input");
    			t10 = space();
    			div = element("div");
    			button = element("button");
    			button.textContent = "Login";
    			t12 = space();
    			p = element("p");
    			t13 = text("Powered by\n          ");
    			img1 = element("img");
    			if (img0.src !== (img0_src_value = "/img/MyOPC_200x200.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "MyOPC");
    			add_location(img0, file$2, 700, 10, 20245);
    			add_location(h1, file$2, 700, 6, 20241);
    			input0.required = true;
    			add_location(input0, file$2, 704, 25, 20441);
    			add_location(label0, file$2, 704, 8, 20424);
    			input1.required = true;
    			add_location(input1, file$2, 705, 22, 20517);
    			add_location(label1, file$2, 705, 8, 20503);
    			input2.required = true;
    			add_location(input2, file$2, 706, 24, 20592);
    			add_location(label2, file$2, 706, 8, 20576);
    			attr_dev(input3, "type", "password");
    			input3.required = true;
    			add_location(input3, file$2, 709, 10, 20690);
    			add_location(label3, file$2, 707, 8, 20653);
    			attr_dev(input4, "type", "password");
    			input4.required = true;
    			add_location(input4, file$2, 713, 10, 20811);
    			add_location(label4, file$2, 711, 8, 20775);
    			add_location(button, file$2, 715, 29, 20925);
    			attr_dev(div, "class", "buttons");
    			add_location(div, file$2, 715, 8, 20904);
    			if (img1.src !== (img1_src_value = "/img/small_BA_logo_75x75_Cropped.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "BRIDGES AUTOMATION");
    			add_location(img1, file$2, 718, 10, 20997);
    			attr_dev(p, "class", "svelte-160fwfv");
    			add_location(p, file$2, 716, 8, 20962);
    			add_location(form, file$2, 702, 6, 20306);
    			attr_dev(main, "class", "svelte-160fwfv");
    			add_location(main, file$2, 699, 4, 20228);
    			attr_dev(section, "class", "svelte-160fwfv");
    			add_location(section, file$2, 698, 2, 20214);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, main);
    			append_dev(main, h1);
    			append_dev(h1, img0);
    			append_dev(main, t0);
    			append_dev(main, form);
    			append_dev(form, label0);
    			append_dev(label0, t1);
    			append_dev(label0, input0);
    			set_input_value(input0, /*reg_username*/ ctx[10]);
    			append_dev(form, t2);
    			append_dev(form, label1);
    			append_dev(label1, t3);
    			append_dev(label1, input1);
    			set_input_value(input1, /*reg_email*/ ctx[7]);
    			append_dev(form, t4);
    			append_dev(form, label2);
    			append_dev(label2, t5);
    			append_dev(label2, input2);
    			set_input_value(input2, /*reg_company*/ ctx[11]);
    			append_dev(form, t6);
    			append_dev(form, label3);
    			append_dev(label3, t7);
    			append_dev(label3, input3);
    			set_input_value(input3, /*reg_passwrd*/ ctx[8]);
    			append_dev(form, t8);
    			append_dev(form, label4);
    			append_dev(label4, t9);
    			append_dev(label4, input4);
    			set_input_value(input4, /*reg_passwrd_confirm*/ ctx[9]);
    			append_dev(form, t10);
    			append_dev(form, div);
    			append_dev(div, button);
    			append_dev(form, t12);
    			append_dev(form, p);
    			append_dev(p, t13);
    			append_dev(p, img1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler_1*/ ctx[31]),
    					listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[32]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[33]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[34]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[35]),
    					listen_dev(
    						form,
    						"submit",
    						prevent_default(function () {
    							if (is_function(/*register*/ ctx[23](/*reg_username*/ ctx[10], /*reg_email*/ ctx[7], /*reg_passwrd*/ ctx[8], /*reg_passwrd_confirm*/ ctx[9]))) /*register*/ ctx[23](/*reg_username*/ ctx[10], /*reg_email*/ ctx[7], /*reg_passwrd*/ ctx[8], /*reg_passwrd_confirm*/ ctx[9]).apply(this, arguments);
    						}),
    						false,
    						true,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*reg_username*/ 1024 && input0.value !== /*reg_username*/ ctx[10]) {
    				set_input_value(input0, /*reg_username*/ ctx[10]);
    			}

    			if (dirty[0] & /*reg_email*/ 128 && input1.value !== /*reg_email*/ ctx[7]) {
    				set_input_value(input1, /*reg_email*/ ctx[7]);
    			}

    			if (dirty[0] & /*reg_company*/ 2048 && input2.value !== /*reg_company*/ ctx[11]) {
    				set_input_value(input2, /*reg_company*/ ctx[11]);
    			}

    			if (dirty[0] & /*reg_passwrd*/ 256 && input3.value !== /*reg_passwrd*/ ctx[8]) {
    				set_input_value(input3, /*reg_passwrd*/ ctx[8]);
    			}

    			if (dirty[0] & /*reg_passwrd_confirm*/ 512 && input4.value !== /*reg_passwrd_confirm*/ ctx[9]) {
    				set_input_value(input4, /*reg_passwrd_confirm*/ ctx[9]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(698:18) ",
    		ctx
    	});

    	return block;
    }

    // (672:0) {#if login_visi && !sign_up}
    function create_if_block$1(ctx) {
    	let section;
    	let main;
    	let h1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let form;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let label1;
    	let t3;
    	let input1;
    	let t4;
    	let div;
    	let button0;
    	let t6;
    	let button1;
    	let t8;
    	let p0;
    	let t9;
    	let img1;
    	let img1_src_value;
    	let t10;
    	let chart;
    	let t11;
    	let p1;
    	let current;
    	let mounted;
    	let dispose;

    	chart = new Base({
    			props: { data: /*data*/ ctx[20], type: "line" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			main = element("main");
    			h1 = element("h1");
    			img0 = element("img");
    			t0 = space();
    			form = element("form");
    			label0 = element("label");
    			t1 = text("Username ");
    			input0 = element("input");
    			t2 = space();
    			label1 = element("label");
    			t3 = text("Password\n          ");
    			input1 = element("input");
    			t4 = space();
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Login";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "Sign Up";
    			t8 = space();
    			p0 = element("p");
    			t9 = text("Powered by\n          ");
    			img1 = element("img");
    			t10 = space();
    			create_component(chart.$$.fragment);
    			t11 = space();
    			p1 = element("p");
    			if (img0.src !== (img0_src_value = "/img/MyOPC_200x200.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "MyOPC");
    			add_location(img0, file$2, 674, 10, 19495);
    			add_location(h1, file$2, 674, 6, 19491);
    			input0.required = true;
    			add_location(input0, file$2, 677, 25, 19641);
    			add_location(label0, file$2, 677, 8, 19624);
    			attr_dev(input1, "type", "password");
    			input1.required = true;
    			add_location(input1, file$2, 680, 10, 19736);
    			add_location(label1, file$2, 678, 8, 19699);
    			add_location(button0, file$2, 683, 10, 19850);
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$2, 684, 10, 19883);
    			attr_dev(div, "class", "buttons");
    			add_location(div, file$2, 682, 8, 19818);
    			if (img1.src !== (img1_src_value = "/img/small_BA_logo_75x75_Cropped.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "BRIDGES AUTOMATION");
    			add_location(img1, file$2, 688, 10, 19998);
    			attr_dev(p0, "class", "svelte-160fwfv");
    			add_location(p0, file$2, 686, 8, 19963);
    			add_location(form, file$2, 676, 6, 19556);
    			attr_dev(main, "class", "svelte-160fwfv");
    			add_location(main, file$2, 673, 4, 19478);
    			attr_dev(p1, "class", "svelte-160fwfv");
    			add_location(p1, file$2, 695, 4, 20174);
    			attr_dev(section, "class", "svelte-160fwfv");
    			add_location(section, file$2, 672, 2, 19464);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, main);
    			append_dev(main, h1);
    			append_dev(h1, img0);
    			append_dev(main, t0);
    			append_dev(main, form);
    			append_dev(form, label0);
    			append_dev(label0, t1);
    			append_dev(label0, input0);
    			set_input_value(input0, /*username*/ ctx[1]);
    			append_dev(form, t2);
    			append_dev(form, label1);
    			append_dev(label1, t3);
    			append_dev(label1, input1);
    			set_input_value(input1, /*password*/ ctx[0]);
    			append_dev(form, t4);
    			append_dev(form, div);
    			append_dev(div, button0);
    			append_dev(div, t6);
    			append_dev(div, button1);
    			append_dev(form, t8);
    			append_dev(form, p0);
    			append_dev(p0, t9);
    			append_dev(p0, img1);
    			append_dev(section, t10);
    			mount_component(chart, section, null);
    			append_dev(section, t11);
    			append_dev(section, p1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[29]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[30]),
    					listen_dev(button1, "click", /*signup*/ ctx[22], false, false, false),
    					listen_dev(
    						form,
    						"submit",
    						prevent_default(function () {
    							if (is_function(/*login*/ ctx[21](/*username*/ ctx[1], /*password*/ ctx[0]))) /*login*/ ctx[21](/*username*/ ctx[1], /*password*/ ctx[0]).apply(this, arguments);
    						}),
    						false,
    						true,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*username*/ 2 && input0.value !== /*username*/ ctx[1]) {
    				set_input_value(input0, /*username*/ ctx[1]);
    			}

    			if (dirty[0] & /*password*/ 1 && input1.value !== /*password*/ ctx[0]) {
    				set_input_value(input1, /*password*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(chart);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(672:0) {#if login_visi && !sign_up}",
    		ctx
    	});

    	return block;
    }

    // (755:4) {#if settings_page}
    function create_if_block_9(ctx) {
    	let settings_page_1;
    	let center;
    	let p10;
    	let t0;
    	let t1_value = /*user*/ ctx[3].email + "";
    	let t1;
    	let t2;
    	let br0;
    	let t3;
    	let p2;
    	let t4;
    	let t5_value = (/*profile*/ ctx[4].company || "Loding....") + "";
    	let t5;
    	let t6;
    	let br1;
    	let t7;
    	let br2;
    	let t8;
    	let p11;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			settings_page_1 = element("settings_page");
    			center = element("center");
    			p10 = element("p1");
    			t0 = text("Email: ");
    			t1 = text(t1_value);
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			p2 = element("p2");
    			t4 = text("Company: ");
    			t5 = text(t5_value);
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			br2 = element("br");
    			t8 = space();
    			p11 = element("p1");
    			p11.textContent = "Need an API key? Click here ==";
    			button = element("button");
    			button.textContent = "API Key Generator";
    			add_location(p10, file$2, 757, 10, 21943);
    			add_location(br0, file$2, 758, 10, 21982);
    			add_location(p2, file$2, 759, 10, 21999);
    			add_location(br1, file$2, 760, 10, 22061);
    			add_location(br2, file$2, 761, 10, 22078);
    			add_location(p11, file$2, 762, 10, 22095);
    			attr_dev(button, "type", "button");
    			add_location(button, file$2, 762, 49, 22134);
    			add_location(center, file$2, 756, 8, 21924);
    			add_location(settings_page_1, file$2, 755, 6, 21900);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, settings_page_1, anchor);
    			append_dev(settings_page_1, center);
    			append_dev(center, p10);
    			append_dev(p10, t0);
    			append_dev(p10, t1);
    			append_dev(center, t2);
    			append_dev(center, br0);
    			append_dev(center, t3);
    			append_dev(center, p2);
    			append_dev(p2, t4);
    			append_dev(p2, t5);
    			append_dev(center, t6);
    			append_dev(center, br1);
    			append_dev(center, t7);
    			append_dev(center, br2);
    			append_dev(center, t8);
    			append_dev(center, p11);
    			append_dev(center, button);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*API_Key_Gen*/ ctx[24](/*result*/ ctx[2].token))) /*API_Key_Gen*/ ctx[24](/*result*/ ctx[2].token).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*user*/ 8 && t1_value !== (t1_value = /*user*/ ctx[3].email + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*profile*/ 16 && t5_value !== (t5_value = (/*profile*/ ctx[4].company || "Loding....") + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(settings_page_1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(755:4) {#if settings_page}",
    		ctx
    	});

    	return block;
    }

    // (769:4) {#if instruments_page}
    function create_if_block_6(ctx) {
    	let instruments_page_1;
    	let center;
    	let h3;
    	let t1;
    	let instrumentsss;
    	let current;
    	let if_block = /*result*/ ctx[2] && create_if_block_7(ctx);

    	const block = {
    		c: function create() {
    			instruments_page_1 = element("instruments_page");
    			center = element("center");
    			h3 = element("h3");
    			h3.textContent = "Instruments";
    			t1 = space();
    			instrumentsss = element("instrumentsss");
    			if (if_block) if_block.c();
    			add_location(h3, file$2, 771, 10, 22374);
    			add_location(instrumentsss, file$2, 772, 10, 22405);
    			add_location(center, file$2, 770, 8, 22355);
    			add_location(instruments_page_1, file$2, 769, 6, 22328);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, instruments_page_1, anchor);
    			append_dev(instruments_page_1, center);
    			append_dev(center, h3);
    			append_dev(center, t1);
    			append_dev(center, instrumentsss);
    			if (if_block) if_block.m(instrumentsss, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*result*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*result*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(instrumentsss, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(instruments_page_1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(769:4) {#if instruments_page}",
    		ctx
    	});

    	return block;
    }

    // (774:12) {#if result}
    function create_if_block_7(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_3 = /*instrument_display*/ ctx[12];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*trendData, instrument_display*/ 528384) {
    				each_value_3 = /*instrument_display*/ ctx[12];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_3.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_3.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(774:12) {#if result}",
    		ctx
    	});

    	return block;
    }

    // (778:18) {#if obj.unit_id === trend[0]}
    function create_if_block_8(ctx) {
    	let chart;
    	let current;

    	chart = new Base({
    			props: { data: /*trend*/ ctx[59][1], type: "line" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(chart.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(chart, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(chart, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(778:18) {#if obj.unit_id === trend[0]}",
    		ctx
    	});

    	return block;
    }

    // (777:16) {#each trendData as trend, index}
    function create_each_block_4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*obj*/ ctx[56].unit_id === /*trend*/ ctx[59][0] && create_if_block_8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*obj*/ ctx[56].unit_id === /*trend*/ ctx[59][0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*instrument_display*/ 4096) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(777:16) {#each trendData as trend, index}",
    		ctx
    	});

    	return block;
    }

    // (775:14) {#each instrument_display as obj}
    function create_each_block_3(ctx) {
    	let li;
    	let t0_value = /*obj*/ ctx[56].time_stamp + "";
    	let t0;
    	let t1;
    	let t2_value = /*obj*/ ctx[56].unit_id + "";
    	let t2;
    	let t3;
    	let t4_value = /*obj*/ ctx[56].sensor_reading + "";
    	let t4;
    	let t5;
    	let each_1_anchor;
    	let current;
    	let each_value_4 = /*trendData*/ ctx[19];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text("---");
    			t2 = text(t2_value);
    			t3 = text(": ");
    			t4 = text(t4_value);
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(li, "class", "svelte-160fwfv");
    			add_location(li, file$2, 775, 16, 22510);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);
    			append_dev(li, t4);
    			insert_dev(target, t5, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*instrument_display*/ 4096) && t0_value !== (t0_value = /*obj*/ ctx[56].time_stamp + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty[0] & /*instrument_display*/ 4096) && t2_value !== (t2_value = /*obj*/ ctx[56].unit_id + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty[0] & /*instrument_display*/ 4096) && t4_value !== (t4_value = /*obj*/ ctx[56].sensor_reading + "")) set_data_dev(t4, t4_value);

    			if (dirty[0] & /*trendData, instrument_display*/ 528384) {
    				each_value_4 = /*trendData*/ ctx[19];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_4.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_4.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (detaching) detach_dev(t5);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(775:14) {#each instrument_display as obj}",
    		ctx
    	});

    	return block;
    }

    // (788:4) {#if collections_page}
    function create_if_block_2(ctx) {
    	let collections_page_1;
    	let center;
    	let h3;
    	let t0_value = /*user*/ ctx[3].name + "";
    	let t0;
    	let t1;
    	let button;
    	let t3;
    	let t4;
    	let collections;
    	let mounted;
    	let dispose;
    	let if_block0 = /*addNewCollectionForm*/ ctx[17] && create_if_block_5(ctx);
    	let if_block1 = /*profile*/ ctx[4].collections && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			collections_page_1 = element("collections_page");
    			center = element("center");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = text("'s Hosted Collections\n            ");
    			button = element("button");
    			button.textContent = "add";
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			collections = element("collections");
    			if (if_block1) if_block1.c();
    			add_location(button, file$2, 792, 12, 23041);
    			add_location(h3, file$2, 790, 10, 22979);
    			add_location(collections, file$2, 826, 10, 24271);
    			add_location(center, file$2, 789, 8, 22960);
    			add_location(collections_page_1, file$2, 788, 6, 22933);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, collections_page_1, anchor);
    			append_dev(collections_page_1, center);
    			append_dev(center, h3);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(h3, button);
    			append_dev(center, t3);
    			if (if_block0) if_block0.m(center, null);
    			append_dev(center, t4);
    			append_dev(center, collections);
    			if (if_block1) if_block1.m(collections, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*addNewCollectionButton*/ ctx[28], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*user*/ 8 && t0_value !== (t0_value = /*user*/ ctx[3].name + "")) set_data_dev(t0, t0_value);

    			if (/*addNewCollectionForm*/ ctx[17]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(center, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*profile*/ ctx[4].collections) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(collections, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(collections_page_1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(788:4) {#if collections_page}",
    		ctx
    	});

    	return block;
    }

    // (795:10) {#if addNewCollectionForm}
    function create_if_block_5(ctx) {
    	let form;
    	let label0;
    	let t0;
    	let input0;
    	let t1;
    	let label1;
    	let t2;
    	let input1;
    	let t3;
    	let label2;
    	let t4;
    	let input2;
    	let t5;
    	let label3;
    	let t6;
    	let input3;
    	let t7;
    	let label4;
    	let t8;
    	let input4;
    	let t9;
    	let div;
    	let button;
    	let t11;
    	let p;
    	let t12;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			label0 = element("label");
    			t0 = text("Username\n                ");
    			input0 = element("input");
    			t1 = space();
    			label1 = element("label");
    			t2 = text("Email ");
    			input1 = element("input");
    			t3 = space();
    			label2 = element("label");
    			t4 = text("Company\n                ");
    			input2 = element("input");
    			t5 = space();
    			label3 = element("label");
    			t6 = text("Password\n                ");
    			input3 = element("input");
    			t7 = space();
    			label4 = element("label");
    			t8 = text("Confirm\n                ");
    			input4 = element("input");
    			t9 = space();
    			div = element("div");
    			button = element("button");
    			button.textContent = "Login";
    			t11 = space();
    			p = element("p");
    			t12 = text("Powered by\n                ");
    			img = element("img");
    			input0.required = true;
    			add_location(input0, file$2, 799, 16, 23340);
    			add_location(label0, file$2, 797, 14, 23291);
    			input1.required = true;
    			add_location(input1, file$2, 801, 28, 23436);
    			add_location(label1, file$2, 801, 14, 23422);
    			input2.required = true;
    			add_location(input2, file$2, 804, 16, 23549);
    			add_location(label2, file$2, 802, 14, 23501);
    			attr_dev(input3, "type", "password");
    			input3.required = true;
    			add_location(input3, file$2, 808, 16, 23679);
    			add_location(label3, file$2, 806, 14, 23630);
    			attr_dev(input4, "type", "password");
    			input4.required = true;
    			add_location(input4, file$2, 812, 16, 23824);
    			add_location(label4, file$2, 810, 14, 23776);
    			add_location(button, file$2, 817, 35, 24004);
    			attr_dev(div, "class", "buttons");
    			add_location(div, file$2, 817, 14, 23983);
    			if (img.src !== (img_src_value = "/img/small_BA_logo_75x75_Cropped.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "BRIDGES AUTOMATION");
    			add_location(img, file$2, 820, 16, 24094);
    			attr_dev(p, "class", "svelte-160fwfv");
    			add_location(p, file$2, 818, 14, 24047);
    			add_location(form, file$2, 795, 12, 23161);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, label0);
    			append_dev(label0, t0);
    			append_dev(label0, input0);
    			set_input_value(input0, /*reg_username*/ ctx[10]);
    			append_dev(form, t1);
    			append_dev(form, label1);
    			append_dev(label1, t2);
    			append_dev(label1, input1);
    			set_input_value(input1, /*reg_email*/ ctx[7]);
    			append_dev(form, t3);
    			append_dev(form, label2);
    			append_dev(label2, t4);
    			append_dev(label2, input2);
    			set_input_value(input2, /*reg_company*/ ctx[11]);
    			append_dev(form, t5);
    			append_dev(form, label3);
    			append_dev(label3, t6);
    			append_dev(label3, input3);
    			set_input_value(input3, /*reg_passwrd*/ ctx[8]);
    			append_dev(form, t7);
    			append_dev(form, label4);
    			append_dev(label4, t8);
    			append_dev(label4, input4);
    			set_input_value(input4, /*reg_passwrd_confirm*/ ctx[9]);
    			append_dev(form, t9);
    			append_dev(form, div);
    			append_dev(div, button);
    			append_dev(form, t11);
    			append_dev(form, p);
    			append_dev(p, t12);
    			append_dev(p, img);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler_2*/ ctx[36]),
    					listen_dev(input1, "input", /*input1_input_handler_2*/ ctx[37]),
    					listen_dev(input2, "input", /*input2_input_handler_1*/ ctx[38]),
    					listen_dev(input3, "input", /*input3_input_handler_1*/ ctx[39]),
    					listen_dev(input4, "input", /*input4_input_handler_1*/ ctx[40]),
    					listen_dev(
    						form,
    						"submit",
    						prevent_default(function () {
    							if (is_function(/*register*/ ctx[23](/*reg_username*/ ctx[10], /*reg_email*/ ctx[7], /*reg_passwrd*/ ctx[8], /*reg_passwrd_confirm*/ ctx[9]))) /*register*/ ctx[23](/*reg_username*/ ctx[10], /*reg_email*/ ctx[7], /*reg_passwrd*/ ctx[8], /*reg_passwrd_confirm*/ ctx[9]).apply(this, arguments);
    						}),
    						false,
    						true,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*reg_username*/ 1024 && input0.value !== /*reg_username*/ ctx[10]) {
    				set_input_value(input0, /*reg_username*/ ctx[10]);
    			}

    			if (dirty[0] & /*reg_email*/ 128 && input1.value !== /*reg_email*/ ctx[7]) {
    				set_input_value(input1, /*reg_email*/ ctx[7]);
    			}

    			if (dirty[0] & /*reg_company*/ 2048 && input2.value !== /*reg_company*/ ctx[11]) {
    				set_input_value(input2, /*reg_company*/ ctx[11]);
    			}

    			if (dirty[0] & /*reg_passwrd*/ 256 && input3.value !== /*reg_passwrd*/ ctx[8]) {
    				set_input_value(input3, /*reg_passwrd*/ ctx[8]);
    			}

    			if (dirty[0] & /*reg_passwrd_confirm*/ 512 && input4.value !== /*reg_passwrd_confirm*/ ctx[9]) {
    				set_input_value(input4, /*reg_passwrd_confirm*/ ctx[9]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(795:10) {#if addNewCollectionForm}",
    		ctx
    	});

    	return block;
    }

    // (828:12) {#if profile.collections}
    function create_if_block_3(ctx) {
    	let each_1_anchor;
    	let each_value = /*profile*/ ctx[4].collections;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*profile, collection_details*/ 65552) {
    				each_value = /*profile*/ ctx[4].collections;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(828:12) {#if profile.collections}",
    		ctx
    	});

    	return block;
    }

    // (832:18) {#if collection_details}
    function create_if_block_4(ctx) {
    	let ul;
    	let li0;
    	let t1;
    	let t2;
    	let li1;
    	let t4;
    	let each_value_2 = /*c*/ ctx[48].collection_people;
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*c*/ ctx[48].collection_instruments;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Members";
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "Instuments";
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(li0, "class", "svelte-160fwfv");
    			add_location(li0, file$2, 833, 22, 24545);
    			attr_dev(li1, "class", "svelte-160fwfv");
    			add_location(li1, file$2, 839, 22, 24774);
    			add_location(ul, file$2, 832, 20, 24518);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(ul, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul, null);
    			}

    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(ul, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*profile*/ 16) {
    				each_value_2 = /*c*/ ctx[48].collection_people;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul, t2);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty[0] & /*profile*/ 16) {
    				each_value_1 = /*c*/ ctx[48].collection_instruments;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(832:18) {#if collection_details}",
    		ctx
    	});

    	return block;
    }

    // (835:22) {#each c.collection_people as ppl, k}
    function create_each_block_2(ctx) {
    	let ul;
    	let li;
    	let t_value = /*ppl*/ ctx[53] + "";
    	let t;

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-160fwfv");
    			add_location(li, file$2, 836, 26, 24677);
    			add_location(ul, file$2, 835, 24, 24646);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*profile*/ 16 && t_value !== (t_value = /*ppl*/ ctx[53] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(835:22) {#each c.collection_people as ppl, k}",
    		ctx
    	});

    	return block;
    }

    // (841:22) {#each c.collection_instruments as instrument, l}
    function create_each_block_1(ctx) {
    	let ul;
    	let li;
    	let t0_value = /*instrument*/ ctx[18] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(li, "class", "svelte-160fwfv");
    			add_location(li, file$2, 842, 26, 24921);
    			add_location(ul, file$2, 841, 24, 24890);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li);
    			append_dev(li, t0);
    			append_dev(ul, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*profile*/ 16 && t0_value !== (t0_value = /*instrument*/ ctx[18] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(841:22) {#each c.collection_instruments as instrument, l}",
    		ctx
    	});

    	return block;
    }

    // (829:14) {#each profile.collections as c, j}
    function create_each_block(ctx) {
    	let ul;
    	let li;
    	let t0_value = /*c*/ ctx[48].collection_name + "";
    	let t0;
    	let t1;
    	let t2;
    	let if_block = /*collection_details*/ ctx[16] && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(li, "class", "svelte-160fwfv");
    			add_location(li, file$2, 830, 18, 24426);
    			attr_dev(ul, "id", "dropdown");
    			attr_dev(ul, "class", "svelte-160fwfv");
    			add_location(ul, file$2, 829, 16, 24389);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li);
    			append_dev(li, t0);
    			append_dev(ul, t1);
    			if (if_block) if_block.m(ul, null);
    			append_dev(ul, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*profile*/ 16 && t0_value !== (t0_value = /*c*/ ctx[48].collection_name + "")) set_data_dev(t0, t0_value);

    			if (/*collection_details*/ ctx[16]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(ul, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(829:14) {#each profile.collections as c, j}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_if_block_1$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*login_visi*/ ctx[5] && !/*sign_up*/ ctx[6]) return 0;
    		if (/*sign_up*/ ctx[6]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function get_gravatar(email, size) {
    	// MD5 (Message-Digest Algorithm) by WebToolkit
    	//
    	var MD5 = function (s) {
    		function L(k, d) {
    			return k << d | k >>> 32 - d;
    		}

    		function K(G, k) {
    			var I, d, F, H, x;
    			F = G & 2147483648;
    			H = k & 2147483648;
    			I = G & 1073741824;
    			d = k & 1073741824;
    			x = (G & 1073741823) + (k & 1073741823);

    			if (I & d) {
    				return x ^ 2147483648 ^ F ^ H;
    			}

    			if (I | d) {
    				if (x & 1073741824) {
    					return x ^ 3221225472 ^ F ^ H;
    				} else {
    					return x ^ 1073741824 ^ F ^ H;
    				}
    			} else {
    				return x ^ F ^ H;
    			}
    		}

    		function r(d, F, k) {
    			return d & F | ~d & k;
    		}

    		function q(d, F, k) {
    			return d & k | F & ~k;
    		}

    		function p(d, F, k) {
    			return d ^ F ^ k;
    		}

    		function n(d, F, k) {
    			return F ^ (d | ~k);
    		}

    		function u(G, F, aa, Z, k, H, I) {
    			G = K(G, K(K(r(F, aa, Z), k), I));
    			return K(L(G, H), F);
    		}

    		function f(G, F, aa, Z, k, H, I) {
    			G = K(G, K(K(q(F, aa, Z), k), I));
    			return K(L(G, H), F);
    		}

    		function D(G, F, aa, Z, k, H, I) {
    			G = K(G, K(K(p(F, aa, Z), k), I));
    			return K(L(G, H), F);
    		}

    		function t(G, F, aa, Z, k, H, I) {
    			G = K(G, K(K(n(F, aa, Z), k), I));
    			return K(L(G, H), F);
    		}

    		function e(G) {
    			var Z;
    			var F = G.length;
    			var x = F + 8;
    			var k = (x - x % 64) / 64;
    			var I = (k + 1) * 16;
    			var aa = Array(I - 1);
    			var d = 0;
    			var H = 0;

    			while (H < F) {
    				Z = (H - H % 4) / 4;
    				d = H % 4 * 8;
    				aa[Z] = aa[Z] | G.charCodeAt(H) << d;
    				H++;
    			}

    			Z = (H - H % 4) / 4;
    			d = H % 4 * 8;
    			aa[Z] = aa[Z] | 128 << d;
    			aa[I - 2] = F << 3;
    			aa[I - 1] = F >>> 29;
    			return aa;
    		}

    		function B(x) {
    			var k = "", F = "", G, d;

    			for (d = 0; d <= 3; d++) {
    				G = x >>> d * 8 & 255;
    				F = "0" + G.toString(16);
    				k = k + F.substr(F.length - 2, 2);
    			}

    			return k;
    		}

    		function J(k) {
    			k = k.replace(/rn/g, "n");
    			var d = "";

    			for (var F = 0; F < k.length; F++) {
    				var x = k.charCodeAt(F);

    				if (x < 128) {
    					d += String.fromCharCode(x);
    				} else {
    					if (x > 127 && x < 2048) {
    						d += String.fromCharCode(x >> 6 | 192);
    						d += String.fromCharCode(x & 63 | 128);
    					} else {
    						d += String.fromCharCode(x >> 12 | 224);
    						d += String.fromCharCode(x >> 6 & 63 | 128);
    						d += String.fromCharCode(x & 63 | 128);
    					}
    				}
    			}

    			return d;
    		}

    		var C = Array();
    		var P, h, E, v, g, Y, X, W, V;
    		var S = 7, Q = 12, N = 17, M = 22;
    		var A = 5, z = 9, y = 14, w = 20;
    		var o = 4, m = 11, l = 16, j = 23;
    		var U = 6, T = 10, R = 15, O = 21;
    		s = J(s);
    		C = e(s);
    		Y = 1732584193;
    		X = 4023233417;
    		W = 2562383102;
    		V = 271733878;

    		for (P = 0; P < C.length; P += 16) {
    			h = Y;
    			E = X;
    			v = W;
    			g = V;
    			Y = u(Y, X, W, V, C[P + 0], S, 3614090360);
    			V = u(V, Y, X, W, C[P + 1], Q, 3905402710);
    			W = u(W, V, Y, X, C[P + 2], N, 606105819);
    			X = u(X, W, V, Y, C[P + 3], M, 3250441966);
    			Y = u(Y, X, W, V, C[P + 4], S, 4118548399);
    			V = u(V, Y, X, W, C[P + 5], Q, 1200080426);
    			W = u(W, V, Y, X, C[P + 6], N, 2821735955);
    			X = u(X, W, V, Y, C[P + 7], M, 4249261313);
    			Y = u(Y, X, W, V, C[P + 8], S, 1770035416);
    			V = u(V, Y, X, W, C[P + 9], Q, 2336552879);
    			W = u(W, V, Y, X, C[P + 10], N, 4294925233);
    			X = u(X, W, V, Y, C[P + 11], M, 2304563134);
    			Y = u(Y, X, W, V, C[P + 12], S, 1804603682);
    			V = u(V, Y, X, W, C[P + 13], Q, 4254626195);
    			W = u(W, V, Y, X, C[P + 14], N, 2792965006);
    			X = u(X, W, V, Y, C[P + 15], M, 1236535329);
    			Y = f(Y, X, W, V, C[P + 1], A, 4129170786);
    			V = f(V, Y, X, W, C[P + 6], z, 3225465664);
    			W = f(W, V, Y, X, C[P + 11], y, 643717713);
    			X = f(X, W, V, Y, C[P + 0], w, 3921069994);
    			Y = f(Y, X, W, V, C[P + 5], A, 3593408605);
    			V = f(V, Y, X, W, C[P + 10], z, 38016083);
    			W = f(W, V, Y, X, C[P + 15], y, 3634488961);
    			X = f(X, W, V, Y, C[P + 4], w, 3889429448);
    			Y = f(Y, X, W, V, C[P + 9], A, 568446438);
    			V = f(V, Y, X, W, C[P + 14], z, 3275163606);
    			W = f(W, V, Y, X, C[P + 3], y, 4107603335);
    			X = f(X, W, V, Y, C[P + 8], w, 1163531501);
    			Y = f(Y, X, W, V, C[P + 13], A, 2850285829);
    			V = f(V, Y, X, W, C[P + 2], z, 4243563512);
    			W = f(W, V, Y, X, C[P + 7], y, 1735328473);
    			X = f(X, W, V, Y, C[P + 12], w, 2368359562);
    			Y = D(Y, X, W, V, C[P + 5], o, 4294588738);
    			V = D(V, Y, X, W, C[P + 8], m, 2272392833);
    			W = D(W, V, Y, X, C[P + 11], l, 1839030562);
    			X = D(X, W, V, Y, C[P + 14], j, 4259657740);
    			Y = D(Y, X, W, V, C[P + 1], o, 2763975236);
    			V = D(V, Y, X, W, C[P + 4], m, 1272893353);
    			W = D(W, V, Y, X, C[P + 7], l, 4139469664);
    			X = D(X, W, V, Y, C[P + 10], j, 3200236656);
    			Y = D(Y, X, W, V, C[P + 13], o, 681279174);
    			V = D(V, Y, X, W, C[P + 0], m, 3936430074);
    			W = D(W, V, Y, X, C[P + 3], l, 3572445317);
    			X = D(X, W, V, Y, C[P + 6], j, 76029189);
    			Y = D(Y, X, W, V, C[P + 9], o, 3654602809);
    			V = D(V, Y, X, W, C[P + 12], m, 3873151461);
    			W = D(W, V, Y, X, C[P + 15], l, 530742520);
    			X = D(X, W, V, Y, C[P + 2], j, 3299628645);
    			Y = t(Y, X, W, V, C[P + 0], U, 4096336452);
    			V = t(V, Y, X, W, C[P + 7], T, 1126891415);
    			W = t(W, V, Y, X, C[P + 14], R, 2878612391);
    			X = t(X, W, V, Y, C[P + 5], O, 4237533241);
    			Y = t(Y, X, W, V, C[P + 12], U, 1700485571);
    			V = t(V, Y, X, W, C[P + 3], T, 2399980690);
    			W = t(W, V, Y, X, C[P + 10], R, 4293915773);
    			X = t(X, W, V, Y, C[P + 1], O, 2240044497);
    			Y = t(Y, X, W, V, C[P + 8], U, 1873313359);
    			V = t(V, Y, X, W, C[P + 15], T, 4264355552);
    			W = t(W, V, Y, X, C[P + 6], R, 2734768916);
    			X = t(X, W, V, Y, C[P + 13], O, 1309151649);
    			Y = t(Y, X, W, V, C[P + 4], U, 4149444226);
    			V = t(V, Y, X, W, C[P + 11], T, 3174756917);
    			W = t(W, V, Y, X, C[P + 2], R, 718787259);
    			X = t(X, W, V, Y, C[P + 9], O, 3951481745);
    			Y = K(Y, h);
    			X = K(X, E);
    			W = K(W, v);
    			V = K(V, g);
    		}

    		var i = B(Y) + B(X) + B(W) + B(V);
    		return i.toLowerCase();
    	};

    	var size = size || 80;
    	return "http://www.gravatar.com/avatar/" + MD5(email) + ".jpg?s=" + size;
    }

    function formatDate(date) {
    	var d = new Date(date),
    		month = "" + (d.getMonth() + 1),
    		day = "" + d.getDate(),
    		year = d.getFullYear();

    	if (month.length < 2) month = "0" + month;
    	if (day.length < 2) day = "0" + day;
    	return [year, month, day].join("-");
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Login", slots, []);
    	let password = "";
    	let username = "";
    	let result = null;
    	let user = null;
    	let profile = { company: "Loading" };
    	let login_visi = true;
    	let sign_up = false;
    	let reg_email = "";
    	let reg_passwrd = "";
    	let reg_passwrd_confirm = "";
    	let reg_username = "";
    	let reg_company = "";
    	let instrument = "";
    	let instruments = [];
    	let instrument_value = [];
    	let instvals = [];
    	let instrument_display = [];
    	let settings_page = false;
    	let instruments_page = false;
    	let collections_page = false;
    	let collection_details = true;
    	let addNewCollectionForm = false;
    	let trendData = [];
    	let datas = {};

    	let data = {
    		labels: ["a"],
    		datasets: [{ values: [1] }]
    	};

    	///end gravatar
    	//@desc:  hits Harbor to validate credintials.  with valid credintials sends token to get user. with user gets profile
    	function login(username, password) {
    		// get auth token
    		var myHeaders = new Headers();

    		myHeaders.append("Content-Type", "application/json");

    		var raw = JSON.stringify({
    			email: `${username}`,
    			password: `${password}`
    		});

    		var requestOptions = {
    			method: "POST",
    			headers: myHeaders,
    			body: raw,
    			redirect: "follow"
    		};

    		fetch(
    			//"https://cors-anywhere.herokuapp.com/" +
    			"http://bridgesautomation.duckdns.org:5778/auth",
    			requestOptions
    		).then(response => response.json()).then(res => {
    			$$invalidate(2, result = res);

    			//send token auth token to get profile
    			var myHeaders = new Headers();

    			myHeaders.append("x-auth-token", `${result.token}`);

    			var requestOptions = {
    				method: "GET",
    				headers: myHeaders,
    				redirect: "follow"
    			};

    			fetch(
    				//"https://cors-anywhere.herokuapp.com/" +
    				"http://bridgesautomation.duckdns.org:5778/profile/me",
    				requestOptions
    			).then(response => response.json()).then(result => {
    				$$invalidate(4, profile = result);
    				instruments = get_All_instrumentdata(profile);
    			}).catch(error => console.log("error", error));

    			//send token auth token to get user
    			var myHeaders = new Headers();

    			myHeaders.append("x-auth-token", `${result.token}`);

    			var requestOptions = {
    				method: "GET",
    				headers: myHeaders,
    				redirect: "follow"
    			};

    			fetch(
    				//"https://cors-anywhere.herokuapp.com/" +
    				"http://bridgesautomation.duckdns.org:5778/auth",
    				requestOptions
    			).then(response => response.json()).then(result => {
    				$$invalidate(3, user = result);

    				//navigate to users homepage
    				//if(user) navigate("/Home", {replace: true});
    				// Transition to homepage
    				$$invalidate(5, login_visi = false);
    			}).catch(error => console.log("error", error));
    		}).catch(error => console.log("error", error));
    	}

    	// navigate to the signup markup
    	const signup = () => {
    		$$invalidate(6, sign_up = true);
    	};

    	// Profile Create
    	const profile_create = (token, company) => {
    		var myHeaders = new Headers();
    		myHeaders.append("Content-Type", "application/json");
    		myHeaders.append("x-auth-token", token);
    		var raw = JSON.stringify({ company });

    		var requestOptions = {
    			method: "POST",
    			headers: myHeaders,
    			body: raw,
    			redirect: "follow"
    		};

    		fetch(
    			//"https://cors-anywhere.herokuapp.com/" +
    			"http://bridgesautomation.duckdns.org:5778/profile",
    			requestOptions
    		).then(response => response.json()).then(result => {
    			//console.log(JSON.stringify(result));
    			$$invalidate(6, sign_up = false);

    			login(reg_email, reg_passwrd);
    		}).catch(error => console.log("error", error));
    	};

    	// register
    	const register = (reg_username, reg_email, reg_passwrd, reg_passwrd_confirm) => {
    		if (reg_passwrd != reg_passwrd_confirm) {
    			return { msg: "Passwords did not match" };
    		}

    		var myHeaders = new Headers();
    		myHeaders.append("Content-Type", "application/json");

    		var raw = JSON.stringify({
    			name: reg_username,
    			email: reg_email,
    			password: reg_passwrd
    		});

    		var requestOptions = {
    			method: "POST",
    			headers: myHeaders,
    			body: raw,
    			redirect: "follow"
    		};

    		fetch(
    			//"https://cors-anywhere.herokuapp.com/" +
    			"http://bridgesautomation.duckdns.org:5778/users",
    			requestOptions
    		).then(response => response.json()).then(result => {
    			//console.log(JSON.stringify(result));
    			profile_create(result.token, reg_company);
    		}).catch(error => console.log("error", error));
    	};

    	const API_Key_Gen = token => {
    		var myHeaders = new Headers();
    		myHeaders.append("Content-Type", "application/json");
    		myHeaders.append("x-auth-token", token);

    		var requestOptions = {
    			method: "POST",
    			headers: myHeaders,
    			redirect: "follow"
    		};

    		fetch(
    			//"https://cors-anywhere.herokuapp.com/" +
    			"http://bridgesautomation.duckdns.org:5778/profile/settings/genKey",
    			requestOptions
    		).then(response => response.json()).then(result => {
    			alert(JSON.stringify(result));
    		}).catch(error => console.log("error", error));
    	};

    	//setInterval(() => {}, 5000);
    	// HERE ... need to get values updated on page
    	setInterval(
    		() => {
    			try {
    				function get_range_data(unit_id_d, start_time, end_time) {
    					var myHeaders = new Headers();
    					myHeaders.append("Content-Type", "application/json");
    					myHeaders.append("x-auth-token", result.token);

    					var requestOptions = {
    						method: "GET",
    						headers: myHeaders,
    						redirect: "follow"
    					};

    					//working need to loop an pass unit_id
    					fetch(
    						//"https://cors-anywhere.herokuapp.com/" +
    						//`http://bridgesautomation.duckdns.org:5778/data/rangeRecords/${unit_id_d}/${start_time}/${end_time}`,
    						`http://10.20.30.134:50091/data/rangeRecords/${unit_id_d}/${start_time}/${end_time}`,
    						requestOptions
    					).then(response => response.json()).then(result => {
    						try {
    							//console.log(result);
    							if (result) {
    								const du = instruments.includes(result[2][0].unit_id.trim());

    								if (du) {
    									//console.log(result);
    									let flag = false;

    									//console.log(result[2].length);
    									//load trend displays
    									let flaggy = false;

    									let j = 0;

    									while (j < trendData.length && flaggy === false) {
    										console.log(trendData[j][0].trim() === result[2][0].unit_id.trim());
    										console.log(trendData[j][0].trim(), " = ", result[2][0].unit_id.trim());

    										if (trendData[j][0].trim() === result[2][0].unit_id.trim()) {
    											flaggy = true;
    										}

    										j++;
    									}

    									if (!flaggy) {
    										let trendObj = [
    											result[2][0].unit_id,
    											{ labels: [], datasets: [{ values: [] }] }
    										];

    										for (let i = 0; i < result[2].length; i++) {
    											trendObj[1].datasets[0].values.unshift(result[2][i].sensor_reading);
    											trendObj[1].labels.unshift(result[2][i].time_stamp);
    										}

    										trendData.unshift(trendObj);
    									}

    									flaggy = false;
    									console.log(trendData);
    								} else {
    									console.log("else");
    								}
    							}
    						} catch(error) {
    							console.log(error);
    						}
    					}).catch(error => console.log("error:", error));
    				}

    				function get_data(unit_id_d) {
    					var myHeaders = new Headers();
    					myHeaders.append("Content-Type", "application/json");
    					myHeaders.append("x-auth-token", result.token);

    					var requestOptions = {
    						method: "GET",
    						headers: myHeaders,
    						redirect: "follow"
    					};

    					//working need to loop an pass unit_id
    					fetch(
    						//"https://cors-anywhere.herokuapp.com/" +
    						`http://bridgesautomation.duckdns.org:5778/data/latestRecord/${unit_id_d}`,
    						requestOptions
    					).then(response => response.json()).then(result => {
    						$$invalidate(18, instrument = result);
    						const fu = instruments.includes(instrument[2][0].unit_id.trim());

    						if (fu) {
    							let flag = false;

    							for (let i = 0; i < instrument_display.length; i++) {
    								if (instrument_display[i].unit_id.trim() === instrument[2][0].unit_id.trim()) {
    									$$invalidate(12, instrument_display[i] = instrument[2][0], instrument_display);
    									flag = true;
    								}
    							}

    							if (!flag) {
    								instrument_display.unshift(instrument[2][0]);
    								flag = false;
    							}
    						} else {
    							
    						}
    					}).catch(error => console.log("error", error));
    				}

    				//hereeeee
    				for (let i = 0; i < profile.instruments.length; i++) {
    					get_data(" " + profile.instruments[i]);
    					let now = new Date();
    					let weekRange = new Date();
    					weekRange.setDate(weekRange.getDate() - 7);
    					get_range_data(profile.instruments[i], formatDate(weekRange), formatDate(now));
    				}
    			} catch(err) {
    				console.error(err.message);
    			}
    		},
    		5000
    	);

    	const goToSettings = () => $$invalidate(13, settings_page = !settings_page);
    	const goToInstruments = () => $$invalidate(14, instruments_page = !instruments_page);
    	const goToCollections = () => $$invalidate(15, collections_page = !collections_page);
    	const showCollectionDetails = () => $$invalidate(16, collection_details = !collection_details);
    	const addNewCollectionButton = () => $$invalidate(17, addNewCollectionForm = !addNewCollectionForm);

    	const get_All_instrumentdata = profile => {
    		return profile.instruments;
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		username = this.value;
    		$$invalidate(1, username);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(0, password);
    	}

    	function input0_input_handler_1() {
    		reg_username = this.value;
    		$$invalidate(10, reg_username);
    	}

    	function input1_input_handler_1() {
    		reg_email = this.value;
    		$$invalidate(7, reg_email);
    	}

    	function input2_input_handler() {
    		reg_company = this.value;
    		$$invalidate(11, reg_company);
    	}

    	function input3_input_handler() {
    		reg_passwrd = this.value;
    		$$invalidate(8, reg_passwrd);
    	}

    	function input4_input_handler() {
    		reg_passwrd_confirm = this.value;
    		$$invalidate(9, reg_passwrd_confirm);
    	}

    	function input0_input_handler_2() {
    		reg_username = this.value;
    		$$invalidate(10, reg_username);
    	}

    	function input1_input_handler_2() {
    		reg_email = this.value;
    		$$invalidate(7, reg_email);
    	}

    	function input2_input_handler_1() {
    		reg_company = this.value;
    		$$invalidate(11, reg_company);
    	}

    	function input3_input_handler_1() {
    		reg_passwrd = this.value;
    		$$invalidate(8, reg_passwrd);
    	}

    	function input4_input_handler_1() {
    		reg_passwrd_confirm = this.value;
    		$$invalidate(9, reg_passwrd_confirm);
    	}

    	$$self.$capture_state = () => ({
    		password,
    		username,
    		result,
    		user,
    		profile,
    		login_visi,
    		sign_up,
    		reg_email,
    		reg_passwrd,
    		reg_passwrd_confirm,
    		reg_username,
    		reg_company,
    		instrument,
    		instruments,
    		instrument_value,
    		instvals,
    		instrument_display,
    		settings_page,
    		instruments_page,
    		collections_page,
    		collection_details,
    		addNewCollectionForm,
    		trendData,
    		datas,
    		Chart: Base,
    		object_without_properties,
    		data,
    		get_gravatar,
    		login,
    		signup,
    		profile_create,
    		formatDate,
    		register,
    		API_Key_Gen,
    		goToSettings,
    		goToInstruments,
    		goToCollections,
    		showCollectionDetails,
    		addNewCollectionButton,
    		get_All_instrumentdata
    	});

    	$$self.$inject_state = $$props => {
    		if ("password" in $$props) $$invalidate(0, password = $$props.password);
    		if ("username" in $$props) $$invalidate(1, username = $$props.username);
    		if ("result" in $$props) $$invalidate(2, result = $$props.result);
    		if ("user" in $$props) $$invalidate(3, user = $$props.user);
    		if ("profile" in $$props) $$invalidate(4, profile = $$props.profile);
    		if ("login_visi" in $$props) $$invalidate(5, login_visi = $$props.login_visi);
    		if ("sign_up" in $$props) $$invalidate(6, sign_up = $$props.sign_up);
    		if ("reg_email" in $$props) $$invalidate(7, reg_email = $$props.reg_email);
    		if ("reg_passwrd" in $$props) $$invalidate(8, reg_passwrd = $$props.reg_passwrd);
    		if ("reg_passwrd_confirm" in $$props) $$invalidate(9, reg_passwrd_confirm = $$props.reg_passwrd_confirm);
    		if ("reg_username" in $$props) $$invalidate(10, reg_username = $$props.reg_username);
    		if ("reg_company" in $$props) $$invalidate(11, reg_company = $$props.reg_company);
    		if ("instrument" in $$props) $$invalidate(18, instrument = $$props.instrument);
    		if ("instruments" in $$props) instruments = $$props.instruments;
    		if ("instrument_value" in $$props) instrument_value = $$props.instrument_value;
    		if ("instvals" in $$props) instvals = $$props.instvals;
    		if ("instrument_display" in $$props) $$invalidate(12, instrument_display = $$props.instrument_display);
    		if ("settings_page" in $$props) $$invalidate(13, settings_page = $$props.settings_page);
    		if ("instruments_page" in $$props) $$invalidate(14, instruments_page = $$props.instruments_page);
    		if ("collections_page" in $$props) $$invalidate(15, collections_page = $$props.collections_page);
    		if ("collection_details" in $$props) $$invalidate(16, collection_details = $$props.collection_details);
    		if ("addNewCollectionForm" in $$props) $$invalidate(17, addNewCollectionForm = $$props.addNewCollectionForm);
    		if ("trendData" in $$props) $$invalidate(19, trendData = $$props.trendData);
    		if ("datas" in $$props) datas = $$props.datas;
    		if ("data" in $$props) $$invalidate(20, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		password,
    		username,
    		result,
    		user,
    		profile,
    		login_visi,
    		sign_up,
    		reg_email,
    		reg_passwrd,
    		reg_passwrd_confirm,
    		reg_username,
    		reg_company,
    		instrument_display,
    		settings_page,
    		instruments_page,
    		collections_page,
    		collection_details,
    		addNewCollectionForm,
    		instrument,
    		trendData,
    		data,
    		login,
    		signup,
    		register,
    		API_Key_Gen,
    		goToSettings,
    		goToInstruments,
    		goToCollections,
    		addNewCollectionButton,
    		input0_input_handler,
    		input1_input_handler,
    		input0_input_handler_1,
    		input1_input_handler_1,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input0_input_handler_2,
    		input1_input_handler_2,
    		input2_input_handler_1,
    		input3_input_handler_1,
    		input4_input_handler_1
    	];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/routes/Home.svelte generated by Svelte v3.28.0 */

    function create_fragment$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Home");
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ user: Login, profile: Login });
    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.28.0 */
    const file$3 = "src/App.svelte";

    // (45:4) <Route path="/">
    function create_default_slot_1(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(45:4) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:0) <Router {url}>
    function create_default_slot(ctx) {
    	let t0;
    	let div;
    	let route0;
    	let t1;
    	let route1;
    	let current;
    	let if_block = 1 === 0 ;

    	route0 = new Route({
    			props: { path: "/", component: Login },
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			t0 = space();
    			div = element("div");
    			create_component(route0.$$.fragment);
    			t1 = space();
    			create_component(route1.$$.fragment);
    			add_location(div, file$3, 42, 2, 770);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(route0, div, null);
    			append_dev(div, t1);
    			mount_component(route1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			destroy_component(route0);
    			destroy_component(route1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(25:0) <Router {url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 2) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { url = "" } = $$props;
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({ Router, Link, Route, login: Login, Home, url });

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
