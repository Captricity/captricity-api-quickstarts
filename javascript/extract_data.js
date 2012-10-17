var captricityQuickstart = captricityQuickstart || {};

// A view to list out the completed jobs a user has, so that they can select which job to browse the results of
captricityQuickstart.JobListView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render');
        this.collection.bind('reset', this.render); // Collection should be the collection of completed jobs (captricity.api.Jobs) owned by the user
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        el.append($('<p>Choose a job from below to view the extracted data of:</p>'));
        var listEl = $('<ul/>');
        el.append(listEl);
        // For each job create a list item with a link to the data extraction viewer page
        this.collection.each(function(item) {
            var listItemEl = $('<li/>');
            listItemEl.append($('<a href="#extract-data/' + item.get('id') + '">' + item.get('name') + '</a>'));
            listEl.append(listItemEl);
        });
        return this;
    },
});

// A view to list out the results in a table, along with a link to the CSV export
captricityQuickstart.DataExtractionView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render', 'getCSV', 'backToBeginning');
        this.collection.bind('reset', this.render); // Collection should be the collection of instance sets (captricity.api.InstanceSets) associated with the job for which we are viewing the results for
    },

    // Navigate back to the beginning of the quickstart examples
    backToBeginning: function() {
        window.router.navigate('new-job', {trigger: true});
    },

    // Obtain the CSV export and show in an alert box
    getCSV: function(evt) {
        evt.preventDefault();
        captricity.apiGet(captricity.url.jobResultsCsv(this.collection.id), function(response) {
            alert(response);
        });
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        // Organize the results in table format
        var tableEl = $('<table style="width: 100%; overflow: auto;"/>');
        el.append(tableEl);
        // For each instance set create a row with the shred results
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

// A view that organizes the shreds in to a table row
captricityQuickstart.ShredsView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render');
        this.collection.bind('reset', this.render);
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        // Name the row by instance set name
        el.append($('<td>' + this.options.rowName +'</td>'));
        // Keep the row ordering constant: order by shred's field id
        var sortedShreds = _.sortBy(this.collection.models, function(item) {return item.get('field').id;});
        _.each(sortedShreds, function(item) {
            el.append($('<td>' + item.get('best_estimate') + '</td>'));
        });
        return this;
    },
});
