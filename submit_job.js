var captricityQuickstart = captricityQuickstart || {};

// A view to show a user if a job is ready to submit, and let the user submit the job
captricityQuickstart.SubmitJobView = Backbone.View.extend({
    initialize: function() {
        // Not mentioned here, but view requires a jobId parameter to function
        _.bindAll(this, 'render', 'next', 'back', 'submitJob', 'jobReadinessFetched', 'jobPriceFetched');
    },

    // Navigate to the next quickstart example
    next: function() {
        window.router.navigate('select-job', {trigger: true});
    },

    // Go back to uploading forms because job is not ready to submit
    back: function() {
        window.router.navigate('upload-forms/' + this.options.jobId, {trigger: true});
    },

    /* When the job readiness model (captricity.api.JobReadiness) is fetched and updated,
     * check to see if job is ready to submit and if not, let the user know action is necessary
     */
    jobReadinessFetched: function(jobReadiness) {
        if (jobReadiness.get('is_ready_to_submit')) {
            $('#need-action-readiness').hide();
        } else {
            $('#need-action-readiness').show();
            $('#submit-job-button').hide();
        }
    },

    /* When the job price model (captricity.api.JobPrice) is fetched and updated,
     * check to see if user needs to pay. If so, let the user know.
     */
    jobPriceFetched: function(jobPrice) {
        if (jobPrice.get('total_user_cost_in_cents') == 0) {
            $('#need-action-price').hide();
        } else {
            $('#need-action-price').show();
            $('#submit-job-button').hide();
        }
    },

    // Submit the job using the submit job resource
    submitJob: function() {
        captricity.apiPost(captricity.url.submitJob(this.options.jobId), {},
        function() {
            alert('Successfully submitted job and your account was charged');
        });
    },

    render: function() {
        var el = $(this.el);
        el.empty();

        // First show job readiness info
        var jobReadiness = new captricity.api.JobReadiness({id: this.options.jobId});
        jobReadiness.fetch();
        jobReadiness.bind('change:is_ready_to_submit', this.jobReadinessFetched, jobReadiness);
        el.append(new captricityQuickstart.JobReadinessView({el: $('<div/>'), model: jobReadiness}).el); 

        // Next show job price info
        var jobPrice = new captricity.api.JobPrice({id: this.options.jobId});
        jobPrice.fetch();
        jobPrice.bind('change:total_user_cost_in_cents', this.jobPriceFetched, jobPrice);
        el.append(new captricityQuickstart.JobPriceView({el: $('<div/>'), model: jobPrice}).el); 

        // Setup instructions for resolving readiness issue
        var needActionReadinessDivEl = $('<div id="need-action-readiness" style="display:none;"/>');
        el.append(needActionReadinessDivEl);
        needActionReadinessDivEl.append($('<p>Your job is not ready to submit. Make sure all the Instance Sets in your job is complete (has an Instance for every page in the form)</p>'));
        var backLinkEl = $('<a href="#">Back</a>');
        backLinkEl.click(this.back);
        needActionReadinessDivEl.append(backLinkEl);

        // Setup instructions for resolving price issue
        var needActionPriceDivEl = $('<div id="need-action-price" style="display:none;"/>');
        el.append(needActionPriceDivEl);
        needActionPriceDivEl.append($('<p>You don\'t have enough credits in your account.</p>'));
        var addCreditsLinkEl = $('<a href="http://localhost:8000/accounts/purchase/">Add credits</a>');
        needActionPriceDivEl.append(addCreditsLinkEl);

        // Add link to submit job
        var submitButtonEl = $('<button id="submit-job-button">Submit Job</button>');
        submitButtonEl.click(this.submitJob);
        el.append(submitButtonEl);

        var nextButtonEl = $('<button>Next</button>');
        nextButtonEl.click(this.next);
        el.append(nextButtonEl);
        return this;
    },
});

// View to display information about Job's readiness to submit
captricityQuickstart.JobReadinessView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render');
        this.model.bind('change', this.render); // model should be an instance of the job readiness resource (captricity.api.JobReadiness)
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        el.html('<p>Is job ready to submit?: ' + this.model.get('is_ready_to_submit') + '</p>');
        return this;
    },
});

// View to display information about Job's price
captricityQuickstart.JobPriceView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render');
        this.model.bind('change', this.render); // model should be an instance of the job price resource (captricity.api.JobPrice)
    },

    render: function() {
        var el = $(this.el);
        el.empty();
        el.html('<p>Job cost: ' + this.model.get('total_job_cost_in_cents') + ' cents<br />User cost: ' + this.model.get('total_user_cost_in_cents') + ' cents</p>');
        return this;
    },
});
