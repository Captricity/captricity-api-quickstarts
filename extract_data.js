var captricityQuickstart = captricityQuickstart || {};

captricityQuickstart.JobListView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render');
        this.collection.bind('reset', this.render);
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        el.append($('<p>Choose a job from below to view the extracted data of:</p>'));
        var listEl = $('<ul/>');
        el.append(listEl);
        this.collection.each(function(item) {
            var listItemEl = $('<li/>');
            listItemEl.append($('<a href="#extract-data/' + item.get('id') + '">' + item.get('name') + '</a>'));
            listEl.append(listItemEl);
        });
        return this;
    },
});

captricityQuickstart.DataExtractionView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render', 'getCSV', 'backToBeginning');
        this.collection.bind('reset', this.render);
    },

    backToBeginning: function() {
        window.router.navigate('new-job', {trigger: true});
    },

    getCSV: function(evt) {
        evt.preventDefault();
        captricity.apiGet(captricity.url.jobResultsCsv(this.collection.id), function(response) {
            alert(response);
        });
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        var tableEl = $('<table style="width: 100%; overflow: auto;"/>');
        el.append(tableEl);
        this.collection.each(function(item) {
            var shreds = new captricity.api.InstanceSetShreds();
            shreds.instance_set_id = item.get('id');
            var tableRowEl = $('<tr/>');
            tableEl.append(tableRowEl);
            new captricityQuickstart.ShredsView({el: tableRowEl, collection: shreds, rowName: item.get('name')});
            shreds.fetch();
        });

        var csvButtonEl = $('<button>CSV</button>');
        csvButtonEl.click(this.getCSV);
        el.append(csvButtonEl);

        var backButtonEl = $('<button>Back to Beginning</button>');
        backButtonEl.click(this.backToBeginning);
        el.append(backButtonEl);
        return this;
    },
});

captricityQuickstart.ShredsView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render');
        this.collection.bind('reset', this.render);
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        el.append($('<td>' + this.options.rowName +'</td>'));
        var sortedShreds = _.sortBy(this.collection.models, function(item) {return item.get('field').id;});
        _.each(sortedShreds, function(item) {
            el.append($('<td>' + item.get('best_estimate') + '</td>'));
        });
        return this;
    },
});
