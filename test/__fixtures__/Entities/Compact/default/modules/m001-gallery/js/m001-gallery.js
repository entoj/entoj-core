/**
 * @ismodule
 * @description
 * Simple API for galleries
 */
define(['global/application',
        'global/component',
        'library/core',
        'library/lodash',
        'library/debug',
        'base/elements/e004-loading/js/e004-loading'], function(app, component, $, _, debug, e004)
{
    //
    // -- Events -------------------------------------------------------------------------------------------------------------------
    //

    const events = {};

    /**
     * Triggered when a new page is shown
     *
     * @event SHOW_PAGE
     * @alias events.SHOW_PAGE
     */
    events.SHOW_PAGE = 'showPage';

    /**
     * Triggered when a gallery is activated
     *
     * @event ACTIVATED
     * @alias events.ACTIVATED
     */
    events.ACTIVATED = 'activated';


    //
    // -- Properties ---------------------------------------------------------------------------------------------------------------
    //

    const exports = {};
    const log = debug('m001-gallery');
    const elements =
    {
        rootSelector: '.js-m001-gallery',
        nextSelector: '.js-m001-gallery-next',
        prevSelector: '.js-m001-gallery-prev',
        stageSelector: '.m001-gallery-stage',
        controlsSelector: '.m001-gallery-controls',
        slidesSelector: '.js-m001-gallery-slides',
        paginationSelector: '.js-m001-gallery-pagination',
        paginationContainerClass: 'm001-gallery-paginationcontainer',
        paginationPageClass: 'm001-gallery-page',
        paginationPageTag: 'li',
        loaderSelector: '.js-e004-loading'
    };
    const bindings = [];


    //
    // -- Private ------------------------------------------------------------------------------------------------------------------
    //

    /**
     * @ignore
     */
    function prepare(state)
    {
        log('prepare ', state);

        const deferred = $.Deferred();

        //Get components
        state.loader = e004.getInstance(state.$root.find(elements.loaderSelector));
        state.$stage = state.$root.find(elements.stageSelector);
        state.$pagination = state.$root.find(elements.paginationSelector);
        state.$next = state.$root.find(elements.nextSelector);
        state.$next.data('page', 'next');
        state.$prev = state.$root.find(elements.prevSelector);
        state.$prev.data('page', 'prev');
        state.$slides = state.$root.find(elements.slidesSelector);

        //Add state
        state.paginationMode = state.$root.data('paginationmode') || 'graphical';
        state.slideCount = 0;
        state.pageCount = 0;
        state.pageIndex = 0;
        if (!state.pageCountResolver)
        {
            state.pageCountResolver = getPageCount;
        }
        state.swipeGesturePercentThreshold = 20;
        state.swipeStartPixelThreshold = 15;
        state.swipeDamping = 0.4;

        //Listen for clicks / taps
        state.$root.off('click').on('click', function(event)
        {
            const $target = $(event.target);

            //Handle slide actions
            if ($target.data('page') !== undefined)
            {
                event.preventDefault();
                event.stopImmediatePropagation();
                event.stopPropagation();
                showPage(state, $target.data('page'), true);
                return false;
            }
        });

        //Add drag handling
        addDragHandling(state);

        //Listen for resize on android
        if (true || $.browser.android)
        {
            app.on(app.events.RESIZED, _.partial(showPage, state));
        }

        //Go
        state.$root.addClass('is-active');
        updateSlides(state)
            .then(_.partial(updateState, state))
            .then(_.partial(updatePagination, state))
            .then(state.loader.hide)
            .then(deferred.resolve);

        return deferred.promise();
    }


    /**
     * @ignore
     */
    function addDragHandling(state)
    {
        function onFirst($elements, event, handler)
        {
            $elements.each(function()
            {
                $(this).on(event, handler);
                const eventList = $._data($(this)[0], "events");
                eventList[event].unshift(eventList[event].pop());
            });
        }

        state.swipe =
        {
            tapping: false,
            tappingX: 0,
            dragging: false,
            stopPropagation: false,
            direction: false
        };

        state.$root.find('img').on('dragstart', function()
        {
            return false;
        });

        state.$root.on('dragstart', function()
        {
            return false;
        });

        onFirst(state.$slides.children(), 'click', function(event)
        {
            if (state.swipe.stopPropagation)
            {
                state.swipe.stopPropagation = false;
                event.preventDefault();
                event.stopImmediatePropagation();
                event.stopPropagation();
            }
        });

        state.$root.on('tapstart', function(event, touch)
        {
            log('tapstart', event, touch);

            state.swipe.tapping = true;
            state.swipe.dragging = false;
            state.swipe.positionX = touch.position.x;
            state.swipe.distance = 0;
        });

        state.$root.on('tapmove', function(event, touch)
        {
            log('tapmove', touch.position.x);

            //Fixes move on andoid default browser
            if ($.browser.android && $.browser.version < 38)
            {
                event.preventDefault();
            }

            if (!state.swipe.tapping)
            {
                return true;
            }

            state.swipe.distance = Math.abs(touch.position.x - state.swipe.positionX);
            if (!state.swipe.dragging && state.swipe.distance > 25)
            {
                state.swipe.dragging = true;
            }

            if (state.swipe.dragging)
            {
                state.swipe.direction = (touch.position.x - state.swipe.positionX > 0) ? 'right' : 'left';
                onUpdateDrag(state, 'move', state.swipe.distance, state.swipe.direction);
            }
        });

        state.$root.on('tapend', function(event, touch)
        {
            log('tapend', event, touch);

            if (state.swipe.dragging)
            {
                state.swipe.stopPropagation = true;
                onUpdateDrag(state, 'swipe', state.swipe.distance, state.swipe.direction);
            }
            state.swipe.tapping = false;
            state.swipe.dragging = false;
        });
    }


    /**
     * @ignore
     */
    function updateSlides(state, options)
    {
        log('updateSlides');

        const deferred = $.Deferred();

        //Get components
        state.$slides = state.$root.find(elements.slidesSelector);
        state.slides = _.map(state.$slides.children(), function(slide, index)
        {
            const $slide = $(slide);
            $slide.data('slide-index', index);
            return $slide;
        });

        //Add state
        state.slideCount = state.slides.length;
        state.pageCount = state.pageCountResolver(state);
        state.pageIndex = options ? options.pageIndex || 0 : 0;
        state.pageIndex = Math.min(state.pageCount - 1, Math.max(0, state.pageIndex));

        deferred.resolve();
        return deferred.promise();
    }


    /**
     * @ignore
     */
    function getPageCount(state)
    {
        return state.slideCount;
    }


    /**
     * Update pagination
     *
     * @ignore
     */
    function updatePagination(state)
    {
        log('updatePagination');

        const deferred = $.Deferred();

        if (state.paginationMode === 'graphical')
        {
            let pages = false;
            let pageIndex = 0;

            //Add or remove pages
            pages = state.$pagination.children('.' + elements.paginationPageClass);
            if (pages.length !== state.pageCount)
            {
                //Add
                if (pages.length < state.pageCount)
                {
                    for (pageIndex = pages.length; pageIndex < state.pageCount; pageIndex++)
                    {
                        state.$pagination.append($('<' + elements.paginationPageTag + ' class="' + elements.paginationPageClass + '">' +
                                                   '</' + elements.paginationPageTag + '>'));
                    }
                }

                //Remove
                if (pages.length > state.pageCount)
                {
                    for (pageIndex = state.pageCount; pageIndex <= pages.length; pageIndex++)
                    {
                        state.$pagination
                            .find('.' + elements.paginationPageClass + ':nth-child(' + (pageIndex) + ')')
                            .remove();
                    }
                }
            }

            //Add meta
            pages = state.$pagination.children('.' + elements.paginationPageClass);
            for (pageIndex = 0; pageIndex < state.pageCount; pageIndex++)
            {
                $(pages[pageIndex]).data('page', pageIndex);
            }

            //Show it?
            if (state.pageCount > 1)
            {
                state.$pagination.removeClass('is-hidden');
            }
            else
            {
                state.$pagination.addClass('is-hidden');
            }

            //Center
            state.$pagination.wrap('<div class="' + elements.paginationContainerClass + '"></div>');
        }

        deferred.resolve();
        return deferred.promise();
    }


    /**
     * Updates pagination and prev/next buttons
     *
     * @ignore
     */
    function updateState(state)
    {
        log('updateState');

        const deferred = $.Deferred();

        // Update count & index
        state.pageCount = state.pageCountResolver(state);
        state.pageIndex = Math.min(state.pageCount - 1, Math.max(0, state.pageIndex));

        //Update pagination
        if (state.paginationMode === 'graphical')
        {
            $('.' + elements.paginationPageClass, state.$pagination).removeClass('is-active');
            $('.' + elements.paginationPageClass + ':nth-child(' + (state.pageIndex + 1) + ')', state.$pagination).addClass('is-active');
        }

        //Update next
        if (state.pageIndex < state.pageCount - 1)
        {
            state.$next.removeClass('is-hidden').addClass('is-visible');
        }
        else
        {
            state.$next.removeClass('is-visible').addClass('is-hidden');
        }

        //Update prev
        if (state.pageIndex > 0)
        {
            state.$prev.removeClass('is-hidden').addClass('is-visible');
        }
        else
        {
            state.$prev.removeClass('is-visible').addClass('is-hidden');
        }

        deferred.resolve();
        return deferred.promise();
    }


    /**
     * Calculates the page offset for index
     *
     * @ignore
     */
    function getPageOffset(state, index, offset)
    {
        offsetCustom = offset || 0;
        result = ((index * -100) + offsetCustom) + '%';
        /*
        if ($.browser.android)
        {
            result = ((index * state.$stage.width() * -1) + (state.$stage.width() * offsetCustom)) + 'px';
        }
        */

        return result;
    }


    /**
     * @ignore
     */
    function applyPageOffset(state, offset, duration)
    {
        //Show page
        state.$slides.stop().transition(
        {
            x: offset
        },
        {
            duration: duration || 0,
            easing: 'easeOutSine'
        });
    }


    /**
     * Shows the given slide and updates the state afterwards.
     *
     * @ignore
     */
    function showPage(state, index, animated)
    {
        log('showPage', index);

        const deferred = $.Deferred();
        let nextIndex = index;

        //Get correct page index
        if (nextIndex === 'next')
        {
            nextIndex = state.pageIndex + 1;
        }
        if (nextIndex === 'prev')
        {
            nextIndex = state.pageIndex - 1;
        }
        if (_.isUndefined(nextIndex) || !_.isFinite(nextIndex))
        {
            nextIndex = state.pageIndex;
        }
        nextIndex = Math.min(Math.max(nextIndex, 0), state.pageCount - 1);
        log('showSlide gallery showing slide ' + nextIndex, index);

        //Show page
        const duration = 1000 / (window.devicePixelRatio || 1);
        applyPageOffset(state, getPageOffset(state, nextIndex), animated ? duration : 0);

        //Update state
        state.pageIndex = nextIndex;
        updateState(state)
            .then(function()
                {
                    //Dispatch event
                    state.$root.trigger(events.SHOW_PAGE);
                })
            .then(deferred.resolve);

        return deferred.promise();
    }


    /**
     * Reloads the gallery
     *
     * @function
     * @alias reload
     * @param {Object} state
     */
    function reload(state, options)
    {
        log('reload gallery', options);

        const deferred = $.Deferred();

        state.loader.show()
            .then(_.partial(updateSlides, state, options))
            .then(_.partial(refresh, state))
            .then(state.loader.hide)
            .then(deferred.resolve);

        return deferred.promise();
    }


    /**
     * Refreshes the gallery
     *
     * @function
     * @alias refresh
     * @param {Object} state
     */
    function refresh(state, options)
    {
        log('refresh gallery');

        const deferred = $.Deferred();

        updateState(state)
            .then(_.partial(updateState, state))
            .then(_.partial(updatePagination, state))
            .then(_.partial(showPage, state, options ? options.pageIndex || undefined : undefined))
            .then(deferred.resolve);

        return deferred.promise();
    }


    //
    // -- Event Handler -----------------------------------------------------------------------------------------------------------
    //

    /**
     * Refreshes the gallery
     *
     * @function
     * @alias refresh
     * @param {Object} state
     */
    function onUpdateDrag(state, phase, distance, direction)
    {
        const duration = 500 / (window.devicePixelRatio || 1);
        const getDragOffset = function(distance, direction)
        {
            const galleryWidth = state.$stage.width();
            let offset = 100 * (distance / galleryWidth);
            offset = offset - (offset * state.swipeDamping);
            if (direction == 'left')
            {
                offset*= -1;
            }
            return offset;
        };

        if (phase == 'move')
        {
            applyPageOffset(state, getPageOffset(state, state.pageIndex, getDragOffset(distance, direction)));
        }
        else if (phase == 'cancel')
        {
            applyPageOffset(state, getPageOffset(state, state.pageIndex), duration);
        }
        else
        {
            const offset = getDragOffset(distance);
            if (offset > state.swipeGesturePercentThreshold)
            {
                if (direction == 'right')
                {
                    showPage(state, 'prev', true);
                }
                else if (direction == 'left')
                {
                    showPage(state, 'next', true);
                }
            }
            else
            {
                applyPageOffset(state, getPageOffset(state, state.pageIndex), duration);
            }
        }
    }

    //
    // -- Public ------------------------------------------------------------------------------------------------------------------
    //

    /**
     * Initalize/Bootstraps the module
     *
     * @function
     * @alias initialize
     */
    exports.initialize = component.initialize(log, elements.rootSelector, bindings, prepare);


    /**
     * Gets a component instance
     *
     * @function
     * @alias getInstance
     * @see append
     * @param {String|DOMElement|Object} reference
     * Reference to an instance. You can use a instance id, the root element of a component or a state object
     * @returns {Object}
     */
    exports.getInstance = component.getInstance(log, events,
    {
        refresh: refresh,
        reload: reload
    }, exports.initialize);


    /**
     * Api
     *
     * @ignore
     */
    exports.events = events;
    return exports;
});
