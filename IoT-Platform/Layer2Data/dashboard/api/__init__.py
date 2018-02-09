from flask import Flask,jsonify, render_template
from api.containers.controllers import containers
from api.scheduler.controllers import scheduler
app=Flask(__name__)

app.register_blueprint(containers,url_prefix="/containers")

app.register_blueprint(scheduler,url_prefix="/schedules")

@app.route("/routes")
def index():
    return jsonify(
        routes=["/containers","/schedules"]
    )

@app.route("/")
def serve_ui():
    return render_template("index.html")
