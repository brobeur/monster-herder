#pragma strict
var penController		: Transform;
var enemyName 			: String = "Jumper";
var enemyType			: int = 2;
var stringID			: String = "";
var player 				: Transform;

var playerTagName 		: String = "player";
var enemyTagName 		: String = "enemy";
var enemyDemonTagName 	: String = "enemyDemon";
var penTagName 			: String = "pen";
var penTriggerTagName 	: String = "penTrigger";
var boundaryTagName 	: String = "boundary";

var painAnimationTitle 		: String = "gothit";
var attackAnimationTitle 	: String = "bitchslap";
var fallAnimationTitle 	: String = "fall";
var idleAnimationTitle 	: String = "idle";
var landAnimationTitle 	: String = "land";
var roarAnimationTitle	: String = "Roar";
var jumpAnimationTitle	: String = "jump";

var speed 				: float = 8.0f;
var lookRayDistance 	: float = 15.0;
var growlChance 			: float = 0.0020;

private var chaseTimer 	: float = 0.0;
var timeUntilChasePlayerAgain : float = 1.6;

var turningTimer 		: float = 0.0;
private var turnDir 	: float  = 1;
var timeSpentTurning 	: float = 0.5;
var isTurning 			: boolean = false;
var turnSpeed 			: float = 160;
var turnSpeedFast 		: float = 320;

var attackSightAngle 		: float = 90;
var attackRadius			: float = 100;
var angleToLockOntoPlayer 	: float = 5;
var closeAttackRange 		: float = 8.0;

var attackLength 			: float = 1.0;
private var attackLengthTimer 	: float = attackLength;

private var escapeTimer 	: float = 0.0;
var escapeTimeAmount 		: float = 2.3;
private var isEscaping 		: boolean = false;

private var playerForward 		: Vector3;

var idleTurnTimeAmount 		: float = 1.0;
var idleTurnChance 			: float = 0.02;
var idleTurnTimer 	: float = 0.0;
var idleTurn 		: boolean = false;

private var stepAudio 		: AudioSource;
private var painAudio 		: AudioSource;
private var growlAudio 		: AudioSource;
private var chaseAudio 		: AudioSource;
private var attackAudio 	: AudioSource;
private var jumpAudio 		: AudioSource;


// 1 --> turning
// 2 --> chasing
// 3 --> escaping
// 4 --> idle
private final var TURNING 		: int = 1;
private final var CHASING 		: int = 2;
private final var ESCAPING 		: int = 3;
private final var IDLERUN 		: int = 4;
var behavior 					: int = IDLERUN; 
var formerBehavior 				: int = 4;

var jumpTimeLength				: float;
var jumpTimer 					: float;

private var jumpVector 			: Vector3;
var jumpUpAmount 				: float = 2.0;
var jumpForwardAmount 			: float = 1.0;
var jumpForce 					: float = 10000;
var landTime					: float;
var landTimer					: float;
var airDelta : float = 0.26;

function Start () {
	if(!player)
		print("WARNING: ATTACH PLAYER TO JUMPER!");
	
	chaseTimer = 0.0;
	turningTimer = timeSpentTurning;
	
	escapeTimer = escapeTimeAmount;
	idleTurnTimer = idleTurnTimeAmount;
	idleTurn = false;
	
	painAudio = GameObject.Find(enemyName + "/audioPain").audio;
	growlAudio = GameObject.Find(enemyName + "/audioGrowl").audio;
	chaseAudio = GameObject.Find(enemyName + "/audioChase").audio;
	attackAudio = GameObject.Find(enemyName + "/audioAttack").audio;
	jumpAudio = GameObject.Find(enemyName + "/audioJump").audio;
	
	var offsetRandom = Random.value;
	animation[painAnimationTitle].speed = 1.0;
	animation[attackAnimationTitle].speed = 1.2;
	
	attackLength = animation[attackAnimationTitle].length;
	jumpTimer = jumpTimeLength + 8*offsetRandom;;
	landTimer = landTime;
}


function Jump() {
	rigidbody.velocity = Vector3.zero;
	jumpAudio.Play();
	animation.Play(jumpAnimationTitle);
	animation.PlayQueued(fallAnimationTitle, QueueMode.CompleteOthers);
	jumpVector = jumpForce*(jumpForwardAmount*transform.forward + jumpUpAmount*transform.up);
	rigidbody.AddForce(jumpVector, ForceMode.Impulse);
}

function Update () {
	var elapsedTime : float = Time.deltaTime; 
	jumpTimer -= elapsedTime;
	if(jumpTimer <= 0)
	{	
		jumpTimer = jumpTimeLength;
		if(transform.position.y + 27.9665 - Terrain.activeTerrain.SampleHeight(transform.position) < airDelta)
			Jump();
	}
	else
	{
		landTimer -= elapsedTime;
		if(landTimer <= 0)
		{
			//animation.Play(idleAnimationTitle);
			//animation.Play(landAnimationTitle);
			//animation.PlayQueued(idleAnimationTitle, QueueMode.CompleteOthers);
			landTimer = landTime;
		}
	}
	
	var playerLevel : Vector3 = player.transform.position;
	playerLevel.y = transform.position.y;
	var angle : float = Vector3.Angle(playerLevel-transform.position, transform.forward);
	
	var localTarget = transform.InverseTransformPoint(player.position);
	var targetAngle = Mathf.Atan2(localTarget.x, localTarget.z) * Mathf.Rad2Deg;

	if(behavior != ESCAPING && behavior != CHASING) //Not chasing, check if time to chase again
	{
		chaseTimer += elapsedTime; 
		if(chaseTimer >= timeUntilChasePlayerAgain && ShouldChasePlayer(angle))
		{
			chaseAudio.Play();
			animation.Play(roarAnimationTitle);
			behavior = CHASING;
			chaseTimer = 0.0;
			isEscaping = false;
			if(Random.value < 0.5)
				InvertTurnDirection();
		}
	}

	CheckForwardRay();

	if(behavior == TURNING) //Turn
	{
		if(turningTimer == timeSpentTurning) //At the beginning of a turn, set random direction
			turnDir = Random.value - 0.5;
		turningTimer -= elapsedTime;
		Turn();
		
		if(turningTimer <= 0) //Done turning
		{
			if(formerBehavior == ESCAPING)
				behavior = CHASING;
			else
				behavior = IDLERUN;
				
			turningTimer = timeSpentTurning;
			chaseTimer = 0.0;
			isEscaping = false;
		}
	}
	else if(behavior == CHASING) //Chase player
	{
		var dist : float = Vector3.Distance(player.position, transform.position);
		if(dist >= attackRadius)
		{
			behavior = IDLERUN;
		}
		else
		{
			if(Mathf.Abs(targetAngle) > angleToLockOntoPlayer)
			{
				turnDir = targetAngle;
				Turn();
			}
			else //If it is looking within a certain angle, it will automatically turn straight towards you
			{
				transform.LookAt(player);
				transform.rotation.x =0;
				transform.rotation.z =0;
			}
			
			AttackIfInRange();
		}
	}
	else if(behavior == ESCAPING)
	{
		var awayAngle : float = Vector3.Angle(transform.position-playerLevel, transform.forward);
		if(Vector3.Angle(transform.forward, playerForward) > 10.0) //Turn until within 10 angle of away
			TurnFast();
			
		escapeTimer -= elapsedTime;
		if(escapeTimer <= 0) //Done escaping
		{
			behavior = IDLERUN;
			escapeTimer = escapeTimeAmount;
			isEscaping = false;
		}
		
	}
	else if(behavior == IDLERUN)
	{
		if(idleTurn)
		{
			idleTurnTimer -= elapsedTime;
			Turn();
			if(idleTurnTimer <= 0) //Done with idle turn
			{
				idleTurnTimer = idleTurnTimeAmount;
				idleTurn = false;
			}
		}
		else
		{
			IdleRun();
		}
	}
	
	/*
	if(behavior == TURNING)
		print("TURNING");
	if(behavior == CHASING)
		print("CHASING");
	if(behavior == ESCAPING)
		print("ESCAPING");
	if(behavior == IDLERUN)
		print("IDLERUN");
	*/
	
}

function FlashlightScare(awayVector : Vector3) {

	if(behavior == CHASING || behavior == IDLERUN)
	{
		growlAudio.Stop();
		chaseAudio.Stop();
		attackAudio.Stop();
		painAudio.Play();
	}
	
	turningTimer = timeSpentTurning;
	behavior = ESCAPING;
	isEscaping = true;
	escapeTimer = escapeTimeAmount;
	
	var playerLevel : Vector3 = player.transform.position;
	playerLevel.y = transform.position.y;
	playerForward = awayVector; 
	
	var localTarget = transform.InverseTransformPoint(player.position);
	var targetAngle = Mathf.Atan2(localTarget.x, localTarget.z) * Mathf.Rad2Deg;
	
	turnDir = -1 * targetAngle;
}

function CheckForwardRay()
{
	var hit : RaycastHit;
	var offsetRay : Vector3 = transform.position;
	offsetRay.y += 1;
    var ray : Ray = Ray(offsetRay, transform.forward);
    //Debug.DrawRay (ray.origin, ray.direction * lookRayDistance, Color.yellow);

	
	if(Physics.Raycast(ray, hit, lookRayDistance))
	{
		if(hit.transform.tag == penTagName  || hit.transform.tag == enemyTagName || hit.transform.tag == enemyDemonTagName || hit.transform.tag == boundaryTagName)
		{
			if(behavior == CHASING)	
				formerBehavior = CHASING;
			else if(behavior == ESCAPING)
			{	
				formerBehavior = ESCAPING;
				isEscaping = true;
			}
			else if(behavior == IDLERUN)
				formerBehavior = IDLERUN;
				
			behavior = TURNING;
			
			if(hit.transform.tag == penTagName)
				turningTimer = 0.1*timeSpentTurning;
			else
				turningTimer = timeSpentTurning;
			// print("Something blocking in the way...");
		}
	}
}


//Y positive turn is to right
function Turn()
{
	if(turnDir > 0) // turn right
	{
		transform.Rotate(0, turnSpeed*Time.deltaTime, 0);
	}
	else
	{
		transform.Rotate(0, -turnSpeed*Time.deltaTime, 0);
	}
}

function TurnFast()
{
	if(turnDir > 0) // turn right
	{
		transform.Rotate(0, turnSpeedFast*Time.deltaTime, 0);
	}
	else
	{
		transform.Rotate(0, -turnSpeedFast*Time.deltaTime, 0);
	}
}

function ShouldChasePlayer(angle : float)
{

	 var dist : float = Vector3.Distance(player.position, transform.position);
	 if(dist <= attackRadius && angle <= attackSightAngle)
	 {
	 	return true;
	 }
	 else
	 	return false;
	
}

function InvertTurnDirection()
{
	turnDir *= -1;
}

function IdleRun()
{
	if(Random.value < idleTurnChance) //% chance of turning
	{
		idleTurn = true;
		idleTurnTimer = (Random.value*2)*0.6;
		if(Random.value < 0.4) //% chance of changing direction
			InvertTurnDirection();
	}
	
	if(Random.value < growlChance && !growlAudio.isPlaying)
	{
		growlAudio.Play();
	}
}

function AttackIfInRange()
{
	attackLengthTimer -= Time.deltaTime;
	
	var dist : float = Vector3.Distance(player.position, transform.position);
	if(dist <= closeAttackRange && attackLengthTimer <= 0)
	{
		attackAudio.Play();
		animation.Play(attackAnimationTitle);
		// animation.PlayQueued(runAnimationTitle, QueueMode.CompleteOthers);
		
		var playerScript = player.GetComponent(scriptMainPlayerController);
		playerScript.AttackedByMonster(transform.position);
		
		attackLengthTimer = attackLength;
	}
}

function OnTriggerStay(other : Collider) {

	if(other.gameObject.tag == penTriggerTagName && (isEscaping || behavior == ESCAPING))
	{
		Herded();
	}
}

function Herded(){
	penController.GetComponent(scriptPenController).Capture(enemyType, this.gameObject);
	growlAudio.Play();
	transform.localScale *= 0.75;
}

function DisableSounds(){
	jumpAudio.volume = 0.04;
}