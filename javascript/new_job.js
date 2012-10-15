var newJobQuickstart = newJobQuickstart || {}

newJobQuickstart.DocumentView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render', 'createNewJobWithDocWrapper');
        this.collection.bind('reset', this.render);
    },

    createNewJobWithDocWrapper: function(doc) {
        var createNewJobWithDoc = function(evt) {
            evt.preventDefault();
            var jobs = new captricity.api.Jobs();
            jobs.create({document_id: doc.get('id')}, {
                success: function(job) {
                    alert(job.get('id'));
                },
            });
        };
        return createNewJobWithDoc;
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        el.append($('<p>Choose a template to create a new job:</p>'));
        var listEl = $('<ul/>');
        el.append(listEl);
        this.collection.each(_.bind(function (item) {
            var listItemEl = $('<li/>');
            var linkEl = $('<a href="#">').text(item.get('name') + ' (' + item.get('sheet_count') + ' pages)');
            linkEl.click(this.createNewJobWithDocWrapper(item));
            listItemEl.append(linkEl);
            listEl.append(listItemEl);
        }, this));
        return this;
    },
});
