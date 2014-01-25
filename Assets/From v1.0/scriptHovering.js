#pragma strict

var hoverTime : float = 2.0;
var hoverTimer : float = 0.0;
var up : boolean = true;

var movementSpeed : float = 0.1;

function Start () {
	hoverTimer += hoverTime * Random.value;
}

function Update () {
	var elapsedTime = Time.deltaTime;
	if(up)
	{
		hoverTimer += elapsedTime;
		if(hoverTimer >= hoverTime)
		{
			up = false;
		}
		else
		{
			this.transform.position.y += movementSpeed;
		}
	}
	else
	{
		hoverTimer -= elapsedTime;
		if(hoverTimer <= 0)
		{
			up = true;
		}
		else
		{
			this.transform.position.y -= movementSpeed;
		}
	}
}