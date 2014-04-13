using UnityEngine;
using System.Collections;

public class TrapController : MonoBehaviour {

	public float speed = 10f;
	private bool activated = false;
	private bool exploded = false;
	public float chanceOfDetectingPlayer = 0.33f;
	private bool detectsPlayer = false;
	public string[] tagsToDetect;
	public string playerTag = "Player";
	public float rocketLifetime = 3f;
	public float lifetimeBeforeRemoval = 3f;
	public float exitDuration = 3f;
	public float sinkingRate = 0.1f;

	public GameObject missile;
	public GameObject rocketBody;
	public GameObject missileSmoke;
	public GameObject missileExplosion;
	public GameObject missileLight;

	private ParticleSystem explosionEmitter;

	//public Color colorStart;
	//public Color colorEnd;

	// Use this for initialization
	void Start () {
		//colorStart = renderer.material.color;
		//colorEnd = new Color(colorStart.r, colorStart.g, colorStart.b, 0.0f);

		activated = false;
		explosionEmitter = (ParticleSystem)missileExplosion.GetComponent("ParticleSystem");
		Debug.Log(explosionEmitter);
		missileSmoke.SetActive(false);
		missileLight.SetActive(false);
		//missileExplosion.SetActive(false);
		//explosionEmitter.emissionRate = 0f;
		explosionEmitter.enableEmission = false;
		explosionEmitter.loop = false;


		if(Random.value < chanceOfDetectingPlayer) //between 0.0 and 1.0 inclusive
		{
			detectsPlayer = true;
		}

		if(missile == null || rocketBody== null || missileSmoke== null 
		   || missileExplosion== null || missileLight == null)
		{
			Debug.LogError("ERROR: TrapController script missing some object field!");
		}
	}
	
	// Update is called once per frame
	void Update () {
		if(activated)
		{
			float timeElapsed = Time.deltaTime;
			if(rocketLifetime >= 0.0f)
			{
				missile.transform.Translate(Vector3.up * timeElapsed * speed);
				rocketLifetime -= timeElapsed;
			}
			else
			{
				if(!exploded) //Explode rocket at end of lifetime
					explodeRocket();
				else
				{
					lifetimeBeforeRemoval -= timeElapsed;
					transform.Translate(Vector3.down * timeElapsed); //Start sinking down
					if(lifetimeBeforeRemoval < 0.0f) //Fade entire body out after certain time period
						removeSelf();
				}
				
			}
		}
	}

	void explodeRocket()
	{
		//emitter.enableEmission = false;
		missileExplosion.SetActive(true);

		explosionEmitter.enableEmission = false;



		rocketBody.SetActive(false);
		missileLight.SetActive(false);
		exploded = true;
	}
	
	void OnTriggerEnter(Collider other) {
		if(!activated && isDetectableTag(other.tag))
		{
			activateTrap();
		}
	}

	bool isDetectableTag(string tag)
	{
		if(tagsToDetect == null || tagsToDetect.Length == 0)
			return false;
		else if(detectsPlayer && tag == playerTag)
		{
			return true;
		}
		else
		{
			foreach(string t in tagsToDetect)
			{
				if(t == tag)
					return true;
			}
			return false;
		}
	}
	
	public void activateTrap()
	{
		Debug.Log("TRAP ACTIVATED");
		activated = true;
		missileSmoke.SetActive(true);
		missileLight.SetActive(true);
	}

	public void removeSelf()
	{
		this.gameObject.SetActive(false);
		Destroy(this.gameObject);
		/*
		for (float t = 0.0; t < fadeoutDuration; t += Time.deltaTime)
		{
			renderer.material.color = Color.Lerp(colorStart, colorEnd, t/fadeoutDuration);
			yield return new WaitForSeconds(0.1);
		}
		*/
	}
}
