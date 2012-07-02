(function($){

    $.widget("ui.selectSlider", {

    options: {
        labels: 3,
        tooltips: true
    },

    _create: function(){
        var _this = this;
        this.values = [];

        // Get or create the select element.
        var match = this.element.children('select');
        if (match.length == 0){
            this.$select = $('<select></select>');
            this.element.append(this.$select);

            // If choices were given, populate the select.
            this.choices = this._prepareChoices(this.options.choices);
            this._populateSelect(this.choices);
        }
        else{
            this.$select = $(match[0]);
        }

        // Listen for changes in the select when not sliding.
        this.$select.on('change', function(e){
            if (! _this._sliding){
                _this.value(_this.$select.val());
            }
        });

        // Create slider.
        this.$slider = $('<div class="slider"></div>');
        this._setUpSliderHandles();
        this._setUpSliderLabels();
        this.element.append(this.$slider);
        this.$slider.slider({
            step: 1,
            min: 0,
            max: this.choices.length - 1,
            change: function(e, ui){
                _this.value(_this.choices[ui.value].value);
            },
            start: function(e, ui){
                _this._sliding = true;
            },
            slide: function(e, ui){
                // Get the current choice the slider is on.
                var choice = _this.choices[ui.value];

                // Update select.
                _this.$select.val(choice.value);
                
                // Update tooltip.
                if (_this.options.tooltips){
                    _this.$tooltip.children('.text').text(choice.label);
                }
            },
            stop: function(e, ui){
                _this._sliding = false;
            }
        });

        // Set initial value if none set.
        if (! this.value() && this.choices.length > 0){
            this.value(this.choices[0].value);
        }

    },

    _setUpSliderHandles: function(){
        var $handle = $('<a href="#" class="ui-slider-handle" role="slider"></a>'); 
        $handle.appendTo(this.$slider);
        if (this.options.tooltips){
            this.$tooltip = $('<span class="ui-slider-tooltip ui-widget-content ui-corner-all"><span class="text"></span><span class="ui-tooltip-pointer-down ui-widget-content"><span class="ui-tooltip-pointer-down-inner"></span></span>');
            this.$tooltip.appendTo($handle);
        }
    },

    _setUpSliderLabels: function(){
        var $scale = $('<ol class="ui-slider-scale ui-helper-reset" role="presentation"></ol>');
        $scale.appendTo(this.$slider);
        var _this = this;
        $.each(this.choices, function(i, choice){
            var leftVal = (i/(_this.choices.length - 1) * 100.0).toFixed(2) + '%';
            var $label = $('<li><span class="ui-slider-label"></span><span class="ui-slider-tic ui-widget-content"></span></li>');
            $label.css('left', leftVal);
            $label.children('.ui-slider-label').first().text(choice.label);
            $label.appendTo($scale);
        });

        if (this.options.labels > 1) {
            this.$slider.find('.ui-slider-scale li:last span.ui-slider-label').addClass('ui-slider-label-show');
        }
	
        var increm = Math.max(1, Math.round(this.choices.length / this.options.labels));
        for (var i=0; i < this.choices.length; i +=increm){
            if ( (this.choices.length - i) > increm){
                this.$slider.find('.ui-slider-scale li:eq('+ i +') span.ui-slider-label').addClass('ui-slider-label-show');
            }
        }

    },


    _init: function(){
    },

    _setOption: function(key, value){
        var i, valsLength = 0;
        if ( $.isArray( this.options.values ) ) {
            valsLength = this.options.values.length;
        }

        $.Widget.prototype._setOption.apply( this, arguments );

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
        }
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
        $.each(choices, function(i, c){
            if (c.label == null){
                c.label = c.value;
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
        var val_idx = this.$select.children('option[value="' + this.value() + '"]').index()
        if (this.$slider.slider('value') != val_idx){
            this.$slider.slider('value', val_idx);
        }

        // Update tooltip.
        if (this.options.tooltips){
            this.$tooltip.children('.text').text(this.choices[val_idx].label);
        }
    },

    value: function( newValue ) {
        if ( arguments.length ) {
            this.options.value = newValue;
            this._refreshValue();
            this._change( null, 0 );
            return;
        }
        return this.options.value;
    },


    });

})(jQuery);
