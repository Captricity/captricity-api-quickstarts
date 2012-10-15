var uploadFormsQuickstart = uploadFormsQuickstart || {}

uploadFormsQuickstart.InstanceSetsView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render', 'next', 'createNewInstanceSet');
        this.collection.bind('reset', this.render);
    },

    createNewInstanceSet: function() {
        this.collection.create({name: 'Iset ' + this.collection.length}, {
            success: _.bind(function() {
                this.collection.fetch();
            }, this),
        });
    },

    next: function() {
        alert('TODO');
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        el.append($('<p>These are the instance sets associated with your job:</p>'));
        var listEl = $('<ul/>');
        el.append(listEl);
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
                new uploadFormsQuickstart.InstancesView({el: instancesDivEl, collection: instances, sheetCount: item.get('sheet_count')});
                instances.fetch();
            });
        }, this));
        var buttonEl = $('<button>Create new Instance Set</button>');
        buttonEl.click(this.createNewInstanceSet);
        el.append(buttonEl);
        
        var nextButtonEl = $('<button>Next</button>');
        nextButtonEl.click(this.next);
        el.append(nextButtonEl);
        return this;
    },
});

uploadFormsQuickstart.InstancesView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render', 'uploadImage');
        this.collection.bind('reset', this.render);
    },

    uploadImage: function(files) {
        if (window.uploadedFiles == undefined || window.uploadedFiles.length != 1) {
            alert('You must choose exactly 1 file to upload.');
        } else {
            var page_number = 0;
            if (this.collection.length > 0) {
                page_number = _.max(this.collection.pluck('page_number')) + 1;
            }
            var uploader = new captricity.MultipartUploader({
                'page_number': page_number,
                'image_file': files[0],
            }, _.bind(function(f, percent) { if (percent > 99) {this.collection.fetch();}}, this), 
            this.collection.url());
            $('.file-upload').html('Uploading...');
        }
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        var listEl = $('<ul/>');
        this.collection.each(function(item) {
            var listItemEl = $('<li/>');
            listItemEl.append($('<p>Page ' + item.get('page_number') + '</p>'));
            listEl.append(listItemEl);
        });
        if (this.collection.length < this.options.sheetCount) {
            var fileInputDivEl = $('<div class="file-upload"/>');
            var fileInputEl = $('<input type="file" accept="image/*,application/pdf" />');
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
