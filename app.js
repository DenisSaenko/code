var app = {};
debugger;
app.EventStorage = new Backbone.LocalStorage('events');
app.Event = Backbone.Model.extend({
	urlRoot: '/events',
	localStorage: app.eventStorage,

	defaults: {
		name: '',
		date: '',
		text: '',
		attitude: '',
		location: '',
		video: ''
	}
});

app.EventCollection = Backbone.Collection.extend({
	model: app.Event,
	url: '/event',
	localStorage: app.eventStorage
});


app.EventListView = Backbone.View.extend({
	tagName: 'div',

	className: 'row',

	template: _.template($('#list-dataEvent').html()),

	events: {
		'click .add': 'addClicked'
	}, 

	addClicked: function(ev) {
		ev.preventDefault();
		Backbone.history.navigate("event/new");
		$('#wrapper').empty().append(new app.EventEditView({model: new app.Event()}).render().$el);		
	},

	emptyView: false, 

	initialize: function(options) {
		this.colleciton = options.collection;
		this.listenTo(this.colleciton, 'all',    this.isEmptyEvents);
		this.listenTo(this.colleciton, 'remove', this.removeEvent);
		this.listenTo(this.colleciton, 'reset',  this.addAll);
	},

	addOne: function(dataEvent) {
		var eventView = new app.EventItemView({model: dataEvent});
		this.$('tbody').append(eventView.render().$el);
	},

	addAll: function() {
		this.$('tbody').empty();
		if(this.emptyView) {
			this.emptyView.remove();
			this.emptyView = false;
		}
		this.colleciton.each(this.addOne, this);
	},

	render: function() {
		this.$el.html(this.template());
		return this;
	},

	isEmptyEvents: function() {
		if(this.colleciton.length && this.emptyView) {
			this.emptyView.remove();
			this.emptyView = false;
		} else if(!this.colleciton.length && !this.emptyView) {
			this.emptyView = new app.EmptyView();
			this.$('tbody').empty().append(this.emptyView.render().$el);
		}	
	}
});

app.EmptyView = Backbone.View.extend({
	tagName: 'tr',

	className: 'error',

	template: _.template($('#no-event').html()),

	render: function() {
		this.$el.html(this.template());
		return this;
	}
});

app.EventItemView = Backbone.View.extend({
	tagName: 'tr',

	events: {
		'click .remove': 'removeClicked',
		'click .edit':   'editClicked'
	},

	removeClicked: function(ev) {
		ev.preventDefault();
		this.remove();
		this.model.destroy();
	},

	editClicked: function(ev) {
		ev.preventDefault();
		Backbone.history.navigate("events/" + this.model.get('id') + "/edit");
		$('#wrapper').empty().append(new app.EventEditView({model: this.model}).render().$el);
	},

	template: _.template($('#navigation').html()),

	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});

app.EventEditView = Backbone.View.extend({
	tagName: 'div',

	events: {
		'submit form': 'submitClicked'
	},

	submitClicked: function(ev) {
		ev.preventDefault();
		var data = {};
		this.$("input[type!='submit']").each(function() {
		    data[$(this).attr("nameEvent")] = $(this).val();
		});
		this.model.set(data);
		this.model.save().done(function() {
			var events = new app.EventCollection();
			var view  = new app.EventListView({collection: events});
			$('#wrapper').empty().append(view.render().$el);

			events.fetch({reset: true}).done(function() {
				Backbone.history.navigate("events");				
			});
		});
	},

	template: _.template($('#edit-event').html()),

	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});

app.Router = Backbone.Router.extend({
	routes: {
		"":               "listEvents",
		"events":          "listEvents",
		"events/:id/edit": "editEvent",
		"events/new":      "newEvent"
	},
	listEvents: function() {
		var events = new app.EventCollection();
		var view  = new app.EventListView({collection: events});
		$('#wrapper').empty().append(view.render().$el);
		events.fetch({reset: true});
	},
	editEvent: function(id) {
		var event = new app.Event({id: id});
		event.fetch({success: function() {
			var view = new app.EventEditView({model: event});
			$('#wrapper').empty().append(view.render().$el);
		}});
	},
	newEvent: function() {
		var event = new app.Event();
		var view = new app.EventEditView({model: event});
		$('#wrapper').empty().append(view.render().$el);
	}
});

new app.Router();
Backbone.history.start();
