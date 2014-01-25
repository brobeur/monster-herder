#pragma strict

var fadeInTimer : float = 0.0;
var fadeInLength : float = 4.0;
var fadeInSpeed : float = 0.02;

var fadeOutTimer : float = 0.0;
var fadeOutLength : float = 4.0;
var fadeOutSpeed : float = 0.02;

function Start () {
	renderer.material.color.a = 0.0;
}

function Update () {
	
	if(fadeInTimer < fadeInLength)
	{
		fadeInTimer += Time.deltaTime;
		renderer.material.color.a += fadeInSpeed;
	}
	else
	{
		fadeOutTimer += Time.deltaTime;
		renderer.material.color.a -= fadeOutSpeed;
		
		if(fadeOutTimer >= fadeOutLength)
		{
			Destroy(gameObject);
		}
	}
}