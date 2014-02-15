//Make an empty game object and call it "Door"
//Rename your 3D door model to "Body"
//Parent a "Body" object to "Door"
//Make sure that a "Door" object is in left down corner of "Body" object. The place where a Door Hinge need be
//Add a box collider to "Door" object and make it much bigger then the "Body" model, mark it trigger
//Assign this script to a "Door" game object that have box collider with trigger enabled
//Press "f" to open the door and "g" to close the door
//Make sure the main character is tagged "player"

// Smothly open a door
var smoothOpen = 2.0;
var smoothClose = 2.0;
private var opening : boolean;
private var nearby : boolean;

private var defaultPos : Vector3;
private var openPos : Vector3;
var doorOpenHeight = -5;

function Start(){
	defaultPos = transform.position;
	openPos = new Vector3(defaultPos.x, defaultPos.y + doorOpenHeight, defaultPos.z);
}

//Main function
function Update (){
	if(opening){
		//Open door
		transform.position = Vector3.Lerp(transform.position, openPos, smoothOpen*Time.deltaTime);
	} else {
		//Close door
		transform.position = Vector3.Lerp(transform.position, defaultPos, smoothClose*Time.deltaTime);
	}

	if(nearby){
		opening = true;
	} else {
		opening = false;
	}
}

//Activate the Main function when player is near the door
function OnTriggerEnter (other : Collider){
	if (other.gameObject.tag == "Player") {
		nearby = true;
	}
}

//Deactivate the Main function when player is go away from door
function OnTriggerExit (other : Collider){
	if (other.gameObject.tag == "Player") {
		nearby = false;
	}
}
