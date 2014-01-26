using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using RAIN.Core;
using RAIN.Action;
using RAIN.Navigation;
using RAIN.Navigation.Graph;

[RAINAction("Choose Wander Location")]
public class AIChooseWanderLocation : RAINAction
{
	public float maxY = 40f;

    public AIChooseWanderLocation()
    {
        actionName = "AIChooseWanderLocation";
    }

    public override void Start(AI ai)
    {
        base.Start(ai);
    }

    public override ActionResult Execute(AI ai)
    {
		Vector3 loc = Vector3.zero;
		List<RAINNavigationGraph> found = new List<RAINNavigationGraph>();

		do{
			loc = new Vector3(ai.Kinematic.Position.x + Random.Range(-10f, 10f),
			                  ai.Kinematic.Position.y,
			                  ai.Kinematic.Position.z + Random.Range(-10f, 10f));
			// ^In world coords. Need to convert to terrain coords and then find Y value.
			// Use that y value to determine the y value for "loc".
			found = NavigationManager.instance.GraphsForPoints(ai.Kinematic.Position, loc, ai.Motor.StepUpHeight, NavigationManager.GraphType.Navmesh, ((BasicNavigator)ai.Navigator).GraphTags);

			Debug.Log("loc: "+ loc);
			Debug.Log("Current pos: " + ai.Kinematic.Position);
			Debug.Log("Distance: " + Vector3.Distance(ai.Kinematic.Position, loc));
			Debug.Log("found: " + found.Count);
		} while ((Vector3.Distance(ai.Kinematic.Position, loc) < 2f) || (found.Count == 0));

		ai.WorkingMemory.SetItem<Vector3>("wanderTarget", loc);
		/*
			RAIN.Navigation.NavigationManager.instance.GraphForPoint(loc, ai.Motor.StepUpHeight,
				RAIN.Navigation.NavigationManager.GraphType.Navmesh).Count == 0);

		 * */
		Debug.Log("DONE");

        return ActionResult.SUCCESS;
    }

    public override void Stop(AI ai)
    {
        base.Stop(ai);
    }
}