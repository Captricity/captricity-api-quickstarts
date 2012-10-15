var captricityQuickstart = captricityQuickstart || {};

captricityQuickstart.SubmitJobView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render', 'next', 'back', 'submitJob', 'jobReadinessFetched', 'jobPriceFetched');
    },

    next: function() {
        alert('TODO');
    },

    back: function() {
        window.router.navigate('upload-forms/' + this.options.jobId, {trigger: true});
    },

    jobReadinessFetched: function(jobReadiness) {
        if (jobReadiness.get('is_ready_to_submit')) {
            $('#need-action-readiness').hide();
        } else {
            $('#need-action-readiness').show();
            $('#submit-job-button').hide();
        }
    },

    jobPriceFetched: function(jobPrice) {
        if (jobPrice.get('total_user_cost_in_cents') == 0) {
            $('#need-action-price').hide();
        } else {
            $('#need-action-price').show();
            $('#submit-job-button').hide();
        }
    },

    submitJob: function() {
        captricity.apiPost(captricity.url.submitJob(this.options.jobId), {},
        function() {
            alert('Successfully submitted job and your account was charged');
        });
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        var jobReadiness = new captricity.api.JobReadiness({id: this.options.jobId});
        jobReadiness.fetch();
        jobReadiness.bind('change:is_ready_to_submit', this.jobReadinessFetched, jobReadiness);
        el.append(new captricityQuickstart.JobReadinessView({el: $('<div/>'), model: jobReadiness}).el); 
        var jobPrice = new captricity.api.JobPrice({id: this.options.jobId});
        jobPrice.fetch();
        jobPrice.bind('change:total_user_cost_in_cents', this.jobPriceFetched, jobPrice);
        el.append(new captricityQuickstart.JobPriceView({el: $('<div/>'), model: jobPrice}).el); 

        var needActionReadinessDivEl = $('<div id="need-action-readiness" style="display:none;"/>');
        el.append(needActionReadinessDivEl);
        needActionReadinessDivEl.append($('<p>Your job is not ready to submit. Make sure all the Instance Sets in your job is complete (has an Instance for every page in the form)</p>'));
        var backLinkEl = $('<a href="#">Back</a>');
        backLinkEl.click(this.back);
        needActionReadinessDivEl.append(backLinkEl);

        var needActionPriceDivEl = $('<div id="need-action-price" style="display:none;"/>');
        el.append(needActionPriceDivEl);
        needActionPriceDivEl.append($('<p>You don\'t have enough credits in your account.</p>'));
        var addCreditsLinkEl = $('<a href="http://localhost:8000/accounts/purchase/">Add credits</a>');
        needActionPriceDivEl.append(addCreditsLinkEl);

        var submitButtonEl = $('<button id="submit-job-button">Submit Job</button>');
        submitButtonEl.click(this.submitJob);
        el.append(submitButtonEl);

        var nextButtonEl = $('<button>Next</button>');
        nextButtonEl.click(this.next);
        el.append(nextButtonEl);
        return this;
    },
});

captricityQuickstart.JobReadinessView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render');
        this.model.bind('change', this.render);
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        el.html('<p>Is job ready to submit?: ' + this.model.get('is_ready_to_submit') + '</p>');
        return this;
    },
});

captricityQuickstart.JobPriceView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render');
        this.model.bind('change', this.render);
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        el.html('<p>Job cost: ' + this.model.get('total_job_cost_in_cents') + ' cents<br />User cost: ' + this.model.get('total_user_cost_in_cents') + ' cents</p>');
        return this;
    },
});
