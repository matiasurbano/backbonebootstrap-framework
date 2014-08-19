/*globals define*/

define( [
    'jquery', 'lodash', 'src/utils/convert',
    'src/utils/models/FieldCollection'
  ], function(
    $, _, convert,
    FieldCollection
  ) {

'use strict';

var crud = {};

/**
 * Generates the information to display the paginator from the collection.
 *
 * @param     {BaseCollection} collection the collection to paginate
 * @options   {Object} aditional configuration
 *
 * @return
 * {
 *   page:    number, current page
 *   len:     number, records per page
 *   from:    number, number of first record in page, ((page-1)*len)+1
 *   to:      number, number of last record in page, from + collection.length-1
 *   total:   number, total number of records corresponding to the query, regardless pagination
 *   last:    number: last page
 *   pages: [  each page element represents a link to a page
 *     {page: 1 , text: "1", active: true, enabled: true},
 *     {page: 2 , text: "2", active: false, enabled: true},
 *     ...
 *   ]
 * }
 *
 * It checks collection.page, collection.len and collection.total
 * And generates a data structure with all the information needed
 * to display the paginator
 *
 */
crud.paginate = function(collection, options) {

  options = options || {};

  var pagesToShow = options.pagesToShow || 3, // show 3 pages before the current one, the current one, and 3 pages after: 7 pages
      page        = parseInt(collection.page, 10),
      len         = parseInt(collection.len, 10),
      from        = ((page-1) * len) + 1,
      to          = from + collection.length-1,
      total       = collection.total,
      more        = collection.more,
      last        = Math.ceil(total / len),
      pages       = [],
      c;

  // we are not calculating the total number of records
  if (total === null) {
    // if there are more records, by default show 3 more pages
    last = more ? page + 3 : page;
  }

  //first page
  pages.push({page: 1 , text: '««', active: false, enabled: page > 1});
  //previous page
  pages.push({page: Math.max(1, page-1), text: '«', active: false, enabled: page > 1});

  // allways show 'pagesToShow' pages before the current and 'pagesToShow' pages after the current
  var beginPage = page - (pagesToShow);
  if (beginPage < 1) beginPage = 1;

  var endPage = beginPage + (pagesToShow * 2) + 1; // pre, current, post

  for(c = beginPage; c < endPage; c++) {
    if (c > last) break;
    pages.push({ page: c, text: c.toString(), active: (c === page), enabled: c <= last });
  }

  //next page
  pages.push({ page: page + 1, text: '»', active: false, enabled: more });

  // if we don't have the total number of records,
  // disable the last page button
  //last page
  pages.push({ page: last, text: '»»', active: false, enabled: (total !== null && more) });

  // check for no records
  if (page === 1 && collection.length === 0) from = 0;

  if (!more) total = to;

  return {
    page  : page,
    len   : len,
    from  : from,
    to    : to,
    total : total,
    more  : more,
    last  : last,
    pages : pages
  };
};

crud.highlightItems = function(items, search, before, after) {

  search = convert.escapeRegExp(search);

  var pattern = new RegExp('(' + search + ')', 'igm');
  before = before || '<span class="label label-info collapsed">';
  after = after || '</span>';

  _.each(items, function(item) {
    var $item = $(item),
        text  = $item.html();

    if (pattern.test(text)) {
      $item.html(text.replace(pattern, before + '$1' + after));
    }
  });
};

crud.generateTableRowTemplate = function(tableSchema) {

  if (!tableSchema || !tableSchema instanceof Array || tableSchema.length===0) {
    throw new Error('Cannot generate table row template. No columns specified.');
  }

  var tableFields = new FieldCollection(tableSchema);

  var template = '';
  _.each(tableFields, function(tableField) {
    // template += '  <td><%= ' + tableField.displayTemplate + ' %></td> \n';
    template += '  <td><%= ' + tableField.name + ' %></td> \n';
  });
  return template;
};

crud.generateTableTitlesHtml = function(tableSchema) {

  if (!tableSchema || !tableSchema instanceof Array || tableSchema.length === 0) {
    throw new Error('Cannot generate table titles html. No columns specified.');
  }

  var html        = '',
      tableFields = new FieldCollection(tableSchema);

  _.each(tableFields, function(field) {
    var order = field.order,
        label = field.label;

    if (_.isBoolean(order) && !order) {
      html += '  <th>' + label + '</th> \n';
    } else {
      html += '  <th order="' + order + '">' + label + '<i class="icon-order"></i></th> \n';
    }
  });
  return html;
};

  return crud;
});
