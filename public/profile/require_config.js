require.config({
	baseUrl: "/src",
	paths: {
		"text": "/external/require/text",
		"persona": "//login.persona.org/include"
	}
});

require( ["profile/profile","persona"],
	function(ProfilePage) {
		var l = new ProfilePage();
	}
);