#pragma strict

var location1 : Vector3 = Vector3(-162, 29, -571);
var location2 : Vector3 = Vector3(195, 29, -383);
var location3 : Vector3 = Vector3(16.5, 27, -81);
var location4 : Vector3 = Vector3(201.5, 24.8, -391.3);

function OnTriggerStay (other : Collider) {
    if (other.tag == "enemy" || other.tag == "enemyDemon")
    {
    	other.rigidbody.velocity = Vector3.zero;
    	
    	var rand : int = Mathf.Floor(Random.value*4);
    	if(rand == 0)
    		other.transform.position = location1;
		else if(rand == 1)
    		other.transform.position = location2;
    	else if(rand == 2)
    		other.transform.position = location3;
    	else
    		other.transform.position = location4;
    		
    	print("GLITCHED: " + other.name);
    }
}