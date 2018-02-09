from flask import Blueprint, jsonify, request
import json
import os
import docker
from ..containers.controllers import current_container_state
from datetime import datetime
scheduler = Blueprint("scheduler", __name__)

SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
json_url = os.path.join(SITE_ROOT, "", "states.json")
json_data = json.load(open(json_url,"r"))

from urllib2 import urlopen
my_ip = urlopen('http://ip.42.pl/raw').read()
client = docker.DockerClient(base_url="tcp://"+my_ip+":4243")
#client=docker.from_env()

@scheduler.route("/", methods=["GET"])
def get_schedules():
    return jsonify(json_data)


@scheduler.route("/", methods=["POST"])
def add_schedule():
    data = request.get_json()
    return jsonify(
        data
    )


@scheduler.route("/<int:schedule_id>", methods=["DELETE"])
def get_schedule(schedule_id):
    return jsonify(
        scheduler=schedule_id
    )


@scheduler.route("/deploy")
def deploy():
    for schedule in json_data["schedules"]:
        start_time=datetime.strptime(schedule["start-time"],"%Y-%m-%d")
        end_time=datetime.strptime(schedule["end-time"],"%Y-%m-%d")

        if start_time<datetime.now() and datetime.now()<end_time:

            print len(schedule["containers"]),len(current_container_state())
            to_deploy,to_keep,to_delete=state_check(schedule["containers"],current_container_state())

            print to_deploy,to_keep,to_delete
            for container in to_deploy:
                client.containers.run("ipekuyguner/datalayer:latest",environment=container["env"],detach=True,auto_remove=True)

            for container in to_delete:
                client.containers.get(container["id"]).stop()
            for container in to_keep:
                print "keeping",container["id"]

            if to_delete==[] and to_deploy==[]:
                return jsonify(
                    containers=current_container_state(),
                    message="State didn't change"
                )
            else:
                return jsonify(
                    containers=current_container_state(),
                    message="Deployed"
                )
        else:
            return jsonify(
                message="Not in interval",
                containers=current_container_state()
            )

def state_check(desired_state,current_state):
    to_keep=[]
    to_deploy=desired_state
    for desired_container in desired_state:
        for current_container in current_state:
            if desired_container["env"]["KAFKA_INPUT_CHANNEL"]==current_container["env"]["KAFKA_INPUT_CHANNEL"] \
            and desired_container["env"]["KAFKA_OUTPUT_CHANNEL"]==current_container["env"]["KAFKA_OUTPUT_CHANNEL"]:
                to_keep.append(current_container)
                to_deploy.remove(desired_container)
                break

            else:
                pass

    to_delete=[c for c in current_state if c not in to_keep]

    return to_deploy,to_keep,to_delete
if __name__=="__main__":

    d=json_data["schedules"][0]["containers"]

    to_keep=[]
    to_deploy=["a","b","c"]
    for x in ["a","b","c"]:
        for y in ["a","d","e"]:
            if x==y:
                to_keep.append(y)
                to_deploy.remove(x)

    print [c for c in ["a","d","e"] if c not in to_keep]
    print to_keep
    print to_deploy

    to_keep=[]
    to_deploy=["a","b","c"]
    for x in ["a","b","c"]:
        for y in ["a","d","e"]:
            if x==y:
                to_keep.append(y)
                to_deploy.remove(x)
                break

