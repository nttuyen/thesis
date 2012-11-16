function onLoad() {
	new AjaxUpload('button_upload', {
	  action: 'http://localhost:8080/thesis-web/upload',
	  onSubmit: function() {
	    this.disable();
	  }
	  ,onComplete: function(file, response){
		  response = response.replace("<pre>", "");
		  response = response.replace("</pre>", "");
		  jQuery("#music_media").attr("value", response);
		  jQuery("#music_media").attr("readonly", "readonly");
		  this.enable();
		}
	});
}

function addClick(id, form_id){
	var element = jQuery(id);
	element.click(function(event){
		jQuery(form_id).attr("action", element.attr("href"));
		return false;
	});
}

