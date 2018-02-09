
from flask import Blueprint,jsonify,request

import docker
containers=Blueprint("containers",__name__)

from urllib2 import urlopen
my_ip = urlopen('http://ip.42.pl/raw').read()
client=docker.DockerClient(base_url="tcp://"+my_ip+":4243")
#client=docker.DockerClient(base_url='unix://var/run/docker.sock')
#client=docker.from_env()
@containers.route("/",methods=["GET"])
def index():


    return jsonify(
            containers=current_container_state()
        )


@containers.route("/",methods=["POST"])
def add_container():
    data=request.get_json()

    new_container=client.containers.run("ipekuyguner/datalayer:latest",environment=data,detach=True,auto_remove=True)

    return index()


@containers.route("/<int:container_id>",methods=["GET"])
def get_container(container_id):
    c=client.containers.get(str(container_id))
    return jsonify(
    id=c.short_id,
    name=c.attrs["Config"]["Image"],
    env=make_env_list_dict(c.attrs["Config"]["Env"])
    )

@containers.route("/<string:container_id>",methods=["DELETE"])
def delete_container(container_id):
    print "delete container"
    c=client.containers.get(container_id)
    print c.stop()
    return index()  

def make_env_list_dict(env_list):
    env_dict={}
    for var in env_list:
        var_tuple=var.split("=")
        env_dict[var_tuple[0]]=var_tuple[1]

    return env_dict


def current_container_state():
    containers=client.containers.list()
    con_list=[]

    for c in containers:
        env_dict=make_env_list_dict(c.attrs["Config"]["Env"])
        container_data={"id":c.short_id,"name":c.name,"env":env_dict}
        con_list.append(container_data)

    return con_list
