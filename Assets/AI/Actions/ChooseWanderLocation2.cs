using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using RAIN.Core;

using RAIN.Action;
using RAIN.Navigation;
using RAIN.Navigation.Graph;


[RAINAction("Choose Wander Location2")]
public class ChooseWanderLocation2 : RAINAction
{
	public float maxY = 100f;
	public float newDistRange = 50f;
	public float minTargetDist = 5f;
	public float terrainY = GameObject.Find("ForestTerrain").transform.position.y;
	
	
	public ChooseWanderLocation2()
	{
		actionName = "ChooseWanderLocation2";
		//Debug.Log("Terrain y: " + terrainY);
		//Debug.Log("constructed");
	}
	
	public override void Start(AI ai)
	{
		base.Start(ai);
	}
	/*
	private Vector3 ConvertWorldToTerrainCoordinates(Vector3 wordCor)
	{
		Vector3 vecRet = new Vector3();
		Terrain terrain = Terrain.activeTerrain;
		Vector3 terPosition =  terrain.transform.position;
		vecRet.x = ((wordCor.x - terPosition.x) / terrain.terrainData.size.x) * terrain.terrainData.alphamapWidth;
		vecRet.z = ((wordCor.y - terPosition.z) / terrain.terrainData.size.z) * terrain.terrainData.alphamapHeight;
		return vecRet;
	}
	*/
	
	public override ActionResult Execute(AI ai)
	{
		Vector3 loc = Vector3.zero;
		float bodyHeight = 1.0f;//ai.Body.renderer.bounds.size.y;
		//Debug.Log("bodyheight");
		List<RAINNavigationGraph> found = new List<RAINNavigationGraph>();
		
		do{
			loc = new Vector3(ai.Kinematic.Position.x + Random.Range(-newDistRange, newDistRange),
			                  ai.Kinematic.Position.y,
			                  ai.Kinematic.Position.z + Random.Range(-newDistRange, newDistRange));
			float terrainHeight = Terrain.activeTerrain.SampleHeight(loc) + terrainY;
			loc.y = terrainHeight + bodyHeight/2f;
			
			// ^In world coords. Need to convert to terrain coords and then find Y value.
			// Use that y value to determine the y value for "loc".
			found = NavigationManager.instance.GraphsForPoints(ai.Kinematic.Position, loc, ai.Motor.StepUpHeight, NavigationManager.GraphType.Navmesh, ((BasicNavigator)ai.Navigator).GraphTags);
			
			
			//Debug.Log("Step up: " + ai.Motor.StepUpHeight);
			//Debug.Log("loc: "+ loc);
			//Debug.Log("Y at loc: "+ loc.y);
			//Debug.Log("Y at current: "+ Terrain.activeTerrain.SampleHeight(ai.Kinematic.Position) + sizeY);
			
			//Debug.Log("Current pos: " + ai.Kinematic.Position);
			//Debug.Log("Distance: " + Vector3.Distance(ai.Kinematic.Position, loc));
			//Debug.Log("found: " + found.Count);
		} while ((Vector3.Distance(ai.Kinematic.Position, loc) < minTargetDist) ||
		         (found.Count == 0) ||
		         (loc.y > maxY));
		
		ai.WorkingMemory.SetItem<Vector3>("wanderTarget2", loc);
		/*
			RAIN.Navigation.NavigationManager.instance.GraphForPoint(loc, ai.Motor.StepUpHeight,
				RAIN.Navigation.NavigationManager.GraphType.Navmesh).Count == 0);

		 * */
		//Debug.Log("DONE");
		
		return ActionResult.SUCCESS;
	}
	
	public override void Stop(AI ai)
	{
		base.Stop(ai);
	}
}