#pragma strict

var flashlight					: GameObject;
private var flashlightOn 		: boolean = true;
var flashlightDefaultIntensity 	: float = 1.6;

var playerCam					: GameObject;

var radarCam					: GameObject;
private var radarOn 			: boolean = false;

var flashlightRayDistance		: float = 50;//length of ray for cast
var enemyTagName 				: String = "enemy";
var enemyDemonTagName 			: String = "enemyDemon";
var penTagName 					: String = "pen";

var monsterName 				: String = "Monster";
var jumperName 					: String = "Jumper";
var crawlerName 				: String = "Crawler";
var demonName 					: String = "Demon";

var defaultRunSpeed 			: float = 10;
var sprintSpeed 				: float = 12;

private var running 			: boolean = false;

var seenFirstDemon 				: boolean = false;
var seenFirstCrawler			: boolean = false;

var flashlightRotationAmount 	: float = 30.0;
var flashlightRotationLeft 		: float = 0.0;
var flashlightRotationSpeed 	: float = 1.0;

private var flashlightWasOnBeforeSprint : boolean = true;

var health 						: int = 5;
var isDead 						: boolean = false;

var deathLength 				: float = 1.0;
private var deathTimer 			: float = 0.0;
private var deathAudio 			: AudioSource;
private var ambientMusic 		: AudioSource;
private var ambientVolume 				: float = 0.24;

var penController			: GameObject;
private var doNothing 		: boolean = false;

function Start () {
	flashlight.light.intensity = flashlightDefaultIntensity;
	
	if(!flashlight)
		print("WARNING: ATTACH FLASHLIGHT TO PLAYER!");
	if(!radarCam)
		print("WARNING: ATTACH RADARCAM TO PLAYER!");
		
	flashlightOn = true;
	radarOn = false;
	radarCam.camera.enabled = false;
	
	GetComponent(CharacterMotor).movement.maxForwardSpeed = defaultRunSpeed;
	flashlightRotationLeft = flashlightRotationAmount;
	
	deathAudio = GameObject.Find("deathAudio").audio;
	ambientMusic = GameObject.Find("ambientMusic").audio;
	ambientVolume = ambientMusic.volume;
	
	Screen.showCursor = false;
	Screen.lockCursor = true;
}

function OnGUI()
{
	if(!isDead)
		GUI.Label(Rect(10,10,100,20), "Life: " + ("|"*health));
}

function Update () {
	var elapsedTime : float = Time.deltaTime; 
	if(isDead)
	{
		if(doNothing)
			return;
			
		if(deathTimer == 0.0)
			deathAudio.Play();
		else if(deathTimer >= deathLength)
		{	
			penController.GetComponent(scriptPenController).GameOver();
			doNothing = true;
		}
		deathTimer += elapsedTime;
		transform.Rotate(0, 0, -60);
		return;
	}
	
	
	if(Input.GetKey(KeyCode.Escape))
	{
		Application.Quit();
	}
	if(Input.GetKeyUp(KeyCode.M))
	{
		ambientMusic.volume = Mathf.Abs(ambientMusic.volume - ambientVolume);
	}
	/*
	if(Input.GetKeyUp(KeyCode.G))
	{
		Destroy(GameObject.Find("Point light").gameObject);
	}
	*/
	
	if (Input.GetKeyUp(KeyCode.F))
	{
		ClickFlashlight();
	}
	/*
	if (Input.GetKeyUp(KeyCode.R))
	{
		ClickRadar();
	}*/
	
	if(Input.GetKeyUp(KeyCode.W) || Input.GetKeyUp(KeyCode.A) || Input.GetKeyUp(KeyCode.S)|| Input.GetKeyUp(KeyCode.D))
	{
        audio.Stop();
        running = false;
	}
	
	if(Input.GetKey(KeyCode.W) || Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.S)|| Input.GetKey(KeyCode.D))
	{
		if(!running)
		{
			running = true;
	    	audio.Play();
	    }
	}
	
	if(Input.GetKeyDown(KeyCode.LeftShift))
	{
	    flashlightWasOnBeforeSprint = flashlightOn;
       	flashlightOn = false;
       	audio.pitch = 1.5;
       	flashlight.light.intensity = 0.0;
	}
	
	if(Input.GetKey(KeyCode.LeftShift))
	{
        GetComponent(CharacterMotor).movement.maxForwardSpeed = sprintSpeed;
        GetComponent(CharacterMotor).movement.maxSidewaysSpeed = sprintSpeed;
        GetComponent(CharacterMotor).movement.maxBackwardsSpeed = sprintSpeed;
        //flashlight.light.intensity = 0.0;
        if(flashlightRotationLeft > 0)
        {
       		GameObject.Find("Flashlight").transform.Rotate(flashlightRotationSpeed, 0, 0);
       		flashlightRotationLeft -= 0.5;
       	}
	}
	else
	{
		if(flashlightRotationLeft < flashlightRotationAmount)
		{
			GameObject.Find("Flashlight").transform.Rotate(-flashlightRotationSpeed, 0, 0);
			flashlightRotationLeft += 0.5;
		}
	}

	if(Input.GetKeyUp(KeyCode.LeftShift))
	{
        GetComponent(CharacterMotor).movement.maxForwardSpeed = defaultRunSpeed;
        GetComponent(CharacterMotor).movement.maxSidewaysSpeed = defaultRunSpeed;
        GetComponent(CharacterMotor).movement.maxBackwardsSpeed = defaultRunSpeed;
    	if(flashlightWasOnBeforeSprint)
    	{
    		flashlightOn = true;
			flashlight.light.intensity = flashlightDefaultIntensity;
		}
		else
		{
			flashlightOn = false;
			flashlight.light.intensity = 0.0;
		}
		
		audio.pitch = 1.1;
	}

	CheckFlashlightRay();
	
}

function ClickFlashlight()
{
	flashlightWasOnBeforeSprint = !flashlightWasOnBeforeSprint;
    flashlightOn = !flashlightOn;
	if(flashlightOn)
		flashlight.light.intensity = flashlightDefaultIntensity;
	else
		flashlight.light.intensity = 0.0;
}

function ClickRadar()
{
    radarOn = !radarOn;
	if(radarOn)
		radarCam.camera.enabled = true;
	else
		radarCam.camera.enabled = false;
}

function CheckFlashlightRay() 
{
	/*
	var hitLeft : RaycastHit;
	var rayLeft : Ray = playerCam.camera.ScreenPointToRay(Vector3(playerCam.camera.pixelWidth/2 - 50,playerCam.camera.pixelHeight/2,0));
	Debug.DrawRay (rayLeft.origin, rayLeft.direction * flashlightRayDistance, Color.white);
	
	var hitRight : RaycastHit;
	var rayRight : Ray = playerCam.camera.ScreenPointToRay(Vector3(playerCam.camera.pixelWidth/2 + 50,playerCam.camera.pixelHeight/2,0));
	Debug.DrawRay (rayRight.origin, rayRight.direction * flashlightRayDistance, Color.white);
	*/
	var hitMiddle : RaycastHit;
	var rayMiddle : Ray = playerCam.camera.ScreenPointToRay(Vector3(playerCam.camera.pixelWidth/2,playerCam.camera.pixelHeight/2,0));
	Debug.DrawRay (rayMiddle.origin, rayMiddle.direction * flashlightRayDistance, Color.white);
	/*
	if(Physics.Raycast(rayLeft, hitLeft, flashlightRayDistance))
	{
		
		//Left
		if(hitLeft.transform.tag == enemyMonsterTagName)
		{
			if(flashlightOn)
			{
				var enemyMonsterScriptLeft = hitLeft.transform.GetComponent(scriptMonsterController);
				enemyMonsterScriptLeft.FlashlightScare(rayLeft.direction);
			}
		}
		else if(hitLeft.transform.tag == enemyDemonTagName)
		{
			if(flashlightOn)
			{
				var enemyDemonScriptLeft = hitLeft.transform.GetComponent(scriptDemonController);
				enemyDemonScriptLeft.FlashlightScare(rayLeft.direction);
			}
		}
	}
	if(Physics.Raycast(rayRight, hitRight, flashlightRayDistance))
	{
		
		//Right
		if(hitRight.transform.tag == enemyMonsterTagName)
		{
			if(flashlightOn)
			{
				var enemyMonsterScriptRight = hitRight.transform.GetComponent(scriptMonsterController);
				enemyMonsterScriptRight.FlashlightScare(rayRight.direction);
			}
		}
		else if(hitRight.transform.tag == enemyDemonTagName)
		{
			if(flashlightOn)
			{
				var enemyDemonScriptRight = hitRight.transform.GetComponent(scriptDemonController);
				enemyDemonScriptRight.FlashlightScare(rayRight.direction);
			}
		}
	}
	*/
	if(Physics.Raycast(rayMiddle, hitMiddle, flashlightRayDistance))
	{
		
		//Middle
		if(hitMiddle.transform.tag == enemyTagName)
		{
			if(flashlightOn)
			{
				//var enemyMonsterScriptMiddle = hitMiddle.transform.GetComponent(scriptFlashlightHit);
				//enemyMonsterScriptMiddle.FlashlightScare(transform.forward);
				if(hitMiddle.transform.name.Contains(monsterName))
				{
					var enemyMonsterScriptMiddle = hitMiddle.transform.GetComponent(scriptMonsterController);
					enemyMonsterScriptMiddle.FlashlightScare(transform.forward);
				}
				else if(hitMiddle.transform.name.Contains(jumperName))
				{
					var enemyJumperScriptMiddle = hitMiddle.transform.GetComponent(scriptJumperController);
					enemyJumperScriptMiddle.FlashlightScare(transform.forward);
				}
				else if(hitMiddle.transform.name.Contains(crawlerName))
				{
					var enemyCrawlerScriptMiddle = hitMiddle.transform.GetComponent(scriptCrawlerController);
					enemyCrawlerScriptMiddle.FlashlightScare(transform.forward);
				}
			}
			//if(Random.value < 0.05)
			//	AudioSource.PlayClipAtPoint(detectionAudio, transform.position, 0.5);
		}
		else if(hitMiddle.transform.tag == enemyDemonTagName)
		{
			if(flashlightOn)
			{
				var enemyDemonScriptMiddle = hitMiddle.transform.GetComponent(scriptDemonController);
				enemyDemonScriptMiddle.FlashlightScare(transform.forward);
			}
			if(!seenFirstDemon)
			{
				GameObject.Find("detectionAudio").audio.Play();
				seenFirstDemon = true;
			}
		}
	}
	
}

function AttackedByMonster(monsterPosition : Vector3)
{
	GameObject.Find("painAudio").audio.Play();
	transform.position.y += 0.5;
	health--;
	
	if(health <= 0)
	{
		isDead = true;
	}
}
