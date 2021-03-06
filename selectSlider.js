(function($, ui){

    $.widget("ui.selectSlider", {

    options: {
        showTics: true,
        allTics: true,
        showLabels: true,
        labelInterval: 3,
        tooltips: true,
        choices: [],
    },

    _create: function(){
        $(this.element).addClass('ui-widget ui-select-slider');
        var _this = this;
        this.values = [];

        // Create inner container.
        this.$inner = $('<div class="inner"></div>').appendTo(this.element);

        // Get or create the select element.
        var match = this.element.children('select');
        if (match.length == 0){
            this.$select = $('<select></select>');
            this.$inner.append(this.$select);
            this.choices = this.options.choices;
        }
        else{
            this.$select = $(match[0]);
            // Extract choices from the select options.
            var extractedChoices = [];
            this.$select.children('options').each(function(i, $el){
                extractedChoices.push({
                    'value': $el.attr('id'),
                    'label': $el.text()
                });
            });
            this.choices = extractedChoices;
        }

        // Prepare the choices.
        this.choices = this._prepareChoices(this.choices);

        // Listen for changes in the select when not sliding.
        this.$select.on('change', function(e){
            if (! _this._sliding){
                _this.value(_this.$select.val());
            }
        });

        // Create slider.
        this.$slider = $('<div class="slider"></div>').appendTo(this.$inner);
        this._setUpSliderHandles();

        if (this.options.tooltips){
            this._setUpTooltips();
        }

        this._setUpTicsLabels();
        this.$slider.slider({
            step: 1,
            min: 0,
            max: 1,
            change: function(e, ui){
                if (_this.choices.length == 0){
                    return;
                }
                _this.value(_this.choices[ui.value].value);
            },
            start: function(e, ui){
                _this._sliding = true;
            },
            slide: function(e, ui){
                if (_this.choices.length == 0){
                    return;
                }
                // Get the current choice the slider is on.
                var choice = _this.choices[ui.value];

                // Update select.
                _this.$select.val(choice.value);
                
                // Update tooltip.
                if (_this.options.tooltips){
                    _this._refreshTooltip(choice, ui.value);
                }
            },
            stop: function(e, ui){
                _this._sliding = false;
            }
        });

        // No corners, and no side borders if showing tics.
        this.$slider.removeClass("ui-corner-all");
        if (! this.options.showTics){
            this.$slider.css('border-right', '0');
            this.$slider.css('border-left', '0');
        }

        // Refresh the slider and select.
        this._refreshSlider();
        this._refreshSelect();

        // Set initial value if none set.
        if (! this.value() && this.choices.length > 0){
            this.value(this.choices[0].value);
        }

    },


    _setUpSliderHandles: function(){
        this.$slider_handle = $('<a href="#" class="ui-slider-handle" role="slider"></a>'); 
        this.$slider_handle.appendTo(this.$slider);
    },

    _setUpTooltips: function(){
        var $tooltipContainer  = $('<div class="tooltip-container"></div>').insertBefore(this.$slider);
        this.$tooltip = $('<span class="ui-select-slider-tooltip ui-corner-all"><span class="content"></span><span class="pointer-down"><span class="inner"></span></span>');
        this.$tooltip.appendTo($tooltipContainer);

        // Listen for changes to slider handles.
        var _this = this;
        e2c_map = [
            ['mouseenter', 'state-hover', 'add'],
            ['mouseleave', 'state-hover', 'remove'],
            ['focus', 'state-focus', 'add'],
            ['blur', 'state-focus', 'remove']
                ];

        $.each(e2c_map, function(i, e2c){
            _this.$slider_handle.on(e2c[0], function(e){
                if (e2c[2] == 'add'){
                    _this.$tooltip.addClass(e2c[1]);
                }
                else if (e2c[2] == 'remove'){
                    _this.$tooltip.removeClass(e2c[1]);
                }
            });
        });

    },

    _getChoicePosPct: function(choice_idx){
        return (choice_idx/(this.choices.length - 1) * 100.0).toFixed(2) + '%';
    },

    _setUpTicsLabels: function(){
        if (this.options.showTics){
            this.$tics = $('<div class="tics"></div>').appendTo(this.$slider);
        }
        if (this.options.showLabels){
            this.$labels = $('<div class="labels"></div>').insertAfter(this.$slider);
        }
    },

    _setOption: function(key, value){
        var i, valsLength = 0;
        if ( $.isArray( this.options.values ) ) {
            valsLength = this.options.values.length;
        }

        switch(key){
            case "value":
                this._refreshValue();
                this._change( null, 0 );
                break;
            case "values":
                this._refreshValue();
                for ( i = 0; i < valsLength; i += 1 ) {
                    this._change( null, i );
                }
                break;
            case "choices":
                var choices = value;
                if (choices.length > 0){
                    this.choices = this._prepareChoices(choices);
                    this._refreshSelect();
                    this._refreshSlider();
                }
                break;
        }

        $.Widget.prototype._setOption.apply( this, arguments );
    },

    _getSelectChoices: function(){
        var choices = [];
        this.$select.children('option').each(function(i, $el){
            choices.push({
               value: $el.attr('value'),
               label: $el.text()
           });
        });
        return choices;
    },

    _prepareChoices: function(choices){
        var _this = this;
        $.each(choices, function(i, c){
            if (c.label == null){
                c.label = c.value;
            }

            if (_this.options.ticInterval){
                c.showTic = ( (i % _this.options.ticInterval) == 0);
            }
            else if (_this.options.allTics){
                c.showTic = true;
            }

            if (_this.options.labelInterval){
                c.showLabel= ( (i % _this.options.labelInterval) == 0);
            }
            else if (_this.options.allLabels){
                c.showLabel = true;
            }

            choices[i] = c;
        })
        return choices;
    },
    
    _populateSelect: function(options){
        this.$select.empty();
        var _this = this;
        $.each(options, function(i, o){
            _this.$select.append($('<option value="' + o.value + '">' + o.label + '</option>'));
        });
    },

    _change: function( event, index ) {
        var uiHash = {
            handle: this,
            value: this.value()
        };
        if ( this.options.values && this.options.values.length ) {
            uiHash.value = this.values( index );
            uiHash.values = this.values();
        }

        this._trigger( "change", event, uiHash );
    },

    _refreshValue: function(){
        this.$select.val(this.value());
        var choice_idx = this.$select.children('option[value="' + this.value() + '"]').index()
        if (this.$slider.slider('value') != choice_idx){
            this.$slider.slider('value', choice_idx);
        }

        // Update tooltip.
        if (this.options.tooltips){
            this._refreshTooltip(this.choices[choice_idx], choice_idx);
        }
    },

    _refreshTooltip: function(choice, choice_idx){
        // Position relative to choice and center.
        this.$tooltip.css('left', this._getChoicePosPct(choice_idx));
        var tt_pos = this.$tooltip.position();
        this.$tooltip.css('left', tt_pos.left - this.$tooltip.width()/2.0);

        // Set the label.
        this.$tooltip.children('.content').text(choice.label);
    },

    _refreshSlider: function(){
        this.$slider.slider('option', {'max': this.choices.length - 1});
        this._refreshTicsLabels();
    },


    _refreshTicsLabels: function(){
        this.$tics.empty();
        this.$labels.empty();

        var _this = this;
        $.each(this.choices, function(i, choice){
            var left = _this._getChoicePosPct(i);

            if (_this.options.showLabels && choice.showLabel){
                var $label = $('<span class="label">' + choice.label + '</span>');
                $label.css('left', left);
                $label.appendTo(_this.$labels);
            }

            if (_this.options.showTics && choice.showTic){
                var $tic = $('<span class="tic"></span>');
                $tic.css('left', left);
                if (_this.options.showLabels && choice.showLabel){
                    $tic.addClass("labeled");
                }
                $tic.appendTo(_this.$tics);
            }
        });
    },

    _refreshSelect: function(){
        this.$select.empty();
        var _this = this;
        $.each(this.choices, function(i, o){
            _this.$select.append($('<option value="' + o.value + '">' + o.label + '</option>'));
        });
    },

    value: function( newValue ) {
        if ( arguments.length ) {
            // Only change if value is new.
            if (this.options.value != newValue){
                this.options.value = newValue;
                this._change( null, 0 );
            }
            this._refreshValue();
            return;
        }
        return this.options.value;
    },


    });

})(jQuery);
