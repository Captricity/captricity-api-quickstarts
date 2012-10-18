var captricityQuickstart = captricityQuickstart || {}

// A view that lists out all the documents owned by the user so that they can select which document to create a job with
captricityQuickstart.DocumentView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render', 'next', 'createNewJobWithDocWrapper');
        this.collection.bind('reset', this.render); // collection should be the collection of documents (captricity.api.Document) associated with the user
    },

    // Create a new job using the selected document
    createNewJobWithDocWrapper: function(doc) {
        var createNewJobWithDoc = _.bind(function(evt) {
            evt.preventDefault(); // Prevent the default action of navigating to href
            var jobs = new captricity.api.Jobs();
            jobs.create({document_id: doc.get('id')}, {
                // When the job creation is successful, set the model object and trigger a rerender of the view 
                success: _.bind(function(job) {
                    this.model = new captricity.api.Job({id: job.get('id')});
                    this.model.bind('change', this.render);
                    this.model.fetch();
                }, this),
            });
        }, this);
        return createNewJobWithDoc;
    },

    // Navigate to next quickstart example
    next: function() {
        window.router.navigate('upload-forms/' + this.model.get('id'), {trigger: true});
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        el.append($('<p>Choose a template to create a new job:</p>'));
        var listEl = $('<ul/>');
        el.append(listEl);
        // Order the documents into a list, each one being a link to create a new job using the document
        this.collection.each(_.bind(function (item) {
            var listItemEl = $('<li/>');
            var linkEl = $('<a href="#">').text(item.get('name') + ' (' + item.get('sheet_count') + ' pages)');
            linkEl.click(this.createNewJobWithDocWrapper(item));
            listItemEl.append(linkEl);
            listEl.append(listItemEl);
        }, this));
        // If a document has been selected and a job was created, mention it and let the user continue
        if (this.model != undefined) {
            el.append($('<p>You have successfully created a <a id=\'new-job-info-link\' href=\'#\'>new job</a>. Click next to continue on to the next quickstart example.</p>'));
            $('#new-job-info-link').click(_.bind(function() {
                alert('New Job id: ' + this.model.get('id'));
            }, this));
            var buttonEl = $('<button id=\'new-job-next\'>Next</button>');
            el.append(buttonEl);
            buttonEl.click(this.next);
        }
        return this;
    },
});
