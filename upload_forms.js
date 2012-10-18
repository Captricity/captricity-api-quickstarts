var captricityQuickstart = captricityQuickstart || {}

// A view to list all the instance sets associated with the selected job
captricityQuickstart.InstanceSetsView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render', 'next', 'createNewInstanceSet');
        this.collection.bind('reset', this.render); // collection should be the collection of instance sets (captricity.api.InstanceSets) associated with a job
    },

    // Create a new instance set and refetch the list so that the view will rerender
    createNewInstanceSet: function() {
        this.collection.create({name: 'Iset ' + this.collection.length}, {
            success: _.bind(function() {
                this.collection.fetch();
            }, this),
        });
    },

    // Navigate to next quickstart
    next: function() {
        window.router.navigate('submit-job/' + this.collection.id, {trigger: true});
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        el.append($('<p>These are the instance sets associated with your job:</p>'));
        var listEl = $('<ul/>');
        el.append(listEl);
        /* Organize the instance sets in to a list of clickable instance sets.
         * When clicked, it will automatically fetch and list all the instances
         * associated with the instance set and provide an interface for adding
         * instances.
         */
        this.collection.each(_.bind(function(item) {
            var listItemEl = $('<li/>');
            listEl.append(listItemEl);
            var linkEl = $('<a href="#">').text(item.get('name'));
            listItemEl.append(linkEl);
            var instancesDivEl = $('<div/>');
            listItemEl.append(instancesDivEl);
            linkEl.click(function(evt) {
                evt.preventDefault();
                var instances = new captricity.api.InstanceSetInstances();
                instances.id = item.get('id');
                new captricityQuickstart.InstancesView({el: instancesDivEl, collection: instances, sheetCount: item.get('sheet_count')});
                instances.fetch();
            });
        }, this));

        // Button for creating a new instance set for the job
        var buttonEl = $('<button>Create new Instance Set</button>');
        buttonEl.click(this.createNewInstanceSet);
        el.append(buttonEl);
        
        var nextButtonEl = $('<button>Next</button>');
        nextButtonEl.click(this.next);
        el.append(nextButtonEl);
        return this;
    },
});

// A view to list all the instances associated with a particular instance set
captricityQuickstart.InstancesView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render', 'uploadImage');
        this.collection.bind('reset', this.render); // collection should be the collection of instances (captricity.api.InstanceSetInstances) associated with the instance set
    },

    // Upload the selected image to the captricity server
    uploadImage: function() {
        if (window.uploadedFiles == undefined || window.uploadedFiles.length != 1) {
            alert('You must choose exactly 1 file to upload.');
        } else {
            var page_number = 0;
            if (this.collection.length > 0) {
                page_number = _.max(this.collection.pluck('page_number')) + 1;
            }
            var uploader = new captricity.MultipartUploader({
                'page_number': page_number,
                'image_file': window.uploadedFiles[0],
            }, _.bind(function(f, percent) { if (percent > 99) {this.collection.fetch();}}, this), 
            // Refetch the instances to rerender the view when upload completes
            this.collection.url());
            $('.file-upload').html('Uploading...');
        }
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        var listEl = $('<ul/>');
        el.append(listEl);
        // Order the instances in list format
        this.collection.each(function(item) {
            var listItemEl = $('<li/>');
            listItemEl.append($('<p>Page ' + item.get('page_number') + '</p>'));
            listEl.append(listItemEl);
        });
        // Only show interface to add instances if we can add instances to the instance set (instance set not full)
        if (this.collection.length < this.options.sheetCount) {
            var fileInputDivEl = $('<div class="file-upload"/>');
            var fileInputEl = $('<input type="file" accept="image/*,application/pdf" />');
            // Log the selected files in window object so it can be accessed later
            fileInputEl.change(function() { window.uploadedFiles = this.files; });
            fileInputDivEl.append(fileInputEl);
            var uploadButtonEl = $('<button>Upload Instance</button>');
            uploadButtonEl.click(this.uploadImage);
            fileInputDivEl.append(uploadButtonEl);
            el.append(fileInputDivEl);
        }
        return this;
    }
});
