#pragma strict
var player : Transform;

var numEnemies			: int = 6;
var monstersCaptured 	: int = 0;
var jumpersCaptured 	: int = 0;
var crawlersCaptured 	: int = 0;
var demonsCaptured 		: int = 0;

public static final var MONSTER 	: int = 1;
public static final var JUMPER 		: int = 2;
public static final var CRAWLER 	: int = 3;
public static final var DEMON 		: int = 4;

var spawnY 				: float = 18.0;
var spawnRandomnessX	: float = 10.0;
var spawnRandomnessZ	: float = 10.0;
private var penLocation : Vector3;

var gameOver 					: boolean = false;

public var globalLight 			: GameObject;
public var gameOverCamera 		: GameObject;

public var YRotationStart 		: float = 7.7;
public var YRotationEnd 		: float = -53.0;
var gameOverTitle 				: GameObject;
var monstersSubtitle 			: GameObject;
var jumpersSubtitle 			: GameObject;
var crawlersSubtitle 			: GameObject;
var demonsSubtitle 				: GameObject;

var ambientMusic 				: GameObject;
var fireworks	 				: GameObject;

var test : boolean = false;
var gameOverLightIntensity 		: float = 3.0;
var gameWinLightIntensity 		: float = 3.0;
var gameOverCameraSpeed 		: float = 0.005;

function Start () {
	monstersCaptured = 0;
	jumpersCaptured = 0;
	crawlersCaptured = 0;
	demonsCaptured = 0;
	
	penLocation = this.transform.position;
	penLocation.y = spawnY;
}

function Capture(enemyType: int, enemy : GameObject)
{

	print("INTO THE PEN! ...." + enemy.name);
	var xOffset : float = (Random.value - 0.5) * spawnRandomnessX;
	var zOffset : float = (Random.value - 0.5) * spawnRandomnessZ;
	if(enemyType == MONSTER) // monster
	{
		var id : String = "";
		if(monstersCaptured < 5) //(monstersCaptured == 0)
		{
			enemy.transform.position = penLocation + Vector3(xOffset, 0, zOffset);
			var enemyScript = enemy.GetComponent(scriptMonsterController);
			enemyScript.DisableSounds();
			enemyScript.penTriggerTagName = "";
			enemyScript.penTagName = "";
			enemyScript.idleTurnChance = 0.13;
			enemyScript.attackRadius = 18;
			enemyScript.closeAttackRange = 5;
			enemyScript.growlChance = 0.0;
			enemyScript.speed *= 0.5;
			enemyScript.herded = true;
			id = enemyScript.stringID;
		}
		else
		{
			Destroy(GameObject.Find("MonsterController"));
			for(var i : int = 2; i <= numEnemies; i++)
			{
				Destroy(GameObject.Find("MonsterController" + i));
			}
		}
		monstersCaptured++;
		
		GameObject.Find("JumperController" + id).SetActiveRecursively(true);
			
	
	}
	else if(enemyType == JUMPER)
	{
		var id2 : String = "";
		if(jumpersCaptured < 5) //(jumpersCaptured == 0)
		{
			enemy.transform.position = penLocation + Vector3(xOffset, 0, zOffset);
			var enemyScript2 = enemy.GetComponent(scriptJumperController);
			enemyScript2.DisableSounds();
			enemyScript2.penTriggerTagName = "";
			enemyScript2.penTagName = "";
			enemyScript2.idleTurnChance = 0.13;
			enemyScript2.attackRadius = 18;
			enemyScript2.closeAttackRange = 5;
			enemyScript2.growlChance = 0.0;
			enemyScript2.speed *= 0.5;
			//enemyScript2.herded = true;
			id2 = enemyScript2.stringID;
		}
		else
		{
			Destroy(GameObject.Find("JumperController"));
			for(var i2 : int = 2; i2 <= numEnemies; i2++)
			{
				Destroy(GameObject.Find("JumperController" + i2));
			}
		}

		GameObject.Find("CrawlerController" + id2).SetActiveRecursively(true);
		jumpersCaptured++;
	}
	else if(enemyType == CRAWLER)
	{
		var id3 : String = "";
		if(jumpersCaptured < 5) //(jumpersCaptured == 0)
		{
			enemy.transform.position = penLocation + Vector3(xOffset, 0, zOffset);
			var enemyScript3 = enemy.GetComponent(scriptCrawlerController);
			enemyScript3.DisableSounds();
			enemyScript3.penTriggerTagName = "";
			enemyScript3.penTagName = "";
			enemyScript3.idleTurnChance = 0.13;
			enemyScript3.attackRadius = 18;
			enemyScript3.closeAttackRange = 5;
			enemyScript3.growlChance = 0.0;
			enemyScript3.speed *= 0.5;
			enemyScript3.herded = true;
			id3 = enemyScript3.stringID;
		}
		else
		{
			Destroy(GameObject.Find("CrawlerController"));
			for(var i3 : int = 2; i3 <= numEnemies; i3++)
			{
				Destroy(GameObject.Find("CrawlerController" + i3));
			}
		}
		crawlersCaptured++;

		GameObject.Find("DemonController" + id3).SetActiveRecursively(true);
	}
	else //demon
	{
		if(demonsCaptured >= 0) //(jumpersCaptured == 0)
		{
			enemy.transform.position = penLocation + Vector3(xOffset, 0, zOffset);
			var enemyScript4 = enemy.GetComponent(scriptDemonController);
			enemyScript4.DisableSounds();
			enemyScript4.penTriggerTagName = "";
			enemyScript4.penTagName = "";
			enemyScript4.idleTurnChance = 0.13;
			enemyScript4.attackRadius = 18;
			enemyScript4.closeAttackRange = 5;
			enemyScript4.growlChance = 0.0;
			enemyScript4.herded = true;
		}
		else
		{
			Destroy(enemy);
		}
	
		if(++demonsCaptured == numEnemies)
		{
			print("YOU WIN!");
			//Application.LoadLevel(Application.loadedLevel);
			GameOver();
		}
	}
	
}

function GameOver()
{
	gameOver = true;
	gameOverTitle.SetActiveRecursively(true);
	player.transform.position = Vector3(0, 100, 0);
	
	if(demonsCaptured >= numEnemies)
	{
		gameOverTitle.GetComponent(TextMesh).text = "All Monsters Herded";
		fireworks.SetActiveRecursively(true);
	}
	
	if(monstersCaptured > 0)
	{
		var monsterString : String = "Captured " + monstersCaptured + " monster";
		if(monstersCaptured > 1)
			monsterString += "s";
		monstersSubtitle.GetComponent(TextMesh).text = monsterString;
	}
	if(jumpersCaptured > 0)
	{
		var jumperString : String = jumpersCaptured + " jumper";
		if(jumpersCaptured > 1)
			jumperString += "s";
		jumpersSubtitle.GetComponent(TextMesh).text = jumperString;
	}
	if(crawlersCaptured > 0)
	{
		var crawlerString : String = crawlersCaptured + " crawler";
		if(crawlersCaptured > 1)
			crawlerString += "s";
		crawlersSubtitle.GetComponent(TextMesh).text = crawlerString;
	}
	if(demonsCaptured > 0)
	{
		var demonString : String = demonsCaptured + " demon";
		if(demonsCaptured > 1)
			demonString += "s";
		demonsSubtitle.GetComponent(TextMesh).text = demonString;
	}
		
	Camera.main.active = false;
	gameOverCamera.active = true;
	gameOverCamera.transform.rotation.y = YRotationStart;
	globalLight.SetActive(true);
	globalLight.light.enabled = true;
	
	if(demonsCaptured < numEnemies)
		globalLight.light.intensity = gameOverLightIntensity;
	else
		globalLight.light.intensity = gameWinLightIntensity;
	
	ambientMusic.transform.position = gameOverCamera.transform.position;
}

function Update()
{
	if(test)
	{
		test = false;
		GameOver();
	}
		
	if(gameOver)
	{
		player.transform.position = Vector3(0, 100, 0);
		gameOverCamera.transform.rotation.y -= gameOverCameraSpeed;
		
		if(gameOverCamera.transform.rotation.y <= YRotationEnd)
		{
			Application.LoadLevel(Application.loadedLevel);
		}
	}
}