/*globals define, app, document, console*/

define( [
    'jquery','lodash',
    'src/views/BaseView',
    'text!src/views/crud/fileUpload.html','src/utils/html',
    'fileuploadjs','tmpl','jqueryiframetransport','jqueryfileuploadui'
  ], function(
    $,_,
    BaseView,
    formTemplate,html,
    fileupload,tmpl,iframetransport,fileuploadui
  ) {

'use strict';

var FileUploadView = BaseView.extend({

  resource: undefined,

  title: '',

  defaults: {
    url                  : undefined,
    uploadTemplateId     : 'template-upload',
    downloadTemplateId   : 'template-download',
    formAcceptCharset    : 'utf-8',
    maxFileSize          : 50000000, //50M,
    forceIframeTransport : true,
    multipart            : true,
    acceptFileTypes      : /(\.|\/)(zip|rar|doc|docx|pdf|gif|jpe?g|png)$/i
  },

  initialize: function(options) {
    options = options || {};

    _.defaults(this, options, this.defaults);

    BaseView.prototype.initialize.call(this, options);

    _.bindAll(this, 'del');

    this.template = formTemplate;

    this.url = this.url || window.location.href.split('/webapp')[0] +  '/Archivo';

    if (this.entityModelAttr=== undefined){
      throw new Error("Attribute entityModelAttr must be defined");
    }

  },

  events: {
    'click button.deleteFile' : 'del'
  },

  render: function(){
    BaseView.prototype.render.call(this);

    var
      uiElement = "#fileupload",
      that = this;

    this.$el = $(this.el);
    this.$el.html(this.template);

    this.$(uiElement).fileupload({
      url: this.options.url,
      uploadTemplateId: this.options.uploadTemplateId,
      downloadTemplateId: this.options.downloadTemplateId,
      formAcceptCharset: this.options.formAcceptCharset,
      maxFileSize: this.options.maxFileSize,
      multipart: this.options.multipart,
      acceptFileTypes: this.options.acceptFileTypes,

      submit: function (e, data) {
        data.formData = {
          entityId : (that.controller.model!==undefined)? that.controller.model.get(that.entityModelAttr) : null,
          files: data.files[0]
        };
        data.formData.files = JSON.stringify(data.formData.files);


        return true;
      },
      done: function(e,data){
        var resp = {name: JSON.parse(data.formData.files).name, status : data.textStatus};

        // to set some behavior after submit
        if (that.afterSubmit!== undefined){
          that.afterSubmit(e,data);

          $(uiElement).find('tbody.files').html("");
        }


        // This activate the delete button --> This must trigger delete action
        // var trElement = $(uiElement).find("[class='name "+resp.name+"']").parent();
        // trElement.find('.cancel button').attr('disabled',true);
        // trElement.find('.delete button').attr('disabled',false);
      },
      fail:function(e,data){
        console.log('Error on Fileuploader');
      }
    });

    return this;
  },
  del: function(e){
    // TODO:
  }

});

  return FileUploadView;
});
