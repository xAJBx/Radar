
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

    /* src/routes/login.svelte generated by Svelte v3.28.0 */

    const { console: console_1 } = globals;
    const file$1 = "src/routes/login.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[49] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[50] = list[i];
    	child_ctx[52] = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[45] = list[i];
    	child_ctx[47] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[53] = list[i];
    	return child_ctx;
    }

    // (621:0) {:else}
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
    	let mounted;
    	let dispose;
    	let if_block0 = /*settings_page*/ ctx[13] && create_if_block_8(ctx);
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
    			add_location(img, file$1, 626, 20, 18337);
    			add_location(center0, file$1, 626, 12, 18329);
    			attr_dev(h1, "id", "tiptop");
    			attr_dev(h1, "class", "svelte-160fwfv");
    			add_location(h1, file$1, 625, 10, 18300);
    			attr_dev(header, "class", "header");
    			add_location(header, file$1, 624, 8, 18266);
    			add_location(center1, file$1, 623, 6, 18249);
    			attr_dev(div, "class", "container");
    			add_location(div, file$1, 622, 4, 18219);
    			attr_dev(menuButton0, "class", "svelte-160fwfv");
    			add_location(menuButton0, file$1, 637, 12, 18578);
    			attr_dev(li0, "class", "svelte-160fwfv");
    			add_location(li0, file$1, 636, 10, 18561);
    			attr_dev(menuButton1, "class", "svelte-160fwfv");
    			add_location(menuButton1, file$1, 640, 12, 18681);
    			attr_dev(li1, "class", "svelte-160fwfv");
    			add_location(li1, file$1, 639, 10, 18664);
    			attr_dev(menuButton2, "class", "svelte-160fwfv");
    			add_location(menuButton2, file$1, 643, 12, 18790);
    			attr_dev(li2, "class", "svelte-160fwfv");
    			add_location(li2, file$1, 642, 10, 18773);
    			add_location(ul, file$1, 634, 8, 18533);
    			attr_dev(menu, "class", "svelte-160fwfv");
    			add_location(menu, file$1, 633, 6, 18518);
    			add_location(center2, file$1, 632, 4, 18503);
    			add_location(br0, file$1, 743, 13, 22035);
    			add_location(br1, file$1, 743, 20, 22042);
    			attr_dev(section, "class", "svelte-160fwfv");
    			add_location(section, file$1, 743, 4, 22026);
    			attr_dev(mainBody, "class", "svelte-160fwfv");
    			add_location(mainBody, file$1, 621, 2, 18204);
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

    			if (!mounted) {
    				dispose = [
    					listen_dev(menuButton0, "click", /*goToSettings*/ ctx[23], false, false, false),
    					listen_dev(menuButton1, "click", /*goToInstruments*/ ctx[24], false, false, false),
    					listen_dev(menuButton2, "click", /*goToCollections*/ ctx[25], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*user*/ 8 && img.src !== (img_src_value = get_gravatar(/*user*/ ctx[3].email, 200))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*user*/ 8 && t1_value !== (t1_value = /*user*/ ctx[3].name.toUpperCase() + "")) set_data_dev(t1, t1_value);

    			if (/*settings_page*/ ctx[13]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_8(ctx);
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
    				} else {
    					if_block1 = create_if_block_6(ctx);
    					if_block1.c();
    					if_block1.m(mainBody, t16);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
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
    		source: "(621:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (593:18) 
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
    			add_location(img0, file$1, 595, 10, 17290);
    			add_location(h1, file$1, 595, 6, 17286);
    			input0.required = true;
    			add_location(input0, file$1, 599, 25, 17486);
    			add_location(label0, file$1, 599, 8, 17469);
    			input1.required = true;
    			add_location(input1, file$1, 600, 22, 17562);
    			add_location(label1, file$1, 600, 8, 17548);
    			input2.required = true;
    			add_location(input2, file$1, 601, 24, 17637);
    			add_location(label2, file$1, 601, 8, 17621);
    			attr_dev(input3, "type", "password");
    			input3.required = true;
    			add_location(input3, file$1, 604, 10, 17735);
    			add_location(label3, file$1, 602, 8, 17698);
    			attr_dev(input4, "type", "password");
    			input4.required = true;
    			add_location(input4, file$1, 608, 10, 17856);
    			add_location(label4, file$1, 606, 8, 17820);
    			add_location(button, file$1, 610, 29, 17970);
    			attr_dev(div, "class", "buttons");
    			add_location(div, file$1, 610, 8, 17949);
    			if (img1.src !== (img1_src_value = "/img/small_BA_logo_75x75_Cropped.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "BRIDGES AUTOMATION");
    			add_location(img1, file$1, 613, 10, 18042);
    			attr_dev(p, "class", "svelte-160fwfv");
    			add_location(p, file$1, 611, 8, 18007);
    			add_location(form, file$1, 597, 6, 17351);
    			attr_dev(main, "class", "svelte-160fwfv");
    			add_location(main, file$1, 594, 4, 17273);
    			attr_dev(section, "class", "svelte-160fwfv");
    			add_location(section, file$1, 593, 2, 17259);
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
    					listen_dev(input0, "input", /*input0_input_handler_1*/ ctx[29]),
    					listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[30]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[31]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[32]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[33]),
    					listen_dev(
    						form,
    						"submit",
    						prevent_default(function () {
    							if (is_function(/*register*/ ctx[21](/*reg_username*/ ctx[10], /*reg_email*/ ctx[7], /*reg_passwrd*/ ctx[8], /*reg_passwrd_confirm*/ ctx[9]))) /*register*/ ctx[21](/*reg_username*/ ctx[10], /*reg_email*/ ctx[7], /*reg_passwrd*/ ctx[8], /*reg_passwrd_confirm*/ ctx[9]).apply(this, arguments);
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
    			if (detaching) detach_dev(section);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(593:18) ",
    		ctx
    	});

    	return block;
    }

    // (569:0) {#if login_visi && !sign_up}
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
    	let p;
    	let t9;
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
    			p = element("p");
    			t9 = text("Powered by\n          ");
    			img1 = element("img");
    			if (img0.src !== (img0_src_value = "/img/MyOPC_200x200.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "MyOPC");
    			add_location(img0, file$1, 571, 10, 16583);
    			add_location(h1, file$1, 571, 6, 16579);
    			input0.required = true;
    			add_location(input0, file$1, 574, 25, 16729);
    			add_location(label0, file$1, 574, 8, 16712);
    			attr_dev(input1, "type", "password");
    			input1.required = true;
    			add_location(input1, file$1, 577, 10, 16824);
    			add_location(label1, file$1, 575, 8, 16787);
    			add_location(button0, file$1, 580, 10, 16938);
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$1, 581, 10, 16971);
    			attr_dev(div, "class", "buttons");
    			add_location(div, file$1, 579, 8, 16906);
    			if (img1.src !== (img1_src_value = "/img/small_BA_logo_75x75_Cropped.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "BRIDGES AUTOMATION");
    			add_location(img1, file$1, 585, 10, 17086);
    			attr_dev(p, "class", "svelte-160fwfv");
    			add_location(p, file$1, 583, 8, 17051);
    			add_location(form, file$1, 573, 6, 16644);
    			attr_dev(main, "class", "svelte-160fwfv");
    			add_location(main, file$1, 570, 4, 16566);
    			attr_dev(section, "class", "svelte-160fwfv");
    			add_location(section, file$1, 569, 2, 16552);
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
    			append_dev(form, p);
    			append_dev(p, t9);
    			append_dev(p, img1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[27]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[28]),
    					listen_dev(button1, "click", /*signup*/ ctx[20], false, false, false),
    					listen_dev(
    						form,
    						"submit",
    						prevent_default(function () {
    							if (is_function(/*login*/ ctx[19](/*username*/ ctx[1], /*password*/ ctx[0]))) /*login*/ ctx[19](/*username*/ ctx[1], /*password*/ ctx[0]).apply(this, arguments);
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(569:0) {#if login_visi && !sign_up}",
    		ctx
    	});

    	return block;
    }

    // (650:4) {#if settings_page}
    function create_if_block_8(ctx) {
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
    			add_location(p10, file$1, 652, 10, 18988);
    			add_location(br0, file$1, 653, 10, 19027);
    			add_location(p2, file$1, 654, 10, 19044);
    			add_location(br1, file$1, 655, 10, 19106);
    			add_location(br2, file$1, 656, 10, 19123);
    			add_location(p11, file$1, 657, 10, 19140);
    			attr_dev(button, "type", "button");
    			add_location(button, file$1, 657, 49, 19179);
    			add_location(center, file$1, 651, 8, 18969);
    			add_location(settings_page_1, file$1, 650, 6, 18945);
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
    						if (is_function(/*API_Key_Gen*/ ctx[22](/*result*/ ctx[2].token))) /*API_Key_Gen*/ ctx[22](/*result*/ ctx[2].token).apply(this, arguments);
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
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(650:4) {#if settings_page}",
    		ctx
    	});

    	return block;
    }

    // (664:4) {#if instruments_page}
    function create_if_block_6(ctx) {
    	let instruments_page_1;
    	let center;
    	let h3;
    	let t1;
    	let instrumentsss;
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
    			add_location(h3, file$1, 666, 10, 19419);
    			add_location(instrumentsss, file$1, 667, 10, 19450);
    			add_location(center, file$1, 665, 8, 19400);
    			add_location(instruments_page_1, file$1, 664, 6, 19373);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, instruments_page_1, anchor);
    			append_dev(instruments_page_1, center);
    			append_dev(center, h3);
    			append_dev(center, t1);
    			append_dev(center, instrumentsss);
    			if (if_block) if_block.m(instrumentsss, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*result*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_7(ctx);
    					if_block.c();
    					if_block.m(instrumentsss, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
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
    		source: "(664:4) {#if instruments_page}",
    		ctx
    	});

    	return block;
    }

    // (669:12) {#if result}
    function create_if_block_7(ctx) {
    	let each_1_anchor;
    	let each_value_3 = /*instrument_display*/ ctx[12];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
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
    			if (dirty[0] & /*instrument_display*/ 4096) {
    				each_value_3 = /*instrument_display*/ ctx[12];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
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
    		source: "(669:12) {#if result}",
    		ctx
    	});

    	return block;
    }

    // (670:14) {#each instrument_display as obj}
    function create_each_block_3(ctx) {
    	let li;
    	let t0_value = /*obj*/ ctx[53].time_stamp + "";
    	let t0;
    	let t1;
    	let t2_value = /*obj*/ ctx[53].unit_id + "";
    	let t2;
    	let t3;
    	let t4_value = /*obj*/ ctx[53].sensor_reading + "";
    	let t4;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text("---");
    			t2 = text(t2_value);
    			t3 = text(": ");
    			t4 = text(t4_value);
    			attr_dev(li, "class", "svelte-160fwfv");
    			add_location(li, file$1, 670, 16, 19555);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);
    			append_dev(li, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*instrument_display*/ 4096 && t0_value !== (t0_value = /*obj*/ ctx[53].time_stamp + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*instrument_display*/ 4096 && t2_value !== (t2_value = /*obj*/ ctx[53].unit_id + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*instrument_display*/ 4096 && t4_value !== (t4_value = /*obj*/ ctx[53].sensor_reading + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(670:14) {#each instrument_display as obj}",
    		ctx
    	});

    	return block;
    }

    // (678:4) {#if collections_page}
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
    			t1 = text("'s Hosted Collections ");
    			button = element("button");
    			button.textContent = "add";
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			collections = element("collections");
    			if (if_block1) if_block1.c();
    			add_location(button, file$1, 681, 45, 19869);
    			add_location(h3, file$1, 680, 10, 19819);
    			add_location(collections, file$1, 715, 10, 21099);
    			add_location(center, file$1, 679, 8, 19800);
    			add_location(collections_page_1, file$1, 678, 6, 19773);
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
    				dispose = listen_dev(button, "click", /*addNewCollectionButton*/ ctx[26], false, false, false);
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
    		source: "(678:4) {#if collections_page}",
    		ctx
    	});

    	return block;
    }

    // (684:10) {#if addNewCollectionForm}
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
    			add_location(input0, file$1, 688, 16, 20168);
    			add_location(label0, file$1, 686, 14, 20119);
    			input1.required = true;
    			add_location(input1, file$1, 690, 28, 20264);
    			add_location(label1, file$1, 690, 14, 20250);
    			input2.required = true;
    			add_location(input2, file$1, 693, 16, 20377);
    			add_location(label2, file$1, 691, 14, 20329);
    			attr_dev(input3, "type", "password");
    			input3.required = true;
    			add_location(input3, file$1, 697, 16, 20507);
    			add_location(label3, file$1, 695, 14, 20458);
    			attr_dev(input4, "type", "password");
    			input4.required = true;
    			add_location(input4, file$1, 701, 16, 20652);
    			add_location(label4, file$1, 699, 14, 20604);
    			add_location(button, file$1, 706, 35, 20832);
    			attr_dev(div, "class", "buttons");
    			add_location(div, file$1, 706, 14, 20811);
    			if (img.src !== (img_src_value = "/img/small_BA_logo_75x75_Cropped.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "BRIDGES AUTOMATION");
    			add_location(img, file$1, 709, 16, 20922);
    			attr_dev(p, "class", "svelte-160fwfv");
    			add_location(p, file$1, 707, 14, 20875);
    			add_location(form, file$1, 684, 12, 19989);
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
    					listen_dev(input0, "input", /*input0_input_handler_2*/ ctx[34]),
    					listen_dev(input1, "input", /*input1_input_handler_2*/ ctx[35]),
    					listen_dev(input2, "input", /*input2_input_handler_1*/ ctx[36]),
    					listen_dev(input3, "input", /*input3_input_handler_1*/ ctx[37]),
    					listen_dev(input4, "input", /*input4_input_handler_1*/ ctx[38]),
    					listen_dev(
    						form,
    						"submit",
    						prevent_default(function () {
    							if (is_function(/*register*/ ctx[21](/*reg_username*/ ctx[10], /*reg_email*/ ctx[7], /*reg_passwrd*/ ctx[8], /*reg_passwrd_confirm*/ ctx[9]))) /*register*/ ctx[21](/*reg_username*/ ctx[10], /*reg_email*/ ctx[7], /*reg_passwrd*/ ctx[8], /*reg_passwrd_confirm*/ ctx[9]).apply(this, arguments);
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
    		source: "(684:10) {#if addNewCollectionForm}",
    		ctx
    	});

    	return block;
    }

    // (717:12) {#if profile.collections}
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
    		source: "(717:12) {#if profile.collections}",
    		ctx
    	});

    	return block;
    }

    // (721:18) {#if collection_details}
    function create_if_block_4(ctx) {
    	let ul;
    	let li0;
    	let t1;
    	let t2;
    	let li1;
    	let t4;
    	let each_value_2 = /*c*/ ctx[45].collection_people;
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*c*/ ctx[45].collection_instruments;
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
    			add_location(li0, file$1, 722, 22, 21373);
    			attr_dev(li1, "class", "svelte-160fwfv");
    			add_location(li1, file$1, 728, 22, 21602);
    			add_location(ul, file$1, 721, 20, 21346);
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
    				each_value_2 = /*c*/ ctx[45].collection_people;
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
    				each_value_1 = /*c*/ ctx[45].collection_instruments;
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
    		source: "(721:18) {#if collection_details}",
    		ctx
    	});

    	return block;
    }

    // (724:22) {#each c.collection_people as ppl, k}
    function create_each_block_2(ctx) {
    	let ul;
    	let li;
    	let t_value = /*ppl*/ ctx[50] + "";
    	let t;

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "svelte-160fwfv");
    			add_location(li, file$1, 725, 26, 21505);
    			add_location(ul, file$1, 724, 24, 21474);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li);
    			append_dev(li, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*profile*/ 16 && t_value !== (t_value = /*ppl*/ ctx[50] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(724:22) {#each c.collection_people as ppl, k}",
    		ctx
    	});

    	return block;
    }

    // (730:22) {#each c.collection_instruments as instrument, l}
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
    			add_location(li, file$1, 731, 26, 21749);
    			add_location(ul, file$1, 730, 24, 21718);
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
    		source: "(730:22) {#each c.collection_instruments as instrument, l}",
    		ctx
    	});

    	return block;
    }

    // (718:14) {#each profile.collections as c, j}
    function create_each_block(ctx) {
    	let ul;
    	let li;
    	let t0_value = /*c*/ ctx[45].collection_name + "";
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
    			add_location(li, file$1, 719, 18, 21254);
    			attr_dev(ul, "id", "dropdown");
    			attr_dev(ul, "class", "svelte-160fwfv");
    			add_location(ul, file$1, 718, 16, 21217);
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
    			if (dirty[0] & /*profile*/ 16 && t0_value !== (t0_value = /*c*/ ctx[45].collection_name + "")) set_data_dev(t0, t0_value);

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
    		source: "(718:14) {#each profile.collections as c, j}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*login_visi*/ ctx[5] && !/*sign_up*/ ctx[6]) return create_if_block$1;
    		if (/*sign_up*/ ctx[6]) return create_if_block_1$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function instance$3($$self, $$props, $$invalidate) {
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
    			console.log(JSON.stringify(result));
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
    			console.log(JSON.stringify(result));
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

    	// HERE ... need to get values updated on page
    	setInterval(
    		() => {
    			try {
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

    						//console.log(JSON.stringify(result))
    						console.log(JSON.stringify(result[2]));

    						const fu = instruments.includes(instrument[2][0].unit_id.trim());
    						console.log(fu);

    						//console.log("instrument: ", instrument[1][0].unit_id.trim())
    						//console.log('fu: ', fu)
    						//console.log('object: ', instrument[1][0])
    						//debugger;
    						if (fu) {
    							let flag = false;

    							for (let i = 0; i < instrument_display.length; i++) {
    								//console.log(instrument_display)
    								if (instrument_display[i].unit_id.trim() === instrument[2][0].unit_id.trim()) {
    									$$invalidate(12, instrument_display[i] = instrument[2][0], instrument_display);
    									flag = true;
    								}
    							}

    							console.log("test");

    							if (!flag) {
    								instrument_display.unshift(instrument[2][0]);
    								flag = false;
    							}

    							console.log(instrument_display);
    						} else //console.log("inhere");
    						//console.log(instrument_display)
    						{
    							
    						} //instrument_display.unshift(instruments[1][0]);
    					}).//if(instrument_display.includes(instrument[1]))
    					catch(error => console.log("error", error)); //console.log(instrument[1][0].unit_id);
    					//console.log(instrument_display);
    					//console.log(instruments)
    				}

    				//hereeeee
    				for (let i = 0; i < profile.instruments.length; i++) {
    					//console.log(profile.instruments);
    					get_data(" " + profile.instruments[i]);
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
    		get_gravatar,
    		login,
    		signup,
    		profile_create,
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/routes/Home.svelte generated by Svelte v3.28.0 */

    function create_fragment$4(ctx) {
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.28.0 */
    const file$2 = "src/App.svelte";

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
    			add_location(div, file$2, 42, 2, 770);
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

    function create_fragment$5(ctx) {
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
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
