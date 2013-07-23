require.config({
	baseUrl: "/src",
	paths: {
		"text": "/external/require/text",
		"persona": "//login.persona.org/include"
	}
});

require( ["login/login","persona"],
	function(LoginPage) {
		var l = new LoginPage();
	}
);