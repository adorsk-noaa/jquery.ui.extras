(function($){

    $.widget("ui.selectSlider", {

    options: {
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

        // Listen for changes in the select.

        this.$select.on('change', function(event){
            _this.value(_this.$select.val());
        });

        // Create slider.
        this.$slider = $('<div class="slider"></div>');
        this.element.append(this.$slider);
        this.$slider.slider({
            step: 1,
            min: 0,
            max: this.choices.length - 1,
            change: function(event, ui){
                _this.value(_this.choices[ui.value].value);
            }
        });

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
