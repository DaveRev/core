$(document).ready(function() {

	$('#externalStorage tbody tr.OC_Filestorage_Dropbox').each(function() {
		var configured = $(this).find('[data-parameter="configured"]');
		if ($(configured).val() == 'true') {
			$(this).find('.configuration input').attr('disabled', 'disabled');
			$(this).find('.configuration').append('<span id="access" style="padding-left:0.5em;">'+t('files_external', 'Access granted')+'</span>');
		} else {
			var app_key = $(this).find('.configuration [data-parameter="app_key"]').val();
			var app_secret = $(this).find('.configuration [data-parameter="app_secret"]').val();
			var config = $(this).find('.configuration');
			if (app_key != '' && app_secret != '') {
				var pos = window.location.search.indexOf('oauth_token') + 12;
				var token = $(this).find('.configuration [data-parameter="token"]');
				if (pos != -1 && window.location.search.substr(pos, $(token).val().length) == $(token).val()) {
					var token_secret = $(this).find('.configuration [data-parameter="token_secret"]');
					var tr = $(this);
					$.post(OC.filePath('files_external', 'ajax', 'dropbox.php'), { step: 2, app_key: app_key, app_secret: app_secret, request_token: $(token).val(), request_token_secret: $(token_secret).val() }, function(result) {
						if (result && result.status == 'success') {
							$(token).val(result.access_token);
							$(token_secret).val(result.access_token_secret);
							$(configured).val('true');
							OC.MountConfig.saveStorage(tr);
							$(tr).find('.configuration input').attr('disabled', 'disabled');
							$(tr).find('.configuration').append('<span id="access" style="padding-left:0.5em;">'+t('files_external', 'Access granted')+'</span>');
						} else {
							OC.dialogs.alert(result.data.message,
                                t('files_external', 'Error configuring Dropbox storage')
                            );
						}
					});
				}
			} else if ($(this).find('.mountPoint input').val() != '' && $(config).find('[data-parameter="app_key"]').val() != '' && $(config).find('[data-parameter="app_secret"]').val() != '' && $(this).find('.dropbox').length == 0) {
				$(this).find('.configuration').append('<a class="button dropbox">'+t('files_external', 'Grant access')+'</a>');
			}
		}
	});

	$('#externalStorage tbody tr input').live('keyup', function() {
		var tr = $(this).parent().parent();
		if ($(tr).hasClass('OC_Filestorage_Dropbox') && $(tr).find('[data-parameter="configured"]').val() != 'true') {
			var config = $(tr).find('.configuration');
			if ($(tr).find('.mountPoint input').val() != '' && $(config).find('[data-parameter="app_key"]').val() != '' && $(config).find('[data-parameter="app_secret"]').val() != '') {
				if ($(tr).find('.dropbox').length == 0) {
					$(config).append('<a class="button dropbox">'+t('files_external', 'Grant access')+'</a>');
				} else {
					$(tr).find('.dropbox').show();
				}
			} else if ($(tr).find('.dropbox').length > 0) {
				$(tr).find('.dropbox').hide();
			}
		}
	});

	$('.dropbox').live('click', function(event) {
		event.preventDefault();
		var app_key = $(this).parent().find('[data-parameter="app_key"]').val();
		var app_secret = $(this).parent().find('[data-parameter="app_secret"]').val();
		if (app_key != '' && app_secret != '') {
			var tr = $(this).parent().parent();
			var configured = $(this).parent().find('[data-parameter="configured"]');
			var token = $(this).parent().find('[data-parameter="token"]');
			var token_secret = $(this).parent().find('[data-parameter="token_secret"]');
			$.post(OC.filePath('files_external', 'ajax', 'dropbox.php'), { step: 1, app_key: app_key, app_secret: app_secret, callback: window.location.href }, function(result) {
				if (result && result.status == 'success') {
					$(configured).val('false');
					$(token).val(result.data.request_token);
					$(token_secret).val(result.data.request_token_secret);
					if (OC.MountConfig.saveStorage(tr)) {
						window.location = result.data.url;
					} else {
						OC.dialogs.alert(
                            t('files_external', 'Fill out all required fields'),
                            t('files_external', 'Error configuring Dropbox storage')
                        );
					}
				} else {
					OC.dialogs.alert(result.data.message,
                        t('files_external', 'Error configuring Dropbox storage')
                    );
				}
			});
		} else {
			OC.dialogs.alert(
                t('files_external', 'Please provide a valid Dropbox app key and secret.'),
                t('files_external', 'Error configuring Dropbox storage')
            );
		}
	});

});
