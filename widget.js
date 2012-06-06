/**
 * Widget uses Google Books API to show the list of volumes
 * inside defined bookshelf for defined user. Current version
 * shows the volumes only from public bookshelves.
 * You need to provide id of element in which the widget will
 * reside. You need to put also user id (Google user) and bookshelf id.
 *
 *
 * @version 0.1
 */
var GBooksWidget = (function() {

	/**
	 * @cfg {String} The id of container where the widget will reside.
	 */
	var containerId = null;

	/**
	 * @cfg {Number} The id of user which will share his books.
	 */
	var userId 		= 0;

	/**
	 * @cfg {Number} The id of bookshelf form which the books will be shown.
	 */
	var bookshelfId = 0;

	/**
	 * @cfg {Number} The number of books to show in widget.
	 */
	var itemsNumber = 5;

	/**
	 * @cfg {String} The base url where all resources for this widget arranged.
	 */
	var resourcesBaseUrl = '';

	return {
		/**
		 * @property {Array} Internal array of volumes.
		 */
		volumes : [],

		/**
		 * Loads and register google books api in gapi.client.
		 * Initialize containerId, userId and bookshelfId params from config object.
		 *
		 * @param {Object} config
		 */
		init : function(config) {
			var self = this;

			containerId = config.containerId || 'books';
			userId 		= config.userId || 0;
			bookshelfId = config.bookshelfId || 0;
			itemsNumber = config.itemsNumber || itemsNumber;
			resourcesBaseUrl = config.resourcesBaseUrl || resourcesBaseUrl;

			gapi.client.load('books', 'v1', function() {
				self.loadVolumes();
			});
		},

		/**
		 * Make API call to Google APIs to get the list of volumes inside
		 * bookshelf. If succeeded - loads the items to internal array.
		 */
		loadVolumes : function() {
			var self = this;
			var request = gapi.client.books.bookshelves.volumes.list({userId : userId, shelf : bookshelfId});
			request.execute(function(data) {
				if(data.items) { //succeeded
					self.volumes = data.items;
					self.render();
				}
			});
		},

		/**
		 * Generates the DOM Element from parsed Book Row template, and append it
		 * to the container element. After each book appends the separator element.
		 *
		 */
		render : function() {
			var template = this.getVolumeTemplate();
			var container = document.getElementById(containerId);
			var bookElement = null;
			var bookInfo = null;
			var separator = null;
			//Calculate the number of items to display

			var itemsToDisplay = (this.volumes.length > itemsNumber)? itemsNumber : this.volumes.length;
			for(var i = 0; i < itemsToDisplay; i++) {
				bookInfo = this.convertToInternalBookData(this.volumes[i]);
				bookElement = document.createElement('div');
				bookElement.className = 'book-info';
				bookElement.innerHTML = this.assign(template, bookInfo);
				container.appendChild(bookElement);
				if(i != (itemsToDisplay - 1) ) {
					separator = document.createElement('div');
					separator.className = 'book-separator';
					container.appendChild(separator);
				}
			}
		},

		/**
		 * Replace placeholders inside template with the data, provided
		 * by google api.
		 *
		 * @param {String} The template with placeholders like  {{placeholder}}
		 * @param {Object} The values, which we will put instead of placeholders
		 * @return {String} The template with replaced placeholders replaced with values.
		 */
		assign : function(template, values) {
			var t = template.replace(/{{(.*?)}}/ig, function(tmplStr, paramName) {
				return values[paramName] || '';
			});
			return t;
		},

		/**
		 * Return the template string for book row.
		 * @return {String} Template
		 */
		getVolumeTemplate : function() {
			return 	'<div class="authors">{{book_authors}}</div>' +
					'<h3><a href="{{book_link}}" target="_blank">{{book_title}}</a></h3>' +
					'<img src="{{book_image_small}}" class="book-cover" />' +
					'<p class="description">{{book_description}}</p>';
		},

		/**
		 * Convert the data which comes from google to internal hash object
		 * which is suitable for applying in template.
		 *
		 * @param {Google Volume Data Object} volumeData
		 * @return {Object} Simple object, contained book properties.
		 */
		convertToInternalBookData : function(volumeData) {
			return {
				'book_link'		: volumeData.volumeInfo.infoLink,
				'book_title' 	: volumeData.volumeInfo.title,
				'book_authors'	: volumeData.volumeInfo.authors.join(', '),
				'book_description' : volumeData.volumeInfo.description,
				'book_image_small' : volumeData.volumeInfo.imageLinks? volumeData.volumeInfo.imageLinks.smallThumbnail : resourcesBaseUrl + '/no-cover.png',
				'book_raiting'		: volumeData.volumeInfo.averageRating,
				'book_page_count'	: volumeData.volumeInfo.pageCount,
				'book_publisher'	: volumeData.volumeInfo.publisher
			};
		}
	};
})();